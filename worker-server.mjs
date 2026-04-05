// Lightweight worker server that handles long-running tasks
// Runs as a separate process on port 9091 so it doesn't block the main Next.js server

import http from "http";
import { spawn } from "child_process";
import path from "path";
import { fileURLToPath } from "url";
import "dotenv/config";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function spawnWorker(scriptName, movieId, res) {
  const scriptPath = path.join(__dirname, "src", "lib", "ai", scriptName);
  console.log(`[worker] Spawning ${scriptName} for movie ${movieId}`);

  const child = spawn("node", [scriptPath, movieId], {
    detached: true,
    stdio: "ignore",
    env: { ...process.env },
    cwd: __dirname,
  });

  child.unref();
  console.log(`[worker] Spawned pid ${child.pid} for movie ${movieId}`);

  res.writeHead(200, { "Content-Type": "application/json" });
  res.end(JSON.stringify({ status: "started", movieId, pid: child.pid }));
}

const server = http.createServer((req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.writeHead(204);
    res.end();
    return;
  }

  if (req.method === "POST" && req.url?.startsWith("/generate/")) {
    const movieId = req.url.split("/generate/")[1];
    spawnWorker("generate-worker.mjs", movieId, res);
  } else if (req.method === "POST" && req.url?.startsWith("/film/")) {
    const movieId = req.url.split("/film/")[1];
    spawnWorker("film-worker.mjs", movieId, res);
  } else {
    res.writeHead(404);
    res.end("Not found");
  }
});

server.listen(9091, () => {
  console.log("[worker] Worker server listening on http://localhost:9091");
  console.log("[worker] FAL_KEY configured:", !!process.env.FAL_KEY);
  console.log("[worker] ANTHROPIC_API_KEY configured:", !!process.env.ANTHROPIC_API_KEY);
});
