import type { EnrichedInput, Intent } from "./types.js";

export function generatePrompt(rawInput: string, e: EnrichedInput): string {
  const sections = [
    renderRole(e),
    renderContext(rawInput, e),
    renderInstructions(e),
    renderMethodology(),
    renderVerification(e),
    renderConstraints(e),
    renderGuardrails(e),
    renderOutputFormat(e),
  ];
  return `<mega_prompt>\n\n${sections.join("\n\n")}\n\n</mega_prompt>\n`;
}

function renderRole(e: EnrichedInput): string {
  return `<role>\nYou are a ${e.role}. You operate with the rigor of a senior engineer who is paid to be correct, not fast. You bias toward small, verifiable steps and refuse to fabricate behavior you cannot cite from the code or the user's input.\n</role>`;
}

function renderContext(rawInput: string, e: EnrichedInput): string {
  return [
    `<context>`,
    `Raw user input: "${escapeXml(rawInput)}"`,
    ``,
    `Goal: ${e.goal}`,
    ``,
    `Inferred context: ${e.context}`,
    ``,
    `Detected intent: ${e.intent} · Complexity: ${e.complexity} · Enrichment source: ${e.source}`,
    `</context>`,
  ].join("\n");
}

function renderInstructions(e: EnrichedInput): string {
  const tasks = buildTaskList(e);
  const items = tasks.map((t, i) => `${i + 1}. ${t}`).join("\n");
  return `<instructions>\n${items}\n</instructions>`;
}

function buildTaskList(e: EnrichedInput): string[] {
  const intent = e.intent;
  const tasks: string[] = [];

  if (intent === "bug") {
    tasks.push(
      "Reproduce the failure deterministically before changing any code.",
      "Identify the root cause; do not patch the symptom.",
      "Implement the minimal correct fix.",
      "Add a regression test that fails on the pre-fix code and passes after.",
    );
  } else if (intent === "refactor") {
    tasks.push(
      "Map every consumer and call-site of the code under refactor.",
      "Define the target shape and migration path before editing.",
      "Refactor in small, individually-revertable commits.",
      "Verify behavior is unchanged via the existing test suite.",
    );
  } else if (intent === "system") {
    tasks.push(
      "Capture functional and non-functional requirements explicitly.",
      "Produce an architecture sketch covering components, data flow, and failure modes.",
      "Document trade-offs and the rejected alternatives.",
      "Identify the smallest first slice that proves the system end-to-end.",
    );
  } else if (intent === "research") {
    tasks.push(
      "Frame the research question and the decision it informs.",
      "Survey existing solutions; cite primary sources.",
      "Evaluate options against the explicit decision criteria.",
      "Recommend a path forward with a confidence rating.",
    );
  } else {
    tasks.push(
      "Decompose the request into independently testable units.",
      "Define acceptance criteria before writing implementation code.",
      "Implement the minimal vertical slice end-to-end first.",
      "Iterate to fill in edge cases and polish.",
    );
  }

  for (const hint of e.executionHints) tasks.push(hint);
  return tasks;
}

function renderMethodology(): string {
  return [
    `<methodology>`,
    `1. Explore — read the relevant code; enumerate call-sites, owners, and assumptions.`,
    `2. Plan — write the change plan as an ordered list of files and the diffs you will apply.`,
    `3. Implement — apply the plan; commit incrementally; never bundle unrelated changes.`,
    `4. Verify — run tests, lint, and type-check; demonstrate the change with a concrete artifact (test output, screenshot, or log line).`,
    `</methodology>`,
  ].join("\n");
}

function renderVerification(e: EnrichedInput): string {
  const steps = buildVerificationSteps(e.intent);
  const items = steps.map((s, i) => `${i + 1}. ${s}`).join("\n");
  return `<verification>\n${items}\n</verification>`;
}

function buildVerificationSteps(intent: Intent): string[] {
  const steps: string[] = [
    "Run the full test suite; report pass/fail counts and any flaky tests by name.",
    "Run the type-checker and linter; resolve every new diagnostic before claiming completion.",
  ];
  if (intent === "bug")
    steps.push(
      "Confirm the regression test fails on the pre-fix code and passes on the post-fix code.",
    );
  if (intent === "feature")
    steps.push(
      "Exercise the happy path manually and capture proof (HTTP log, screenshot, or recorded command output).",
    );
  if (intent === "refactor")
    steps.push(
      "Diff behavior against a recorded golden output; the difference must be empty.",
    );
  if (intent === "system")
    steps.push(
      "Walk a worked example end-to-end against the architecture sketch and identify the failure mode for each component.",
    );
  if (intent === "research")
    steps.push(
      "Pressure-test the recommendation against at least one credible counter-position.",
    );
  steps.push(
    "List residual risks and what is explicitly out of scope, so reviewers can verify scope discipline.",
  );
  return steps;
}

function renderConstraints(e: EnrichedInput): string {
  const items = e.constraints.map((c) => `- ${c}`).join("\n");
  return `<constraints>\n${items}\n</constraints>`;
}

function renderGuardrails(e: EnrichedInput): string {
  const ass =
    e.assumptions.length > 0
      ? e.assumptions.map((a) => `    - ${a}`).join("\n")
      : "    - None.";
  return [
    `<guardrails>`,
    `  <evidence_policy>Cite the file path and line range for every claim about the codebase. Never fabricate APIs, behavior, or test results.</evidence_policy>`,
    `  <assumptions>`,
    `${ass}`,
    `  </assumptions>`,
    `  <verification_rules>Every change must be accompanied by an executable verification step (a test, a command, or a recorded artifact) before it is reported as complete.</verification_rules>`,
    `  <uncertainty_handling>If required inputs are missing, return missing_data with a list of the specific gaps; do not invent answers.</uncertainty_handling>`,
    `  <tool_usage>Prefer ripgrep/Grep for search, Read for files, Edit for in-place changes; avoid destructive shell commands without explicit user authorization.</tool_usage>`,
    `</guardrails>`,
  ].join("\n");
}

function renderOutputFormat(e: EnrichedInput): string {
  const artifact =
    e.intent === "system"
      ? "design artifacts (architecture sketch, ADR, sequence diagram)"
      : e.intent === "research"
        ? "a recommendation memo with cited sources"
        : "the smallest correct diff or new code";
  return [
    `<output_format>`,
    `Return:`,
    `1. A summary of changes (≤ 5 bullets, each ≤ 20 words).`,
    `2. ${artifact}, scoped to the task only.`,
    `3. Verification evidence (test output, command result, or screenshot).`,
    `4. Any residual TODOs labeled [TODO], with owners or follow-up tickets.`,
    `</output_format>`,
  ].join("\n");
}

function escapeXml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
