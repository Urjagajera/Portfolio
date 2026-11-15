import React from 'react';
import MaskWord from '../components/MaskWord';
import { PROGRAMS, AIMS, BELIEF } from '../data/programs';
import { asset, useDesign } from '../lib/design';
import { TABS } from '../components/Tabs';
import Doodle from '../components/Doodle';

// card fills come from the existing side-tab colours
// little doodles scattered on each card: [file, x, y, width, rotation]
const DOODLES = [
  [['laptop', 130, 612, 140, -6], ['braces', 345, 606, 130, 5], ['sparkles', 1460, 30, 95, 0]],
  [['robot', 135, 608, 135, -5], ['script', 520, 604, 150, -3], ['sparkles', 1460, 30, 95, 0]],
  [['pencil', 125, 606, 150, -4], ['script', 350, 610, 150, 4], ['sparkles', 1460, 30, 95, 0]],
  [['trophy', 125, 610, 125, -5], ['belt', 500, 618, 135, -4], ['sparkles', 1460, 30, 95, 0]],
];

const FILLS = TABS.slice(0, 4).map((t) => t.on);

const Rich = ({ parts, color }) =>
  parts.map(([t, hi], i) => (
    <span key={i} style={hi ? { fontWeight: 700 } : undefined}>{t}</span>
  ));

const TAB_W = 300;
const TAB_H = 64;
const TAB_STEP = 312;
const STICKY_TOP = 95;

const Label = ({ children, color }) => (
  <div className="font-mono font-bold uppercase" style={{ fontSize: 17, letterSpacing: '.08em', color, marginBottom: 14 }}>{children}</div>
);

// A "jelly file" folder (same black grainy flap as the footer). Its tab sticks out of the top-right
// corner; later cards slide up over it and leave only the tab of the card beneath visible.
function Card({ p, i, n, height }) {
  const fill = FILLS[i];
  return (
    <article className="sticky" style={{ top: STICKY_TOP, height, marginBottom: 150, zIndex: i + 1 }}>
      <div
        className="absolute grain flex items-center font-mono font-bold"
        style={{ right: 70 + (n - 1 - i) * TAB_STEP, top: -TAB_H + 1, width: TAB_W, height: TAB_H, background: fill, color: '#111', borderRadius: '24px 24px 0 0', fontSize: 19, padding: '0 26px', gap: 14, borderTop: '5px solid #111' }}
      >
        <span>0{i + 1}</span>
        <span className="whitespace-nowrap">{p.title}</span>
      </div>

      <div
        className="absolute inset-0 grain overflow-hidden font-mono flex flex-col"
        style={{ background: fill, color: '#111', borderRadius: '30px 30px 0 0', borderTop: '5px solid #111', padding: '46px 90px 34px', fontSize: 22, lineHeight: '32px', boxShadow: '0 -14px 30px rgba(0,0,0,.14)' }}
      >
        {DOODLES[i].map(([n, x, y, w, r]) => <Doodle key={`${n}${x}`} n={n} x={x} y={y} w={w} r={r} z={5} />)}
        <h2 className="m-0 font-display" style={{ color: '#111', fontSize: 64, lineHeight: '66px', fontWeight: 800, letterSpacing: '-.02em' }}>{p.title}</h2>
        <div className="italic" style={{ color: '#111', fontSize: 24, marginTop: 8 }}>{p.tag}</div>

        <div className="flex flex-wrap" style={{ marginTop: 22, gap: '12px 14px' }}>
          {p.chips.map(([c]) => (
            <span key={c} style={{ border: '1px solid #111', background: 'rgba(255,255,255,.55)', borderRadius: 20, padding: '2px 18px', fontSize: 17, color: '#111' }}>{c}</span>
          ))}
        </div>

        <p style={{ marginTop: 28, maxWidth: 1250, color: '#222' }}>{p.intro}</p>

        <div className="flex" style={{ marginTop: 24, gap: 90 }}>
          <div style={{ flex: 1 }}>
            <Label color="#111">Where this helps</Label>
            <ul className="list-none p-0 m-0">
              {p.challenges.slice(0, 4).map((c, k) => (
                <li key={k} style={{ marginBottom: 4 }}>· <Rich parts={c} /></li>
              ))}
            </ul>
          </div>
          <div style={{ flex: 1 }}>
            <Label color="#111">What I build</Label>
            <ul className="list-none p-0 m-0">
              {p.features.slice(0, 4).map((f) => <li key={f} style={{ marginBottom: 4 }}>· {f}</li>)}
            </ul>
          </div>
        </div>

        <div className="flex items-end justify-between" style={{ marginTop: 'auto', paddingTop: 24, gap: 40 }}>
          <div className="font-bold" style={{ fontSize: 18, lineHeight: '26px', maxWidth: 760 }}><Rich parts={p.research} /></div>
          <div className="flex flex-wrap justify-end" style={{ gap: 10 }}>
            {p.goals.map((g) => (
              <span key={g} className="italic" style={{ border: '1px solid #111', color: '#111', borderRadius: 10, padding: '5px 14px', fontSize: 15, whiteSpace: 'nowrap' }}>{g}</span>
            ))}
          </div>
        </div>
      </div>
    </article>
  );
}

