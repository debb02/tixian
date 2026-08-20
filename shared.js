const STORAGE_KEY = "tixian-demo-config-v3";

const DEFAULT_CONFIG = Object.freeze({
  amount: "10000",
  currency: "HK$",
  payoutAccount: "701***202",
  payerName: "CHUNG W** Y**",
  transactionType: "提款",
  transactionStatus: "成功",
  withdrawalTime: "2026-08-17T15:10:45",
  arrivalTime: "2026-08-17T15:10:45",
  transactionId: "1040073000012801202405195540487215",
  fpsReference: "FRN20241010PAYC694364383164",
  arrivalMessage: "轉數快收款",
  balanceLabel: "已存入餘額",
  device: "iphone",
  statusTime: "09:55",
  battery: 40,
  charging: true,
  signal: 4,
  wifi: true,
  carrier: ""
});

const DEVICE_LABELS = Object.freeze({
  iphone: "Apple iPhone",
  samsung: "Samsung Galaxy",
  xiaomi: "Xiaomi",
  pixel: "Google Pixel",
  vivo: "vivo"
});

function loadConfig() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
    return { ...DEFAULT_CONFIG, ...saved };
  } catch (_) {
    return { ...DEFAULT_CONFIG };
  }
}

function saveConfig(config) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...DEFAULT_CONFIG, ...config }));
}

function formatMoney(value) {
  const amount = Number(String(value).replace(/,/g, ""));
  return Number.isFinite(amount)
    ? amount.toLocaleString("en-HK", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    : "0.00";
}

function formatDateTime(value, withSeconds = false) {
  if (!value) return "—";
  const normalized = value.replace("T", " ");
  return withSeconds && normalized.length === 16 ? `${normalized}:00` : normalized;
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, Number(value) || 0));
}

function renderBattery(device, battery, charging) {
  const state = `${battery <= 20 ? "battery--low" : ""} ${charging ? "battery--charging" : ""}`.trim();
  const level = `style="--battery-level:${battery}%"`;
  const bolt = charging ? '<em class="battery-bolt" aria-hidden="true">ϟ</em>' : "";
  const label = `aria-label="${battery}% battery${charging ? ", charging" : ""}"`;

  if (device === "samsung") {
    return `<span class="battery-system battery-system--samsung ${state}" ${label}>
      <b class="battery-number">${battery}%</b>
      <span class="battery battery--samsung"><i ${level}></i>${bolt}</span>
    </span>`;
  }

  if (device === "xiaomi") {
    return `<span class="battery battery--xiaomi ${state}" ${label}>
      <i ${level}></i><b>${battery}</b>${bolt}
    </span>`;
  }

  if (device === "pixel") {
    return `<span class="battery-system battery-system--pixel ${state}" ${label}>
      <b class="battery-number">${battery}%</b>
      <span class="battery battery--pixel"><i ${level}></i>${bolt}</span>
    </span>`;
  }

  if (device === "vivo") {
    return `<span class="battery battery--vivo ${state}" ${label}>
      <i ${level}></i><b>${battery}</b><span class="battery-vivo-notch" aria-hidden="true"></span>${bolt}
    </span>`;
  }

  return `<span class="battery battery--iphone ${state}" ${label}><i ${level}></i></span>`;
}

function renderStatusBar(root, config) {
  if (!root) return;
  const device = config.device || "iphone";
  const battery = clamp(config.battery, 1, 100);
  const signal = clamp(config.signal, 1, 4);
  root.className = `status-bar status-bar--${device}`;
  root.innerHTML = `
    <div class="status-left">
      <span class="status-time">${escapeHtml(config.statusTime || "15:14")}</span>
    </div>
    <div class="status-cutout" aria-hidden="true"><i></i></div>
    <div class="status-right">
      <span class="status-mode" aria-hidden="true"></span>
      <span class="carrier">${escapeHtml(config.carrier ?? "5G")}</span>
      ${config.wifi ? '<span class="wifi" aria-label="Wi-Fi"><i></i></span>' : ""}
      <span class="signal" aria-label="signal">
        ${[1, 2, 3, 4].map(level => `<i class="${level <= signal ? "on" : ""}"></i>`).join("")}
      </span>
      ${renderBattery(device, battery, config.charging)}
    </div>`;
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

window.TixianDemo = {
  STORAGE_KEY,
  DEFAULT_CONFIG,
  DEVICE_LABELS,
  loadConfig,
  saveConfig,
  formatMoney,
  formatDateTime,
  renderStatusBar,
  escapeHtml
};
