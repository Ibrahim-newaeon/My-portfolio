/* global React, D, Counter, Reveal */
const { useState, useEffect, useRef, useMemo } = React;

// ─── Top bar ───────────────────────────────────────────────────
function TopBar({ onOpenCmd, theme, setTheme, showCmdHint }) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 64);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return (
    <header className={`topbar ${scrolled ? "is-scrolled" : ""}`}>
      <div className="topbar-inner">
        <a href="#top" className="brand-mark">
          <span className="brand-name">Ibrahim Abed Rabboh</span>
          <span className="brand-dot">·</span>
          <span className="brand-role">Marketing &amp; Media</span>
        </a>
        <nav className="topbar-nav">
          <a href="#services">{t({ en: "Services", ar: "الخدمات" })}</a>
          <a href="#case-studies">{t({ en: "Work", ar: "أعمال" })}</a>
          <a href="#deep-case">{t({ en: "Opal", ar: "أوبال" })}</a>
          <a href="#insights">{t({ en: "Writing", ar: "كتابات" })}</a>
          <a href="/prompt-generator" className="topbar-nav-feature">{t({ en: "Prompt generator", ar: "مولِّد البرومبت" })}</a>
          <a href="#about">{t({ en: "About", ar: "عنّي" })}</a>
          <a href="#contact">{t({ en: "Contact", ar: "تواصل" })}</a>
        </nav>
        <div className="topbar-actions">
          <a
            className="lang-toggle"
            href={typeof document !== "undefined" && document.documentElement.lang === "ar" ? "/" : "/ar"}
            aria-label="Toggle language">
            {typeof document !== "undefined" && document.documentElement.lang === "ar" ? "EN" : "ع"}
          </a>
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
  const tags = t({
    en: ["Marketing Director", "Google Premier Partner", "Meta Lead Trainer", "MENA"],
    ar: ["مدير تسويق", "شريك جوجل المتميّز", "مدرّب ميتا المعتمد", "الشرق الأوسط"],
  });
  return (
    <section id="top" className="hero hero-centered">
      <div className="wrap">
        <div className="hero-eyebrow">
          <span className="hero-status-dot" />
          <span>{t({ en: "Available", ar: "متاح" })}</span>
          <span style={{ opacity: 0.5 }}>·</span>
          <span>{t({ en: "Amman, JO · GMT+3", ar: "عمّان، الأردن · GMT+3" })}</span>
        </div>

        <p className="hero-greet">
          <span className="serif italic">{t({ en: "Hi,", ar: "مرحبًا،" })}</span>{" "}
          {t({ en: "I'm Ibrahim Abed Rabboh.", ar: "أنا إبراهيم عبد ربه." })}
        </p>

        <h1 className="hero-title" dangerouslySetInnerHTML={{ __html: titleHtml }} />

        <div className="hero-tags-row">
          {tags.map((tag, i) => (
            <span key={i} className="hero-hashtag"><span aria-hidden="true">#</span>{tag}</span>
          ))}
        </div>

        <p className="hero-sub">{h.sub}</p>

        <div className="hero-actions">
          <a href="#contact" className="btn btn-primary">
            {t({ en: "Book a 30-min call", ar: "احجز مكالمة ٣٠ دقيقة" })} <span className="arrow">→</span>
          </a>
          <a href="#deep-case" className="btn">
            {t({ en: "Read the Opal deep dive", ar: "اقرأ تحليل أوبال المعمّق" })}
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

        <a href="#services" className="hero-scroll" aria-label={t({ en: "Scroll to services", ar: "انتقل إلى الخدمات" })}>
          <span>{t({ en: "Scroll", ar: "اسحب" })}</span>
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
          <span>{t({ en: "Worked with", ar: "بالتعاون مع" })}</span>
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
  const idSlug = String(cs.id || "").toLowerCase();
  const primaryTag = cs.tags?.[0] || "";
  return (
    <Reveal as="article" className="reveal cs-card" onMouseMove={onMouseMove}>
      <div className={`cs-thumb cs-thumb-${idSlug}`}>
        <div className="cs-thumb-tag">{primaryTag}</div>
        <div className="cs-thumb-art" aria-hidden="true" />
        <div className="cs-thumb-client">{cs.client}</div>
      </div>
      <div className="cs-body">
        <div className="cs-tag-row">
          {cs.tags.map((t, i) =>
            <React.Fragment key={i}>
              {i > 0 && <span style={{ opacity: 0.4 }}>·</span>}
              <span>{t}</span>
            </React.Fragment>
          )}
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
          {cs.featured
            ? t({ en: "Read the full build", ar: "اقرأ التحليل الكامل" })
            : t({ en: "Snapshot", ar: "لمحة سريعة" })} <span>→</span>
        </a>
      </div>
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
          <div className="sec-num">{t({ en: "02 · Selected work", ar: "٠٢ · أعمال مختارة" })}</div>
          <div>
            <h2 className="sec-title">{t({
              en: "Six engagements where the marketing budget had to defend itself in front of a CFO.",
              ar: "ست تجارب اضطرّت فيها ميزانية التسويق للدفاع عن نفسها أمام المدير المالي.",
            })}</h2>
            <p className="sec-kicker">{t({
              en: "A representative slice across hospitality, ecommerce and B2B. NDAs cover several more. Filter by what you care about.",
              ar: "شريحة تمثيلية عبر الضيافة والتجارة الإلكترونية و B2B. اتفاقيات السرّية تغطّي تعاقدات أخرى. صَفِّ بما يهمّك.",
            })}</p>
          </div>
        </div>

        <div className="cs-filters">
          <span className="cs-filters-label">{t({ en: "Filter", ar: "تصفية" })}</span>
          <button
            className="chip"
            aria-pressed={filter === "all"}
            onClick={() => setFilter("all")}>

            {t({ en: "All", ar: "الكل" })} <span className="count">{all.length}</span>
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