import React, { useEffect, useState } from 'react';
import { INTRO } from '../lib/intro';
import { TABS } from './Tabs';

// Five pastel stripes (the side-tab colours) sweep up off the screen one after another, uncovering the desk.
// Purely visual: it never takes clicks, and it removes itself once the sweep is over.
export default function IntroCurtain() {
  const [on, setOn] = useState(INTRO.curtain);
  useEffect(() => {
    if (!on) return undefined;
    const t = setTimeout(() => setOn(false), INTRO.curtainMs);
    return () => clearTimeout(t);
  }, [on]);
  if (!on) return null;
  return (
    <div className="intro-curtain" aria-hidden="true">
      {TABS.map((t, i) => (
        <i key={t.id} style={{ background: t.on, animationDelay: `${480 + i * 70}ms` }} />
      ))}
      <div className="intro-stamp">
        <b>UG</b>
        <span>opening the desk…</span>
      </div>
    </div>
  );
}
