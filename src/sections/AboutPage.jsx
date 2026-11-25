import React from 'react';
import MaskWord from '../components/MaskWord';
import { asset } from '../lib/design';
import Doodle from '../components/Doodle';
import { ABOUT, ABOUT_TITLE } from '../data/about';

const T = { fontSize: 23, lineHeight: '42px', color: '#444448' };

export default function AboutPage() {
  const img = (n, l, t, w, extra) => (
    <img src={asset(n)} alt="" loading="lazy" decoding="async" draggable={false} className="absolute mul pointer-events-none" style={{ left: l, top: t, width: w, ...extra }} />
  );
  return (
    <div className="relative" style={{ height: 2380 }}>
      {img('about_top.webp', 60, 0, 1828)}

      {/* decorations */}
      {img('about_pen.webp', 1590, 560, 270)}
      {img('about_gummy_y.jpg', 140, 520, 105)}
      {img('about_floppy.jpg', 80, 930, 167)}
      {img('about_squiggle.jpg', 1480, 1780, 240)}
      <Doodle n="headphones" x={300} y={720} w={130} r={-6} hint="drag me" />
      <Doodle n="book" x={1450} y={1000} w={130} r={5} />
      <Doodle n="daisy" x={130} y={1350} w={120} />
      <Doodle n="bulb" x={420} y={2200} w={110} r={4} hint="catch me" />
      <Doodle n="rocket" x={1380} y={2190} w={140} r={8} />

      <MaskWord word="hel" style={{ position: 'absolute', left: 660, top: 290 }} />

      <div className="absolute" style={{ left: 495, top: 570, width: 910, ...T }}>
        <p className="m-0 font-display" style={{ fontSize: 32, fontWeight: 700, color: '#161616', lineHeight: '46px', letterSpacing: '-0.01em' }}>
          {ABOUT_TITLE}
        </p>
        {ABOUT.map((t) => <p key={t.slice(0, 24)} style={{ margin: '38px 0 0' }}>{t}</p>)}
      </div>
    </div>
  );
}

