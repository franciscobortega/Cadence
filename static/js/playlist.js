"use strict";

import { SPOTIFY_CLIENT_ID } from "./secrets.js";

// --------------- ROUTE DISTANCE --------------- //
let routeDistance = 2116.703; // meters
let targetPace = 5.0; // minutes per km

let expectedFinishTime = ((routeDistance * targetPace) / 1000) * 60; // seconds
// (2116.703 * 5.0 / 1000) * 60 = 635.0109 seconds or 10.5835 minutes

// --------------- ROUTE ELEVATION --------------- //
let elevationCategories = {
  flat: 0,
  "moderate ascent": 1,
  "moderate descent": -1,
  "steep ascent": 2,
  "steep descent": -2,
};

const tempoMappings = {
  slow: { min: 60, max: 80 },
  moderate: { min: 80, max: 100 },
  energetic: { min: 100, max: 120 },
  intense: { min: 120, max: 140 },
};

const targetIntensity = "energetic";
const { min: minTempo, max: maxTempo } = tempoMappings[targetIntensity]; // will be passed along to Get Recommendations endpoint

// console.log(minTempo);
// console.log(maxTempo);

// --------------- SPOTIFY --------------- //

// 1. Fetch from Get Recommendations endpoint
// TODO: fetch from Get Recommendations endpoint: up to 5 genres, popularity 0-100, min/max tempo
let testGenres = "pop,rock,hip-hop";
let testPopularity = 60;
let testMinTempo = 100;
let testMaxTempo = 120;

