import React, { useCallback, useEffect, useRef, useState } from 'react';

// Pathfinding visualizer: BFS, DFS, Dijkstra, A* and Greedy best-first on a grid with walls and weighted "mud".
// Cells are painted imperatively during an animation (no React re-render per step), so it stays smooth.

const MUD = 5; // cost of stepping onto mud (a normal cell costs 1)
const ALGOS = {
  bfs: { name: 'BFS', note: 'explores in rings; shortest only when every step costs the same' },
  dfs: { name: 'DFS', note: 'dives deep first; finds a path, rarely a good one' },
  dijkstra: { name: 'Dijkstra', note: 'always the cheapest path, but explores in every direction' },
  astar: { name: 'A*', note: 'cheapest path, guided toward the goal by a distance estimate' },
  greedy: { name: 'Greedy', note: 'rushes at the goal; fast, but not always the cheapest' },
};

class Heap { // binary min-heap of [priority, value]
  constructor() { this.a = []; }
  get size() { return this.a.length; }
  push(p, v) { const a = this.a; a.push([p, v]); let i = a.length - 1; while (i > 0) { const j = (i - 1) >> 1; if (a[j][0] <= a[i][0]) break; [a[i], a[j]] = [a[j], a[i]]; i = j; } }
  pop() { const a = this.a; const top = a[0]; const last = a.pop(); if (a.length) { a[0] = last; let i = 0; for (;;) { const l = 2 * i + 1, r = l + 1; let m = i; if (l < a.length && a[l][0] < a[m][0]) m = l; if (r < a.length && a[r][0] < a[m][0]) m = r; if (m === i) break; [a[i], a[m]] = [a[m], a[i]]; i = m; } } return top; }
}

function solve(kind, g) {
  const { R, C, wall, mud, start, end } = g;
  const t0 = performance.now();
  const nb = (i) => { const r = (i / C) | 0, c = i % C, o = []; if (r > 0) o.push(i - C); if (c < C - 1) o.push(i + 1); if (r < R - 1) o.push(i + C); if (c > 0) o.push(i - 1); return o.filter((n) => !wall[n]); };
  const cost = (i) => (mud[i] ? MUD : 1);
  const h = (i) => Math.abs(((i / C) | 0) - ((end / C) | 0)) + Math.abs((i % C) - (end % C));
  const prev = new Int32Array(R * C).fill(-1); const seen = new Uint8Array(R * C); const order = [];
  if (kind === 'bfs' || kind === 'dfs') {
    const list = [start]; seen[start] = 1;
    while (list.length) {
      const cur = kind === 'bfs' ? list.shift() : list.pop();
      order.push(cur); if (cur === end) break;
      const ns = nb(cur); if (kind === 'dfs') ns.reverse();
      for (const n of ns) if (!seen[n]) { seen[n] = 1; prev[n] = cur; list.push(n); }
    }
  } else {
    const dist = new Float64Array(R * C).fill(Infinity); dist[start] = 0;
    const pq = new Heap(); pq.push(kind === 'dijkstra' ? 0 : h(start), start);
    while (pq.size) {
      const [, cur] = pq.pop();
      if (seen[cur]) continue; seen[cur] = 1; order.push(cur); if (cur === end) break;
      for (const n of nb(cur)) {
        const nd = dist[cur] + cost(n);
        if (kind === 'greedy') { if (!seen[n] && prev[n] === -1 && n !== start) { prev[n] = cur; dist[n] = nd; pq.push(h(n), n); } }
        // A*: f = g + h, ties broken toward the goal (smaller h first), so it heads straight for it
        else if (nd < dist[n]) { dist[n] = nd; prev[n] = cur; pq.push(kind === 'astar' ? nd + h(n) * 1.0001 : nd, n); }
      }
    }
  }
  let path = null;
  if (seen[end]) { path = []; for (let c = end; c !== -1; c = prev[c]) path.unshift(c); }
  const pathCost = path ? path.slice(1).reduce((s, i) => s + cost(i), 0) : null;
  return { order, path, pathCost, ms: performance.now() - t0 };
}

function mazeWalls(R, C) { // randomized depth-first carving on odd cells: a "perfect" maze
  const wall = new Uint8Array(R * C).fill(1);
  const carve = (r, c) => { wall[r * C + c] = 0; };
  const stack = [[1, 1]]; carve(1, 1);
  while (stack.length) {
    const [r, c] = stack[stack.length - 1];
    const opts = [[-2, 0], [2, 0], [0, -2], [0, 2]].map(([dr, dc]) => [r + dr, c + dc, r + dr / 2, c + dc / 2]).filter(([nr, nc]) => nr > 0 && nc > 0 && nr < R - 1 && nc < C - 1 && wall[nr * C + nc]);
    if (!opts.length) { stack.pop(); continue; }
    const [nr, nc, wr, wc] = opts[Math.floor(Math.random() * opts.length)];
    carve(wr, wc); carve(nr, nc); stack.push([nr, nc]);
  }
  // knock out a few extra walls so there is more than one route (makes the algorithms differ)
  for (let k = 0; k < (R * C) / 18; k++) { const r = 1 + Math.floor(Math.random() * (R - 2)), c = 1 + Math.floor(Math.random() * (C - 2)); if ((r + c) % 2 === 1) wall[r * C + c] = 0; }
  return wall;
}

