import React, { useEffect, useState } from 'react';
import { asset } from '../lib/design';
import { FOLDERS as RESUME_FOLDERS } from '../data/resume';
import ResumePage from '../sections/ResumePage';
import { LightboxHost } from './Lightbox';
import CertCanvas from './CertCanvas';
import { HandCoins, CircleHelp, SquareCheckBig } from 'lucide-react';

const FOLDERS = RESUME_FOLDERS.map((f) => ({ ...f, img: 'folder_blank.png' }));

const FolderIcon = ({ color }) => (
  <svg width="40" height="34" viewBox="0 0 40 34" aria-hidden="true" style={{ flexShrink: 0 }}>
    <path d="M1 4a2 2 0 0 1 2-2h9l3 4h22v26H1z" fill={color} stroke="#fff" strokeOpacity=".7" strokeWidth="1" />
  </svg>
);

const COLORS = ['#86aaaa', '#7fb48a', '#8a5f8f', '#9a9a62'];
const TODO = [
  { t: 'Make logo bigger', Icon: HandCoins },
  { t: 'Touch grass after work', Icon: CircleHelp },
  { t: 'Make just one more small change', Icon: SquareCheckBig },
];

export function WindowButtons({ onClose, onMin, onMax, maximized = false, color = '#fff' }) {
  const b = {
    width: 22,
    height: 22,
    border: `2px solid ${color}`,
    position: 'relative',
    background: 'transparent',
    padding: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxSizing: 'border-box',
    flexShrink: 0,
  };
  return (
    <div className="flex items-center" style={{ gap: 9 }}>
      {onMin ? (
        <button aria-label="Minimize" title="Minimize" onClick={onMin} className="win-btn" style={{ ...b, borderTopWidth: 0 }} />
      ) : <span style={{ ...b, borderTopWidth: 0 }} />}
      {onMax ? (
        <button aria-label={maximized ? 'Restore' : 'Maximize'} title={maximized ? 'Restore' : 'Maximize'} onClick={onMax} className="win-btn" style={b}>
          {maximized ? (
            // restore: two overlapping windows
            <svg viewBox="0 0 14 14" width="14" height="14" fill="none" stroke={color} strokeWidth="1.8">
              <rect x="1" y="4" width="8.5" height="8.5" /><path d="M4.5 4V1.2h8.3v8.3H9.6" />
            </svg>
          ) : <i style={{ width: 10, height: 10, border: `2px solid ${color}`, display: 'block' }} />}
        </button>
      ) : (
        <span style={{ ...b }}>
          <i style={{ width: 10, height: 10, border: `2px solid ${color}`, display: 'block' }} />
        </span>
      )}
      <button aria-label="Close" title="Close" onClick={onClose} className="win-btn" style={b}>
        <svg viewBox="0 0 14 14" width="14" height="14" stroke={color} strokeWidth="1.8" strokeLinecap="square">
          <path d="M1 1L13 13M13 1L1 13" />
        </svg>
      </button>
    </div>
  );
}

