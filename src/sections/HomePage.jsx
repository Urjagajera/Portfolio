import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import Header from '../components/Header';
import Portfolio from '../components/Portfolio';
import ProgramsPage from './ProgramsPage';
import Doodle from '../components/Doodle';
import AboutPage from './AboutPage';
import { asset, clamp, easeInOut, useDesign } from '../lib/design';
import { IMPACT, AVAILABILITY } from '../data/resume';
import { useContactForm, honeypotProps } from '../lib/contactForm';
import QuickView from '../components/QuickView';
import { INTRO } from '../lib/intro';

const SCENE_H = 1065;       // height of the painted BROWSE + PC composite
const ZIN = 1300;           // scroll distance of the zoom into the monitor
const HOLD = 900;           // scroll distance the portfolio stays pinned
const ZOUT = 1300;          // scroll distance of the zoom back out
const S = 5.6;              // final zoom factor (screen fills the viewport)
const ORIGIN = [945, 620];  // centre of the monitor screen inside the scene
const BTN = [1000, 825];    // TURN ON position inside the scene

export const HERO_H = 940;
export const COMPUTER_H = SCENE_H + ZIN + HOLD + ZOUT;

/* ---------------------------------------------------------------- hero */

const P1 = 'I don’t just believe in words.'.split(' ');
const MOTTO_HL = { background: 'linear-gradient(transparent 62%, rgba(150,110,230,.45) 62%)' };

function Hero({ onGo }) {
  const [shown, setShown] = useState(0);
  const [p2, setP2] = useState(0);
  const { z } = useDesign();
  // the 60-second recruiter view; a link to #60s opens it straight away
  const [quick, setQuick] = useState(() => window.location.hash === '#60s');
  const openQuick = () => { setQuick(true); try { history.replaceState(null, '', '#60s'); } catch { /* ignore */ } };
  const closeQuick = useCallback(() => {
    setQuick(false);
    try { if (window.location.hash === '#60s') history.replaceState(null, '', window.location.pathname + window.location.search); } catch { /* ignore */ }
  }, []);

  // first line types itself in word by word, once the opening sequence has revealed it
  useEffect(() => {
    let i = 0, id = 0;
    const start = setTimeout(() => {
      id = setInterval(() => { i += 1; setShown(i); if (i >= P1.length) clearInterval(id); }, 170);
    }, INTRO.delay + 1150);
    return () => { clearTimeout(start); clearInterval(id); };
  }, []);

  // second line fades from pale grey to ink as the page scrolls
  useEffect(() => {
    let raf = 0;
    const read = () => { raf = 0; setP2(clamp((window.scrollY / z - 120) / 380)); };
    const on = () => { if (!raf) raf = requestAnimationFrame(read); };
    read();
    window.addEventListener('scroll', on, { passive: true });
    return () => { cancelAnimationFrame(raf); window.removeEventListener('scroll', on); };
  }, [z]);

  const grey = Math.round(205 - p2 * 190);
  return (
    <section id="home" className="relative grain" style={{ height: HERO_H }}>
      <Header />
      <div className="absolute w-full flex items-center justify-center pointer-events-auto select-none" style={{ top: 215 }}>
        <h1 className="m-0 flex items-center justify-center intro-rise" style={{ '--d': '120ms' }}>
          <img
            src="/assets/urja_gajera_wordmark.png"
            alt="URJA GAJERA"
            width="1864"
            height="252"
            fetchPriority="high"
            draggable={false}
            style={{ width: 1260, height: 'auto', display: 'block' }}
          />
        </h1>
      </div>
      {/* top-right: availability + recruiter shortcut */}
      <div className="absolute flex items-center intro-drop" style={{ right: 110, top: 20, gap: 12, '--d': '420ms' }}>
        <a href="#contact" className="hero-cta hero-cta-dark" onClick={(e) => { e.preventDefault(); onGo && onGo('contact'); }}>
          <i className="visitor-dot" aria-hidden="true" />{AVAILABILITY} <span aria-hidden="true">&rarr;</span>
        </a>
        <button type="button" className="hero-cta hero-cta-quick" onClick={openQuick} aria-haspopup="dialog">
          &#9201; 60-sec view
        </button>
      </div>
      <QuickView open={quick} onClose={closeQuick} />

      <div className="absolute w-full text-center uppercase flex justify-center items-center" style={{ top: 518, fontSize: 22, gap: 20 }}>
        {['Build', '·', 'Create', '·', 'Explore'].map((w, i) => (
          <span key={i} className="intro-word" style={{ '--d': `${560 + i * 75}ms` }}>{w}</span>
        ))}
      </div>
      {/* impact strip: the proof points a recruiter should see first */}
      <ul className="absolute flex justify-center list-none m-0 p-0" style={{ left: 260, right: 260, top: 574, gap: 12 }} aria-label="Highlights">
        {IMPACT.map(([v, l, s], i) => (
          <li key={l} className="impact-pill" style={{ '--d': `${880 + i * 90}ms` }}><b>{v}</b>{s || l}</li>
        ))}
      </ul>
      <p className="absolute m-0 intro-fade" style={{ left: 515, top: 668, width: 440, fontSize: 25, lineHeight: '33px', '--d': '1050ms' }}>
        {P1.map((w, i) => (
          <span key={i} style={{ color: i < shown ? '#161616' : '#d2d2d6', transition: 'color .35s' }}>{w} </span>
        ))}
      </p>
      <p className="absolute m-0 intro-fade" style={{ left: 515, top: 712, width: 440, fontSize: 25, lineHeight: '33px', color: `rgb(${grey},${grey},${grey + 4})`, '--d': '1150ms' }}>
        I believe in words that are <span style={MOTTO_HL}>followed by action</span>.
      </p>
      <img src={asset('gummy_yellow.png')} alt="" draggable={false} className="absolute pointer-events-none intro-pop" style={{ left: 1322, top: 700, width: 75, '--d': '1500ms' }} />
      <Doodle n="compass" x={160} y={120} w={120} r={-8} intro={700} />
      <Doodle n="cloud" x={1610} y={110} w={170} r={5} intro={820} />
      <Doodle n="rocket" x={170} y={640} w={150} r={-10} hint="fly me" intro={1250} />
      <Doodle n="cat" x={1060} y={700} w={120} r={-4} hint="move me" intro={1380} />
    </section>
  );
}


