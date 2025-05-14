import { Hono } from "hono";
import fs from "fs";
import { logger } from "hono/logger";
import { serveStatic } from "@hono/node-server/serve-static";
import { serve } from "@hono/node-server";
import type { Server as HTTPSServer } from "node:http";
import { Server as SocketIOServer } from "socket.io";
import sqlite3 from "sqlite3";

export const app = new Hono();

app.use(logger());
app.use("/public/*", serveStatic({ root: "./src" }));

sqlite3.verbose();
const db = new sqlite3.Database("main.db");
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS readings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      temperature REAL NOT NULL,
      timestamp TEXT NOT NULL
    )
  `);
});

app.get("/", (c) => c.text("Hello World!"));

// app.get("/dashboard", (c) => {
//   console.log("Serving dashboard");
//   const html = fs.readFileSync(path.join("public", "index.html"), "utf-8");
//   return c.body(html, 200, { "Content-Type": "text/html" });
// });

app.post("/log", async (c) => {
  try {
    const { temperature } = await c.req.json();
    const timestamp = new Date().toISOString();

    const record = await new Promise((resolve, reject) => {
      db.run(
        "INSERT INTO readings (temperature, timestamp) VALUES (?, ?)",
        [temperature, timestamp],
        (err) => {
          if (err) {
            reject(err);
          } else {
            const record = { temperature, timestamp };
            resolve(record);
          }
        }
      );
    });

    io.emit("update", record);
    return c.json({ success: true, record });
  } catch (err) {
    console.error("Failed to log temperature", err);
    return c.json({ success: false }, 500);
  }
});

const server = serve(app, (info) => {
  console.log(`Listening on http://localhost:${info.port}`);
});

const io = new SocketIOServer(server as HTTPSServer);

io.on("connection", (socket) => {
  console.log(`[${socket.id}] - Client connected`);

  socket.on("initialize", (ack) => {
    console.log(`[${socket.id}] - Client asked to initialize`);

    db.all(
      "SELECT temperature, timestamp FROM readings ORDER BY timestamp ASC",
      (err, rows) => {
        if (err) {
          ack({ success: false, error: "Database error" });
          return;
        }
        ack({ success: true, data: rows });
      }
    );
  });

  socket.on("disconnect", () => {
    console.log(`[${socket.id}] - Client disconnected`);
  });
});
