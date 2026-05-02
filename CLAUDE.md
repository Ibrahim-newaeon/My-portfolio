# Ibrahim Abed Rabboh — Portfolio

Single-page React portfolio site for Ibrahim Abed Rabboh (Marketing Director · Google Premier Partner). No build step — runs React via `@babel/standalone` directly in the browser.

## Architecture

- **`Ibrahim Portfolio.html`** — single entry. Loads React/ReactDOM/Babel UMD bundles, then `portfolio-data.js`, then each `portfolio-*.jsx` and `tweaks-panel.jsx` via `<script type="text/babel">` (transpiled at runtime).
- **`portfolio-data.js`** — sets `window.PORTFOLIO_DATA` (single source of truth for copy, metrics, case studies). **Generated** by `tools/build-data.mjs` from the JSON files under `content/` — do not hand-edit; edit the source JSON instead.
- **`content/*.json`** — canonical content (meta, hero, authority, live-strip, about, contact, skills, commands, deep-case) plus `content/case-studies/*.json` (one file per card). The Decap CMS edits these.
- **`admin/`** — Decap CMS host page (`index.html`) + `config.yml` describing the editable schema for every JSON file.
- **`tools/build-data.mjs`** — JSON → `portfolio-data.js` compiler (no deps, Node built-ins only).
- **`tools/cms.mjs`** — local content editor: runs `decap-server` (file backend), a `fs.watch` on `content/` that triggers `build-data.mjs` on every change, and a static HTTP server on `:8000` so the admin UI and the portfolio can both load over HTTP (Decap won't run on `file://`).
- **`prompt-generator/`** — TypeScript backend (Express + Anthropic SDK) for the Prompt Generator section; unrelated to the CMS.
- **`portfolio-common.jsx`** — shared primitives (`Counter`, `Reveal`, `useCountUp`); attached to `window` so other JSX files can use them without imports.
- **`portfolio-hero.jsx` / `-nav.jsx` / `-work.jsx` / `-bits.jsx` / `-parts1/2/3.jsx`** — section components. They read `window.PORTFOLIO_DATA` (`const D = window.PORTFOLIO_DATA`) and rely on the globals from `portfolio-common.jsx`.
- **`tweaks-panel.jsx`** — design-tweaks UI. Talks to a host via `postMessage` (`__activate_edit_mode` / `__edit_mode_*`) so the design panel can override tokens at runtime.
- **`portfolio.css`** — all styling. Uses `data-theme` / `data-accent` / `data-density` on `<html>` for theming (set in the HTML's opening tag).

## Working in this project

- The portfolio itself runs in the browser with no bundler — Babel transpiles JSX live. You can still open `Ibrahim Portfolio.html` directly via `file://` for a quick look, but the CMS only works over HTTP.
- Two npm packages exist (root `package.json` for the CMS tooling, `prompt-generator/package.json` for the prompt-generator backend); the page itself has no build step.
- Babel transpiles JSX in the browser, so syntax errors only show in the browser console — check it after edits.
- JSX files share a global scope; don't `import`/`export`. Use `window.X` for cross-file access (matches how `Counter`, `Reveal`, `PORTFOLIO_DATA` are wired).
- Asset folders: `screenshots/` (design references for sections), `scraps/` (sketches), `uploads/` (resume PDF, pitch deck).

## Conventions

- **Content edits → JSON files under `content/`** (or use the CMS at `/admin/`). Never edit `portfolio-data.js` directly — it gets overwritten on the next build. Component/markup edits → the relevant `portfolio-*.jsx`. Styling → `portfolio.css`.
- Keep the HTML entry minimal — new sections should be new JSX files mounted from there, not inlined.

## Editing content (CMS)

- `npm install` once (root) to get `decap-server` as a devDep.
- `npm run cms` — starts decap-server, watcher, and a static server on `:8000`. Open `http://localhost:8000/admin/` to edit; the portfolio at `http://localhost:8000/Ibrahim%20Portfolio.html` auto-rebuilds when content is saved.
- `npm run build:data` — one-shot rebuild of `portfolio-data.js` from `content/` (used in CI / before commit).
- For non-local editing the same admin UI works against GitHub once an OAuth proxy is configured (see `prompt-generator/server.ts` as the natural place to host it). Until then, edit locally and push.
