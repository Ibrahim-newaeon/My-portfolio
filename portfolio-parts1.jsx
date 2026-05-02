/* global React, D, Counter, Reveal */
const { useState, useEffect, useRef, useMemo } = React;

// ─── Top bar ───────────────────────────────────────────────────
function TopBar({ onOpenCmd, theme, setTheme, showCmdHint }) {
  return (
    <header className="topbar">
      <div className="topbar-inner">
        <a href="#top" className="brand-mark">
          <span className="brand-name">Ibrahim Abed Rabboh</span>
          <span className="brand-dot">·</span>
          <span className="brand-role">Marketing &amp; Media</span>
        </a>
        <nav className="topbar-nav">
          <a href="#services">Services</a>
          <a href="#case-studies">Work</a>
          <a href="#deep-case">Opal</a>
          <a href="#about">About</a>
          <a href="#faq">FAQ</a>
          <a href="#contact">Contact</a>
        </nav>
        <div className="topbar-actions">
          {showCmdHint &&
          <button className="kbd-hint" onClick={onOpenCmd} aria-label="Open command palette">
              <span>Search</span>
              <span className="kbd">⌘</span>
              <span className="kbd">K</span>
            </button>
          }
          <button
            className="theme-btn"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            aria-label="Toggle theme">
            
            {theme === "dark" ?
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" /></svg> :

            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" /></svg>
            }
          </button>
        </div>
      </div>
    </header>);

}

// ─── Hero ──────────────────────────────────────────────────────
function Hero({ heroOverride }) {
  const h = D.hero;
  const titleHtml = heroOverride || h.title_html;
  const tags = [
    "Marketing Director",
    "Google Premier Partner",
    "Meta Lead Trainer",
    "MENA",
  ];
  return (
    <section id="top" className="hero hero-centered">
      <div className="wrap">
        <div className="hero-eyebrow">
          <span className="hero-status-dot" />
          <span>Available</span>
          <span style={{ opacity: 0.5 }}>·</span>
          <span>Amman, JO · GMT+3</span>
        </div>

        <p className="hero-greet">
          <span className="serif italic">Hi,</span> I'm Ibrahim Abed Rabboh.
        </p>

        <h1 className="hero-title" dangerouslySetInnerHTML={{ __html: titleHtml }} />

        <div className="hero-tags-row">
          {tags.map((t, i) => (
            <span key={i} className="hero-hashtag"><span aria-hidden="true">#</span>{t}</span>
          ))}
        </div>

        <p className="hero-sub">{h.sub}</p>

        <div className="hero-actions">
          <a href="#contact" className="btn btn-primary">
            Book a 30-min call <span className="arrow">→</span>
          </a>
          <a href="#deep-case" className="btn">
            Read the Opal deep dive
          </a>
        </div>

        <div className="hero-meta">
          {h.metrics.map((m, i) =>
          <div className="hero-meta-item" key={i}>
              <div className="hero-meta-k">
                <Counter value={m.v} prefix={m.prefix || ""} suffix={m.suffix || ""} />
              </div>
              <div className="hero-meta-l">{m.label}</div>
            </div>
          )}
        </div>

        <a href="#services" className="hero-scroll" aria-label="Scroll to services">
          <span>Scroll</span>
          <span className="hero-scroll-line" aria-hidden="true" />
        </a>
      </div>
    </section>);

}

// ─── Authority strip ───────────────────────────────────────────
function Authority() {
  const items = [...D.authority, ...D.authority];
  return (
    <div className="wrap">
      <div className="authority-strip">
        <div className="authority-label">
          <span>Worked with</span>
        </div>
        <div className="authority-marquee">
          <div className="authority-track">
            {items.map((c, i) => <span key={i}>{c}</span>)}
          </div>
        </div>
      </div>
      <div className="live-strip">
        {D.liveStrip.map((cell, i) =>
        <div className="live-cell" key={i}>
            <div className="live-cell-l">
              <span className="live-cell-pulse" />
              <span>{cell.l}</span>
            </div>
            <div className="live-cell-v">
              <Counter value={cell.v} prefix={cell.prefix || ""} suffix={cell.suffix || ""} />
            </div>
            <div className="live-cell-d">{cell.d}</div>
          </div>
        )}
      </div>
    </div>);

}

// ─── Case studies grid ─────────────────────────────────────────
function CaseCard({ cs, onMouseMove }) {
  const cls = ["cs-card"];
  if (cs.featured) cls.push("featured");
  if (cs.half) cls.push("cs-card-half");
  return (
    <Reveal as="article" className={"reveal " + cls.join(" ")} onMouseMove={onMouseMove}>
      <div className="cs-tag-row">
        <span className="dot" />
        {cs.tags.map((t, i) =>
        <React.Fragment key={i}>
            {i > 0 && <span style={{ opacity: 0.4 }}>·</span>}
            <span>{t}</span>
          </React.Fragment>
        )}
        <span style={{ marginLeft: "auto" }}>{cs.client.split(" — ")[0].slice(0, 24)}</span>
      </div>
      <h3 className="cs-headline">{cs.headline}</h3>
      <p className="cs-sub">{cs.sub}</p>
      <div className="cs-stats">
        {cs.stats.map((s, i) =>
        <div key={i}>
            <div className="cs-stat-k">{s.k}</div>
            <div className="cs-stat-l">{s.l}</div>
          </div>
        )}
      </div>
      <a href={cs.featured ? "#deep-case" : "#"} className="cs-link">
        {cs.featured ? "Read the build" : "Snapshot"} <span>→</span>
      </a>
    </Reveal>);

}

function CaseStudies() {
  const all = D.caseStudies;
  const allTags = useMemo(() => {
    const tags = {};
    all.forEach((cs) => cs.tags.forEach((t) => {tags[t] = (tags[t] || 0) + 1;}));
    return Object.entries(tags).sort((a, b) => b[1] - a[1]);
  }, []);
  const [filter, setFilter] = useState("all");
  const filtered = filter === "all" ? all : all.filter((cs) => cs.tags.includes(filter));

  const handleMove = (e) => {
    const r = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty("--mx", `${e.clientX - r.left}px`);
    e.currentTarget.style.setProperty("--my", `${e.clientY - r.top}px`);
  };

  return (
    <section id="case-studies" className="section">
      <div className="wrap">
        <div className="sec-head">
          <div className="sec-num">02 · Selected work</div>
          <div>
            <h2 className="sec-title">Six engagements where the marketing budget had to defend itself in front of a CFO.</h2>
            <p className="sec-kicker">A representative slice across hospitality, ecommerce and B2B. NDAs cover several more. Filter by what you care about.</p>
          </div>
        </div>

        <div className="cs-filters">
          <span className="cs-filters-label">Filter</span>
          <button
            className="chip"
            aria-pressed={filter === "all"}
            onClick={() => setFilter("all")}>
            
            All <span className="count">{all.length}</span>
          </button>
          {allTags.map(([t, n]) =>
          <button
            key={t}
            className="chip"
            aria-pressed={filter === t}
            onClick={() => setFilter(t)}>
            
              {t} <span className="count">{n}</span>
            </button>
          )}
        </div>

        <div className="cs-grid">
          {filtered.length === 0 ?
          <div className="cs-empty">
              No case studies match — try a different filter.
            </div> :
          filtered.map((cs) =>
          <CaseCard key={cs.id} cs={cs} onMouseMove={handleMove} />
          )}
        </div>
      </div>
    </section>);

}

window.PortfolioParts1 = { TopBar, Hero, Authority, CaseStudies };
Object.assign(window, { TopBar, Hero, Authority, CaseStudies });