import type { EnrichedInput } from "../types.js";
import { geographyClause, shortGoal, type IntentTemplate } from "./shared.js";

export const template: IntentTemplate = {
  deliverable: "stack decision + data model + vertical slice",

  role: (e) =>
    `Principal Software Architect with 12+ years shipping greenfield production systems${geographyClause(e)}.`,

  instructions: (e) => {
    const reg = e.locale_defaults.regulatory_pack;
    const overlay = e.locale_defaults.industry_overlay;
    return [
      "Make the stack decision: name the runtime, framework, datastore, and queue (with versions) and justify each in 1 line.",
      "Define the data model as concrete table or schema definitions with primary keys, foreign keys, and indexes named explicitly.",
      "Identify the smallest vertical slice that proves the system end-to-end (UI → API → store → response) and list its files.",
      `Wire authentication and authorization with ${reg.length > 0 ? reg.join(", ") : "named identity-provider"} compliance enforced at the route layer.`,
      `Implement the vertical slice with one happy-path test (\`npm test -- vertical-slice\`) and one negative-path test that exits 0/1 deterministically.`,
      "Add observability: structured logs (JSON) on every request and a /health endpoint returning 200 with build SHA.",
      "Document architecture decisions in `/docs/adr/0001-stack.md` covering: chosen stack, 2 rejected alternatives, trigger to revisit.",
      `Capture ${overlay.length > 0 ? overlay.join(", ") + " considerations" : "industry compliance considerations"} as inline TODO tags with owner names.`,
      "Produce a smoke-run script `scripts/smoke.sh` that boots the stack, exercises one full transaction, and exits 0 on success.",
    ];
  },

  constraints: (e) => {
    const out = [...e.constraints];
    if (!out.some((c) => /vertical slice/.test(c)))
      out.push("Vertical slice must run end-to-end on a developer laptop in ≤ 60 seconds (boot + smoke).");
    if (!out.some((c) => /adr/i.test(c)))
      out.push("Every architecture decision is recorded in /docs/adr/ with status, context, decision, consequences.");
    return out;
  },

  verification: (e) => [
    "Run `bash scripts/smoke.sh`; assert exit code 0 and a transaction id present in stdout.",
    "Run the full test suite (`npm test`); report passed/failed/skipped counts; zero unexpected failures permitted.",
    "Type-check (`npx tsc --noEmit`) with zero diagnostics; if any appear, list file:line.",
    `Schema check: load the data model into a fresh ${e.locale_defaults.regulatory_pack.includes("GDPR") ? "GDPR-compliant " : ""}database and confirm all foreign keys resolve.`,
    "Hit `/health`; require status 200 and a build-SHA field that matches the current commit.",
  ],

  example: (e) =>
    `Input goal: "${shortGoal(e)}" → Stack decision: Node 20 + Fastify + Postgres 16 + Redis 7. Vertical slice: POST /tx → write to ledger table → publish event → return tx_id. Smoke: scripts/smoke.sh boots compose, calls endpoint, asserts row count == 1.`,
};
