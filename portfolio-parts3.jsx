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
          <div className="sec-num">06 · Contact</div>
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
  return (
    <footer className="footer">
      <div className="wrap">
        <div className="footer-grid">
          <div className="footer-brand">
            <h2>Build the model. <em>Then</em> name the team after it.</h2>
            <p>Independent practice based in Amman. Available for two clients per quarter — the work is better that way.</p>
          </div>
          <div className="footer-col">
            <h5>Pages</h5>
            <ul>
              <li><a href="#case-studies">Case studies</a></li>
              <li><a href="#deep-case">Deep dive</a></li>
              <li><a href="#skills">Skills</a></li>
              <li><a href="#about">About</a></li>
            </ul>
          </div>
          <div className="footer-col">
            <h5>Direct</h5>
            <ul>
              <li><a href="mailto:ibrahim@new-aeon.com">Email</a></li>
              <li><a href="https://www.linkedin.com/in/ibrahimabedrabo">LinkedIn</a></li>
              <li><a href="https://www.ziconnect.com">ziconnect.com</a></li>
              <li><a href="#">CV (PDF)</a></li>
            </ul>
          </div>
          <div className="footer-col">
            <h5>Status</h5>
            <ul>
              <li><span className="availability"><span className="hero-status-dot" />Booking Q3 · 2026</span></li>
              <li>Amman · GMT+3</li>
              <li className="sig">v2026.05 · last edit 2 days ago</li>
            </ul>
          </div>
        </div>
        <div className="footer-bot">
          <span>© 2026 Ibrahim Abed Rabboh · All rights reserved</span>
          <span className="sig">⌘K to navigate · Amman · MENA + GCC</span>
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
