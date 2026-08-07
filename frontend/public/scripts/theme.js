(() => {
  const storageKey = 'rr-theme';
  const root = document.documentElement;
  const media = window.matchMedia('(prefers-color-scheme: dark)');

  const normaliseTheme = (value) => (value === 'dark' ? 'dark' : 'light');
  const applyTheme = (value) => {
    const theme = normaliseTheme(value);
    const isDark = theme === 'dark';
    root.dataset.theme = theme;
    root.style.colorScheme = theme;

    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', isDark ? '#0b1420' : '#f4f1ea');

    const toggle = document.querySelector('[data-theme-toggle]');
    if (toggle) {
      toggle.setAttribute('aria-pressed', String(isDark));
      toggle.setAttribute('aria-label', `Switch to ${isDark ? 'light' : 'dark'} theme`);
      toggle.querySelector('[data-theme-label]').textContent = isDark ? 'Dark' : 'Light';
      toggle.querySelector('[data-theme-sun]').hidden = isDark;
      toggle.querySelector('[data-theme-moon]').hidden = !isDark;
    }
  };

  const stored = localStorage.getItem(storageKey);
  applyTheme(stored === 'dark' || stored === 'light' ? stored : media.matches ? 'dark' : 'light');

  document.addEventListener('DOMContentLoaded', () => {
    applyTheme(root.dataset.theme);
    document.querySelector('[data-theme-toggle]')?.addEventListener('click', () => {
      const next = root.dataset.theme === 'dark' ? 'light' : 'dark';
      localStorage.setItem(storageKey, next);
      applyTheme(next);
    });
  });

  media.addEventListener('change', (event) => {
    if (!localStorage.getItem(storageKey)) applyTheme(event.matches ? 'dark' : 'light');
  });
})();
