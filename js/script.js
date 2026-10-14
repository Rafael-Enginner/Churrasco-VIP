(() => {
  const phone = "5561996504544";
  const form = document.getElementById("rsvpForm");
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const name = document.getElementById("guestName").value.trim();
    const count = document.getElementById("guestCount").value;
    if (!name) return;
    const message = `Fala, Thiago! Confirmo presença no Churrasco VIP de 24/10, a partir das 11h, no Total Ville Quadra 203. Nome: ${name}. Pessoas: ${count}.`;
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, "_blank", "noopener,noreferrer");
  });

  const options = [...document.querySelectorAll(".steak-option")];
  const status = document.getElementById("pointStatus");
  const labels = { rare: "MAL PASSADA", medium: "AO PONTO", well: "BEM PASSADA" };
  function choose(option) {
    options.forEach(item => {
      const selected = item === option;
      item.classList.toggle("active", selected);
      item.setAttribute("aria-pressed", String(selected));
    });
    status.innerHTML = `Seu estilo: <strong>${labels[option.dataset.point]}</strong>`;
  }
  options.forEach(option => {
    option.addEventListener("mouseenter", () => choose(option));
    option.addEventListener("focus", () => choose(option));
    option.addEventListener("click", () => choose(option));
  });
})();