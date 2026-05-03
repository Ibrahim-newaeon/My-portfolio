/* global React, D */
const { useState, useEffect, useRef, useMemo } = React;

// ─── Contact form ──────────────────────────────────────────────
function ContactForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [budget, setBudget] = useState("");
  const [topic, setTopic] = useState("");
  const [msg, setMsg] = useState("");
  const [touched, setTouched] = useState({});
  const [sent, setSent] = useState(false);

  const errors = {
    name: name.trim().length < 2 ? "Min 2 characters" : null,
    email: !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? "Looks incomplete" : null,
    msg: msg.trim().length < 10 ? "Tell me a little more — 10+ characters" : null,
  };
  const valid = !errors.name && !errors.email && !errors.msg;

  const fieldState = (k) => {
    if (!touched[k]) return "";
    return errors[k] ? "invalid" : "valid";
  };
  const showError = (k) => touched[k] && errors[k];
  const showOk = (k) => touched[k] && !errors[k] && (k === "name" ? name : k === "email" ? email : msg);

  const submit = (e) => {
    e.preventDefault();
    setTouched({ name: true, email: true, msg: true });
    if (!valid) return;
    setSent(true);
    setTimeout(() => setSent(false), 4000);
  };

  return (
    <form className="form" onSubmit={submit} noValidate>
      <div className="form-head">
        <span>New engagement · v1</span>
        <span>{sent ? "Thanks — I'll be in touch" : "Encrypted in flight"}</span>
      </div>

      <div className="field-row">
        <div className="field-group">
          <label>
            <span>Name</span>
            {showError("name") && <span className="err">{errors.name}</span>}
            {showOk("name") && <span className="ok">✓</span>}
          </label>
          <input
            className={"input " + fieldState("name")}
            value={name}
            onChange={(e) => setName(e.target.value)}
            onBlur={() => setTouched(t => ({ ...t, name: true }))}
            placeholder="Lina Karim"
          />
        </div>
        <div className="field-group">
          <label>
            <span>Email</span>
            {showError("email") && <span className="err">{errors.email}</span>}
            {showOk("email") && <span className="ok">✓</span>}
          </label>
          <input
            className={"input " + fieldState("email")}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onBlur={() => setTouched(t => ({ ...t, email: true }))}
            placeholder="lina@company.com"
          />
        </div>
      </div>

      <div className="field-group">
        <label><span>Topic</span></label>
        <select className="select" value={topic} onChange={(e) => setTopic(e.target.value)}>
          <option value="">Pick the closest fit…</option>
          <option>Diagnostic — something is broken</option>
          <option>Build — model, system, pipeline</option>
          <option>Audit — second opinion on a roadmap</option>
          <option>Advisory — fractional, monthly</option>
          <option>Other</option>
        </select>
      </div>

      <div className="field-group">
        <label><span>Budget (USD)</span></label>
        <div className="budget-row">
          {["< $25k", "$25–75k", "$75–200k", "$200k+"].map(b => (
            <button
              type="button"
              key={b}
              className="chip"
              aria-pressed={budget === b}
              onClick={() => setBudget(b)}
            >
              {b}
            </button>
          ))}
        </div>
      </div>

      <div className="field-group">
        <label>
          <span>The problem, in your own words</span>
          {showError("msg") && <span className="err">{errors.msg}</span>}
          {showOk("msg") && <span className="ok">✓ {msg.trim().length} chars</span>}
        </label>
        <textarea
          className={"textarea " + fieldState("msg")}
          value={msg}
          onChange={(e) => setMsg(e.target.value)}
          onBlur={() => setTouched(t => ({ ...t, msg: true }))}
          placeholder="The number that won't move, the model that won't ship, the team that's stuck…"
        />
      </div>

      <div className="form-foot">
        <span className={"form-status" + (sent ? " ok" : "")}>
          {sent ? "✓ Sent — reply within 24h" : "Avg reply: 4 hours"}
        </span>
        <button type="submit" className="btn btn-accent" disabled={sent}>
          {sent ? "Sent" : "Send"} <span className="arrow">→</span>
        </button>
      </div>
    </form>
  );
}

