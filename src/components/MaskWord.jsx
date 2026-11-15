import React, { useEffect, useRef, useState } from 'react';
import { WORDS, PALETTE } from '../data/words';
import { asset } from '../lib/design';

// A display word whose letters are alpha masks cut from the reference video.
// Hovering a letter repaints it in a random colour (as in the recording),
// and it settles back to ink shortly after the pointer leaves.
export default function MaskWord({ word, className = '', style, base = '#0b0b0b' }) {
  const { n, box, meta } = WORDS[word];
  const [colors, setColors] = useState({});
  const timers = useRef({});
  // the letter masks are optional files; if they aren't there, render nothing instead of a stack of broken masks
  const [ok, setOk] = useState(false);
  useEffect(() => {
    const probe = new Image();
    probe.onload = () => setOk(true);
    probe.onerror = () => setOk(false);
    probe.src = asset(`${word}_0.png`);
    return () => { probe.onload = probe.onerror = null; };
  }, [word]);
  useEffect(() => () => Object.values(timers.current).forEach(clearTimeout), []);

  const enter = (i) => {
    clearTimeout(timers.current[i]);
    const c = PALETTE[Math.floor(Math.random() * PALETTE.length)];
    setColors((s) => ({ ...s, [i]: c }));
  };
  const leave = (i) => {
    timers.current[i] = setTimeout(
      () => setColors((s) => { const o = { ...s }; delete o[i]; return o; }),
      1100,
    );
  };

  return (
    <div className={`relative select-none ${className}`} style={{ width: box[0], height: box[1], ...style }}>
      {ok && Array.from({ length: n }, (_, i) => {
        const [x, y, w, h] = meta[i];
        const url = `url(${asset(`${word}_${i}.png`)})`;
        return (
          <div
            key={i}
            onMouseEnter={() => enter(i)}
            onMouseLeave={() => leave(i)}
            style={{
              position: 'absolute', left: x, top: y, width: w, height: h,
              backgroundColor: colors[i] || base,
              WebkitMaskImage: url, maskImage: url,
              WebkitMaskSize: '100% 100%', maskSize: '100% 100%',
              transition: 'background-color .25s',
            }}
          />
        );
      })}
    </div>
  );
}
