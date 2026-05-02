import Anthropic from "@anthropic-ai/sdk";
import {
  EnrichedInputSchema,
  type EnrichedInput,
  type Intent,
  type Complexity,
} from "./types.js";

const ENRICHMENT_MODEL = "claude-haiku-4-5-20251001";

const SYSTEM = `You are a prompt-engineering analyst. Given a raw user request for a software task, return a single JSON object describing the request in a structured way.

Required fields (all required, no extras):
- goal: one sentence (≤ 25 words) restating the desired outcome.
- context: 2-4 sentences inferring stack, audience, environment, and dependencies from the input.
- constraints: 3-6 specific constraints (testing, performance, scope, security, compatibility). Each constraint is a complete sentence and includes a measurable or behavioral criterion when possible.
- intent: one of "feature" | "bug" | "refactor" | "system" | "research".
- complexity: one of "low" | "medium" | "high".
- role: a short string naming the ideal expert role (e.g. "Senior TypeScript engineer specializing in distributed queues").
- executionHints: 3-5 concrete execution hints (specific files to touch, commands to run, patterns to apply).
- assumptions: array of explicit assumptions you are making, each prefixed "[ASSUMPTION] ".

Rules:
- Output ONLY a JSON object. No code fences, no prose, no comments.
- Do not invent client/company names that were not in the input.
- If the input is too vague to fill a field with substance, write "[ASSUMPTION] ..." and reflect the gap honestly.`;

export async function enrich(
  rawInput: string,
  apiKey: string | undefined,
): Promise<EnrichedInput> {
  if (apiKey && apiKey.trim().length > 0) {
    const llmResult = await llmEnrich(rawInput, apiKey).catch(() => null);
    if (llmResult) return llmResult;
  }
  return heuristicEnrich(rawInput);
}

async function llmEnrich(
  rawInput: string,
  apiKey: string,
): Promise<EnrichedInput | null> {
  const client = new Anthropic({ apiKey });
  const resp = await client.messages.create({
    model: ENRICHMENT_MODEL,
    max_tokens: 1200,
    system: SYSTEM,
    messages: [{ role: "user", content: rawInput }],
  });

  const text = resp.content
    .map((c) => (c.type === "text" ? c.text : ""))
    .join("")
    .trim();

  const json = stripFences(text);
  let parsed: unknown;
  try {
    parsed = JSON.parse(json);
  } catch {
    return null;
  }
  const candidate = { ...(parsed as Record<string, unknown>), source: "llm" as const };
  const result = EnrichedInputSchema.safeParse(candidate);
  if (!result.success) return null;
  return result.data;
}

