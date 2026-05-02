import type { EnrichedInput, ScoreReport, ScoreBreakdown } from "./types.js";

const WEIGHTS: Record<keyof ScoreBreakdown, number> = {
  clarity: 0.15,
  completeness: 0.30,
  constraint_quality: 0.15,
  verifiability: 0.20,
  structure: 0.20,
};

const REQUIRED_TAGS = [
  "role",
  "context",
  "instructions",
  "methodology",
  "verification",
  "constraints",
  "guardrails",
  "output_format",
] as const;

const VAGUE_TOKENS = [
  "stuff",
  "things",
  "somehow",
  "maybe",
  "probably",
  "try to",
  "kind of",
  "sort of",
  " etc.",
  "various",
  "some sort",
];

export function score(xml: string, enriched: EnrichedInput): ScoreReport {
  const notes: string[] = [];
  const breakdown: ScoreBreakdown = {
    structure: scoreStructure(xml, notes),
    completeness: scoreCompleteness(xml, notes),
    verifiability: scoreVerifiability(xml, notes),
    clarity: scoreClarity(xml, notes),
    constraint_quality: scoreConstraintQuality(enriched.constraints, notes),
  };
  const total =
    breakdown.clarity * WEIGHTS.clarity +
    breakdown.completeness * WEIGHTS.completeness +
    breakdown.constraint_quality * WEIGHTS.constraint_quality +
    breakdown.verifiability * WEIGHTS.verifiability +
    breakdown.structure * WEIGHTS.structure;
  return {
    score: round(total),
    breakdown: roundBreakdown(breakdown),
    notes,
  };
}

function scoreStructure(xml: string, notes: string[]): number {
  if (!/^<mega_prompt>[\s\S]+<\/mega_prompt>\s*$/.test(xml.trim())) {
    notes.push("Structure: <mega_prompt> root wrapper missing or malformed.");
    return 0.2;
  }
  let wellFormed = 0;
  for (const tag of REQUIRED_TAGS) {
    const opens = (xml.match(new RegExp(`<${tag}>`, "g")) || []).length;
    const closes = (xml.match(new RegExp(`</${tag}>`, "g")) || []).length;
    if (opens === 1 && closes === 1) wellFormed++;
  }
  const ratio = wellFormed / REQUIRED_TAGS.length;
  if (ratio < 1)
    notes.push(
      `Structure: ${REQUIRED_TAGS.length - wellFormed} required tag(s) malformed or duplicated.`,
    );
  return ratio;
}

function scoreCompleteness(xml: string, notes: string[]): number {
  let present = 0;
  const missing: string[] = [];
  for (const tag of REQUIRED_TAGS) {
    if (new RegExp(`<${tag}>[\\s\\S]+?</${tag}>`).test(xml)) {
      present++;
    } else {
      missing.push(tag);
    }
  }
  if (missing.length > 0)
    notes.push(`Completeness: missing section(s) — ${missing.join(", ")}.`);
  return present / REQUIRED_TAGS.length;
}

function scoreVerifiability(xml: string, notes: string[]): number {
  const m = xml.match(/<verification>([\s\S]*?)<\/verification>/);
  if (!m) {
    notes.push("Verifiability: no <verification> block.");
    return 0;
  }
  const body = m[1] ?? "";
  const steps = (body.match(/^\s*\d+\.\s+/gm) || []).length;
  if (steps < 3)
    notes.push(`Verifiability: only ${steps} step(s); ≥3 required.`);
  return Math.min(1, steps / 5);
}

function scoreClarity(xml: string, notes: string[]): number {
  const lower = xml.toLowerCase();
  let penalty = 0;
  let hits = 0;
  for (const w of VAGUE_TOKENS) {
    if (lower.includes(w)) {
      hits++;
      penalty += 0.05;
    }
  }
  const longLines = (xml.match(/^.{260,}$/gm) || []).length;
  penalty += Math.min(0.3, longLines * 0.05);
  const score = Math.max(0, 1 - penalty);
  if (hits > 0)
    notes.push(`Clarity: ${hits} vague token(s) detected (e.g. "stuff", "maybe").`);
  if (longLines > 0)
    notes.push(`Clarity: ${longLines} line(s) exceed 260 chars (likely run-on).`);
  return score;
}

function scoreConstraintQuality(constraints: string[], notes: string[]): number {
  if (constraints.length === 0) {
    notes.push("Constraint quality: no constraints supplied.");
    return 0;
  }
  let total = 0;
  for (const c of constraints) {
    let s = 0.3;
    if (/\b(must|never|always|require|forbid|only|exactly)\b/i.test(c)) s += 0.25;
    if (/\b(test|coverage|p99|latency|memory|bytes|ms|seconds?|\d+%|\d+x)\b/i.test(c))
      s += 0.25;
    if (c.length >= 60) s += 0.2;
    total += Math.min(1, s);
  }
  const avg = total / constraints.length;
  if (avg < 0.7)
    notes.push(
      "Constraint quality: constraints are present but several lack measurable or behavioral criteria.",
    );
  return avg;
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
  };
}
