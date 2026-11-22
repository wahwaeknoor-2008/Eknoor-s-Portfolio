// "The map": every project, role and skill on the page, laid out by topic, plus a small ask box.
// Everything runs in the browser on the text of this page. Nothing is sent anywhere.
(() => {
  'use strict';
  const dataEl = document.getElementById('search-data');
  const plot = document.getElementById('map-plot');
  if (!dataEl || !plot) return;
  const docs = JSON.parse(dataEl.textContent);
  const detail = document.getElementById('map-detail');
  const results = document.getElementById('ask-results');
  const form = document.getElementById('ask-form');
  const input = document.getElementById('ask-input');
  const kbd = document.getElementById('map-kbd');
  if (kbd && /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent)) kbd.textContent = '\u2318K';

  /* ---------- text -> terms ---------- */
  const STOP = new Set('a an and are as at be been by for from has have how i in is it its me my of on or that the their then there these they this to was were what when where which who why will with you your do does did can could about tell show any all some'.split(' '));
  const stem = (w) => {
    if (w.length > 4 && w.endsWith('ies')) return w.slice(0, -3) + 'y';
    if (w.length > 5 && w.endsWith('ing')) return w.slice(0, -3);
    if (w.length > 4 && w.endsWith('ed')) return w.slice(0, -2);
    if (w.length > 3 && w.endsWith('s') && !w.endsWith('ss')) return w.slice(0, -1);
    return w;
  };
  const tokens = (text) => (text.toLowerCase().match(/[a-z0-9+#]+/g) || []).filter((w) => !STOP.has(w) && w.length > 1).map(stem);

  // Topic groups: a word from a group adds that topic to a text, so "hardware" finds Arduino work.
  const TOPICS = {
    hardware: 'hardware electronics embedded circuit arduino sensor nfc radar dustbin alarm keystore c++ robot firmware gadget',
    web: 'web website frontend react wix shopify html fastapi api rest browser client freelance page',
    mobile: 'mobile android app phone native keystore nfc',
    ai: 'ai llm rag generative embedding vector assistant resume intelligence machine prompt narration copilot',
    game: 'game gaming godot jam itch hack haven bounce',
    community: 'volunteer volunteering community pickleball badminton garden food council town drama team museum',
    finance: 'stock stocks equities trader trading investor invest investing market markets portfolio risk finance',
    work: 'work job intern internship experience employment auction founder freelance career role',
    school: 'school university waterloo course coursework scholarship degree student education grades math',
    testing: 'test tests testing debug debugging bug bugs fix break breaks quality tested debugged',
  };
  const TOPIC_SETS = Object.fromEntries(Object.entries(TOPICS).map(([k, words]) => [k, new Set(tokens(words))]));
  const termsOf = (text) => {
    const t = tokens(text);
    const out = [...t];
    for (const k in TOPIC_SETS) if (t.some((x) => TOPIC_SETS[k].has(x))) out.push('#' + k, '#' + k);
    return out;
  };

  /* ---------- tf-idf vectors ---------- */
  const docTerms = docs.map((d) => termsOf(d.title + ' ' + d.text));
  const df = new Map();
  docTerms.forEach((ts) => new Set(ts).forEach((t) => df.set(t, (df.get(t) || 0) + 1)));
  const N = docs.length;
  const vocab = [...df.keys()].sort();
  const index = new Map(vocab.map((t, i) => [t, i]));
  const V = vocab.length;
  const idf = vocab.map((t) => Math.log((N + 1) / (df.get(t) + 1)) + 1);
  const dot = (a, b) => { let s = 0; for (let i = 0; i < a.length; i++) s += a[i] * b[i]; return s; };
  function vec(terms) {
    const v = new Float64Array(V);
    const counts = new Map();
    terms.forEach((t) => counts.set(t, (counts.get(t) || 0) + 1));
    counts.forEach((c, t) => { const i = index.get(t); if (i !== undefined) v[i] = (1 + Math.log(c)) * idf[i]; });
    const n = Math.sqrt(dot(v, v)) || 1;
    for (let i = 0; i < V; i++) v[i] /= n;
    return v;
  }
  const dv = docTerms.map(vec);

  /* ---------- 2D layout: the top two principal components ---------- */
  const mean = new Float64Array(V);
  dv.forEach((v) => { for (let i = 0; i < V; i++) mean[i] += v[i] / N; });
  const Xc = dv.map((v) => { const r = new Float64Array(V); for (let i = 0; i < V; i++) r[i] = v[i] - mean[i]; return r; });
  const G = Xc.map((a) => Xc.map((b) => dot(a, b)));
  function topEigen(M) {
    let v = M.map((_, i) => Math.sin(i + 1) + 1.5);
    let lambda = 0;
    for (let it = 0; it < 300; it++) {
      const w = M.map((row) => dot(row, v));
      const n = Math.sqrt(dot(w, w)) || 1;
      v = w.map((x) => x / n);
      lambda = n;
    }
    let big = 0;
    v.forEach((x, i) => { if (Math.abs(x) > Math.abs(v[big])) big = i; });
    if (v[big] < 0) v = v.map((x) => -x);
    return [lambda, v];
  }
  const [l1, v1] = topEigen(G);
  const G2 = G.map((row, i) => row.map((x, j) => x - l1 * v1[i] * v1[j]));
  const [l2, v2] = topEigen(G2);
  const axis = (v, l) => { const a = new Float64Array(V); v.forEach((c, i) => { for (let k = 0; k < V; k++) a[k] += c * Xc[i][k]; }); const s = Math.sqrt(Math.max(l, 1e-9)); for (let k = 0; k < V; k++) a[k] /= s; return a; };
  const A1 = axis(v1, l1), A2 = axis(v2, l2);
  const raw = docs.map((_, i) => [Math.sqrt(Math.max(l1, 0)) * v1[i], Math.sqrt(Math.max(l2, 0)) * v2[i]]);
  const xs = raw.map((p) => p[0]), ys = raw.map((p) => p[1]);
  const x0 = Math.min(...xs), x1 = Math.max(...xs), y0 = Math.min(...ys), y1 = Math.max(...ys);
  const place = (x, y) => [0.07 + 0.86 * (x - x0) / ((x1 - x0) || 1), 0.1 + 0.8 * (1 - (y - y0) / ((y1 - y0) || 1))];
  const pos = raw.map((p) => place(p[0], p[1]));
  const project = (q) => { const c = new Float64Array(V); for (let i = 0; i < V; i++) c[i] = q[i] - mean[i]; return place(dot(c, A1), dot(c, A2)).map((n) => Math.min(0.97, Math.max(0.03, n))); };

  /* ---------- draw ---------- */
  const pts = docs.map((d, i) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'pt' + (d.group === 'project' ? ' proj' : '') + (pos[i][0] > 0.62 ? ' flip' : '');
    b.style.left = (pos[i][0] * 100).toFixed(2) + '%';
    b.style.top = (pos[i][1] * 100).toFixed(2) + '%';
    b.dataset.label = d.title.length > 34 ? d.title.slice(0, 32) + '...' : d.title;
    b.setAttribute('aria-label', d.title + ', ' + d.kind);
    b.addEventListener('click', () => select(i));
    b.addEventListener('keydown', (e) => move(e, i));
    plot.appendChild(b);
    return b;
  });
  const loading = document.getElementById('map-loading');
  if (loading) loading.remove();
  let marker = null, sel = -1, hits = new Set(), nearSet = new Set();

  const neighbours = (i, k = 3) => dv.map((v, j) => [j, dot(dv[i], v)]).filter(([j]) => j !== i).sort((a, b) => b[1] - a[1]).slice(0, k).map(([j]) => j);
  function paint() {
    pts.forEach((b, i) => { b.classList.toggle('sel', i === sel); b.classList.toggle('near', nearSet.has(i)); b.classList.toggle('hit', hits.has(i)); });
  }
  function openDoc(i) {
    const t = docs[i].target;
    if (t.startsWith('project:')) {
      const tab = document.getElementById('tab-' + t.slice(8));
      if (tab) tab.click();
      document.getElementById('work').scrollIntoView();
      history.replaceState(null, '', '#work');
    } else {
      const el = document.querySelector(t);
      if (el) { el.scrollIntoView(); history.replaceState(null, '', t); }
    }
  }
  function el(tag, cls, text) { const n = document.createElement(tag); if (cls) n.className = cls; if (text !== undefined) n.textContent = text; return n; }
  function select(i) {
    sel = i;
    const near = neighbours(i);
    nearSet = new Set(near);
    paint();
    detail.textContent = '';
    detail.append(el('p', 'md-kind', docs[i].kind), el('p', 'md-title', docs[i].title), el('p', 'md-snip', docs[i].snippet));
    const row = el('div', 'md-near');
    row.append(el('span', '', 'Closest in topic'));
    near.forEach((j) => { const b = el('button', '', docs[j].title.length > 30 ? docs[j].title.slice(0, 28) + '...' : docs[j].title); b.type = 'button'; b.addEventListener('click', () => { select(j); pts[j].focus(); }); row.append(b); });
    detail.append(row);
    const open = el('a', 'text-link md-open', 'Open on this page');
    open.href = docs[i].target.startsWith('project:') ? '#work' : docs[i].target;
    open.addEventListener('click', (e) => { e.preventDefault(); openDoc(i); });
    detail.append(open);
  }
  function move(e, i) {
    const dir = { ArrowRight: [1, 0], ArrowLeft: [-1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] }[e.key];
    if (!dir) return;
    e.preventDefault();
    let best = -1, bestScore = Infinity;
    pos.forEach((p, j) => {
      if (j === i) return;
      const dx = p[0] - pos[i][0], dy = p[1] - pos[i][1];
      const along = dx * dir[0] + dy * dir[1];
      if (along <= 0.001) return;
      const across = Math.abs(dx * dir[1] - dy * dir[0]);
      const score = along + 2 * across;
      if (score < bestScore) { bestScore = score; best = j; }
    });
    if (best >= 0) { select(best); pts[best].focus(); }
  }

  /* ---------- ask ---------- */
  function clearAsk() { hits = new Set(); if (marker) { marker.remove(); marker = null; } results.textContent = ''; paint(); }
  function ask(q) {
    q = q.trim();
    if (!tokens(q).length) { clearAsk(); return; }
    const qv = vec(termsOf(q));
    const ranked = dv.map((v, i) => [i, dot(qv, v) * (docs[i].group === 'project' ? 1.2 : 1)]).sort((a, b) => b[1] - a[1]);
    const top = ranked.filter(([, s]) => s > 0.07).slice(0, 4);
    hits = new Set(top.map(([i]) => i));
    if (marker) marker.remove();
    marker = el('span', 'qm');
    const qp = project(qv);
    marker.style.left = (qp[0] * 100).toFixed(2) + '%';
    marker.style.top = (qp[1] * 100).toFixed(2) + '%';
    marker.setAttribute('aria-hidden', 'true');
    plot.appendChild(marker);
    results.textContent = '';
    if (!top.length) {
      results.append(el('p', 'ask-none', 'Nothing on this page matches that. Try a topic such as hardware, web, AI, games or testing.'));
    } else {
      results.append(el('h4', '', 'Closest to this question'));
      top.forEach(([i]) => {
        const b = el('button', 'ask-hit'); b.type = 'button';
        b.append(el('strong', '', docs[i].title), el('small', '', docs[i].kind), el('span', '', docs[i].snippet));
        b.addEventListener('click', () => { select(i); openDoc(i); });
        results.append(b);
      });
    }
    paint();
  }
  form.addEventListener('submit', (e) => { e.preventDefault(); ask(input.value); });
  document.querySelectorAll('#ask-chips .chip').forEach((chip) => chip.addEventListener('click', () => { input.value = chip.textContent; ask(chip.textContent); }));
  input.addEventListener('input', () => { if (!input.value.trim()) clearAsk(); });

  // Start with the first project selected so the panel is never empty.
  const first = docs.findIndex((d) => d.group === 'project');
  if (first >= 0) select(first);
})();
