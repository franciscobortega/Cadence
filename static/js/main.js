"use strict";

import { MAPBOX_API_KEY, GRAPHHOPPER_API_KEY } from "./secrets.js";

// const TEST_LAT = 33.65457;
// const TEST_LONG = -96.62558;
const TEST_LAT = 37.7749;
const TEST_LONG = -122.4194;

// --------------- MAP --------------- //

let waypoints = [];
let markers = [];
let elevationData = [];

let distanceText = document.querySelector("#total-distance");

mapboxgl.accessToken = MAPBOX_API_KEY;
const map = new mapboxgl.Map({
  container: "map",
  style: "mapbox://styles/mapbox/streets-v11",
  zoom: 13,
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

document.querySelector("#clearRoute").addEventListener("click", () => {
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

// --------------- ELEVATION --------------- //

const ctx = document.getElementById("myChart");
let chart;

function drawChart(elevationData) {
  if (chart) {
    const elevations = elevationData.map((data) => data[2]);
    const labels = elevationData.map((_, index) => index + 1);

    chart.data.datasets[0].data = elevations;
    chart.data.labels = labels;

    // Recalculate min and max elevation
    const minElevation = Math.min(...elevations);
    const minRounded = Math.floor(minElevation / 10) * 10;

    const maxElevation = Math.max(...elevations);
    const maxRounded = Math.ceil(maxElevation / 10) * 10;

    // Update the y-axis scales
    chart.options.scales.y.min = minRounded;
    chart.options.scales.y.max = maxRounded;

    chart.update();
  } else {
    const elevations = elevationData.map((data) => data[2]);
    const labels = elevationData.map((_, index) => index + 1);

    const minElevation = Math.min(...elevations);
    const minRounded = Math.floor(minElevation / 10) * 10;

    const maxElevation = Math.max(...elevations);
    const maxRounded = Math.ceil(maxElevation / 10) * 10;

    chart = new Chart(ctx, {
      type: "line",
      data: {
        labels: labels,
        datasets: [
          {
            label: "Elevation",
            data: elevations,
            borderWidth: 1,
            borderColor: "blue",
            fill: true,
            backgroundColor: "rgba(0, 0, 255, 0.05)",
            pointRadius: 0,
            cubicInterpolationMode: "monotone",
          },
        ],
      },
      options: {
        // animation: false,
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: {
            display: false,
          },
          y: {
            beginAtZero: true,
            min: minRounded,
            max: maxRounded,
          },
        },
        plugins: {
          legend: {
            display: false,
          },
        },
      },
    });
  }
}

drawChart(elevationData);
