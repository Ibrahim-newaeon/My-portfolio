import { geographyClause, shortGoal, type IntentTemplate } from "./shared.js";

export const template: IntentTemplate = {
  deliverable: "before/after structure + behavior tests",

  role: (e) =>
    `Staff Engineer with codebase-evolution and behavior-preserving refactor expertise${geographyClause(e)}.`,

  instructions: () => [
    "Capture a before/after structure sketch: list every file moved, renamed, or split with file paths and line counts.",
    "Cite file paths and line ranges for every edited symbol; rename without semantic change is permitted, semantic change is not.",
    "Map every consumer with ripgrep (`rg -n \"<symbol>\"`); commit the call-site map to PR description before editing.",
    "Stage the refactor in individually-revertable commits, one concern per commit; each commit must keep the suite green.",
    "Behavior-preserving check: record the existing test suite output, refactor, then diff the new output — the diff must be empty.",
    "If a public API signature changes, ship a deprecation shim and a one-version migration note in /docs/migrations/.",
    "Run `npm test` and `npx tsc --noEmit` after every commit; abort the refactor if either regresses.",
  ],

  constraints: (e) => {
    const out = [...e.constraints];
    if (!out.some((c) => /behavior-preserving/i.test(c)))
      out.push("Refactor must be behavior-preserving: existing test suite passes unchanged; no new test failures permitted.");
    if (!out.some((c) => /commits/i.test(c)))
      out.push("Each commit is independently revertable: `git revert <sha>` leaves the tree green.");
    return out;
  },

  verification: () => [
    "Run the full test suite at HEAD~N (pre-refactor) and HEAD (post-refactor); diff the outputs and assert they match.",
    "Run `npx tsc --noEmit` at HEAD; report zero new diagnostics versus pre-refactor.",
    "Iterate `git rebase -x 'npm test' HEAD~N..HEAD` and confirm every commit passes (no broken intermediate states).",
    "Inspect `git diff --stat HEAD~N..HEAD` and verify only the refactor scope is touched.",
  ],

  example: (e) =>
    `Input goal: "${shortGoal(e)}" → Before: src/api/handlers.ts (1,240 lines, 18 exports). After: src/api/handlers/{user,order,billing}.ts (3 files, 412+388+440 lines). Suite: 312/312 unchanged. tsc: 0 new diagnostics.`,
};
