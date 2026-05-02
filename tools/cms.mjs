#!/usr/bin/env node
// One command to drive local content editing:
//   1. runs decap-server (the local backend that lets the admin UI write files)
//   2. watches content/ and rebuilds portfolio-data.js on every change
//   3. serves the project root over HTTP so admin/index.html can run
//      (Decap won't load over file://)
//
// Usage:  npm run cms
import { spawn } from "node:child_process";
import { watch } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join, relative } from "node:path";
import { createServer } from "node:http";
import { stat, readFile } from "node:fs/promises";

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, "..");
const contentDir = join(root, "content");

const STATIC_PORT = Number(process.env.STATIC_PORT) || 8000;
const ADMIN_URL = `http://localhost:${STATIC_PORT}/admin/`;
const PORTFOLIO_URL = `http://localhost:${STATIC_PORT}/Ibrahim%20Portfolio.html`;

// ─── 1. Initial build ──────────────────────────────────────────
async function runBuild(reason) {
  return new Promise((resolve) => {
    const proc = spawn(process.execPath, [join(here, "build-data.mjs")], {
      cwd: root,
      stdio: "inherit",
    });
    proc.on("exit", (code) => {
      if (code !== 0) console.error(`build:data exited with ${code} (${reason})`);
      resolve();
    });
  });
}

// ─── 2. Watcher (debounced) ────────────────────────────────────
let debounceTimer = null;
function scheduleBuild(reason) {
  if (debounceTimer) clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => runBuild(reason), 250);
}

function startWatcher() {
  try {
    watch(contentDir, { recursive: true }, (_event, filename) => {
      if (!filename) return;
      if (filename.startsWith(".")) return;
      console.log(`[content changed] ${filename} → rebuilding…`);
      scheduleBuild(filename);
    });
    console.log(`[watch] content/ (recursive)`);
  } catch (err) {
    console.warn(`[watch] could not watch content/ recursively: ${err.message}`);
  }
}

// ─── 3. decap-server (file backend for the admin UI) ──────────
function startDecapServer() {
  const cmd = process.platform === "win32" ? "npx.cmd" : "npx";
  const proc = spawn(cmd, ["decap-server"], {
    cwd: root,
    stdio: "inherit",
    shell: true,
  });
  proc.on("exit", (code) => {
    console.log(`[decap-server] exited with code ${code}`);
  });
  return proc;
}

// ─── 4. tiny static file server for admin/ + the portfolio ────
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
  ".pdf":  "application/pdf",
  ".pptx": "application/vnd.openxmlformats-officedocument.presentationml.presentation",
};

function startStatic() {
  const server = createServer(async (req, res) => {
    try {
      const url = decodeURIComponent((req.url ?? "/").split("?")[0]);
      let path = join(root, url === "/" ? "Ibrahim Portfolio.html" : url);
      const rel = relative(root, path);
      if (rel.startsWith("..")) {
        res.writeHead(403); res.end("forbidden"); return;
      }
      let st;
      try { st = await stat(path); } catch { res.writeHead(404); res.end("not found"); return; }
      if (st.isDirectory()) path = join(path, "index.html");
      const ext = "." + path.split(".").pop().toLowerCase();
      const body = await readFile(path);
      res.writeHead(200, {
        "content-type": MIME[ext] || "application/octet-stream",
        "cache-control": "no-store",
      });
      res.end(body);
    } catch (err) {
      res.writeHead(500); res.end(String(err));
    }
  });
  server.listen(STATIC_PORT, () => {
    console.log(`[static] http://localhost:${STATIC_PORT}/`);
    console.log(`[static] portfolio:  ${PORTFOLIO_URL}`);
    console.log(`[static] admin (CMS): ${ADMIN_URL}`);
  });
  return server;
}

// ─── main ──────────────────────────────────────────────────────
async function main() {
  await runBuild("initial");
  startWatcher();
  startDecapServer();
  startStatic();
  console.log("\nReady. Edit content in the admin UI; the portfolio will rebuild automatically.\n");
}

main().catch((err) => { console.error(err); process.exit(1); });
