"use strict";

import { trackURIs, initPlaylist } from "./playlist.js";
import { distance } from "./map.js";

// --------------- PLAYLIST GENERATION V1 --------------- //

console.log(accessToken);

export let queryParams = {
  limit: 100,
  market: "US",
  seed_genres: "pop,rock,hip-hop",
  min_tempo: 0,
  max_tempo: 210,
  target_popularity: 50,
};

export const storedAccessToken = accessToken;

export let expectedFinishTime;

const genreCheckboxes = document.querySelectorAll(".checkbox-field");

genreCheckboxes.forEach((checkbox) => {
  const genre = checkbox.querySelector('input[type="checkbox"]');
  const genreLabel = checkbox.querySelector(".form-label");

  checkbox.addEventListener("click", () => {
    let selectedGenres = Array.from(
      document.querySelectorAll('input[name="genre"]:checked')
    );

    // Limit the number of selected genres to 5
    if (selectedGenres.length >= 5 && !genre.checked) {
      alert("You can select up to 5 genres.");
      return;
    }

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

  // Get the target popularity value from the input field
  const targetPopularity = document.getElementById("target-popularity").value;

  // console.log(targetPopularity);

  queryParams.target_popularity = targetPopularity;

  // Update the queryParams object with the selected genres
  queryParams.seed_genres = selectedGenres.join(",");

  expectedFinishTime = ((distance * targetPace) / 1000) * 60; // seconds

  console.log(expectedFinishTime);
  console.log(distance / 1000); // this is the distance in km
  console.log(`You will finish in ${expectedFinishTime / 60} minutes!`); // this is the expected finish time in minutes
  initPlaylist(storedAccessToken, queryParams, distance, targetPace);
});

const exportPlaylistButton = document.querySelector(".export-playlist");

exportPlaylistButton.addEventListener("click", async () => {
  // TODO: Update playlistName from input field
  const playlistName = "Cadence Playlist";

  try {
    // TODO: Consider getting the user's ID from the auth flow
    // Get spotify ID of the user
    const spotifyIdResponse = await fetch("https://api.spotify.com/v1/me", {
      method: "GET",
      headers: { Authorization: `Bearer ${storedAccessToken}` },
    });
    const spotifyIdData = await spotifyIdResponse.json();
    const spotifyUserId = spotifyIdData.id;

    // Create a new blank playlist
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
    const playlistData = await playlistResponse.json();
    const playlistId = playlistData.id;

    // Populate the playlist with the tracks
    const playlistTracksResponse = await fetch(
      `https://api.spotify.com/v1/playlists/${playlistId}/tracks`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${storedAccessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          uris: trackURIs,
        }),
      }
    );
    const playlistTracksData = await playlistTracksResponse.json();
    console.log(playlistTracksData);
    //TODO: Add success message
  } catch (error) {
    console.error(error);
  }
});
