import express, { type Request, type Response } from "express";
import cors from "cors";
import { run } from "./pipeline.js";

const app = express();
app.use(cors());
app.use(express.json({ limit: "32kb" }));

app.get("/health", (_req: Request, res: Response) => {
  res.json({ ok: true, hasApiKey: Boolean(process.env.ANTHROPIC_API_KEY) });
});

app.post("/api/generate", async (req: Request, res: Response) => {
  const input = typeof req.body?.input === "string" ? req.body.input.trim() : "";
  if (input.length < 3) {
    res.status(400).json({ error: "input must be at least 3 characters" });
    return;
  }
  try {
    const result = await run(input, process.env.ANTHROPIC_API_KEY);
    res.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "internal error";
    res.status(500).json({ error: message });
  }
});

const port = Number(process.env.PORT) || 3030;
app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`prompt-generator listening on http://localhost:${port}`);
  // eslint-disable-next-line no-console
  console.log(
    `enrichment mode: ${process.env.ANTHROPIC_API_KEY ? "LLM" : "heuristic"}`,
  );
});
