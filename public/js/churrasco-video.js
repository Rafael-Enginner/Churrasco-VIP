(() => {
  "use strict";

  function initBarbecue() {
    const video = document.getElementById("bbqVideo");
    const audio = document.getElementById("bbqAudio");
    const button = document.getElementById("bbqSoundButton");
    const icon = document.getElementById("bbqSoundIcon");
    const text = document.getElementById("bbqSoundText");

    if (!video || !audio || !button || !icon || !text) {
      console.warn("Churrasco: elementos de vídeo ou áudio ausentes.");
      return;
    }

    video.muted = true;
    video.loop = true;
    video.playsInline = true;

    audio.volume = 0.28;
    audio.loop = true;

    let soundEnabled = false;
    let soundRequest = 0;

    function updateButton() {
      button.setAttribute("aria-pressed", String(soundEnabled));

      icon.textContent = soundEnabled ? "🔊" : "🔇";
      text.textContent = soundEnabled
        ? "Desligar som da brasa"
        : "Ativar som da brasa";
    }

    async function enableSound() {
      const request = ++soundRequest;

      try {
        await audio.play();

        if (request !== soundRequest) {
          return;
        }

        soundEnabled = true;
        updateButton();
      } catch (error) {
        if (request !== soundRequest) {
          return;
        }

        soundEnabled = false;
        updateButton();

        console.info(
          "O navegador bloqueou ou não conseguiu reproduzir o áudio.",
          error,
        );
      }
    }

    function disableSound() {
      ++soundRequest;
      audio.pause();
      soundEnabled = false;
      updateButton();
    }

    button.addEventListener("click", (event) => {
      event.stopPropagation();

      if (soundEnabled) {
        disableSound();
      } else {
        enableSound();
      }
    });

    // Primeira interação fora do botão:
    // tenta ativar o áudio ambiente.
    function firstInteraction(event) {
      if (button.contains(event.target)) {
        return;
      }

      document.removeEventListener("pointerdown", firstInteraction);
      document.removeEventListener("keydown", firstInteraction);

      if (!soundEnabled) {
        enableSound();
      }
    }

    document.addEventListener("pointerdown", firstInteraction, {
      passive: true,
    });

    document.addEventListener("keydown", firstInteraction);

    // Inicia o vídeo sem som, conforme permitido pelo navegador.
    const playPromise = video.play();

    if (playPromise && typeof playPromise.catch === "function") {
      playPromise.catch((error) => {
        console.info("Vídeo aguardando autorização de reprodução.", error);
      });
    }

    updateButton();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initBarbecue);
  } else {
    initBarbecue();
  }
})();
