"use strict";

import { SPOTIFY_CLIENT_ID } from "./secrets.js";
import { redirectToAuthCodeFlow, getAccessToken } from "./auth.js";

// --------------- ROUTE DISTANCE --------------- //
let routeDistance = 2116.703; // meters
let targetPace = 5.0; // minutes per km

let expectedFinishTime = ((routeDistance * targetPace) / 1000) * 60; // seconds
// (2116.703 * 5.0 / 1000) * 60 = 635.0109 seconds or 10.5835 minutes

// --------------- ROUTE ELEVATION --------------- //
let elevationCategories = {
  flat: 0,
  "moderate ascent": 1,
  "moderate descent": -1,
  "steep ascent": 2,
  "steep descent": -2,
};

const tempoMappings = {
  slow: { min: 60, max: 80 },
  moderate: { min: 80, max: 100 },
  energetic: { min: 100, max: 120 },
  intense: { min: 120, max: 140 },
};

const targetIntensity = "energetic";
const { min: minTempo, max: maxTempo } = tempoMappings[targetIntensity]; // will be passed along to Get Recommendations endpoint

// console.log(minTempo);
// console.log(maxTempo);

// --------------- SPOTIFY --------------- //

// 1. Fetch from Get Recommendations endpoint
// TODO: fetch from Get Recommendations endpoint: up to 5 genres, popularity 0-100, min/max tempo
let testGenres = "pop,rock,hip-hop";
let testPopularity = 60;
let testMinTempo = 100;
let testMaxTempo = 120;

// --------------- PLAYLIST GENERATION V1 --------------- //
const params = new URLSearchParams(window.location.search);
const code = params.get("code");

const queryParams = {
  limit: 100,
  market: "US",
  seed_genres: "pop,rock,hip-hop",
  min_tempo: 100,
  max_tempo: 120,
};

const storedAccessToken = localStorage.getItem("access_token");

if (!code) {
  // Check if the user is authenticated
  redirectToAuthCodeFlow(SPOTIFY_CLIENT_ID);
} else if (!storedAccessToken) {
  // Fetch a new access token and save it in local storage
  const accessToken = await getAccessToken(SPOTIFY_CLIENT_ID, code);
  localStorage.setItem("access_token", accessToken);
}

async function initPlaylist(accessToken) {
  // Fetch from Get Recommendations endpoint
  const playlistRecommendations = await fetchRecommendations(
    accessToken,
    queryParams
  );

  // Fetch from Get Tracks' Audio Features endpoint, extract array from response
  const listOfTrackDetails = (
    await fetchAudioFeatures(accessToken, playlistRecommendations)
  )["audio_features"];

  // Generate playlist
  const generatedPlaylist = generatePlaylist(
    expectedFinishTime,
    listOfTrackDetails
  );

  // Display playlist
  displayPlaylist(generatedPlaylist, playlistRecommendations);
}

// Add an event listener to a button element in your HTML
const generateButton = document.querySelector(".generate-playlist-button"); // Replace with the actual ID of your button

generateButton.addEventListener("click", () => {
  // When the button is clicked, start the playlist generation
  console.log("clcikeed");
  initPlaylist(storedAccessToken);
});

async function fetchRecommendations(token, params) {
  // Construct the URL with query parameters
  const baseUrl = "https://api.spotify.com/v1/recommendations";
  const url = new URL(baseUrl);

  // Add query parameters to the URL
  Object.keys(params).forEach((key) => {
    url.searchParams.append(key, params[key]);
  });

  console.log(url.toString());
  // console.log(token);

  const result = await fetch(url.toString(), {
    method: "GET",
    headers: { Authorization: `Bearer ${token}` },
  });

  return await result.json();
}

async function fetchAudioFeatures(token, recommendations) {
  // Construct the URL with query parameters
  const baseUrl = "https://api.spotify.com/v1/audio-features";

  // Extract track IDs from recommendations and join them with commas
  const trackIds = recommendations["tracks"].map((track) => track.id).join(",");

  // Add the track IDs as a query parameter to the URL
  const url = `${baseUrl}?ids=${trackIds}`;

  console.log(url);

  const result = await fetch(url, {
    method: "GET",
    headers: { Authorization: `Bearer ${token}` },
  });

  return await result.json();
}

function getRandomTrack(tracks) {
  // Check if there are tracks remaining
  if (tracks.length === 0) {
    return null; // No tracks left
  }

  // Randomly select a track
  const randomIndex = Math.floor(Math.random() * tracks.length);
  const randomTrack = tracks[randomIndex];

  // Remove the selected track from the array
  tracks.splice(randomIndex, 1);

  return randomTrack;
}

function generatePlaylist(remainingTime, tracks) {
  const playlist = [];
  let durationOfPlaylist = 0;

  while (remainingTime > 0) {
    // Select a track from the Get Recommendations response
    const selectedTrack = getRandomTrack(tracks);

    // Add the track to the playlist
    playlist.push(selectedTrack);

    // Subtract the track's duration from the remaining time
    remainingTime -= selectedTrack.duration_ms / 1000;

    // Add the track's duration to the total duration of the playlist
    durationOfPlaylist += selectedTrack.duration_ms / 1000;
  }

  console.log(playlist);
  console.log(expectedFinishTime);
  console.log(durationOfPlaylist);
  return playlist;
}

function displayPlaylist(playlist, recommendations) {
  // Find the song title and artist name for each track in the playlist based on the ID
  playlist.forEach((track) => {
    const song = recommendations.tracks.find(
      (recommendation) => recommendation.id === track.id
    );
    console.log(song);
    console.log(`${song["name"]} by ${song["artists"][0]["name"]}`);
  });
}

// --------------- PLAYLIST GENERATION V2 --------------- //

function splitRouteIntoSegments(elevationData, elevationThreshold) {
  const segments = [];
  let currentSegment = [elevationData[0]];

  // First segment starts with first point, we loop through the rest
  for (let i = 1; i < elevationData.length; i++) {
    const elevationChange = elevationData[i] - elevationData[i - 1];

    // If current elevationChange is greater than threshold start a new segment otherwise add point to the current segment
    if (Math.abs(elevationChange) >= elevationThreshold) {
      segments.push(currentSegment);
      currentSegment = [elevationData[i]];
    } else {
      currentSegment.push(elevationData[i]);
    }
  }

  // Add the last segment
  segments.push(currentSegment);

  return segments;
}

let testElevationData = [
  225.53, 224.72, 224.11, 223.65, 223.35, 223.46, 225.26, 226.33, 226.46,
  226.93, 227.06, 227.19, 227.22, 227.23, 227.25, 227.27, 227.34, 227.36, 227.6,
  227.68, 227.72, 227.76, 227.95, 228.03, 228.06, 228.1, 227.14, 227.2, 227.3,
  227.46, 228.21, 228.29, 228.53, 228.81, 229.1, 229.6, 229.74, 229.83, 229.91,
  230.0, 230.78, 230.86, 230.95, 231.05, 231.21, 231.35, 231.42, 232.36, 233.48,
  233.54, 232.32, 230.78, 230.67, 230.24, 230.65, 230.16, 230.07, 230.02,
  229.98, 228.15, 226.32, 226.15, 225.96, 225.64,
];

// console.log(splitRouteIntoSegments(testElevationData, 1.3));
