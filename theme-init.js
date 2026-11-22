// Applies the saved light/dark choice before the page paints. Dark is the default.
(function () {
  try {
    var saved = localStorage.getItem('eknoor-theme');
    if (saved === 'dark' || saved === 'light') document.documentElement.setAttribute('data-theme', saved);
  } catch (e) { /* storage unavailable: keep the default dark theme */ }
})();
