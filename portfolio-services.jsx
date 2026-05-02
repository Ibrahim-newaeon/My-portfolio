/* global React, D, Reveal */
// Services section + final "Let's work together" CTA section.
// Both read from window.PORTFOLIO_DATA so they're CMS-editable.

function Services() {
  const s = D.services;
  if (!s) return null;
  return (
    <section id="services" className="section services-section">
      <div className="wrap">
        <div className="sec-head">
          <div className="sec-num">{s.eyebrow}</div>
          <div>
            <h2 className="sec-title">{s.title}</h2>
            {s.kicker && <p className="sec-kicker">{s.kicker}</p>}
          </div>
        </div>
        <div className="services-grid">
          {s.items.map((item, i) => (
            <Reveal key={item.id} as="article" className="reveal service-card" delay={i * 80}>
              <div className="service-num">{String(i + 1).padStart(2, "0")}</div>
              <div className="service-label">{item.label}</div>
              <h3 className="service-title">{item.title}</h3>
              <p className="service-body">{item.body}</p>
              {item.bullets && item.bullets.length > 0 &&
                <ul className="service-bullets">
                  {item.bullets.map((b, j) => (
                    <li key={j}>
                      <span className="service-bullet-dot" aria-hidden="true">·</span>
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              }
              {item.cta && item.cta.href &&
                <a href={item.cta.href} className="service-cta">
                  {item.cta.label} <span aria-hidden="true">→</span>
                </a>
              }
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function FinalCTA() {
  const c = D.cta;
  if (!c) return null;
  return (
    <section id="cta" className="section cta-section">
      <div className="wrap">
        <div className="cta-card">
          {c.eyebrow && <div className="cta-eyebrow"><span className="dot" />{c.eyebrow}</div>}
          <h2 className="cta-title">{c.title}</h2>
          {c.body && <p className="cta-body">{c.body}</p>}
          <div className="cta-actions">
            {c.primary && c.primary.href &&
              <a href={c.primary.href} className="btn btn-primary cta-primary">
                {c.primary.label} <span aria-hidden="true">→</span>
              </a>
            }
            {c.secondary && c.secondary.href &&
              <a href={c.secondary.href} className="btn btn-ghost cta-secondary">
                {c.secondary.label}
              </a>
            }
          </div>
        </div>
      </div>
    </section>
  );
}

window.Services = Services;
window.FinalCTA = FinalCTA;
