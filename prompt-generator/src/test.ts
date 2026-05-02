import { run } from "./pipeline.js";
import { PipelineResultSchema } from "./types.js";

const FIXTURES = [
  "Build a SaaS dashboard",
  "Fix authentication bug",
  "Refactor API layer",
];

async function main(): Promise<void> {
  let failed = 0;
  for (const input of FIXTURES) {
    const t0 = Date.now();
    try {
      const result = await run(input, undefined);
      PipelineResultSchema.parse(result);
      const elapsed = Date.now() - t0;
      const ok =
        result.xml.includes("<mega_prompt>") &&
        result.xml.includes("</mega_prompt>") &&
        result.score.breakdown.verifiability >= 0.6 &&
        elapsed < 300;
      // eslint-disable-next-line no-console
      console.log(
        `${ok ? "PASS" : "FAIL"}  "${input}"  score=${result.score.score}  ` +
          `verif=${result.score.breakdown.verifiability}  ` +
          `intent=${result.enriched.intent}  ${elapsed}ms`,
      );
      if (!ok) failed++;
    } catch (err) {
      // eslint-disable-next-line no-console
      console.log(`FAIL  "${input}"  error=${(err as Error).message}`);
      failed++;
    }
  }
  if (failed > 0) {
    // eslint-disable-next-line no-console
    console.error(`\n${failed} fixture(s) failed.`);
    process.exit(1);
  }
  // eslint-disable-next-line no-console
  console.log("\nAll fixtures passed.");
}

void main();
