import React, { useEffect, useMemo, useRef, useState } from 'react';

// Four small, visual machine-learning games for the Games folder. Plots are SVG in a fixed viewBox; pointer
// positions are mapped through getBoundingClientRect, so they work inside the zoomed desktop window too.

const rnd = (a, b) => a + Math.random() * (b - a);
const gauss = () => { let u = 0, v = 0; while (!u) u = Math.random(); while (!v) v = Math.random(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); };
const toSvg = (e, svg, W, H) => { const r = svg.getBoundingClientRect(); return [((e.clientX - r.left) / r.width) * W, ((e.clientY - r.top) / r.height) * H]; };
const PALETTE = ['#e8590c', '#1c7ed6', '#2f9e44', '#c2255c', '#7048e8'];
const RED = '#e0533d', BLUE = '#1c7ed6';

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

/* ================================================================ K-Means Painter */
const KW = 400, KH = 250;
function blobs(k) {
  const centers = [];
  while (centers.length < k) { const c = [rnd(50, KW - 50), rnd(40, KH - 40)]; if (centers.every((d) => Math.hypot(d[0] - c[0], d[1] - c[1]) > 95)) centers.push(c); }
  return centers.flatMap(([cxp, cyp]) => Array.from({ length: 16 }, () => [cxp + gauss() * 20, cyp + gauss() * 17]));
}
export function KMeansPainter({ onEnd }) {
  const ROUNDS = 3;
  const [round, setRound] = useState(0);
  const [trueK, setTrueK] = useState(() => 2 + Math.floor(Math.random() * 4));
  const [pts, setPts] = useState(() => blobs(trueK));
  const [k, setK] = useState(null);
  const [cents, setCents] = useState([]);
  const [assign, setAssign] = useState([]);
  const [iter, setIter] = useState(0);
  const [state, setState] = useState('pick'); // pick | run | done
  const [correct, setCorrect] = useState(0);
  const svg = useRef(null);

  const addPoint = (e) => { if (state !== 'pick') return; setPts((p) => [...p, toSvg(e, svg.current, KW, KH)]); };
  const run = (kk) => {
    setK(kk); setState('run'); setIter(0);
    const c = [pts[Math.floor(Math.random() * pts.length)]];
    while (c.length < kk) { // k-means++ style spread
      const d = pts.map((p) => Math.min(...c.map((q) => (p[0] - q[0]) ** 2 + (p[1] - q[1]) ** 2)));
      const tot = d.reduce((a, b) => a + b, 0); let r = Math.random() * tot, i = 0;
      while (r > d[i]) { r -= d[i]; i++; }
      c.push(pts[Math.min(i, pts.length - 1)]);
    }
    setCents(c.map(([a, b]) => [a, b])); setAssign([]);
  };
  useEffect(() => {
    if (state !== 'run') return undefined;
    const t = setTimeout(() => {
      const as = pts.map((p) => { let bi = 0, bd = Infinity; cents.forEach((c, i) => { const d = (p[0] - c[0]) ** 2 + (p[1] - c[1]) ** 2; if (d < bd) { bd = d; bi = i; } }); return bi; });
      const nc = cents.map((c, i) => { const m = pts.filter((_, j) => as[j] === i); return m.length ? [m.reduce((s, p) => s + p[0], 0) / m.length, m.reduce((s, p) => s + p[1], 0) / m.length] : c; });
      const moved = nc.some((c, i) => Math.hypot(c[0] - cents[i][0], c[1] - cents[i][1]) > 0.5);
      setAssign(as); setCents(nc); setIter((n) => n + 1);
      if (!moved && assign.length) {
        setState('done');
        if (k === trueK) setCorrect((c) => c + 1);
      }
    }, 750);
    return () => clearTimeout(t);
  }, [state, cents]); // eslint-disable-line react-hooks/exhaustive-deps

  const inertia = assign.length ? Math.round(pts.reduce((s, p, i) => s + (p[0] - cents[assign[i]][0]) ** 2 + (p[1] - cents[assign[i]][1]) ** 2, 0) / 100) : null;
  const next = () => {
    if (round + 1 >= ROUNDS) { onEnd({ correct }); return; }
    const nk = 2 + Math.floor(Math.random() * 4);
    setRound(round + 1); setTrueK(nk); setPts(blobs(nk)); setK(null); setCents([]); setAssign([]); setIter(0); setState('pick');
  };

  return (
    <div className="ml-km">
      <div className="gm-hud"><span>round <b>{round + 1}/{ROUNDS}</b></span><span>right <b>{correct}</b></span>{iter > 0 && <span>iteration <b>{iter}</b></span>}{inertia !== null && <span>inertia <b>{inertia}</b></span>}</div>
      <svg ref={svg} className="ml-plot ml-click" viewBox={`0 0 ${KW} ${KH}`} onPointerDown={addPoint}>
        {pts.map((p, i) => <circle key={i} cx={p[0]} cy={p[1]} r="4.5" className="ml-pt" style={{ fill: assign.length ? PALETTE[assign[i] % 5] : '#9a9aa6' }} />)}
        {cents.map((c, i) => <g key={i} className="ml-cent" style={{ transform: `translate(${c[0]}px, ${c[1]}px)` }}><path d="M-9 -9L9 9M9 -9L-9 9" style={{ stroke: PALETTE[i % 5] }} /><circle r="11" style={{ stroke: PALETTE[i % 5] }} /></g>)}
      </svg>
      {state === 'pick' && (
        <div className="ml-ctl">
          <span>How many clusters do you see? (click the plot to add points)</span>
          <div className="gm-opts">{[2, 3, 4, 5].map((n) => <button key={n} type="button" className="gm-opt" onClick={() => run(n)}>K = {n}</button>)}</div>
        </div>
      )}
      {state === 'run' && <div className="ml-msg">Assign each point to its nearest centroid, then move each centroid to the mean of its points. Repeat...</div>}
      {state === 'done' && (
        <div className="gm-why">
          <b>{k === trueK ? 'Spot on!' : `The data had ${trueK} clusters.`}</b> k-means settled after {iter} iterations{k !== trueK ? ' (it always gives exactly K groups, even when K is wrong)' : ''}.
          <button type="button" className="gm-go" onClick={next}>{round + 1 >= ROUNDS ? 'See score' : 'Next round →'}</button>
        </div>
      )}
    </div>
  );
}

