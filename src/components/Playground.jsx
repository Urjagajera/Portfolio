import React, { Suspense, lazy, useState } from 'react';

// The "Playground" folder: two interactive pieces. Each loads only when opened (the digit model is a separate file).
const DigitLab = lazy(() => import('./DigitLab'));
const PathLab = lazy(() => import('./PathLab'));

const ITEMS = [
  {
    id: 'digits', Comp: DigitLab, color: '#c39bf8', title: 'Digit recognizer', kind: 'Machine learning',
    blurb: 'Draw a digit and a neural network I trained reads it, live, right in your browser. Watch what it sees and which neurons fire.',
    tags: ['CNN', 'PyTorch training', 'MNIST', 'in-browser inference'],
  },
  {
    id: 'paths', Comp: PathLab, color: '#9be3ea', title: 'Pathfinding visualizer', kind: 'Algorithms',
    blurb: 'BFS, DFS, Dijkstra, A* and Greedy on a grid you design: walls, weighted mud, mazes. Compare how many cells each one explores.',
    tags: ['graphs', 'priority queue', 'A* heuristic', 'weighted paths'],
  },
];

export default function Playground() {
  const [open, setOpen] = useState(null);
  const item = ITEMS.find((x) => x.id === open);
  if (item) {
    return (
      <div className="pg">
        <div className="pg-top">
          <button type="button" className="pg-btn" onClick={() => setOpen(null)}>&lt; playground</button>
          <span className="pg-title" style={{ background: item.color }}>{item.title}</span>
        </div>
        <Suspense fallback={<p className="pg-note">Loading...</p>}><item.Comp /></Suspense>
      </div>
    );
  }
  return (
    <div className="pg">
      <p className="pg-intro">Two things you can play with, built from scratch:</p>
      <div className="pg-cards">
        {ITEMS.map((x) => (
          <button key={x.id} type="button" className="pg-card" onClick={() => setOpen(x.id)}>
            <span className="pg-kind" style={{ background: x.color }}>{x.kind}</span>
            <b>{x.title}</b>
            <span className="pg-blurb">{x.blurb}</span>
            <span className="pg-tags">{x.tags.map((t) => <em key={t}>{t}</em>)}</span>
            <span className="pg-open">Open →</span>
          </button>
        ))}
      </div>
    </div>
  );
}
