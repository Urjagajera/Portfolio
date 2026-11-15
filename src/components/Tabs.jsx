import React, { useEffect, useState } from 'react';
import { useDesign } from '../lib/design';

// shown on the tab when it differs from the section id
const LABELS = { portfolio: 'Details', programs: 'what I do' };

export const TABS = [
  { id: 'home', on: '#c39bf8', off: '#dcc7fb', dark: '#4a3b6b' },
  { id: 'portfolio', on: '#fdeb7a', off: '#fdf3c6', dark: '#6a683c' },
  { id: 'programs', on: '#f4717f', off: '#f8c6cd', dark: '#6b3a45' },
  { id: 'about', on: '#9be3ea', off: '#cbeef1', dark: '#3e5f63' },
  { id: 'contact', on: '#9db8f6', off: '#cdd9f8', dark: '#3f4a66' },
];

// Vertical index tabs fixed to the left edge (x 0-49, y 112-808 in the recording).
// When the footer rises into view the stack is pushed up with it.
export default function Tabs({ active, onSelect, dark, footerRef }) {
  const { z } = useDesign();
  const [shift, setShift] = useState(0);

  useEffect(() => {
    const on = () => {
      const el = footerRef?.current;
      if (!el) { setShift(0); return; }
      const top = (el.getBoundingClientRect().top + 208 * z) / z; // top of the black flap, design px
      const v = Math.max(0, 808 - top + 20); setShift(Number.isFinite(v) ? v : 0);
    };
    let raf = 0;
    const frame = () => { if (!raf) raf = requestAnimationFrame(() => { raf = 0; on(); }); };
    on();
    window.addEventListener('scroll', frame, { passive: true });
    window.addEventListener('resize', frame);
    return () => { cancelAnimationFrame(raf); window.removeEventListener('scroll', frame); window.removeEventListener('resize', frame); };
  }, [footerRef, z]);

  return (
    <nav className="fixed left-0 z-50 select-none" style={{ top: 112 - shift, width: 52 }}>
      {TABS.map((t, i) => {
        const isActive = t.id === active;
        return (
          <button
            key={t.id}
            onClick={() => onSelect(t.id)}
            className="intro-tab"
            style={{
              '--d': `${200 + i * 80}ms`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              height: 116, width: isActive ? 49 : 42,
              background: isActive ? t.on : dark ? t.dark : t.off,
              borderRadius: '0 14px 14px 0',
              writingMode: 'vertical-rl',
              fontSize: 21, padding: 0, border: 0,
              color: isActive ? '#111' : dark ? 'rgba(255,255,255,.35)' : 'rgba(0,0,0,.42)',
              transition: 'width .25s cubic-bezier(.2,.9,.3,1), background .3s',
            }}
          >
            {LABELS[t.id] || t.id}
          </button>
        );
      })}
    </nav>
  );
}
