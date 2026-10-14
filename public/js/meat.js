(() => {
  "use strict";

  const stage = document.getElementById("meatStage");
  const label = document.getElementById("meatLabel");
  if (!stage || !label) return;

  // Estágios por progresso de rolagem (0 = topo, 1 = fim da página)
  const STAGES = [[0, "Crua"], [0.25, "Selando"], [0.55, "Ao ponto"], [0.85, "Pronta pra comer!"]];
  const MEAT = [[0, [196, 66, 79]], [0.3, [156, 62, 48]], [0.6, [112, 54, 35]], [0.85, [86, 41, 25]], [1, [72, 34, 20]]];
  const FAT = [[0, [238, 216, 204]], [0.5, [230, 190, 130]], [1, [214, 160, 80]]];

  const clamp = (v, min = 0, max = 1) => Math.min(max, Math.max(min, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const seg = (p, from, to) => clamp((p - from) / (to - from));

  // Interpola a cor entre os pontos de controle
  function ramp(stops, p) {
    for (let i = 1; i < stops.length; i++) {
      if (p <= stops[i][0]) {
        const [p0, c0] = stops[i - 1];
        const [p1, c1] = stops[i];
        const t = (p - p0) / (p1 - p0);
        return `rgb(${c0.map((v, k) => Math.round(lerp(v, c1[k], t))).join(",")})`;
      }
    }
    return `rgb(${stops[stops.length - 1][1].join(",")})`;
  }

  let ticking = false;
  let currentLabel = "";

  function update() {
    ticking = false;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const p = max > 0 ? clamp(window.scrollY / max) : 0;

    // setProperty é permitido pela CSP (não usa atributo style inline)
    const set = (name, value) => stage.style.setProperty(name, value);
    set("--meat", ramp(MEAT, p));
    set("--fat", ramp(FAT, p));
    set("--marks", seg(p, 0.18, 0.45).toFixed(3));
    set("--marks2", seg(p, 0.45, 0.7).toFixed(3));
    set("--flame", (Math.sin(Math.PI * seg(p, 0, 0.9)) * 0.9 + 0.1).toFixed(3));
    set("--steam", seg(p, 0.5, 0.9).toFixed(3));
    set("--ready", seg(p, 0.88, 0.98).toFixed(3));

    stage.classList.toggle("is-visible", window.scrollY > 120);

    const name = [...STAGES].reverse().find(([from]) => p >= from)[1];
    if (name !== currentLabel) {
      currentLabel = name;
      label.textContent = name;
    }
  }

  const onScroll = () => {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(update);
    }
  };

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll);
  update();
})();
