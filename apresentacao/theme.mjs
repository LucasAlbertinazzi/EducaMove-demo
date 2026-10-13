export const themeKey = 'educamov.presentation.theme';

export function resolveTheme(saved, systemDark) {
  return ['light', 'dark'].includes(saved) ? saved : systemDark ? 'dark' : 'light';
}

export function initializeTheme(doc = document, win = window) {
  const media = win.matchMedia('(prefers-color-scheme: dark)');
  let preference;
  try { preference = win.localStorage.getItem(themeKey); } catch { /* A página funciona sem armazenamento. */ }
  if (!['light', 'dark'].includes(preference)) preference = null;
  function apply(theme) {
    doc.documentElement.dataset.theme = theme;
    doc.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme === 'dark' ? '#0f1722' : '#1762e8');
    doc.querySelectorAll('[data-theme-select]').forEach(button => {
      button.setAttribute('aria-pressed', String(button.dataset.themeSelect === theme));
    });
  }
  apply(resolveTheme(preference, media.matches));
  doc.querySelectorAll('[data-theme-select]').forEach(button => button.addEventListener('click', () => {
    preference = button.dataset.themeSelect;
    if (!['light', 'dark'].includes(preference)) return;
    apply(preference);
    try { win.localStorage.setItem(themeKey, preference); } catch { /* Mantém a escolha nesta sessão. */ }
  }));
  const systemChanged = event => {
    if (preference === null) apply(resolveTheme(null, event.matches));
  };
  if (media.addEventListener) media.addEventListener('change', systemChanged);
  else media.addListener?.(systemChanged);
}
