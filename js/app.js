(function () {
  "use strict";

  /* ============ STORAGE HELPERS ============ */
  const STORE_KEY = "silentSignal.settings";
  const HISTORY_KEY = "silentSignal.history";

  function getSettings() {
    try {
      return JSON.parse(localStorage.getItem(STORE_KEY)) || {};
    } catch (e) {
      return {};
    }
  }

  function saveSettings(settings) {
    localStorage.setItem(STORE_KEY, JSON.stringify(settings));
  }

  function getHistory() {
    try {
      return JSON.parse(localStorage.getItem(HISTORY_KEY)) || [];
    } catch (e) {
      return [];
    }
  }

  function addHistoryEntry(entry) {
    const list = getHistory();
    list.unshift(entry);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(list.slice(0, 50)));
  }

  /* ============ ELEMENTS ============ */
  const displayCurrent = document.getElementById("displayCurrent");
  const displayHistory = document.getElementById("displayHistory");
  const keypad = document.querySelector(".keypad");
  const clearBtn = document.getElementById("clearBtn");
  const toast = document.getElementById("toast");

  const calculatorView = document.getElementById("calculatorView");
  const setupView = document.getElementById("setupView");
  const historyView = document.getElementById("historyView");
  const onboardView = document.getElementById("onboardView");

  const pinInput = document.getElementById("pinInput");
  const contactNameInput = document.getElementById("contactNameInput");
  const contactPhoneInput = document.getElementById("contactPhoneInput");
  const messageInput = document.getElementById("messageInput");
  const saveSettingsBtn = document.getElementById("saveSettings");
  const saveConfirm = document.getElementById("saveConfirm");

  const setupClose = document.getElementById("setupClose");
  const viewHistoryBtn = document.getElementById("viewHistoryBtn");
  const historyBack = document.getElementById("historyBack");
  const historyList = document.getElementById("historyList");
  const historyEmpty = document.getElementById("historyEmpty");

  const onboardStart = document.getElementById("onboardStart");
  const onboardSkip = document.getElementById("onboardSkip");

  /* ============ CALCULATOR STATE ============ */
  let currentOperand = "0";
  let previousOperand = "";
  let operator = null;
  let justEvaluated = false;

  function formatNumber(numStr) {
    if (numStr === "" || numStr === "-") return numStr;
    const [intPart, decPart] = numStr.split(".");
    const formattedInt = new Intl.NumberFormat("en-US").format(Number(intPart || "0"));
    return decPart !== undefined ? `${formattedInt}.${decPart}` : formattedInt;
  }

  function updateDisplay() {
    displayCurrent.textContent = formatNumber(currentOperand);
    displayHistory.textContent = previousOperand
      ? `${formatNumber(previousOperand)} ${operatorSymbol(operator)}`
      : "";
  }

  function operatorSymbol(op) {
    return { add: "+", subtract: "−", multiply: "×", divide: "÷" }[op] || "";
  }

  function inputDigit(digit) {
    if (justEvaluated) {
      currentOperand = digit;
      justEvaluated = false;
    } else if (currentOperand === "0") {
      currentOperand = digit;
    } else {
      if (currentOperand.replace("-", "").length >= 12) return;
      currentOperand += digit;
    }
    updateDisplay();
  }

  function inputDecimal() {
    if (justEvaluated) {
      currentOperand = "0.";
      justEvaluated = false;
      updateDisplay();
      return;
    }
    if (!currentOperand.includes(".")) {
      currentOperand += ".";
      updateDisplay();
    }
  }

  function chooseOperator(op) {
    if (operator && !justEvaluated) {
      evaluate();
    }
    previousOperand = currentOperand;
    operator = op;
    justEvaluated = true; // next digit starts fresh operand
    updateDisplay();
  }

  function evaluate() {
    const prev = parseFloat(previousOperand);
    const curr = parseFloat(currentOperand);
    if (isNaN(prev) || isNaN(curr)) return;
    let result;
    switch (operator) {
      case "add": result = prev + curr; break;
      case "subtract": result = prev - curr; break;
      case "multiply": result = prev * curr; break;
      case "divide": result = curr === 0 ? NaN : prev / curr; break;
      default: return;
    }
    currentOperand = isNaN(result) ? "Error" : trimResult(result);
    previousOperand = "";
    operator = null;
  }

  function trimResult(num) {
    const rounded = Math.round(num * 1e9) / 1e9;
    return String(rounded);
  }

  function clearAll() {
    currentOperand = "0";
    previousOperand = "";
    operator = null;
    justEvaluated = false;
    updateDisplay();
  }

  function negate() {
    if (currentOperand === "0") return;
    currentOperand = currentOperand.startsWith("-")
      ? currentOperand.slice(1)
      : "-" + currentOperand;
    updateDisplay();
  }

  function percent() {
    currentOperand = trimResult(parseFloat(currentOperand) / 100);
    updateDisplay();
  }

  /* ============ SECRET CODE DETECTION ============ */
  // The operand being typed right before "=" is checked against the saved PIN.
  function checkSecretCode() {
    const settings = getSettings();
    if (!settings.pin) return false;
    return currentOperand === settings.pin;
  }

  function handleEquals() {
    const wasSecret = checkSecretCode();
    if (operator) evaluate();
    justEvaluated = true;
    updateDisplay();

    if (wasSecret) {
      // Deliberately fire after display updates so the UI shows a normal result.
      triggerSilentAlert();
    }
  }

  /* ============ AC 5-TAP -> OPEN SETUP ============ */
  let acTapTimes = [];
  function handleAcTap() {
    const now = Date.now();
    acTapTimes.push(now);
    acTapTimes = acTapTimes.filter((t) => now - t < 2000);
    if (acTapTimes.length >= 5) {
      acTapTimes = [];
      openSetup();
      return; // don't also clear when opening setup
    }
    clearAll();
  }

  /* ============ KEYPAD EVENTS ============ */
  keypad.addEventListener("click", (e) => {
    const btn = e.target.closest(".key");
    if (!btn) return;

    if (btn.dataset.num !== undefined) {
      inputDigit(btn.dataset.num);
      return;
    }

    switch (btn.dataset.action) {
      case "clear": handleAcTap(); break;
      case "negate": negate(); break;
      case "percent": percent(); break;
      case "decimal": inputDecimal(); break;
      case "add": chooseOperator("add"); break;
      case "subtract": chooseOperator("subtract"); break;
      case "multiply": chooseOperator("multiply"); break;
      case "divide": chooseOperator("divide"); break;
      case "equals": handleEquals(); break;
    }
  });

  /* ============ SILENT ALERT TRIGGER ============ */
  function triggerSilentAlert() {
    const settings = getSettings();
    const phone = (settings.contactPhone || "").replace(/[^\d+]/g, "");
    const baseMessage = settings.message || "I need help. This is my current location:";

    if (!navigator.geolocation) {
      sendAlert(phone, baseMessage, null);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const mapsLink = `https://maps.google.com/?q=${pos.coords.latitude},${pos.coords.longitude}`;
        sendAlert(phone, baseMessage, mapsLink);
      },
      () => {
        // Permission denied or unavailable — still send without location.
        sendAlert(phone, baseMessage, null);
      },
      { enableHighAccuracy: true, timeout: 6000 }
    );
  }

  function sendAlert(phone, baseMessage, mapsLink) {
    const fullMessage = mapsLink ? `${baseMessage} ${mapsLink}` : `${baseMessage} (location unavailable)`;

    addHistoryEntry({
      time: new Date().toISOString(),
      contact: getSettings().contactName || "Emergency contact",
      hadLocation: Boolean(mapsLink),
    });

    if (phone) {
      const smsUrl = `sms:${phone}?body=${encodeURIComponent(fullMessage)}`;
      window.location.href = smsUrl;
    }
  }

  /* ============ SETUP VIEW ============ */
  function openSetup() {
    const s = getSettings();
    pinInput.value = s.pin || "";
    contactNameInput.value = s.contactName || "";
    contactPhoneInput.value = s.contactPhone || "";
    messageInput.value = s.message || "I need help. This is my current location:";
    showView(setupView);
  }

  function showView(view) {
    [calculatorView, setupView, historyView, onboardView].forEach((v) => {
      v.hidden = v !== view;
    });
  }

  saveSettingsBtn.addEventListener("click", () => {
    const pin = pinInput.value.trim();
    if (pin.length < 4) {
      showToast("Use a code that's at least 4 digits.");
      return;
    }
    saveSettings({
      pin,
      contactName: contactNameInput.value.trim(),
      contactPhone: contactPhoneInput.value.trim(),
      message: messageInput.value.trim() || "I need help. This is my current location:",
    });
    saveConfirm.classList.add("show");
    setTimeout(() => saveConfirm.classList.remove("show"), 1800);
  });

  setupClose.addEventListener("click", () => {
    clearAll();
    showView(calculatorView);
  });

  viewHistoryBtn.addEventListener("click", () => {
    renderHistory();
    showView(historyView);
  });

  historyBack.addEventListener("click", () => showView(setupView));

  /* ============ HISTORY VIEW ============ */
  function renderHistory() {
    const items = getHistory();
    historyList.innerHTML = "";
    historyEmpty.style.display = items.length ? "none" : "block";
    items.forEach((entry) => {
      const li = document.createElement("li");
      li.className = "history-item";
      const date = new Date(entry.time);
      li.innerHTML = `<strong>Alert sent to ${escapeHtml(entry.contact)}</strong>${date.toLocaleString()} · ${entry.hadLocation ? "Location included" : "Location unavailable"}`;
      historyList.appendChild(li);
    });
  }

  function escapeHtml(str) {
    const div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
  }

  /* ============ ONBOARDING ============ */
  onboardStart.addEventListener("click", () => openSetup());
  onboardSkip.addEventListener("click", () => showView(calculatorView));

  /* ============ TOAST ============ */
  let toastTimer;
  function showToast(msg) {
    toast.textContent = msg;
    toast.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove("show"), 2200);
  }

  /* ============ INIT ============ */
  function init() {
    updateDisplay();
    const settings = getSettings();
    if (!settings.pin) {
      showView(onboardView);
    }
  }

  init();
})();
