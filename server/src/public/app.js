const ctx = document.querySelector(".tempChart").getContext("2d");
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
            borderColor: "orange",
            borderWidth: 1,
            label: { content: "22°C", enabled: true, position: "start" },
          },
          line30: {
            type: "line",
            yMin: 30,
            yMax: 30,
            borderColor: "red",
            borderWidth: 1,
            label: { content: "30°C", enabled: true, position: "start" },
          },
        },
      },
    },
  },
});

let data = [];
async function rerender(records) {
  data = records;

  const times = data.map((r) => new Date(r.timestamp).toLocaleTimeString());
  const temps = data.map((r) => r.temperature);
  const maxTemp = Math.max(...temps);

  document.querySelector(".currentTemp").textContent =
    temps.at(-1)?.toFixed(1) ?? "–";
  document.querySelector(".maxTemp").textContent = isFinite(maxTemp)
    ? maxTemp.toFixed(1)
    : "–";

  chart.data.labels = times;
  chart.data.datasets[0].data = temps;
  chart.update();
}

const socket = io();

socket.on("connect", () => {
  console.log("Connected to server");

  socket.emit("initialize", (response) => {
    if (response.success) {
      console.log("History:", response.data);
      rerender(response.data);
    } else {
      console.error("Failed to initialize:", response.error);
    }
  });
});

socket.on("update", (record) => {
  console.log("update:", record);
  rerender([...data, record]);
});

socket.on("disconnect", () => {
  console.log("Disconnected from server");
});