/* ================================================================ Train the Neuron */
const NW = 400, NH = 250;
function sepData() {
  const a = rnd(0, Math.PI), nx = Math.cos(a), ny = Math.sin(a), c = rnd(-30, 30);
  const out = [];
  while (out.length < 34) {
    const x = rnd(15, NW - 15), y = rnd(15, NH - 15);
    const s = (x - NW / 2) * nx + (y - NH / 2) * ny - c;
    if (Math.abs(s) > 16) out.push({ x, y, label: s > 0 ? 1 : -1 });
  }
  return out;
}
const lineSide = (p, a, b) => Math.sign((b[0] - a[0]) * (p.y - a[1]) - (b[1] - a[1]) * (p.x - a[0])) || 1;
const accOfLine = (data, a, b) => { const s = data.filter((p) => lineSide(p, a, b) === p.label).length / data.length; return Math.round(Math.max(s, 1 - s) * 100); };
export function TrainNeuron({ onEnd }) {
  const data = useMemo(sepData, []);
  const [A, setA] = useState([60, 40]);
  const [B, setB] = useState([340, 210]);
  const [drag, setDrag] = useState(null);
  const [phase, setPhase] = useState('you'); // you | train | done
  const [w, setW] = useState([0, 0, 0]); // w0 + w1 x + w2 y
  const [epoch, setEpoch] = useState(0);
  const [mine, setMine] = useState(null);
  const svg = useRef(null);
  const you = accOfLine(data, A, B);

  const onMove = (e) => { if (!drag) return; const p = toSvg(e, svg.current, NW, NH); (drag === 'A' ? setA : setB)([Math.max(0, Math.min(NW, p[0])), Math.max(0, Math.min(NH, p[1]))]); };
  // perceptron on normalised inputs
  const pred = (wt, p) => Math.sign(wt[0] + wt[1] * (p.x / NW - 0.5) + wt[2] * (p.y / NH - 0.5)) || 1;
  const modelAcc = (wt) => Math.round((data.filter((p) => pred(wt, p) === p.label).length / data.length) * 100);
  useEffect(() => {
    if (phase !== 'train') return undefined;
    const t = setTimeout(() => {
      const wt = [...w];
      data.forEach((p) => { if (pred(wt, p) !== p.label) { wt[0] += 0.5 * p.label; wt[1] += 0.5 * p.label * (p.x / NW - 0.5); wt[2] += 0.5 * p.label * (p.y / NH - 0.5); } });
      setW(wt); setEpoch((n) => n + 1);
      if (modelAcc(wt) === 100 || epoch + 1 >= 40) setPhase('done');
    }, 280);
    return () => clearTimeout(t);
  }, [phase, w]); // eslint-disable-line react-hooks/exhaustive-deps
  // model line endpoints across the plot: w0 + w1 (x/NW - .5) + w2 (y/NH - .5) = 0
  const modelLine = () => {
    if (!w[1] && !w[2]) return null;
    if (Math.abs(w[2]) > Math.abs(w[1])) { const y = (x) => (0.5 - (w[0] + w[1] * (x / NW - 0.5)) / w[2]) * NH; return [[0, y(0)], [NW, y(NW)]]; }
    const x = (y) => (0.5 - (w[0] + w[2] * (y / NH - 0.5)) / w[1]) * NW; return [[x(0), 0], [x(NH), NH]];
  };
  const ml = modelLine();
  const lockIn = () => { setMine(you); setPhase('train'); };

  return (
    <div className="ml-nn">
      <div className="gm-hud"><span>your line <b>{mine ?? you}%</b></span>{phase !== 'you' && <><span>neuron <b>{modelAcc(w)}%</b></span><span>epoch <b>{epoch}</b></span></>}</div>
      <svg ref={svg} className="ml-plot" viewBox={`0 0 ${NW} ${NH}`} onPointerMove={onMove} onPointerUp={() => setDrag(null)} onPointerLeave={() => setDrag(null)}>
        {data.map((p, i) => <circle key={i} cx={p.x} cy={p.y} r="5" fill={p.label > 0 ? RED : BLUE} className="ml-pt" />)}
        {ml && <line x1={ml[0][0]} y1={ml[0][1]} x2={ml[1][0]} y2={ml[1][1]} className="ml-model-line" />}
        <line x1={A[0]} y1={A[1]} x2={B[0]} y2={B[1]} className={`ml-user-line${phase !== 'you' ? ' is-locked' : ''}`} />
        {phase === 'you' && ['A', 'B'].map((h) => { const p = h === 'A' ? A : B; return <circle key={h} cx={p[0]} cy={p[1]} r="10" className="ml-handle" onPointerDown={(e) => { e.preventDefault(); e.currentTarget.ownerSVGElement.setPointerCapture?.(e.pointerId); setDrag(h); }} />; })}
      </svg>
      {phase === 'you' && <div className="ml-ctl"><span>Drag the two handles so the line splits red from blue.</span><button type="button" className="gm-go" onClick={lockIn}>Lock in my line</button></div>}
      {phase === 'train' && <div className="ml-msg">Your line is locked (dashed). Now a single neuron learns: for every point it gets wrong, it nudges its weights toward the right answer...</div>}
      {phase === 'done' && (
        <div className="gm-why">
          <b>{mine >= modelAcc(w) ? 'You matched the machine!' : 'The neuron wins this one.'}</b> You: {mine}% · neuron: {modelAcc(w)}% after {epoch} epochs.
          <button type="button" className="gm-go" onClick={() => onEnd({ you: mine, model: modelAcc(w), epochs: epoch })}>See score</button>
        </div>
      )}
    </div>
  );
}

