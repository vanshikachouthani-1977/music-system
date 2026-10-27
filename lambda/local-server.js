import http from "http";
import { handler as recommendHandler } from "./recommendPlaylist.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PORT = process.env.LAMBDA_PORT || 3001;

const server = http.createServer(async (req, res) => {
  // Set CORS headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    res.writeHead(200);
    return res.end();
  }

  const url = new URL(req.url, `http://${req.headers.host}`);

  // Route 1: Health check
  if (url.pathname === "/health") {
    res.writeHead(200, { "Content-Type": "application/json" });
    return res.end(JSON.stringify({ status: "ok", timestamp: new Date().toISOString() }));
  }

  // Route 2: Get catalog
  if (url.pathname === "/api/catalog" && req.method === "GET") {
    const catalogPath = path.join(__dirname, "../catalog/songs.json");
    if (fs.existsSync(catalogPath)) {
      res.writeHead(200, { "Content-Type": "application/json" });
      return res.end(fs.readFileSync(catalogPath, "utf-8"));
    }
    res.writeHead(404, { "Content-Type": "application/json" });
    return res.end(JSON.stringify({ error: "Catalog not found" }));
  }

  // Route 3: Lambda AI recommendation endpoint (POST /api/recommend)
  if (url.pathname === "/api/recommend" && req.method === "POST") {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk;
    });

    req.on("end", async () => {
      const lambdaEvent = {
        httpMethod: "POST",
        body,
        headers: req.headers
      };

      const result = await recommendHandler(lambdaEvent);
      res.writeHead(result.statusCode, result.headers);
      res.end(result.body);
    });
    return;
  }

  // 404 handler
  res.writeHead(404, { "Content-Type": "application/json" });
  res.end(JSON.stringify({ error: "Route not found" }));
});

server.listen(PORT, () => {
  console.log(`\n🎧 AWS Lambda Local Development Server running!`);
  console.log(`   ➜ API Endpoint: http://localhost:${PORT}/api/recommend`);
  console.log(`   ➜ Catalog View: http://localhost:${PORT}/api/catalog`);
  console.log(`   ➜ Health Check: http://localhost:${PORT}/health\n`);
});
