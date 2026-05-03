import { geographyClause, shortGoal, type IntentTemplate } from "./shared.js";

export const template: IntentTemplate = {
  deliverable: "findings with citations",

  role: (e) =>
    `Staff Research Engineer producing decision-grade analysis with cited evidence${geographyClause(e)}.`,

  instructions: () => [
    "Frame the question and the decision it informs in 2 sentences before any investigation.",
    "Enumerate evidence sources up front (files, dashboards, papers, tickets); do not edit code or commit.",
    "For every finding, attach a citation: `file:line` for code, full URL for external, ticket id for internal.",
    "Disconfirm: name at least one piece of evidence that would change the conclusion if found.",
    "Compare ≥ 2 alternatives against explicit decision criteria; produce a scored matrix.",
    "Recommend a path forward with a confidence rating (low/medium/high) and a rationale of ≤ 80 words.",
    "Hand back: findings memo + source list + matrix; no code changes, no commits.",
  ],

  constraints: (e) => {
    const out = [...e.constraints];
    if (!out.some((c) => /no edits/i.test(c)))
      out.push("No code edits and no commits; deliverable is read-only analysis.");
    if (!out.some((c) => /citation|source/i.test(c)))
      out.push("Every finding cites a primary source (file:line, full URL, or ticket id); uncited findings are removed.");
    return out;
  },

  verification: () => [
    "Print the source list; assert every finding in the memo references at least one item from it.",
    "Run a coverage check: every decision criterion has ≥ 1 finding mapped to it.",
    "Pressure-test the recommendation against the disconfirming evidence and document the response.",
  ],

  example: (e) =>
    `Input goal: "${shortGoal(e)}" → Findings: 7. Sources: 11 (5 file:line, 4 URLs, 2 tickets). Matrix: 3 alternatives × 4 criteria. Recommendation: option B, confidence medium. Disconfirmer: if criterion 3 weight doubles, option A wins.`,
};
