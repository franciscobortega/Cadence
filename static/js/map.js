"use strict";

// const TEST_LAT = 33.65457;
// const TEST_LONG = -96.62558;
import { GRAPHHOPPER_API_KEY } from "./secrets.js";
import { drawChart } from "./elevation.js";
import { map } from "./main.js";

// --------------- MAP --------------- //

export let waypoints = [];
let markers = [];
export let elevationData = [];
export let distance = 0;

let distanceText = document.querySelector("#total-distance");

function routePolyline(coords) {
  console.log("Attempting to draw polyline");
  map.getSource("route").setData({
    type: "Feature",
    geometry: {
      type: "LineString",
      coordinates: coords,
    },
  });
}

function drawMarkers(snappedWaypoints) {
  markers.forEach((marker) => marker.remove());
  markers = [];

  snappedWaypoints.forEach(([lng, lat], index, arr) => {
    const el = document.createElement("div");
    el.className = "marker";

    if (index === 0) {
      el.classList.add("first-marker");
    }

    if (index === arr.length - 1) {
      el.classList.add("last-marker");
    }

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
    const DIRECTIONS_API_URL = `https://graphhopper.com/api/1/route?point=${waypointsQuery}&profile=foot&locale=en&points_encoded=false&elevation=true&key=${GRAPHHOPPER_API_KEY}`;

    try {
      const response = await fetch(DIRECTIONS_API_URL);
      const data = await response.json();

      // routeCoordinates and routeWaypoints return 3-point array where the 3 value is the elevation
      const routeCoordinates = data.paths[0].points.coordinates;
      const routeDistance = data.paths[0].distance;
      const routeWaypoints = data.paths[0].snapped_waypoints.coordinates;

      elevationData = routeCoordinates;

      drawMarkers(routeWaypoints);

      distance = routeDistance;

      // Display the distance of the route
      distanceText.textContent = `Distance: ${(routeDistance / 1000).toFixed(
        2
      )} km`;

      // Display the route polyline on the map
      routePolyline(routeCoordinates);
    } catch (error) {
      console.error("Error fetching route:", error);
    }
  } else if (waypoints.length === 1) {
    // Remove markers from the map and clear the markers array
    markers.forEach((marker) => marker.remove());
    markers = [];

    // Clear the polyline from the map
    routePolyline([]);

    // Draw the first waypoint marker without snapping
    const [lat, lng] = waypoints[0];
    const el = document.createElement("div");
    el.classList.add("marker", "first-marker");
    const marker = new mapboxgl.Marker(el).setLngLat([lng, lat]).addTo(map);
    markers.push(marker);

    // Display the distance of the route as 0 km
    distanceText.textContent = "Distance: 0 km";
  } else {
    clearRoute();
  }
}

map.on("click", async (e) => {
  // add coordinates of clicked point to waypoints array
  const { lng, lat } = e.lngLat;
  waypoints.push([lat, lng]);

  createRoute();

  drawChart(elevationData);
});

addEventListener("keydown", function (event) {
  if (event.ctrlKey && event.key === "z") {
    waypoints.pop();
    createRoute();

    elevationData.pop();
    drawChart(elevationData);
  }
});

document.querySelector(".clear-route").addEventListener("click", () => {
  clearRoute();
  elevationData = [];

  drawChart(elevationData);
});

map.on("load", () => {
  map.addSource("route", { type: "geojson", data: null });
  map.addLayer({
    id: "route",
    type: "line",
    source: "route",
    paint: {
      "line-color": "#9404db",
      "line-width": 4,
    },
  });
});
