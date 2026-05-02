/* Work grid + visualizations inside cards */

// Tiny synthetic chart used for cards — area chart
const CardArea = ({ color = "var(--accent)", data, gridLines = true, label }) => {
  const w = 100, h = 50;
  if (!data) data = [12, 18, 22, 19, 28, 32, 38, 42, 50, 56, 62, 70];
  const min = Math.min(...data), max = Math.max(...data);
  const range = max - min || 1;
  const step = w / (data.length - 1);
  const pts = data.map((v, i) => [i * step, h - ((v - min) / range) * (h - 6) - 3]);
  const path = pts.map((p, i) => i === 0 ? `M ${p[0]} ${p[1]}` : `L ${p[0]} ${p[1]}`).join(" ");
  const area = `${path} L ${w} ${h} L 0 ${h} Z`;
  return (
    <div style={{ position: "relative", width: "100%", height: "100%", padding: 16,
                  background: "var(--paper-2)", borderRadius: "var(--radius)" }}>
      {label && <div style={{ position: "absolute", top: 12, left: 14, fontSize: 11, letterSpacing: "0.12em", textTransform: "uppercase", fontWeight: 600, color: "var(--ink-mute)" }}>{label}</div>}
      <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" style={{ width: "100%", height: "100%" }}>
        {gridLines && [0.25, 0.5, 0.75].map((p, i) => (
          <line key={i} x1="0" x2={w} y1={h*p} y2={h*p} stroke="var(--line-faint)" strokeWidth="0.4" strokeDasharray="0.6 0.6" />
        ))}
        <path d={area} fill={color} opacity="0.14" />
        <path d={path} fill="none" stroke={color} strokeWidth="1.2" />
        <circle cx={pts[pts.length-1][0]} cy={pts[pts.length-1][1]} r="1.6" fill={color} />
      </svg>
    </div>
  );
};

// Bar chart card
const CardBars = ({ label }) => {
  const bars = [40, 60, 35, 80, 55, 90, 65, 95];
  return (
    <div style={{ position: "relative", width: "100%", height: "100%", padding: 16, background: "var(--paper-2)", borderRadius: "var(--radius)" }}>
      {label && <div style={{ fontSize: 11, letterSpacing: "0.12em", textTransform: "uppercase", fontWeight: 600, color: "var(--ink-mute)", marginBottom: 12 }}>{label}</div>}
      <div style={{ display: "grid", gridTemplateColumns: `repeat(${bars.length}, 1fr)`, gap: 6, alignItems: "flex-end", height: "calc(100% - 24px)" }}>
        {bars.map((h, i) => (
          <div key={i} style={{ height: `${h}%`, background: i === bars.length - 1 ? "var(--accent)" : "var(--accent-soft)", borderRadius: 4 }}></div>
        ))}
      </div>
    </div>
  );
};

// Pipe / dataflow diagram
const CardPipe = ({ label }) => (
  <div style={{ width: "100%", height: "100%", padding: 16, background: "var(--paper-2)", borderRadius: "var(--radius)", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
    {label && <div style={{ fontSize: 11, letterSpacing: "0.12em", textTransform: "uppercase", fontWeight: 600, color: "var(--ink-mute)" }}>{label}</div>}
    <div style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr auto 1fr", alignItems: "center", gap: 4, fontSize: 11 }}>
      {["Signal", "Model", "Action"].map((s, i, arr) => (
        <React.Fragment key={s}>
          <div style={{ background: "var(--paper)", border: "1px solid var(--line-soft)", padding: "8px 6px", borderRadius: 6, textAlign: "center", fontWeight: 600, color: "var(--ink)" }}>{s}</div>
          {i < arr.length - 1 && <span style={{ color: "var(--accent)" }}>→</span>}
        </React.Fragment>
      ))}
    </div>
    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: "var(--ink-mute)", letterSpacing: "0.06em", textTransform: "uppercase", fontWeight: 600 }}>
      <span>EVENTS</span><span>SCORE</span><span>ROUTE</span>
    </div>
  </div>
);

// World map dots
const CardMap = ({ label, dotsOnly }) => {
  const dots = [
    { x: 50, y: 35, name: "EU" },
    { x: 56, y: 45, name: "GCC" },
    { x: 22, y: 38, name: "US" },
    { x: 60, y: 48, name: "KSA" },
    { x: 58, y: 42, name: "UAE" },
  ];
  return (
    <div style={{ position: "relative", width: "100%", height: "100%", padding: 16, background: "var(--paper-2)", borderRadius: "var(--radius)" }}>
      {label && <div style={{ fontSize: 11, letterSpacing: "0.12em", textTransform: "uppercase", fontWeight: 600, color: "var(--ink-mute)", marginBottom: 8 }}>{label}</div>}
      <svg viewBox="0 0 100 60" style={{ width: "100%", height: "calc(100% - 22px)" }}>
        {/* dotted continents background */}
        {Array.from({length: 8}).map((_, row) =>
          Array.from({length: 18}).map((_, col) => {
            const x = 6 + col * 5.2, y = 8 + row * 5.6;
            const inLand = (x > 14 && x < 38 && y > 12 && y < 36) ||
                           (x > 42 && x < 70 && y > 8 && y < 32) ||
                           (x > 66 && x < 92 && y > 14 && y < 40);
            return inLand ? <circle key={`${row}-${col}`} cx={x} cy={y} r="0.5" fill="var(--ink-faint)" /> : null;
          })
        )}
        {dots.map((d, i) => (
          <g key={i}>
            <circle cx={d.x} cy={d.y} r="3" fill="var(--accent)" opacity="0.2">
              <animate attributeName="r" values="3;6;3" dur="2s" repeatCount="indefinite" begin={`${i * 0.4}s`} />
            </circle>
            <circle cx={d.x} cy={d.y} r="1.4" fill="var(--accent)" />
          </g>
        ))}
      </svg>
    </div>
  );
};

