import React, { useEffect, useRef, useState } from 'react';
import { currentTheme, toggleTheme } from '../lib/theme';

// A hand-drawn lamp hanging from the top of the screen. Tug the cord (click, tap, drag down, or Enter)
// and the lights go out: night spreads from the bulb like an ink blot. Tug again and light pours back.
export default function ThemeCord({ className = '' }) {
  const [theme, setTheme] = useState(currentTheme);
  const [tug, setTug] = useState(0); // bumps on every pull, restarting the stretch + swing animation
  const [drag, setDrag] = useState(0); // live stretch while dragging (px)
  const [hint, setHint] = useState(() => { try { return !localStorage.getItem('cordPulled'); } catch { return false; } });
  const bulb = useRef(null);
  const start = useRef(null);

  useEffect(() => {
    const on = (e) => setTheme(e.detail);
    window.addEventListener('themechange', on);
    return () => window.removeEventListener('themechange', on);
  }, []);

  const pull = () => {
    setTug((n) => n + 1);
    if (hint) { setHint(false); try { localStorage.setItem('cordPulled', '1'); } catch { /* fine */ } }
    const r = bulb.current.getBoundingClientRect();
    // let the cord reach full stretch, then flip the lights as it snaps back (the "click")
    setTimeout(() => toggleTheme(r.left + r.width / 2, r.top + r.height * 0.45), 170);
  };

  const onDown = (e) => {
    start.current = { y: e.clientY, moved: false };
    e.currentTarget.setPointerCapture?.(e.pointerId);
  };
  const onMove = (e) => {
    if (!start.current) return;
    const d = Math.max(0, Math.min(60, e.clientY - start.current.y));
    if (d > 3) start.current.moved = true;
    setDrag(d);
  };
  const onUp = () => {
    if (!start.current) return;
    const { moved } = start.current;
    start.current = null;
    setDrag(0);
    if (!moved || drag > 18) pull(); // a click, or a real tug; a tiny accidental drag does nothing
  };

  const dark = theme === 'dark';
  return (
    <div className={`theme-cord ${className}`}>
      {hint && <span className="theme-cord-hint" aria-hidden="true">pull me</span>}
      <button
        type="button"
        className="theme-cord-hit"
        aria-label={dark ? 'Switch to light theme' : 'Switch to dark theme'}
        title={dark ? 'Lights on' : 'Lights off'}
        aria-pressed={dark}
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerCancel={() => { start.current = null; setDrag(0); }}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); pull(); } }}
        onClick={(e) => e.preventDefault()}
      >
        <span key={tug} className={`theme-cord-swing${tug ? ' is-tugged' : ''}`} style={{ '--drag': `${drag}px` }}>
          <span className="theme-cord-line" />
          <svg ref={bulb} className={`theme-cord-bulb${dark ? '' : ' is-on'}`} viewBox="0 0 40 58" width="40" height="58">
            {/* glow (only while the lights are on) */}
            <circle className="tc-glow" cx="20" cy="33" r="19" />
            {/* screw cap */}
            <path d="M14 4.5h12v8.5H14z" fill="#3a3a3a" stroke="#141414" strokeWidth="2" strokeLinejoin="round" />
            <path d="M14 8.2h12M14 11h12" stroke="#8a8a8a" strokeWidth="1.2" />
            {/* glass, a little wobbly so it reads hand-drawn */}
            <path
              className="tc-glass"
              d="M15.2 13.4c-.6 3.4-3.6 5.4-6.4 8.8-3.2 3.9-3.7 9.4-1.4 13.9 2.4 4.8 7.3 8 12.7 7.9 5.6-.1 10.5-3.6 12.6-8.6 1.9-4.6 1.1-9.6-2-13.4-2.7-3.3-5.6-5.2-6.1-8.6"
              strokeWidth="2.3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {/* filament */}
            <path className="tc-filament" d="M16.5 14v9.5c0 2.3 1.6 3.4 3.5 3.4s3.5-1.1 3.5-3.4V14M16.5 23.5c1.2-1.6 2.4 1.6 3.5 0s2.3 1.6 3.5 0" fill="none" strokeWidth="1.6" strokeLinecap="round" />
            {/* shine */}
            <path d="M11 27c.2-3 1.6-5.4 3.6-7" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" opacity=".85" />
          </svg>
        </span>
      </button>
    </div>
  );
}
