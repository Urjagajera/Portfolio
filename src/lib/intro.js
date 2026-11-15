// Opening sequence timing, shared by every animated piece. Hero pieces use CSS delays of
// calc(var(--intro) + Nms); the short lead-in lets the browser finish its first layout and image decodes
// before anything starts moving. Visitors who prefer reduced motion get the page without the animations.
const reduce = typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

export const INTRO = { reduce, delay: 280 };

document.documentElement.style.setProperty('--intro', `${INTRO.delay}ms`);
