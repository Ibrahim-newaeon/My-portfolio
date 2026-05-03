import type { EnrichedInput, Intent } from "./types.js";
import type { IntentTemplate } from "./templates/shared.js";
import { template as greenfield } from "./templates/greenfield-design.js";
import { template as codemod } from "./templates/code-modification.js";
import { template as bug } from "./templates/bug-investigation.js";
import { template as refactor } from "./templates/refactor.js";
import { template as content } from "./templates/content-generation.js";
import { template as analysis } from "./templates/analysis-only.js";

const TEMPLATES: Record<Intent, IntentTemplate> = {
  greenfield_design: greenfield,
  code_modification: codemod,
  bug_investigation: bug,
  refactor: refactor,
  content_generation: content,
  analysis_only: analysis,
};

export type SectionKey =
  | "role"
  | "context"
  | "instructions"
  | "methodology"
  | "verification"
  | "constraints"
  | "guardrails"
  | "locale_aware_defaults"
  | "tool_usage"
  | "example"
  | "self_check"
  | "output_format";

export const SECTION_ORDER: SectionKey[] = [
  "role",
  "context",
  "instructions",
  "methodology",
  "verification",
  "constraints",
  "guardrails",
  "locale_aware_defaults",
  "tool_usage",
  "example",
  "self_check",
  "output_format",
];

export interface GeneratedSections {
  role: string;
  context: string;
  instructions: string;
  methodology: string;
  verification: string;
  constraints: string;
  guardrails: string;
  locale_aware_defaults: string;
  tool_usage: string;
  example: string;
  self_check: string;
  output_format: string;
}

export function generateSections(rawInput: string, e: EnrichedInput): GeneratedSections {
  const tpl = TEMPLATES[e.intent];
  return {
    role: renderRole(tpl, e),
    context: renderContext(rawInput, e, tpl),
    instructions: renderInstructions(tpl.instructions(e)),
    methodology: renderMethodology(),
    verification: renderVerification(tpl.verification(e)),
    constraints: renderConstraints(tpl.constraints(e)),
    guardrails: renderGuardrails(e),
    locale_aware_defaults: renderLocale(e),
    tool_usage: renderToolUsage(),
    example: renderExample(tpl.example(e)),
    self_check: renderSelfCheck(),
    output_format: renderOutputFormat(tpl, e),
  };
}

export function regenerateSection(
  key: SectionKey,
  rawInput: string,
  e: EnrichedInput,
): string {
  const all = generateSections(rawInput, e);
  return all[key];
}

export function assembleXml(sections: GeneratedSections): string {
  const parts = SECTION_ORDER.map((k) => sections[k]);
  return `<mega_prompt version="2.3">\n\n${parts.join("\n\n")}\n\n</mega_prompt>\n`;
}

export function wrapCdata(xml: string): string {
  return `<![CDATA[${xml}]]>`;
}

export function generatePrompt(rawInput: string, e: EnrichedInput): string {
  return assembleXml(generateSections(rawInput, e));
}

function renderRole(tpl: IntentTemplate, e: EnrichedInput): string {
  return `<role>\n${tpl.role(e)} You bias toward small verifiable steps and refuse to fabricate behavior you cannot derive from input.\n</role>`;
}

function renderContext(rawInput: string, e: EnrichedInput, tpl: IntentTemplate): string {
  return [
    `<context>`,
    `Raw user input: "${escapeXml(rawInput)}"`,
    ``,
    `Goal: ${e.goal}`,
    `Inferred context: ${e.context}`,
    `Detected intent: ${e.intent} · Complexity: ${e.complexity} · Deliverable shape: ${tpl.deliverable}`,
    `Enrichment source: ${e.source} · completeness_score: ${e.completeness_score.toFixed(2)}`,
    `</context>`,
  ].join("\n");
}

function renderInstructions(steps: string[]): string {
  const items = steps.map((s, i) => `${i + 1}. ${s}`).join("\n");
  return `<instructions>\n${items}\n</instructions>`;
}

