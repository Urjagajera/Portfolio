import React, { useEffect, useMemo, useRef, useState } from 'react';
import { CERTS, CERT_CATEGORIES } from '../data/certificates';

const CW = 230;       // card image width
const CAP = 58;       // caption height under each image
const GAP = 46;
const COLS = 5;
const PAD = 90;
const FRICTION = 0.92;
const HOME_S = 0.8;

// Masonry layout of every certificate in canvas ("world") coordinates.
function layout() {
  const heights = Array(COLS).fill(PAD);
  return CERTS.map((c, i) => {
    let col = 0;
    for (let k = 1; k < COLS; k++) if (heights[k] < heights[col]) col = k;
    const ih = Math.round((CW * c.h) / c.w);
    const jx = ((i * 37) % 21) - 10;
    const rot = (((i * 53) % 31) - 15) / 10;
    const x = PAD + col * (CW + GAP) + jx;
    const y = heights[col];
    heights[col] += ih + CAP + GAP;
    return { ...c, x, y, ih, rot, delay: i * 45 };
  });
}

const WORLD_W = PAD * 2 + COLS * (CW + GAP) - GAP;

export default function CertCanvas({ onBack }) {
  const items = useMemo(layout, []);
  const worldH = useMemo(() => Math.max(...items.map((c) => c.y + c.ih + CAP)) + PAD, [items]);

  const box = useRef(null);
  const world = useRef(null);
  const cam = useRef({ x: 0, y: 0, s: 1 });
  const vel = useRef({ x: 0, y: 0 });
  const drag = useRef(null);
  const raf = useRef(0);
  const fly = useRef(null);

  const [q, setQ] = useState('');
  const [cat, setCat] = useState('All');
  const [open, setOpen] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [zoomPct, setZoomPct] = useState(100);

  const apply = () => {
    const { x, y, s } = cam.current;
    if (world.current) world.current.style.transform = `translate3d(${x}px, ${y}px, 0) scale(${s})`;
  };

  // keep the world from being dragged completely out of view
  const clamp = () => {
    const el = box.current;
    if (!el) return;
    const c = cam.current;
    const vw = el.clientWidth, vh = el.clientHeight, m = Math.min(vw, vh) * 0.45;
    c.x = Math.min(vw - m, Math.max(m - WORLD_W * c.s, c.x));
    c.y = Math.min(vh - m, Math.max(m - worldH * c.s, c.y));
  };

  const loop = () => {
    raf.current = 0;
    let again = false;
    if (fly.current) {
      const f = fly.current;
      const t = Math.min(1, (performance.now() - f.t0) / f.dur);
      const e = 1 - Math.pow(1 - t, 3);
      cam.current.x = f.x0 + (f.x1 - f.x0) * e;
      cam.current.y = f.y0 + (f.y1 - f.y0) * e;
      cam.current.s = f.s0 + (f.s1 - f.s0) * e;
      if (t >= 1) fly.current = null;
      again = true;
    } else if (!drag.current) {
      const v = vel.current;
      if (Math.abs(v.x) > 0.15 || Math.abs(v.y) > 0.15) {
        cam.current.x += v.x;
        cam.current.y += v.y;
        v.x *= FRICTION;
        v.y *= FRICTION;
        again = true;
      }
    }
    clamp();
    apply();
    setZoomPct(Math.round(cam.current.s * 100));
    if (again) raf.current = requestAnimationFrame(loop);
  };
  const kick = () => { if (!raf.current) raf.current = requestAnimationFrame(loop); };

  const flyTo = (x, y, s, dur = 800) => {
    const c = cam.current;
    fly.current = { x0: c.x, y0: c.y, s0: c.s, x1: x, y1: y, s1: s, t0: performance.now(), dur };
    vel.current = { x: 0, y: 0 };
    kick();
  };

  // centre a world point in the viewport
  const centreOn = (wx, wy, s = cam.current.s, dur) => {
    const el = box.current;
    flyTo(el.clientWidth / 2 - wx * s, el.clientHeight / 2 - wy * s, s, dur);
  };

  // initial: start slightly zoomed out, centred, with an intro glide
  useEffect(() => {
    const el = box.current;
    const s = HOME_S;
    cam.current = { x: el.clientWidth / 2 - (WORLD_W / 2) * s * 1.3, y: 60, s: s * 0.7 };
    apply();
    flyTo(el.clientWidth / 2 - (WORLD_W / 2) * s, 20, s, 1100);
    return () => cancelAnimationFrame(raf.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // CSS-transform-safe pixel ratio (the desktop window is scaled via transform)
  const ratio = () => {
    const r = box.current.getBoundingClientRect();
    return r.width / box.current.offsetWidth || 1;
  };

  const onDown = (e) => {
    if (e.target.closest('[data-ui]')) return;
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    box.current.setPointerCapture?.(e.pointerId);
    fly.current = null;
    vel.current = { x: 0, y: 0 };
    drag.current = { id: e.pointerId, x: e.clientX, y: e.clientY, sx: e.clientX, sy: e.clientY, moved: false, t: performance.now(), card: e.target.closest('[data-card]')?.dataset.card };
  };
  const onMove = (e) => {
    const d = drag.current;
    if (!d || d.id !== e.pointerId) return;
    const r = ratio();
    const dx = (e.clientX - d.x) / r, dy = (e.clientY - d.y) / r;
    if (!d.moved && Math.hypot(e.clientX - d.sx, e.clientY - d.sy) > 5) { d.moved = true; setDragging(true); }
    if (!d.moved) return;
    cam.current.x += dx;
    cam.current.y += dy;
    const cap = (n) => Math.max(-38, Math.min(38, n));
    vel.current = { x: cap(vel.current.x * 0.4 + dx * 0.6), y: cap(vel.current.y * 0.4 + dy * 0.6) };
    d.x = e.clientX;
    d.y = e.clientY;
    clamp();
    apply();
  };
  const onUp = (e) => {
    const d = drag.current;
    if (!d || d.id !== e.pointerId) return;
    drag.current = null;
    setDragging(false);
    if (d.moved) {
      // a held-still release shouldn't fling
      if (performance.now() - d.t < 40) vel.current = { x: 0, y: 0 };
      kick();
    } else {
      if (d.card) setOpen(d.card);
    }
  };

  // wheel: pan; ctrl/pinch: zoom around the pointer (non-passive so the page doesn't scroll)
  useEffect(() => {
    const el = box.current;
    const onWheel = (e) => {
      if (e.target.closest('[data-ui]')) return;
      e.preventDefault();
      fly.current = null;
      const c = cam.current;
      if (e.ctrlKey) {
        const r = el.getBoundingClientRect();
        const k = r.width / el.offsetWidth || 1;
        const px = (e.clientX - r.left) / k, py = (e.clientY - r.top) / k;
        const ns = Math.min(2.2, Math.max(0.3, c.s * Math.exp(-e.deltaY * 0.01)));
        c.x = px - ((px - c.x) / c.s) * ns;
        c.y = py - ((py - c.y) / c.s) * ns;
        c.s = ns;
      } else {
        c.x -= e.deltaX;
        c.y -= e.deltaY;
      }
      clamp();
      apply();
      kick();
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const k = (e) => {
      if (e.key === 'Escape') { if (open) setOpen(null); }
    };
    window.addEventListener('keydown', k);
    return () => window.removeEventListener('keydown', k);
  }, [open]);

  const zoomBy = (f) => {
    const el = box.current;
    const c = cam.current;
    const ns = Math.min(2.2, Math.max(0.3, c.s * f));
    const px = el.clientWidth / 2, py = el.clientHeight / 2;
    flyTo(px - ((px - c.x) / c.s) * ns, py - ((py - c.y) / c.s) * ns, ns, 350);
  };

  const needle = q.trim().toLowerCase();
  const matches = (c) => {
    if (cat !== 'All' && c.cat !== cat) return false;
    if (!needle) return true;
    const hay = [c.title, c.by, c.date, c.cat, ...c.rows.map((r) => r.join(' '))].join(' ').toLowerCase();
    return needle.split(/\s+/).every((w) => hay.includes(w));
  };
  const hits = items.filter(matches);
  const filtering = !!needle || cat !== 'All';

  // glide to the first match when the search / filter changes
  useEffect(() => {
    if (!filtering || !hits.length || !box.current) return;
    const xs = hits.map((h) => h.x + CW / 2), ys = hits.map((h) => h.y + h.ih / 2);
    const cx = (Math.min(...xs) + Math.max(...xs)) / 2, cy = (Math.min(...ys) + Math.max(...ys)) / 2;
    centreOn(hits.length === 1 ? cx : cx, cy, hits.length === 1 ? 1.15 : Math.min(cam.current.s, 0.9), 800);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [needle, cat]);

  const cur = open && items.find((c) => c.id === open);

  const chip = (label) => (
    <button
      key={label}
      data-ui
      onClick={() => setCat(label)}
      style={{
        border: '1px solid #222', background: cat === label ? '#222' : '#fff', color: cat === label ? '#fff' : '#222',
        fontSize: 13, padding: '3px 11px', cursor: 'pointer', borderRadius: 999, transition: 'background .2s, color .2s', whiteSpace: 'nowrap',
      }}
    >{label}</button>
  );

  return (
    <div
      ref={box}
      onPointerDown={onDown}
      onPointerMove={onMove}
      onPointerUp={onUp}
      onPointerCancel={onUp}
      className="absolute inset-0 overflow-hidden"
      style={{
        cursor: dragging ? 'grabbing' : 'grab', touchAction: 'none', userSelect: 'none', overscrollBehavior: 'contain',
        backgroundColor: '#f4f2ec',
        backgroundImage: 'radial-gradient(rgba(0,0,0,.22) 1px, transparent 1.3px)',
        backgroundSize: '26px 26px',
      }}
    >
      <div ref={world} style={{ position: 'absolute', left: 0, top: 0, width: WORLD_W, height: worldH, transformOrigin: '0 0', willChange: 'transform' }}>
        {items.map((c) => {
          const on = matches(c);
          return (
            <div
              key={c.id}
              data-card={c.id}
              className="cert-card"
              style={{
                position: 'absolute', left: c.x, top: c.y, width: CW,
                '--rot': `${c.rot}deg`, '--d': `${c.delay}ms`,
                opacity: on ? 1 : 0.14, filter: on ? 'none' : 'grayscale(1)',
                transition: 'opacity .45s ease, filter .45s ease',
              }}
            >
              <div className="cert-inner">
                <img src={c.src} alt={c.title} draggable={false} loading="lazy" style={{ display: 'block', width: CW, height: c.ih, objectFit: 'cover', border: '1px solid #222', background: '#fff' }} />
                <div style={{ height: CAP, paddingTop: 8, fontSize: 13, lineHeight: '16px', color: '#111' }}>
                  <div style={{ fontWeight: 600, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{c.title}</div>
                  <div style={{ color: '#666', fontSize: 11.5, marginTop: 2 }}>{c.date || c.cat}</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* toolbar */}
      <div data-ui style={{ position: 'absolute', left: 14, right: 14, top: 12, display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap', cursor: 'default' }}>
        <button data-ui onClick={onBack} style={{ border: '1px solid #222', background: '#fff', fontSize: 13, padding: '5px 12px', cursor: 'pointer' }}>&lt; Back</button>
        <input
          data-ui
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search certificates (python, IEEE, hackathon...)"
          style={{ flex: '1 1 220px', minWidth: 180, maxWidth: 340, border: '1px solid #222', background: '#fff', padding: '6px 12px', fontSize: 14, outline: 'none', borderRadius: 0 }}
        />
        <div data-ui style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {['All', ...CERT_CATEGORIES].map(chip)}
        </div>
      </div>

      <div data-ui style={{ position: 'absolute', left: 14, bottom: 12, fontSize: 12.5, color: '#444', background: 'rgba(255,255,255,.85)', border: '1px solid #222', padding: '4px 10px', cursor: 'default' }}>
        {filtering ? `${hits.length} of ${items.length}` : `${items.length} certificates`} &nbsp;|&nbsp; drag to explore, scroll to pan, ctrl + scroll to zoom
      </div>
      <div data-ui style={{ position: 'absolute', right: 14, bottom: 12, display: 'flex', alignItems: 'center', gap: 6, cursor: 'default' }}>
        <span style={{ fontSize: 12, color: '#444', marginRight: 4 }}>{zoomPct}%</span>
        {[['-', 1 / 1.25], ['+', 1.25]].map(([l, f]) => (
          <button key={l} data-ui onClick={() => zoomBy(f)} style={{ width: 28, height: 28, border: '1px solid #222', background: '#fff', fontSize: 16, lineHeight: 1, cursor: 'pointer' }}>{l}</button>
        ))}
        <button data-ui onClick={() => { const s = HOME_S; flyTo(box.current.clientWidth / 2 - (WORLD_W / 2) * s, 20, s, 700); }} style={{ height: 28, border: '1px solid #222', background: '#fff', fontSize: 12, padding: '0 9px', cursor: 'pointer' }}>Reset</button>
      </div>

      {filtering && !hits.length && (
        <div data-ui style={{ position: 'absolute', left: 0, right: 0, top: '45%', textAlign: 'center', fontSize: 16, color: '#444', pointerEvents: 'none' }}>No certificates match.</div>
      )}

      {/* detail sheet */}
      {cur && (
        <div data-ui onClick={() => setOpen(null)} className="cert-fade dark-scrim" style={{ position: 'absolute', inset: 0, background: 'rgba(20,20,20,.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'default', padding: 24 }}>
          <div onClick={(e) => e.stopPropagation()} className="cert-pop" style={{ background: '#fff', border: '1px solid #222', maxWidth: 700, width: '100%', maxHeight: '100%', display: 'flex', overflow: 'hidden', boxShadow: '0 20px 60px rgba(0,0,0,.45)' }}>
            <div style={{ flex: '0 0 46%', background: '#eceae3', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 14, overflow: 'auto' }}>
              <img src={cur.src} alt={cur.title} draggable={false} style={{ width: '100%', maxHeight: '100%', objectFit: 'contain', border: '1px solid #222', background: '#fff' }} />
            </div>
            <div style={{ flex: 1, padding: '18px 20px', overflowY: 'auto', fontSize: 13.5, lineHeight: '19px', color: '#111' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10 }}>
                <span style={{ fontSize: 11.5, textTransform: 'uppercase', letterSpacing: '.06em', color: '#666' }}>{cur.cat}</span>
                <button onClick={() => setOpen(null)} aria-label="Close" style={{ border: 0, background: 'transparent', fontSize: 18, cursor: 'pointer', lineHeight: 1 }}>&times;</button>
              </div>
              <h3 className="font-display m-0" style={{ fontSize: 21, lineHeight: '25px', fontWeight: 800, margin: '4px 0 6px' }}>{cur.title}</h3>
              <div style={{ color: '#444' }}>{cur.by}</div>
              {cur.date && <div style={{ color: '#444', marginBottom: 12 }}>{cur.date}</div>}
              {cur.rows.map(([k, v]) => (
                <p key={k} style={{ margin: '10px 0 0' }}><b>{k}:</b> {v}</p>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