function Contact() {
  const c = D.contact;
  return (
    <section id="contact" className="section">
      <div className="wrap">
        <div className="sec-head">
          <div className="sec-num">08 · Contact</div>
          <div>
            <h2 className="sec-title">{c.pitch}</h2>
            <p className="sec-kicker">{c.body}</p>
          </div>
        </div>
        <div className="contact-grid">
          <div className="contact-pitch">
            <div className="contact-list">
              {c.list.map((l, i) => (
                <a key={i} href={l.href}>
                  <span className="label">{l.l}</span>
                  <span className="v">{l.v}</span>
                  <span className="arrow">↗</span>
                </a>
              ))}
            </div>
          </div>
          <ContactForm />
        </div>
      </div>
    </section>
  );
}

// ─── Footer ────────────────────────────────────────────────────
function Footer() {
  const email = D.meta?.email || "ibrahim@new-aeon.com";
  return (
    <footer className="footer">
      <div className="wrap">
        <div className="footer-lead">
          <div className="footer-lead-text">
            <p className="footer-eyebrow">
              <span className="hero-status-dot" /> Available for two clients per quarter
            </p>
            <h2 className="footer-headline">
              Build the model. <em>Then</em> name the team after it.
            </h2>
          </div>
          <a href={`mailto:${email}`} className="footer-mail">
            <span className="footer-mail-l">Write me</span>
            <span className="footer-mail-v">{email}</span>
            <span className="footer-mail-arrow" aria-hidden="true">→</span>
          </a>
        </div>

        <div className="footer-social" aria-label="Profiles and links">
          <a className="footer-icon" href="https://www.linkedin.com/in/ibrahimabedrabo" aria-label="LinkedIn" target="_blank" rel="noopener noreferrer">
            <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M4.98 3.5C4.98 4.88 3.87 6 2.5 6S0 4.88 0 3.5 1.12 1 2.5 1s2.48 1.12 2.48 2.5zM.22 8h4.56v14H.22V8zM7.5 8h4.36v1.91h.06c.61-1.15 2.1-2.36 4.32-2.36 4.62 0 5.47 3.04 5.47 6.99V22h-4.56v-6.27c0-1.5-.03-3.43-2.09-3.43-2.09 0-2.41 1.63-2.41 3.32V22H7.5V8z" /></svg>
          </a>
          <a className="footer-icon" href={`mailto:${email}`} aria-label="Email">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2" /><path d="M3 7l9 7 9-7" /></svg>
          </a>
          <a className="footer-icon" href="https://www.ziconnect.com" aria-label="Personal site" target="_blank" rel="noopener noreferrer">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true"><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18" /></svg>
          </a>
          <a className="footer-icon" href="https://github.com/Ibrahim-newaeon/My-portfolio" aria-label="Source on GitHub" target="_blank" rel="noopener noreferrer">
            <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.1.79-.25.79-.56v-1.96c-3.2.7-3.87-1.54-3.87-1.54-.52-1.32-1.27-1.67-1.27-1.67-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.18 1.76 1.18 1.02 1.75 2.68 1.24 3.34.95.1-.74.4-1.24.73-1.53-2.55-.29-5.24-1.27-5.24-5.66 0-1.25.45-2.27 1.18-3.07-.12-.29-.51-1.46.11-3.04 0 0 .96-.31 3.16 1.17a11 11 0 0 1 5.76 0c2.2-1.48 3.16-1.17 3.16-1.17.62 1.58.23 2.75.12 3.04.74.8 1.18 1.82 1.18 3.07 0 4.4-2.69 5.36-5.25 5.65.41.35.78 1.05.78 2.12v3.14c0 .31.21.66.8.55C20.21 21.39 23.5 17.07 23.5 12 23.5 5.65 18.35.5 12 .5z" /></svg>
          </a>
        </div>

        <div className="footer-grid">
          <div className="footer-col">
            <h5>Sections</h5>
            <ul>
              <li><a href="#services">Services</a></li>
              <li><a href="#case-studies">Case studies</a></li>
              <li><a href="#deep-case">Opal deep dive</a></li>
              <li><a href="#insights">Recent writing</a></li>
              <li><a href="#prompt-generator">Prompt generator</a></li>
              <li><a href="#about">About</a></li>
              <li><a href="#contact">Contact</a></li>
            </ul>
          </div>
          <div className="footer-col">
            <h5>Direct</h5>
            <ul>
              <li><a href={`mailto:${email}`}>{email}</a></li>
              <li><a href="https://www.linkedin.com/in/ibrahimabedrabo" target="_blank" rel="noopener noreferrer">LinkedIn</a></li>
              <li><a href="https://www.ziconnect.com" target="_blank" rel="noopener noreferrer">ziconnect.com</a></li>
              <li><a href="uploads/Ibrahim%20Abed%20Rabboh%20-%20CV.pdf">CV (PDF)</a></li>
            </ul>
          </div>
          <div className="footer-col">
            <h5>Status</h5>
            <ul>
              <li><span className="availability"><span className="hero-status-dot" />Booking next quarter</span></li>
              <li>Amman · GMT+3</li>
              <li>MENA + GCC</li>
              <li className="sig">v2026.05</li>
            </ul>
          </div>
        </div>

        <div className="footer-bot">
          <span>© 2026 Ibrahim Abed Rabboh · All rights reserved</span>
          <span className="sig">⌘K to navigate</span>
        </div>
      </div>
    </footer>
  );
}

