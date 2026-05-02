import { z } from "zod";

export const IntentSchema = z.enum([
  "feature",
  "bug",
  "refactor",
  "system",
  "research",
  "unknown",
]);
export type Intent = z.infer<typeof IntentSchema>;

export const ComplexitySchema = z.enum(["low", "medium", "high"]);
export type Complexity = z.infer<typeof ComplexitySchema>;

export const EnrichedInputSchema = z.object({
  goal: z.string().min(8),
  context: z.string().min(8),
  constraints: z.array(z.string().min(4)).min(1),
  intent: IntentSchema,
  complexity: ComplexitySchema,
  role: z.string().min(4),
  executionHints: z.array(z.string().min(4)).min(1),
  assumptions: z.array(z.string()),
  source: z.enum(["llm", "heuristic"]),
});
export type EnrichedInput = z.infer<typeof EnrichedInputSchema>;

export const ScoreBreakdownSchema = z.object({
  clarity: z.number().min(0).max(1),
  completeness: z.number().min(0).max(1),
  constraint_quality: z.number().min(0).max(1),
  verifiability: z.number().min(0).max(1),
  structure: z.number().min(0).max(1),
});
export type ScoreBreakdown = z.infer<typeof ScoreBreakdownSchema>;

export const ScoreReportSchema = z.object({
  score: z.number().min(0).max(1),
  breakdown: ScoreBreakdownSchema,
  notes: z.array(z.string()),
});
export type ScoreReport = z.infer<typeof ScoreReportSchema>;

export const PipelineResultSchema = z.object({
  xml: z.string().min(120),
  score: ScoreReportSchema,
  enriched: EnrichedInputSchema,
  meta: z.object({
    elapsedMs: z.number().nonnegative(),
    enrichmentSource: z.enum(["llm", "heuristic"]),
  }),
});
export type PipelineResult = z.infer<typeof PipelineResultSchema>;

export const PipelineInputSchema = z.object({
  input: z.string().min(3).max(2000),
  apiKey: z.string().optional(),
});
