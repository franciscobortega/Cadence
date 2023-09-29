"use strict";

// --------------- ELEVATION --------------- //

const ctx = document.getElementById("myChart");
let chart;

export function drawChart(elevationData) {
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
            borderColor: "rgb(50, 0, 112)",
            fill: true,
            backgroundColor: "rgba(50, 0, 112, 0.05)",
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
