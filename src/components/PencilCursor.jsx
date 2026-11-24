import { useEffect } from 'react';

// Desktop only: the cursor becomes a pencil that leaves a thin graphite line, fading out within a second.
// Over anything clickable it is the normal hand, in text fields the text cursor. Skipped on touch screens
// and for people who prefer reduced motion. (In dark mode the page flip turns the graphite into chalk.)
const LIFE = 1100; // ms a stroke stays visible

export default function PencilCursor() {
  useEffect(() => {
    const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!fine) return undefined;
    document.documentElement.classList.add('pencil-cursor');
    if (reduce) return () => document.documentElement.classList.remove('pencil-cursor');

    const cv = document.createElement('canvas');
    cv.className = 'pencil-trail';
    cv.setAttribute('aria-hidden', 'true');
    document.body.appendChild(cv);
    const ctx = cv.getContext('2d');
    let dpr = 1;
    const size = () => {
      dpr = Math.min(2, window.devicePixelRatio || 1);
      cv.width = innerWidth * dpr; cv.height = innerHeight * dpr;
      cv.style.width = `${innerWidth}px`; cv.style.height = `${innerHeight}px`;
    };
    size();

    let pts = [];
    let raf = 0;
    const draw = () => {
      raf = 0;
      const now = performance.now();
      pts = pts.filter((p) => now - p.t < LIFE);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, innerWidth, innerHeight);
      ctx.lineCap = 'round';
      for (let i = 1; i < pts.length; i++) {
        const a = pts[i - 1], b = pts[i];
        if (b.t - a.t > 160 || a.gap || b.gap) continue; // a pause, a scroll or leaving the window starts a new stroke
        const k = 1 - (now - b.t) / LIFE;
        ctx.strokeStyle = `rgba(50, 50, 56, ${0.72 * k})`;
        ctx.lineWidth = 1 + 1.8 * k;
        ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
      }
      if (pts.length) raf = requestAnimationFrame(draw);
    };
    let drawing = true;
    const onMove = (e) => {
      if (e.pointerType && e.pointerType !== 'mouse') return;
      const t = e.target;
      // no graphite over text fields, the terminal or while something is being dragged
      drawing = !(t && t.closest && t.closest('input, textarea, .term, [contenteditable]')) && !e.buttons;
      if (!drawing) return;
      pts.push({ x: e.clientX, y: e.clientY, t: performance.now() });
      if (pts.length > 400) pts.splice(0, pts.length - 400);
      if (!raf) raf = requestAnimationFrame(draw);
    };
    const onLeave = () => { if (pts.length) pts[pts.length - 1].gap = true; };
    const onScroll = () => { if (pts.length) pts.push({ x: -9, y: -9, t: performance.now(), gap: true }); };
    window.addEventListener('pointermove', onMove, { passive: true });
    window.addEventListener('scroll', onScroll, { passive: true });
    document.addEventListener('pointerleave', onLeave);
    window.addEventListener('resize', size);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('scroll', onScroll);
      document.removeEventListener('pointerleave', onLeave);
      window.removeEventListener('resize', size);
      cv.remove();
      document.documentElement.classList.remove('pencil-cursor');
    };
  }, []);
  return null;
}
