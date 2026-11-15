import React, { useEffect, useState } from 'react';

// Visitor counter backed by Abacus (free, no-signup counter API with CORS enabled).
// Each browser is counted once: the first visit "hits" the counter, later visits only read it.
// Local development uses a separate key so testing never inflates the real number.
const API = 'https://abacus.jasoncameron.dev';
const NS = 'folio-k7q2m9';
const LOCAL = /^(localhost|127\.0\.0\.1|\[::1\])$|\.local$/.test(window.location.hostname);
const KEY = LOCAL ? 'visits-dev' : 'visits';
const SEEN = `counted:${NS}:${KEY}`;

const seen = () => { try { return localStorage.getItem(SEEN) === '1'; } catch { return false; } };
const markSeen = () => { try { localStorage.setItem(SEEN, '1'); } catch { /* private mode: fine */ } };

async function fetchCount() {
  const first = !seen();
  const res = await fetch(`${API}/${first ? 'hit' : 'get'}/${NS}/${KEY}`);
  if (!res.ok) {
    // the key only exists after its first hit; a returning visitor on a fresh key should create it
    if (!first && res.status === 404) { markSeen(); const r = await fetch(`${API}/hit/${NS}/${KEY}`); return (await r.json()).value; }
    throw new Error(String(res.status));
  }
  const { value } = await res.json();
  if (first) markSeen();
  return value;
}

export default function VisitorCount({ style }) {
  const [total, setTotal] = useState(null);
  const [shown, setShown] = useState(0);

  useEffect(() => {
    let alive = true;
    fetchCount().then((v) => { if (alive && Number.isFinite(v)) setTotal(v); }).catch(() => {});
    return () => { alive = false; };
  }, []);

  // count up to the total
  useEffect(() => {
    if (total == null) return;
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (reduce) { setShown(total); return; }
    const dur = 1400, t0 = performance.now();
    let raf = 0;
    const step = (now) => {
      const t = Math.min(1, (now - t0) / dur);
      setShown(Math.round(total * (1 - Math.pow(1 - t, 3))));
      if (t < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [total]);

  if (total == null) return null;
  return (
    <span className="visitor-count fade-in inline-flex items-center" style={{ gap: 8, ...style }} title="Unique visitors to this portfolio">
      <i className="visitor-dot" aria-hidden="true" />
      <b style={{ fontStyle: 'normal', fontVariantNumeric: 'tabular-nums' }}>{shown.toLocaleString('en-IN')}</b>
      {total === 1 ? 'visitor' : 'visitors'} so far
    </span>
  );
}
