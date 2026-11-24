import React, { useEffect, useMemo, useState } from 'react';
import * as R from '../data/resume';

// The study desk behind the monitor comes alive: every object painted on it is clickable. Hover draws a
// pencil circle around it; a click pins a taped paper note with that object's story and a small animation.
// Coordinates are in the 1890 x 1065 scene space (desk_scene.jpg is drawn at 1.5x that).

const SKILL_SPINES = R.SKILLS.slice(0, 5).map(([group, list]) => [group, list.split(', ').slice(0, 4).join(' · ')]);
const SPINE_COLORS = ['#c39bf8', '#fdeb7a', '#f4717f', '#9be3ea', '#9db8f6'];

function Clock() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => { const id = setInterval(() => setNow(new Date()), 1000); return () => clearInterval(id); }, []);
  const fmt = (tz) => now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', timeZone: tz });
  const istHour = Number(now.toLocaleString('en-GB', { hour: '2-digit', hour12: false, timeZone: 'Asia/Kolkata' }));
  const mood = istHour < 6 ? 'probably debugging something' : istHour < 12 ? 'coffee + classes' : istHour < 18 ? 'building something' : istHour < 23 ? 'shipping side projects' : 'one more commit, then sleep';
  return (
    <>
      <div className="ld-times">
        <div><span>your time</span><b>{fmt(undefined)}</b></div>
        <div><span>my time (IST)</span><b>{fmt('Asia/Kolkata')}</b></div>
      </div>
      <p>Right now I'm {mood}. Any time is a good time to say hi.</p>
    </>
  );
}

function Corkboard() {
  const items = [['1300+ CodeChef problems', true], ['ship Strux', true], ['next hackathon', false], ['sketch daily', false]];
  return (
    <>
      <p>The board above my desk: <b>ship it!</b> (words → action) and <b>learn LangGraph + RAG</b>, both already in my projects.</p>
      <ul className="ld-todo">
        {items.map(([t, done], i) => (
          <li key={t} style={{ '--i': i }} className={done ? 'is-done' : ''}><i />{t}</li>
        ))}
      </ul>
    </>
  );
}

function Shelf() {
  return (
    <div className="ld-spines">
      {SKILL_SPINES.map(([g, l], i) => (
        <div key={g} className="ld-spine" style={{ '--i': i, background: SPINE_COLORS[i] }}>
          <b>{g}</b><span>{l}</span>
        </div>
      ))}
    </div>
  );
}

function Confetti() {
  const bits = useMemo(() => Array.from({ length: 22 }, (_, i) => ({
    x: Math.round((Math.random() - 0.5) * 320), y: Math.round(-60 - Math.random() * 160), r: Math.round(Math.random() * 540 - 270),
    c: SPINE_COLORS[i % 5], d: Math.round(Math.random() * 180),
  })), []);
  return <div className="ld-confetti" aria-hidden="true">{bits.map((b, i) => <i key={i} style={{ '--x': `${b.x}px`, '--y': `${b.y}px`, '--r': `${b.r}deg`, '--d': `${b.d}ms`, background: b.c }} />)}</div>;
}

function Sketch() {
  // a quick pencil portrait drawing itself
  return (
    <svg className="ld-sketch" viewBox="0 0 220 120" aria-hidden="true">
      <path d="M70 100c-14-12-20-30-16-48 5-22 24-36 46-36s40 14 44 36c4 19-3 36-18 48" />
      <path d="M78 54c6-5 14-5 20 0M122 54c6-5 14-5 20 0" />
      <path d="M86 62c3 3 7 3 10 0M128 62c3 3 7 3 10 0" />
      <path d="M110 64c-2 9-5 14 0 16" />
      <path d="M96 88c8 6 20 6 28 0" />
      <path d="M58 46c4-26 30-40 56-36 24 4 40 22 40 40" />
    </svg>
  );
}

function Sprout() {
  return (
    <svg className="ld-sprout" viewBox="0 0 120 110" aria-hidden="true">
      <path className="ld-stem" d="M60 108C60 84 58 62 62 38" />
      <path className="ld-leaf" style={{ '--d': '.7s' }} d="M61 70c-16-2-28-12-30-26 14 0 27 9 30 26z" />
      <path className="ld-leaf" style={{ '--d': '1s' }} d="M61 56c14-4 24-16 24-30-13 2-24 13-24 30z" />
      <path className="ld-leaf" style={{ '--d': '1.3s' }} d="M62 40c-8-8-9-20-3-30 7 8 8 20 3 30z" />
    </svg>
  );
}