let playlistRecommendationsSampleResponse = [
  {
    album: {
      album_type: "SINGLE",
      artists: [
        {
          external_urls: {
            spotify: "https://open.spotify.com/artist/5ZsFI1h6hIdQRw2ti0hz81",
          },
          href: "https://api.spotify.com/v1/artists/5ZsFI1h6hIdQRw2ti0hz81",
          id: "5ZsFI1h6hIdQRw2ti0hz81",
          name: "ZAYN",
          type: "artist",
          uri: "spotify:artist:5ZsFI1h6hIdQRw2ti0hz81",
        },
      ],
      external_urls: {
        spotify: "https://open.spotify.com/album/2kGUeTGnkLOYlinKRJe47G",
      },
      href: "https://api.spotify.com/v1/albums/2kGUeTGnkLOYlinKRJe47G",
      id: "2kGUeTGnkLOYlinKRJe47G",
      images: [
        {
          height: 640,
          url: "https://i.scdn.co/image/ab67616d0000b2733bfd914f72da2ed8822a634f",
          width: 640,
        },
        {
          height: 300,
          url: "https://i.scdn.co/image/ab67616d00001e023bfd914f72da2ed8822a634f",
          width: 300,
        },
        {
          height: 64,
          url: "https://i.scdn.co/image/ab67616d000048513bfd914f72da2ed8822a634f",
          width: 64,
        },
      ],
      is_playable: true,
      name: "Still Got Time (feat. PARTYNEXTDOOR)",
      release_date: "2017-03-23",
      release_date_precision: "day",
      total_tracks: 1,
      type: "album",
      uri: "spotify:album:2kGUeTGnkLOYlinKRJe47G",
    },
    artists: [
      {
        external_urls: {
          spotify: "https://open.spotify.com/artist/5ZsFI1h6hIdQRw2ti0hz81",
        },
        href: "https://api.spotify.com/v1/artists/5ZsFI1h6hIdQRw2ti0hz81",
        id: "5ZsFI1h6hIdQRw2ti0hz81",
        name: "ZAYN",
        type: "artist",
        uri: "spotify:artist:5ZsFI1h6hIdQRw2ti0hz81",
      },
      {
        external_urls: {
          spotify: "https://open.spotify.com/artist/2HPaUgqeutzr3jx5a9WyDV",
        },
        href: "https://api.spotify.com/v1/artists/2HPaUgqeutzr3jx5a9WyDV",
        id: "2HPaUgqeutzr3jx5a9WyDV",
        name: "PARTYNEXTDOOR",
        type: "artist",
        uri: "spotify:artist:2HPaUgqeutzr3jx5a9WyDV",
      },
    ],
    disc_number: 1,
    duration_ms: 188490,
    explicit: false,
    external_ids: {
      isrc: "USRC11700675",
    },
    external_urls: {
      spotify: "https://open.spotify.com/track/000xQL6tZNLJzIrtIgxqSl",
    },
    href: "https://api.spotify.com/v1/tracks/000xQL6tZNLJzIrtIgxqSl",
    id: "000xQL6tZNLJzIrtIgxqSl",
    is_local: false,
    is_playable: true,
    name: "Still Got Time (feat. PARTYNEXTDOOR)",
    popularity: 60,
    preview_url:
      "https://p.scdn.co/mp3-preview/765e08c9b8930c6d0338c2d3d75c5b1c3efff338?cid=dc91c831cad7402aa96598bc65b59d42",
    track_number: 1,
    type: "track",
    uri: "spotify:track:000xQL6tZNLJzIrtIgxqSl",
  },
  {
    album: {
      album_type: "ALBUM",
      artists: [
        {
          external_urls: {
            spotify: "https://open.spotify.com/artist/4OBJLual30L7gRl5UkeRcT",
          },
          href: "https://api.spotify.com/v1/artists/4OBJLual30L7gRl5UkeRcT",
          id: "4OBJLual30L7gRl5UkeRcT",
          name: "T.I.",
          type: "artist",
          uri: "spotify:artist:4OBJLual30L7gRl5UkeRcT",
        },
      ],
      external_urls: {
        spotify: "https://open.spotify.com/album/5PfepkNWgRR2DI02Y8AawC",
      },
      href: "https://api.spotify.com/v1/albums/5PfepkNWgRR2DI02Y8AawC",
      id: "5PfepkNWgRR2DI02Y8AawC",
      images: [
        {
          height: 640,
          url: "https://i.scdn.co/image/ab67616d0000b273b6d4478c6f91f1cb2d326c78",
          width: 640,
        },
        {
          height: 300,
          url: "https://i.scdn.co/image/ab67616d00001e02b6d4478c6f91f1cb2d326c78",
          width: 300,
        },
        {
          height: 64,
          url: "https://i.scdn.co/image/ab67616d00004851b6d4478c6f91f1cb2d326c78",
          width: 64,
        },
      ],
      is_playable: true,
      name: "Paper Trail",
      release_date: "2008-09-07",
      release_date_precision: "day",
      total_tracks: 16,
      type: "album",
      uri: "spotify:album:5PfepkNWgRR2DI02Y8AawC",
    },
    artists: [
      {
        external_urls: {
          spotify: "https://open.spotify.com/artist/4OBJLual30L7gRl5UkeRcT",
        },
        href: "https://api.spotify.com/v1/artists/4OBJLual30L7gRl5UkeRcT",
        id: "4OBJLual30L7gRl5UkeRcT",
        name: "T.I.",
        type: "artist",
        uri: "spotify:artist:4OBJLual30L7gRl5UkeRcT",
      },
      {
        external_urls: {
          spotify: "https://open.spotify.com/artist/31TPClRtHm23RisEBtV3X7",
        },
        href: "https://api.spotify.com/v1/artists/31TPClRtHm23RisEBtV3X7",
        id: "31TPClRtHm23RisEBtV3X7",
        name: "Justin Timberlake",
        type: "artist",
        uri: "spotify:artist:31TPClRtHm23RisEBtV3X7",
      },
    ],
    disc_number: 1,
    duration_ms: 299746,
    explicit: true,
    external_ids: {
      isrc: "USAT20803689",
    },
    external_urls: {
      spotify: "https://open.spotify.com/track/7IhsLJMqdxoo7YAZjaSMru",
    },
    href: "https://api.spotify.com/v1/tracks/7IhsLJMqdxoo7YAZjaSMru",
    id: "7IhsLJMqdxoo7YAZjaSMru",
    is_local: false,
    is_playable: true,
    name: "Dead And Gone",
    popularity: 70,
    preview_url:
      "https://p.scdn.co/mp3-preview/a282d070d34ad7e8c0608d9a426617f6cd96c11f?cid=dc91c831cad7402aa96598bc65b59d42",
    track_number: 16,
    type: "track",
    uri: "spotify:track:7IhsLJMqdxoo7YAZjaSMru",
  },
  {
    album: {
      album_type: "ALBUM",
      artists: [
        {
          external_urls: {
            spotify: "https://open.spotify.com/artist/74XFHRwlV6OrjEM0A2NCMF",
          },
          href: "https://api.spotify.com/v1/artists/74XFHRwlV6OrjEM0A2NCMF",
          id: "74XFHRwlV6OrjEM0A2NCMF",
          name: "Paramore",
          type: "artist",
          uri: "spotify:artist:74XFHRwlV6OrjEM0A2NCMF",
        },
      ],
      external_urls: {
        spotify: "https://open.spotify.com/album/4sgYpkIASM1jVlNC8Wp9oF",
      },
      href: "https://api.spotify.com/v1/albums/4sgYpkIASM1jVlNC8Wp9oF",
      id: "4sgYpkIASM1jVlNC8Wp9oF",
      images: [
        {
          height: 640,
          url: "https://i.scdn.co/image/ab67616d0000b273532033d0d90736f661c13d35",
          width: 640,
        },
        {
          height: 300,
          url: "https://i.scdn.co/image/ab67616d00001e02532033d0d90736f661c13d35",
          width: 300,
        },
        {
          height: 64,
          url: "https://i.scdn.co/image/ab67616d00004851532033d0d90736f661c13d35",
          width: 64,
        },
      ],
      is_playable: true,
      name: "Paramore",
      release_date: "2013-04-05",
      release_date_precision: "day",
      total_tracks: 17,
      type: "album",
      uri: "spotify:album:4sgYpkIASM1jVlNC8Wp9oF",
    },
    artists: [
      {
        external_urls: {
          spotify: "https://open.spotify.com/artist/74XFHRwlV6OrjEM0A2NCMF",
        },
        href: "https://api.spotify.com/v1/artists/74XFHRwlV6OrjEM0A2NCMF",
        id: "74XFHRwlV6OrjEM0A2NCMF",
        name: "Paramore",
        type: "artist",
        uri: "spotify:artist:74XFHRwlV6OrjEM0A2NCMF",
      },
    ],
    disc_number: 1,
    duration_ms: 216013,
    explicit: false,
    external_ids: {
      isrc: "USAT21300012",
    },
    external_urls: {
      spotify: "https://open.spotify.com/track/1yjY7rpaAQvKwpdUliHx0d",
    },
    href: "https://api.spotify.com/v1/tracks/1yjY7rpaAQvKwpdUliHx0d",
    id: "1yjY7rpaAQvKwpdUliHx0d",
    is_local: false,
    is_playable: true,
    name: "Still into You",
    popularity: 83,
    preview_url:
      "https://p.scdn.co/mp3-preview/4abdea56e053fe7d0f4f4e446b43d404b28edf69?cid=dc91c831cad7402aa96598bc65b59d42",
    track_number: 9,
    type: "track",
    uri: "spotify:track:1yjY7rpaAQvKwpdUliHx0d",
  },
];

