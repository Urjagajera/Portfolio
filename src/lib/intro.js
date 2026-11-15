// Opening sequence, decided once per page load and shared by every animated piece.
//
// - The pastel "tab curtain" plays on the first visit of a browser session (not on every refresh), never when
//   the visitor prefers reduced motion, and not when they land on the 60-second view (#60s) or deep in the page.
// - Hero pieces start after the curtain has mostly cleared: their CSS delays are calc(var(--intro) + Nms).
const reduce = typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

let seen = false;
try { seen = sessionStorage.getItem('intro-seen') === '1'; sessionStorage.setItem('intro-seen', '1'); } catch { /* storage blocked: just play it */ }

const curtain = !reduce && !seen && window.location.hash !== '#60s' && window.scrollY < 50;

export const INTRO = {
  reduce,
  curtain,
  // the stripes hold still for ~0.5s while the browser does its one-time startup work (layout, first image
  // decodes, web fonts), then sweep away; the hero starts revealing as they clear
  delay: curtain ? 920 : 80, // ms before the hero starts revealing
  curtainMs: 1700,           // curtain fully gone (removed from the DOM) after this
};

document.documentElement.style.setProperty('--intro', `${INTRO.delay}ms`);
if (reduce) document.documentElement.classList.add('intro-off');
