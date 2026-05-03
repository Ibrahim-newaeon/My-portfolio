import express, { type Request, type Response } from "express";
import cors from "cors";
import { run } from "./pipeline.js";

const app = express();
app.use(cors());
app.use(express.json({ limit: "32kb" }));

app.get("/health", (_req: Request, res: Response) => {
  res.json({
    ok: true,
    version: "2.3",
    hasApiKey: Boolean(process.env.ANTHROPIC_API_KEY),
  });
});

app.post("/api/generate", async (req: Request, res: Response) => {
  const body = req.body ?? {};
  const input = typeof body.input === "string" ? body.input.trim() : "";
  if (input.length < 1) {
    res.status(400).json({ error: "input is required" });
    return;
  }
  try {
    const result = await run(input, {
      apiKey: process.env.ANTHROPIC_API_KEY,
      location: typeof body.location === "string" ? body.location : undefined,
      industry: typeof body.industry === "string" ? body.industry : undefined,
      language: typeof body.language === "string" ? body.language : undefined,
      max_repair_attempts:
        typeof body.max_repair_attempts === "number" ? body.max_repair_attempts : undefined,
    });
    if (result.status === "needs_clarification") {
      res.status(200).json(result);
      return;
    }
    if (result.status === "missing_data") {
      res.status(200).json(result);
      return;
    }
    res.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "internal error";
    res.status(500).json({ error: message });
  }
});

const port = Number(process.env.PORT) || 3030;
app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`prompt-generator v2.3 listening on http://localhost:${port}`);
  // eslint-disable-next-line no-console
  console.log(
    `enrichment mode: ${process.env.ANTHROPIC_API_KEY ? "LLM" : "heuristic"}`,
  );
});