// 2. Build query string for Get Tracks' Audio Features endpoint
let audioAnaylysisQueryString = "";

playlistRecommendationsSampleResponse.forEach((track) => {
  //   console.log(track.name);
  //   console.log(track.artists[0].name);
  //   console.log(track.id);

  audioAnaylysisQueryString += track.id + ",";
});

// console.log(audioAnaylysisQueryString);

// 3. Fetch from Get Tracks' Audio Features endpoint
// TODO: fetch from Get Tracks' Audio Features endpoint
let audioAnalysisSampleResponse = [
  {
    danceability: 0.748,
    energy: 0.627,
    key: 7,
    loudness: -6.029,
    mode: 1,
    speechiness: 0.0639,
    acousticness: 0.131,
    instrumentalness: 0,
    liveness: 0.0852,
    valence: 0.524,
    tempo: 120.963,
    type: "audio_features",
    id: "000xQL6tZNLJzIrtIgxqSl",
    uri: "spotify:track:000xQL6tZNLJzIrtIgxqSl",
    track_href: "https://api.spotify.com/v1/tracks/000xQL6tZNLJzIrtIgxqSl",
    analysis_url:
      "https://api.spotify.com/v1/audio-analysis/000xQL6tZNLJzIrtIgxqSl",
    duration_ms: 188491,
    time_signature: 4,
  },
  {
    danceability: 0.713,
    energy: 0.746,
    key: 0,
    loudness: -4.99,
    mode: 1,
    speechiness: 0.259,
    acousticness: 0.0402,
    instrumentalness: 0,
    liveness: 0.601,
    valence: 0.47,
    tempo: 135.021,
    type: "audio_features",
    id: "7IhsLJMqdxoo7YAZjaSMru",
    uri: "spotify:track:7IhsLJMqdxoo7YAZjaSMru",
    track_href: "https://api.spotify.com/v1/tracks/7IhsLJMqdxoo7YAZjaSMru",
    analysis_url:
      "https://api.spotify.com/v1/audio-analysis/7IhsLJMqdxoo7YAZjaSMru",
    duration_ms: 299747,
    time_signature: 4,
  },
  {
    danceability: 0.602,
    energy: 0.923,
    key: 5,
    loudness: -3.763,
    mode: 1,
    speechiness: 0.044,
    acousticness: 0.0098,
    instrumentalness: 0,
    liveness: 0.0561,
    valence: 0.765,
    tempo: 136.01,
    type: "audio_features",
    id: "1yjY7rpaAQvKwpdUliHx0d",
    uri: "spotify:track:1yjY7rpaAQvKwpdUliHx0d",
    track_href: "https://api.spotify.com/v1/tracks/1yjY7rpaAQvKwpdUliHx0d",
    analysis_url:
      "https://api.spotify.com/v1/audio-analysis/1yjY7rpaAQvKwpdUliHx0d",
    duration_ms: 216013,
    time_signature: 4,
  },
  {
    danceability: 0.402,
    energy: 0.923,
    key: 5,
    loudness: -3.763,
    mode: 1,
    speechiness: 0.044,
    acousticness: 0.0098,
    instrumentalness: 0,
    liveness: 0.0561,
    valence: 0.765,
    tempo: 136.01,
    type: "audio_features",
    id: "1yjY7rpaAQvKwpdUliHx0d",
    uri: "spotify:track:1yjY7rpaAQvKwpdUliHx0d",
    track_href: "https://api.spotify.com/v1/tracks/1yjY7rpaAQvKwpdUliHx0d",
    analysis_url:
      "https://api.spotify.com/v1/audio-analysis/1yjY7rpaAQvKwpdUliHx0d",
    duration_ms: 116013,
    time_signature: 4,
  },
  {
    danceability: 0.902,
    energy: 0.923,
    key: 5,
    loudness: -3.763,
    mode: 1,
    speechiness: 0.044,
    acousticness: 0.0098,
    instrumentalness: 0,
    liveness: 0.0561,
    valence: 0.765,
    tempo: 136.01,
    type: "audio_features",
    id: "1yjY7rpaAQvKwpdUliHx0d",
    uri: "spotify:track:1yjY7rpaAQvKwpdUliHx0d",
    track_href: "https://api.spotify.com/v1/tracks/1yjY7rpaAQvKwpdUliHx0d",
    analysis_url:
      "https://api.spotify.com/v1/audio-analysis/1yjY7rpaAQvKwpdUliHx0d",
    duration_ms: 305013,
    time_signature: 4,
  },
];

