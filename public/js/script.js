(() => {
  "use strict";

  const $ = (id) => document.getElementById(id);
  const WHATSAPP = "5561993316047";
  const TIMEOUT_MS = 25000; // o plano gratuito do Render pode demorar para "acordar"

  /* ---------- Confirmação de presença ---------- */
  const form = $("rsvpForm");
  const status = $("rsvpStatus");
  const whatsappLink = $("whatsappLink");

  function setStatus(message, state = "info") {
    if (!status) return;
    status.textContent = message;
    status.dataset.state = state;
  }

  async function postJson(url, data) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        signal: controller.signal,
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.error || "Erro ao registrar. Tente novamente.");
      return body;
    } catch (err) {
      if (err.name === "AbortError") throw new Error("O servidor demorou a responder. Tente de novo em instantes.");
      throw err;
    } finally {
      clearTimeout(timer);
    }
  }

  form?.addEventListener("submit", async (event) => {
    event.preventDefault();
    const name = $("guestName").value.trim();
    const guestCount = $("guestCount").value;

    if (!name || name.length > 80) {
      setStatus("Informe um nome válido (até 80 caracteres).", "error");
      $("guestName").focus();
      return;
    }

    const button = form.querySelector("button[type=submit]");
    button.disabled = true;
    setStatus("Registrando presença…");
    if (whatsappLink) whatsappLink.hidden = true;

    try {
      const result = await postJson("/api/rsvp", { name, guestCount });
      setStatus(result.updated ? "Presença atualizada!" : "Presença registrada!", "ok");

      // O link é mostrado em vez de aberto sozinho: navegadores bloqueiam abertura após await.
      if (whatsappLink) {
        const text = `Fala, Rafael! Confirmo presença no Churrasco VIP de 24/10. Nome: ${name}. Pessoas: ${guestCount}.`;
        whatsappLink.href = `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(text)}`;
        whatsappLink.hidden = false;
      }
      form.reset();
    } catch (err) {
      setStatus(err.message, "error");
    } finally {
      button.disabled = false;
    }
  });

  /* ---------- Player de música (arquivos locais; só ativa se existir no HTML) ---------- */
  const input = $("musicFiles");
  const audio = $("audioPlayer");
  const playlist = $("playlist");
  const title = $("trackTitle");
  if (!input || !audio || !playlist || !title) return;

  let tracks = [];
  let currentUrl = null;

  function playAt(index) {
    if (!tracks[index]) return;
    if (currentUrl) URL.revokeObjectURL(currentUrl);
    currentUrl = URL.createObjectURL(tracks[index]);
    audio.src = currentUrl;
    title.textContent = tracks[index].name;
    playlist.value = String(index);
    audio.play().catch(() => {});
  }

  input.addEventListener("change", () => {
    tracks = Array.from(input.files || []).filter(
      (file) => file.type.startsWith("audio/") || /\.(mp3|wav|ogg|m4a)$/i.test(file.name)
    );
    playlist.replaceChildren(
      ...tracks.map((file, i) => Object.assign(document.createElement("option"), { value: String(i), textContent: file.name }))
    );
    if (tracks.length) playAt(0);
  });

  playlist.addEventListener("change", () => playAt(Number(playlist.value)));
  audio.addEventListener("ended", () => playAt(Number(playlist.value) + 1));
  window.addEventListener("pagehide", () => currentUrl && URL.revokeObjectURL(currentUrl));
})();
