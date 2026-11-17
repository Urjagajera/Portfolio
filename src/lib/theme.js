// Light / dark theme. The choice lives on <html data-theme>, is remembered in localStorage, and on a
// first visit follows the device setting. index.html applies it before the first paint (no white flash).

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
  root.dataset.switching = next; // picks the ink-blot or the light-pour mask in CSS
  const t = document.startViewTransition(() => apply(next));
  t.finished.finally(() => { delete root.dataset.switching; });
  return next;
}
