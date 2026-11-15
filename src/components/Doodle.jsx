import React, { useEffect, useRef, useState } from 'react';

const MAX_V = 38;     // px per frame (60fps) a throw can reach
const FRICTION = 0.985;
const BOUNCE = 0.88;

// A small hand-drawn sticker (public/assets/doodles/<n>.svg), placed in design pixels inside a positioned section.
// Every doodle is draggable anywhere inside its section; let go while moving and it keeps gliding, spinning and
// bouncing off the edges. Pass `hint` (e.g. "drag me") for an optional handwritten label that fades once touched.
// `src` overrides the doodle file (e.g. a sticker); `zoom` adds a gentle grow-and-lift when the cursor is over it;
// `spin={false}` keeps it upright when thrown (for stickers with text).
export default function Doodle({ n, src, x, y, w = 120, r = 0, z = 0, hint, zoom, spin = true, intro }) {
  const box = useRef(null);
  const img = useRef(null);
  const s = useRef({ dx: 0, dy: 0, rot: r, vx: 0, vy: 0, va: 0, drag: null, raf: 0, t: 0 });
  const [touched, setTouched] = useState(false);

  useEffect(() => () => cancelAnimationFrame(s.current.raf), []);

  const apply = () => {
    const st = s.current;
    if (box.current) box.current.style.transform = `translate3d(${st.dx}px, ${st.dy}px, 0)`;
    if (img.current) img.current.style.transform = `rotate(${st.rot}deg)`;
  };

  const clampIn = () => {
    const e = box.current, p = e && e.offsetParent;
    if (!p) return;
    const st = s.current;
    const minX = -x, maxX = p.offsetWidth - e.offsetWidth - x;
    const minY = -y, maxY = p.offsetHeight - e.offsetHeight - y;
    if (st.dx < minX) { st.dx = minX; st.vx = Math.abs(st.vx) * BOUNCE; }
    if (st.dx > maxX) { st.dx = maxX; st.vx = -Math.abs(st.vx) * BOUNCE; }
    if (st.dy < minY) { st.dy = minY; st.vy = Math.abs(st.vy) * BOUNCE; }
    if (st.dy > maxY) { st.dy = maxY; st.vy = -Math.abs(st.vy) * BOUNCE; }
  };

  const loop = (now) => {
    const st = s.current;
    st.raf = 0;
    if (st.drag) return;
    const k = Math.max(0.2, Math.min(3, (now - st.t) / 16.7));
    st.t = now;
    st.dx += st.vx * k;
    st.dy += st.vy * k;
    st.rot += st.va * k;
    const f = Math.pow(FRICTION, k);
    st.vx *= f; st.vy *= f; st.va *= f;
    clampIn();
    apply();
    if (Math.hypot(st.vx, st.vy) > 0.06 || Math.abs(st.va) > 0.05) st.raf = requestAnimationFrame(loop);
  };

  const down = (e) => {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    const st = s.current;
    cancelAnimationFrame(st.raf);
    st.raf = 0;
    e.currentTarget.setPointerCapture?.(e.pointerId);
    st.drag = { id: e.pointerId, x: e.clientX, y: e.clientY, t: performance.now() };
    st.vx = st.vy = st.va = 0;
    box.current.style.zIndex = 60;
    box.current.style.cursor = 'grabbing';
    setTouched(true);
    e.preventDefault();
  };
  const move = (e) => {
    const st = s.current, d = st.drag;
    if (!d || d.id !== e.pointerId) return;
    const p = box.current.offsetParent;
    const ratio = p.getBoundingClientRect().width / p.offsetWidth || 1;
    const now = performance.now();
    const dx = (e.clientX - d.x) / ratio, dy = (e.clientY - d.y) / ratio;
    const k = Math.max(1, (now - d.t) / 16.7);
    const cap = (v) => Math.max(-MAX_V, Math.min(MAX_V, v));
    st.vx = cap(st.vx * 0.4 + (dx / k) * 0.6);
    st.vy = cap(st.vy * 0.4 + (dy / k) * 0.6);
    st.va = spin ? Math.max(-3, Math.min(3, st.vx * 0.1)) : 0;
    st.dx += dx; st.dy += dy;
    d.x = e.clientX; d.y = e.clientY; d.t = now;
    clampIn();
    apply();
  };
  const up = (e) => {
    const st = s.current, d = st.drag;
    if (!d || d.id !== e.pointerId) return;
    st.drag = null;
    box.current.style.cursor = 'grab';
    if (performance.now() - d.t > 90) st.vx = st.vy = st.va = 0; // held still before release: no throw
    st.t = performance.now();
    st.raf = requestAnimationFrame(loop);
  };

  return (
    <div
      ref={box}
      onPointerDown={down}
      onPointerMove={move}
      onPointerUp={up}
      onPointerCancel={up}
      className="absolute select-none"
      style={{ left: x, top: y, width: w, zIndex: z, cursor: 'grab', touchAction: 'none' }}
    >
      {/* `intro` (ms): pop in during the opening sequence. It animates this wrapper, never the draggable box,
          so dragging and throwing are unaffected once it has played. */}
      <div className={intro != null ? 'intro-pop' : undefined} style={intro != null ? { '--d': `${intro}ms` } : undefined}>
      <div className={zoom ? 'doodle-zoom' : undefined}>
        <img ref={img} src={src || `/assets/doodles/${n}.svg`} alt="" loading={intro != null ? undefined : 'lazy'} decoding="async" draggable={false} className="block w-full" style={{ transform: `rotate(${r}deg)` }} />
      </div>
      {hint && <div
        className="text-center whitespace-nowrap pointer-events-none"
        style={{
          marginTop: -6, fontSize: Math.max(24, w * 0.22), lineHeight: 1.1, color: '#444',
          fontFamily: "'Brush Script MT', 'Snell Roundhand', 'Segoe Script', cursive", fontStyle: 'italic',
          opacity: touched ? 0 : 0.9, transition: 'opacity .5s',
        }}
      >
        {hint}
      </div>}
      </div>
    </div>
  );
}
