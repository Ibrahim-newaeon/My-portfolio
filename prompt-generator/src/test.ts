import { run } from "./pipeline.js";
import { PipelineOutputSchema } from "./types.js";

interface Fixture {
  id: string;
  input: string;
  location?: string;
  industry?: string;
  expectStatus: "success" | "needs_clarification" | "missing_data" | "error";
  expectIntent?: string;
  extra?: (r: unknown) => string | null;
}

const FIXTURES: Fixture[] = [
  {
    id: "T1",
    input: "Build a SaaS dashboard with billing, multi-tenant data isolation, and an admin panel for 1000 users on Postgres deployed to AWS",
    expectStatus: "success",
    expectIntent: "greenfield_design",
  },
  {
    id: "T2",
    input: "Fix the authentication bug where Express sessions expire 1000x too fast on Node 20 deployed to AWS for 500 daily users",
    expectStatus: "success",
    expectIntent: "bug_investigation",
  },
  {
    id: "T3",
    input: "Refactor the Express API layer into modular handlers across src/api on Node 20 with 10000 RPS deployed to AWS",
    expectStatus: "success",
    expectIntent: "refactor",
  },
  {
    id: "T4",
    input: "Build a POS system in Amman with offline mode, role-based auth, Postgres backend deployed to on-prem servers for 50 stores",
    location: "Amman, Jordan",
    industry: "retail",
    expectStatus: "success",
    expectIntent: "greenfield_design",
    extra: (r) => {
      const res = r as { answer?: { enriched_input?: { locale_defaults?: { currency?: string; regulatory_pack?: string[] } } } };
      const ld = res.answer?.enriched_input?.locale_defaults;
      if (!ld) return "missing locale_defaults";
      if (ld.currency !== "JOD") return `expected JOD, got ${ld.currency}`;
      if (!ld.regulatory_pack?.includes("VAT")) return "regulatory_pack missing VAT";
      return null;
    },
  },
  {
    id: "T5",
    input: "make it better",
    expectStatus: "needs_clarification",
  },
  {
    id: "T6",
    input: "",
    expectStatus: "error",
  },
  {
    id: "T7",
    input: "Build something",
    expectStatus: "needs_clarification",
  },
];

async function main(): Promise<void> {
  let failed = 0;
  for (const fx of FIXTURES) {
    const t0 = Date.now();
    try {
      const result = await run(fx.input, {
        location: fx.location,
        industry: fx.industry,
      });
      const elapsed = Date.now() - t0;

      if (fx.expectStatus === "error") {
        log(fx, false, `expected error, got status=${result.status}`, elapsed);
        failed++;
        continue;
      }
      const parsed = PipelineOutputSchema.safeParse(result);
      if (!parsed.success) {
        log(fx, false, `Zod parse failed: ${parsed.error.message}`, elapsed);
        failed++;
        continue;
      }
      if (result.status !== fx.expectStatus) {
        log(fx, false, `expected ${fx.expectStatus}, got ${result.status}`, elapsed);
        failed++;
        continue;
      }
      if (result.status === "success") {
        if (fx.expectIntent && result.answer.enriched_input.intent !== fx.expectIntent) {
          log(fx, false, `expected intent ${fx.expectIntent}, got ${result.answer.enriched_input.intent}`, elapsed);
          failed++;
          continue;
        }
        if (!result.answer.mega_prompt_xml.startsWith("<![CDATA[")) {
          log(fx, false, "mega_prompt_xml not CDATA-wrapped", elapsed);
          failed++;
          continue;
        }
        if (!result.scoring.weakest_criterion) {
          log(fx, false, "weakest_criterion missing", elapsed);
          failed++;
          continue;
        }
      }
      if (fx.extra) {
        const err = fx.extra(result);
        if (err) {
          log(fx, false, err, elapsed);
          failed++;
          continue;
        }
      }
      log(fx, true, summary(result), elapsed);
    } catch (err) {
      const elapsed = Date.now() - t0;
      if (fx.expectStatus === "error") {
        log(fx, true, `expected error: ${(err as Error).message}`, elapsed);
        continue;
      }
      log(fx, false, `threw: ${(err as Error).message}`, elapsed);
      failed++;
    }
  }
  if (failed > 0) {
    console.error(`\n${failed} fixture(s) failed.`);
    process.exit(1);
  }
  console.log("\nAll fixtures passed.");
}

function summary(r: unknown): string {
  const x = r as { status: string; scoring?: { score: number; weakest_criterion: string } };
  if (x.status === "success" && x.scoring) {
    return `score=${x.scoring.score} weakest=${x.scoring.weakest_criterion}`;
  }
  return x.status;
}

function log(fx: Fixture, ok: boolean, note: string, ms: number): void {
  const tag = ok ? "PASS" : "FAIL";
  console.log(`${tag}  ${fx.id}  "${fx.input.slice(0, 60)}"  ${note}  ${ms}ms`);
}

void main();
