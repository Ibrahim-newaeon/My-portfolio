/* global React, Reveal */
// Prompt Generator — landing-page UI that hits the prompt-generator backend.

// Default to same-origin /api/generate so the deployed site can call its own
// backend.  Override via the in-UI Endpoint setting for local dev (e.g.
// http://localhost:3030/api/generate when running prompt-generator/ standalone).
const DEFAULT_ENDPOINT = "/api/generate";
const ENDPOINT_KEY = "pg_endpoint";

function PromptGenerator() {
  const [input, setInput] = React.useState("");
  const [endpoint, setEndpoint] = React.useState(() => {
    try { return localStorage.getItem(ENDPOINT_KEY) || DEFAULT_ENDPOINT; }
    catch { return DEFAULT_ENDPOINT; }
  });
  const [showSettings, setShowSettings] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState(null);
  const [result, setResult] = React.useState(null);
  const [tab, setTab] = React.useState("xml");
  const [copied, setCopied] = React.useState(false);

  React.useEffect(() => {
    try { localStorage.setItem(ENDPOINT_KEY, endpoint); } catch {}
  }, [endpoint]);

  const generate = async () => {
    const trimmed = input.trim();
    if (trimmed.length < 3) { setError("Type at least a few words first."); return; }
    setLoading(true); setError(null); setResult(null);
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input: trimmed }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.error || `Server returned ${res.status}`);
      }
      const data = await res.json();
      setResult(data);
      setTab("xml");
    } catch (err) {
      setError(
        (err && err.message) ||
        "Request failed. Make sure the backend is running (`npm run serve` in prompt-generator/)."
      );
    } finally {
      setLoading(false);
    }
  };

  const copy = async () => {
    if (!result) return;
    const text = tab === "xml" ? result.xml : JSON.stringify(result.score, null, 2);
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {}
  };

  const onKeyDown = (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") { e.preventDefault(); generate(); }
  };

  const examples = [
    "Build a SaaS dashboard with audit log and SSO",
    "Fix authentication bug — sessions expire too early",
    "Refactor the API layer to use a service pattern",
  ];

  return (
    <section id="prompt-generator" className="section pg-section">
      <div className="wrap">
        <div className="sec-head">
          <div className="sec-num">07 · Live demo</div>
          <div>
            <h2 className="sec-title">A working tool, not a screenshot.</h2>
            <p className="sec-kicker">
              Type a raw task. The backend (Claude Haiku 4.5) enriches it, assembles a
              structured mega-prompt, and scores the output across five quality criteria.
              Calls the same Node API serving this page.
            </p>
          </div>
        </div>

        <div className="pg-stage">
          <div className="pg-stage-bar">
            <span className="pg-stage-pulse" aria-hidden="true" />
            <span className="pg-stage-label">Live</span>
            <span className="pg-stage-sep" aria-hidden="true">·</span>
            <code className="pg-stage-route">POST {endpoint}</code>
            <span className="pg-stage-spacer" />
            <span className="pg-stage-meta">Claude Haiku 4.5 · Node 20 · same origin</span>
          </div>

        <div className="pg-card">
          <div className="pg-input-wrap">
            <label className="pg-label" htmlFor="pg-input">Raw task</label>
            <textarea
              id="pg-input"
              className="pg-textarea"
              placeholder='e.g. "Build a SaaS dashboard with audit log and SSO"'
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={onKeyDown}
              rows={4}
              maxLength={2000}
            />
            <div className="pg-examples">
              {examples.map((ex) => (
                <button
                  key={ex}
                  type="button"
                  className="pg-example"
                  onClick={() => setInput(ex)}
                  disabled={loading}
                >{ex}</button>
              ))}
            </div>
          </div>

          <div className="pg-actions">
            <button
              type="button"
              className="pg-generate"
              onClick={generate}
              disabled={loading || input.trim().length < 3}
            >
              {loading ? "Generating…" : "Generate prompt"}
              <span className="pg-shortcut">⌘↵</span>
            </button>
            <button
              type="button"
              className="pg-settings-btn"
              onClick={() => setShowSettings((s) => !s)}
              aria-expanded={showSettings}
            >
              {showSettings ? "Hide endpoint" : "Endpoint"}
            </button>
          </div>

          {showSettings &&
            <div className="pg-settings">
              <label className="pg-label" htmlFor="pg-endpoint">Backend endpoint</label>
              <input
                id="pg-endpoint"
                type="url"
                className="pg-endpoint-input"
                value={endpoint}
                onChange={(e) => setEndpoint(e.target.value)}
                placeholder={DEFAULT_ENDPOINT}
                spellCheck={false}
              />
              <p className="pg-hint">
                Default <code>/api/generate</code> hits this same site. For local dev, run <code>npm run serve</code> inside
                <code> prompt-generator/</code> and point this at <code>http://localhost:3030/api/generate</code>.
              </p>
            </div>
          }

          {error && <div className="pg-error" role="alert">{error}</div>}

          {result &&
            <div className="pg-result">
              <div className="pg-result-head">
                <div className="pg-tabs">
                  <button
                    type="button"
                    className={`pg-tab ${tab === "xml" ? "is-active" : ""}`}
                    onClick={() => setTab("xml")}
                  >XML prompt</button>
                  <button
                    type="button"
                    className={`pg-tab ${tab === "score" ? "is-active" : ""}`}
                    onClick={() => setTab("score")}
                  >Score report</button>
                </div>
                <button type="button" className="pg-copy" onClick={copy}>
                  {copied ? "Copied" : "Copy"}
                </button>
              </div>

              {tab === "xml" &&
                <pre className="pg-pre"><code>{result.xml}</code></pre>
              }

              {tab === "score" &&
                <div className="pg-score">
                  <div className="pg-score-top">
                    <div className="pg-score-num">{result.score.score.toFixed(2)}</div>
                    <div className="pg-score-meta">
                      <div>{result.meta.enrichmentSource === "llm" ? "AI-enriched" : "Heuristic"} · {result.meta.elapsedMs} ms</div>
                      <div className="pg-score-meta-sub">
                        intent: {result.enriched.intent} · complexity: {result.enriched.complexity}
                      </div>
                    </div>
                  </div>
                  <div className="pg-bars">
                    {Object.entries(result.score.breakdown).map(([k, v]) => (
                      <div className="pg-bar" key={k}>
                        <div className="pg-bar-l">{k.replace(/_/g, " ")}</div>
                        <div className="pg-bar-track">
                          <div className="pg-bar-fill" style={{ width: `${v * 100}%` }} />
                        </div>
                        <div className="pg-bar-v">{v.toFixed(2)}</div>
                      </div>
                    ))}
                  </div>
                  {result.score.notes.length > 0 &&
                    <ul className="pg-notes">
                      {result.score.notes.map((n, i) => <li key={i}>{n}</li>)}
                    </ul>
                  }
                </div>
              }
            </div>
          }
        </div>
        </div>
      </div>
    </section>
  );
}

window.PromptGenerator = PromptGenerator;
