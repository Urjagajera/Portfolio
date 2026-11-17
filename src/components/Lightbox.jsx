import React, { createContext, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

// The Browse window provides an element to render the viewer into, so it covers just that window.
// Without a host (e.g. a full-page resume view) it falls back to a fixed overlay on the page.
export const LightboxHost = createContext(null);

export default function Lightbox({ list, i, onClose, onGo, host }) {
  const root = useRef(null);
  const item = list[i];
  const many = list.length > 1;
  const go = (d) => onGo((i + d + list.length) % list.length);

  useEffect(() => {
    const k = (e) => {
      if (e.key === 'Escape') onClose();
      else if (many && e.key === 'ArrowRight') go(1);
      else if (many && e.key === 'ArrowLeft') go(-1);
    };
    window.addEventListener('keydown', k);
    // keep the page from scrolling (and the Browse window from closing) while the viewer is open
    const el = root.current;
    const stop = (e) => e.preventDefault();
    el && el.addEventListener('wheel', stop, { passive: false });
    return () => { window.removeEventListener('keydown', k); el && el.removeEventListener('wheel', stop); };
  });

  const btn = {
    width: 48, height: 48, borderRadius: 24, border: '1.5px solid rgba(255,255,255,.7)', background: 'rgba(0,0,0,.35)',
    color: '#fff', fontSize: 24, lineHeight: '44px', cursor: 'pointer', padding: 0,
  };
  const view = (
    <div
      ref={root}
      onClick={onClose}
      className="fade-in keep-dark"
      style={{
        position: host ? 'absolute' : 'fixed', inset: 0, zIndex: 50, pointerEvents: 'auto',
        background: 'rgba(15,15,15,.86)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 14,
      }}
    >
      <img
        key={item.src}
        src={item.src}
        alt={item.caption || ''}
        onClick={(e) => e.stopPropagation()}
        className="pop"
        style={{ maxWidth: '84%', maxHeight: '76%', objectFit: 'contain', background: '#fff', border: '3px solid #fff', boxShadow: '0 20px 60px rgba(0,0,0,.5)' }}
      />
      <div onClick={(e) => e.stopPropagation()} className="font-mono" style={{ color: '#fff', fontSize: 16, textAlign: 'center' }}>
        {item.caption}{many && <span style={{ opacity: 0.6 }}>&nbsp;&nbsp;{i + 1} / {list.length}</span>}
        {item.ph && <span style={{ marginLeft: 10, background: '#fde97a', color: '#5a4300', padding: '1px 8px', borderRadius: 4, fontSize: 12 }}>sample image</span>}
      </div>
      <button aria-label="Close" onClick={onClose} style={{ ...btn, position: 'absolute', top: 16, right: 16 }}>&times;</button>
      {many && <button aria-label="Previous" onClick={(e) => { e.stopPropagation(); go(-1); }} style={{ ...btn, position: 'absolute', left: 18, top: '46%' }}>&#8249;</button>}
      {many && <button aria-label="Next" onClick={(e) => { e.stopPropagation(); go(1); }} style={{ ...btn, position: 'absolute', right: 18, top: '46%' }}>&#8250;</button>}
    </div>
  );
  return createPortal(view, host || document.body);
}
