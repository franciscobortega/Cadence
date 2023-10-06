"use strict";

import { storedAccessToken, queryParams, expectedFinishTime } from "./main.js";
import { data } from "./map.js";

// --------------- PLAYLIST GENERATION V1 --------------- //

export let trackURIs = [];

export async function initPlaylist(
  storedAccessToken,
  queryParams,
  distance,
  targetPace
) {
  const routeSegmentsDistances = data.paths[0].details.distance;
  // console.log(routeSegmentsDistances);

  const routeSegmentsElevations = data.paths[0].details.average_slope;
  // console.log(routeSegmentsElevations);

  const classifiedSegments = segmentClassification(
    routeSegmentsDistances,
    routeSegmentsElevations
  );
  console.log(classifiedSegments);
  // Fetch from Get Recommendations endpoint
  const playlistRecommendations = await fetchRecommendations(
    storedAccessToken,
    queryParams
  );

  // console.log(playlistRecommendations);

  // console.log(queryParams);

  // Fetch from Get Tracks' Audio Features endpoint, extract array from response
  const listOfTrackDetails = (
    await fetchAudioFeatures(storedAccessToken, playlistRecommendations)
  )["audio_features"];

  // Generate playlist
  // const generatedPlaylist = generatePlaylist(
  //   expectedFinishTime,
  //   listOfTrackDetails
  // );

  const generatedPlaylist = generatePlaylistByElevation(
    targetPace,
    distance,
    routeSegmentsDistances,
    classifiedSegments,
    listOfTrackDetails
  );

  // Display playlist
  displayPlaylist(generatedPlaylist, playlistRecommendations);

  // extract track URIs from generated playlist
  trackURIs = generatedPlaylist.map((track) => track.uri);
  console.log(trackURIs);
}

async function fetchRecommendations(token, params) {
  // Construct the URL with query parameters
  const baseUrl = "https://api.spotify.com/v1/recommendations";
  const url = new URL(baseUrl);

  // Add query parameters to the URL
  Object.keys(params).forEach((key) => {
    url.searchParams.append(key, params[key]);
  });

  // console.log(url.toString());
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

  // console.log(url);

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
  console.log(tracks);

  sortedTracksByTempo(tracks);

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
  const playlistContainer = document.querySelector(".playlist-container");

  console.log(recommendations);
  const playlistHTML = playlist.map((track, index) => {
    const song = recommendations.tracks.find(
      (recommendation) => recommendation.id === track.id
    );

    console.log(song);
    console.log(`${song["name"]} by ${song["artists"][0]["name"]}`);

    const playlistItem = document.createElement("div");
    playlistItem.classList.add("playlist-item");
    playlistItem.innerHTML = `
    <p class="playlist-track-number">${index + 1}</p>
    <div class="playlist-track-details">
       <img src="${
         song["album"]["images"][0]["url"]
       }" alt="Album cover" class="track-img">
       <div class="track-info">
        <p class="track-name">${song["name"]}</p>
        <p class="track-artist">${song["artists"][0]["name"]}</p>
       </div>
    </div>
    <p class="track-album">Album name</p>
    <p class="track-duration">2:49</p>`;

    // console.log(playlistItem);
    return playlistItem.outerHTML;
  });

  // console.log(playlistHTML);

  playlistContainer.innerHTML = playlistHTML.join("");
}

// --------------- TEMPO MAPPINGS --------------- //
/*
 * Teh response of the Get Tracks' Audio Features endpoint will be iterated over and the tempo
 * of each track will be compared to the min and max tempo values of the tempoMappings. A new
 * property called tempoCategory will be added to each track object. The tempoCategory will be
 * used to build a dictionary of tempo categories and their corresponding tracks organized from
 * slowest to fastest tempo.
 */

const tempoMappings = {
  slow: { min: 0, max: 80 },
  moderate: { min: 80, max: 110 },
  normal: { min: 110, max: 140 },
  fast: { min: 140, max: 170 },
  energetic: { min: 170, max: 210 },
};

let tracksByTempo = {
  slow: [],
  moderate: [],
  normal: [],
  fast: [],
  energetic: [],
};

async function sortedTracksByTempo(tracks) {
  //Clear out the tracksByTempo object
  for (const [category, tracks] of Object.entries(tracksByTempo)) {
    tracksByTempo[category] = [];
  }

  // Build a new array of tracks with the tempoCategory property
  const tracksWithTempoCategory = tracks.map((track) => {
    let tempoCategory;

    // Check the tempo of each track against the tempo mappings
    for (const [category, tempoRange] of Object.entries(tempoMappings)) {
      if (
        track["tempo"] >= tempoRange.min &&
        track["tempo"] <= tempoRange.max
      ) {
        tempoCategory = category;
        break;
      }
    }

    // Set the new tempoCategory property for each track
    track["tempoCategory"] = tempoCategory;
    return track;
  });

  // console.log(tracksWithTempoCategory);

  // Iterate thru tracksWithTempoCategory and add each track to its corresponding tempo category array
  tracksWithTempoCategory.forEach((track) => {
    const tempoCategory = track["tempoCategory"];
    tracksByTempo[tempoCategory].push(track);

    // Sort the tracks immediately after adding them to the array
    tracksByTempo[tempoCategory].sort((a, b) => a.tempo - b.tempo);
  });

  return tracksByTempo;
}