/* ---------------------------------------- desk backdrop behind the monitor */

// A wooden study desk + wall (public/assets/desk/desk_scene.svg) behind the monitor: corkboard with notes, clock,
// bookshelf, framed sketch, karate medal and belt, and desk things. browse_scene.png (keyed out) sits in front of it.
function DeskBackdrop({ opacity }) {
  const fade = { WebkitMaskImage: 'linear-gradient(transparent, #000 14%)', maskImage: 'linear-gradient(transparent, #000 14%)' };
  return (
    <div className="absolute pointer-events-none select-none" style={{ left: 0, top: 0, width: 1890, height: SCENE_H, opacity, willChange: 'opacity', ...fade }}>
      <img src="/assets/desk/desk_scene.jpg" alt="" decoding="async" draggable={false} style={{ display: 'block', width: 1890, height: SCENE_H }} />
      <ClockHands />
    </div>
  );
}

// Live hands for the wall clock painted in desk_scene.svg (face centred at 668,190), in the viewer's local time.
function ClockHands() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  const s = now.getSeconds();
  const m = now.getMinutes() + s / 60;
  const h = (now.getHours() % 12) + m / 60;
  const hand = (deg, len, tail, width, color) => (
    <line x1="668" y1={190 + tail} x2="668" y2={190 - len} stroke={color} strokeWidth={width} strokeLinecap="round" transform={`rotate(${deg} 668 190)`} />
  );
  return (
    <svg className="absolute" viewBox={`0 0 1890 ${SCENE_H}`} style={{ left: 0, top: 0, width: 1890, height: SCENE_H }} aria-label={now.toLocaleTimeString()}>
      {hand(h * 30, 28, 4, 5, '#2b2b2b')}
      {hand(m * 6, 42, 5, 3.5, '#2b2b2b')}
      {hand(s * 6, 44, 10, 1.8, '#d64a5a')}
      <circle cx="668" cy="190" r="5" fill="#d64a5a" />
    </svg>
  );
}

