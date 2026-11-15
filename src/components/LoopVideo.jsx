import React, { useEffect, useRef, useState } from 'react';

// A short, silent, looping clip. It downloads nothing until it is about to scroll into view, plays only while
// visible and pauses when it leaves, so it costs nothing for visitors who never reach it. With "reduce motion"
// on, it shows the poster and native controls instead of autoplaying.
export default function LoopVideo({ src, poster, caption, style, className = '' }) {
  const ref = useRef(null);
  const [near, setNear] = useState(false);
  const reduce = typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

  useEffect(() => {
    const v = ref.current;
    if (!v || !('IntersectionObserver' in window)) { setNear(true); return undefined; }
    // "in view" isn't enough: the clip can sit inside a window that is mounted but hidden (opacity 0 /
    // visibility hidden), which IntersectionObserver can't see. While in view, re-check real visibility.
    const shown = () => (v.checkVisibility ? v.checkVisibility({ opacityProperty: true, visibilityProperty: true }) : true);
    let timer = 0;
    const sync = () => {
      if (shown()) { setNear(true); if (!reduce && v.paused && v.src) v.play().catch(() => {}); }
      else if (!v.paused) v.pause();
    };
    const io = new IntersectionObserver(([e]) => {
      clearInterval(timer);
      if (e.isIntersecting) { sync(); timer = setInterval(sync, 800); }
      else if (!v.paused) v.pause();
    }, { rootMargin: '200px 0px', threshold: 0.15 });
    io.observe(v);
    const onLoaded = () => sync();
    v.addEventListener('loadeddata', onLoaded);
    return () => { io.disconnect(); clearInterval(timer); v.removeEventListener('loadeddata', onLoaded); };
  }, [reduce]);

  return (
    <figure className={`m-0 ${className}`} style={style}>
      <video
        ref={ref}
        src={near ? src : undefined}
        poster={poster}
        muted
        loop
        playsInline
        preload="none"
        controls={reduce}
        aria-label={caption}
        style={{ display: 'block', width: '100%', aspectRatio: '16 / 9', objectFit: 'cover', background: '#111', borderRadius: 10, border: '1.5px solid #222' }}
      />
      {caption && <figcaption style={{ fontSize: 15, color: '#444', marginTop: 8 }}>{caption}</figcaption>}
    </figure>
  );
}
