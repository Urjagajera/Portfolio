// Light / dark theme. Light by default; a visitor's choice lives on <html data-theme> and is remembered
// in localStorage. index.html applies it before the first paint (no flash).

const KEY = 'theme';

export function currentTheme() {
  return document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light';
}

function apply(theme) {
  const root = document.documentElement;
  root.dataset.theme = theme;
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.content = theme === 'dark' ? '#171716' : '#fafaf8';
  try { localStorage.setItem(KEY, theme); } catch { /* private mode: just don't remember */ }
  window.dispatchEvent(new CustomEvent('themechange', { detail: theme }));
}

/**
 * Switch theme. (x, y) is where the change spreads from (the lamp's bulb): going dark, night spreads out
 * like an ink blot; going light, light pours out of the bulb with a soft edge.
 */
export function toggleTheme(x, y) {
  const next = currentTheme() === 'dark' ? 'light' : 'dark';
  const root = document.documentElement;
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!document.startViewTransition || reduce) { apply(next); return next; }
  root.style.setProperty('--tx', `${Math.round(x)}px`);
  root.style.setProperty('--ty', `${Math.round(y)}px`);
  // four more drops land at random spots (a different pattern every time) and spread into each other
  const W = innerWidth, H = innerHeight;
  for (let i = 1; i <= 4; i++) {
    root.style.setProperty(`--x${i}`, `${Math.round(W * (0.1 + Math.random() * 0.75))}px`);
    root.style.setProperty(`--y${i}`, `${Math.round(H * (0.15 + Math.random() * 0.75))}px`);
  }
  root.dataset.switching = next; // picks the ink-blot or the light-pour mask in CSS
  const t = document.startViewTransition(() => apply(next));
  t.finished.finally(() => { delete root.dataset.switching; });
  return next;
}
