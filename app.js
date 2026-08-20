(() => {
  const { DEFAULT_CONFIG, loadConfig, saveConfig, formatMoney, formatDateTime, renderStatusBar } = window.TixianDemo;
  const form = document.querySelector("#configForm");
  const saveState = document.querySelector("#saveState span");
  let config = loadConfig();
  let saveTimer;

  function populate() {
    for (const [key, value] of Object.entries(config)) {
      const field = form.elements.namedItem(key);
      if (!field) continue;
      if (field.type === "checkbox") field.checked = Boolean(value);
      else field.value = value;
    }
  }

  function readForm() {
    const next = { ...config };
    for (const field of form.elements) {
      if (!field.name) continue;
      next[field.name] = field.type === "checkbox" ? field.checked : field.value;
    }
    next.battery = Number(next.battery);
    next.signal = Number(next.signal);
    return next;
  }

  function render() {
    document.querySelector("#aAmount").textContent = `+${formatMoney(config.amount)}`;
    document.querySelector("#aAccount").textContent = config.payoutAccount;
    document.querySelector("#aType").textContent = config.transactionType;
    document.querySelector("#aStatus").textContent = config.transactionStatus;
    document.querySelector("#aTime").textContent = formatDateTime(config.withdrawalTime, true);
    document.querySelector("#batteryOutput").textContent = `${config.battery}%`;
    document.querySelector("#signalOutput").textContent = `${config.signal}/4`;
    document.querySelector("#withdrawalPhone").dataset.device = config.device;
    document.querySelector("#arrivalPhone").dataset.device = config.device;
    renderStatusBar(document.querySelector("#aStatusBar"), config);
    renderStatusBar(document.querySelector("#bStatusBar"), config);
    document.querySelector("#bMessage").textContent = config.arrivalMessage;
    document.querySelector("#bPayer").textContent = config.payerName;
    document.querySelector("#bCurrency").textContent = config.currency;
    document.querySelector("#bAmount").textContent = formatMoney(config.amount);
    document.querySelector("#bBalance").textContent = config.balanceLabel;
    document.querySelector("#bAccount").textContent = config.payoutAccount;
    document.querySelector("#bTime").textContent = formatDateTime(config.arrivalTime);
    document.querySelector("#bTransaction").textContent = config.transactionId;
    document.querySelector("#bReference").textContent = config.fpsReference;
  }

  function persist() {
    clearTimeout(saveTimer);
    saveState.textContent = "正在保存…";
    saveTimer = setTimeout(() => {
      saveConfig(config);
      saveState.textContent = `已自动保存 · ${new Date().toLocaleTimeString("zh-HK", { hour: "2-digit", minute: "2-digit" })}`;
    }, 180);
  }

  form.addEventListener("input", () => {
    config = readForm();
    render();
    persist();
  });

  form.addEventListener("change", () => {
    config = readForm();
    render();
    persist();
  });

  document.querySelector("#resetButton").addEventListener("click", () => {
    config = { ...DEFAULT_CONFIG };
    populate();
    render();
    saveConfig(config);
    saveState.textContent = "已恢复默认设置";
  });

  document.querySelector("#focusPreviewButton").addEventListener("click", () => {
    config = readForm();
    saveConfig(config);
    document.querySelector("#previews").scrollIntoView({ behavior: "smooth", block: "start" });
  });

  populate();
  render();
  saveConfig(config);
})();