const OBJECTS = [
  { id: 'cork', x: 180, y: 336, w: 320, h: 291, tag: 'my goals', title: 'What’s pinned up', body: Corkboard },
  { id: 'clock', x: 600, y: 122, w: 134, h: 134, tag: 'what time is it?', title: 'Two clocks', body: Clock },
  { id: 'shelf', x: 937, y: 193, w: 226, h: 137, tag: 'my toolkit', title: 'The skills shelf', body: Shelf },
  {
    id: 'trophy', x: 1155, y: 251, w: 88, h: 80, tag: '2nd!', title: '2nd prize, CHAOS2COMMIT 2026',
    body: () => (<><Confetti /><p>Our team built <b>Nirman</b>, an AI solution builder that goes from an idea to a deployed app, and won 2nd prize. The network failed and we ran out of API credits right before the presentation. We still shipped.</p></>),
  },
  {
    id: 'karate', x: 1557, y: 260, w: 139, h: 200, tag: 'osu!', title: 'Wado-kai Karate · Purple belt',
    body: () => (<><div className="ld-kiai" aria-hidden="true">KIAI!</div><p>Karate taught me discipline and how to keep going when something is hard. The same patience I bring to a stubborn bug.</p></>),
  },
  {
    id: 'books', x: 260, y: 796, w: 273, h: 124, tag: 'the sketchbook', title: 'Sketchbook, Clean Code, Algorithms',
    body: () => (<><Sketch /><p>I draw hyper-realistic portraits. Drawing taught me to notice small details and keep improving something until it feels right, which is exactly how I write code.</p></>),
  },
  {
    id: 'plant', x: 1284, y: 700, w: 149, h: 223, tag: 'still growing', title: 'Growing, one commit at a time',
    body: () => (<><Sprout /><p>{R.CODING_PROFILES[0][0]} problems solved on CodeChef ({R.CODING_PROFILES[1][0]} badge) and counting. I like learning things deeply, then building with them.</p></>),
  },
];

export default function LivingDesk({ active }) {
  const [open, setOpen] = useState(null);
  const [tried, setTried] = useState(() => { try { return !!localStorage.getItem('deskTried'); } catch { return true; } });

  useEffect(() => { if (!active) setOpen(null); }, [active]);
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => { if (e.key === 'Escape') setOpen(null); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  const pick = (id) => {
    setOpen((o) => (o === id ? null : id));
    if (!tried) { setTried(true); try { localStorage.setItem('deskTried', '1'); } catch { /* fine */ } }
  };
  const obj = OBJECTS.find((o) => o.id === open);

  return (
    <div className="ld" style={{ opacity: active ? 1 : 0, pointerEvents: active ? 'auto' : 'none' }} aria-hidden={!active}>
      {!tried && active && (
        <div className="ld-hint" aria-hidden="true">
          psst... everything on this desk is clickable
          <svg viewBox="0 0 80 50"><path d="M4 6c20 2 40 12 52 34M56 40l-12-4M56 40l2-12" /></svg>
        </div>
      )}
      {OBJECTS.map((o) => (
        <button
          key={o.id}
          type="button"
          className={`ld-spot${open === o.id ? ' is-open' : ''}`}
          style={{ left: o.x, top: o.y, width: o.w, height: o.h }}
          aria-label={o.title}
          aria-expanded={open === o.id}
          tabIndex={active ? 0 : -1}
          onClick={() => pick(o.id)}
        >
          <svg className="ld-ring" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
            <path d="M50 4C76 3 97 20 96 48 95 77 73 97 47 96 21 95 3 75 4 49 5 24 26 6 54 7" vectorEffect="non-scaling-stroke"/>
          </svg>
          <span className="ld-tag">{o.tag}</span>
        </button>
      ))}
      {obj && (
        <div
          key={obj.id}
          className="ld-card"
          role="dialog"
          aria-label={obj.title}
          // objects on the left half get their note to the right, the rest to the left (never over another object)
          style={{
            left: obj.x < 900 ? obj.x + obj.w + 24 : obj.x - 424,
            // things on the desk top (low in the scene) open their note above them, so it never runs off-screen
            top: obj.y > 600 ? obj.y - 330 : Math.max(obj.y - 20, 40),
          }}
        >
          <i className="ld-tape" />
          <button type="button" className="ld-x" aria-label="Close" onClick={() => setOpen(null)}>×</button>
          <h4>{obj.title}</h4>
          <obj.body />
        </div>
      )}
    </div>
  );
}
