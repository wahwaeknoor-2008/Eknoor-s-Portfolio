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
      art.style.setProperty('--pointer-x', `${x * 9}deg`);
      art.style.setProperty('--pointer-y', `${y * -8}deg`);
      art.querySelectorAll('.orbit').forEach((orbit, index) => {
        orbit.style.marginLeft = `${x * (index + 1) * 7}px`;
        orbit.style.marginTop = `${y * (index + 1) * 5}px`;
      });
    });
    art.addEventListener('pointerleave', () => {
      art.querySelectorAll('.orbit').forEach(orbit => {
        orbit.style.marginLeft = '0px';
        orbit.style.marginTop = '0px';
      });
    });
  }
})();