import { z } from "zod";

export const VERSION = "2.3" as const;

export const IntentSchema = z.enum([
  "greenfield_design",
  "code_modification",
  "bug_investigation",
  "refactor",
  "content_generation",
  "analysis_only",
]);
export type Intent = z.infer<typeof IntentSchema>;

export const ComplexitySchema = z.enum(["low", "medium", "high"]);
export type Complexity = z.infer<typeof ComplexitySchema>;

export const LocaleDefaultsSchema = z.object({
  currency: z.string(),
  currency_format: z.string(),
  date_format: z.string(),
  language: z.string(),
  regulatory_pack: z.array(z.string()),
  industry_overlay: z.array(z.string()),
});
export type LocaleDefaults = z.infer<typeof LocaleDefaultsSchema>;

export const EnrichedInputSchema = z.object({
  goal: z.string().min(8),
  context: z.string().min(8),
  intent: IntentSchema,
  complexity: ComplexitySchema,
  constraints: z.array(z.string().min(4)).min(3).max(10),
  locale_defaults: LocaleDefaultsSchema,
  missing_data: z.array(z.string()),
  completeness_score: z.number().min(0).max(1),
  conflicts: z.array(z.string()),
  source: z.enum(["llm", "heuristic"]),
  location_provided: z.boolean(),
});
export type EnrichedInput = z.infer<typeof EnrichedInputSchema>;

export const ScoreBreakdownSchema = z.object({
  clarity: z.number().min(0).max(1),
  completeness: z.number().min(0).max(1),
  constraint_quality: z.number().min(0).max(1),
  verifiability: z.number().min(0).max(1),
  structure: z.number().min(0).max(1),
  specificity: z.number().min(0).max(1),
});
export type ScoreBreakdown = z.infer<typeof ScoreBreakdownSchema>;

export const ScoreReportSchema = z.object({
  score: z.number().min(0).max(1),
  breakdown: ScoreBreakdownSchema,
  penalties: z.array(z.string()),
  weakest_criterion: z.string(),
  repair_attempts_used: z.number().int().nonnegative(),
});
export type ScoreReport = z.infer<typeof ScoreReportSchema>;

export const SuccessOutputSchema = z.object({
  status: z.literal("success"),
  version: z.literal(VERSION),
  answer: z.object({
    mega_prompt_xml: z.string().regex(/^<!\[CDATA\[[\s\S]*\]\]>$/, "must be CDATA-wrapped"),
    enriched_input: z.object({
      goal: z.string(),
      context: z.string(),
      intent: IntentSchema,
      complexity: ComplexitySchema,
      constraints: z.array(z.string()),
      locale_defaults: LocaleDefaultsSchema,
      missing_data: z.array(z.string()),
      completeness_score: z.number().min(0).max(1),
      conflicts: z.array(z.string()),
    }),
  }),
  scoring: ScoreReportSchema,
  evidence: z.array(z.string()),
  assumptions: z.array(z.string()),
  conflicts: z.array(z.string()),
  confidence: z.number().min(0).max(1),
  needs_human_review: z.boolean(),
  meta: z.object({
    elapsed_ms: z.number().nonnegative(),
    enrichment_source: z.enum(["llm", "heuristic"]),
  }),
});
export type SuccessOutput = z.infer<typeof SuccessOutputSchema>;

export const NeedsClarificationOutputSchema = z.object({
  status: z.literal("needs_clarification"),
  version: z.literal(VERSION),
  blocking_questions: z.array(z.string()).max(5),
  safe_assumptions_if_forced: z.array(z.string()),
  completeness_score: z.number().min(0).max(1),
});
export type NeedsClarificationOutput = z.infer<typeof NeedsClarificationOutputSchema>;

export const MissingDataOutputSchema = z.object({
  status: z.literal("missing_data"),
  version: z.literal(VERSION),
  gaps: z.array(z.string()),
  what_would_unblock: z.array(z.string()),
});
export type MissingDataOutput = z.infer<typeof MissingDataOutputSchema>;

export const PipelineOutputSchema = z.discriminatedUnion("status", [
  SuccessOutputSchema,
  NeedsClarificationOutputSchema,
  MissingDataOutputSchema,
]);
export type PipelineOutput = z.infer<typeof PipelineOutputSchema>;

export const PipelineInputSchema = z.object({
  input: z.string().min(1).max(2000),
  apiKey: z.string().optional(),
  location: z.string().optional(),
  industry: z.string().optional(),
  language: z.string().optional(),
  max_repair_attempts: z.number().int().min(0).max(5).default(2),
});
export type PipelineInput = z.infer<typeof PipelineInputSchema>;
