import React, { useState } from 'react';
import { IMPACT } from '../data/resume';
import { TABS } from './Tabs';

// The five impact pills under the name. Each one free-falls from its own random spot above the screen, at its
// own random moment, spinning, then bounces and settles slightly tilted, so no two visits land the same way.
// Hovering gives each pill its own theme colour; a click or tap makes it boing.
const HOVER = TABS.map((t) => t.on); // lavender, yellow, pink, mint, blue: one per pill

const rnd = (a, b) => a + Math.random() * (b - a);
const signed = (a, b) => rnd(a, b) * (Math.random() < 0.5 ? -1 : 1);

// spread the start times over a window, then shuffle them so the order is random but nothing lands too late
function fallPlan(n, base, spread) {
  const slots = Array.from({ length: n }, (_, i) => base + (spread / n) * i + rnd(0, spread / n));
  for (let i = slots.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [slots[i], slots[j]] = [slots[j], slots[i]]; }
  return slots.map((d) => ({
    d: Math.round(d),
    fx: Math.round(signed(70, 260)),     // starts off to the side, drifts in
    fr: Math.round(signed(18, 50)),      // spinning while it falls
    tilt: +signed(1, 3.6).toFixed(1),    // resting angle
  }));
}

export default function ImpactPills({ className = '', style, base = 650, spread = 750, fall = -650, short = true }) {
  const [plan] = useState(() => fallPlan(IMPACT.length, base, spread));
  const boing = (e) => {
    const el = e.currentTarget;
    el.classList.remove('boing');
    void el.offsetWidth; // restart the animation on repeated clicks
    el.classList.add('boing');
  };
  return (
    <ul className={className} style={style} aria-label="Highlights">
      {IMPACT.map(([v, long, s], i) => (
        <li
          key={long}
          className="impact-pill"
          onClick={boing}
          onAnimationEnd={(e) => { if (e.animationName === 'pillBoing') e.currentTarget.classList.remove('boing'); }}
          style={{
            '--d': `${plan[i].d}ms`, '--fx': `${plan[i].fx}px`, '--fr': `${plan[i].fr}deg`,
            '--tilt': `${plan[i].tilt}deg`, '--fall': `${fall}px`, '--hc': HOVER[i % HOVER.length],
          }}
        >
          <b>{v}</b>{short ? (s || long) : long}
        </li>
      ))}
    </ul>
  );
}
