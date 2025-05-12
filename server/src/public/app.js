const ctx = document.getElementById("tempChart").getContext("2d");
const chart = new Chart(ctx, {
  type: "line",
  data: {
    labels: [],
    datasets: [
      {
        label: "Temperature",
        data: [],
        fill: false,
        tension: 0.2,
      },
    ],
  },
  options: {
    scales: {
      x: { title: { display: true, text: "Time" } },
      y: { title: { display: true, text: "°C" } },
    },
    plugins: {
      decimation: {
        enabled: true,
        algorithm: "lttb", // largest-triangle-three-buckets
        samples: 10, // keep ~100 points
      },
      zoom: {
        pan: { enabled: true, mode: "x", modifierKey: "ctrl", scaleMode: "x" },
        zoom: { wheel: { enabled: true }, pinch: { enabled: true }, mode: "x" },
      },
      annotation: {
        annotations: {
          line22: {
            type: "line",
            yMin: 22,
            yMax: 22,
            borderColor: "green",
            borderWidth: 1,
            label: { content: "22°C", enabled: true, position: "start" },
          },
          line30: {
            type: "line",
            yMin: 30,
            yMax: 30,
            borderColor: "orange",
            borderWidth: 1,
            label: { content: "30°C", enabled: true, position: "start" },
          },
        },
      },
    },
  },
});

async function refresh() {
  const res = await fetch("/history");
  const data = await res.json();

  const times = data.map((r) => new Date(r.timestamp).toLocaleTimeString());
  const temps = data.map((r) => r.temperature);
  const maxTemp = Math.max(...temps);

  document.getElementById("currentTemp").textContent =
    temps.at(-1)?.toFixed(1) ?? "–";
  document.getElementById("maxTemp").textContent = isFinite(maxTemp)
    ? maxTemp.toFixed(1)
    : "–";

  chart.data.labels = times;
  chart.data.datasets[0].data = temps;
  chart.update();
}

refresh();
setInterval(refresh, 1000);
