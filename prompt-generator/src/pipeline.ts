import {
  EnrichedInputSchema,
  PipelineInputSchema,
  PipelineResultSchema,
  ScoreReportSchema,
  type PipelineResult,
} from "./types.js";
import { enrich } from "./enrich.js";
import { generatePrompt } from "./generate.js";
import { score } from "./score.js";

const VERIFIABILITY_GATE = 0.6;

export async function run(
  rawInput: string,
  apiKey: string | undefined,
): Promise<PipelineResult> {
  const validated = PipelineInputSchema.parse({
    input: rawInput,
    ...(apiKey ? { apiKey } : {}),
  });

  const startedAt = Date.now();

  const enriched = await enrich(validated.input, validated.apiKey);
  EnrichedInputSchema.parse(enriched);

  const xml = generatePrompt(validated.input, enriched);
  const report = score(xml, enriched);
  ScoreReportSchema.parse(report);

  if (report.breakdown.verifiability < VERIFIABILITY_GATE) {
    throw new Error(
      `Verifiability gate failed: ${report.breakdown.verifiability} < ${VERIFIABILITY_GATE}`,
    );
  }

  const elapsedMs = Date.now() - startedAt;

  return PipelineResultSchema.parse({
    xml,
    score: report,
    enriched,
    meta: {
      elapsedMs,
      enrichmentSource: enriched.source,
    },
  });
}