// ─── Command palette ───────────────────────────────────────────
function CommandPalette({ open, onClose, onAction }) {
  const [q, setQ] = useState("");
  const [idx, setIdx] = useState(0);
  const inputRef = useRef(null);

  const items = useMemo(() => {
    const f = q.trim().toLowerCase();
    if (!f) return D.commands;
    return D.commands.filter(c =>
      c.label.toLowerCase().includes(f) ||
      (c.sub || "").toLowerCase().includes(f) ||
      c.section.toLowerCase().includes(f)
    );
  }, [q]);

  // Group
  const grouped = useMemo(() => {
    const g = {};
    items.forEach(c => { (g[c.section] ||= []).push(c); });
    return g;
  }, [items]);

  // flat list for nav
  const flat = useMemo(() => {
    const f = [];
    Object.values(grouped).forEach(group => group.forEach(c => f.push(c)));
    return f;
  }, [grouped]);

  useEffect(() => {
    if (open) {
      setQ("");
      setIdx(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  useEffect(() => { setIdx(0); }, [q]);

  const onKey = (e) => {
    if (e.key === "ArrowDown") { e.preventDefault(); setIdx(i => Math.min(flat.length - 1, i + 1)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setIdx(i => Math.max(0, i - 1)); }
    else if (e.key === "Enter") {
      e.preventDefault();
      const it = flat[idx];
      if (it) { onAction(it); onClose(); }
    } else if (e.key === "Escape") { onClose(); }
  };

  if (!open) return null;
  return (
    <div className={"cmd-overlay " + (open ? "open" : "")} onClick={onClose}>
      <div className="cmd-panel" onClick={(e) => e.stopPropagation()}>
        <div className="cmd-search">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></svg>
          <input
            ref={inputRef}
            className="cmd-input"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={onKey}
            placeholder="Jump to a section, change theme, send an email…"
          />
          <span className="kbd">esc</span>
        </div>
        <div className="cmd-results">
          {flat.length === 0 ? (
            <div style={{ padding: 32, textAlign: "center", color: "var(--ink-mute)" }}>
              No commands match "{q}"
            </div>
          ) : Object.entries(grouped).map(([section, group]) => (
            <div key={section}>
              <div className="cmd-section-h">{section}</div>
              {group.map((c, i) => {
                const flatIndex = flat.indexOf(c);
                return (
                  <button
                    key={i}
                    className={"cmd-item " + (flatIndex === idx ? "active" : "")}
                    onClick={() => { onAction(c); onClose(); }}
                    onMouseEnter={() => setIdx(flatIndex)}
                  >
                    <span className="cmd-item-icon">{c.icon}</span>
                    <span className="cmd-item-meta">
                      <span className="label">{c.label}</span>
                      <span className="sub">{c.sub}</span>
                    </span>
                    {c.shortcut && <span className="cmd-item-shortcut">{c.shortcut}</span>}
                  </button>
                );
              })}
            </div>
          ))}
        </div>
        <div className="cmd-foot">
          <span>Type to filter</span>
          <span className="cmd-foot-keys">
            <span><span className="kbd">↑↓</span> navigate</span>
            <span><span className="kbd">↵</span> select</span>
            <span><span className="kbd">esc</span> close</span>
          </span>
        </div>
      </div>
    </div>
  );
}

window.PortfolioParts3 = { Contact, Footer, CommandPalette };
Object.assign(window, { Contact, Footer, CommandPalette });
