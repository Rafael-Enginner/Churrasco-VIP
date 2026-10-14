
(() => {
  "use strict";

  function initMeat() {
    const section = document.getElementById("meatSection");
    const stage = document.getElementById("meatStage");
    const label = document.getElementById("meatLabel");
    const progressBar = document.getElementById("meatProgress");

    if (!section || !stage || !label || !progressBar) {
      console.warn("Animação da carne: elementos HTML ausentes.");
      return;
    }

    const clamp = (value, min = 0, max = 1) =>
      Math.min(max, Math.max(min, value));

    const mix = (a, b, t) => Math.round(a + (b - a) * t);

    function interpolateColor(start, end, progress) {
      const rgb = start.map((value, i) =>
        mix(value, end[i], progress)
      );
      return `rgb(${rgb.join(",")})`;
    }

    function updateMeat() {
      const rect = section.getBoundingClientRect();
      const distance = Math.max(
        1,
        section.offsetHeight - window.innerHeight
      );

      const progress = clamp(-rect.top / distance);

      // A carne muda de rosa/vermelha para marrom assado.
      const startColor = interpolateColor(
        [226, 118, 122],
        [124, 57, 30],
        progress
      );

      const endColor = interpolateColor(
        [185, 54, 70],
        [72, 31, 17],
        progress
      );

      const marks = clamp((progress - 0.15) / 0.55);
      const flame = 0.2 + Math.sin(progress * Math.PI) * 0.8;
      const smoke = clamp((progress - 0.4) / 0.45);

      stage.style.setProperty("--meat-start", startColor);
      stage.style.setProperty("--meat-end", endColor);
      stage.style.setProperty("--marks", marks.toFixed(3));
      stage.style.setProperty("--flame", flame.toFixed(3));
      stage.style.setProperty("--smoke", smoke.toFixed(3));

      progressBar.style.width = `${Math.round(progress * 100)}%`;

      if (progress < 0.25) {
        label.textContent = "Crua";
        stage.dataset.stage = "0";
      } else if (progress < 0.55) {
        label.textContent = "Selando";
        stage.dataset.stage = "1";
      } else if (progress < 0.85) {
        label.textContent = "Ao ponto";
        stage.dataset.stage = "2";
      } else {
        label.textContent = "Pronta para comer!";
        stage.dataset.stage = "3";
      }
    }

    let scheduled = false;

    function onScroll() {
      if (scheduled) return;
      scheduled = true;

      requestAnimationFrame(() => {
        updateMeat();
        scheduled = false;
      });
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);

    updateMeat();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initMeat);
  } else {
    initMeat();
  }
})();
