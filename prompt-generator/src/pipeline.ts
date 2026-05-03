import {
  PipelineInputSchema,
  PipelineOutputSchema,
  SuccessOutputSchema,
  VERSION,
  type EnrichedInput,
  type PipelineOutput,
  type ScoreBreakdown,
  type ScoreReport,
} from "./types.js";
import { enrich } from "./enrich.js";
import {
  generateSections,
  regenerateSection,
  assembleXml,
  wrapCdata,
  type GeneratedSections,
  type SectionKey,
} from "./generate.js";
import { score } from "./score.js";

const COMPLETENESS_FLOOR = 0.4;
const SCORE_TARGET = 0.7;

const CRITERION_TO_SECTION: Record<keyof ScoreBreakdown, SectionKey> = {
  clarity: "instructions",
  completeness: "self_check",
  constraint_quality: "constraints",
  verifiability: "verification",
  structure: "role",
  specificity: "instructions",
};

export interface RunOptions {
  apiKey?: string | undefined;
  location?: string | undefined;
  industry?: string | undefined;
  language?: string | undefined;
  max_repair_attempts?: number | undefined;
}

export async function run(rawInput: string, opts: RunOptions = {}): Promise<PipelineOutput> {
  const validated = PipelineInputSchema.parse({
    input: rawInput,
    apiKey: opts.apiKey,
    location: opts.location,
    industry: opts.industry,
    language: opts.language,
    max_repair_attempts: opts.max_repair_attempts ?? 2,
  });
  const startedAt = Date.now();

  const enriched = await enrich(validated.input, {
    apiKey: validated.apiKey,
    location: validated.location,
    industry: validated.industry,
    language: validated.language,
  });

  if (enriched.completeness_score < COMPLETENESS_FLOOR) {
    return PipelineOutputSchema.parse(buildNeedsClarification(enriched));
  }

  let sections = generateSections(validated.input, enriched);
  let xml = assembleXml(sections);
  let report = score({ xml, enriched, attemptsUsed: 0 });

  let attempts = 0;
  while (report.score < SCORE_TARGET && attempts < validated.max_repair_attempts) {
    attempts += 1;
    const target = CRITERION_TO_SECTION[report.weakest_criterion as keyof ScoreBreakdown] ?? "instructions";
    sections = repair(sections, target, validated.input, enriched);
    xml = assembleXml(sections);
    report = score({ xml, enriched, attemptsUsed: attempts });
  }

  const elapsed = Date.now() - startedAt;
  const success = buildSuccess(validated.input, enriched, xml, report, elapsed);

  return PipelineOutputSchema.parse(success);
}

function repair(
  sections: GeneratedSections,
  key: SectionKey,
  rawInput: string,
  enriched: EnrichedInput,
): GeneratedSections {
  return { ...sections, [key]: regenerateSection(key, rawInput, enriched) };
}

function buildNeedsClarification(e: EnrichedInput): PipelineOutput {
  const blocking = rankedBlockingQuestions(e.missing_data).slice(0, 5);
  const safe = e.missing_data
    .filter((m) => m.startsWith("[ASSUMPTION]"))
    .slice(0, 8);
  return {
    status: "needs_clarification",
    version: VERSION,
    blocking_questions: blocking,
    safe_assumptions_if_forced: safe,
    completeness_score: e.completeness_score,
  };
}

function rankedBlockingQuestions(missing: string[]): string[] {
  const order = ["stack", "scale", "geograph", "deployment", "budget", "deadline", "team"];
  const scored = missing.map((m) => {
    const lower = m.toLowerCase();
    const rank = order.findIndex((k) => lower.includes(k));
    return { m, rank: rank === -1 ? 999 : rank };
  });
  scored.sort((a, b) => a.rank - b.rank);
  const qs: string[] = [];
  for (const { m } of scored) {
    qs.push(toQuestion(m));
  }
  if (qs.length === 0) {
    return [
      "What target system or surface should change?",
      "What is the measurable definition of success?",
      "What is the current pain or failing behavior?",
      "What is the stack and where does it run?",
      "What is the budget, deadline, or team size?",
    ];
  }
  return qs;
}

function toQuestion(m: string): string {
  const stripped = m.replace(/^\[ASSUMPTION\]\s*/, "").replace(/\.$/, "");
  if (/stack/i.test(stripped)) return "What language, framework, datastore, and queue does the system use?";
  if (/scale|throughput/i.test(stripped)) return "What is the expected scale (users, RPS, regions, growth)?";
  if (/deployment/i.test(stripped)) return "Where will this run (cloud provider, on-prem, edge)?";
  if (/timeline|budget|team/i.test(stripped)) return "What are the deadline, budget, and team-size constraints?";
  if (/geograph|regulator/i.test(stripped)) return "Which jurisdictions and regulatory regimes apply?";
  return `Could you clarify: ${stripped}?`;
}

function buildSuccess(
  rawInput: string,
  enriched: EnrichedInput,
  xml: string,
  scoring: ScoreReport,
  elapsed: number,
): PipelineOutput {
  const evidence = buildEvidence(rawInput, enriched);
  const assumptions = enriched.missing_data.filter((m) => m.startsWith("[ASSUMPTION]"));
  const confidence = clamp(scoring.score * (1 - 0.1 * assumptions.length), 0, 1);
  const success = SuccessOutputSchema.parse({
    status: "success",
    version: VERSION,
    answer: {
      mega_prompt_xml: wrapCdata(xml),
      enriched_input: {
        goal: enriched.goal,
        context: enriched.context,
        intent: enriched.intent,
        complexity: enriched.complexity,
        constraints: enriched.constraints,
        locale_defaults: enriched.locale_defaults,
        missing_data: enriched.missing_data,
        completeness_score: enriched.completeness_score,
        conflicts: enriched.conflicts,
      },
    },
    scoring,
    evidence,
    assumptions,
    conflicts: enriched.conflicts,
    confidence: round(confidence),
    needs_human_review: scoring.score < SCORE_TARGET || enriched.conflicts.length > 0,
    meta: {
      elapsed_ms: elapsed,
      enrichment_source: enriched.source,
    },
  });
  return success;
}

function buildEvidence(rawInput: string, e: EnrichedInput): string[] {
  const ev: string[] = [
    `raw_input_length=${rawInput.length}`,
    `intent=${e.intent}`,
    `complexity=${e.complexity}`,
    `completeness_score=${e.completeness_score}`,
    `constraints_count=${e.constraints.length}`,
    `enrichment_source=${e.source}`,
  ];
  if (e.location_provided) {
    ev.push(`locale=${e.locale_defaults.currency}/${e.locale_defaults.language}`);
    ev.push(`regulatory_pack=${e.locale_defaults.regulatory_pack.join("|") || "(none)"}`);
  }
  return ev.sort((a, b) => a.localeCompare(b));
}

function clamp(n: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, n));
}

function round(n: number): number {
  return Math.round(n * 1000) / 1000;
}
