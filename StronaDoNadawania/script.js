const STORAGE_KEY = "devices.macRegistry.v1";
const MAC_REGEX = /^(?:[0-9A-Fa-f]{2}([-:]))(?:[0-9A-Fa-f]{2}\1){4}[0-9A-Fa-f]{2}$/;

const el = (id) => document.getElementById(id);
let devices = load();

function load() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch {
    return [];
  }
}
function save() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(devices));
  render();
}

function normalizeMac(mac) {
  const cleaned = mac.replace(/[^0-9A-Fa-f]/g, "").toUpperCase();
  return cleaned.length === 12 ? cleaned.match(/.{1,2}/g).join(":") : mac.toUpperCase();
}

function validate({ name, serial, mac }) {
  const errors = [];
  if (!name) errors.push("Nazwa wymagana.");
  if (!serial) errors.push("Numer seryjny wymagany.");
  const macNorm = normalizeMac(mac);
  if (!MAC_REGEX.test(macNorm)) errors.push("Nieprawidłowy format MAC.");
  if (devices.find(d => d.serial === serial)) errors.push("Duplikat numeru seryjnego.");
  if (devices.find(d => d.mac === macNorm)) errors.push("Duplikat MAC.");
  return { ok: errors.length === 0, macNorm, errors };
}

function render(filter = el("search").value.trim().toLowerCase()) {
  const rows = devices.filter(d => (d.name + d.serial + d.mac).toLowerCase().includes(filter));
  const body = el("devicesBody");
  body.innerHTML = "";
  if (!rows.length) {
    body.innerHTML = `<tr><td colspan="4" class="empty">Brak danych.</td></tr>`;
  } else {
    rows.forEach(d => {
      body.innerHTML += `
        <tr>
          <td>${d.name}</td>
          <td>${d.serial}</td>
          <td>${d.mac}</td>
          <td><button data-id="${d.id}" class="danger">Usuń</button></td>
        </tr>`;
    });
  }
  el("countPill").textContent = `${devices.length} pozycji`;
}

function generateRandomMac() {
  const bytes = new Uint8Array(6);
  crypto.getRandomValues(bytes);
  bytes[0] = (bytes[0] | 0x02) & 0xFE;
  return Array.from(bytes).map(b => b.toString(16).padStart(