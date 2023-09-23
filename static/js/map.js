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
      const routeAscent = data.paths[0].ascend;
      const routeDescent = data.paths[0].descend;
      console.log(data);

      elevationData = routeCoordinates;

      drawMarkers(routeWaypoints);

      responseWaypoints = routeWaypoints;

      distance = routeDistance;
      elevationGain = routeAscent - routeDescent;

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
      image_url: await getStaticMapImage(),
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

document
  .querySelector(".toggle-distance")
  .addEventListener("click", async () => {
    // TODO: refine this
    const distanceText = document.querySelector("#total-distance");
    const distanceUnit = document.querySelector("#distance-unit");
    console.log(distance);

    if (distanceUnit.textContent === "km") {
      distanceText.textContent = `Distance: ${(distance / 1609).toFixed(2)} mi`;
      distanceUnit.textContent = "mi";
    } else {
      distanceText.textContent = `Distance: ${(distance / 1000).toFixed(2)} km`;
      distanceUnit.textContent = "km";
    }
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

async function getStaticMapImage() {
  const { lng, lat } = map.getCenter();
  const currentZoom = map.getZoom();
  console.log(lng, lat, currentZoom);

  const STATIC_IMAGES_API_URL = `https://api.mapbox.com/styles/v1/mapbox/streets-v11/static/${lng},${lat},${currentZoom},0/800x600?access_token=${MAPBOX_API_KEY}`;

  const response = await fetch(STATIC_IMAGES_API_URL);
  console.log(response);
  const mapImage = response.url.split("?access_token")[0];
  console.log(mapImage);

  return mapImage;
}

// --------------- LOADED ROUTE --------------- //

const loadedRoute = document.querySelector(".loaded-route").dataset.route;
const loadedWaypoints =
  document.querySelector(".loaded-waypoints").dataset.waypoints;

if (loadedRoute) {
  const parsedRoute = JSON.parse(loadedRoute);
  const parsedWaypoints = JSON.parse(loadedWaypoints);

  parsedWaypoints.forEach((waypoint) => {
    const { latitude, longitude } = waypoint;
    waypoints.push([latitude, longitude]);
  });

  map.on("load", () => {
    // TODO: Currently centers the map to the first waypoint, but should center to show the full route instead
    map.flyTo({
      center: [waypoints[0][1], waypoints[0][0]],
      zoom: 13,
    });

    createRoute();
    drawChart(elevationData);
  });
}
