"use strict";

import { SPOTIFY_CLIENT_ID } from "./secrets.js";

const authorizeButton = document.querySelector(".authorize-spotify");

authorizeButton.addEventListener("click", () => {
  console.log("clicked");

  redirectToAuthCodeFlow(SPOTIFY_CLIENT_ID);
  console.log("authorized and redirected");
});

function redirectToAuthCodeFlow(clientId) {
  const params = new URLSearchParams();
  params.append("client_id", clientId);
  params.append("response_type", "code");
  params.append("redirect_uri", "http://localhost:5000/users");
  params.append(
    "scope",
    "user-read-private user-read-email playlist-modify-public playlist-modify-private"
  );

  document.location = `https://accounts.spotify.com/authorize?${params.toString()}`;
}
