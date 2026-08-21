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

function identifierDate(value) {
  const match = String(value || "").match(/(\d{4})-(\d{2})-(\d{2})/);
  return match ? `${match[1]}${match[2]}${match[3]}` : "20260817";
}

function randomDigits(length) {
  const values = new Uint8Array(length);
  if (globalThis.crypto?.getRandomValues) globalThis.crypto.getRandomValues(values);
  else for (let index = 0; index < length; index += 1) values[index] = Math.floor(Math.random() * 256);
  return Array.from(values, (value) => value % 10).join("");
}

function generateIdentifiers(withdrawalTime) {
  const date = identifierDate(withdrawalTime);
  return {
    transactionId: `1040073${date}${randomDigits(19)}`,
    fpsReference: `FRN${date}PAYC${randomDigits(12)}`
  };
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

function statusDate(value) {
  const match = String(value || "").match(/\d{4}-(\d{2})-(\d{2})/);
  return match ? `${match[2]}/${match[1]}` : "17/08";
}

function renderBattery(device, battery, charging, showPercent) {
  const state = `${battery <= 20 ? "battery--low" : ""} ${charging ? "battery--charging" : ""}`.trim();
  const innerWidths = { iphone: 25, samsung: 28, xiaomi: 27, pixel: 14, vivo: 30 };
  const innerWidth = innerWidths[device] || innerWidths.iphone;
  const fillWidth = Math.min(innerWidth, Math.max(1, battery * innerWidth / 100)).toFixed(2);
  const level = `style="--battery-fill:${fillWidth}px"`;
  const shell = `<img class="battery-shell" src="${statusIconPath(device, "battery")}" alt="" aria-hidden="true">`;
  const bolt = charging ? `<img class="battery-bolt" src="${statusIconPath(device, "charging")}" alt="" aria-hidden="true">` : "";
  const percentClass = showPercent ? "battery--with-percent" : "";
  const label = `aria-label="${battery}% battery${charging ? ", charging" : ""}"`;

  if (device === "samsung") {
    return `<span class="battery battery--samsung ${state} ${percentClass}" ${label}>
      <i ${level}></i>${shell}${showPercent ? `<b>${battery}</b>` : ""}${bolt}
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
  const carrier = config.carrier ? `<span class="network-label">${escapeHtml(config.carrier)}</span>` : "";
  const wifi = config.wifi ? `<span class="wifi" aria-label="Wi-Fi"><img src="${statusIconPath(device, "wifi")}" alt=""></span>` : "";
  const signalIcon = `<span class="signal" aria-label="signal" style="--signal-clip:${(4 - signal) * 25}%"><img src="${statusIconPath(device, "signal")}" alt=""></span>`;
  const batteryIcon = renderBattery(device, battery, config.charging, config.showBatteryPercent);
  const leftLayouts = {
    iphone: `<span class="status-time">${escapeHtml(config.statusTime || "15:14")}</span>`,
    samsung: `<span class="status-time">${escapeHtml(config.statusTime || "15:14")}</span><span class="status-date">${statusDate(config.withdrawalTime)}</span><img class="status-notifications" src="${statusIconPath(device, "notifications")}" alt="" aria-hidden="true">`,
    xiaomi: `<span class="status-time">${escapeHtml(config.statusTime || "15:14")}</span><img class="status-notifications" src="${statusIconPath(device, "notifications")}" alt="" aria-hidden="true">`,
    pixel: `<span class="status-time">${escapeHtml(config.statusTime || "15:14")}</span>`,
    vivo: `<span class="status-time">${escapeHtml(config.statusTime || "15:14")}</span>`
  };
  const rightLayouts = {
    iphone: `${signalIcon}${wifi}${batteryIcon}`,
    samsung: `${wifi}${signalIcon}${carrier}${batteryIcon}`,
    xiaomi: `<span class="status-mode status-mode--xiaomi" aria-hidden="true">×1</span>${signalIcon}${wifi}${carrier}${batteryIcon}`,
    pixel: `${wifi}${signalIcon}${carrier}${batteryIcon}`,
    vivo: `<span class="status-mode status-mode--vivo" aria-hidden="true">0.2K</span>${carrier}${signalIcon}${wifi}${batteryIcon}`
  };
  root.className = `status-bar status-bar--${device}`;
  root.innerHTML = `
    <div class="status-left status-left--${device}">
      ${leftLayouts[device] || leftLayouts.iphone}
    </div>
    <div class="status-right status-right--${device}">
      ${rightLayouts[device] || rightLayouts.iphone}
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
  generateIdentifiers,
  formatMoney,
  formatDateTime,
  renderStatusBar,
  escapeHtml
};
