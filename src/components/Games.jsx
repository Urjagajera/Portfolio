import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { GradientGolf, KMeansPainter, TrainNeuron, YouVsModel } from './MLGames';

// The "Games" folder: four small games, each opening with a rules card. Best scores are kept in this browser.
// Everything is sized in em, so the same component fits the desktop Browse window and the phone folder list.

const best = {
  get: (k) => { try { return JSON.parse(localStorage.getItem('game-best-' + k)); } catch { return null; } },
  set: (k, v) => { try { localStorage.setItem('game-best-' + k, JSON.stringify(v)); } catch { /* fine */ } },
};
const rand = (a, b) => a + Math.random() * (b - a);
const shuffle = (arr) => { const a = [...arr]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };

/* ------------------------------------------------------------------ Bug Squash */
const CODE_LINES = [
  'const user = await api.get(`/users/${id}`);',
  'if (!token) return res.status(401).json(err);',
  'const [tasks, setTasks] = useState([]);',
  'SELECT * FROM schemes WHERE state = $1;',
  'for (const s of sessions) notify(s.client);',
  'return items.filter((i) => i.active);',
];
function BugSquash({ onEnd }) {
  const DURATION = 30;
  const [bugs, setBugs] = useState([]);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [escaped, setEscaped] = useState(0);
  const [left, setLeft] = useState(DURATION);
  const id = useRef(0);
  const t0 = useRef(performance.now());
  const done = useRef(false);
  const stats = useRef({ score: 0, squashed: 0, escaped: 0 });
  const comboRef = useRef(0);

  useEffect(() => {
    let spawnT = 0;
    const spawn = () => {
      if (done.current) return;
      const elapsed = (performance.now() - t0.current) / 1000;
      // starts gentle (5 s to cross) and speeds up, but never past half the old top speed (3.2 s to cross)
      const speed = Math.max(3.2, 5 - elapsed * 0.06);
      setBugs((b) => [...b, { id: ++id.current, row: Math.floor(Math.random() * CODE_LINES.length), dur: speed, y: rand(-0.15, 0.15) }]);
      spawnT = setTimeout(spawn, Math.max(660, 1300 - elapsed * 22)); // a new bug every 1.3 s at first, at most every 0.66 s
    };
    spawn();
    const tick = setInterval(() => {
      const l = Math.max(0, DURATION - Math.floor((performance.now() - t0.current) / 1000));
      setLeft(l);
      if (l === 0 && !done.current) { done.current = true; onEnd(stats.current); }
    }, 200);
    return () => { clearTimeout(spawnT); clearInterval(tick); };
  }, [onEnd]);

  const squash = (b) => {
    if (b.dead) return;
    setBugs((all) => all.map((x) => (x.id === b.id ? { ...x, dead: true } : x)));
    setTimeout(() => setBugs((all) => all.filter((x) => x.id !== b.id)), 450);
    comboRef.current += 1;
    const pts = 10 + Math.min(comboRef.current - 1, 5) * 2; // combo bonus up to +10
    stats.current.score += pts; stats.current.squashed += 1;
    setScore(stats.current.score); setCombo(comboRef.current);
  };
  const escape = (b) => {
    if (b.dead) return;
    setBugs((all) => all.filter((x) => x.id !== b.id));
    stats.current.score = Math.max(0, stats.current.score - 5); stats.current.escaped += 1;
    comboRef.current = 0;
    setScore(stats.current.score); setEscaped(stats.current.escaped); setCombo(0);
  };

  return (
    <div className="gm-bug">
      <div className="gm-hud"><span>score <b>{score}</b></span><span>combo <b>x{combo}</b></span><span>escaped <b>{escaped}</b></span><span>time <b>{left}s</b></span></div>
      <div className="gm-code">
        {CODE_LINES.map((l, r) => (
          <div key={r} className="gm-line">
            <span className="gm-ln">{r + 1}</span><code>{l}</code>
            {bugs.filter((b) => b.row === r).map((b) => (
              <button
                key={b.id}
                type="button"
                aria-label="squash bug"
                className={`gm-bugi${b.dead ? ' is-dead' : ''}`}
                style={{ animationDuration: `${b.dur}s`, '--y': `${b.y}em` }}
                onPointerDown={(e) => { e.preventDefault(); squash(b); }}
                onAnimationEnd={(e) => { if (e.animationName === 'gmCrawl') escape(b); }}
              >
                <svg viewBox="0 0 40 30" aria-hidden="true"><ellipse cx="22" cy="15" rx="11" ry="8" fill="#e0533d" stroke="#141414" strokeWidth="2" /><circle cx="10" cy="15" r="5" fill="#141414" /><path d="M16 7 12 2M24 7l2-5M16 23l-4 5M26 23l2 5M30 10l5-3M30 20l5 3" stroke="#141414" strokeWidth="2" strokeLinecap="round" /><path d="M22 8v14" stroke="#141414" strokeWidth="1.5" /></svg>
              </button>
            ))}
          </div>
        ))}
        <div className="gm-prod">production →</div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ Stack Memory */
const STACK = [['React', '#9be3ea'], ['Python', '#fdeb7a'], ['FastAPI', '#9de6c3'], ['PostgreSQL', '#9db8f6'], ['Node.js', '#b8e08a'], ['Tailwind', '#a8e6f0'], ['Groq', '#f4a3b4'], ['Docker', '#b6c8f8']];
function StackMemory({ onEnd }) {
  const deck = useMemo(() => shuffle([...STACK, ...STACK].map(([name, color], i) => ({ i, name, color }))), []);
  const [flipped, setFlipped] = useState([]);
  const [matched, setMatched] = useState([]);
  const [moves, setMoves] = useState(0);
  const [secs, setSecs] = useState(0);
  const lock = useRef(false);
  const t0 = useRef(null);

  useEffect(() => {
    const id = setInterval(() => { if (t0.current) setSecs(Math.floor((performance.now() - t0.current) / 1000)); }, 250);
    return () => clearInterval(id);
  }, []);
  useEffect(() => {
    if (matched.length === deck.length) {
      const s = Math.floor((performance.now() - t0.current) / 1000);
      setTimeout(() => onEnd({ moves, secs: s }), 600);
    }
  }, [matched]); // eslint-disable-line react-hooks/exhaustive-deps

  const flip = (c) => {
    if (lock.current || flipped.includes(c.i) || matched.includes(c.i)) return;
    if (!t0.current) t0.current = performance.now();
    const f = [...flipped, c.i];
    setFlipped(f);
    if (f.length === 2) {
      setMoves((m) => m + 1);
      const [a, b] = f.map((i) => deck.find((d) => d.i === i));
      lock.current = true;
      setTimeout(() => {
        if (a.name === b.name) setMatched((m) => [...m, a.i, b.i]);
        setFlipped([]); lock.current = false;
      }, a.name === b.name ? 350 : 800);
    }
  };

  return (
    <div>
      <div className="gm-hud"><span>moves <b>{moves}</b></span><span>pairs <b>{matched.length / 2}/8</b></span><span>time <b>{secs}s</b></span></div>
      <div className="gm-mem">
        {deck.map((c) => {
          const up = flipped.includes(c.i) || matched.includes(c.i);
          return (
            <button key={c.i} type="button" className={`gm-card${up ? ' is-up' : ''}${matched.includes(c.i) ? ' is-match' : ''}`} onClick={() => flip(c)} aria-label={up ? c.name : 'hidden card'}>
              <span className="gm-back">{'</>'}</span>
              <span className="gm-face" style={{ background: c.color }}>{c.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ Karate Reflex */
const BELTS = [[0, 'White belt'], [150, 'Yellow belt'], [250, 'Orange belt'], [320, 'Green belt'], [380, 'Purple belt (like me!)'], [430, 'Brown belt'], [470, 'Black belt']];
function KarateReflex({ onEnd }) {
  const ROUNDS = 5;
  const [round, setRound] = useState(0);
  const [pos, setPos] = useState(0);
  const [zone, setZone] = useState(() => ({ c: rand(.3, .7), w: .2 }));
  const [result, setResult] = useState(null); // { pts, hit } after a strike
  const [total, setTotal] = useState(0);
  const st = useRef({ x: 0, dir: 1, speed: .55, paused: false, total: 0 });
  const raf = useRef(0);

  useEffect(() => {
    let last = performance.now();
    const loop = (now) => {
      const dt = (now - last) / 1000; last = now;
      const s = st.current;
      if (!s.paused) {
        s.x += s.dir * s.speed * dt;
        if (s.x > 1) { s.x = 1; s.dir = -1; } else if (s.x < 0) { s.x = 0; s.dir = 1; }
        setPos(s.x);
      }
      raf.current = requestAnimationFrame(loop);
    };
    raf.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf.current);
  }, []);

  const strike = useCallback(() => {
    const s = st.current;
    if (s.paused) return;
    s.paused = true;
    const d = Math.abs(s.x - zone.c);
    const hit = d <= zone.w / 2;
    const pts = hit ? Math.round(100 - (d / (zone.w / 2)) * 50) : 0;
    s.total += pts; setTotal(s.total);
    setResult({ pts, hit });
    setTimeout(() => {
      const next = round + 1;
      if (next >= ROUNDS) { onEnd({ score: s.total }); return; }
      setRound(next); setResult(null);
      setZone({ c: rand(.25, .75), w: Math.max(.07, .2 - next * .033) });
      s.speed = .55 + next * .18; s.paused = false;
    }, 1100);
  }, [zone, round, onEnd]);

  useEffect(() => {
    const onKey = (e) => { if (e.code === 'Space' || e.key === ' ') { e.preventDefault(); strike(); } };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [strike]);

  return (
    <div className="gm-kar">
      <div className="gm-hud"><span>round <b>{Math.min(round + 1, ROUNDS)}/{ROUNDS}</b></span><span>score <b>{total}</b></span></div>
      <div className={`gm-board${result ? (result.hit ? ' is-broken' : ' is-missed') : ''}`} aria-hidden="true">
        <i /><i />
        {result && <span className="gm-shout">{result.hit ? `KIAI! +${result.pts}` : 'miss!'}</span>}
      </div>
      <div className="gm-track">
        <div className="gm-zone" style={{ left: `${(zone.c - zone.w / 2) * 100}%`, width: `${zone.w * 100}%` }} />
        <div className="gm-mark" style={{ left: `${pos * 100}%` }} />
      </div>
      <button type="button" className="gm-strike" onPointerDown={(e) => { e.preventDefault(); strike(); }}>STRIKE <small>(or Space)</small></button>
    </div>
  );
}

/* ------------------------------------------------------------------ Speed Typer */
const SNIPPETS = [
  'const [count, setCount] = useState(0);',
  'SELECT name, email FROM users WHERE active = true;',
  'def add(a, b):\n    return a + b',
  'app.get("/api/health", (req, res) => res.json({ ok: true }));',
  'git commit -m "ship it"',
  'items.map((item) => <li key={item.id}>{item.name}</li>)',
];
function SpeedTyper({ onEnd }) {
  const text = useMemo(() => SNIPPETS[Math.floor(Math.random() * SNIPPETS.length)], []);
  const [typed, setTyped] = useState('');
  const [errors, setErrors] = useState(0);
  const t0 = useRef(null);
  const ref = useRef(null);
  useEffect(() => { ref.current && ref.current.focus(); }, []);

  const onChange = (e) => {
    const v = e.target.value.replace(/\r/g, '');
    if (v.length > text.length) return;
    if (!t0.current && v.length) t0.current = performance.now();
    if (v.length > typed.length && v[v.length - 1] !== text[v.length - 1]) setErrors((x) => x + 1);
    setTyped(v);
    if (v === text) {
      const mins = (performance.now() - t0.current) / 60000;
      const wpm = Math.round((text.length / 5) / mins);
      const acc = Math.max(0, Math.round((1 - errors / text.length) * 100));
      setTimeout(() => onEnd({ wpm, acc }), 250);
    }
  };
  const onKeyDown = (e) => {
    if (e.key === 'Tab') { e.preventDefault(); onChange({ target: { value: typed + '    '.slice(0, Math.max(0, text.length - typed.length)) } }); }
    if (e.key === 'Enter') { e.preventDefault(); onChange({ target: { value: typed + '\n' } }); }
  };

  return (
    <div className="gm-type" onClick={() => ref.current && ref.current.focus()}>
      <div className="gm-hud"><span>typed <b>{typed.length}/{text.length}</b></span><span>mistakes <b>{errors}</b></span></div>
      <pre className="gm-snip" aria-hidden="true">
        {text.split('').map((ch, i) => {
          const state = i < typed.length ? (typed[i] === ch ? 'ok' : 'bad') : i === typed.length ? 'cur' : '';
          return <span key={i} className={state}>{ch === '\n' ? '↵\n' : ch}</span>;
        })}
      </pre>
      <textarea ref={ref} className="gm-type-in" value={typed} onChange={onChange} onKeyDown={onKeyDown} spellCheck={false} autoCapitalize="off" autoComplete="off" autoCorrect="off" aria-label="Type the code shown above" />
      <div className="gm-tiny">Tab types 4 spaces, Enter types a new line.</div>
    </div>
  );
}

/* ------------------------------------------------------------------ Big-O Match */
const BIGO_OPTS = ['O(1)', 'O(log n)', 'O(n)', 'O(n log n)', 'O(n²)', 'O(2ⁿ)'];
// growth curves for the chart (n from 1 to 16, y clipped to the chart); scaled so every curve is readable
const CURVE = {
  'O(1)': () => 10,
  'O(log n)': (n) => 10 + 9 * Math.log2(n),
  'O(n)': (n) => 6 * n,
  'O(n log n)': (n) => 2 * n * Math.log2(n),
  'O(n²)': (n) => 0.42 * n * n,
  'O(2ⁿ)': (n) => 2 ** (n / 1.6) * 1.2,
};
const CURVE_COLOR = { 'O(1)': '#2f9e44', 'O(log n)': '#1c7ed6', 'O(n)': '#7048e8', 'O(n log n)': '#e8590c', 'O(n²)': '#c2255c', 'O(2ⁿ)': '#141414' };
const CH = { w: 380, h: 230, l: 34, b: 26, t: 10, r: 86, nMax: 16, yMax: 110 };
const cx = (n) => CH.l + ((n - 1) / (CH.nMax - 1)) * (CH.w - CH.l - CH.r);
const cy = (v) => CH.h - CH.b - (Math.min(v, CH.yMax) / CH.yMax) * (CH.h - CH.b - CH.t);
const curvePts = (k) => { const pts = []; for (let n = 1; n <= CH.nMax; n += 0.25) { const v = CURVE[k](n); pts.push([cx(n), cy(v)]); if (v > CH.yMax) break; } return pts; };
const curvePath = (k) => curvePts(k).map(([x, y], i) => `${i ? 'L' : 'M'}${x.toFixed(1)} ${y.toFixed(1)}`).join(' ');
const curveEnd = (k) => { const p = curvePts(k); return p[p.length - 1]; };
// labels sit in a column on the right, stacked so they never overlap, each joined to its curve by a thin line
const TAG_X = CH.w - 70;
const TAG_Y = (() => {
  const ends = BIGO_OPTS.map((k) => [k, Math.max(curveEnd(k)[1], CH.t + 8)]).sort((x, y) => x[1] - y[1]);
  const out = {}; let last = -Infinity;
  for (const [k, y] of ends) { const yy = Math.max(y, last + 19); out[k] = yy; last = yy; }
  const over = last - (CH.h - CH.b - 4); if (over > 0) for (const k in out) out[k] -= over;
  return out;
})();

const BIGO = [
  { code: 'function first(arr) {\n  return arr[0];\n}', a: 'O(1)', why: 'One step, no matter how big the array is.' },
  { code: 'let sum = 0;\nfor (let i = 0; i < n; i++) {\n  sum += arr[i];\n}', a: 'O(n)', why: 'One pass over n items.' },
  { code: 'for (let i = 0; i < n; i++)\n  for (let j = 0; j < n; j++)\n    grid[i][j] = 0;', a: 'O(n²)', why: 'A loop inside a loop: n × n steps.' },
  { code: 'while (lo <= hi) {\n  const mid = (lo + hi) >> 1;\n  if (arr[mid] === x) return mid;\n  arr[mid] < x ? lo = mid + 1 : hi = mid - 1;\n}', a: 'O(log n)', why: 'Binary search: the range halves every step.' },
  { code: 'for (let i = 1; i < n; i *= 2) {\n  steps++;\n}', a: 'O(log n)', why: 'i doubles each time, so it reaches n in log₂ n steps.' },
  { code: 'const seen = new Map();\n// ...\nseen.get(key);', a: 'O(1)', why: 'A hash map lookup is constant time on average.' },
  { code: 'for (const x of arr) total += x;\nfor (const x of arr) max = Math.max(max, x);', a: 'O(n)', why: 'Two loops one after the other: 2n, still O(n).' },
  { code: 'for (let i = 0; i < n; i++)\n  for (let j = i + 1; j < n; j++)\n    if (arr[i] === arr[j]) dup = true;', a: 'O(n²)', why: 'Every pair is checked: about n²/2 steps, so O(n²).' },
  { code: 'function mergeSort(a) {\n  if (a.length < 2) return a;\n  const m = a.length >> 1;\n  return merge(mergeSort(a.slice(0, m)),\n               mergeSort(a.slice(m)));\n}', a: 'O(n log n)', why: 'log n levels of splitting, and n work to merge each level.' },
  { code: 'arr.sort((a, b) => a - b);', a: 'O(n log n)', why: 'Built-in comparison sorts run in n log n.' },
  { code: 'function fib(n) {\n  if (n < 2) return n;\n  return fib(n - 1) + fib(n - 2);\n}', a: 'O(2ⁿ)', why: 'Each call branches into two more calls.' },
  { code: 'for (let i = 0; i < n; i++)\n  for (let k = 0; k < 10; k++)\n    work(i, k);', a: 'O(n)', why: 'The inner loop is a fixed 10 steps, so 10n is still O(n).' },
];
const Q_TIME = 15; // seconds per question
function BigOMatch({ onEnd }) {
  const ROUNDS = 10;
  const qs = useMemo(() => shuffle(BIGO).slice(0, ROUNDS), []);
  const [i, setI] = useState(0);
  const [pick, setPick] = useState(null);
  const [hover, setHover] = useState(null);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [left, setLeft] = useState(Q_TIME);
  const q = qs[i];

  useEffect(() => {
    if (pick) return undefined;
    const t0 = performance.now();
    const id = setInterval(() => {
      const l = Math.max(0, Q_TIME - (performance.now() - t0) / 1000);
      setLeft(l);
      if (l <= 0) { clearInterval(id); setPick('timeout'); setStreak(0); }
    }, 100);
    return () => clearInterval(id);
  }, [i, pick]);

  const answer = (o) => {
    if (pick) return;
    setPick(o);
    if (o === q.a) { setScore((s) => s + 1); setStreak((s) => { const n = s + 1; setBestStreak((b) => Math.max(b, n)); return n; }); } else setStreak(0);
  };
  const next = () => {
    if (i + 1 >= ROUNDS) { onEnd({ correct: score, streak: bestStreak }); return; }
    setI(i + 1); setPick(null); setLeft(Q_TIME);
  };
  const right = pick && pick === q.a;

  return (
    <div className="gm-bigo">
      <div className="gm-hud"><span>question <b>{i + 1}/{ROUNDS}</b></span><span>correct <b>{score}</b></span><span>streak <b>{streak ? `🔥 ${streak}` : 0}</b></span></div>
      <div className="gm-timer"><i style={{ width: `${(left / Q_TIME) * 100}%`, background: left < 4 ? '#e0533d' : '#7be08a' }} /></div>
      <div className="gm-bigo-cols">
        <pre className="gm-snip gm-snip-code">{q.code}</pre>
        <div className="gm-chart-wrap">
          <div className="gm-chart-hint">{pick ? (right ? 'Correct!' : pick === 'timeout' ? 'Time is up!' : 'Not quite.') : 'Click the curve that matches the code'}</div>
          <svg className="gm-chart" viewBox={`0 0 ${CH.w} ${CH.h}`} role="group" aria-label="Growth curves">
            <path d={`M${CH.l} ${CH.t} V${CH.h - CH.b} H${CH.w - CH.r + 8}`} className="gm-axis" />
            <text x={CH.w - CH.r + 4} y={CH.h - 8} className="gm-ax-t">n →</text>
            <text x="4" y={CH.t + 10} className="gm-ax-t">work</text>
            {BIGO_OPTS.map((k) => {
              const d = curvePath(k); const [ex, ey] = curveEnd(k);
              const state = pick ? (k === q.a ? 'right' : k === pick ? 'wrong' : 'dim') : hover === k ? 'hover' : '';
              return (
                <g key={k} className={`gm-curve ${state}`} onClick={() => answer(k)} onPointerEnter={() => setHover(k)} onPointerLeave={() => setHover(null)} style={{ '--c': CURVE_COLOR[k] }}>
                  <path d={d} className="gm-curve-line" pathLength="100" />
                  <path d={d} className="gm-curve-hit" />
                  <path d={`M${ex} ${ey} L${TAG_X - 2} ${TAG_Y[k]}`} className="gm-curve-lead" />
                  <g className="gm-curve-tag" transform={`translate(${TAG_X} ${TAG_Y[k]})`}>
                    <rect x="0" y="-9" width="68" height="17" rx="5" />
                    <text x="34" y="3">{k}</text>
                  </g>
                  {pick && k === q.a && (
                    <circle r="5" className="gm-runner"><animateMotion dur="1.8s" repeatCount="indefinite" path={d} /></circle>
                  )}
                </g>
              );
            })}
          </svg>
        </div>
      </div>
      {pick && (
        <div className="gm-why">
          <b>{right ? 'Correct!' : `It's ${q.a}.`}</b> {q.why}
          <button type="button" className="gm-go" onClick={next}>{i + 1 >= ROUNDS ? 'See score' : 'Next →'}</button>
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ Sort Race */
// Each algorithm is recorded as a list of frames (array snapshot + the two indices being compared).
function framesOf(kind, input) {
  const a = [...input]; const f = [];
  const snap = (x, y) => f.push({ a: [...a], x, y });
  if (kind === 'Bubble') {
    for (let i = 0; i < a.length; i++) for (let j = 0; j < a.length - 1 - i; j++) { snap(j, j + 1); if (a[j] > a[j + 1]) [a[j], a[j + 1]] = [a[j + 1], a[j]]; }
  } else if (kind === 'Insertion') {
    for (let i = 1; i < a.length; i++) { let j = i; while (j > 0) { snap(j - 1, j); if (a[j - 1] > a[j]) { [a[j - 1], a[j]] = [a[j], a[j - 1]]; j--; } else break; } }
  } else if (kind === 'Merge') {
    const tmp = [...a];
    for (let w = 1; w < a.length; w *= 2) for (let lo = 0; lo < a.length - w; lo += 2 * w) {
      const mid = lo + w, hi = Math.min(lo + 2 * w, a.length); let i = lo, j = mid, k = lo;
      while (i < mid && j < hi) { snap(i, j); tmp[k++] = a[i] <= a[j] ? a[i++] : a[j++]; }
      while (i < mid) tmp[k++] = a[i++]; while (j < hi) tmp[k++] = a[j++];
      for (let t = lo; t < hi; t++) a[t] = tmp[t];
    }
  } else {
    const qs = (lo, hi) => {
      if (lo >= hi) return;
      const p = a[hi]; let i = lo;
      for (let j = lo; j < hi; j++) { snap(j, hi); if (a[j] < p) { [a[i], a[j]] = [a[j], a[i]]; i++; } }
      [a[i], a[hi]] = [a[hi], a[i]];
      qs(lo, i - 1); qs(i + 1, hi);
    };
    qs(0, a.length - 1);
  }
  f.push({ a: [...a], x: -1, y: -1 });
  return f;
}
const SORTS = ['Bubble', 'Insertion', 'Merge', 'Quick'];
const SORT_INFO = { Bubble: 'O(n²) · swaps neighbours', Insertion: 'O(n²) · builds a sorted part', Merge: 'O(n log n) · split & merge', Quick: 'O(n log n) avg · pivots' };
const MEDALS = ['🥇', '🥈', '🥉', '4th'];
const N_BARS = 28;
const barColor = (v) => `hsl(${Math.round(((v - 1) / (N_BARS - 1)) * 280)} 75% 62%)`;
function MiniBars({ kind }) {
  // a tiny looping "sorting" icon for the guess cards
  return (
    <span className={`gm-mini gm-mini-${kind}`} aria-hidden="true">
      {[5, 2, 7, 1, 6, 3, 8, 4].map((v, i) => <i key={i} style={{ '--h': `${v * 12}%`, '--i': i, background: barColor(v * 3.5) }} />)}
    </span>
  );
}
function SortRace({ onEnd }) {
  const input = useMemo(() => shuffle(Array.from({ length: N_BARS }, (_, i) => i + 1)), []);
  const runs = useMemo(() => SORTS.map((k) => ({ k, frames: framesOf(k, input) })), [input]);
  const order = useMemo(() => [...runs].sort((a, b) => a.frames.length - b.frames.length).map((r) => r.k), [runs]);
  const winner = order[0];
  const [guess, setGuess] = useState(null);
  const [step, setStep] = useState(0);
  const total = Math.max(...runs.map((r) => r.frames.length));
  useEffect(() => {
    if (!guess) return undefined;
    const id = setInterval(() => setStep((s) => { if (s + 1 >= total) { clearInterval(id); return s; } return s + 1; }), 22);
    return () => clearInterval(id);
  }, [guess, total]);
  const finished = guess && step >= total - 1;
  useEffect(() => {
    if (!finished) return undefined;
    const t = setTimeout(() => onEnd({ correct: guess === winner, guess, winner, counts: runs.map((r) => [r.k, r.frames.filter((f) => f.x >= 0).length]) }), 3200);
    return () => clearTimeout(t);
  }, [finished]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!guess) {
    return (
      <div className="gm-guess">
        <p>Same {N_BARS} shuffled bars for everyone. <b>Which algorithm finishes first</b> (fewest comparisons)?</p>
        <div className="gm-guess-cards">
          {SORTS.map((k) => (
            <button key={k} type="button" className="gm-guess-card" onClick={() => setGuess(k)}>
              <MiniBars kind={k} />
              <b>{k} sort</b>
              <span>{SORT_INFO[k]}</span>
            </button>
          ))}
        </div>
      </div>
    );
  }
  const doneAt = (r) => r.frames.length - 1;
  return (
    <div>
      <div className="gm-race">
        {runs.map((r) => {
          const fi = Math.min(step, doneAt(r)); const fr = r.frames[fi]; const fin = fi === doneAt(r);
          const cmps = r.frames.slice(0, fi + 1).filter((f) => f.x >= 0).length;
          const place = order.indexOf(r.k);
          return (
            <div key={r.k} className={`gm-lane${fin ? ' is-done' : ''}${fin && place === 0 ? ' is-win' : ''}`}>
              <div className="gm-lane-h">
                <b>{r.k}{r.k === guess ? ' · your pick' : ''}</b>
                <span>{cmps} comparisons {fin && <em className="gm-medal">{MEDALS[place]}</em>}</span>
              </div>
              <div className="gm-bars">
                {fr.a.map((v, i) => (
                  <i key={i} className={i === fr.x || i === fr.y ? 'hl' : ''} style={{ height: `${(v / N_BARS) * 100}%`, background: barColor(v) }} />
                ))}
              </div>
              <div className="gm-prog"><i style={{ width: `${(fi / doneAt(r)) * 100}%` }} /></div>
            </div>
          );
        })}
      </div>
      {finished && (
        <div className="gm-podium">
          {[1, 0, 2].map((p) => (
            <div key={p} className={`gm-step gm-step-${p}`}>
              <span>{MEDALS[p]}</span><b>{order[p]}</b>
              <i style={{ height: `${[3.2, 2.3, 1.6][p]}em` }}>{p + 1}</i>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ Maze Solver */
const MC = 16, MR = 10, MSTART = 0, MGOAL = MC * MR - 1;
const nbrs = (i) => { const r = Math.floor(i / MC), c = i % MC, o = []; if (r > 0) o.push(i - MC); if (c < MC - 1) o.push(i + 1); if (r < MR - 1) o.push(i + MC); if (c > 0) o.push(i - 1); return o; };
function search(walls, kind) {
  const prev = new Map([[MSTART, -1]]); const order = []; const list = [MSTART];
  while (list.length) {
    const cur = kind === 'bfs' ? list.shift() : list.pop();
    order.push(cur);
    if (cur === MGOAL) break;
    for (const n of nbrs(cur)) if (!walls.has(n) && !prev.has(n)) { prev.set(n, cur); list.push(n); }
  }
  if (!prev.has(MGOAL)) return { order, path: null };
  const path = []; for (let c = MGOAL; c !== -1; c = prev.get(c)) path.unshift(c);
  return { order, path };
}
function MazeSolver({ onEnd }) {
  const [walls, setWalls] = useState(() => new Set());
  const [anim, setAnim] = useState(null); // { kind, order, path, k }
  const [stats, setStats] = useState({});
  const painting = useRef(null);
  const busy = anim && anim.k < anim.order.length + (anim.path ? anim.path.length : 0);

  const paint = (i, add) => {
    if (i === MSTART || i === MGOAL || busy) return;
    setAnim(null); setStats({}); // a changed maze needs a fresh run
    setWalls((w) => { const n = new Set(w); if (add) n.add(i); else n.delete(i); return n; });
  };
  useEffect(() => { const up = () => { painting.current = null; }; window.addEventListener('pointerup', up); return () => window.removeEventListener('pointerup', up); }, []);
  const run = (kind) => {
    const r = search(walls, kind);
    setAnim({ kind, ...r, k: 0 });
    setStats((s) => ({ ...s, [kind]: { visited: r.order.length, len: r.path ? r.path.length - 1 : null } }));
  };
  useEffect(() => {
    if (!busy) return undefined;
    const id = setTimeout(() => setAnim((a) => ({ ...a, k: a.k + 2 })), 16);
    return () => clearTimeout(id);
  }, [anim, busy]);
  const randomize = () => { setAnim(null); setStats({}); const w = new Set(); for (let i = 0; i < MC * MR; i++) if (i !== MSTART && i !== MGOAL && Math.random() < 0.3) w.add(i); setWalls(w); };

  const visitedN = anim ? Math.min(anim.k, anim.order.length) : 0;
  const visited = anim ? new Set(anim.order.slice(0, visitedN)) : new Set();
  const pathN = anim && anim.path ? Math.max(0, anim.k - anim.order.length) : 0;
  const path = anim && anim.path ? new Set(anim.path.slice(0, pathN)) : new Set();
  const bfs = stats.bfs;

  return (
    <div className="gm-maze-wrap">
      <div className="gm-hud">
        <span>walls <b>{walls.size}</b></span>
        {stats.bfs && <span>BFS: path <b>{stats.bfs.len ?? 'none'}</b>, visited {stats.bfs.visited}</span>}
        {stats.dfs && <span>DFS: path <b>{stats.dfs.len ?? 'none'}</b>, visited {stats.dfs.visited}</span>}
      </div>
      <div className="gm-maze" style={{ gridTemplateColumns: `repeat(${MC}, 1fr)` }} onPointerLeave={() => { painting.current = null; }}>
        {Array.from({ length: MC * MR }, (_, i) => {
          const cls = i === MSTART ? 'st' : i === MGOAL ? 'go' : walls.has(i) ? 'w' : path.has(i) ? 'p' : visited.has(i) ? (anim.kind === 'bfs' ? 'vb' : 'vd') : '';
          return (
            <i key={i} className={cls}
              onPointerDown={(e) => { e.preventDefault(); const add = !walls.has(i); painting.current = add; paint(i, add); }}
              onPointerEnter={() => { if (painting.current !== null) paint(i, painting.current); }} />
          );
        })}
      </div>
      <div className="gm-row gm-maze-btns">
        <button type="button" className="gm-back-btn" onClick={() => run('bfs')} disabled={busy}>Run BFS</button>
        <button type="button" className="gm-back-btn" onClick={() => run('dfs')} disabled={busy}>Run DFS</button>
        <button type="button" className="gm-back-btn" onClick={randomize} disabled={busy}>Random walls</button>
        <button type="button" className="gm-back-btn" onClick={() => { setWalls(new Set()); setAnim(null); setStats({}); }} disabled={busy}>Clear</button>
        <button type="button" className="gm-go" disabled={!bfs || bfs.len == null || busy} onClick={() => onEnd({ len: bfs.len, visited: bfs.visited, walls: walls.size })}>
          Submit {bfs && bfs.len != null ? `(${bfs.len} steps)` : ''}
        </button>
      </div>
      {bfs && bfs.len == null && <div className="gm-tiny gm-warn">No path from start to goal. Remove a wall and run BFS again.</div>}
    </div>
  );
}

/* ------------------------------------------------------------------ the folder */
const GAMES = [
  {
    id: 'bugs', cat: 'fun', name: 'Bug Squash', color: '#f4717f', blurb: 'catch bugs before production',
    rules: ['Bugs crawl along the lines of code toward production.', 'Click or tap a bug to squash it: +10, more with a combo.', 'Every bug that reaches production costs 5 points and breaks your combo.', 'You have 30 seconds. They start slow and speed up.'],
    Comp: BugSquash,
    result: (r) => ({ main: `${r.score} points`, sub: `${r.squashed} squashed · ${r.escaped} escaped`, key: r.score, better: (a, b) => a > b, fmt: (v) => `${v} points` }),
  },
  {
    id: 'memory', cat: 'fun', name: 'Stack Memory', color: '#9be3ea', blurb: 'match my tech stack',
    rules: ['16 cards hide 8 pairs from my tech stack.', 'Flip two cards at a time; a match stays face up.', 'Clear the board in as few moves as you can.', 'The clock starts on your first flip.'],
    Comp: StackMemory,
    result: (r) => ({ main: `${r.moves} moves`, sub: `in ${r.secs} seconds`, key: r.moves, better: (a, b) => a < b, fmt: (v) => `${v} moves` }),
  },
  {
    id: 'karate', cat: 'fun', name: 'Karate Reflex', color: '#c39bf8', blurb: 'break the board, earn a belt',
    rules: ['A marker sweeps across the bar.', 'Strike (Space, or the STRIKE button) when it is inside the green zone.', 'Closer to the centre = more points, up to 100 per board.', '5 boards. The zone shrinks and the marker speeds up each round.'],
    Comp: KarateReflex,
    result: (r) => ({ main: `${r.score} / 500`, sub: BELTS.filter(([min]) => r.score >= min).pop()[1], key: r.score, better: (a, b) => a > b, fmt: (v) => `${v} / 500` }),
  },
  {
    id: 'typer', cat: 'fun', name: 'Speed Typer', color: '#fdeb7a', blurb: 'type real code, fast',
    rules: ['A real code snippet appears (React, SQL, Python, git...).', 'Type it exactly. The timer starts on your first key.', 'Mistakes turn red; fix them with Backspace.', 'Your score is words per minute, plus accuracy.'],
    Comp: SpeedTyper,
    result: (r) => ({ main: `${r.wpm} WPM`, sub: `${r.acc}% accuracy`, key: r.wpm, better: (a, b) => a > b, fmt: (v) => `${v} WPM` }),
  },
  {
    id: 'bigo', cat: 'algo', name: 'Big-O Match', color: '#9db8f6', blurb: 'how fast is this code?',
    rules: ['A piece of code appears next to a chart of growth curves.', 'Click the curve that shows how its work grows as n grows.', '15 seconds per question; keep a streak going 🔥.', 'After each answer you see why, so you learn as you play. 10 questions.'],
    Comp: BigOMatch,
    result: (r) => ({ main: `${r.correct} / 10`, sub: r.correct >= 9 ? 'Algorithms whiz!' : r.correct >= 6 ? 'Solid. A bit more practice and you are there.' : 'Now you know a few more complexities!', key: r.correct, better: (a, b) => a > b, fmt: (v) => `${v} / 10` }),
  },
  {
    id: 'sort', cat: 'algo', name: 'Sort Race', color: '#9de6c3', blurb: 'guess the fastest sort',
    rules: ['Four sorting algorithms get the same 28 shuffled rainbow bars.', 'Before the race, guess which one finishes with the fewest comparisons.', 'Watch them race side by side; red bars are being compared.', 'A new shuffle every race, so the winner can change.'],
    Comp: SortRace,
    result: (r) => ({ main: r.correct ? 'You called it!' : `${r.winner} sort won`, sub: (r.counts || []).map(([k, n]) => `${k} ${n}`).join(' · ') + ' comparisons', key: r.correct ? 1 : 0, better: (a, b) => a > b, fmt: (v) => (v ? 'guessed a winner' : 'no correct guess yet') }),
  },
  {
    id: 'maze', cat: 'algo', name: 'Maze Solver', color: '#f6b67a', blurb: 'BFS vs DFS path finding',
    rules: ['Draw walls by clicking or dragging on the grid (click a wall to remove it).', 'Goal: make the SHORTEST path from start (green) to goal (red) as LONG as possible, without blocking it.', 'Run BFS to find the shortest path; run DFS to see how a depth-first search wanders instead.', 'Submit to score: your score is BFS’s path length.'],
    Comp: MazeSolver,
    result: (r) => ({ main: `${r.len} steps`, sub: `shortest path with ${r.walls} walls · BFS visited ${r.visited} cells`, key: r.len, better: (a, b) => a > b, fmt: (v) => `${v} steps` }),
  },
  {
    id: 'gd', cat: 'ml', name: 'Gradient Descent Golf', color: '#ffc9a8', blurb: 'roll into the global minimum',
    rules: ['The curve is a model’s loss; lower is better. The flag marks the global minimum.', 'Each Step moves the ball downhill: new x = x − learning rate × slope.', 'Too small a learning rate crawls (or gets stuck in the local minimum); too big overshoots or flies off.', 'Reach the flag in as few steps as possible (20 max).'],
    Comp: GradientGolf,
    result: (r) => ({ main: r.won ? `Hole in ${r.steps}` : 'Missed the hole', sub: r.won ? 'that is how learning rate shapes training' : 'tip: one bold step, then small ones', key: r.won ? r.steps : 99, better: (a, b) => a < b, fmt: (v) => (v === 99 ? 'not solved yet' : `${v} steps`) }),
  },
  {
    id: 'kmeans', cat: 'ml', name: 'K-Means Painter', color: '#b2f2bb', blurb: 'guess the clusters',
    rules: ['Grey points appear in a few hidden groups. You can click to add more.', 'Guess how many clusters (K) there are.', 'Watch k-means work: points take the colour of their nearest centroid (×), centroids move to the middle of their points, repeat until nothing moves.', '3 rounds. Score = correct guesses.'],
    Comp: KMeansPainter,
    result: (r) => ({ main: `${r.correct} / 3`, sub: 'clusters guessed right', key: r.correct, better: (a, b) => a > b, fmt: (v) => `${v} / 3` }),
  },
  {
    id: 'neuron', cat: 'ml', name: 'Train the Neuron', color: '#d0bfff', blurb: 'you vs a perceptron',
    rules: ['Red and blue dots can be split by a straight line.', 'Drag the two handles to draw your best dividing line, then lock it in.', 'A single neuron (perceptron) then learns its own line live, epoch by epoch.', 'Score = how many dots your line gets right.'],
    Comp: TrainNeuron,
    result: (r) => ({ main: `You ${r.you}% · neuron ${r.model}%`, sub: `the neuron needed ${r.epochs} epochs`, key: r.you, better: (a, b) => a > b, fmt: (v) => `${v}%` }),
  },
  {
    id: 'knn', cat: 'ml', name: 'You vs the Model', color: '#a5d8ff', blurb: 'beat a KNN classifier',
    rules: ['Red points sit in the middle, blue ones around them.', 'A new black point appears: say red or blue.', 'A KNN model answers too, by voting with its 5 nearest neighbours (you will see the lines).', '10 points. At the end, see how the model splits the whole plane.'],
    Comp: YouVsModel,
    result: (r) => ({ main: `You ${r.you} · model ${r.model}`, sub: r.you > r.model ? 'You beat the machine!' : r.you === r.model ? 'A draw with the machine.' : 'The model wins this time.', key: r.you, better: (a, b) => a > b, fmt: (v) => `${v} / 10` }),
  },
];

function Folder({ color }) {
  return (
    <svg viewBox="0 0 64 52" className="gm-folder" aria-hidden="true">
      <path d="M2 8a3 3 0 0 1 3-3h17l5 6h32a3 3 0 0 1 3 3v33a3 3 0 0 1-3 3H5a3 3 0 0 1-3-3z" fill={color} stroke="#141414" strokeWidth="2" />
      <path d="M2 17h60" stroke="#141414" strokeWidth="2" />
    </svg>
  );
}

export default function Games() {
  const [game, setGame] = useState(null);
  const [stage, setStage] = useState('rules'); // rules | play | done
  const [res, setRes] = useState(null);
  const [run, setRun] = useState(0);
  const g = GAMES.find((x) => x.id === game);

  const onEnd = useCallback((r) => {
    const info = g.result(r);
    const prev = best.get(g.id);
    const isBest = prev === null || info.better(info.key, prev);
    if (isBest) best.set(g.id, info.key);
    setRes({ ...info, isBest, prev });
    setStage('done');
  }, [g]);

  if (!g) {
    return (
      <div className="gm">
        <p className="gm-intro">Take a break. Pick a game folder:</p>
        {[['fun', 'Just for fun'], ['algo', 'Algorithms'], ['ml', 'Machine learning']].map(([cat, title]) => (
        <section key={cat} className="gm-shelf">
        <h5 className="gm-shelf-h">{title}</h5>
        <div className="gm-grid">
          {GAMES.filter((x) => x.cat === cat).map((x) => {
            const b = best.get(x.id);
            return (
              <button key={x.id} type="button" className="gm-pick" onClick={() => { setGame(x.id); setStage('rules'); setRes(null); }}>
                <Folder color={x.color} />
                <b>{x.name}</b>
                <span>{x.blurb}</span>
                {b !== null && <em>best: {x.result({ score: b, moves: b, wpm: b, correct: b, len: b, you: b, model: 0, won: true, steps: b, secs: 0, squashed: 0, escaped: 0, acc: 0, walls: 0, visited: 0, epochs: 0, counts: [] }).fmt(b)}</em>}
              </button>
            );
          })}
        </div>
        </section>
        ))}
      </div>
    );
  }

  return (
    <div className="gm">
      <div className="gm-top">
        <button type="button" className="gm-back-btn" onClick={() => setGame(null)}>&lt; all games</button>
        <span className="gm-title" style={{ background: g.color }}>{g.name}</span>
      </div>
      {stage === 'rules' && (
        <div className="gm-rules">
          <h4>How to play</h4>
          <ol>{g.rules.map((r) => <li key={r}>{r}</li>)}</ol>
          <button type="button" className="gm-go" onClick={() => { setRun((n) => n + 1); setStage('play'); }}>Start ▶</button>
        </div>
      )}
      {stage === 'play' && <g.Comp key={run} onEnd={onEnd} />}
      {stage === 'done' && res && (
        <div className="gm-done">
          <div className="gm-big">{res.main}</div>
          <div>{res.sub}</div>
          <div className="gm-best">{res.isBest ? (res.prev === null ? 'First score saved!' : 'New best! 🎉') : `Your best: ${res.fmt(res.prev)}`}</div>
          <div className="gm-row">
            <button type="button" className="gm-go" onClick={() => { setRun((n) => n + 1); setStage('play'); }}>Play again</button>
            <button type="button" className="gm-back-btn" onClick={() => setGame(null)}>Other games</button>
          </div>
        </div>
      )}
    </div>
  );
}
