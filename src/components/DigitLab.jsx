import React, { useCallback, useEffect, useRef, useState } from 'react';

// Handwritten digit recognizer. A small CNN trained on MNIST (see .video-work/mnist/train_cnn.py) runs right
// here in plain JavaScript: conv(1->8) ReLU pool -> conv(8->16) ReLU pool -> fc(784->64) ReLU -> fc(64->10).
// The drawing is preprocessed like MNIST: cropped, scaled to fit 20x20 and centred by its centre of mass.

const MODEL_URL = '/assets/playground/digit-cnn.json';
let modelPromise = null;
function loadModel() {
  if (!modelPromise) {
    modelPromise = fetch(MODEL_URL).then((r) => r.json()).then((m) => {
      const deq = (d) => {
        const raw = atob(d.q); const q = new Int8Array(raw.length);
        for (let i = 0; i < raw.length; i++) q[i] = (raw.charCodeAt(i) << 24) >> 24;
        const per = q.length / d.shape[0]; const w = new Float32Array(q.length);
        for (let o = 0; o < d.shape[0]; o++) for (let i = 0; i < per; i++) w[o * per + i] = q[o * per + i] * d.scale[o];
        return w;
      };
      return { acc: m.test_accuracy, c1w: deq(m.c1w), c1b: m.c1b, c2w: deq(m.c2w), c2b: m.c2b, f1w: deq(m.f1w), f1b: m.f1b, f2w: deq(m.f2w), f2b: m.f2b };
    });
  }
  return modelPromise;
}

// conv 3x3, padding 1, then ReLU
function conv(inp, cin, size, w, b, cout) {
  const out = new Float32Array(cout * size * size);
  for (let o = 0; o < cout; o++) for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
    let s = b[o];
    for (let c = 0; c < cin; c++) for (let ky = -1; ky <= 1; ky++) {
      const yy = y + ky; if (yy < 0 || yy >= size) continue;
      for (let kx = -1; kx <= 1; kx++) {
        const xx = x + kx; if (xx < 0 || xx >= size) continue;
        s += inp[c * size * size + yy * size + xx] * w[((o * cin + c) * 3 + (ky + 1)) * 3 + (kx + 1)];
      }
    }
    out[o * size * size + y * size + x] = s > 0 ? s : 0;
  }
  return out;
}
function pool(inp, ch, size) {
  const h = size / 2; const out = new Float32Array(ch * h * h);
  for (let c = 0; c < ch; c++) for (let y = 0; y < h; y++) for (let x = 0; x < h; x++) {
    const i = c * size * size + 2 * y * size + 2 * x;
    out[c * h * h + y * h + x] = Math.max(inp[i], inp[i + 1], inp[i + size], inp[i + size + 1]);
  }
  return out;
}
function dense(inp, w, b, relu) {
  const n = b.length, m = inp.length; const out = new Float32Array(n);
  for (let o = 0; o < n; o++) { let s = b[o]; for (let i = 0; i < m; i++) s += inp[i] * w[o * m + i]; out[o] = relu && s < 0 ? 0 : s; }
  return out;
}
function predict(M, x) {
  const a1 = conv(x, 1, 28, M.c1w, M.c1b, 8); const p1 = pool(a1, 8, 28);
  const a2 = conv(p1, 8, 14, M.c2w, M.c2b, 16); const p2 = pool(a2, 16, 14);
  const h = dense(p2, M.f1w, M.f1b, true); const z = dense(h, M.f2w, M.f2b, false);
  const mx = Math.max(...z); const e = z.map((v) => Math.exp(v - mx)); const sum = e.reduce((s, v) => s + v, 0);
  return { probs: Array.from(e, (v) => v / sum), a1, h };
}

// MNIST-style preprocessing of the drawing canvas -> 28x28 floats in [0, 1]
function toMnist(src) {
  const S = src.width; const ctx = src.getContext('2d');
  const d = ctx.getImageData(0, 0, S, S).data;
  let x0 = S, y0 = S, x1 = -1, y1 = -1;
  for (let y = 0; y < S; y++) for (let x = 0; x < S; x++) if (d[(y * S + x) * 4] > 30) { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; }
  if (x1 < 0) return null;
  const w = x1 - x0 + 1, h = y1 - y0 + 1; const k = 20 / Math.max(w, h);
  const tmp = document.createElement('canvas'); tmp.width = 28; tmp.height = 28;
  const t = tmp.getContext('2d'); t.fillStyle = '#000'; t.fillRect(0, 0, 28, 28); t.imageSmoothingEnabled = true; t.imageSmoothingQuality = 'high';
  t.drawImage(src, x0, y0, w, h, (28 - w * k) / 2, (28 - h * k) / 2, w * k, h * k);
  let px = t.getImageData(0, 0, 28, 28).data; let m = 0, cx = 0, cy = 0;
  for (let i = 0; i < 784; i++) { const v = px[i * 4] / 255; m += v; cx += v * (i % 28); cy += v * Math.floor(i / 28); }
  const sx = Math.round(14 - cx / m), sy = Math.round(14 - cy / m);
  const out = new Float32Array(784);
  for (let y = 0; y < 28; y++) for (let x = 0; x < 28; x++) {
    const fx = x - sx, fy = y - sy;
    if (fx >= 0 && fx < 28 && fy >= 0 && fy < 28) out[y * 28 + x] = px[(fy * 28 + fx) * 4] / 255;
  }
  return out;
}