/* ================================================================ You vs the Model (KNN) */
const VW = 400, VH = 250, KNN = 5;
function ringPoint() {
  // inner disc = red, outer ring = blue, with a little overlap noise
  const red = Math.random() < 0.5;
  const r = red ? rnd(0, 62) : rnd(70, 118);
  const a = rnd(0, Math.PI * 2);
  return { x: VW / 2 + Math.cos(a) * r * 1.45 + gauss() * 7, y: VH / 2 + Math.sin(a) * r * 0.95 + gauss() * 7, label: red ? 1 : -1 };
}
export function YouVsModel({ onEnd }) {
  const ROUNDS = 10;
  const train = useMemo(() => Array.from({ length: 70 }, ringPoint), []);
  const tests = useMemo(() => Array.from({ length: ROUNDS }, ringPoint), []);
  const [i, setI] = useState(0);
  const [mine, setMine] = useState(null);
  const [score, setScore] = useState({ you: 0, model: 0 });
  const [showMap, setShowMap] = useState(false);
  const t = tests[i];
  const knn = (p) => { const near = [...train].sort((a, b) => Math.hypot(a.x - p.x, a.y - p.y) - Math.hypot(b.x - p.x, b.y - p.y)).slice(0, KNN); return { near, pred: Math.sign(near.reduce((s, q) => s + q.label, 0)) || 1 }; };
  const m = useMemo(() => knn(t), [i]); // eslint-disable-line react-hooks/exhaustive-deps
  const map = useMemo(() => {
    if (!showMap) return [];
    const cells = []; const s = 16;
    for (let y = 0; y < VH; y += s) for (let x = 0; x < VW; x += s) cells.push({ x, y, s, c: knn({ x: x + s / 2, y: y + s / 2 }).pred });
    return cells;
  }, [showMap]); // eslint-disable-line react-hooks/exhaustive-deps

  const answer = (lab) => {
    if (mine !== null) return;
    setMine(lab);
    setScore((s) => ({ you: s.you + (lab === t.label ? 1 : 0), model: s.model + (m.pred === t.label ? 1 : 0) }));
  };
  const next = () => {
    if (i + 1 >= ROUNDS) { setShowMap(true); setTimeout(() => onEnd(score), 2600); return; }
    setI(i + 1); setMine(null);
  };
  return (
    <div className="ml-vs">
      <div className="gm-hud"><span>point <b>{i + 1}/{ROUNDS}</b></span><span>you <b>{score.you}</b></span><span>model (KNN, k=5) <b>{score.model}</b></span></div>
      <svg className="ml-plot" viewBox={`0 0 ${VW} ${VH}`}>
        {map.map((c, k) => <rect key={k} x={c.x} y={c.y} width={c.s} height={c.s} fill={c.c > 0 ? RED : BLUE} opacity=".16" />)}
        {mine !== null && m.near.map((q, k) => <line key={k} x1={t.x} y1={t.y} x2={q.x} y2={q.y} className="ml-nb" />)}
        {train.map((p, k) => <circle key={k} cx={p.x} cy={p.y} r="4.5" fill={p.label > 0 ? RED : BLUE} className="ml-pt" />)}
        {!showMap && <circle cx={t.x} cy={t.y} r="9" className={`ml-test${mine !== null ? (t.label > 0 ? ' is-red' : ' is-blue') : ''}`} />}
      </svg>
      {mine === null && !showMap && (
        <div className="ml-ctl"><span>The black point is new. Which class is it?</span>
          <div className="gm-opts"><button type="button" className="gm-opt ml-red" onClick={() => answer(1)}>Red</button><button type="button" className="gm-opt ml-blue" onClick={() => answer(-1)}>Blue</button></div>
        </div>
      )}
      {mine !== null && !showMap && (
        <div className="gm-why">
          <b>It was {t.label > 0 ? 'red' : 'blue'}.</b> You: {mine === t.label ? '✓' : '✗'} · model: {m.pred === t.label ? '✓' : '✗'} (it voted with its 5 nearest neighbours, the lines).
          <button type="button" className="gm-go" onClick={next}>{i + 1 >= ROUNDS ? 'Show the model’s map' : 'Next point →'}</button>
        </div>
      )}
      {showMap && <div className="ml-msg">This is how the model splits the whole plane: every spot takes the vote of its 5 nearest training points.</div>}
    </div>
  );
}
