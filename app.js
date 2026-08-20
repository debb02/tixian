(() => {
  const {
    DEFAULT_CONFIG,
    loadConfig,
    saveConfig,
    formatMoney,
    formatDateTime,
    renderStatusBar,
    escapeHtml
  } = window.TixianDemo;

  const form = document.querySelector("#configForm");
  const saveState = document.querySelector("#saveState span");
  const arrivalView = document.querySelector("#arrivalView");
  const arrivalPhone = document.querySelector("#arrivalPhone");
  const templateSwitcher = document.querySelector("#templateSwitcher");
  const templateLabels = {
    a1: "A1 到账 · 转数快收款",
    a2: "A2 到账 · 收件箱通知",
    a3: "A3 到账 · 交易详情",
    a4: "A4 到账 · 账户流水",
    a5: "A5 到账 · 收款凭条"
  };

  let config = loadConfig();
  let saveTimer;

  const value = (key) => escapeHtml(config[key]);
  const icon = (name, label = "") => `<img src="assets/icons/${name}.svg" alt="${escapeHtml(label)}">`;

  function getDateParts(input) {
    const raw = String(input || "2026-08-17T15:10:45").replace(" ", "T");
    const [datePart = "2026-08-17", timePart = "15:10:45"] = raw.split("T");
    const [year = "2026", month = "08", day = "17"] = datePart.split("-");
    const [hour = "15", minute = "10", second = "45"] = timePart.split(":");
    return {
      dateChinese: `${year}年${Number(month)}月${Number(day)}日`,
      dateChinesePadded: `${year}年${month}月${day}日`,
      dateSlash: `${year}/${month}/${day}`,
      dateMdy: `${month}/${day}/${year}`,
      time: `${hour}:${minute}`,
      timeSeconds: `${hour}:${minute}:${second || "00"}`,
      meridiemTime: `${hour}:${minute} ${Number(hour) >= 12 ? "下午" : "上午"}`
    };
  }

  function currencyCode() {
    return config.currency === "HK$" ? "HKD" : config.currency;
  }

  function plainAmount() {
    const amount = Number(String(config.amount).replaceAll(",", ""));
    return Number.isFinite(amount) ? amount.toFixed(2) : "0.00";
  }

  function populate() {
    for (const [key, fieldValue] of Object.entries(config)) {
      const field = form.elements.namedItem(key);
      if (!field) continue;
      if (field.type === "checkbox") field.checked = Boolean(fieldValue);
      else field.value = fieldValue;
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

  function renderA1() {
    const arrival = getDateParts(config.arrivalTime);
    return `
      <div class="arrival-nav arrival-nav--dark">
        <button type="button" aria-label="关闭">${icon("x")}</button>
        <span>${icon("dots")}</span>
      </div>
      <article class="receipt receipt--a1">
        <div class="receipt-mark">${icon("building-bank")}</div>
        <p class="receipt-kicker">${value("arrivalMessage")}-來自 <strong>${value("payerName")}</strong></p>
        <h3>+${value("currency")} ${formatMoney(config.amount)}</h3>
        <div class="receipt-rule"></div>
        <dl>
          <div><dt>当前状态</dt><dd class="success">${value("balanceLabel")}</dd></div>
          <div><dt>付款账户</dt><dd>${value("payoutAccount")}</dd></div>
          <div><dt>收款时间</dt><dd>${arrival.dateSlash.replaceAll("/", "-")} ${arrival.timeSeconds}</dd></div>
          <div><dt>交易单号</dt><dd class="breakable">${value("transactionId")}</dd></div>
          <div><dt>FPS参考编号</dt><dd class="breakable">${value("fpsReference")}</dd></div>
        </dl>
      </article>`;
  }

  function renderA2() {
    const arrival = getDateParts(config.arrivalTime);
    return `
      <div class="arrival-nav arrival-nav--inbox">
        <button type="button" aria-label="返回">${icon("arrow-left")}</button>
        <strong>收件箱</strong>
        <span>${icon("trash")}</span>
      </div>
      <main class="inbox-screen">
        <article class="inbox-card">
          <header>
            <div>
              <h3>${value("institutionName")}</h3>
              <p>${arrival.dateChinese}<br>${arrival.meridiemTime}</p>
            </div>
            <span class="inbox-document">${icon("file-description")}</span>
          </header>
          <p class="inbox-message">${value("institutionName")}：您从 ${value("payerName")} 收到<br>${currencyCode()}${plainAmount()}.日期:${arrival.dateMdy}.</p>
        </article>
      </main>`;
  }

  function renderA3() {
    const arrival = getDateParts(config.arrivalTime);
    const nameParts = (config.recipientName || "WY").trim().split(/\s+/);
    const initials = `${nameParts[0]?.[0] || "W"}${nameParts.at(-1)?.[0] || "Y"}`;
    return `
      <div class="arrival-nav arrival-nav--light arrival-nav--centered">
        <button type="button" aria-label="返回">${icon("arrow-left")}</button>
        <strong>交易詳情</strong>
        <span></span>
      </div>
      <main class="transfer-screen">
        <section class="transfer-summary">
          <div class="avatar">${escapeHtml(initials)}</div>
          <h3>${value("recipientName")}</h3>
          <p class="transfer-amount">+${formatMoney(config.amount)}<span>${currencyCode()}</span></p>
          <time>${arrival.dateChinesePadded}${arrival.time}</time>
          <b>${value("transactionStatus")}</b>
          <div class="transfer-action">${icon("user-dollar")}<span>轉數到好友戶口</span></div>
        </section>
        <section class="transfer-details">
          <div><dt>由</dt><dd>${value("recipientName")}<br>${value("recipientBank")}</dd></div>
          <div><dt>至</dt><dd>${value("destinationAccount")}</dd></div>
          <div><dt>「轉數快」參考號碼</dt><dd>${value("fpsReference")}</dd></div>
        </section>
      </main>`;
  }

  function renderA4() {
    const arrival = getDateParts(config.arrivalTime);
    return `
      <div class="arrival-nav arrival-nav--ledger">
        <button type="button" aria-label="返回">${icon("arrow-left")}</button>
        <strong>明細內容</strong>
        <span></span>
      </div>
      <main class="ledger-screen">
        <section class="ledger-hero">
          <span class="ledger-wallet">${icon("wallet")}</span>
          <b>收入</b>
          <strong>${value("currency")}${formatMoney(config.amount)}</strong>
        </section>
        <p class="ledger-links">新增常用帳戶&nbsp; | &nbsp;通知付款人</p>
        <dl class="ledger-list">
          <div><dt>摘要</dt><dd>${value("summaryLabel")}</dd></div>
          <div><dt>帳務日期</dt><dd>${arrival.dateSlash}</dd></div>
          <div><dt>交易日期</dt><dd>${arrival.dateSlash} ${arrival.timeSeconds}</dd></div>
          <div><dt>帳戶餘額</dt><dd>${value("accountBalance")}</dd></div>
          <div><dt>備註</dt><dd>${value("memo")}</dd></div>
          <div><dt>轉帳說明</dt><dd>--</dd></div>
        </dl>
        <div class="ledger-note"><span>備忘錄</span><p>可輸入50字，快速搜尋此筆交易</p></div>
        <div class="ledger-photo"><span>照片</span><div>${icon("camera")}<b>上傳照片</b></div></div>
      </main>`;
  }

  function renderA5() {
    const arrival = getDateParts(config.arrivalTime);
    return `
      <div class="arrival-nav arrival-nav--dark">
        <button type="button" aria-label="关闭">${icon("x")}</button>
        <span>${icon("dots")}</span>
      </div>
      <article class="receipt receipt--a5">
        <div class="receipt-mark">${icon("building-bank")}</div>
        <p class="receipt-kicker">${value("arrivalMessage")}-來自<strong>${value("payerName")}</strong></p>
        <h3>+${value("currency")} ${formatMoney(config.amount)}</h3>
        <div class="receipt-rule"></div>
        <dl>
          <div><dt>當前狀態</dt><dd>${value("balanceLabel")}</dd></div>
          <div><dt>付款賬戶</dt><dd>${value("payoutAccount")}</dd></div>
          <div><dt>收款時間</dt><dd>${arrival.dateSlash.replaceAll("/", "-")} ${arrival.timeSeconds}</dd></div>
          <div><dt>交易單號</dt><dd class="breakable">${value("transactionId")}</dd></div>
          <div><dt>FPS參考號</dt><dd class="breakable">${value("fpsReference")}</dd></div>
        </dl>
      </article>`;
  }

  function renderArrival() {
    const template = templateLabels[config.arrivalTemplate] ? config.arrivalTemplate : "a1";
    arrivalPhone.dataset.template = template;
    document.querySelector("#activeTemplateLabel").textContent = `B：${templateLabels[template]}`;
    templateSwitcher.querySelectorAll("button").forEach((button) => {
      button.classList.toggle("active", button.dataset.template === template);
      button.setAttribute("aria-pressed", String(button.dataset.template === template));
    });
    const templates = { a1: renderA1, a2: renderA2, a3: renderA3, a4: renderA4, a5: renderA5 };
    arrivalView.innerHTML = templates[template]();
  }

  function render() {
    document.querySelector("#aAmount").textContent = `+${String(config.amount).replaceAll(",", "") || "0"}`;
    document.querySelector("#aAccount").textContent = config.payoutAccount;
    document.querySelector("#aType").textContent = config.transactionType;
    document.querySelector("#aStatus").textContent = config.transactionStatus;
    document.querySelector("#aTime").textContent = formatDateTime(config.withdrawalTime, true);
    document.querySelector("#batteryOutput").textContent = `${config.battery}%`;
    document.querySelector("#signalOutput").textContent = `${config.signal}/4`;
    document.querySelector("#withdrawalPhone").dataset.device = config.device;
    arrivalPhone.dataset.device = config.device;
    renderStatusBar(document.querySelector("#aStatusBar"), config);
    renderStatusBar(document.querySelector("#bStatusBar"), config);
    renderArrival();
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

  templateSwitcher.addEventListener("click", (event) => {
    const button = event.target.closest("button[data-template]");
    if (!button) return;
    config.arrivalTemplate = button.dataset.template;
    form.elements.namedItem("arrivalTemplate").value = config.arrivalTemplate;
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
