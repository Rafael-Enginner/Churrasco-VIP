(() => {
  "use strict";

  const phone = "5561993316047";
  const form = document.getElementById("rsvpForm");
  const nameInput = document.getElementById("guestName");
  const countInput = document.getElementById("guestCount");

  if (form && nameInput && countInput) {
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const name = nameInput.value.trim();
      const count = countInput.value;

      if (!name || name.length > 80) {
        nameInput.focus();
        return;
      }

      const message = [
        "Fala, Rafael! Confirmo presença no Churrasco VIP de 24/10, a partir das 11h, no Total Ville Quadra 203.",
        `Nome: ${name}.`,
        `Pessoas: ${count}.`
      ].join(" ");

      const whatsappUrl = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
      window.open(whatsappUrl, "_blank", "noopener,noreferrer");
    });
  };

  function choose(option) {
    if (!option || !status) return;
    options.forEach((item) => {
      const selected = item === option;
      item.classList.toggle("active", selected);
      item.setAttribute("aria-pressed", String(selected));
    });

    // Inserir texto como texto, sem interpretar HTML.
    status.replaceChildren(document.createTextNode("Seu estilo: "));
    const strong = document.createElement("strong");
    strong.textContent = labels[option.dataset.point] || labels.medium;
    status.appendChild(strong);
  }

  options.forEach((option) => {
    option.addEventListener("click", () => choose(option));
    option.addEventListener("focus", () => choose(option));
  });
})();
