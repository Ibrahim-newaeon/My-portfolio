import Anthropic from "@anthropic-ai/sdk";
import {
  EnrichedInputSchema,
  IntentSchema,
  type EnrichedInput,
  type Intent,
  type Complexity,
} from "./types.js";
import { deriveLocaleDefaults } from "./locale.js";

const ENRICHMENT_MODEL = "claude-haiku-4-5-20251001";

const SYSTEM = `You are a prompt-engineering analyst. Given a raw user request, return a single JSON object describing the request.

Required fields (no extras):
- goal: verb + object + outcome, ≤ 25 words.
- context: 2-4 sentences inferring stack, audience, environment, dependencies.
- intent: one of "greenfield_design" | "code_modification" | "bug_investigation" | "refactor" | "content_generation" | "analysis_only".
- complexity: one of "low" | "medium" | "high".
- constraints: 3-10 measurable constraints. Each is a complete sentence with a numeric threshold, named tool/path, or observable behavior. NEVER use phrases: "improve performance", "handle edge cases", "optimize code", "follow best practices", "as needed", "where appropriate", "make it better", "robust solution", "industry-standard", "modern approach".
- missing_data: gaps in stack, scale, geography, deployment target, hard constraints. Sorted lexicographically.
- conflicts: requirements that cannot all hold simultaneously (e.g. "offline-first" AND "sub-100ms global sync").

Rules:
- Output ONLY a JSON object. No code fences, no prose.
- Inferred facts must be wrapped "[ASSUMPTION] ..." inside missing_data or noted in context.
- Never invent client/company names not in the input.`;

export interface EnrichOptions {
  apiKey?: string | undefined;
  location?: string | undefined;
  industry?: string | undefined;
  language?: string | undefined;
}

export async function enrich(
  rawInput: string,
  opts: EnrichOptions,
): Promise<EnrichedInput> {
  const llm = opts.apiKey && opts.apiKey.trim().length > 0 ? await llmEnrich(rawInput, opts).catch(() => null) : null;
  if (llm) return finalize(llm, opts, "llm");
  return finalize(heuristicCore(rawInput), opts, "heuristic");
}

interface CoreShape {
  goal: string;
  context: string;
  intent: Intent;
  complexity: Complexity;
  constraints: string[];
  missing_data: string[];
  conflicts: string[];
}

function finalize(core: CoreShape, opts: EnrichOptions, source: "llm" | "heuristic"): EnrichedInput {
  const location_provided = Boolean(opts.location && opts.location.trim().length > 0);
  const { defaults, assumption } = deriveLocaleDefaults(opts);
  const missing_data = [...core.missing_data];
  if (assumption) missing_data.push(assumption);
  if (source === "heuristic") {
    missing_data.push(
      "[ASSUMPTION] Heuristic enrichment used (no Anthropic API key or LLM call failed).",
    );
  }
  const completeness_score = computeCompleteness(core, opts);
  const constraints = sortDedupTrim(core.constraints).slice(0, 10);
  while (constraints.length < 3) {
    constraints.push(
      `Run the type-checker and the full test suite after every material edit; treat any new diagnostic as a blocker (filler-${constraints.length}).`,
    );
  }
  const draft: EnrichedInput = {
    goal: core.goal.trim(),
    context: core.context.trim(),
    intent: core.intent,
    complexity: core.complexity,
    constraints,
    locale_defaults: defaults,
    missing_data: sortDedupTrim(missing_data),
    completeness_score,
    conflicts: sortDedupTrim(core.conflicts),
    source,
    location_provided,
  };
  return EnrichedInputSchema.parse(draft);
}

