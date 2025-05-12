import { serve } from "@hono/node-server";
import { Hono } from "hono";
import fs from "fs";
import { logger } from "hono/logger";

const app = new Hono();
app.use(logger());

const DATA_FILE = "./history.json";

async function initDataFile() {
  try {
    fs.accessSync(DATA_FILE);
  } catch {
    fs.writeFileSync(DATA_FILE, JSON.stringify([]), "utf-8");
  }
}

app.get("/", (c) => c.text("Hello World!"));

app.post("/temperature", async (c) => {
  try {
    const { temperature } = await c.req.json();
    const timestamp = new Date().toISOString();
    const record = { temperature, timestamp };

    const file = fs.readFileSync(DATA_FILE, "utf-8");
    const data = JSON.parse(file);

    data.push(record);
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), "utf-8");

    return c.json({ success: true, record });
  } catch (err) {
    console.error("Failed to log temperature", err);
    return c.json({ success: false }, 500);
  }
});

initDataFile().then(() => {
  serve(
    {
      fetch: app.fetch,
      port: 3000,
    },
    (info) => {
      console.log(`Server is running on http://localhost:${info.port}`);
    }
  );
});
