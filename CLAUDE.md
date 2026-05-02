# Ibrahim Abed Rabboh — Portfolio

Single-page React portfolio site for Ibrahim Abed Rabboh (Marketing Director · Google Premier Partner). No build step — runs React via `@babel/standalone` directly in the browser.

## Architecture

- **`Ibrahim Portfolio.html`** — single entry. Loads React/ReactDOM/Babel UMD bundles, then `portfolio-data.js`, then each `portfolio-*.jsx` and `tweaks-panel.jsx` via `<script type="text/babel">` (transpiled at runtime).
- **`portfolio-data.js`** — sets `window.PORTFOLIO_DATA` (single source of truth for copy, metrics, case studies). Edit this for content changes; do not duplicate data into JSX.
- **`portfolio-common.jsx`** — shared primitives (`Counter`, `Reveal`, `useCountUp`); attached to `window` so other JSX files can use them without imports.
- **`portfolio-hero.jsx` / `-nav.jsx` / `-work.jsx` / `-bits.jsx` / `-parts1/2/3.jsx`** — section components. They read `window.PORTFOLIO_DATA` (`const D = window.PORTFOLIO_DATA`) and rely on the globals from `portfolio-common.jsx`.
- **`tweaks-panel.jsx`** — design-tweaks UI. Talks to a host via `postMessage` (`__activate_edit_mode` / `__edit_mode_*`) so the design panel can override tokens at runtime.
- **`portfolio.css`** — all styling. Uses `data-theme` / `data-accent` / `data-density` on `<html>` for theming (set in the HTML's opening tag).

## Working in this project

- No package manager, no bundler, no tests. Open `Ibrahim Portfolio.html` in a browser to preview.
- Babel transpiles JSX in the browser, so syntax errors only show in the browser console — check it after edits.
- JSX files share a global scope; don't `import`/`export`. Use `window.X` for cross-file access (matches how `Counter`, `Reveal`, `PORTFOLIO_DATA` are wired).
- Asset folders: `screenshots/` (design references for sections), `scraps/` (sketches), `uploads/` (resume PDF, pitch deck).

## Conventions

- Content edits → `portfolio-data.js`. Component/markup edits → the relevant `portfolio-*.jsx`. Styling → `portfolio.css`.
- Keep the HTML entry minimal — new sections should be new JSX files mounted from there, not inlined.
