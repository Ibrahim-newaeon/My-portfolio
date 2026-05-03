import type { EnrichedInput, ScoreReport, ScoreBreakdown, Intent } from "./types.js";

const WEIGHTS: Record<keyof ScoreBreakdown, number> = {
  clarity: 0.20,
  completeness: 0.25,
  constraint_quality: 0.15,
  verifiability: 0.20,
  structure: 0.10,
  specificity: 0.10,
};

const REQUIRED_TAGS = [
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
] as const;

const ANTI_GENERIC_PHRASES = [
  "improve performance",
  "handle edge cases",
  "optimize code",
  "follow best practices",
  "as needed",
  "where appropriate",
  "make it better",
  "robust solution",
  "industry-standard",
  "modern approach",
];

const INTENT_TEMPLATE_LOCK: Array<{ phrase: string; allowed: Intent[] }> = [
  { phrase: "smallest correct diff", allowed: ["code_modification"] },
  { phrase: "cite file paths and line ranges", allowed: ["code_modification", "bug_investigation", "refactor"] },
  { phrase: "vertical slice", allowed: ["greenfield_design"] },
  { phrase: "stack decision", allowed: ["greenfield_design"] },
  { phrase: "behavior-preserving", allowed: ["refactor"] },
  { phrase: "root cause", allowed: ["bug_investigation"] },
];

const PENALTIES = {
  missing_required_section: 0.30,
  zero_verification_steps: 0.30,
  intent_template_lock: 0.25,
  vague_instruction: 0.20,
  generic_constraint: 0.20,
  locale_defaults_absent: 0.15,
  specificity_repetition: 0.10,
  conflict_unsurfaced: 0.10,
} as const;

export interface ScoreInput {
  xml: string;
  enriched: EnrichedInput;
  attemptsUsed: number;
}

export function score(input: ScoreInput): ScoreReport {
  const { xml, enriched, attemptsUsed } = input;
  const penalties: string[] = [];
  const scanCtx: ScanCtx = { xml, enriched, penalties };

  const breakdown: ScoreBreakdown = {
    completeness: scoreCompleteness(scanCtx),
    verifiability: scoreVerifiability(scanCtx),
    specificity: scoreSpecificity(scanCtx),
    structure: scoreStructure(scanCtx),
    clarity: scoreClarity(scanCtx),
    constraint_quality: scoreConstraintQuality(scanCtx),
  };

  applyExtraPenalties(scanCtx);

  const weighted =
    breakdown.clarity * WEIGHTS.clarity +
    breakdown.completeness * WEIGHTS.completeness +
    breakdown.constraint_quality * WEIGHTS.constraint_quality +
    breakdown.verifiability * WEIGHTS.verifiability +
    breakdown.structure * WEIGHTS.structure +
    breakdown.specificity * WEIGHTS.specificity;

  const totalPenalty = penalties.reduce((sum, code) => sum + (PENALTIES[code as keyof typeof PENALTIES] ?? 0), 0);
  const final = clamp(weighted - totalPenalty, 0, 1);

  const sortedEntries = (Object.entries(breakdown) as Array<[keyof ScoreBreakdown, number]>)
    .sort((a, b) => a[1] - b[1]);
  const weakest = sortedEntries[0]![0];

  return {
    score: round(final),
    breakdown: roundBreakdown(breakdown),
    penalties: dedup(penalties),
    weakest_criterion: weakest,
    repair_attempts_used: attemptsUsed,
  };
}

interface ScanCtx {
  xml: string;
  enriched: EnrichedInput;
  penalties: string[];
}

function scoreCompleteness(ctx: ScanCtx): number {
  const checks = [
    has(ctx.xml, "role"),
    has(ctx.xml, "context"),
    has(ctx.xml, "instructions"),
    has(ctx.xml, "methodology"),
    has(ctx.xml, "verification"),
    has(ctx.xml, "constraints"),
    has(ctx.xml, "guardrails"),
    has(ctx.xml, "output_format"),
    /<example>[\s\S]+?<\/example>/.test(ctx.xml),
    /<self_check>[\s\S]+?<\/self_check>/.test(ctx.xml),
  ];
  const passed = checks.filter(Boolean).length;
  if (passed < checks.length) ctx.penalties.push("missing_required_section");
  return passed / checks.length;
}

function scoreVerifiability(ctx: ScanCtx): number {
  const m = ctx.xml.match(/<verification>([\s\S]*?)<\/verification>/);
  const steps = m && m[1] ? (m[1].match(/^\s*\d+\.\s+/gm) || []).length : 0;
  if (steps === 0) ctx.penalties.push("zero_verification_steps");
  const checks = [
    steps >= 3,
    everyConstraintMeasurable(ctx.enriched.constraints),
    /<output_format>[\s\S]+?<\/output_format>/.test(ctx.xml),
    /<self_check>[\s\S]+?<\/self_check>/.test(ctx.xml),
  ];
  return checks.filter(Boolean).length / checks.length;
}

function scoreSpecificity(ctx: ScanCtx): number {
  const instr = extractInstructions(ctx.xml);
  const text = instr.join(" ");
  const checks = [
    /\b[\w./-]+\.(ts|tsx|js|mjs|json|md|sh|yaml|yml|sql|py|rs|go)\b/.test(ctx.xml) || /\bnpm |\bnpx |\brg |\bgit |\btsc\b/.test(ctx.xml),
    /\b[a-z]+ ?(test|tsc|build|lint|smoke|stat)\b|\brg\b|\bnpx\b|\bnpm\b|\bgit\b/.test(ctx.xml),
    /\b\d+(\.\d+)?\s*(ms|s|seconds?|minutes?|%|x|lines|words|bytes|gb|tb|mb|qps|rps|tps)\b/i.test(ctx.xml),
    !hasRepetition(instr),
  ];
  if (hasRepetition(instr)) ctx.penalties.push("specificity_repetition");
  return checks.filter(Boolean).length / checks.length;
}

