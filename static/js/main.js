"use strict";

import { MAPBOX_API_KEY, GRAPHHOPPER_API_KEY } from "./secrets.js";

const TEST_LAT = 33.65457;
const TEST_LONG = -96.62558;

// --------------- MAP --------------- //

// TODO: fix bug of excess marker instances when marker is added to markers array

let waypoints = [];
let markers = [];

let distanceText = document.querySelector("#total-distance");

mapboxgl.accessToken = MAPBOX_API_KEY;
const map = new mapboxgl.Map({
  container: "map",
  style: "mapbox://styles/mapbox/streets-v11",
  zoom: 16,
  center: [TEST_LONG, TEST_LAT],
});

function routePolyline(coords) {
  map.getSource("route").setData({
    type: "Feature",
    geometry: {
      type: "LineString",
      coordinates: coords,
    },
  });
}

function drawMarkers(snappedWaypoints) {
  snappedWaypoints.forEach(([lng, lat]) => {
    const el = document.createElement("div");
    el.className = "marker";
    const marker = new mapboxgl.Marker(el).setLngLat([lng, lat]).addTo(map);
    markers.push(marker);
  });
}

function clearRoute() {
  // Remove markers from the map and clear the markers array
  markers.forEach((marker) => marker.remove());
  markers = [];

  // Clear the waypoints array
  waypoints = [];

  // Clear the polyline from the map
  routePolyline([]);

  // Reset total distance text
  distanceText.textContent = "Distance: 0 km";
}

async function createRoute() {
  if (waypoints.length >= 2) {
    // Construct the URL waypoints query string
    const waypointsQuery = waypoints
      .map((point) => point.join(","))
      .join("&point=");

    // Construct the GraphHopper API request URL
    const apiUrl = `https://graphhopper.com/api/1/route?point=${waypointsQuery}&profile=foot&locale=en&points_encoded=false&elevation=true&key=${GRAPHHOPPER_API_KEY}`;

    try {
      const response = await fetch(apiUrl);
      const data = await response.json();

      // routeCoordinates and routeWaypoints return 3-point array where the 3 value is the elevation
      const routeCoordinates = data.paths[0].points.coordinates;
      const routeDistance = data.paths[0].distance;
      const routeWaypoints = data.paths[0].snapped_waypoints.coordinates;

      drawMarkers(routeWaypoints);

      // Display the distance of the route
      distanceText.textContent = `Distance: ${(routeDistance / 1000).toFixed(
        2
      )} km`;

      // Display the route polyline on the map
      routePolyline(routeCoordinates);
    } catch (error) {
      console.error("Error fetching route:", error);
    }
  }
}

map.on("click", async (e) => {
  // add coordinates of clicked point to waypoints array
  const { lng, lat } = e.lngLat;
  waypoints.push([lat, lng]);

  createRoute();
});

addEventListener("keydown", function (event) {
  if (event.ctrlKey && event.key === "z") {
    waypoints.pop();
    createRoute();
  }
});

document.querySelector("#clearRoute").addEventListener("click", clearRoute);

map.on("load", () => {
  map.addSource("route", { type: "geojson", data: null });
  map.addLayer({
    id: "route",
    type: "line",
    source: "route",
    paint: {
      "line-color": "#0033ff",
      "line-width": 4,
    },
  });
});

// --------------- ELEVATION --------------- //