/* ------------------------------------------------ computer + portfolio */

function Computer({ on, setOn, onOpenProject, onMode }) {
  const { z, vh } = useDesign();
  const outer = useRef(null);
  const [r, setR] = useState(-1);
  const [noteOpen, setNoteOpen] = useState(false);
  // mount the (heavy) Browse window ahead of time while the browser is idle, hidden, so its first render
  // doesn't land in the middle of the zoom and stall a frame
  const [warm, setWarm] = useState(false);
  useEffect(() => {
    // ...but only after the opening sequence has finished, so it never costs the intro a frame
    const ric = window.requestIdleCallback;
    let h = 0;
    const t = setTimeout(() => { h = ric ? ric(() => setWarm(true), { timeout: 1500 }) : setTimeout(() => setWarm(true), 300); }, INTRO.delay + 2300);
    return () => { clearTimeout(t); if (ric) window.cancelIdleCallback(h); else clearTimeout(h); };
  }, []);

  const pinStart = () => {
    const top = outer.current.getBoundingClientRect().top + window.scrollY;
    return top / z + SCENE_H - vh;
  };

  // one update per frame, and only while the scene is near the viewport: outside that range r is pinned, so
  // React skips re-rendering this (heavy) subtree for scrolls elsewhere on the page
  useLayoutEffect(() => {
    let raf = 0;
    const read = () => { raf = 0; setR(clamp(window.scrollY / z - pinStart(), -800, ZIN + HOLD + ZOUT + 800)); };
    const on2 = () => { if (!raf) raf = requestAnimationFrame(read); };
    read();
    window.addEventListener('scroll', on2, { passive: true });
    window.addEventListener('resize', on2);
    return () => { cancelAnimationFrame(raf); window.removeEventListener('scroll', on2); window.removeEventListener('resize', on2); };
  }, [z, vh]);

  const p = clamp(r / ZIN);
  const q = clamp((r - ZIN - HOLD) / ZOUT);
  const scale = 1 + (S - 1) * (easeInOut(p) - easeInOut(q));
  const dark = clamp((p - 0.82) / 0.18) * (1 - clamp(q / 0.35));
  // the desktop fades in as the monitor fills the viewport (with or without clicking TURN ON)
  const reveal = clamp((p - 0.72) / 0.22);
  const showPortfolio = reveal > 0.02 || on;
  const mountPortfolio = showPortfolio || warm;
  const winOpacity = showPortfolio ?Math.max(reveal, on && p > 0.98 ? 1 : 0) * (1 - clamp(q / 0.3)) : 0;
  const mode = p > 0.55 && q < 0.6 ? 'portfolio' : 'home';

  useEffect(() => { onMode(mode); }, [mode]);


  // never leave the zoom half-way: when scrolling stops mid-zoom, finish it in the direction you were going
  useEffect(() => {
    let last = window.scrollY, dir = 1, t = 0;
    const settle = () => {
      const rr = window.scrollY / z - pinStart();
      const pp = rr / ZIN, qq = (rr - ZIN - HOLD) / ZOUT;
      let to = null;
      if (pp > 0.02 && pp < 0.995) to = dir > 0 ? ZIN + 4 : 0;
      else if (qq > 0.005 && qq < 0.98) to = dir > 0 ? ZIN + HOLD + ZOUT + 2 : ZIN + HOLD - 2;
      if (to !== null) window.scrollTo({ top: (pinStart() + to) * z, behavior: 'smooth' });
    };
    const onS = () => {
      const y = window.scrollY;
      if (y !== last) dir = y > last ? 1 : -1;
      last = y;
      clearTimeout(t);
      t = setTimeout(settle, 160);
    };
    window.addEventListener('scroll', onS, { passive: true });
    return () => { window.removeEventListener('scroll', onS); clearTimeout(t); };
  }, [z, vh]);

  // the Browse window fills the screen (leaving room for the side tabs), instead of a fixed size
  const fit = Math.min(1.45, (1890 - 170) / 1181, (vh - 70) / 737);

  const turnOn = () => {
    setOn(true);
    const target = (pinStart() + ZIN + 4) * z;
    window.scrollTo({ top: target, behavior: 'smooth' });
  };

  // closing the portfolio window: glide slowly down to the "4 main ways" section
  const slowScrollToPrograms = useCallback(() => {
    const el = document.getElementById('how-do');
    if (!el) return;
    const from = window.scrollY;
    const to = el.getBoundingClientRect().top + window.scrollY;
    const dur = 2000;
    const t0 = performance.now();
    const cancel = () => { cancelAnimationFrame(raf); };
    let raf = 0;
    const step = (now) => {
      const t = clamp((now - t0) / dur);
      window.scrollTo(0, from + (to - from) * easeInOut(t));
      if (t < 1) raf = requestAnimationFrame(step);
      else { window.removeEventListener('wheel', cancel); window.removeEventListener('touchstart', cancel); }
    };
    window.addEventListener('wheel', cancel, { passive: true, once: true });
    window.addEventListener('touchstart', cancel, { passive: true, once: true });
    raf = requestAnimationFrame(step);
  }, []);

  const [bx, by] = BTN;
  const dx = ((bx - ORIGIN[0]) * (1 - scale)) / scale;
  const dy = ((by - ORIGIN[1]) * (1 - scale)) / scale;

  return (
    <section id="portfolio" ref={outer} className="relative" style={{ height: COMPUTER_H, overflow: 'clip' }}>
      {/* layer 1: painted BROWSE + PC, pinned with its bottom on the viewport bottom */}
      <div className="sticky" style={{ top: (vh - SCENE_H) || 0, height: SCENE_H, width: 1890 }}>
        <div className="absolute inset-0" style={{ transform: `scale(${scale})`, transformOrigin: `${ORIGIN[0]}px ${ORIGIN[1]}px`, willChange: 'transform' }}>
          <DeskBackdrop opacity={Math.max(1 - clamp((p - 0.12) / 0.45), clamp((q - 0.2) / 0.6))} />
          <img src={asset('browse_scene.png')} alt="Browse — vintage computer" decoding="async" draggable={false} style={{ position: 'relative', width: 1890, height: SCENE_H, display: 'block' }} />
          <div className="absolute left-0 w-full pointer-events-none" style={{ top: 700, height: SCENE_H - 700, background: 'linear-gradient(rgba(250,250,248,0), #fafaf8 70%)', opacity: clamp(q * 2.5) }} />
          {!on && reveal < 0.5 && (
            <button
              onClick={turnOn}
              className="absolute text-white italic flex items-center justify-center"
              style={{
                left: bx - 41, top: by - 17, width: 82, height: 35, borderRadius: 18, background: '#0d0d0d',
                border: '1px solid rgba(255,255,255,.25)', fontSize: 16, letterSpacing: '.01em',
                transform: `translate(${dx}px, ${dy}px) scale(${1 / scale})`, opacity: clamp((r + 400) / 300) * (1 - clamp(reveal * 2)),
              }}
            >
              TURN ON
            </button>
          )}
        </div>
      </div>

      {/* layer 2: black screen + portfolio window, viewport sized */}
      <div className="absolute left-0 top-0 w-full" style={{ height: '100%', pointerEvents: 'none' }}>
        <div className="sticky top-0" style={{ height: vh, width: 1890 }}>
          <div className="absolute inset-0" style={{ background: noteOpen ? '#000' : '#141414', opacity: dark, transition: 'background .6s' }} />
          <div
            className="absolute inset-0 flex items-center justify-center"
            style={{ opacity: winOpacity, visibility: winOpacity > 0 ? 'visible' : 'hidden', pointerEvents: winOpacity > 0.5 ? 'auto' : 'none' }}
          >
            {mountPortfolio && <Portfolio onOpenProject={onOpenProject} fit={fit} onNote={setNoteOpen} onClose={slowScrollToPrograms} />}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------ how do we do this */

const PROGRAMS = [
  ['Think Beyond Code', 'Ideas, logic, and creativity before the code begins.'],
  ['Explore What’s New', 'New ideas, new technology, and things worth figuring out.'],
  ['Build What Interests Me', 'If something catches my attention, I want to build it.'],
  ['Curious About AI', 'Exploring how machines can learn, adapt, and solve problems.'],
];

function HowDo({ onPrograms }) {
  const h = 1258;
  const CUT = 250; // the painted headline that used to sit above this block was removed
  return (
    <section id="how-do" className="relative" style={{ height: h - CUT }}>
      <div className="absolute left-0 w-full" style={{ top: -CUT, height: h }}>
      <div className="absolute grain" style={{ left: 0, top: CUT, width: 1890, height: h - CUT - 60, background: '#ececeb' }} />
      <img src={asset('paper_bottom.jpg')} alt="" loading="lazy" decoding="async" draggable={false} className="absolute left-0" style={{ top: 1138, width: 1890, height: 120 }} />
      <img src={asset('dice.png')} alt="" loading="lazy" decoding="async" draggable={false} className="absolute" style={{ left: 245, top: 338, width: 95 }} />
      <img src={asset('star.png')} alt="" loading="lazy" decoding="async" draggable={false} className="absolute" style={{ left: 158, top: 426, width: 134 }} />
      <img src={asset('cat.png')} alt="" loading="lazy" decoding="async" draggable={false} className="absolute" style={{ left: 1592, top: 868, width: 235 }} />
      <Doodle n="magnifier" x={1420} y={380} w={130} r={-8} />
      <Doodle n="palette" x={190} y={800} w={140} r={-6} hint="pull me" />
      <Doodle n="code" x={1060} y={470} w={100} r={-6} />
      <Doodle n="daisy" x={800} y={1000} w={110} r={0} />
      <h2 className="absolute m-0 font-semibold" style={{ left: 340, top: 496, width: 900, fontSize: 30, lineHeight: '34px', fontWeight: 600 }}>
        Here are the 4 things that shape<br />how I think, learn and build
      </h2>
      <div className="absolute" style={{ left: 340, top: 640, width: 1210 }}>
        {PROGRAMS.map(([a, b], i) => (
          <button
            key={a}
            onClick={onPrograms}
            className="w-full bg-transparent border-0 text-left"
            style={{
              display: 'grid', gridTemplateColumns: '430px 1fr', columnGap: 40, alignItems: 'center',
              height: 74, padding: 0, fontSize: 28, whiteSpace: 'nowrap',
              borderBottom: i < PROGRAMS.length - 1 ? '1px solid rgba(0,0,0,.28)' : 'none',
            }}
          >
            <span style={{ fontWeight: 500 }}>{a}</span>
            <span style={{ textAlign: 'right' }}>{b}</span>
          </button>
        ))}
      </div>
      </div>
    </section>
  );
}

/* ---------------------------------------------------------- teal card */

function TealForm() {
  const { f, set, status, submit, mailto, btnText } = useContactForm();
  const label = 'font-mono font-bold text-[#111]';
  const line = { borderBottom: '2px solid #1b2b2b' };
  const fld = 'w-full bg-transparent border-0 outline-none font-mono italic';

  return (
    <section className="relative" style={{ height: 1150 }}>
      <img src={asset('earphones.png')} alt="" loading="lazy" decoding="async" draggable={false} className="absolute" style={{ left: 0, top: 745, width: 290 }} />
      <div className="absolute grain" style={{ left: 265, top: 155, width: 1265, height: 877, background: '#8fe4e6', borderRadius: 52, transform: 'rotate(-.4deg)', boxShadow: '0 12px 30px rgba(0,0,0,.12)' }} />
      <form
        onSubmit={submit}
        className="absolute" style={{ left: 0, top: 0, width: 1890, height: 1150 }}
      >
        <input {...honeypotProps} />
        <div className="absolute" style={{ left: 493, top: 301, width: 306 }}>
          <label htmlFor="cf-name" className={label} style={{ fontSize: 23 }}>name *</label>
          <div style={{ ...line, height: 60, marginTop: 18 }}><input id="cf-name" name="name" required autoComplete="name" value={f.name} onChange={set('name')} className={fld} style={{ fontSize: 19, padding: '14px 14px 0' }} placeholder="Your name" /></div>
          <label htmlFor="cf-email" className={label} style={{ fontSize: 23, display: 'block', marginTop: 4 }}>email *</label>
          <div style={{ ...line, height: 60, marginTop: 18 }}><input id="cf-email" name="email" required type="email" autoComplete="email" value={f.email} onChange={set('email')} className={fld} style={{ fontSize: 19, padding: '14px 14px 0' }} placeholder="you@company.com" /></div>
          <label htmlFor="cf-phone" className={label} style={{ fontSize: 23, display: 'block', marginTop: 4 }}>phone</label>
          <div style={{ ...line, height: 60, marginTop: 18 }}><input id="cf-phone" name="phone" type="tel" autoComplete="tel" value={f.phone} onChange={set('phone')} className={fld} style={{ fontSize: 19, padding: '14px 14px 0' }} placeholder="optional" /></div>
        </div>
        <div className="absolute" style={{ left: 825, top: 301, width: 575 }}>
          <label htmlFor="cf-msg" className={label} style={{ fontSize: 23 }}>message *</label>
          <textarea id="cf-msg" name="message" required value={f.message} onChange={set('message')} placeholder="Hi Urja, we have an internship opening..." className="w-full bg-transparent font-mono italic outline-none block" style={{ marginTop: 16, height: 218, border: '1px solid #1b2b2b', padding: '14px 14px', fontSize: 19, resize: 'none' }} />
          <div className="flex items-center" style={{ marginTop: 38, gap: 22 }}>
            <button type="submit" disabled={status === 'sending'} className="text-white" style={{ width: 244, height: 50, borderRadius: 6, background: status === 'sent' ? '#2f7d4f' : '#6a9394', border: 0, fontSize: 20, opacity: status === 'sending' ? 0.75 : 1, transition: 'background .3s' }}>
              {btnText}
            </button>
            <div role="status" aria-live="polite" className="font-mono" style={{ fontSize: 17, lineHeight: '23px', color: '#1b2b2b', maxWidth: 310 }}>
              {status === 'sent' && 'Thanks! Your message reached my inbox. I’ll reply soon.'}
              {status === 'error' && <>Couldn’t send right now. <a href={mailto} className="underline">Email it instead</a>.</>}
            </div>
          </div>
        </div>
        <a href="mailto:urjagajera12@gmail.com" className="absolute font-mono font-bold text-[#111] no-underline" style={{ left: 488, top: 748, fontSize: 25 }}>urjagajera12@gmail.com</a>
      </form>
      <img src={asset('teal_sticker.png')} alt="" loading="lazy" decoding="async" draggable={false} className="absolute" style={{ left: 1296, top: 571, width: 344 }} />
      <Doodle n="cloud" x={50} y={170} w={150} r={-5} hint="push me" />
      <Doodle n="cat" x={930} y={800} w={115} r={4} />
      <Doodle n="palette" x={1630} y={190} w={130} r={6} />
    </section>
  );
}

export default function HomePage({ on, setOn, onOpenProject, onMode, onGo }) {
  return (
    <>
      <Hero onGo={onGo} />
      <Computer on={on} setOn={setOn} onOpenProject={onOpenProject} onMode={onMode} />
      <HowDo onPrograms={() => onGo('programs')} />
      <section id="programs">
        <ProgramsPage />
      </section>
      <section id="about">
        <AboutPage />
      </section>
      <section id="contact">
        <TealForm />
      </section>
    </>
  );
}
