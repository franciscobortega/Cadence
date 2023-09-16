"use strict";

import { SPOTIFY_CLIENT_ID } from "./secrets.js";
import { redirectToAuthCodeFlow, getAccessToken } from "./auth.js";
import { initPlaylist } from "./playlist.js";
import { distance } from "./map.js";

// --------------- PLAYLIST GENERATION V1 --------------- //
const params = new URLSearchParams(window.location.search);
const code = params.get("code");
let redirect_uri = "http://localhost:5000";

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
  console.log("You are not authenticated!");
  redirectToAuthCodeFlow(SPOTIFY_CLIENT_ID);
  getAccessToken(SPOTIFY_CLIENT_ID, code);
}

if (!storedAccessToken) {
  // Fetch a new access token and save it in local storage
  console.log("You are authenticated, but you don't have an access token!");
  getAccessToken(SPOTIFY_CLIENT_ID, code);
}

export let expectedFinishTime;

const genreCheckboxes = document.querySelectorAll(".checkbox-field");

genreCheckboxes.forEach((checkbox) => {
  const genre = checkbox.querySelector('input[type="checkbox"]');
  const genreLabel = checkbox.querySelector(".form-label");

  checkbox.addEventListener("click", () => {
    // Toggle the checkbox checked state
    genre.checked = !genre.checked;

    genreLabel.classList.toggle("checked", genre.checked);
  });
});

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

const exportPlaylistButton = document.querySelector(".export-playlist");

exportPlaylistButton.addEventListener("click", async () => {
  console.log("clicked");

  const spotifyIdResponse = await fetch("https://api.spotify.com/v1/me", {
    method: "GET",
    headers: { Authorization: `Bearer ${storedAccessToken}` },
  });

  const data = await spotifyIdResponse.json();

  const spotifyUserId = data.id;

  console.log(spotifyUserId);

  const playlistResponse = await fetch(
    `https://api.spotify.com/v1/users/${spotifyUserId}/playlists`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${storedAccessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: playlistName,
        public: true,
      }),
    }
  );

  console.log(playlistResponse);
});
