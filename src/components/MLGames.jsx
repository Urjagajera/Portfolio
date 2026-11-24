import React, { useMemo, useState } from 'react';

// A visual machine-learning game for the Games folder. Plots are SVG in a fixed viewBox; pointer
// positions are mapped through getBoundingClientRect, so they work inside the zoomed desktop window too.


/* ================================================================ Gradient Descent Golf */
const f = (x) => 0.15 * x ** 4 - 0.9 * x ** 2 + 0.35 * x + 2;
const df = (x) => 0.6 * x ** 3 - 1.8 * x + 0.35;
const GLOBAL_X = -1.825, LOCAL_X = 1.63;
const GD = { W: 400, H: 230, x0: -2.85, x1: 2.85, y0: -1.0, y1: 5.4 };
const gx = (x) => ((x - GD.x0) / (GD.x1 - GD.x0)) * GD.W;
const gy = (y) => GD.H - ((y - GD.y0) / (GD.y1 - GD.y0)) * GD.H;
export function GradientGolf({ onEnd }) {
  const MAX = 20;
  const [x, setX] = useState(2.5);
  const [lr, setLr] = useState(0.05);
  const [trail, setTrail] = useState([2.5]);
  const [steps, setSteps] = useState(0);
  const [msg, setMsg] = useState('Pick a learning rate, then Step.');
  const [over, setOver] = useState(false);
  const curve = useMemo(() => { const p = []; for (let t = GD.x0; t <= GD.x1 + 1e-9; t += 0.04) p.push(`${p.length ? 'L' : 'M'}${gx(t).toFixed(1)} ${gy(f(t)).toFixed(1)}`); return p.join(' '); }, []);

  const step = () => {
    if (over) return;
    const g = df(x);
    const nx = x - lr * g;
    const n = steps + 1;
    setSteps(n);
    if (Math.abs(nx) > 3) { setTrail((t) => [...t, nx]); setX(nx); setMsg('Too big a step: the ball flew off the curve! Resetting...'); setTimeout(() => { setX(2.5); setTrail([2.5]); setMsg('Try a smaller learning rate.'); }, 1100); return; }
    setX(nx); setTrail((t) => [...t, nx]);
    if (Math.abs(nx - GLOBAL_X) < 0.1) { setOver(true); setMsg(`Hole in ${n}! You found the global minimum.`); setTimeout(() => onEnd({ won: true, steps: n }), 1400); return; }
    if (Math.abs(nx - LOCAL_X) < 0.06 && Math.abs(df(nx)) < 0.08) setMsg('Stuck in a local minimum: the slope is ~0 here. A bigger learning rate can jump the hill.');
    else setMsg(`gradient ${g.toFixed(2)} → moved ${(-lr * g).toFixed(2)}`);
    if (n >= MAX) { setOver(true); setTimeout(() => onEnd({ won: false, steps: n }), 1200); }
  };
  const g = df(x);
  // tangent arrow pointing downhill
  const dir = g > 0 ? -1 : 1, ax = gx(x), ay = gy(f(x));
  const ex = gx(x + dir * 0.45), ey = gy(f(x) + dir * 0.45 * g);
  return (
    <div className="ml-gd">
      <div className="gm-hud"><span>step <b>{steps}/{MAX}</b></span><span>loss <b>{f(x).toFixed(3)}</b></span><span>slope <b>{g.toFixed(2)}</b></span></div>
      <svg className="ml-plot" viewBox={`0 0 ${GD.W} ${GD.H}`}>
        <path d={`${curve} L${GD.W} ${GD.H} L0 ${GD.H}z`} className="ml-area" />
        <path d={curve} className="ml-curve" />
        <g transform={`translate(${gx(GLOBAL_X)} ${gy(f(GLOBAL_X))})`}><path d="M0 0V-34" className="ml-pole" /><path d="M0 -34l16 6-16 6z" className="ml-flag" /><text y="16" className="ml-lbl" textAnchor="middle">global min</text></g>
        <text x={gx(LOCAL_X)} y={gy(f(LOCAL_X)) + 30} className="ml-lbl" textAnchor="middle">local min (trap)</text>
        {trail.slice(0, -1).map((t, i) => Math.abs(t) <= 3 && <circle key={i} cx={gx(t)} cy={gy(f(t))} r="3" className="ml-trail" />)}
        {Math.abs(x) <= 3 && <line x1={ax} y1={ay} x2={ex} y2={ey} className="ml-tangent" markerEnd="url(#ml-arrow)" />}
        <defs><marker id="ml-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0L10 5 0 10z" fill="#e8590c" /></marker></defs>
        <circle className="ml-ball" style={{ transform: `translate(${gx(Math.max(-3, Math.min(3, x)))}px, ${gy(f(Math.max(-3, Math.min(3, x)))) - 8}px)` }} r="8" />
      </svg>
      <div className="ml-msg">{msg}</div>
      <div className="ml-ctl">
        <label>learning rate <b>{lr.toFixed(2)}</b>
          <input type="range" min="0.01" max="0.6" step="0.01" value={lr} onChange={(e) => setLr(Number(e.target.value))} />
        </label>
        <button type="button" className="gm-go" onClick={step} disabled={over}>Step ▸</button>
      </div>
    </div>
  );
}
