#!/usr/bin/env node
import { run } from "./pipeline.js";

async function main(): Promise<void> {
  const input = process.argv.slice(2).join(" ").trim();
  if (!input) {
    process.stderr.write(
      'usage: generate-prompt "<your raw task>"\n' +
        "       (set ANTHROPIC_API_KEY for AI-powered enrichment)\n",
    );
    process.exit(2);
  }
  try {
    const result = await run(input, process.env.ANTHROPIC_API_KEY);
    process.stdout.write(result.xml);
    process.stdout.write("\n--- SCORE REPORT ---\n");
    process.stdout.write(JSON.stringify(result.score, null, 2));
    process.stdout.write("\n--- META ---\n");
    process.stdout.write(JSON.stringify(result.meta, null, 2));
    process.stdout.write("\n");
  } catch (err) {
    process.stderr.write(
      "Error: " + (err instanceof Error ? err.message : String(err)) + "\n",
    );
    process.exit(1);
  }
}

void main();
