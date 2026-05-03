#!/usr/bin/env node
// Production server for Railway / generic hosts.
// Serves the project root statically AND exposes the prompt-generator API
// at /api/generate, /api/health.  "/" → Ibrahim Portfolio.html.
import { fileURLToPath } from "node:url";
import { dirname, join, relative } from "node:path";
import { createServer } from "node:http";
import { stat, readFile } from "node:fs/promises";

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, "..");
const PORT = Number(process.env.PORT) || 8080;
const HOST = process.env.HOST || "0.0.0.0";
const BODY_LIMIT = 32 * 1024; // 32kb, matches prompt-generator/src/server.ts

// Lazy-load the pipeline so the static server still boots if the
// prompt-generator hasn't been built (e.g. local quick-look).
let pipelineRun = null;
let pipelineError = null;
try {
  const mod = await import("../prompt-generator/dist/pipeline.js");
  pipelineRun = mod.run;
} catch (err) {
  pipelineError = err instanceof Error ? err.message : String(err);
  console.warn(`[serve] prompt-generator unavailable: ${pipelineError}`);
}

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".js":   "application/javascript; charset=utf-8",
  ".mjs":  "application/javascript; charset=utf-8",
  ".jsx":  "text/babel; charset=utf-8",
  ".css":  "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".yml":  "text/yaml; charset=utf-8",
  ".yaml": "text/yaml; charset=utf-8",
  ".png":  "image/png",
  ".jpg":  "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg":  "image/svg+xml",
  ".ico":  "image/x-icon",
  ".webp": "image/webp",
  ".gif":  "image/gif",
  ".pdf":  "application/pdf",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".ttf":  "font/ttf",
  ".pptx": "application/vnd.openxmlformats-officedocument.presentationml.presentation",
};

function sendJSON(res, status, body) {
  const buf = Buffer.from(JSON.stringify(body));
  res.writeHead(status, {
    "content-type": "application/json; charset=utf-8",
    "content-length": buf.length,
    "cache-control": "no-store",
  });
  res.end(buf);
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let total = 0;
    const chunks = [];
    req.on("data", (chunk) => {
      total += chunk.length;
      if (total > BODY_LIMIT) {
        reject(Object.assign(new Error("payload too large"), { status: 413 }));
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });
    req.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
    req.on("error", reject);
  });
}

async function handleGenerate(req, res) {
  if (req.method !== "POST") {
    res.writeHead(405, { "allow": "POST" });
    res.end();
    return;
  }
  if (!pipelineRun) {
    sendJSON(res, 503, { error: "prompt-generator not available", detail: pipelineError });
    return;
  }
  let parsed;
  try {
    const raw = await readBody(req);
    parsed = raw ? JSON.parse(raw) : {};
  } catch (err) {
    const status = err && err.status === 413 ? 413 : 400;
    sendJSON(res, status, { error: status === 413 ? "payload too large" : "invalid JSON" });
    return;
  }
  const input = typeof parsed?.input === "string" ? parsed.input.trim() : "";
  if (input.length < 3) {
    sendJSON(res, 400, { error: "input must be at least 3 characters" });
    return;
  }
  try {
    const result = await pipelineRun(input, process.env.ANTHROPIC_API_KEY);
    sendJSON(res, 200, result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "internal error";
    sendJSON(res, 500, { error: message });
  }
}

const server = createServer(async (req, res) => {
  try {
    const url = decodeURIComponent((req.url ?? "/").split("?")[0]);

    if (url === "/healthz") { res.writeHead(200); res.end("ok"); return; }
    if (url === "/api/health") {
      sendJSON(res, 200, {
        ok: true,
        promptGenerator: Boolean(pipelineRun),
        hasApiKey: Boolean(process.env.ANTHROPIC_API_KEY),
      });
      return;
    }
    if (url === "/api/generate") return handleGenerate(req, res);

    if (req.method !== "GET" && req.method !== "HEAD") {
      res.writeHead(405); res.end(); return;
    }

    let path = join(root, url === "/" ? "Ibrahim Portfolio.html" : url);
    const rel = relative(root, path);
    if (rel.startsWith("..")) { res.writeHead(403); res.end("forbidden"); return; }
    let st;
    try { st = await stat(path); } catch { res.writeHead(404); res.end("not found"); return; }
    if (st.isDirectory()) path = join(path, "index.html");
    const ext = "." + path.split(".").pop().toLowerCase();
    const body = await readFile(path);
    const isHtml = ext === ".html";
    res.writeHead(200, {
      "content-type": MIME[ext] || "application/octet-stream",
      "cache-control": isHtml ? "no-store" : "public, max-age=3600",
    });
    res.end(body);
  } catch (err) {
    res.writeHead(500); res.end(String(err));
  }
});

server.listen(PORT, HOST, () => {
  console.log(`[serve] listening on http://${HOST}:${PORT}`);
  console.log(`[serve] prompt-generator: ${pipelineRun ? "ready" : "disabled"}`);
  console.log(`[serve] anthropic api key: ${process.env.ANTHROPIC_API_KEY ? "set" : "missing (heuristic mode)"}`);
});
