const STORAGE_KEY = "desentupidoraFogueteLancamentos";
let transactions = loadTransactions();
let toastTimer;

const money = value => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
const dateBR = value => {
  if (!value) return "—";
  const [year, month, day] = value.split("-");
  return `${day}/${month}/${year}`;
};
function loadTransactions() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    return Array.isArray(saved) ? saved : [];
  } catch { return []; }
}
function saveTransactions() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
}
function totals() {
  return transactions.reduce((acc, item) => {
    if (item.type === "entrada") acc.income += item.amount;
    else acc.expense += item.amount;
    acc.balance = acc.income - acc.expense;
    return acc;
  }, { income: 0, expense: 0, balance: 0 });
}
function showToast(message) {
  const toast = document.getElementById("toast");
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 2600);
}
function render() {
  const t = totals();
  ["homeIncome","summaryIncome","resultIncome"].forEach(id => document.getElementById(id).textContent = money(t.income));
  ["homeExpense","summaryExpense","resultExpense"].forEach(id => document.getElementById(id).textContent = money(t.expense));
  ["homeBalance","summaryBalance","resultBalance"].forEach(id => {
    const el = document.getElementById(id);
    el.textContent = money(t.balance);
    el.classList.toggle("positive", t.balance >= 0);
    el.classList.toggle("negative", t.balance < 0);
  });
  document.getElementById("balanceMessage").textContent = transactions.length
    ? (t.balance >= 0 ? "O saldo está positivo considerando os lançamentos cadastrados." : "Atenção: as despesas estão maiores que as entradas.")
    : "Cadastre movimentações para visualizar seu resultado financeiro.";
  renderRecent();
  renderTable();
}
function renderRecent() {
  const target = document.getElementById("recentList");
  const recent = [...transactions].sort((a,b) => b.createdAt - a.createdAt).slice(0,4);
  if (!recent.length) {
    target.innerHTML = '<p class="empty-state">Nenhuma movimentação registrada ainda.</p>';
    return;
  }
  target.innerHTML = recent.map(item => `
    <div class="recent-item">
      <span class="recent-dot ${item.type === "entrada" ? "green" : "red"}" aria-hidden="true">${item.type === "entrada" ? "↗" : "↘"}</span>
      <div class="recent-info"><strong>${escapeHTML(item.description)}</strong><small>${escapeHTML(item.category)} • ${dateBR(item.date)}</small></div>
      <span class="recent-value ${item.type === "entrada" ? "positive" : "negative"}">${item.type === "entrada" ? "+" : "−"} ${money(item.amount)}</span>
    </div>`).join("");
}
function renderTable() {
  const target = document.getElementById("transactionRows");
  const type = document.getElementById("typeFilter").value;
  const query = document.getElementById("searchFilter").value.trim().toLocaleLowerCase("pt-BR");
  const filtered = [...transactions].sort((a,b) => b.date.localeCompare(a.date) || b.createdAt-a.createdAt)
    .filter(item => (type === "todos" || item.type === type) &&
      `${item.description} ${item.category}`.toLocaleLowerCase("pt-BR").includes(query));
  if (!filtered.length) {
    target.innerHTML = '<tr><td colspan="6" class="empty-state">Nenhum lançamento encontrado.</td></tr>';
    return;
  }
  target.innerHTML = filtered.map(item => `
    <tr>
      <td><strong>${escapeHTML(item.description)}</strong>${item.payment ? `<br><small class="muted">${escapeHTML(item.payment)}</small>` : ""}</td>
      <td>${escapeHTML(item.category)}</td><td>${dateBR(item.date)}</td>
      <td><span class="type-pill ${item.type}">${item.type === "entrada" ? "Entrada" : "Despesa"}</span></td>
      <td class="align-right ${item.type === "entrada" ? "positive" : "negative"}"><strong>${money(item.amount)}</strong></td>
      <td><button class="delete-button" type="button" data-delete="${item.id}" aria-label="Excluir ${escapeHTML(item.description)}">Excluir</button></td>
    </tr>`).join("");
}
function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, char => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;" }[char]));
}
function navigate(view) {
  document.querySelectorAll(".view").forEach(section => section.classList.toggle("active", section.id === `view-${view}`));
  document.querySelectorAll(".nav-item").forEach(button => button.classList.toggle("active", button.dataset.view === view));
  const heading = document.querySelector(`#view-${view} h1`);
  if (heading) heading.focus?.();
}
function setFormType(type) {
  const isIncome = type === "entrada";
  document.getElementById("transactionType").value = type;
  document.getElementById("formTitle").textContent = isIncome ? "Adicionar entrada" : "Adicionar despesa";
  document.getElementById("formEyebrow").textContent = isIncome ? "NOVO RECEBIMENTO" : "NOVA DESPESA";
  const categories = isIncome
    ? ["Serviço","Manutenção","Outros recebimentos"]
    : ["Combustível","Ferramentas","Manutenção","Transporte","Materiais","Outras despesas"];
  document.getElementById("category").innerHTML = categories.map(c => `<option>${c}</option>`).join("");
  document.getElementById("date").value = new Date().toISOString().slice(0,10);
  document.getElementById("formError").textContent = "";
  document.getElementById("transactionForm").reset();
  document.getElementById("transactionType").value = type;
  document.getElementById("date").value = new Date().toISOString().slice(0,10);
  document.getElementById("category").innerHTML = categories.map(c => `<option>${c}</option>`).join("");
  document.getElementById("transactionDialog").showModal();
  document.getElementById("description").focus();
}
function closeDialog() { document.getElementById("transactionDialog").close(); }