function computeCompleteness(core: CoreShape, opts: EnrichOptions): number {
  const text = (core.goal + " " + core.context + " " + core.constraints.join(" ")).toLowerCase();
  let matched = 0;
  if (/(node|typescript|python|react|next|express|fastify|django|rails|go\b|rust|java|kubernetes|postgres|mysql|redis|kafka|sqlite)/i.test(text)) matched++;
  if (/(\d+\s*(users?|rps|qps|req|tps|gb|tb|requests))/i.test(text) || /(scale|throughput|capacity|concurrent)/i.test(text)) matched++;
  if (opts.location && opts.location.trim().length > 0) matched++;
  if (/(deploy|docker|kubernetes|aws|gcp|azure|vercel|railway|fly\.io|heroku|on-prem|cloud)/i.test(text)) matched++;
  if (/(\$\d|\b\d+\s*(days?|weeks?|months?|hours?)|deadline|budget|team of \d|\d+\s*engineers?)/i.test(text)) matched++;
  return matched / 5;
}

async function llmEnrich(
  rawInput: string,
  opts: EnrichOptions,
): Promise<CoreShape | null> {
  const client = new Anthropic({ apiKey: opts.apiKey! });
  const userMsg = JSON.stringify({
    user_request: rawInput,
    location: opts.location ?? null,
    industry: opts.industry ?? null,
    language: opts.language ?? null,
  });
  const resp = await client.messages.create({
    model: ENRICHMENT_MODEL,
    max_tokens: 1500,
    system: SYSTEM,
    messages: [{ role: "user", content: userMsg }],
  });
  const text = resp.content.map((c) => (c.type === "text" ? c.text : "")).join("").trim();
  const json = stripFences(text);
  let parsed: unknown;
  try {
    parsed = JSON.parse(json);
  } catch {
    return null;
  }
  const obj = parsed as Record<string, unknown>;
  const intent = IntentSchema.safeParse(obj.intent);
  if (!intent.success) return null;
  const complexity = (obj.complexity === "low" || obj.complexity === "medium" || obj.complexity === "high") ? obj.complexity : "medium";
  const goal = typeof obj.goal === "string" ? obj.goal : "";
  const context = typeof obj.context === "string" ? obj.context : "";
  const constraints = Array.isArray(obj.constraints) ? (obj.constraints as unknown[]).filter((x): x is string => typeof x === "string") : [];
  const missing_data = Array.isArray(obj.missing_data) ? (obj.missing_data as unknown[]).filter((x): x is string => typeof x === "string") : [];
  const conflicts = Array.isArray(obj.conflicts) ? (obj.conflicts as unknown[]).filter((x): x is string => typeof x === "string") : [];
  if (!goal || !context) return null;
  return { goal, context, intent: intent.data, complexity, constraints, missing_data, conflicts };
}

function stripFences(s: string): string {
  return s.replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/i, "").trim();
}

function sortDedupTrim(arr: string[]): string[] {
  return Array.from(new Set(arr.map((s) => s.trim()).filter(Boolean))).sort((a, b) => a.localeCompare(b));
}

function heuristicCore(rawInput: string): CoreShape {
  const text = rawInput.trim();
  const lower = text.toLowerCase();
  const intent = detectIntent(lower);
  const complexity = detectComplexity(lower);
  const goal = buildGoal(text, intent);
  const context = buildContext(intent, complexity);
  const constraints = deriveConstraints(intent, complexity);
  const missing_data = deriveMissingData(lower);
  const conflicts = detectConflicts(lower);
  return { goal, context, intent, complexity, constraints, missing_data, conflicts };
}

function detectIntent(s: string): Intent {
  if (/(bug|broken|crash|error|fails?|regression|hotfix|not working|stack ?trace)/.test(s)) return "bug_investigation";
  if (/(refactor|cleanup|rewrite|migrat|simplif|extract|untangle|behavior[- ]preserving)/.test(s)) return "refactor";
  if (/(research|investigate|spike|explore|evaluate|compare|benchmark|analy[sz]e|audit|review)/.test(s) && !/(implement|build|add|fix)/.test(s)) return "analysis_only";
  if (/(write|draft|generate|compose|copy|article|blog|email|caption|brochure)/.test(s) && !/(code|api|service|app)/.test(s)) return "content_generation";
  if (/(build|design|architect|create|new|launch|greenfield|from scratch|saas|platform|system)/.test(s)) return "greenfield_design";
  if (/(add|update|change|modify|tweak|adjust|patch|extend)/.test(s)) return "code_modification";
  return "code_modification";
}

