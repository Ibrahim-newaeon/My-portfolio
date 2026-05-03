import { geographyClause, shortGoal, type IntentTemplate } from "./shared.js";

export const template: IntentTemplate = {
  deliverable: "structured artifact",

  role: (e) =>
    `Senior content strategist producing structured, fact-checkable artifacts in ${e.locale_defaults.language}${geographyClause(e)}.`,

  instructions: (e) => [
    `Produce the artifact in ${e.locale_defaults.language}; numeric values must follow ${e.locale_defaults.currency_format} and dates ${e.locale_defaults.date_format}.`,
    "Define the output schema first (sections, word ranges per section, required fields) and confirm with the user before writing.",
    "Every factual claim must include an inline citation `[source: <url|file:line>]`; uncited claims are flagged for review.",
    "Avoid filler phrases; each sentence asserts one fact, instruction, or argument.",
    "Run a format check: word counts per section within ±10% of target; no orphan headings.",
    "Run a factuality check: enumerate every claim and its citation; missing citations block delivery.",
    "Produce a one-paragraph summary (≤ 80 words) suitable for a TL;DR slot.",
  ],

  constraints: (e) => {
    const out = [...e.constraints];
    if (!out.some((c) => /citation/i.test(c)))
      out.push("Every factual claim carries an inline citation [source: ...]; uncited claims are removed before delivery.");
    if (!out.some((c) => /word count|word-count|format check/i.test(c)))
      out.push("Each section is within ±10% of its target word count; report actual vs. target counts in delivery notes.");
    if (e.locale_defaults.language && e.locale_defaults.language !== "en-US")
      out.push(`User-facing strings localized to ${e.locale_defaults.language}; keep machine-readable keys in English.`);
    return out;
  },

  verification: () => [
    "Run a format-check script: count words per section and assert each is within ±10% of target; print the table.",
    "Run a citation-check: every paragraph containing a numeric claim or a named entity must reference [source: ...]; list violations.",
    "Run a readability pass (Flesch-Kincaid or equivalent); report grade level; flag if outside the requested range.",
    "Produce a delivery note listing claim → citation pairs for the reviewer.",
  ],

  example: (e) =>
    `Input goal: "${shortGoal(e)}" → Schema: {hero ≤80w, body 600-800w, FAQ 6 Q/A}. Citations: 14/14 covered. Format check: 712 words in body (target 700, within ±10%). TL;DR drafted at 74 words.`,
};