export default function PathLab() {
  const box = useRef(null);
  const [dims, setDims] = useState(null); // { R, C }
  const [wall, setWall] = useState(null);
  const [mud, setMud] = useState(null);
  const [start, setStart] = useState(0);
  const [end, setEnd] = useState(0);
  const [tool, setTool] = useState('wall');
  const [algo, setAlgo] = useState('astar');
  const [speed, setSpeed] = useState(3);
  const [busy, setBusy] = useState(false);
  const [stats, setStats] = useState(null);
  const [compare, setCompare] = useState(null);
  const cells = useRef([]);
  const drag = useRef(null);
  const anim = useRef(0);

  // pick a grid that fits the space: wide window -> 31x17, phone -> 17x17
  useEffect(() => {
    const w = box.current.getBoundingClientRect().width;
    const C = w > 520 ? 31 : 17, R = 17;
    setDims({ R, C }); setWall(new Uint8Array(R * C)); setMud(new Uint8Array(R * C));
    setStart(8 * C + 3); setEnd(8 * C + (C - 4));
  }, []);

  const clearVis = useCallback(() => {
    cancelAnimationFrame(anim.current); setBusy(false);
    cells.current.forEach((el) => el && el.classList.remove('v', 'p', 'f'));
  }, []);
  useEffect(() => () => cancelAnimationFrame(anim.current), []);

  const edit = (i, first) => {
    if (busy) return;
    if (first) {
      if (i === start) { drag.current = 'start'; return; }
      if (i === end) { drag.current = 'end'; return; }
      const on = tool === 'erase' ? 0 : tool === 'wall' ? (wall[i] ? 0 : 1) : (mud[i] ? 0 : 1);
      drag.current = { tool, on };
    }
    const d = drag.current; if (!d) return;
    clearVis(); setStats(null); setCompare(null);
    if (d === 'start') { if (!wall[i] && i !== end) setStart(i); return; }
    if (d === 'end') { if (!wall[i] && i !== start) setEnd(i); return; }
    if (i === start || i === end) return;
    if (d.tool === 'wall' || d.tool === 'erase') setWall((w) => { const n = new Uint8Array(w); n[i] = d.tool === 'wall' ? d.on : 0; return n; });
    if (d.tool === 'mud' || d.tool === 'erase') setMud((m) => { const n = new Uint8Array(m); n[i] = d.tool === 'mud' ? d.on : 0; return n; });
    if (d.tool === 'wall' && d.on) setMud((m) => { if (!m[i]) return m; const n = new Uint8Array(m); n[i] = 0; return n; });
  };
  const cellAt = (e) => { const el = document.elementFromPoint(e.clientX, e.clientY); const c = el && el.closest && el.closest('[data-i]'); return c ? Number(c.dataset.i) : null; };

  const grid = dims && { R: dims.R, C: dims.C, wall, mud, start, end };
  const run = () => {
    if (!grid || busy) return;
    clearVis(); setCompare(null);
    const r = solve(algo, grid);
    setStats({ algo, visited: r.order.length, cost: r.pathCost, len: r.path ? r.path.length - 1 : null, ms: r.ms });
    setBusy(true);
    const per = [1, 2, 4, 8, 16][speed - 1];
    let k = 0, p = 0;
    const step = () => {
      for (let n = 0; n < per && k < r.order.length; n++, k++) { const el = cells.current[r.order[k]]; if (el) el.classList.add('v'); }
      if (k >= r.order.length && r.path) { for (let n = 0; n < Math.max(1, per >> 1) && p < r.path.length; n++, p++) { const el = cells.current[r.path[p]]; if (el) el.classList.add('p'); } }
      if (k < r.order.length || (r.path && p < r.path.length)) anim.current = requestAnimationFrame(step);
      else { setBusy(false); if (!r.path) cells.current[end]?.classList.add('f'); }
    };
    anim.current = requestAnimationFrame(step);
  };
  const compareAll = () => {
    if (!grid || busy) return;
    clearVis(); setStats(null);
    setCompare(Object.keys(ALGOS).map((k) => { const r = solve(k, grid); return { k, visited: r.order.length, cost: r.pathCost, len: r.path ? r.path.length - 1 : null }; }));
  };
  const maze = () => {
    if (!dims || busy) return;
    clearVis(); setStats(null); setCompare(null);
    const w = mazeWalls(dims.R, dims.C); const s = dims.C + 1, e = (dims.R - 2) * dims.C + dims.C - 2;
    w[s] = 0; w[e] = 0; setWall(w); setMud(new Uint8Array(dims.R * dims.C)); setStart(s); setEnd(e);
  };
  const scatterMud = () => {
    if (!dims || busy) return;
    clearVis(); setStats(null); setCompare(null);
    setMud(() => { const m = new Uint8Array(dims.R * dims.C); for (let i = 0; i < m.length; i++) if (!wall[i] && i !== start && i !== end && Math.random() < 0.22) m[i] = 1; return m; });
  };
  const reset = () => { if (!dims) return; clearVis(); setStats(null); setCompare(null); setWall(new Uint8Array(dims.R * dims.C)); setMud(new Uint8Array(dims.R * dims.C)); setStart(8 * dims.C + 3); setEnd(8 * dims.C + (dims.C - 4)); };

  const bestCost = compare ? Math.min(...compare.filter((c) => c.cost !== null).map((c) => c.cost)) : null;
  const maxVisited = compare ? Math.max(...compare.map((c) => c.visited)) : 1;

  return (
    <div className="pg-path" ref={box}>
      <div className="pg-toolbar">
        <div className="pg-seg" role="group" aria-label="Algorithm">
          {Object.entries(ALGOS).map(([k, a]) => <button key={k} type="button" className={algo === k ? 'on' : ''} onClick={() => setAlgo(k)} disabled={busy}>{a.name}</button>)}
        </div>
        <button type="button" className="pg-go" onClick={run} disabled={busy}>Visualize ▶</button>
      </div>
      <div className="pg-toolbar pg-toolbar-2">
        <div className="pg-seg" role="group" aria-label="Brush">
          {[['wall', 'Wall'], ['mud', `Mud (cost ${MUD})`], ['erase', 'Erase']].map(([k, l]) => <button key={k} type="button" className={tool === k ? 'on' : ''} onClick={() => setTool(k)}>{l}</button>)}
        </div>
        <button type="button" className="pg-btn" onClick={maze} disabled={busy}>Maze</button>
        <button type="button" className="pg-btn" onClick={scatterMud} disabled={busy}>Scatter mud</button>
        <button type="button" className="pg-btn" onClick={compareAll} disabled={busy}>Compare all</button>
        <button type="button" className="pg-btn" onClick={reset} disabled={busy}>Reset</button>
        <label className="pg-speed">speed <input type="range" min="1" max="5" value={speed} onChange={(e) => setSpeed(Number(e.target.value))} /></label>
      </div>
      <p className="pg-algo-note"><b>{ALGOS[algo].name}:</b> {ALGOS[algo].note}. Drag the green start and red goal; draw walls and mud on the grid.</p>
      {dims && (
        <div
          className="pg-grid"
          style={{ gridTemplateColumns: `repeat(${dims.C}, 1fr)` }}
          onPointerDown={(e) => { const i = cellAt(e); if (i !== null) { e.preventDefault(); edit(i, true); } }}
          onPointerMove={(e) => { if (!drag.current || e.buttons === 0) return; const i = cellAt(e); if (i !== null) edit(i, false); }}
          onPointerUp={() => { drag.current = null; }}
          onPointerLeave={() => { drag.current = null; }}
        >
          {Array.from({ length: dims.R * dims.C }, (_, i) => (
            <i key={i} data-i={i} ref={(el) => { cells.current[i] = el; }}
              className={i === start ? 's' : i === end ? 'e' : wall[i] ? 'w' : mud[i] ? 'm' : undefined} />
          ))}
        </div>
      )}
      {stats && (
        <div className="pg-stats">
          <span><b>{ALGOS[stats.algo].name}</b></span>
          <span>visited <b>{stats.visited}</b> cells</span>
          <span>path <b>{stats.len ?? '—'}</b> steps</span>
          <span>cost <b>{stats.cost ?? 'no path'}</b></span>
          <span>computed in <b>{stats.ms.toFixed(2)} ms</b></span>
        </div>
      )}
      {compare && (
        <div className="pg-compare">
          <div className="pg-compare-h"><span>algorithm</span><span>cells visited</span><span>path cost</span></div>
          {compare.map((c) => (
            <div key={c.k} className="pg-compare-r">
              <b>{ALGOS[c.k].name}</b>
              <span className="pg-cbar"><i style={{ width: `${(c.visited / maxVisited) * 100}%` }} /><em>{c.visited}</em></span>
              <span className={c.cost === bestCost ? 'best' : ''}>{c.cost ?? 'no path'}{c.cost === bestCost ? ' ✓ cheapest' : ''}</span>
            </div>
          ))}
          <p className="pg-note">Add some mud and compare again: BFS and DFS ignore its cost, so their paths can get pricier; Dijkstra and A* always find the cheapest, and A* usually visits far fewer cells.</p>
        </div>
      )}
    </div>
  );
}
