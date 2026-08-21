const STORAGE_KEY = "tixian-demo-config-v4";

const DEFAULT_CONFIG = Object.freeze({
  arrivalTemplate: "a1",
  amount: "10000",
  currency: "HK$",
  payoutAccount: "701***202",
  payerName: "CHUNG W** Y**",
  transactionType: "提款",
  transactionStatus: "成功",
  withdrawalTime: "2026-08-17T15:10:45",
  transactionId: "1040073000012801202405195540487215",
  fpsReference: "FRN20241010PAYC694364383164",
  arrivalMessage: "轉數快收款",
  balanceLabel: "已存入餘額",
  institutionName: "渣打香港",
  recipientName: "WONG SUM YIU",
  recipientBank: "STANDARD CHARTERED BANK (HONG KONG) LIMITED",
  destinationAccount: "Mox戶口",
  summaryLabel: "轉帳存入",
  accountBalance: "•••",
  memo: "0020461000737575轉入",
  device: "iphone",
  statusTime: "09:55",
  battery: 40,
  showBatteryPercent: false,
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

const STATUS_ICON_FOLDERS = Object.freeze({
  iphone: "apple",
  samsung: "samsung",
  xiaomi: "xiaomi",
  pixel: "google-pixel",
  vivo: "vivo"
});

function statusIconPath(device, name) {
  const folder = STATUS_ICON_FOLDERS[device] || STATUS_ICON_FOLDERS.iphone;
  return `assets/status-icons/${folder}/${name}.svg`;
}

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

function renderBattery(device, battery, charging, showPercent) {
  const state = `${battery <= 20 ? "battery--low" : ""} ${charging ? "battery--charging" : ""}`.trim();
  const level = `style="--battery-level:${battery}%"`;
  const batteryAsset = device === "iphone" && (showPercent || charging) ? "battery-percent" : "battery";
  const shell = `<img class="battery-shell" src="${statusIconPath(device, batteryAsset)}" alt="" aria-hidden="true">`;
  const bolt = charging ? `<img class="battery-bolt" src="${statusIconPath(device, "charging")}" alt="" aria-hidden="true">` : "";
  const percentClass = showPercent ? "battery--with-percent" : "";
  const label = `aria-label="${battery}% battery${charging ? ", charging" : ""}"`;

  if (device === "samsung") {
    return `<span class="battery-system battery-system--samsung ${state}" ${label}>
      ${showPercent ? `<b class="battery-number">${battery}%</b>` : ""}
      <span class="battery battery--samsung"><i ${level}></i>${shell}${bolt}</span>
    </span>`;
  }

  if (device === "xiaomi") {
    return `<span class="battery battery--xiaomi ${state} ${percentClass}" ${label}>
      <i ${level}></i>${shell}${showPercent ? `<b>${battery}</b>` : ""}${bolt}
    </span>`;
  }

  if (device === "pixel") {
    return `<span class="battery-system battery-system--pixel ${state}" ${label}>
      ${showPercent ? `<b class="battery-number">${battery}%</b>` : ""}
      <span class="battery battery--pixel"><i ${level}></i>${shell}${bolt}</span>
    </span>`;
  }

  if (device === "vivo") {
    return `<span class="battery battery--vivo ${state} ${percentClass}" ${label}>
      <i ${level}></i>${shell}${showPercent ? `<b>${battery}</b>` : ""}<span class="battery-vivo-notch" aria-hidden="true"></span>${bolt}
    </span>`;
  }

  return `<span class="battery battery--iphone ${state} ${percentClass}" ${label}>
    <i ${level}></i>${shell}${showPercent ? `<b>${battery}</b>` : ""}${bolt}
  </span>`;
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
      ${config.wifi ? `<span class="wifi" aria-label="Wi-Fi"><img src="${statusIconPath(device, "wifi")}" alt=""></span>` : ""}
      <span class="signal" aria-label="signal" style="--signal-clip:${(4 - signal) * 25}%"><img src="${statusIconPath(device, "signal")}" alt=""></span>
      ${renderBattery(device, battery, config.charging, config.showBatteryPercent)}
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
  STATUS_ICON_FOLDERS,
  loadConfig,
  saveConfig,
  formatMoney,
  formatDateTime,
  renderStatusBar,
  escapeHtml
};