function stripFences(s: string): string {
  return s
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/```\s*$/i, "")
    .trim();
}

function heuristicEnrich(rawInput: string): EnrichedInput {
  const text = rawInput.trim();
  const lower = text.toLowerCase();
  const intent = detectIntent(lower);
  const complexity = detectComplexity(lower);
  const role = inferRole(lower, intent);
  const draft = {
    goal: buildGoal(text, intent),
    context: buildContext(intent, complexity),
    constraints: deriveConstraints(intent, complexity),
    intent,
    complexity,
    role,
    executionHints: deriveHints(intent),
    assumptions: [
      "[ASSUMPTION] Heuristic enrichment was used (no Anthropic API key available or LLM call failed).",
      "[ASSUMPTION] Stack, ownership, and acceptance criteria are not stated; confirm before touching shared infrastructure.",
    ],
    source: "heuristic" as const,
  };
  return EnrichedInputSchema.parse(draft);
}

function detectIntent(s: string): Intent {
  if (/(bug|fix|broken|crash|error|fails?|regression|hotfix)/.test(s)) return "bug";
  if (/(refactor|cleanup|rewrite|migrat|simplif|extract|untangle)/.test(s))
    return "refactor";
  if (
    /(architecture|distributed|platform|infrastructure|scale|throughput|capacity)/.test(
      s,
    )
  )
    return "system";
  if (/(research|investigate|spike|explore|evaluate|compare|benchmark)/.test(s))
    return "research";
  if (/(build|add|implement|create|new|feature|ship|launch)/.test(s)) return "feature";
  return "unknown";
}

function detectComplexity(s: string): Complexity {
  const wordCount = s.split(/\s+/).filter(Boolean).length;
  const conjunctions = (s.match(/\b(and|plus|also|with|including|across|while)\b/g) || [])
    .length;
  if (wordCount > 40 || conjunctions >= 3) return "high";
  if (wordCount > 12 || conjunctions >= 1) return "medium";
  return "low";
}

function inferRole(s: string, intent: Intent): string {
  if (/(dashboard|saas|frontend|ui|react|next\.js|tailwind)/.test(s))
    return "Senior Frontend Engineer specializing in React design systems";
  if (/(api|backend|server|microservice|fastify|express)/.test(s))
    return "Senior Backend Engineer fluent in API design and reliability";
  if (/(auth|jwt|oauth|sso|security|owasp)/.test(s))
    return "Application Security Engineer with authn/authz expertise";
  if (/(ml|llm|prompt|embedding|rag|agent)/.test(s))
    return "Principal AI Engineer with applied LLM systems experience";
  if (intent === "bug")
    return "Senior Software Engineer experienced in root-cause debugging";
  if (intent === "refactor")
    return "Staff Engineer with refactoring and codebase-evolution expertise";
  if (intent === "system") return "Principal Systems Architect";
  if (intent === "research") return "Staff Research Engineer";
  return "Senior Software Engineer";
}

function buildGoal(raw: string, intent: Intent): string {
  const trimmed = raw.replace(/\.$/, "");
  const verb =
    intent === "bug"
      ? "Diagnose and fix"
      : intent === "refactor"
        ? "Restructure"
        : intent === "system"
          ? "Design"
          : intent === "research"
            ? "Investigate"
            : "Deliver";
  return `${verb}: ${trimmed}.`;
}

function buildContext(intent: Intent, complexity: Complexity): string {
  return `Inferred from raw input only. Intent classified as ${intent}; complexity estimated ${complexity}. No stack, repository, or owner specified — the implementer must confirm those before changing shared code. Treat the request as authoritative on outcome but not on implementation detail.`;
}

function deriveConstraints(intent: Intent, complexity: Complexity): string[] {
  const base = [
    "Do not introduce new runtime dependencies without an explicit justification line.",
    "Preserve existing public APIs unless the task explicitly authorizes a break.",
    "All new code must compile under strict type-checking with zero new warnings.",
  ];
  if (intent === "bug")
    base.push(
      "Reproduce the bug deterministically before fixing; ship a regression test that fails on the old code.",
    );
  if (intent === "refactor")
    base.push(
      "Behavior must remain identical; verify with the existing test suite plus a recorded golden output.",
    );
  if (intent === "feature")
    base.push(
      "Cover the happy path and at least one error path with automated tests.",
    );
  if (intent === "system")
    base.push(
      "Document architecture decisions in an ADR; flag every cross-team interface explicitly.",
    );
  if (intent === "research")
    base.push(
      "Cite primary sources; record the decision criteria and rejected alternatives.",
    );
  if (complexity === "high")
    base.push(
      "Stage delivery: ship behind a feature flag and roll out incrementally with measurable health signals.",
    );
  return base;
}

function deriveHints(intent: Intent): string[] {
  const hints = [
    "Use ripgrep/Grep to map all call-sites before editing.",
    "Run the full test suite and type-checker after every material change.",
    "Stop and ask the user if requirements are ambiguous instead of guessing.",
  ];
  if (intent === "bug")
    hints.push("Bisect git history if the regression timing is unclear.");
  if (intent === "refactor")
    hints.push("Use small, individually-revertable commits scoped per concern.");
  if (intent === "feature")
    hints.push(
      "Sketch the data model and acceptance criteria before writing any code.",
    );
  if (intent === "system")
    hints.push(
      "Produce a sequence diagram for cross-service flows and identify failure modes.",
    );
  if (intent === "research")
    hints.push(
      "Time-box exploration; write the recommendation memo before implementation.",
    );
  return hints;
}
