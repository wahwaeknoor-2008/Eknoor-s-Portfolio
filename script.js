// Theme, project tabs, search palette, copy email, mobile menu and scroll progress.
(() => {
  'use strict';
  const root = document.documentElement;
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

  /* ---------- theme ---------- */
  const themeMeta = $('meta[name="theme-color"]');
  function applyTheme(theme) {
    const light = theme === 'light';
    root.setAttribute('data-theme', light ? 'light' : 'dark');
    $$('.theme-toggle').forEach((btn) => {
      const label = light ? 'Switch to dark mode' : 'Switch to light mode';
      btn.setAttribute('aria-pressed', String(light));
      btn.setAttribute('aria-label', label);
      btn.title = label;
    });
    if (themeMeta) themeMeta.setAttribute('content', light ? '#f6f3ea' : '#161615');
  }
  function toggleTheme() {
    const next = root.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
    applyTheme(next);
    try { localStorage.setItem('eknoor-theme', next); } catch (e) { /* ignore */ }
  }
  applyTheme(root.getAttribute('data-theme') === 'light' ? 'light' : 'dark');
  $$('.theme-toggle').forEach((btn) => btn.addEventListener('click', toggleTheme));

  /* ---------- project tabs ---------- */
  const tabs = $$('.wl[role="tab"]');
  const panels = $$('.panel[role="tabpanel"]');
  function selectProject(id, focusTab) {
    tabs.forEach((tab) => {
      const on = tab.dataset.project === id;
      tab.setAttribute('aria-selected', String(on));
      tab.tabIndex = on ? 0 : -1;
      if (on && focusTab) tab.focus();
    });
    panels.forEach((panel) => { panel.hidden = panel.id !== `panel-${id}`; });
  }
  if (tabs.length) {
    selectProject(tabs[0].dataset.project, false);
    tabs.forEach((tab, i) => {
      tab.addEventListener('click', () => selectProject(tab.dataset.project, false));
      tab.addEventListener('keydown', (event) => {
        const keys = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 };
        if (event.key in keys) {
          event.preventDefault();
          selectProject(tabs[(i + keys[event.key] + tabs.length) % tabs.length].dataset.project, true);
        } else if (event.key === 'Home' || event.key === 'End') {
          event.preventDefault();
          selectProject(tabs[event.key === 'Home' ? 0 : tabs.length - 1].dataset.project, true);
        }
      });
    });
  }

  /* ---------- mobile menu + current section ---------- */
  const menuButton = $('#menu-button');
  const nav = $('#site-nav');
  if (menuButton && nav) {
    const close = () => { nav.classList.remove('open'); menuButton.setAttribute('aria-expanded', 'false'); };
    menuButton.addEventListener('click', () => {
      const open = nav.classList.toggle('open');
      menuButton.setAttribute('aria-expanded', String(open));
    });
    $$('a', nav).forEach((a) => a.addEventListener('click', close));
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && nav.classList.contains('open')) { close(); menuButton.focus(); } });
    window.addEventListener('resize', () => { if (window.innerWidth > 860) close(); });
    const links = $$('a[href^="#"]', nav);
    if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          links.forEach((link) => {
            const current = link.getAttribute('href') === `#${entry.target.id}`;
            link.classList.toggle('active', current);
            if (current) link.setAttribute('aria-current', 'location'); else link.removeAttribute('aria-current');
          });
        });
      }, { rootMargin: '-40% 0px -55% 0px', threshold: 0 });
      $$('main > section[id]').forEach((s) => io.observe(s));
    }
  }

  /* ---------- copy email ---------- */
  const copyBtn = $('#copy-email');
  const status = $('#copy-status');
  if (copyBtn) {
    copyBtn.addEventListener('click', async () => {
      const text = $('#email-link').textContent.trim();
      let ok = false;
      try { await navigator.clipboard.writeText(text); ok = true; } catch (e) {
        const field = document.createElement('textarea');
        field.value = text; field.setAttribute('readonly', ''); field.style.position = 'fixed'; field.style.opacity = '0';
        document.body.appendChild(field); field.select();
        try { ok = document.execCommand('copy'); } catch (err) { ok = false; }
        field.remove();
      }
      status.textContent = ok ? 'Copied' : 'Copy failed';
      setTimeout(() => { status.textContent = ''; }, 2000);
    });
  }

  /* ---------- search palette (Ctrl/Cmd + K) ---------- */
  const dialog = $('#palette');
  const openBtn = $('#palette-open');
  const kbd = $('#palette-kbd');
  if (kbd && /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent)) kbd.textContent = '⌘K';
  if (dialog && typeof dialog.showModal === 'function') {
    const input = $('#palette-input');
    const list = $('#palette-list');
    const empty = $('#palette-empty');
    const items = $$('li[role="option"]', list);
    let active = -1;
    const visible = () => items.filter((li) => !li.hidden);
    function setActive(index) {
      const vis = visible();
      items.forEach((li) => { li.classList.remove('active'); li.setAttribute('aria-selected', 'false'); });
      if (!vis.length) { active = -1; return; }
      active = (index + vis.length) % vis.length;
      const li = vis[active];
      li.classList.add('active'); li.setAttribute('aria-selected', 'true');
      li.scrollIntoView({ block: 'nearest' });
    }
    function filter() {
      const q = input.value.trim().toLowerCase();
      items.forEach((li) => { li.hidden = q !== '' && !li.textContent.toLowerCase().includes(q); });
      $$('.pgroup', list).forEach((g) => {
        let el = g.nextElementSibling, any = false;
        while (el && !el.classList.contains('pgroup')) { if (!el.hidden) any = true; el = el.nextElementSibling; }
        g.hidden = !any;
      });
      empty.hidden = visible().length > 0;
      setActive(0);
    }
    function openPalette() { input.value = ''; filter(); dialog.showModal(); input.focus(); }
    function run(li) {
      const target = $('a, button', li);
      if (!target) return;
      dialog.close();
      if (target.dataset.action === 'theme') { toggleTheme(); return; }
      if (target.dataset.focus === 'ask') {
        $('#map').scrollIntoView();
        history.replaceState(null, '', '#map');
        setTimeout(() => { const f = $('#ask-input'); if (f) f.focus(); }, 60);
        return;
      }
      if (target.dataset.project) {
        selectProject(target.dataset.project, false);
        $('#work').scrollIntoView();
        history.replaceState(null, '', '#work');
        return;
      }
      target.click();
    }
    openBtn?.addEventListener('click', openPalette);
    document.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); dialog.open ? dialog.close() : openPalette(); }
    });
    input.addEventListener('input', filter);
    input.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowDown') { e.preventDefault(); setActive(active + 1); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); setActive(active - 1); }
      else if (e.key === 'Enter') { e.preventDefault(); const vis = visible(); if (vis[active]) run(vis[active]); }
    });
    items.forEach((li) => li.addEventListener('click', (e) => {
      const t = $('a, button', li);
      if (t && t.dataset.project) { e.preventDefault(); }
      if (t && t.tagName === 'A' && !t.dataset.project && t.getAttribute('href').startsWith('#')) { dialog.close(); return; }
      if (t && (t.dataset.project || t.dataset.action || t.dataset.focus)) { e.preventDefault(); run(li); return; }
      dialog.close();
    }));
    dialog.addEventListener('click', (e) => { if (e.target === dialog) dialog.close(); });
  } else if (openBtn) {
    openBtn.hidden = true;
  }
})();

// Scroll progress read-out, bottom right.
(() => {
  const n = document.getElementById('progress-n');
  const bar = document.getElementById('progress-bar');
  if (!n || !bar) return;
  let queued = false;
  const update = () => {
    const el = document.documentElement;
    const max = el.scrollHeight - el.clientHeight;
    const pct = max > 0 ? Math.min(100, Math.max(0, Math.round((el.scrollTop / max) * 100))) : 0;
    n.textContent = pct + '%';
    bar.style.width = pct + '%';
    queued = false;
  };
  window.addEventListener('scroll', () => { if (!queued) { queued = true; requestAnimationFrame(update); } }, { passive: true });
  window.addEventListener('resize', update);
  update();
})();