function detectComplexity(s: string): Complexity {
  const wordCount = s.split(/\s+/).filter(Boolean).length;
  const conjunctions = (s.match(/\b(and|plus|also|with|including|across|while)\b/g) || []).length;
  const heavySignals = /(distributed|multi-region|offline-first|real-time|high-throughput|hipaa|pci|gdpr|sox|fedramp|ml|llm|kubernetes|micro-?services?)/.test(s);
  if (heavySignals || wordCount > 40 || conjunctions >= 3) return "high";
  if (wordCount > 12 || conjunctions >= 1) return "medium";
  return "low";
}

function buildGoal(raw: string, intent: Intent): string {
  const trimmed = raw.replace(/\.$/, "");
  const verb: Record<Intent, string> = {
    greenfield_design: "Design and ship",
    code_modification: "Modify",
    bug_investigation: "Diagnose and fix",
    refactor: "Restructure",
    content_generation: "Produce",
    analysis_only: "Analyze",
  };
  return `${verb[intent]}: ${trimmed}.`;
}

function buildContext(intent: Intent, complexity: Complexity): string {
  return `Inferred from raw input only. Intent classified as ${intent}; complexity estimated ${complexity}. No stack, repository, or owner specified — implementer must confirm before changing shared code.`;
}

function deriveConstraints(intent: Intent, complexity: Complexity): string[] {
  const base: string[] = [
    "Compile under strict type-checking with zero new diagnostics; report counts before and after.",
    "Do not introduce new runtime dependencies without naming the package, version, and 1-line justification.",
    "Preserve all existing public API signatures unless the task explicitly authorizes a break.",
  ];
  if (intent === "bug_investigation")
    base.push("Reproduce deterministically with a failing test before fixing; the test must fail on pre-fix code and pass on post-fix code.");
  if (intent === "refactor")
    base.push("Behavior must remain identical: the existing test suite must stay green and a recorded golden-output diff must be empty.");
  if (intent === "code_modification")
    base.push("Cover the happy path and at least one error path with automated tests; report coverage before and after as percentages.");
  if (intent === "greenfield_design")
    base.push("Deliver a vertical slice end-to-end (UI → API → store) with a smoke test that exits 0.");
  if (intent === "content_generation")
    base.push("Output passes a format check (schema or word-count) and a factuality check (every claim has a cited source).");
  if (intent === "analysis_only")
    base.push("Cite primary sources by URL or file:line for every finding; no edits or commits.");
  if (complexity === "high")
    base.push("Stage delivery behind a feature flag with an explicit rollback step in ≤ 5 minutes.");
  return base;
}

function deriveMissingData(s: string): string[] {
  const gaps: string[] = [];
  if (!/(node|typescript|python|react|next|express|fastify|django|rails|go\b|rust|java)/i.test(s))
    gaps.push("[ASSUMPTION] Tech stack not specified.");
  if (!/(\d+\s*(users?|rps|qps|req|tps))/i.test(s) && !/(scale|throughput|capacity|concurrent)/i.test(s))
    gaps.push("[ASSUMPTION] Scale and throughput not specified.");
  if (!/(deploy|docker|kubernetes|aws|gcp|azure|vercel|railway|on-prem|cloud)/i.test(s))
    gaps.push("[ASSUMPTION] Deployment target not specified.");
  if (!/(deadline|budget|team of \d|\d+\s*(days?|weeks?|months?))/i.test(s))
    gaps.push("[ASSUMPTION] Timeline, budget, and team-size constraints not specified.");
  return gaps;
}

function detectConflicts(s: string): string[] {
  const out: string[] = [];
  if (/offline.first/.test(s) && /(sub-?100\s*ms|real-?time)\s*(global|world)/.test(s))
    out.push("offline-first storage conflicts with sub-100ms global sync target.");
  if (/(no third-?party|on-?prem|self-?hosted)/.test(s) && /(stripe|auth0|sendgrid|twilio|firebase)/.test(s))
    out.push("self-hosted requirement conflicts with named third-party SaaS dependency.");
  return out;
}