// --------------- PLAYLIST GENERATION V1 --------------- //
const clientId = SPOTIFY_CLIENT_ID; // Replace with your client ID
const params = new URLSearchParams(window.location.search);
const code = params.get("code");

const queryParams = {
  limit: 100,
  market: "US",
  seed_genres: "pop%2Crock%2Chip-hop",
  min_tempo: 100,
  max_tempo: 120,
};

if (!code) {
  redirectToAuthCodeFlow(clientId);
} else {
  const accessToken = await getAccessToken(clientId, code);
  const recommendaitons = await fetchRecommendations(accessToken, queryParams);
  console.log(recommendaitons);
  // populateUI(profile);
}

export async function redirectToAuthCodeFlow(clientId) {
  const verifier = generateCodeVerifier(128);
  const challenge = await generateCodeChallenge(verifier);

  localStorage.setItem("verifier", verifier);

  const params = new URLSearchParams();
  params.append("client_id", clientId);
  params.append("response_type", "code");
  params.append("redirect_uri", "http://localhost:5000/playlist");
  params.append("scope", "user-read-private user-read-email");
  params.append("code_challenge_method", "S256");
  params.append("code_challenge", challenge);

  document.location = `https://accounts.spotify.com/authorize?${params.toString()}`;
}

function generateCodeVerifier(length) {
  let text = "";
  let possible =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for (let i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}

async function generateCodeChallenge(codeVerifier) {
  const data = new TextEncoder().encode(codeVerifier);
  const digest = await window.crypto.subtle.digest("SHA-256", data);
  return btoa(String.fromCharCode.apply(null, [...new Uint8Array(digest)]))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

export async function getAccessToken(clientId, code) {
  const verifier = localStorage.getItem("verifier");

  const params = new URLSearchParams();
  params.append("client_id", clientId);
  params.append("grant_type", "authorization_code");
  params.append("code", code);
  params.append("redirect_uri", "http://localhost:5000/playlist");
  params.append("code_verifier", verifier);

  const result = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: params,
  });

  const { access_token } = await result.json();
  return access_token;
}