// --------------- PLAYLIST GENERATION V2 --------------- //

function segmentClassification(segmentDistances, segmentElevations) {
  let i = 0;
  let classifiedSegments = [];

  segmentDistances.forEach((segment) => {
    let correspondingSegment = segmentElevations[i];
    let [start, end, segmentDistance] = correspondingSegment;

    if (segment[0] >= start) {
      if (correspondingSegment[2] < -10) {
        classifiedSegments.push({
          segment: segment,
          classification: "slow",
        });
      } else if (correspondingSegment[2] < -5) {
        classifiedSegments.push({
          segment: segment,
          classification: "moderate",
        });
      } else if (correspondingSegment[2] > 5) {
        classifiedSegments.push({
          segment: segment,
          classification: "fast",
        });
      } else if (correspondingSegment[2] > 10) {
        classifiedSegments.push({
          segment: segment,
          classification: "energetic",
        });
      } else {
        classifiedSegments.push({
          segment: segment,
          classification: "normal",
        });
      }
    }

    if (segment[1] >= end) {
      i++;
    }
  });

  return classifiedSegments;
}

function generatePlaylistByElevation(
  targetPace,
  totalDistance,
  segmentDistances,
  classifiedSegments,
  tracks
) {
  // TODO: CLEAN UP!
  // TODO: Fix issue where user might get duplicates of the same track

  // console.log(targetPace);
  // console.log(totalDistance);
  // console.log(segmentDistances);
  // console.log(classifiedSegments);
  // console.log(tracks);
  let newPlaylist = [];
  sortedTracksByTempo(tracks);
  let j = 0;

  while (totalDistance > 0 && j < segmentDistances.length) {
    console.log("This is the distance at the start:", totalDistance / 1000);
    let firstItemInSegments = segmentDistances[j];
    let [start, end, segmentDistance] = firstItemInSegments;

    let segmentIntensity = classifiedSegments[j].classification;

    // Check if there are tracks left for this intensity
    if (tracksByTempo[segmentIntensity] && tracksByTempo[segmentIntensity][j]) {
      // select random track from category
      let random = Math.floor(
        Math.random() * tracksByTempo[segmentIntensity].length
      );
      let trackToAdd = tracksByTempo[segmentIntensity][random];
      newPlaylist.push(trackToAdd);
      console.log("Track added: ", trackToAdd);

      // remove track from tracksByTempo
      tracksByTempo[segmentIntensity].shift();

      // use track duration to calculate distance traveled based on targetPace
      let distanceOfTrack =
        (trackToAdd.duration_ms / 1000) * (1 / ((targetPace / 1000) * 60)); // in meters

      if (distanceOfTrack > totalDistance) {
        console.log("Finished");
        break;
      }

      totalDistance -= distanceOfTrack;

      // subtract distance traveled from segment distance until 0 then subtract remainder from next item in array if it exists
      while (distanceOfTrack > 0) {
        // console.log(firstItemInSegments);
        if (segmentDistance > distanceOfTrack) {
          segmentDistance -= distanceOfTrack;
          distanceOfTrack = 0;
          segmentDistances[j][2] = segmentDistance;
          // console.log("Updated segment distance: ", segmentDistances[j][2]);
          break;
        }

        distanceOfTrack -= segmentDistance;
        j++;

        if (j < segmentDistances.length) {
          [start, end, segmentDistance] = segmentDistances[j];
        } else {
          console.log("Finished");
          break;
        }
      }
    } else {
      console.log("Tracks for this intensity have run out maybe...");
      console.log(tracksByTempo[segmentIntensity]);
      // TODO: Currently when there are no more tracks in a category it just skips to the next iteration. Need to add logic to check if there are any tracks left in the other categories
      j++;
    }
  }
  console.log(newPlaylist);

  let playlistDuration = 0;
  newPlaylist.forEach((track) => {
    playlistDuration += track.duration_ms / 1000;
  });
  console.log("Playlist duration: ", playlistDuration / 60);

  // if the playlist duration is shorter than the expected finish time add one final track from the slow category
  if (playlistDuration < expectedFinishTime) {
    console.log("Playlist is too short");
    let trackToAdd = tracksByTempo["slow"][0];
    newPlaylist.push(trackToAdd);
    tracksByTempo["slow"].shift();
    // break;
  }

  console.log(newPlaylist);
  playlistDuration = 0;
  newPlaylist.forEach((track) => {
    playlistDuration += track.duration_ms / 1000;
  });
  console.log("Playlist duration: ", playlistDuration / 60);

  return newPlaylist;
}
