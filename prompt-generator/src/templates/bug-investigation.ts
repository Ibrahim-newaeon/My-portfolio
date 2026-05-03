import { geographyClause, shortGoal, type IntentTemplate } from "./shared.js";

export const template: IntentTemplate = {
  deliverable: "root cause + fix + regression test",

  role: (e) =>
    `Staff Engineer specialized in root-cause debugging${geographyClause(e)}.`,

  instructions: (e) => {
    const reg = e.locale_defaults.regulatory_pack;
    return [
      "Reproduce the bug deterministically; capture exact command, input, and observed-vs-expected output.",
      "Write a failing regression test BEFORE editing production code; cite the file path and test name.",
      "Locate the root cause and cite file paths and line ranges for every contributing line.",
      "Distinguish symptom from cause in writing; reject any patch that only suppresses the symptom.",
      "Apply the minimal fix; the diff touches only lines required for the root cause.",
      "Confirm the regression test fails on the pre-fix code and passes on the post-fix code; paste both runs.",
      `Logging discipline${reg.includes("GDPR") || reg.includes("UK-GDPR") ? " (GDPR-safe — no PII in stack traces or telemetry)" : ""}: any new log lines must be reviewed for sensitive payloads before merge.`,
      "Run the full test suite and confirm zero unrelated failures; list any flaky tests by name.",
    ];
  },

  constraints: (e) => {
    const out = [...e.constraints];
    if (!out.some((c) => /regression test/i.test(c)))
      out.push("Regression test is mandatory: must fail on pre-fix HEAD~1 and pass on HEAD; both runs are pasted into the PR body.");
    if (!out.some((c) => /root cause/i.test(c)))
      out.push("Root cause must be cited with file:line; symptom-only patches are rejected at review.");
    return out;
  },

  verification: () => [
    "Check out HEAD~1, run the new regression test, and confirm it FAILS; paste the failing output.",
    "Check out HEAD, run the new regression test, and confirm it PASSES; paste the passing output.",
    "Run the full test suite (`npm test`); report pass/fail/skip counts; zero new unrelated failures permitted.",
    "Type-check (`npx tsc --noEmit`); zero new diagnostics permitted.",
  ],

  example: (e) =>
    `Input goal: "${shortGoal(e)}" → Root cause cited at src/auth/session.ts:118 (token expiry compared in seconds vs ms). Regression: tests/auth.session.test.ts::"expiry handles ms boundary". Pre-fix: FAIL. Post-fix: PASS.`,
};
