/* global React, D, Counter, Reveal */
const { useState, useEffect, useRef } = React;

// ─── Deep case study ───────────────────────────────────────────
function DeepCase() {
  const c = D.deepCase;
  const sectionRef = useRef(null);
  const [active, setActive] = useState(c.blocks[0].id);

  useEffect(() => {
    const els = c.blocks.map((b) => document.getElementById("dc-" + b.id)).filter(Boolean);
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) setActive(e.target.id.replace(/^dc-/, ""));
      });
    }, { rootMargin: "-30% 0px -55% 0px" });
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  return (
    <section id="deep-case" className="section" ref={sectionRef}>
      <div className="wrap">
        <div className="sec-head">
          <div className="sec-num">03 · Long form</div>
          <div>
            <h2 className="sec-title">A representative engagement, end to end.</h2>
            <p className="sec-kicker">Three years in. One hotel. The full P&amp;L story.</p>
          </div>
        </div>

        <div className="cs-deep">
          <aside className="cs-deep-aside">
            {c.meta.map((m, i) =>
            <div className="field" key={i}>
                <span className="field-l">{m.l}</span>
                <span className="field-v">{m.v}</span>
              </div>
            )}
            <div>
              <span className="field-l" style={{ display: "block", marginBottom: 12 }}>Sections</span>
              <nav className="nav-list">
                {c.blocks.map((b) =>
                <a
                  key={b.id}
                  href={"#dc-" + b.id}
                  className={active === b.id ? "active" : ""}>
                  
                    {b.h || (b.type === "callout" ? "Testimonial" : b.id)}
                  </a>
                )}
              </nav>
            </div>
          </aside>

          <div className="cs-deep-body">
            <Reveal className="reveal cs-deep-hero">
              <div className="eyebrow">{c.eyebrow}</div>
              <h3 className="h">{c.h}</h3>
              <p className="lede">{c.lede}</p>
              <div className="stats">
                {c.stats.map((s, i) =>
                <div className="stat" key={i}>
                    <div className="stat-k">{s.k}</div>
                    <div className="stat-l">{s.l}</div>
                  </div>
                )}
              </div>
            </Reveal>

            {c.blocks.map((b, i) =>
            <Reveal key={b.id} className="reveal cs-block" id={"dc-" + b.id}>
                {b.type === "callout" ?
              <div className="cs-callout">
                    <div>{b.text}</div>
                    <div className="by">— {b.by}</div>
                  </div> :

              <>
                    <h4 className="h">
                      <span className="num-tag">{String(i + 1).padStart(2, "0")}</span>
                      <span>{b.h}</span>
                    </h4>
                    {b.body && <p>{b.body}</p>}
                    {b.list &&
                <ul>
                        {b.list.map((it, j) =>
                  <li key={j}><b>{it.b}</b><span className="li-t">{it.t}</span></li>
                  )}
                      </ul>
                }
                    {b.chart && <ConvChart />}
                  </>
              }
              </Reveal>
            )}
          </div>
        </div>
      </div>
    </section>);

}

function ConvChart() {
  // Synthetic: weekly conversion baseline vs model
  const W = 14;
  const baseline = Array.from({ length: W }, (_, i) => 22 + Math.sin(i / 2) * 0.6 + (i > 6 ? -0.3 : 0));
  const model = Array.from({ length: W }, (_, i) =>
  i < 3 ? baseline[i] + 0.2 :
  i < 6 ? baseline[i] + 0.8 + (i - 3) * 0.4 :
  baseline[i] + 4 + Math.sin(i / 3) * 0.4
  );
  const w = 700,h = 200,pad = 28;
  const xs = (i) => pad + i / (W - 1) * (w - pad * 2);
  const min = 20,max = 30;
  const ys = (v) => h - pad - (v - min) / (max - min) * (h - pad * 2);
  const path = (data) => data.map((v, i) => `${i ? "L" : "M"}${xs(i).toFixed(1)},${ys(v).toFixed(1)}`).join(" ");
  const area = (data) => `${path(data)} L${xs(W - 1).toFixed(1)},${(h - pad).toFixed(1)} L${pad},${(h - pad).toFixed(1)} Z`;

  return (
    <div className="chart">
      <div className="chart-head">
        <span>Direct-booking conversion · weekly · baseline vs new stack</span>
        <span>Q1 → Q4 2024</span>
      </div>
      <svg className="chart-svg" viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none">
        <defs>
          <linearGradient id="g-acc" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.25" />
            <stop offset="100%" stopColor="var(--accent)" stopOpacity="0" />
          </linearGradient>
        </defs>
        {[22, 24, 26, 28].map((v) =>
        <g key={v}>
            <line x1={pad} x2={w - pad} y1={ys(v)} y2={ys(v)} stroke="var(--line-faint)" />
            <text x={4} y={ys(v) + 4} fontSize="11" fill="var(--ink-mute)" fontFamily="ui-monospace">{v}%</text>
          </g>
        )}
        <line x1={xs(5.5)} x2={xs(5.5)} y1={pad} y2={h - pad} stroke="var(--ink-mute)" strokeDasharray="4 4" opacity="0.4" />
        <text x={xs(5.5) + 6} y={pad + 12} fontSize="11" fill="var(--ink-mute)">Stack rebuilt</text>

        <path d={area(model)} fill="url(#g-acc)" />
        <path d={path(baseline)} stroke="var(--ink-mute)" strokeWidth="1.5" fill="none" strokeDasharray="3 3" />
        <path d={path(model)} stroke="var(--accent)" strokeWidth="2.5" fill="none" />
        {model.map((v, i) =>
        <circle key={i} cx={xs(i)} cy={ys(v)} r="3" fill="var(--accent)" />
        )}
      </svg>
      <div className="chart-legend">
        <span><span className="swatch" style={{ background: "var(--ink-mute)" }} />Baseline (old stack)</span>
        <span><span className="swatch" style={{ background: "var(--accent)" }} />New media stack</span>
      </div>
    </div>);

}

