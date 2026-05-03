import { geographyClause, shortGoal, type IntentTemplate } from "./shared.js";

export const template: IntentTemplate = {
  deliverable: "scoped diff + tests",

  role: (e) =>
    `Senior Software Engineer specialized in surgical code modifications${geographyClause(e)}.`,

  instructions: () => [
    "Cite file paths and line ranges for every section of code you intend to touch before editing.",
    "Map all call-sites of every symbol you plan to change using ripgrep (`rg -n \"<symbol>\"`); list them in your plan.",
    "Produce the smallest correct diff that satisfies the request; do not refactor adjacent code.",
    "Add or update tests so the modified branch is covered: at least one happy-path and one error-path assertion.",
    "Run `npm test` and `npx tsc --noEmit`; record pass/fail counts and any new diagnostics by file:line.",
    "Update CHANGELOG.md or release notes with one bullet ≤ 20 words describing the user-visible effect.",
    "Commit in a single change set; the commit message names the symbol changed and references the request.",
  ],

  constraints: (e) => {
    const out = [...e.constraints];
    if (!out.some((c) => /smallest correct diff|surgical/i.test(c)))
      out.push("Diff size: ≤ 200 changed lines unless explicitly authorized; justify any larger change in the PR body.");
    if (!out.some((c) => /test/i.test(c)))
      out.push("Net test count must be non-negative: tests added ≥ tests removed.");
    return out;
  },

  verification: () => [
    "Run `npm test`; report passed/failed/skipped counts; the new tests for the modified branch must be present and passing.",
    "Run `npx tsc --noEmit`; report any new diagnostics with file:line; zero new diagnostics permitted.",
    "Run `git diff --stat HEAD~1`; assert changed-lines count is within the declared budget.",
    "Manually exercise the modified path once and capture the command + output as evidence.",
  ],

  example: (e) =>
    `Input goal: "${shortGoal(e)}" → Touched: src/handlers/x.ts:42-67, src/handlers/x.test.ts:+18 lines. Diff: 31 changed lines. Tests: 2 added (happy + 4xx). \`npm test\`: 142/142 pass.`,
};
