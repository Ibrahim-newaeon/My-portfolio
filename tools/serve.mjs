#!/usr/bin/env node
// Production static server for Railway / generic hosts.
// Serves the project root; "/" → Ibrahim Portfolio.html.
import { fileURLToPath } from "node:url";
import { dirname, join, relative } from "node:path";
import { createServer } from "node:http";
import { stat, readFile } from "node:fs/promises";

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, "..");
const PORT = Number(process.env.PORT) || 8080;
const HOST = process.env.HOST || "0.0.0.0";

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

const server = createServer(async (req, res) => {
  try {
    const url = decodeURIComponent((req.url ?? "/").split("?")[0]);
    if (url === "/healthz") { res.writeHead(200); res.end("ok"); return; }
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
});
