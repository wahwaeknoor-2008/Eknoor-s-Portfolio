// Applies the saved light/dark choice before the page paints, so there is no flash.
(function () {
  try {
    var saved = localStorage.getItem('eknoor-theme');
    if (saved === 'dark' || saved === 'light') document.documentElement.setAttribute('data-theme', saved);
  } catch (e) { /* storage unavailable: keep the default light theme */ }
})();
