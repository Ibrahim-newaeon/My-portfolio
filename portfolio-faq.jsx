/* global React, D, Reveal */
// Portavia-inspired FAQ accordion + Testimonial card.
// Both read window.PORTFOLIO_DATA so they're CMS-editable.

function FAQ() {
  const f = D.faq;
  if (!f) return null;
  const [open, setOpen] = React.useState(0);
  return (
    <section id="faq" className="section faq-section">
      <div className="wrap">
        <div className="sec-head">
          <div className="sec-num">{f.eyebrow}</div>
          <div>
            <h2 className="sec-title">{f.title}</h2>
            {f.kicker && <p className="sec-kicker">{f.kicker}</p>}
          </div>
        </div>
        <div className="faq-list">
          {f.items.map((item, i) => {
            const isOpen = open === i;
            const num = String(i + 1).padStart(2, "0");
            return (
              <Reveal as="div" key={i} className={`reveal faq-item ${isOpen ? "is-open" : ""}`} delay={i * 40}>
                <button
                  type="button"
                  className="faq-q"
                  aria-expanded={isOpen}
                  onClick={() => setOpen(isOpen ? -1 : i)}
                >
                  <span className="faq-num">{num}</span>
                  <span className="faq-q-text">{item.q}</span>
                  <span className="faq-toggle" aria-hidden="true">
                    <span className="faq-toggle-bar" />
                    <span className="faq-toggle-bar v" />
                  </span>
                </button>
                <div className="faq-a-wrap">
                  <div className="faq-a">{item.a}</div>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function Testimonial() {
  const t = D.testimonial;
  if (!t) return null;
  return (
    <section id="testimonial" className="section testimonial-section">
      <div className="wrap">
        <div className="sec-head">
          <div className="sec-num">{t.eyebrow}</div>
          <div>
            <h2 className="sec-title">{t.title}</h2>
            {t.kicker && <p className="sec-kicker">{t.kicker}</p>}
          </div>
        </div>
        <Reveal as="figure" className="reveal testimonial-card">
          <div className="testimonial-mark" aria-hidden="true">&ldquo;</div>
          <blockquote className="testimonial-quote">{t.quote}</blockquote>
          <figcaption className="testimonial-attrib">
            <div className="testimonial-attrib-rule" aria-hidden="true" />
            <div>
              <div className="testimonial-name">{t.name}</div>
              <div className="testimonial-role">{t.role}</div>
              {t.engagement && <div className="testimonial-engagement">{t.engagement}</div>}
            </div>
          </figcaption>
        </Reveal>
      </div>
    </section>
  );
}

window.FAQ = FAQ;
window.Testimonial = Testimonial;