function paintGray(cv, arr, size, max = 1) {
  if (!cv) return;
  const ctx = cv.getContext('2d'); const img = ctx.createImageData(size, size);
  for (let i = 0; i < size * size; i++) { const v = Math.min(255, Math.round((arr[i] / max) * 255)); img.data[i * 4] = v; img.data[i * 4 + 1] = v; img.data[i * 4 + 2] = v; img.data[i * 4 + 3] = 255; }
  ctx.putImageData(img, 0, 0);
}
function paintHeat(cv, arr, size, max) {
  if (!cv) return;
  const ctx = cv.getContext('2d'); const img = ctx.createImageData(size, size);
  for (let i = 0; i < size * size; i++) {
    const t = Math.min(1, arr[i] / (max || 1));
    img.data[i * 4] = Math.round(20 + 235 * t); img.data[i * 4 + 1] = Math.round(20 + 170 * t * t); img.data[i * 4 + 2] = Math.round(40 + 40 * (1 - t)); img.data[i * 4 + 3] = 255;
  }
  ctx.putImageData(img, 0, 0);
}

export default function DigitLab() {
  const pad = useRef(null);
  const seen = useRef(null);
  const maps = useRef([]);
  const [model, setModel] = useState(null);
  const [res, setRes] = useState(null);
  const [err, setErr] = useState(null);
  const drawing = useRef(false);
  const last = useRef(null);
  const raf = useRef(0);

  useEffect(() => { loadModel().then(setModel).catch(() => setErr('Could not load the model.')); }, []);
  const clear = useCallback(() => {
    const c = pad.current; const ctx = c.getContext('2d'); ctx.fillStyle = '#000'; ctx.fillRect(0, 0, c.width, c.height);
    setRes(null); paintGray(seen.current, new Float32Array(784), 28); maps.current.forEach((m) => paintGray(m, new Float32Array(784), 28));
  }, []);
  useEffect(() => { clear(); }, [clear]);

  const run = useCallback(() => {
    raf.current = 0;
    if (!model) return;
    const x = toMnist(pad.current);
    if (!x) return;
    const r = predict(model, x);
    paintGray(seen.current, x, 28);
    for (let o = 0; o < 8; o++) { const a = r.a1.subarray(o * 784, (o + 1) * 784); paintHeat(maps.current[o], a, 28, Math.max(0.5, ...a)); }
    setRes(r);
  }, [model]);
  const schedule = () => { if (!raf.current) raf.current = requestAnimationFrame(run); };

  const pos = (e) => { const r = pad.current.getBoundingClientRect(); return [((e.clientX - r.left) / r.width) * pad.current.width, ((e.clientY - r.top) / r.height) * pad.current.height]; };
  const down = (e) => { e.preventDefault(); pad.current.setPointerCapture?.(e.pointerId); drawing.current = true; last.current = pos(e); move(e); };
  const move = (e) => {
    if (!drawing.current) return;
    const p = pos(e); const ctx = pad.current.getContext('2d');
    ctx.strokeStyle = '#fff'; ctx.lineWidth = 20; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    ctx.beginPath(); ctx.moveTo(last.current[0], last.current[1]); ctx.lineTo(p[0], p[1]); ctx.stroke();
    last.current = p; schedule();
  };
  const up = () => { drawing.current = false; schedule(); };

  const top = res ? res.probs.indexOf(Math.max(...res.probs)) : null;
  return (
    <div className="pg-digit">
      <div className="pg-digit-grid">
        <div className="pg-col">
          <div className="pg-cap">1 · draw a digit (0–9)</div>
          <canvas ref={pad} width="280" height="280" className="pg-pad" onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up} aria-label="Drawing pad" />
          <button type="button" className="pg-btn" onClick={clear}>Clear</button>
        </div>
        <div className="pg-col pg-out">
          <div className="pg-cap">4 · prediction</div>
          <div className="pg-guess">
            <b>{top === null ? '?' : top}</b>
            <span>{res ? `${Math.round(res.probs[top] * 100)}% sure` : model ? 'draw something' : err || 'loading the network...'}</span>
          </div>
          <div className="pg-bars">
            {Array.from({ length: 10 }, (_, d) => (
              <div key={d} className={`pg-bar${d === top ? ' is-top' : ''}`}>
                <i style={{ height: `${res ? Math.max(2, res.probs[d] * 100) : 2}%` }} /><span>{d}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="pg-inside">
        <div>
          <div className="pg-cap">2 · what the network sees (28×28)</div>
          <canvas ref={seen} width="28" height="28" className="pg-seen" />
        </div>
        <div>
          <div className="pg-cap">3 · first layer: 8 filters it learned</div>
          <div className="pg-maps">{Array.from({ length: 8 }, (_, i) => <canvas key={i} ref={(el) => { maps.current[i] = el; }} width="28" height="28" />)}</div>
        </div>
        <div>
          <div className="pg-cap">hidden layer: 64 neurons</div>
          <div className="pg-neurons">{Array.from({ length: 64 }, (_, i) => { const v = res ? Math.min(1, res.h[i] / 6) : 0; return <i key={i} style={{ opacity: 0.12 + v * 0.88, transform: `scale(${0.6 + v * 0.5})` }} />; })}</div>
        </div>
      </div>
      <p className="pg-note">
        A convolutional neural network I trained on the 60,000 handwritten digits of MNIST{model ? ` (${model.acc}% on the 10,000 test digits)` : ''}.
        About 52,000 weights, running entirely in your browser: nothing you draw leaves this page.
      </p>
    </div>
  );
}
