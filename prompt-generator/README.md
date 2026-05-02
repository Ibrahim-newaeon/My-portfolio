# prompt-generator

AI-enriched mega-prompt generator. Converts a raw task description into a structured Claude Code prompt with quality scoring.

Two delivery surfaces:

1. **CLI** — `generate-prompt "<your raw task>"`
2. **HTTP API** — `POST /api/generate { input }` (used by the portfolio landing page)

## Architecture

```
src/
├── types.ts       Zod schemas + types (validation contract)
├── enrich.ts      AI enrichment via Anthropic SDK + deterministic fallback
├── generate.ts    Dynamic prompt builder (no static templates)
├── score.ts       Five-criterion quality scorer
├── pipeline.ts    Orchestrator: validate → enrich → generate → score → validate
├── cli.ts         CLI entry
├── server.ts      Express HTTP API
└── test.ts        Fixture runner (no test framework needed)
```

## Setup

```bash
cd prompt-generator
npm install
cp .env.example .env
# edit .env to set ANTHROPIC_API_KEY (optional — falls back to heuristic enrichment)
```

## Usage

### CLI

```bash
# dev (no build needed)
npm run cli -- "Build a SaaS dashboard with OAuth and audit log"

# production
npm run build
node dist/cli.js "Fix authentication bug"
```

### HTTP server

```bash
npm run serve
# in another terminal:
curl -X POST http://localhost:3030/api/generate \
  -H "content-type: application/json" \
  -d '{"input":"Refactor API layer"}'
```

The portfolio landing page hits this endpoint by default at `http://localhost:3030/api/generate`. The endpoint is configurable from the UI.

### Tests

```bash
npm run test
# Runs three canonical fixtures and verifies:
#   - all XML sections present
#   - verifiability ≥ 0.6
#   - response under 300ms (heuristic mode)
```

## Pipeline

1. **Validate** — Zod-checks the input (`3..2000 chars`).
2. **Enrich** — calls Claude (Haiku 4.5) when `ANTHROPIC_API_KEY` is set; otherwise uses deterministic heuristics. Output: `{ goal, context, constraints, intent, complexity, role, executionHints, assumptions }`.
3. **Generate** — assembles eight XML sections (`role`, `context`, `instructions`, `methodology`, `verification`, `constraints`, `guardrails`, `output_format`) — none of them static.
4. **Score** — 0..1 weighted score across `clarity`, `completeness`, `constraint_quality`, `verifiability`, `structure`.
5. **Validate** — Zod-checks the result; gates on `verifiability ≥ 0.6`.

## Scoring weights

| criterion          | weight |
|--------------------|-------:|
| completeness       | 0.30   |
| verifiability      | 0.20   |
| structure          | 0.20   |
| clarity            | 0.15   |
| constraint_quality | 0.15   |

## Output shape

```jsonc
{
  "xml": "<mega_prompt>…</mega_prompt>",
  "score": {
    "score": 0.92,
    "breakdown": { "clarity": 1, "completeness": 1, "constraint_quality": 0.85,
                   "verifiability": 1, "structure": 1 },
    "notes": []
  },
  "enriched": { /* EnrichedInput */ },
  "meta": { "elapsedMs": 142, "enrichmentSource": "llm" }
}
```