document.querySelectorAll(".nav-item").forEach(button => button.addEventListener("click", () => navigate(button.dataset.view)));
document.querySelectorAll("[data-go]").forEach(button => button.addEventListener("click", () => navigate(button.dataset.go)));
document.querySelectorAll("[data-open-form]").forEach(button => button.addEventListener("click", () => setFormType(button.dataset.openForm)));
document.getElementById("closeDialog").addEventListener("click", closeDialog);
document.getElementById("cancelDialog").addEventListener("click", closeDialog);
document.getElementById("transactionDialog").addEventListener("click", event => {
  if (event.target === event.currentTarget) closeDialog();
});
document.getElementById("transactionForm").addEventListener("submit", event => {
  event.preventDefault();
  const description = document.getElementById("description").value.trim();
  const amount = Number(document.getElementById("amount").value);
  const date = document.getElementById("date").value;
  if (!description || !Number.isFinite(amount) || amount <= 0 || !date) {
    document.getElementById("formError").textContent = "Confira a descrição, o valor e a data. O valor deve ser maior que zero.";
    return;
  }
  transactions.push({
    id: (crypto.randomUUID ? crypto.randomUUID() : String(Date.now() + Math.random())),
    type: document.getElementById("transactionType").value,
    description, amount: Math.round(amount * 100) / 100, date,
    category: document.getElementById("category").value,
    payment: document.getElementById("payment").value,
    createdAt: Date.now()
  });
  saveTransactions();
  render();
  closeDialog();
  showToast("Lançamento salvo com sucesso.");
});
document.getElementById("typeFilter").addEventListener("change", renderTable);
document.getElementById("searchFilter").addEventListener("input", renderTable);
document.getElementById("transactionRows").addEventListener("click", event => {
  const button = event.target.closest("[data-delete]");
  if (!button) return;
  const item = transactions.find(t => t.id === button.dataset.delete);
  if (!item || !confirm(`Deseja excluir o lançamento "${item.description}"?`)) return;
  transactions = transactions.filter(t => t.id !== item.id);
  saveTransactions();
  render();
  showToast("Lançamento excluído.");
});

function toggleFont() {
  const enabled = document.body.classList.toggle("large-text");
  ["fontToggle","fontToggle2"].forEach(id => {
    const button = document.getElementById(id);
    button.setAttribute("aria-pressed", String(enabled));
  });
  showToast(enabled ? "Texto ampliado." : "Tamanho original do texto restaurado.");
}
function toggleContrast() {
  const enabled = document.body.classList.toggle("high-contrast");
  ["contrastToggle","contrastToggle2"].forEach(id => {
    document.getElementById(id).setAttribute("aria-pressed", String(enabled));
  });
  showToast(enabled ? "Alto contraste ativado." : "Alto contraste desativado.");
}
document.getElementById("fontToggle").addEventListener("click", toggleFont);
document.getElementById("fontToggle2").addEventListener("click", toggleFont);
document.getElementById("contrastToggle").addEventListener("click", toggleContrast);
document.getElementById("contrastToggle2").addEventListener("click", toggleContrast);

document.getElementById("todayLabel").textContent = new Intl.DateTimeFormat("pt-BR", { dateStyle: "long" }).format(new Date());
render();
