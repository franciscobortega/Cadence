"use strict";

import { MAPBOX_API_KEY, GRAPHHOPPER_API_KEY } from "./secrets.js";
import { drawChart } from "./elevation.js";

// --------------- MAP --------------- //

const TEST_LAT = 37.7749;
const TEST_LONG = -122.4194;

mapboxgl.accessToken = MAPBOX_API_KEY;
const map = new mapboxgl.Map({
  container: "map",
  style: "mapbox://styles/mapbox/streets-v11",
  zoom: 13,
  center: [TEST_LONG, TEST_LAT],
});

let waypoints = [];
let markers = [];
let elevationData = [];
export let distance = 0;
let elevationGain = 0;
let responseWaypoints = [];
export let data;

let distanceText = document.querySelector("#total-distance");
let elevationText = document.querySelector("#total-elevation");
let elevationMsg = document.querySelector(".elevation-msg");

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

  distance = 0;

  // Reset total distance text
  distanceText.textContent = "0 km";

  // Reset total elevation text
  elevationText.textContent = "0 m";
}

async function createRoute() {
  if (waypoints.length >= 2) {
    // Construct the URL waypoints query string
    const waypointsQuery = waypoints
      .map((point) => point.join(","))
      .join("&point=");

    // Construct the GraphHopper API request URL
    const DIRECTIONS_API_URL = `https://graphhopper.com/api/1/route?point=${waypointsQuery}&profile=foot&locale=en&points_encoded=false&elevation=true&details=distance&details=time&details=average_slope&key=${GRAPHHOPPER_API_KEY}`;

    try {
      const response = await fetch(DIRECTIONS_API_URL);
      data = await response.json();

      // routeCoordinates and routeWaypoints return 3-point array where the 3 value is the elevation
      const routeCoordinates = data.paths[0].points.coordinates;
      const routeDistance = data.paths[0].distance;
      const routeWaypoints = data.paths[0].snapped_waypoints.coordinates;
      const routeAscent = data.paths[0].ascend;
      const routeDescent = data.paths[0].descend;
      console.log(data);

      elevationData = routeCoordinates;

      drawMarkers(routeWaypoints);

      responseWaypoints = routeWaypoints;

      distance = routeDistance;
      elevationGain = routeAscent - routeDescent;

      // Display the distance of the route
      distanceText.textContent = `${(routeDistance / 1000).toFixed(2)} km`;

      elevationText.textContent = `${elevationGain.toFixed(2)} m`;

      // Display the route polyline on the map
      routePolyline(routeCoordinates);

      elevationMsg.classList.add("hidden");
      drawChart(elevationData);
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

    distance = 0;
    // Display the distance of the route as 0 km
    distanceText.textContent = "0 km";
    elevationText.textContent = "0 m";
  } else {
    clearRoute();
  }

  return data;
}

map.on("click", async (e) => {
  // add coordinates of clicked point to waypoints array
  const { lng, lat } = e.lngLat;
  waypoints.push([lat, lng]);

  createRoute();

  // drawChart(elevationData);
});

let lastPoppedWaypoint = [];

// Remove last waypoint from route
function removeLastWaypoint() {
  if (waypoints.length == 0) {
    console.log("Nothing left to undo!");
    distance = 0;

    return;
  } else if (waypoints.length == 1) {
    elevationMsg.classList.remove("hidden");
    distance = 0;
    elevationData = [];

    drawChart(elevationData);
  }
  let removedWaypoint = waypoints.pop();
  lastPoppedWaypoint.push(removedWaypoint);
  createRoute();

  elevationData.pop();
  drawChart(elevationData);
}

// Event listener for the undo button click
const undoBtn = document.querySelector(".undo-route");
undoBtn?.addEventListener("click", removeLastWaypoint);

// Event listener for the 'Ctrl+Z' keystroke
addEventListener("keydown", (e) => {
  if (e.ctrlKey && e.key === "z") {
    removeLastWaypoint();
  }
});

// Add last removed waypoint from route
function reAddLastWaypoint() {
  if (lastPoppedWaypoint.length == 0) {
    console.log("No moe point available!");
    return;
  }
  let nextWaypoint = lastPoppedWaypoint.pop();
  waypoints.push(nextWaypoint);
  createRoute();

  drawChart(elevationData);
}

// Event listener for the undo button click
const redoBtn = document.querySelector(".redo-route");
redoBtn?.addEventListener("click", reAddLastWaypoint);

// Event listener for the 'Ctrl+Z' keystroke
addEventListener("keydown", (e) => {
  if (e.ctrlKey && e.key === "y") {
    reAddLastWaypoint();
  }
});

document.querySelector(".clear-route")?.addEventListener("click", () => {
  clearRoute();
  elevationData = [];

  elevationMsg.classList.remove("hidden");
  drawChart(elevationData);
});

document
  .querySelector("#save-route-form")
  ?.addEventListener("submit", async (e) => {
    e.preventDefault();
    console.log("clicked save route");

    // TODO: Potentially update so that no call is made to Static Image API and instead save template URL only
    const routeData = {
      title: e.target[0].value,
      distance: distance,
      elevation_gain: elevationGain,
      image_url: await getStaticMapImageURL(),
      waypoints: responseWaypoints,
    };

    console.log(routeData);

    fetch("/save-route", {
      method: "POST",
      body: JSON.stringify(routeData),
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((response) => response.json())
      .then((responseJson) => {
        // TODO: Implement better error and success handling
        console.log(responseJson);
        alert(responseJson.message);
      });
  });

const routeDataBtns = document.querySelectorAll(".route-data-btn");

routeDataBtns.forEach((btn) => {
  btn.addEventListener("click", (e) => {
    if (
      distanceText.classList.contains("metric") ||
      elevationText.classList.contains("metric")
    ) {
      distanceText.textContent = `${(distance / 1609).toFixed(2)} mi`;
      elevationText.textContent = `${(elevationGain * 3.28084).toFixed(2)} ft`;
    } else {
      distanceText.textContent = `${(distance / 1000).toFixed(2)} km`;
      elevationText.textContent = `${elevationGain.toFixed(2)} m`;
    }

    distanceText.classList.toggle("metric");
    elevationText.classList.toggle("metric");
  });
});

map.on("load", () => {
  map.addSource("route", { type: "geojson", data: null });
  map.addLayer({
    id: "route",
    type: "line",
    source: "route",
    paint: {
      "line-color": "#320070",
      "line-width": 4,
    },
  });
});

async function getStaticMapImageURL() {
  const waypointsQuery = waypoints
    .map((point) => point.join(","))
    .join("&point=");

  // Construct the GraphHopper API request URL
  const GRAPHHOPPER_API_URL = `https://graphhopper.com/api/1/route?point=${waypointsQuery}&profile=foot&locale=en&key=${GRAPHHOPPER_API_KEY}`;

  try {
    const response = await fetch(GRAPHHOPPER_API_URL);
    data = await response.json();

    const encodedPolyline = encodeURIComponent(data.paths[0].points);

    const pathParameter = `path-5+320070-0.5(${encodedPolyline})`;

    return `https://api.mapbox.com/styles/v1/mapbox/streets-v11/static/${pathParameter}/auto/500x300`;
  } catch (err) {
    console.error(err);
  }
}

// --------------- LOADED ROUTE --------------- //

const loadedRoute = document.querySelector(".loaded-route").dataset.route;
const loadedWaypoints =
  document.querySelector(".loaded-waypoints").dataset.waypoints;

if (loadedRoute && loadedRoute != "None") {
  // const parsedRoute = JSON.parse(loadedRoute);
  const parsedWaypoints = JSON.parse(loadedWaypoints);

  parsedWaypoints.forEach((waypoint) => {
    const { latitude, longitude } = waypoint;
    waypoints.push([latitude, longitude]);
  });

  map.on("load", async () => {
    const data = await createRoute();

    // Extract the bounding box from the loadedRoute
    const [west, south, east, north] = data.paths[0].bbox;

    const boundingBox = [
      [west, south],
      [east, north],
    ];

    map.fitBounds(boundingBox, {
      padding: { top: 100, bottom: 100, left: 0, right: 200 },
      offset: [-100, 0],
      maxZoom: 13,
    });

    elevationMsg.classList.add("hidden");
    drawChart(elevationData);
  });
}

// --------------- GEOLOCATE THE USER --------------- //

const geolocationButton = document.querySelector(".locate-user");

geolocationButton?.addEventListener("click", () => {
  console.log("Locating the user...");
  navigator.geolocation.getCurrentPosition((position) => {
    console.log(position.coords.latitude, position.coords.longitude);
    map.flyTo({
      center: [position.coords.longitude, position.coords.latitude],
      zoom: 13,
    });
  });
});
