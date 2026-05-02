/* global React, ReactDOM */
const { useState, useEffect, useRef, useMemo, useCallback } = React;

const D = window.PORTFOLIO_DATA;

// ─── Animated counter ──────────────────────────────────────────
function useCountUp(target, { duration = 1400, start = false, decimals = 0 } = {}) {
  const [v, setV] = useState(0);
  useEffect(() => {
    if (!start) return;
    let raf;
    const t0 = performance.now();
    const tick = (t) => {
      const p = Math.min(1, (t - t0) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setV(target * eased);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration, start]);
  return decimals > 0 ? v.toFixed(decimals) : Math.round(v);
}

function Counter({ value, prefix = "", suffix = "", className = "" }) {
  const ref = useRef(null);
  const [seen, setSeen] = useState(false);
  // Start on mount with a small delay; use IO only to optionally re-trigger if scrolled into view.
  useEffect(() => {
    const t = setTimeout(() => setSeen(true), 250);
    return () => clearTimeout(t);
  }, []);
  const n = useCountUp(value, { start: seen });
  return (
    <span ref={ref} className={"tabular " + className}>
      {prefix}{n.toLocaleString()}<span className="unit">{suffix}</span>
    </span>
  );
}

// ─── Reveal on scroll ──────────────────────────────────────────
function Reveal({ children, delay = 0, as: Tag = "div", className = "", ...rest }) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let done = false;
    const show = () => {
      if (done) return;
      done = true;
      setTimeout(() => el.classList.add("in"), delay);
    };
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { show(); io.disconnect(); }
    }, { threshold: 0.05, rootMargin: "0px 0px -5% 0px" });
    io.observe(el);
    // Fallback: always show within 1.5s even if IO never fires
    const fallback = setTimeout(() => { show(); io.disconnect(); }, 1500);
    return () => { clearTimeout(fallback); io.disconnect(); };
  }, [delay]);
  const cls = className.includes("reveal") ? className : ("reveal " + className).trim();
  return <Tag ref={ref} className={cls} {...rest}>{children}</Tag>;
}

window.PortfolioCommon = { Counter, Reveal, useCountUp };
Object.assign(window, { Counter, Reveal, useCountUp });
