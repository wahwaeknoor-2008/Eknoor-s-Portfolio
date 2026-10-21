(() => {
  "use strict";
  const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const button = document.querySelector(".menu");
  const nav = document.querySelector("#nav");
  if (button && nav) {
    button.addEventListener("click", () => {
      const open = button.getAttribute("aria-expanded") !== "true";
      button.setAttribute("aria-expanded", String(open));
      nav.classList.toggle("open", open);
    });
    nav.querySelectorAll("a").forEach(a => a.addEventListener("click", () => {
      button.setAttribute("aria-expanded", "false"); nav.classList.remove("open");
    }));
    document.addEventListener("keydown", e => {
      if (e.key === "Escape") { button.setAttribute("aria-expanded", "false"); nav.classList.remove("open"); button.focus(); }
    });
  }
  const year = document.querySelector("#year");
  if (year) year.textContent = String(new Date().getFullYear());
  const reveals = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && !reduceMotion) {
    const observer = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) { entry.target.classList.add("visible"); observer.unobserve(entry.target); }
    }), { threshold: .12, rootMargin: "0px 0px -30px 0px" });
    reveals.forEach(el => observer.observe(el));
  } else reveals.forEach(el => el.classList.add("visible"));

  const scene = document.querySelector(".dreamscape");
  const floats = scene ? [...scene.querySelectorAll("[data-depth]")] : [];
  if (scene && floats.length && matchMedia("(hover:hover) and (pointer:fine)").matches && !reduceMotion) {
    let frame = 0, x = 0, y = 0;
    scene.addEventListener("pointermove", e => {
      const r = scene.getBoundingClientRect(); x = (e.clientX-r.left)/r.width-.5; y = (e.clientY-r.top)/r.height-.5;
      if (!frame) frame = requestAnimationFrame(() => {
        floats.forEach(el => { const d = Number(el.dataset.depth)||1; el.style.translate = `${x*18*d}px ${y*18*d}px`; });
        frame = 0;
      });
    }, {passive:true});
    scene.addEventListener("pointerleave", () => floats.forEach(el => el.style.translate = ""), {passive:true});
  }
})();