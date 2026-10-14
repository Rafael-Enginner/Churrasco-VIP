(() => {
  "use strict";

  const $ = (id) => document.getElementById(id);
  let csrf = "";
  let page = 1;
  let state = { guests: [], total: 0, confirmed: 0, people: 0, pageSize: 100 };

  async function request(path, method = "GET", body) {
    const res = await fetch(path, {
      method,
      credentials: "same-origin",
      headers: { "Content-Type": "application/json", ...(csrf && { "X-CSRF-Token": csrf }) },
      ...(body && { body: JSON.stringify(body) }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || `Falha na operação (${res.status})`);
    return data;
  }

  const showError = (el, err) => { el.textContent = err.message; };

  async function loadSession() {
    const s = await request("/api/admin/session");
    csrf = s.csrf;
    $("login").classList.toggle("hide", s.authenticated);
    $("dashboard").classList.toggle("hide", !s.authenticated);
    if (s.authenticated) await load();
  }

  function cell(text) {
    const td = document.createElement("td");
    td.textContent = text;
    return td;
  }

  function actionButton(label, handler) {
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = label;
    button.addEventListener("click", async () => {
      button.disabled = true;
      try { await handler(); } catch (err) { showError($("adminStatus"), err); }
      button.disabled = false;
    });
    return button;
  }

  async function load() {
    state = await request(`/api/admin/guests?page=${page}`);
    const pages = Math.max(1, Math.ceil(state.total / state.pageSize));
    if (page > pages) { page = pages; return load(); }

    $("totals").textContent = `${state.total} registros · ${state.confirmed} confirmados · ${state.people} pessoas confirmadas`;
    $("pageInfo").textContent = `Página ${page} de ${pages}`;
    $("prevPage").disabled = page <= 1;
    $("nextPage").disabled = page >= pages;

    const rows = state.guests.map((g) => {
      const tr = document.createElement("tr");
      const count = g.guestCount >= 5 ? "5 ou mais" : String(g.guestCount);
      tr.append(cell(g.name), cell(count), cell(new Date(g.createdAt).toLocaleString("pt-BR")), cell(g.status));

      const next = g.status === "Confirmado" ? "Pendente" : "Confirmado";
      const td = document.createElement("td");
      td.append(
        actionButton(next === "Confirmado" ? "Confirmar" : "Marcar pendente", async () => {
          await request(`/api/admin/guests/${g.id}`, "PATCH", { status: next });
          await load();
        }),
        actionButton("Excluir", async () => {
          if (!confirm(`Excluir ${g.name}?`)) return;
          await request(`/api/admin/guests/${g.id}`, "DELETE");
          await load();
        })
      );
      tr.append(td);
      return tr;
    });
    $("rows").replaceChildren(...rows);
  }

  /* CSV: neutraliza células que o Excel interpretaria como fórmula (= + - @). */
  const csvCell = (value) => {
    let text = String(value);
    if (/^[=+\-@\t\r]/.test(text)) text = `'${text}`;
    return `"${text.replace(/"/g, '""')}"`;
  };

  $("exportBtn").addEventListener("click", async () => {
    try {
      const { guests } = await request("/api/admin/guests?all=1");
      const header = ["Nome", "Pessoas", "Data", "Status"];
      const lines = guests.map((g) => [g.name, g.guestCount >= 5 ? "5 ou mais" : g.guestCount, g.createdAt, g.status]);
      const csv = "\uFEFF" + [header, ...lines].map((row) => row.map(csvCell).join(";")).join("\r\n");
      const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
      const a = Object.assign(document.createElement("a"), { href: url, download: "convidados.csv" });
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (err) { showError($("adminStatus"), err); }
  });

  $("loginForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    try {
      const d = await request("/api/admin/login", "POST", { password: $("password").value });
      csrf = d.csrf;
      $("password").value = "";
      $("loginStatus").textContent = "";
      await loadSession();
    } catch (err) { showError($("loginStatus"), err); }
  });

  $("addForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    try {
      await request("/api/admin/guests", "POST", { name: $("addName").value, guestCount: $("addCount").value });
      $("addName").value = "";
      $("adminStatus").textContent = "";
      page = 1;
      await load();
    } catch (err) { showError($("adminStatus"), err); }
  });

  $("logoutBtn").addEventListener("click", async () => {
    await request("/api/admin/logout", "POST", {}).catch(() => {});
    csrf = "";
    await loadSession();
  });

  $("prevPage").addEventListener("click", () => { page -= 1; load().catch((err) => showError($("adminStatus"), err)); });
  $("nextPage").addEventListener("click", () => { page += 1; load().catch((err) => showError($("adminStatus"), err)); });

  loadSession().catch((err) => showError($("loginStatus"), err));
})();
