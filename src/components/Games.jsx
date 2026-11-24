import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';

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
      const speed = Math.max(1.6, 3.6 - elapsed * 0.07); // seconds to cross the line
      setBugs((b) => [...b, { id: ++id.current, row: Math.floor(Math.random() * CODE_LINES.length), dur: speed, y: rand(-0.15, 0.15) }]);
      spawnT = setTimeout(spawn, Math.max(330, 900 - elapsed * 22));
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

/* ------------------------------------------------------------------ the folder */
const GAMES = [
  {
    id: 'bugs', name: 'Bug Squash', color: '#f4717f', blurb: 'catch bugs before production',
    rules: ['Bugs crawl along the lines of code toward production.', 'Click or tap a bug to squash it: +10, more with a combo.', 'Every bug that reaches production costs 5 points and breaks your combo.', 'You have 30 seconds, and they get faster.'],
    Comp: BugSquash,
    result: (r) => ({ main: `${r.score} points`, sub: `${r.squashed} squashed · ${r.escaped} escaped`, key: r.score, better: (a, b) => a > b, fmt: (v) => `${v} points` }),
  },
  {
    id: 'memory', name: 'Stack Memory', color: '#9be3ea', blurb: 'match my tech stack',
    rules: ['16 cards hide 8 pairs from my tech stack.', 'Flip two cards at a time; a match stays face up.', 'Clear the board in as few moves as you can.', 'The clock starts on your first flip.'],
    Comp: StackMemory,
    result: (r) => ({ main: `${r.moves} moves`, sub: `in ${r.secs} seconds`, key: r.moves, better: (a, b) => a < b, fmt: (v) => `${v} moves` }),
  },
  {
    id: 'karate', name: 'Karate Reflex', color: '#c39bf8', blurb: 'break the board, earn a belt',
    rules: ['A marker sweeps across the bar.', 'Strike (Space, or the STRIKE button) when it is inside the green zone.', 'Closer to the centre = more points, up to 100 per board.', '5 boards. The zone shrinks and the marker speeds up each round.'],
    Comp: KarateReflex,
    result: (r) => ({ main: `${r.score} / 500`, sub: BELTS.filter(([min]) => r.score >= min).pop()[1], key: r.score, better: (a, b) => a > b, fmt: (v) => `${v} / 500` }),
  },
  {
    id: 'typer', name: 'Speed Typer', color: '#fdeb7a', blurb: 'type real code, fast',
    rules: ['A real code snippet appears (React, SQL, Python, git...).', 'Type it exactly. The timer starts on your first key.', 'Mistakes turn red; fix them with Backspace.', 'Your score is words per minute, plus accuracy.'],
    Comp: SpeedTyper,
    result: (r) => ({ main: `${r.wpm} WPM`, sub: `${r.acc}% accuracy`, key: r.wpm, better: (a, b) => a > b, fmt: (v) => `${v} WPM` }),
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
        <div className="gm-grid">
          {GAMES.map((x) => {
            const b = best.get(x.id);
            return (
              <button key={x.id} type="button" className="gm-pick" onClick={() => { setGame(x.id); setStage('rules'); setRes(null); }}>
                <Folder color={x.color} />
                <b>{x.name}</b>
                <span>{x.blurb}</span>
                {b !== null && <em>best: {x.result({ score: b, moves: b, wpm: b, secs: 0, squashed: 0, escaped: 0, acc: 0 }).fmt(b)}</em>}
              </button>
            );
          })}
        </div>
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