function renderMethodology(): string {
  return [
    `<methodology>`,
    `1. Explore — read the relevant code, docs, and inputs; enumerate call-sites, owners, and assumptions.`,
    `2. Plan — write the change plan as an ordered list of files, diffs, and verification steps.`,
    `3. Implement — apply the plan; commit incrementally; never bundle unrelated changes.`,
    `4. Verify — run tests, type-check, and the executable verification steps below; cite evidence.`,
    `</methodology>`,
  ].join("\n");
}

function renderVerification(steps: string[]): string {
  const items = steps.map((s, i) => `${i + 1}. ${s}`).join("\n");
  return `<verification>\n${items}\n</verification>`;
}

function renderConstraints(constraints: string[]): string {
  const sorted = [...new Set(constraints.map((c) => c.trim()))]
    .sort((a, b) => a.localeCompare(b))
    .slice(0, 10);
  const items = sorted.map((c) => `- ${c}`).join("\n");
  return `<constraints>\n${items}\n</constraints>`;
}

function renderGuardrails(e: EnrichedInput): string {
  const md = e.missing_data.length > 0
    ? e.missing_data.map((a) => `    - ${a}`).join("\n")
    : "    - None.";
  return [
    `<guardrails>`,
    `  <evidence_policy>Use only verifiable, input-derived logic. No fabricated APIs, paths, regulations, or test results.</evidence_policy>`,
    `  <assumptions>`,
    `${md}`,
    `  </assumptions>`,
    `  <verification_rules>Every change is accompanied by an executable verification step (test, command, recorded artifact) before completion is reported.</verification_rules>`,
    `  <uncertainty_handling>Insufficient input → return missing_data with specific gaps; never invent.</uncertainty_handling>`,
    `</guardrails>`,
  ].join("\n");
}

function renderLocale(e: EnrichedInput): string {
  const ld = e.locale_defaults;
  return [
    `<locale_aware_defaults>`,
    `  <currency>${ld.currency}</currency>`,
    `  <currency_format>${ld.currency_format}</currency_format>`,
    `  <date_format>${ld.date_format}</date_format>`,
    `  <language>${ld.language}</language>`,
    `  <regulatory_pack>${ld.regulatory_pack.join(", ") || "(none)"}</regulatory_pack>`,
    `  <industry_overlay>${ld.industry_overlay.join(", ") || "(none)"}</industry_overlay>`,
    `</locale_aware_defaults>`,
  ].join("\n");
}

function renderToolUsage(): string {
  return [
    `<tool_usage>`,
    `- Prefer ripgrep / Grep for search; Read for files; Edit for in-place changes.`,
    `- No destructive shell (\`rm -rf\`, force-push, drop table) without explicit user authorization.`,
    `- Network calls require an [ASSUMPTION] tag describing endpoint + auth model.`,
    `- Long-running tasks must report progress every N steps.`,
    `</tool_usage>`,
  ].join("\n");
}

function renderExample(body: string): string {
  return `<example>\n${body}\n</example>`;
}

function renderSelfCheck(): string {
  return [
    `<self_check>`,
    `Before returning, verify each:`,
    `[ ] All required sections present in canonical order`,
    `[ ] Every constraint is measurable (named tool, numeric threshold, observable behavior)`,
    `[ ] Verification has ≥ 3 executable steps`,
    `[ ] Every inferred fact carries [ASSUMPTION]`,
    `[ ] No phrases from the anti-generic list`,
    `[ ] Output matches the declared output_format`,
    `</self_check>`,
  ].join("\n");
}

function renderOutputFormat(tpl: IntentTemplate, e: EnrichedInput): string {
  return [
    `<output_format>`,
    `Return:`,
    `1. A summary (≤ 5 bullets, each ≤ 20 words) of changes or findings.`,
    `2. ${tpl.deliverable}, scoped to the task only.`,
    `3. Verification evidence (test output, command result, or screenshot).`,
    `4. Residual TODOs labeled [TODO] with owners or follow-up tickets.`,
    e.complexity === "high" ? `5. A <thinking> block covering: what is asked, what is underspecified, viable approaches with tradeoffs, chosen approach + rationale.` : null,
    `</output_format>`,
  ].filter(Boolean).join("\n");
}

function escapeXml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
