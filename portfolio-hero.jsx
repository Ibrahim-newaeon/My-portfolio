/* Hero + DataRibbon + Authority strip */

const HeroMetric = ({ m, idx, inView }) => {
  // parse the value to know if it's a number we should animate
  const numericValue = parseFloat(m.value);
  const hasNum = !isNaN(numericValue);
  const decimals = m.value.includes(".") ? 1 : 0;
  return (
    <div className="metric reveal" style={{ transitionDelay: `${idx * 0.06}s` }}>
      <div className="metric-label">
        <span className="dot" style={{ width: 5, height: 5, borderRadius: "50%", background: "var(--accent)" }}></span>
        {m.label}
      </div>
      <div className="metric-value">
        {hasNum ? (
          <>
            {inView ? <AnimatedNumber value={Math.abs(numericValue)} decimals={decimals} prefix={numericValue < 0 ? "−" : ""} /> : (numericValue < 0 ? "−" : "") + Math.abs(numericValue)}
            {m.unit && <span className="unit">{m.unit}</span>}
          </>
        ) : (
          m.value
        )}
        {m.delta && hasNum && <span className="delta">{m.delta}</span>}
      </div>
      <div className="metric-spark">
        <Sparkline data={m.spark} color="var(--accent)" fill={true} />
      </div>
      {m.delta && !hasNum && <div className="metric-foot">{m.delta}</div>}
    </div>
  );
};

const Hero = ({ headline, sub, inView }) => {
  const meta = window.PORTFOLIO.meta;
  const metrics = window.PORTFOLIO.liveMetrics;
  return (
    <section className="section hero" id="top">
      <div className="container">
        <div className="hero-meta reveal">
          <div className="eyebrow">
            <span className="dot"></span>
            Currently engineering · {meta.available}
          </div>
          <div className="hero-meta-right">
            <span className="live">Available</span>
            <span>{meta.location}</span>
            <span>EST · GMT · GST</span>
          </div>
        </div>

        <h1 className="hero-title reveal" style={{ transitionDelay: "0.08s" }}
            dangerouslySetInnerHTML={{ __html: headline }}>
        </h1>

        <div className="hero-grid">
          <div>
            <p className="hero-sub reveal" style={{ transitionDelay: "0.18s" }}
               dangerouslySetInnerHTML={{ __html: sub }}>
            </p>
            <div className="hero-tags reveal" style={{ transitionDelay: "0.24s" }}>
              <span className="hero-tag"><span className="bullet"></span>Meta Lead Trainer</span>
              <span className="hero-tag"><span className="bullet"></span>AI · B2B Pipeline Architect</span>
              <span className="hero-tag"><span className="bullet"></span>Multi-market Performance</span>
            </div>
            <div className="hero-ctas reveal" style={{ transitionDelay: "0.30s" }}>
              <a href="#work" className="cta-lg">
                View case studies
                <span className="arrow"><Icon name="arrow" size={14} /></span>
              </a>
              <a href="#contact" className="cta-lg alt">
                Book strategy call
                <span className="arrow"><Icon name="arrow-up-right" size={14} /></span>
              </a>
            </div>
          </div>

          <div className="hero-metrics reveal-stagger">
            {metrics.map((m, i) => <HeroMetric key={i} m={m} idx={i} inView={inView} />)}
          </div>
        </div>
      </div>

      <div className="authority-strip">
        <div className="authority-strip-inner">
          {[...window.PORTFOLIO.authorities, ...window.PORTFOLIO.authorities].map((a, i) => (
            <span key={i} className="authority-item">
              <span className="check"><Icon name="check" size={12} /></span>
              {a}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
};

const DataRibbon = () => {
  const ribbon = window.PORTFOLIO.ribbon;
  return (
    <div className="data-ribbon reveal">
      <div className="data-ribbon-inner">
        {ribbon.map((r, i) => (
          <div className="dr-cell" key={i}>
            <div className={`dr-k ${i === 0 ? "accent" : ""}`}>{r.v}</div>
            <div className="dr-l">{r.l}</div>
            <div className="dr-sub">{r.s}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

Object.assign(window, { Hero, DataRibbon });
