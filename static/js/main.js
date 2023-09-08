"use strict";

import { MAPBOX_API_KEY, SPOTIFY_CLIENT_ID } from "./secrets.js";
import { redirectToAuthCodeFlow, getAccessToken } from "./auth.js";
import { initPlaylist } from "./playlist.js";
import { distance } from "./map.js";

// --------------- MAP INITIALIZATION --------------- //

const TEST_LAT = 37.7749;
const TEST_LONG = -122.4194;

mapboxgl.accessToken = MAPBOX_API_KEY;
export const map = new mapboxgl.Map({
  container: "map",
  style: "mapbox://styles/mapbox/streets-v11",
  zoom: 13,
  center: [TEST_LONG, TEST_LAT],
});

// --------------- PLAYLIST GENERATION V1 --------------- //
const params = new URLSearchParams(window.location.search);
const code = params.get("code");

export let queryParams = {
  limit: 100,
  market: "US",
  seed_genres: "pop,rock,hip-hop",
  min_tempo: 100,
  max_tempo: 120,
};

export const storedAccessToken = localStorage.getItem("access_token");

if (!code) {
  // Check if the user is authenticated
  redirectToAuthCodeFlow(SPOTIFY_CLIENT_ID);
} else if (!storedAccessToken) {
  // Fetch a new access token and save it in local storage
  const accessToken = await getAccessToken(SPOTIFY_CLIENT_ID, code);
  localStorage.setItem("access_token", accessToken);
}

export let expectedFinishTime;

const optionsForm = document.getElementById("options-form");

optionsForm.addEventListener("submit", (e) => {
  e.preventDefault();

  // Get all the selected genre checkboxes
  const selectedGenres = Array.from(
    document.querySelectorAll('input[name="genre"]:checked')
  ).map((checkbox) => checkbox.value);

  // Validate that only up to 5 genres are selected
  if (selectedGenres.length > 5) {
    alert("You can select up to 5 genres.");
    return;
  }

  // Get the target pace value from the input field
  const targetPace = document.getElementById("target-pace").value;

  // Update the queryParams object with the selected genres
  queryParams.seed_genres = selectedGenres.join(",");

  expectedFinishTime = ((distance * targetPace) / 1000) * 60; // seconds

  console.log(expectedFinishTime);
  console.log(distance / 1000); // this is the distance in km
  console.log(`You will finish in ${expectedFinishTime / 60} minutes!`); // this is the expected finish time in minutes
  initPlaylist(storedAccessToken, queryParams, expectedFinishTime);
});
