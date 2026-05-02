/* Nav + Command Palette + Theme toggle */

const Nav = ({ onOpenCmd, theme, onToggleTheme, showKbdHint }) => {
  const [scrolled, setScrolled] = React.useState(false);
  const [active, setActive] = React.useState("work");

  React.useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 30);
      // active section detection
      const sections = ["work", "deep", "about", "contact"];
      const y = window.scrollY + 200;
      for (let i = sections.length - 1; i >= 0; i--) {
        const el = document.getElementById(sections[i]);
        if (el && el.offsetTop <= y) { setActive(sections[i]); return; }
      }
      setActive("work");
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const links = [
    { id: "work", label: "Work" },
    { id: "about", label: "About" },
    { id: "contact", label: "Contact" },
  ];

  return (
    <nav className={`nav ${scrolled ? "is-scrolled" : ""}`}>
      <a href="#top" className="nav-brand" onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: "smooth" }); }}>
        <span className="mark">IA</span>
        <span className="name">Ibrahim Abed Rabboh</span>
        <span className="role">— Marketing &amp; Media</span>
      </a>
      <div className="nav-links">
        {links.map((l) => (
          <a key={l.id} href={`#${l.id}`}
             className={`nav-link ${active === l.id ? "is-active" : ""}`}>
            {l.label}
          </a>
        ))}
      </div>
      <div className="nav-actions">
        {showKbdHint && (
          <button className="kbd-hint" onClick={onOpenCmd}>
            <Icon name="search" size={13} />
            <span>Search</span>
            <kbd>⌘K</kbd>
          </button>
        )}
        <button className="icon-btn" onClick={onToggleTheme} aria-label="Toggle theme">
          <Icon name={theme === "dark" ? "sun" : "moon"} size={15} />
        </button>
        <a href="#contact" className="cta-btn">
          Book call
          <span className="arrow"><Icon name="arrow" size={12} /></span>
        </a>
      </div>
    </nav>
  );
};

const CommandPalette = ({ open, onClose, onToggleTheme, theme }) => {
  const [q, setQ] = React.useState("");
  const [sel, setSel] = React.useState(0);
  const inputRef = React.useRef(null);

  const items = React.useMemo(() => [
    { section: "Navigate", items: [
      { id: "work", icon: "chart", label: "Work", sub: "Case studies grid", action: () => goto("work") },
      { id: "deep", icon: "spark", label: "Featured engagement", sub: "Opal Hotel Amman", action: () => goto("deep") },
      { id: "about", icon: "user", label: "About Ibrahim", sub: "Background & affiliations", action: () => goto("about") },
      { id: "contact", icon: "mail", label: "Contact", sub: "Book a strategy call", action: () => goto("contact") },
    ]},
    { section: "Cases", items: window.PORTFOLIO.caseStudies.slice(0, 4).map((c) => ({
      id: c.id, icon: "arrow-up-right", label: c.title.replace(/\.$/, ""), sub: c.eyebrow, action: () => goto("work")
    }))},
    { section: "Actions", items: [
      { id: "theme", icon: theme === "dark" ? "sun" : "moon", label: `Switch to ${theme === "dark" ? "light" : "dark"} theme`, sub: "Toggle appearance", action: onToggleTheme, key: "T" },
      { id: "linkedin", icon: "linkedin", label: "Open LinkedIn", sub: window.PORTFOLIO.meta.linkedin, action: () => window.open("https://" + window.PORTFOLIO.meta.linkedin, "_blank") },
      { id: "email", icon: "mail", label: "Send email", sub: window.PORTFOLIO.meta.email, action: () => window.open("mailto:" + window.PORTFOLIO.meta.email) },
    ]},
  ], [theme, onToggleTheme]);

  function goto(id) {
    onClose();
    setTimeout(() => {
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 80);
  }

  const filtered = React.useMemo(() => {
    if (!q.trim()) return items;
    const ql = q.toLowerCase();
    return items.map((s) => ({
      ...s,
      items: s.items.filter((i) => (i.label + " " + (i.sub || "")).toLowerCase().includes(ql))
    })).filter((s) => s.items.length);
  }, [q, items]);

  const flat = filtered.flatMap((s) => s.items);

  React.useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current && inputRef.current.focus(), 80);
      setQ(""); setSel(0);
    }
  }, [open]);

  React.useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === "Escape") { onClose(); }
      else if (e.key === "ArrowDown") { e.preventDefault(); setSel((s) => Math.min(s + 1, flat.length - 1)); }
      else if (e.key === "ArrowUp") { e.preventDefault(); setSel((s) => Math.max(s - 1, 0)); }
      else if (e.key === "Enter") { e.preventDefault(); flat[sel] && flat[sel].action(); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, flat, sel, onClose]);

  let idx = -1;
  return (
    <div className={`cmd-overlay ${open ? "is-open" : ""}`} onClick={onClose}>
      <div className="cmd-panel" onClick={(e) => e.stopPropagation()}>
        <div className="cmd-input-wrap">
          <Icon name="search" size={18} />
          <input ref={inputRef} placeholder="Type to search work, sections, actions…" value={q}
                 onChange={(e) => { setQ(e.target.value); setSel(0); }} />
          <span className="cmd-esc">ESC</span>
        </div>
        <div className="cmd-list">
          {filtered.length === 0 && (
            <div style={{ padding: "32px 16px", textAlign: "center", color: "var(--ink-mute)", fontSize: 14 }}>
              No matches for "<strong style={{ color: "var(--ink)" }}>{q}</strong>"
            </div>
          )}
          {filtered.map((s) => (
            <div key={s.section}>
              <div className="cmd-section-h">{s.section}</div>
              {s.items.map((i) => {
                idx++;
                const cur = idx;
                return (
                  <div key={i.id}
                       className={`cmd-item ${cur === sel ? "is-selected" : ""}`}
                       onMouseEnter={() => setSel(cur)}
                       onClick={i.action}>
                    <span className="ico"><Icon name={i.icon} size={14} /></span>
                    <span className="label">{i.label}{i.sub && <small>{i.sub}</small>}</span>
                    {i.key && <span className="key">{i.key}</span>}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
        <div className="cmd-foot">
          <span>Quick navigation</span>
          <span className="keys">
            <span><kbd>↑</kbd><kbd>↓</kbd> navigate</span>
            <span><kbd>↵</kbd> select</span>
            <span><kbd>esc</kbd> close</span>
          </span>
        </div>
      </div>
    </div>
  );
};

Object.assign(window, { Nav, CommandPalette });
