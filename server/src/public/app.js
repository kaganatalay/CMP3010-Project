const ctx = document.querySelector(".tempChart").getContext("2d");
const scale = document.querySelector(".scale");
const latestUpdate = document.querySelector(".latestUpdate span");

const connectionText = document.querySelector(".connectionStatus span");
const connectionIcon = document.querySelector(".connectionStatus .icon");

const currentTempContainer = document.querySelector(".stats .current");

const currentTempElement = document.querySelector(".stats .current span.value");
const maxTempElement = document.querySelector(".stats .highest span.value");

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
  latestUpdate.textContent = `Latest update: ${new Date(
    data.at(-1).timestamp
  ).toLocaleString()}`;

  const temps = data.map((r) => r.temperature);

  const currentTemp = Math.floor(temps.at(-1));
  const maxTemp = Math.floor(Math.max(...temps));

  currentTempElement.textContent = currentTemp ?? "–";
  maxTempElement.textContent = isFinite(maxTemp) ? maxTemp : "–";

  if (currentTemp > 30) {
    currentTempContainer.classList.add("high");
    currentTempContainer.classList.remove("mid", "low");
  } else if (currentTemp > 22) {
    currentTempContainer.classList.add("mid");
    currentTempContainer.classList.remove("high", "low");
  } else {
    currentTempContainer.classList.add("low");
    currentTempContainer.classList.remove("high", "mid");
  }

  scale.style.transform = `translateX(${-96 * (currentTemp - 12)}px)`;

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

      connectionIcon.classList.remove("inactive");
      connectionIcon.classList.add("active");

      connectionText.textContent = "Connected";
      connectionText.classList.remove("inactive");
      connectionText.classList.add("active");

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