async function fetchRecommendations(token, params) {
  // Construct the URL with query parameters
  const baseUrl = "https://api.spotify.com/v1/recommendations";
  const url = new URL(baseUrl);

  // Add query parameters to the URL
  Object.keys(params).forEach((key) => {
    url.searchParams.append(key, params[key]);
  });

  const result = await fetch(url.toString(), {
    method: "GET",
    headers: { Authorization: `Bearer ${token}` },
  });

  return await result.json();
}

// console.log(fetchRecommendations());

function populateUI(profile) {
  // TODO: Update UI with profile data
}

function getRandomTrack() {
  // Check if there are tracks remaining
  if (audioAnalysisSampleResponse.length === 0) {
    return null; // No tracks left
  }

  // Randomly select a track
  const randomIndex = Math.floor(
    Math.random() * audioAnalysisSampleResponse.length
  );
  const randomTrack = audioAnalysisSampleResponse[randomIndex];

  // Remove the selected track from the array
  audioAnalysisSampleResponse.splice(randomIndex, 1);

  // console.log(randomTrack);
  return randomTrack;
}

// const track1 = getRandomTrack();
// console.log(track1);
// console.log(audioAnalysisSampleResponse);

// const track2 = getRandomTrack();
// console.log(track2);
// console.log(audioAnalysisSampleResponse);

function generatePlaylist() {
  const playlist = [];
  let remainingTime = expectedFinishTime;

  while (remainingTime > 0) {
    // Select a track from the Get Recommendations response
    const selectedTrack = getRandomTrack();

    console.log(remainingTime);

    // Add the track to the playlist
    playlist.push(selectedTrack);

    // Subtract the track's duration from the remaining time
    remainingTime -= selectedTrack.duration_ms / 1000;
  }

  console.log(playlist);
  return playlist;
}

// --------------- PLAYLIST GENERATION V2 --------------- //

function splitRouteIntoSegments(elevationData, elevationThreshold) {
  const segments = [];
  let currentSegment = [elevationData[0]];

  // First segment starts with first point, we loop through the rest
  for (let i = 1; i < elevationData.length; i++) {
    const elevationChange = elevationData[i] - elevationData[i - 1];

    // If current elevationChange is greater than threshold start a new segment otherwise add point to the current segment
    if (Math.abs(elevationChange) >= elevationThreshold) {
      segments.push(currentSegment);
      currentSegment = [elevationData[i]];
    } else {
      currentSegment.push(elevationData[i]);
    }
  }

  // Add the last segment
  segments.push(currentSegment);

  return segments;
}

let testElevationData = [
  225.53, 224.72, 224.11, 223.65, 223.35, 223.46, 225.26, 226.33, 226.46,
  226.93, 227.06, 227.19, 227.22, 227.23, 227.25, 227.27, 227.34, 227.36, 227.6,
  227.68, 227.72, 227.76, 227.95, 228.03, 228.06, 228.1, 227.14, 227.2, 227.3,
  227.46, 228.21, 228.29, 228.53, 228.81, 229.1, 229.6, 229.74, 229.83, 229.91,
  230.0, 230.78, 230.86, 230.95, 231.05, 231.21, 231.35, 231.42, 232.36, 233.48,
  233.54, 232.32, 230.78, 230.67, 230.24, 230.65, 230.16, 230.07, 230.02,
  229.98, 228.15, 226.32, 226.15, 225.96, 225.64,
];

// console.log(splitRouteIntoSegments(testElevationData, 1.3));
