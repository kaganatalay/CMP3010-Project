const random = (min, max) => Math.random() * (max - min) + min;

const simulator = () => {
  fetch("http://localhost:3000/log", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      temperature: random(20, 40),
    }),
  })
    .then((response) => response.json())
    .then((data) => console.log(data))
    .catch((error) => console.error("Error:", error));
};

setInterval(simulator, 5000);