// The dark "computer" desktop: Portfolio > Browse, with a small notepad window
// that pops open from the "3AM ideas" folder.
function Portfolio({ onOpenProject, fit = 1.155, onNote, onClose }) {
  const [sel, setSel] = useState('r-projects');
  const [note, setNoteRaw] = useState(false);
  const setNote = (v) => { setNoteRaw(v); onNote && onNote(v); };
  const [lbHost, setLbHost] = useState(null); // screenshots / certificates open over the whole window
  // window state: minimised shrinks it into a taskbar chip; maximised hands the whole window to the open folder
  const [win, setWin] = useState('normal'); // normal | max | min
  const max = win === 'max';
  const PANEL_L = max ? 61 : 323, PANEL_W = max ? 1061 : 799;
  const slide = 'left .45s cubic-bezier(.2,.9,.3,1), width .45s cubic-bezier(.2,.9,.3,1)';
  return (
    <LightboxHost.Provider value={lbHost}>
    <div
      className="relative"
      style={{
        width: 1181, height: 737, transformOrigin: '50% 100%',
        transform: win === 'min' ? `translateY(${Math.round(737 * fit * 0.1)}px) scale(${fit * 0.06})` : `scale(${fit})`,
        opacity: win === 'min' ? 0 : 1, pointerEvents: win === 'min' ? 'none' : undefined,
        transition: 'transform .5s cubic-bezier(.6,0,.3,1), opacity .4s ease .1s',
      }}
      aria-hidden={win === 'min' ? true : undefined}
    >
      <div className="absolute inset-0" style={{ opacity: note ? 0.2 : 1, transition: 'opacity .9s ease' }}>
      <div className="absolute inset-0" style={{ border: '2px solid #222', background: '#fafaf8' }} />
      {/* title bar */}
      <div className="absolute flex items-center justify-between" style={{ left: 8, right: 8, top: 8, height: 26 }}>
        <div style={{ flex: 1, height: '100%', background: '#f2a05f', marginRight: 18 }} />
        <WindowButtons
          onClose={() => { setWin('normal'); onClose && onClose(); }}
          onMin={() => setWin('min')}
          onMax={() => setWin(max ? 'normal' : 'max')}
          maximized={max}
          color="#222"
        />
      </div>
      <div className="absolute" style={{ left: 8, right: 8, top: 39, height: 1, background: 'rgba(0,0,0,.45)' }} />
      <div className="absolute" style={{ left: 60, top: 64, fontSize: 20.95 }}>Portfolio &gt; Browse{sel && ` > ${FOLDERS.find((f) => f.id === sel).label}`}</div>

      {/* sidebar: the 9 resume files */}
      <div className="absolute" style={{ left: 61, top: 100, width: 230, height: 567, border: '1px solid #222', opacity: max ? 0 : 1, transform: max ? 'translateX(-24px)' : 'none', pointerEvents: max ? 'none' : undefined, transition: 'opacity .3s ease, transform .45s cubic-bezier(.2,.9,.3,1)' }}>
        <div style={{ height: 37, borderBottom: '1px solid #222' }} />
        {FOLDERS.map((f, i) => (
          <button
            key={f.id}
            onClick={() => setSel(f.id)}
            className="absolute flex items-center border-0 p-0 text-left"
            style={{ left: 7, right: 7, top: 43 + i * Math.min(52, 516 / FOLDERS.length), height: 44, paddingLeft: 7, fontSize: 17.5, gap: 12, cursor: 'pointer', color: '#111', background: sel === f.id ? 'rgba(0,0,0,.09)' : 'transparent', whiteSpace: 'nowrap' }}
          >
            <FolderIcon color={COLORS[i % 4]} />
            {f.label}
          </button>
        ))}
      </div>
      {/* folder grid (right) */}
      {!sel && FOLDERS.map((f, i) => {
        const col = i % 4, row = Math.floor(i / 4);
        const cx = 420 + col * 200;
        return (
          <button
            key={f.id}
            onClick={() => setSel(f.id)}
            className="absolute bg-transparent border-0 p-0 group"
            style={{ left: cx - 76, top: 120 + row * 190, width: 152, color: '#111', cursor: f.open ? 'pointer' : 'default' }}
          >
            <img src={asset(f.img)} alt={f.label} width="152" height="128" draggable={false} />
            <div style={{ fontSize: f.small ? 18.4 : 20.95, marginTop: 8, lineHeight: '20px' }}>{f.label}</div>
          </button>
        );
      })}

      {sel === 'r-certificates' && (
        <div key={sel} className="absolute fade-in" style={{ left: PANEL_L, top: 100, width: PANEL_W, height: 590, background: '#fff', border: '1px solid #222', overflow: 'hidden', transition: slide }}>
          <CertCanvas onBack={() => setSel(null)} />
        </div>
      )}

      {sel && sel !== 'r-certificates' && (
        <div
          key={sel}
          className="absolute fade-in grain"
          style={{ left: PANEL_L, top: 100, width: PANEL_W, height: 590, background: '#fff', border: '1px solid #222', color: '#111', overflowY: 'auto', overscrollBehavior: 'contain', transition: slide }}
        >
          <div style={{ zoom: 0.715, padding: '36px 50px 45px' }}>
            <ResumePage id={sel} wide={max} nav={{ onBack: () => setSel(null) }} />
          </div>
        </div>
      )}

      </div>
      {note && <Notepad onClose={() => setNote(false)} />}
      <div ref={setLbHost} className="absolute inset-0 pointer-events-none" style={{ zIndex: 20 }} />
    </div>
    {/* taskbar chip while minimised: click to bring the window back */}
    {win === 'min' && (
      <button type="button" className="win-chip" onClick={() => setWin('normal')} title="Restore window">
        <FolderIcon color="#86aaaa" />
        <span>Portfolio &gt; Browse</span>
        <em>click to open</em>
      </button>
    )}
    </LightboxHost.Provider>
  );
}

function Notepad({ onClose }) {
  useEffect(() => {
    const k = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', k);
    return () => window.removeEventListener('keydown', k);
  }, [onClose]);
  return (
    <div className="absolute pop" style={{ left: 128, top: 93, width: 876, height: 518, background: '#fafaf8', zIndex: 5, boxShadow: '0 20px 60px rgba(0,0,0,.6)' }}>
      <div className="absolute flex items-center justify-between" style={{ left: 6, right: 8, top: 6, height: 21 }}>
        <div style={{ flex: 1, height: '100%', background: '#f0f23a', marginRight: 14 }} />
        <WindowButtons onClose={onClose} color="#222" />
      </div>
      <div className="absolute" style={{ left: 19, top: 44, fontSize: 12 }}>3AM notes &gt; View</div>
      <div className="absolute w-full text-center" style={{ top: 71, fontSize: 17 }}>May 13, 2003.</div>
      <div className="absolute" style={{ left: 99, top: 138, right: 60, fontSize: 17, lineHeight: '20.5px' }}>
        <div style={{ marginBottom: 20 }}>WEBSITE IDEAS</div>
        <ul className="list-none p-0 m-0" style={{ paddingLeft: 38 }}>
          {[
            'a site where the lower you scroll, the lower the music volume goes; it only plays taylor swift',
            'website that explains the theory of time using only pictures',
            'an iced tea shop website, but when you hover on different drink pictures, you hear different kinds of slurping based on the ice and ingredients in the drink',
          ].map((t) => (
            <li key={t} style={{ textIndent: -20, paddingLeft: 20 }}>-&nbsp;&nbsp; {t}</li>
          ))}
          <li style={{ textIndent: -20, paddingLeft: 20 }}>
            -&nbsp;&nbsp; <s>a website where you can add your collage mates as friends and everyone posts pics and text</s><br />
            <span style={{ textIndent: 0 }}>(nevermind, some guy mark is already doing it)</span>
          </li>
        </ul>
        <div style={{ margin: '42px 0 20px' }}>BUSINESS IDEAS</div>
        <ul className="list-none p-0 m-0" style={{ paddingLeft: 38 }}>
          <li style={{ textIndent: -20, paddingLeft: 20 }}>-&nbsp;&nbsp; service where we do web design for businesses and individuals; also branding and other cool stuff like fonts and edit pictures and make graphics n stuff</li>
        </ul>
      </div>
    </div>
  );
}

// memoised: the parent re-renders on every scroll frame of the zoom, the window only needs to when its props change
export default React.memo(Portfolio);