export default function ProgramsPage() {
  const { vh } = useDesign();
  const height = 818; // 7% shorter than 880

  return (
    <div className="relative" style={{ minHeight: 1600 }}>
      <img src={asset('prog_corner.jpg')} alt="" draggable={false} className="absolute mul" style={{ left: 60, top: 0, width: 602 }} />
      <img src={asset('prog_edge.jpg')} alt="" draggable={false} className="absolute mul" style={{ left: 1797, top: 0, width: 93 }} />

      <div className="absolute w-full text-center font-display" style={{ top: 202, fontSize: 40, fontWeight: 800 }}>WHAT I BELIEVE</div>
      <MaskWord word="pgm" style={{ position: 'absolute', left: 360, top: 280 }} />

      <div className="absolute" style={{ left: 287, top: 613, width: 1330, fontSize: 24, lineHeight: '42px', color: '#5a5a5e' }}>
        <p className="m-0" style={{ fontSize: 40, lineHeight: '58px', color: '#333', fontWeight: 600 }}>I don&rsquo;t just believe in words.<br />I believe in words that are <span style={{ background: 'linear-gradient(transparent 62%, rgba(150,110,230,.45) 62%)' }}>followed by action</span>.</p>
        <p style={{ margin: '28px 0 0', maxWidth: 940, fontSize: 23, lineHeight: '40px', color: '#444448' }}>
          {BELIEF}
        </p>
      </div>

      {/* static stickers in the side margins */}
      <img src={asset('about_face.jpg')} alt="" draggable={false} className="absolute mul pointer-events-none" style={{ left: 80, top: 640, width: 190 }} />
      <div className="absolute doodle-zoom" style={{ left: 1640, top: 640, width: 220, zIndex: 6 }}>
        <img src="/assets/stickers/code_window.svg" alt="" draggable={false} className="block w-full select-none" />
      </div>
      <img src={asset('dice.png')} alt="" draggable={false} className="absolute pointer-events-none" style={{ left: 140, top: 1290, width: 95, transform: 'rotate(-8deg)' }} />
      <img src={asset('star.png')} alt="" draggable={false} className="absolute pointer-events-none" style={{ left: 1690, top: 1400, width: 120 }} />

      <img src={asset('prog_stickers.jpg')} alt="" draggable={false} className="absolute mul" style={{ left: 361, top: 1095, width: 362 }} />
      <div className="absolute" style={{ left: 944, top: 1060, fontSize: 21, fontWeight: 700 }}>What I aim for:</div>
      <ul className="absolute list-none p-0 m-0" style={{ left: 908, top: 1136, width: 700, fontSize: 21 }}>
        {AIMS.map(([parts, w], i) => (
          <li key={i} style={{ height: 60, paddingLeft: 50, position: 'relative', lineHeight: '44px' }}>
            {parts.map(([t, b], j) => <span key={j} style={{ fontWeight: b ? 700 : 400 }}>{t}</span>)}
            <i style={{ position: 'absolute', left: 40, bottom: 8, height: 4, width: w, background: 'linear-gradient(90deg, rgba(150,110,230,.9), rgba(150,110,230,.55))', borderRadius: 4, transform: 'rotate(-.4deg)' }} />
          </li>
        ))}
      </ul>

      {/* stacked folder cards */}
      <div style={{ paddingLeft: 150, width: 1740, paddingTop: 1560, paddingBottom: 0, position: 'relative' }}>
        <div style={{ width: 1590 }}>
          {PROGRAMS.map((p, i) => <Card key={p.id} p={p} i={i} n={PROGRAMS.length} height={height} />)}
          <div style={{ height: 900 }} />
        </div>
      </div>
    </div>
  );
}
