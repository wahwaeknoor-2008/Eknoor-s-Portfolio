(() => {
  const toggle = document.getElementById('menu-toggle');
  const nav = document.getElementById('nav');
  if (toggle && nav) {
    toggle.addEventListener('click', () => {
      const open = nav.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
    });
    nav.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
      nav.classList.remove('is-open');
      toggle.setAttribute('aria-expanded', 'false');
      toggle.setAttribute('aria-label', 'Open navigation');
    }));
  }

  const themeToggle = document.getElementById('theme-toggle');
  const themeIcon = themeToggle?.querySelector('.theme-icon');
  const themeLabel = themeToggle?.querySelector('.theme-label');
  const metaTheme = document.querySelector('meta[name="theme-color"]');
  const setTheme = theme => {
    document.body.dataset.theme = theme;
    const dark = theme === 'dark';
    if (themeIcon) themeIcon.textContent = dark ? '☀' : '☾';
    if (themeLabel) themeLabel.textContent = dark ? 'Light mode' : 'Dark mode';
    if (themeToggle) {
      const label = dark ? 'Switch to light mode' : 'Switch to dark mode';
      themeToggle.setAttribute('aria-label', label);
      themeToggle.setAttribute('title', label);
    }
    if (metaTheme) metaTheme.setAttribute('content', dark ? '#0b0d0c' : '#f7f6ef');
  };
  let savedTheme = 'light';
  try {
    const stored = localStorage.getItem('eknoor-portfolio-theme');
    if (stored === 'light' || stored === 'dark') savedTheme = stored;
  } catch (_) {}
  setTheme(savedTheme);
  themeToggle?.addEventListener('click', () => {
    const next = document.body.dataset.theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    try { localStorage.setItem('eknoor-portfolio-theme', next); } catch (_) {}
  });

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!reduceMotion && 'IntersectionObserver' in window) {
    const targets = document.querySelectorAll('.project-card, .section-heading, .about-left, .about-right, .tool-row, .contact-layout');
    targets.forEach(target => target.classList.add('reveal'));
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    targets.forEach(target => observer.observe(target));
  }

  const art = document.querySelector('.hero-art');
  if (art && !reduceMotion && window.matchMedia('(pointer:fine)').matches) {
    art.addEventListener('pointermove', event => {
      const rect = art.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - 0.5;
      const y = (event.clientY - rect.top) / rect.height - 0.5;
      art.querySelectorAll('.orbit').forEach((orbit, index) => {
        orbit.style.marginLeft = `${x * (index + 1) * 7}px`;
        orbit.style.marginTop = `${y * (index + 1) * 5}px`;
      });
    });
    art.addEventListener('pointerleave', () => {
      art.querySelectorAll('.orbit').forEach(orbit => { orbit.style.marginLeft = '0px'; orbit.style.marginTop = '0px'; });
    });
  }
})();