"use strict";

// --------------- ELEVATION --------------- //

const elevationData = [
  { longtitude: 1, latitude: 2, elevation: 228.3 },
  { longtitude: 1, latitude: 2, elevation: 228.5 },
  { longtitude: 1, latitude: 2, elevation: 228.5 },
  { longtitude: 1, latitude: 2, elevation: 228.5 },
  { longtitude: 1, latitude: 2, elevation: 228.6 },
  { longtitude: 1, latitude: 2, elevation: 228.8 },
  { longtitude: 1, latitude: 2, elevation: 229.3 },
  { longtitude: 1, latitude: 2, elevation: 229.7 },
  { longtitude: 1, latitude: 2, elevation: 229.3 },
  { longtitude: 1, latitude: 2, elevation: 229.2 },
  { longtitude: 1, latitude: 2, elevation: 229.1 },
  { longtitude: 1, latitude: 2, elevation: 229 },
  { longtitude: 1, latitude: 2, elevation: 226.6 },
  { longtitude: 1, latitude: 2, elevation: 223.1 },
  { longtitude: 1, latitude: 2, elevation: 222.7 },
  { longtitude: 1, latitude: 2, elevation: 222.4 },
  { longtitude: 1, latitude: 2, elevation: 223.9 },
  { longtitude: 1, latitude: 2, elevation: 223.9 },
  { longtitude: 1, latitude: 2, elevation: 223.6 },
  { longtitude: 1, latitude: 2, elevation: 223 },
  { longtitude: 1, latitude: 2, elevation: 222.5 },
  { longtitude: 1, latitude: 2, elevation: 221.9 },
  { longtitude: 1, latitude: 2, elevation: 221.9 },
  { longtitude: 1, latitude: 2, elevation: 220.6 },
  { longtitude: 1, latitude: 2, elevation: 220.2 },
  { longtitude: 1, latitude: 2, elevation: 218.8 },
  { longtitude: 1, latitude: 2, elevation: 217.7 },
  { longtitude: 1, latitude: 2, elevation: 219.6 },
  { longtitude: 1, latitude: 2, elevation: 220.4 },
  { longtitude: 1, latitude: 2, elevation: 221.1 },
  { longtitude: 1, latitude: 2, elevation: 221.5 },
  { longtitude: 1, latitude: 2, elevation: 221.9 },
  { longtitude: 1, latitude: 2, elevation: 222.2 },
  { longtitude: 1, latitude: 2, elevation: 222.5 },
  { longtitude: 1, latitude: 2, elevation: 222.7 },
  { longtitude: 1, latitude: 2, elevation: 222.8 },
  { longtitude: 1, latitude: 2, elevation: 222.2 },
  { longtitude: 1, latitude: 2, elevation: 221.9 },
  { longtitude: 1, latitude: 2, elevation: 221.5 },
  { longtitude: 1, latitude: 2, elevation: 220.8 },
  { longtitude: 1, latitude: 2, elevation: 219.7 },
  { longtitude: 1, latitude: 2, elevation: 219.6 },
  { longtitude: 1, latitude: 2, elevation: 220.8 },
  { longtitude: 1, latitude: 2, elevation: 220.8 },
  { longtitude: 1, latitude: 2, elevation: 220.6 },
  { longtitude: 1, latitude: 2, elevation: 220.5 },
  { longtitude: 1, latitude: 2, elevation: 220.5 },
  { longtitude: 1, latitude: 2, elevation: 220.5 },
  { longtitude: 1, latitude: 2, elevation: 220.4 },
  { longtitude: 1, latitude: 2, elevation: 220.7 },
  { longtitude: 1, latitude: 2, elevation: 222.7 },
  { longtitude: 1, latitude: 2, elevation: 222.8 },
  { longtitude: 1, latitude: 2, elevation: 223.4 },
  { longtitude: 1, latitude: 2, elevation: 223.6 },
  { longtitude: 1, latitude: 2, elevation: 224.6 },
  { longtitude: 1, latitude: 2, elevation: 227.9 },
  { longtitude: 1, latitude: 2, elevation: 228.6 },
  { longtitude: 1, latitude: 2, elevation: 228.7 },
  { longtitude: 1, latitude: 2, elevation: 228.8 },
  { longtitude: 1, latitude: 2, elevation: 228.8 },
  { longtitude: 1, latitude: 2, elevation: 229.3 },
  { longtitude: 1, latitude: 2, elevation: 229.3 },
  { longtitude: 1, latitude: 2, elevation: 229.3 },
  { longtitude: 1, latitude: 2, elevation: 229.4 },
  { longtitude: 1, latitude: 2, elevation: 229.4 },
  { longtitude: 1, latitude: 2, elevation: 229.4 },
  { longtitude: 1, latitude: 2, elevation: 229.4 },
  { longtitude: 1, latitude: 2, elevation: 229.3 },
  { longtitude: 1, latitude: 2, elevation: 231.4 },
  { longtitude: 1, latitude: 2, elevation: 231.7 },
  { longtitude: 1, latitude: 2, elevation: 231.7 },
  { longtitude: 1, latitude: 2, elevation: 229.9 },
  { longtitude: 1, latitude: 2, elevation: 228.5 },
  { longtitude: 1, latitude: 2, elevation: 228.5 },
  { longtitude: 1, latitude: 2, elevation: 228.3 },
];

const ctx = document.getElementById("myChart");
let chart;

function drawChart(elevationData) {
  if (chart) {
    chart.data.datasets[0].data = elevationData.map((row) => row.elevation);
    chart.data.labels = elevationData.map((_, index) => index + 1);

    // Recalculate min and max elevation
    const minElevation = Math.min(...chart.data.datasets[0].data);
    const minRounded = Math.floor(minElevation / 10) * 10;

    const maxElevation = Math.max(...chart.data.datasets[0].data);
    const maxRounded = Math.ceil(maxElevation / 10) * 10;

    // Update the y-axis scales
    chart.options.scales.y.min = minRounded;
    chart.options.scales.y.max = maxRounded;

    chart.update();
  } else {
    const minElevation = Math.min(...elevationData.map((row) => row.elevation));
    const minRounded = Math.floor(minElevation / 10) * 10;

    const maxElevation = Math.max(...elevationData.map((row) => row.elevation));
    const maxRounded = Math.ceil(maxElevation / 10) * 10;

    chart = new Chart(ctx, {
      type: "line",
      data: {
        labels: elevationData.map((_, index) => index + 1),
        datasets: [
          {
            label: "Elevation",
            data: elevationData.map((row) => row.elevation),
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

document.querySelector("form").addEventListener("submit", (e) => {
  e.preventDefault();

  const newValue = parseFloat(document.querySelector("#elevation-input").value);

  elevationData.push({ longtitude: 1, latitude: 2, elevation: newValue });

  console.log(elevationData);

  drawChart(elevationData);
});

document.querySelector("#delete-elevation").addEventListener("click", () => {
  elevationData.pop();

  console.log(elevationData);

  drawChart(elevationData);
});