function scoreStructure(ctx: ScanCtx): number {
  const order = REQUIRED_TAGS.map((t) => ctx.xml.indexOf(`<${t}>`));
  const inOrder = order.every((idx, i) => {
    if (idx < 0) return false;
    if (i === 0) return true;
    const prev = order[i - 1];
    return prev !== undefined && idx > prev;
  });
  const noEmpty = REQUIRED_TAGS.every((t) => {
    const m = ctx.xml.match(new RegExp(`<${t}>([\\s\\S]*?)</${t}>`));
    return m && m[1] ? m[1].trim().length > 0 : false;
  });
  const validXml = /^<mega_prompt[^>]*>[\s\S]+<\/mega_prompt>\s*$/.test(ctx.xml.trim());
  const checks = [inOrder, noEmpty, validXml];
  return checks.filter(Boolean).length / checks.length;
}

function scoreClarity(ctx: ScanCtx): number {
  const instr = extractInstructions(ctx.xml);
  const avgLen = instr.length === 0 ? 0 : instr.reduce((s, x) => s + x.split(/\s+/).filter(Boolean).length, 0) / instr.length;
  const lengthOk = avgLen > 0 && avgLen <= 30;
  const lower = ctx.xml.toLowerCase();
  const hits = ANTI_GENERIC_PHRASES.filter((p) => lower.includes(p));
  if (hits.length > 0) ctx.penalties.push("vague_instruction");
  const checks = [lengthOk, hits.length === 0];
  return checks.filter(Boolean).length / checks.length;
}

function scoreConstraintQuality(ctx: ScanCtx): number {
  const cs = ctx.enriched.constraints;
  const countOk = cs.length >= 3 && cs.length <= 10;
  const allMeasurable = everyConstraintMeasurable(cs);
  const lowered = cs.map((c) => c.toLowerCase());
  const allNonGeneric = lowered.every((c) => !ANTI_GENERIC_PHRASES.some((p) => c.includes(p)));
  if (!allNonGeneric) ctx.penalties.push("generic_constraint");
  const checks = [countOk, allMeasurable, allNonGeneric];
  return checks.filter(Boolean).length / checks.length;
}

function applyExtraPenalties(ctx: ScanCtx): void {
  for (const rule of INTENT_TEMPLATE_LOCK) {
    if (ctx.xml.toLowerCase().includes(rule.phrase) && !rule.allowed.includes(ctx.enriched.intent)) {
      ctx.penalties.push("intent_template_lock");
      break;
    }
  }
  if (ctx.enriched.location_provided) {
    const ld = ctx.enriched.locale_defaults;
    if (!ld.currency || !ld.language || !/<locale_aware_defaults>/.test(ctx.xml)) {
      ctx.penalties.push("locale_defaults_absent");
    }
  }
  if (ctx.enriched.conflicts.length > 0 && !/conflicts?/i.test(ctx.xml)) {
    ctx.penalties.push("conflict_unsurfaced");
  }
}

function has(xml: string, tag: string): boolean {
  return new RegExp(`<${tag}>[\\s\\S]+?</${tag}>`).test(xml);
}

function extractInstructions(xml: string): string[] {
  const m = xml.match(/<instructions>([\s\S]*?)<\/instructions>/);
  if (!m || !m[1]) return [];
  return m[1]
    .split(/\n/)
    .map((l) => l.replace(/^\s*\d+\.\s*/, "").trim())
    .filter((l) => l.length > 0);
}

function hasRepetition(instr: string[]): boolean {
  for (let i = 0; i < instr.length; i++) {
    for (let j = i + 1; j < instr.length; j++) {
      const a = instr[i];
      const b = instr[j];
      if (a && b && jaccard(tokens(a), tokens(b)) >= 0.6) return true;
    }
  }
  return false;
}

function tokens(s: string): Set<string> {
  return new Set(
    s
      .toLowerCase()
      .replace(/[^a-z0-9 ]+/g, " ")
      .split(/\s+/)
      .filter((w) => w.length > 2),
  );
}

function jaccard(a: Set<string>, b: Set<string>): number {
  if (a.size === 0 && b.size === 0) return 0;
  let inter = 0;
  for (const x of a) if (b.has(x)) inter++;
  const union = a.size + b.size - inter;
  return union === 0 ? 0 : inter / union;
}

function everyConstraintMeasurable(cs: string[]): boolean {
  if (cs.length === 0) return false;
  return cs.every((c) =>
    /\b\d+/.test(c) ||
    /\b(must|never|always|exactly|only|forbid|require)\b/i.test(c) ||
    /`[^`]+`/.test(c) ||
    /\.(ts|tsx|js|json|md|sh|sql)\b/.test(c),
  );
}

function clamp(n: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, n));
}

function round(n: number): number {
  return Math.round(n * 1000) / 1000;
}

function roundBreakdown(b: ScoreBreakdown): ScoreBreakdown {
  return {
    clarity: round(b.clarity),
    completeness: round(b.completeness),
    constraint_quality: round(b.constraint_quality),
    verifiability: round(b.verifiability),
    structure: round(b.structure),
    specificity: round(b.specificity),
  };
}

function dedup(arr: string[]): string[] {
  return Array.from(new Set(arr));
}
