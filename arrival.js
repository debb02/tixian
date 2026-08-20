(() => {
  const { STORAGE_KEY, loadConfig, formatMoney, formatDateTime, renderStatusBar } = window.TixianDemo;

  function render() {
    const config = loadConfig();
    document.querySelector("#arrivalPhone").dataset.device = config.device;
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
    document.querySelector("#syncState").textContent = `已同步 · ${new Date().toLocaleTimeString("zh-HK", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}`;
  }

  document.querySelector("#refreshButton").addEventListener("click", render);
  window.addEventListener("storage", event => {
    if (event.key === STORAGE_KEY) render();
  });
  document.addEventListener("visibilitychange", () => {
    if (!document.hidden) render();
  });
  render();
})();
