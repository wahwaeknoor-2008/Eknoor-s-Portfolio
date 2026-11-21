// Small, calm interactions: theme switch, mobile menu, current-section highlight.
// No scroll-driven animation, no cursor effects, no counters.
(() => {
  'use strict';

  const root = document.documentElement;
  const themeToggle = document.querySelector('#theme-toggle');
  const themeMeta = document.querySelector('meta[name="theme-color"]');

  function applyTheme(theme) {
    const dark = theme === 'dark';
    root.setAttribute('data-theme', dark ? 'dark' : 'light');
    if (themeToggle) {
      const label = dark ? 'Switch to light mode' : 'Switch to dark mode';
      themeToggle.setAttribute('aria-pressed', String(dark));
      themeToggle.setAttribute('aria-label', label);
      themeToggle.title = label;
    }
    if (themeMeta) themeMeta.setAttribute('content', dark ? '#111722' : '#fffdf7');
  }

  applyTheme(root.getAttribute('data-theme') === 'dark' ? 'dark' : 'light');

  themeToggle?.addEventListener('click', () => {
    const next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    applyTheme(next);
    try { localStorage.setItem('eknoor-theme', next); } catch (e) { /* ignore */ }
  });

  const menuButton = document.querySelector('#menu-button');
  const nav = document.querySelector('#site-nav');

  if (menuButton && nav) {
    const closeMenu = () => {
      nav.classList.remove('open');
      menuButton.setAttribute('aria-expanded', 'false');
    };
    menuButton.addEventListener('click', () => {
      const open = nav.classList.toggle('open');
      menuButton.setAttribute('aria-expanded', String(open));
    });
    nav.querySelectorAll('a').forEach((link) => link.addEventListener('click', closeMenu));
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && nav.classList.contains('open')) {
        closeMenu();
        menuButton.focus();
      }
    });
    document.addEventListener('pointerdown', (event) => {
      if (nav.classList.contains('open') && !nav.contains(event.target) && !menuButton.contains(event.target)) closeMenu();
    });
    window.addEventListener('resize', () => { if (window.innerWidth > 860) closeMenu(); });

    // Highlight the nav link for the section currently in view.
    const links = [...nav.querySelectorAll('a[href^="#"]')];
    const sections = document.querySelectorAll('main > section[id]');
    if (links.length && 'IntersectionObserver' in window) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          links.forEach((link) => {
            const current = link.getAttribute('href') === `#${entry.target.id}`;
            link.classList.toggle('active', current);
            if (current) link.setAttribute('aria-current', 'location');
            else link.removeAttribute('aria-current');
          });
        });
      }, { rootMargin: '-35% 0px -55% 0px', threshold: 0 });
      sections.forEach((section) => observer.observe(section));
    }
  }
})();
