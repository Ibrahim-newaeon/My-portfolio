#!/usr/bin/env node
import { run } from "./pipeline.js";

interface Flags {
  positional: string[];
  location: string | undefined;
  industry: string | undefined;
  language: string | undefined;
  max_repair_attempts: number | undefined;
  emit_template: boolean;
}

function parseArgs(argv: string[]): Flags {
  const flags: Flags = {
    positional: [],
    location: undefined,
    industry: undefined,
    language: undefined,
    max_repair_attempts: undefined,
    emit_template: false,
  };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === undefined) continue;
    const next = (): string | undefined => argv[++i];
    if (a === "--location") flags.location = next();
    else if (a === "--industry") flags.industry = next();
    else if (a === "--language") flags.language = next();
    else if (a === "--max-repair-attempts") {
      const v = next();
      flags.max_repair_attempts = v !== undefined ? Number(v) : undefined;
    } else if (a === "--emit-template") flags.emit_template = true;
    else flags.positional.push(a);
  }
  return flags;
}

async function main(): Promise<void> {
  const flags = parseArgs(process.argv.slice(2));
  const input = flags.positional.join(" ").trim();

  if (!input) {
    process.stderr.write(
      'usage: generate-prompt "<input>" [--location <loc>] [--industry <ind>] [--language <lang>] [--max-repair-attempts <n>] [--emit-template]\n' +
        "       (set ANTHROPIC_API_KEY for AI-powered enrichment)\n",
    );
    process.exit(1);
  }

  try {
    const result = await run(input, {
      apiKey: process.env.ANTHROPIC_API_KEY,
      location: flags.location,
      industry: flags.industry,
      language: flags.language,
      max_repair_attempts: flags.max_repair_attempts,
    });

    if (result.status === "needs_clarification") {
      process.stdout.write(JSON.stringify(result, null, 2) + "\n");
      process.exit(2);
    }
    if (result.status === "missing_data") {
      process.stdout.write(JSON.stringify(result, null, 2) + "\n");
      process.exit(3);
    }

    if (flags.emit_template) {
      process.stdout.write(result.answer.mega_prompt_xml + "\n");
    } else {
      process.stdout.write(JSON.stringify(result, null, 2) + "\n");
    }
    process.exit(0);
  } catch (err) {
    process.stderr.write(
      "Error: " + (err instanceof Error ? err.message : String(err)) + "\n",
    );
    process.exit(1);
  }
}

void main();