// Cohort grid
const CardCohort = ({ label }) => {
  const cells = Array.from({length: 48});
  return (
    <div style={{ width: "100%", height: "100%", padding: 16, background: "var(--paper-2)", borderRadius: "var(--radius)" }}>
      {label && <div style={{ fontSize: 11, letterSpacing: "0.12em", textTransform: "uppercase", fontWeight: 600, color: "var(--ink-mute)", marginBottom: 12 }}>{label}</div>}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(12, 1fr)", gap: 3 }}>
        {cells.map((_, i) => {
          const ratio = (i % 12) / 11;
          const opacity = 0.15 + ratio * 0.85;
          const isHi = (i % 12) >= 8;
          return <div key={i} style={{ aspectRatio: "1", background: isHi ? `rgba(232,93,79,${opacity})` : `rgba(26,24,20,${opacity * 0.3})`, borderRadius: 2 }}></div>;
        })}
      </div>
    </div>
  );
};

const WorkCard = ({ c, idx }) => {
  let viz = null;
  if (c.id === "lead-scoring") viz = <div className="wc-viz tall"><CardPipe label="Lead → score → action · live pipeline" /></div>;
  else if (c.id === "gcc-eu-paid") viz = <div className="wc-viz"><CardMap label="Active markets" /></div>;
  else if (c.id === "predictive-dash") viz = <div className="wc-viz"><CardArea color="var(--accent)" data={[20,28,25,38,45,52,60,72,68,80,88,94]} label="90-day pipeline forecast" /></div>;
  else if (c.id === "tracking-infra") viz = <div className="wc-viz"><CardBars label="Match-quality score · weekly" /></div>;
  else if (c.id === "meta-training") viz = <div className="wc-viz"><CardCohort label="Cohort completion · 12 cohorts" /></div>;
  else if (c.id === "cro") viz = <div className="wc-viz"><CardArea color="var(--accent)" data={[30,35,42,38,55,62,70,78,85,92,98,118]} label="Demo bookings · 10 weeks" /></div>;

  return (
    <article className={`work-card ${c.span} ${c.featured ? "featured" : ""}`}
             data-tags={c.tags.join(",")}
             style={{ animationDelay: `${idx * 0.04}s` }}>
      <div className="wc-head">
        <div className="wc-eyebrow">
          <span className="dot"></span>
          {c.eyebrow} · {c.year}
        </div>
        <div className="wc-arrow"><Icon name="arrow-up-right" size={14} /></div>
      </div>
      <h3 className="wc-title">{c.title}</h3>
      <p className="wc-desc">{c.desc}</p>
      {viz}
      <div className="wc-stack">
        {c.stack.map((s) => <span key={s} className="wc-pill">{s}</span>)}
      </div>
      <div className="wc-kpis">
        {c.kpis.map((k, i) => (
          <div key={i} className="wc-kpi">
            <div className="wc-kpi-v">{k.v}</div>
            <div className="wc-kpi-l">{k.l}</div>
          </div>
        ))}
      </div>
    </article>
  );
};

const Work = () => {
  const [filter, setFilter] = React.useState("all");
  const cs = window.PORTFOLIO.caseStudies;
  const filters = window.PORTFOLIO.filters.map((f) => ({
    ...f,
    count: f.id === "all" ? cs.length : cs.filter((c) => c.tags.includes(f.id)).length,
  }));
  const visible = filter === "all" ? cs : cs.filter((c) => c.tags.includes(filter));

  return (
    <section className="section" id="work">
      <div className="container">
        <div className="section-head reveal">
          <div>
            <div className="eyebrow"><span className="dot"></span>Selected work · 2024–2025</div>
            <h2 className="section-title">
              Systems that ship pipeline, <span className="italic">not slides</span>.
            </h2>
          </div>
          <div className="section-meta">
            <span className="count">{cs.length}</span>
            <span>Engagements</span>
            <span>across {cs.reduce((acc, c) => acc + (c.kpis ? 1 : 0), 0)}+ markets</span>
          </div>
        </div>

        <div className="filters reveal">
          {filters.map((f) => (
            <button key={f.id}
                    className={`filter ${filter === f.id ? "is-active" : ""}`}
                    onClick={() => setFilter(f.id)}>
              {f.label}
              <span className="count">{f.count}</span>
            </button>
          ))}
        </div>

        <div className="work-grid reveal-stagger" key={filter}>
          {visible.map((c, i) => <WorkCard key={c.id} c={c} idx={i} />)}
        </div>
      </div>
    </section>
  );
};

Object.assign(window, { Work });
