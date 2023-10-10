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

// --------------- Logic for handling user route updates  --------------- //

const userRoutes = document.querySelectorAll(".route-card");
userRoutes.forEach((route) => {
  const routeForm = route.querySelector(".route-card-info");
  const deleteButton = route.querySelector(".route-card-delete-btn");

  routeForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const routeId = route.getAttribute("data-route-id");

    const formData = new FormData(routeForm);
    formData.append("route_id", routeId);
    console.log(formData);

    try {
      const response = await fetch("/update-route", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          console.log("Updating route!");

          // Call function to update elements
          const titleElement = document.querySelector(".route-card-title");
          const descriptionElement = document.querySelector(
            ".route-card-description"
          );

          const newTitle = formData.get("route-title");
          const newDescription = formData.get("route-description");

          titleElement.textContent = newTitle;
          descriptionElement.textContent = newDescription;
        }
      } else {
        console.error("Failed to update route.");
      }
    } catch (err) {
      console.error(err);
    }
  });

  deleteButton?.addEventListener("click", async (e) => {
    e.preventDefault();
    const routeId = route.getAttribute("data-route-id");
    const formData = new FormData(routeForm);
    formData.append("route_id", routeId);

    try {
      const response = await fetch(deleteButton.formAction, {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          route.remove();
        }
      } else {
        console.error("Failed to delete route.");
      }
    } catch (err) {
      console.error(err);
    }
  });
});