// ─── Skills ────────────────────────────────────────────────────
function Skills() {
  return (
    <section id="skills" className="section">
      <div className="wrap">
        <div className="sec-head">
          <div className="sec-num">04 · How I work</div>
          <div>
            <h2 className="sec-title">Media buying, strategy, brand — three muscles that have to fire together.</h2>
            <p className="sec-kicker">Most marketing failures live at the seams. So does the compounding work.</p>
          </div>
        </div>
        <div className="skills-grid">
          {D.skills.map((c, i) =>
          <Reveal key={i} className="reveal skill-cluster" delay={i * 80}>
              <h3 className="skill-cluster-h" data-num={String(i + 1).padStart(2, "0")}>{c.h}</h3>
              <div className="skill-pills">
                {c.pills.map((p, j) => <span key={j} className="skill-pill">{p}</span>)}
              </div>
              <div className="skill-meta">
                <span>{c.meta.l}</span>
                <span>{c.meta.r}</span>
              </div>
            </Reveal>
          )}
        </div>
      </div>
    </section>);

}

// ─── About ─────────────────────────────────────────────────────
function About() {
  const a = D.about;
  const bigStats = [
    { v: 15, suffix: "+", l: "Years", s: "Building marketing functions that survive a CFO review." },
    { v: 4,  suffix: "",  l: "Markets", s: "Jordan, KSA, UAE and Kuwait. Arabic-first when it matters." },
    { v: 6,  suffix: "+", l: "Engagements shown", s: "Hospitality, ecommerce, professional services, podcast." },
  ];
  return (
    <section id="about" className="section">
      <div className="wrap">
        <div className="sec-head">
          <div className="sec-num">05 · The person</div>
          <div>
            <h2 className="sec-title">Fifteen years across hospitality, ecommerce and B2B — <em>same operator, same standards.</em></h2>
          </div>
        </div>
        <div className="big-stats">
          {bigStats.map((s, i) => (
            <Reveal as="div" key={i} className="reveal big-stat" delay={i * 60}>
              <div className="big-stat-label">{s.l}</div>
              <div className="big-stat-value">
                <Counter value={s.v} suffix={s.suffix} />
              </div>
              <div className="big-stat-sub">{s.s}</div>
            </Reveal>
          ))}
        </div>
        <div className="about-grid">
          <aside className="about-card">
            <div className="about-photo">
              <div className="about-photo-init">{a.initial}</div>
            </div>
            <h4>{a.name}</h4>
            <div className="role">{a.role}</div>
            <div className="loc">
              <dl>
                {Object.entries(a.location).map(([k, v]) =>
                <React.Fragment key={k}>
                    <dt>{k}</dt><dd>{v}</dd>
                  </React.Fragment>
                )}
              </dl>
            </div>
          </aside>
          <div className="about-body">
            <Reveal className="reveal about-lede">
              <span dangerouslySetInnerHTML={{ __html: a.lede_html }} />
            </Reveal>
            <Reveal className="reveal about-text">{a.text}</Reveal>
            <Reveal className="reveal">
              <div className="timeline">
                {a.timeline.map((r, i) =>
                <div className="timeline-row" key={i}>
                    <div className="timeline-yr">{r.yr}</div>
                    <div>
                      <div className="timeline-h">{r.h}</div>
                      <div className="timeline-org">{r.org}</div>
                    </div>
                    <div className="timeline-tag">{r.tag}</div>
                  </div>
                )}
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </section>);

}

window.PortfolioParts2 = { DeepCase, Skills, About };
Object.assign(window, { DeepCase, Skills, About });