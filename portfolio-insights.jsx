/* global React, D, Reveal */
// Recent writing — short post cards.  Reads window.PORTFOLIO_DATA.insights.

function Insights() {
  const i = D.insights;
  if (!i || !Array.isArray(i.items) || i.items.length === 0) return null;

  const fmtDate = (iso) => {
    try {
      const d = new Date(iso);
      return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    } catch { return iso; }
  };

  return (
    <section id="insights" className="section insights-section">
      <div className="wrap">
        <div className="sec-head">
          <div className="sec-num">{i.eyebrow}</div>
          <div>
            <h2 className="sec-title">{i.title}</h2>
            {i.kicker && <p className="sec-kicker">{i.kicker}</p>}
          </div>
        </div>

        <div className="insights-grid">
          {i.items.map((p, idx) => {
            const slug = String(p.id || idx).toLowerCase();
            const href = p.url || "#";
            const isExternal = /^https?:/.test(href);
            return (
              <Reveal as="article" key={slug} className={`reveal insight-card insight-${slug}`} delay={idx * 60}>
                <a
                  className="insight-link"
                  href={href}
                  {...(isExternal ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                >
                  <div className="insight-thumb" aria-hidden="true">
                    <span className="insight-thumb-tag">{p.tag}</span>
                  </div>
                  <div className="insight-body">
                    <div className="insight-meta">
                      <span>{fmtDate(p.date)}</span>
                      {p.readMinutes && (
                        <>
                          <span aria-hidden="true">·</span>
                          <span>{p.readMinutes} min read</span>
                        </>
                      )}
                    </div>
                    <h3 className="insight-title">{p.title}</h3>
                    <p className="insight-excerpt">{p.excerpt}</p>
                    <span className="insight-cta">
                      Read <span aria-hidden="true">→</span>
                    </span>
                  </div>
                </a>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}

window.Insights = Insights;
