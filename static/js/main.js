"use strict";
// const fs = require("fs");

// Read the configuration file
// const configFile = fs.readFileSync("config.json", "utf8");
// const config = JSON.parse(configFile);

// Access the configuration values
// const MAPBOX_TOKEN = config.MAPBOX_TOKEN;
// const GRAPHHOPPER_API_KEY = config.GRAPHHOPPER_API_KEY;

const SHERMAN_LAT = 33.65457;
const SHERMAN_LONG = -96.62558;

// --------------- MAP --------------- //

// 1. init function that draw map
// 2. Function that handles adding a new point (start, intermediate, end) and displaying an appropriate marker for the point
//      - Directions API will be used to render route between start and end points
//      - Intermediate points will be added to waypoints array between start and end points
// 3. Function that updates the polyline between points
//      -

let waypoints = [];

mapboxgl.accessToken = MAPBOX_TOKEN;
const map = new mapboxgl.Map({
  container: "map",
  style: "mapbox://styles/mapbox/streets-v11",
  zoom: 16,
  center: [SHERMAN_LONG, SHERMAN_LAT],
});

async function createRoute() {
  // Add marker to map
  const el = document.createElement("div");
  el.className = "marker";
  // new mapboxgl.Marker(el).setLngLat([lng, lat]).addTo(map);

  if (waypoints.length >= 2) {
    const waypointsQuery = waypoints
      .map((point) => point.join(","))
      .join("&point=");
    console.log(waypoints);
    console.log(waypointsQuery);

    // Construct the GraphHopper API request URL
    const apiUrl = `https://graphhopper.com/api/1/route?point=${waypointsQuery}&profile=foot&locale=en&points_encoded=false&elevation=true&key=${GRAPHHOPPER_API_KEY}`;

    try {
      const response = await fetch(apiUrl);
      const data = await response.json();

      console.log(data);

      // routeCoordinates and routeWaypoints return 3-point array where the 3 value is the elevation
      const routeCoordinates = data.paths[0].points.coordinates;
      const routeDistance = data.paths[0].distance;
      const routeWaypoints = data.paths[0].snapped_waypoints.coordinates;

      routeWaypoints.forEach(([lng, lat]) => {
        new mapboxgl.Marker(el).setLngLat([lng, lat]).addTo(map);
      });

      document.querySelector("#total-distance").textContent = `Distance: ${(
        routeDistance / 1000
      ).toFixed(2)} km`;

      // Display the route on the map
      map.getSource("route").setData({
        type: "Feature",
        geometry: {
          type: "LineString",
          coordinates: routeCoordinates,
        },
      });
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

// 1. Function that receives an array of waypoints (lat, lng) and returns the elevation at each waypoint
// 2. Function that receives the elevation data and uses it to draw a graph of the elevation along the route

// let testElevation = `33.65457,-96.62558|33.6546,-96.62545|33.65504,-96.62346|33.65506,-96.62334|33.65463,-96.62321|33.65443,-96.62315|33.65441,-96.62325|33.65417,-96.62315|33.6533,-96.62289|33.65322,-96.62288|33.65318,-96.62289|33.65316,-96.62293|33.65255,-96.62579|33.65233,-96.6268|33.6523,-96.62699|33.65224,-96.62719|33.6521,-96.62786|33.65202,-96.62822|33.65186,-96.62897|33.6517,-96.62976|33.65169,-96.63006|33.65171,-96.63026|33.65175,-96.63028|33.65217,-96.63033|33.65241,-96.63028|33.65247,-96.63021|33.65264,-96.6299|33.6533,-96.62859|33.65334,-96.62853|33.65338,-96.62852|33.65342,-96.62853|33.65346,-96.62857|33.6535,-96.62874|33.65354,-96.62877|33.65381,-96.62893|33.65401,-96.62902|33.65418,-96.62908|33.65435,-96.62908|33.65467,-96.62897|33.65475,-96.62893|33.65488,-96.62881|33.65494,-96.62879|33.65503,-96.62878|33.65504,-96.62878|33.65531,-96.62882|33.6554,-96.62883|33.65545,-96.62882|33.65552,-96.62877|33.65561,-96.62867|33.65603,-96.62811|33.65606,-96.62805|33.6561,-96.62782|33.65627,-96.6273|33.65638,-96.62682|33.65639,-96.62668|33.65638,-96.6266|33.65634,-96.62653|33.65631,-96.6265|33.65628,-96.62648|33.65567,-96.62627|33.65562,-96.62622|33.6556,-96.62613|33.65561,-96.62603|33.65566,-96.62588|33.65564,-96.62575|33.65564,-96.62568|33.65602,-96.62389|33.65605,-96.62371|33.65603,-96.62366|33.6551,-96.62347|33.65504,-96.62346|33.6546,-96.62545|33.65457,-96.6256`;
