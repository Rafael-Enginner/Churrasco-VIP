(() => {
  "use strict";

  const $ = (id) => document.getElementById(id);
  const video = $("bbqVideo");
  const audio = $("bbqAudio");
  const button = $("bbqSoundButton");
  const icon = $("bbqSoundIcon");
  if (!video || !audio || !button || !icon) return;

  const container = video.closest(".bbq-video-container") || video;
  const mobileQuery = window.matchMedia("(max-width: 650px)");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const connection = navigator.connection;
  const saveData = Boolean(connection && (connection.saveData || /(^|-)2g$/.test(connection.effectiveType || "")));
  const VOLUME = 0.28;

  video.muted = true;
  video.loop = true;
  video.playsInline = true;
  audio.loop = true;
  audio.volume = 0;

  /* ---------- Vídeo: carrega só quando visível, pausa fora da tela ---------- */
  let loadedSrc = "";
  let inView = typeof IntersectionObserver === "undefined"; // sem suporte: assume visível

  const pickSource = () =>
    mobileQuery.matches
      ? { src: video.dataset.srcMobile, poster: video.dataset.posterMobile }
      : { src: video.dataset.srcDesktop, poster: video.dataset.posterDesktop };

  function applyPoster() {
    const { poster } = pickSource();
    if (poster && video.getAttribute("poster") !== poster) video.setAttribute("poster", poster);
  }

  function syncVideo() {
    // Movimento reduzido ou economia de dados: fica só o poster (imagem estática).
    const shouldPlay = !reducedMotion.matches && !saveData && inView && !document.hidden;
    if (!shouldPlay && inView && !document.hidden) {
      console.info("Vídeo parado de propósito:", reducedMotion.matches ? "sistema pede movimento reduzido" : "economia de dados");
    }
    if (shouldPlay) {
      const { src } = pickSource();
      if (src && src !== loadedSrc) {
        loadedSrc = src;
        video.src = src;
        video.load();
      }
      video.play().catch((err) => console.info("Vídeo não iniciou:", err.name)); // o poster continua visível
    } else if (!video.paused) {
      video.pause();
    }
  }

  if (typeof IntersectionObserver !== "undefined") {
    new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting;
      syncVideo();
    }, { threshold: 0.25 }).observe(container);
  }

  video.addEventListener("error", () => {
    container.dataset.state = "error"; // o poster permanece visível
    console.info("Vídeo indisponível; exibindo apenas a imagem.");
  });

  mobileQuery.addEventListener("change", () => { applyPoster(); syncVideo(); });
  reducedMotion.addEventListener("change", syncVideo);

  /* ---------- Som: só liga pelo botão ---------- */
  let soundOn = false;
  let request = 0;
  let fadeTimer = 0;

  function fadeTo(target, ms) {
    clearInterval(fadeTimer);
    const start = audio.volume;
    const t0 = performance.now();
    return new Promise((resolve) => {
      fadeTimer = setInterval(() => {
        const k = Math.min(1, (performance.now() - t0) / ms);
        audio.volume = start + (target - start) * k;
        if (k === 1) { clearInterval(fadeTimer); resolve(); }
      }, 40);
    });
  }

  function renderButton() {
    button.setAttribute("aria-pressed", String(soundOn));
    icon.textContent = soundOn ? "🔊" : "🔇";
  }

  async function enableSound() {
    const id = ++request;
    try {
      await audio.play();
    } catch (err) {
      if (id !== request) return;
      soundOn = false;
      renderButton();
      console.info("O navegador não conseguiu reproduzir o áudio.", err);
      return;
    }
    if (id !== request) return;
    soundOn = true;
    renderButton();
    fadeTo(VOLUME, 400);
  }

  async function disableSound() {
    const id = ++request;
    soundOn = false;
    renderButton();
    await fadeTo(0, 250);
    if (id === request) audio.pause();
  }

  button.addEventListener("click", () => (soundOn ? disableSound() : enableSound()));

  /* ---------- Aba em segundo plano: pausa tudo e retoma o que estava ligado ---------- */
  document.addEventListener("visibilitychange", () => {
    syncVideo();
    if (document.hidden) {
      audio.pause();
    } else if (soundOn) {
      audio.volume = VOLUME;
      audio.play().catch(() => { soundOn = false; renderButton(); });
    }
  });

  applyPoster();
  renderButton();
  syncVideo();
})();
