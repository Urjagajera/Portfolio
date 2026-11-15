import React, { createContext, useContext, useEffect, useState } from 'react';

// The reference recording is 1890 x 920 px. Every page is laid out in that
// coordinate space and scaled to the browser width with CSS `zoom`, so the
// composition matches the video at any window size.
export const DESIGN_W = 1890;
export const DESIGN_H = 920;

const DesignCtx = createContext({ z: 1, vh: DESIGN_H });
export const useDesign = () => useContext(DesignCtx);

export function DesignProvider({ children }) {
  const read = () => {
    const w = window.innerWidth || DESIGN_W;
    const h = window.innerHeight || DESIGN_H;
    const z = Math.max(0.2, w / DESIGN_W);
    return { z, vh: h / z };
  };
  const [d, setD] = useState(read);
  useEffect(() => {
    const on = () => setD(read());
    window.addEventListener('resize', on);
    return () => window.removeEventListener('resize', on);
  }, []);
  return (
    <DesignCtx.Provider value={d}>
      <div style={{ zoom: d.z, width: DESIGN_W }} className="relative overflow-x-clip">
        {children}
      </div>
    </DesignCtx.Provider>
  );
}

/** Scroll position in design pixels. */
export function useScrollY() {
  const { z } = useDesign();
  const [y, setY] = useState(() => window.scrollY / z);
  useEffect(() => {
    let raf = 0;
    const on = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => setY(window.scrollY / z));
    };
    on();
    window.addEventListener('scroll', on, { passive: true });
    return () => { window.removeEventListener('scroll', on); cancelAnimationFrame(raf); };
  }, [z]);
  return y;
}

/** Document-space top of an element, in design pixels. */
export function docTop(el, z) {
  if (!el) return 0;
  return (el.getBoundingClientRect().top + window.scrollY) / z;
}

export const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
export const easeInOut = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
export const asset = (n) => `/assets/ref/${n}`;
