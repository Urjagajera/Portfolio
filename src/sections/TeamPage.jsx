import React, { useState } from 'react';
import { asset } from '../lib/design';

// The team "desk": the collage art comes from the recording; the sticky
// question-and-answer on the notepaper is live.
export default function TeamPage() {
  const [ans, setAns] = useState('');
  const [sent, setSent] = useState(false);
  const [wiggle, setWiggle] = useState(null);

  return (
    <div className="relative" style={{ height: 2150 }}>
      <img src={asset('team_scene.jpg')} alt="Team" draggable={false} className="absolute mul" style={{ left: 50, top: 0, width: 1840 }} />

      {/* photo hit-areas: a little wiggle on tap/hover */}
      {[[543, 794, 236, 390], [779, 736, 390, 440], [1172, 794, 290, 372]].map(([l, t, w, h], i) => (
        <button
          key={i}
          aria-label={`Team member ${i + 1}`}
          onMouseEnter={() => setWiggle(i)} onMouseLeave={() => setWiggle(null)}
          className="absolute bg-transparent border-0"
          style={{ left: l, top: t, width: w, height: h, cursor: 'pointer' }}
        />
      ))}
      {wiggle !== null && (
        <div className="absolute pop font-pen text-[#3a3ac8]" style={{ left: 640 + wiggle * 330, top: 700, fontSize: 30, transform: 'rotate(-4deg)' }}>
          {['boop!', 'hello!', '…'][wiggle]}
        </div>
      )}

      {/* interactive answer line sitting on the notepaper */}
      <form
        onSubmit={(e) => { e.preventDefault(); setSent(true); }}
        className="absolute" style={{ left: 706, top: 1586, width: 560 }}
      >
        <input
          value={ans} onChange={(e) => { setAns(e.target.value); setSent(false); }}
          aria-label="Answer"
          className="absolute bg-transparent border-0 outline-none font-pen text-[#3a3ac8]"
          style={{ left: 84, top: -8, width: 300, fontSize: 26 }}
        />
        <button
          type="submit" aria-label="Submit"
          className="absolute bg-transparent border-0"
          style={{ left: -6, top: 18, width: 92, height: 44 }}
        />
        {sent && <span className="absolute font-pen text-[#1a9bb8]" style={{ left: 110, top: 20, fontSize: 26 }}>thanks! ✦</span>}
      </form>
    </div>
  );
}
