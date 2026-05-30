(function (global) {
  const HOST_CLASS = "sgfip-toast-host";
  let host = null;
  let stylesInjected = false;

  function injectStyles() {
    if (stylesInjected) return;
    stylesInjected = true;
    const style = document.createElement("style");
    style.textContent = `
      .${HOST_CLASS} {
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 10000;
        display: flex;
        flex-direction: column;
        gap: 10px;
        max-width: min(380px, calc(100vw - 40px));
        pointer-events: none;
      }
      .sgfip-toast {
        pointer-events: auto;
        display: flex;
        align-items: flex-start;
        gap: 12px;
        padding: 14px 16px;
        background: rgba(255, 255, 255, 0.95);
        backdrop-filter: blur(12px);
        -webkit-backdrop-filter: blur(12px);
        border-radius: 12px;
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(0, 0, 0, 0.04);
        border-left: 4px solid #2d5f8a;
        font-family: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
        font-size: 13px;
        line-height: 1.5;
        color: #1e293b;
        opacity: 0;
        transform: translateX(16px);
        transition: opacity 0.3s cubic-bezier(0.16, 1, 0.3, 1), transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
      }
      .sgfip-toast--visible {
        opacity: 1;
        transform: translateX(0);
      }
      .sgfip-toast--success { border-left-color: #16a34a; }
      .sgfip-toast--error { border-left-color: #dc2626; }
      .sgfip-toast--warning { border-left-color: #b45309; }
      .sgfip-toast--info { border-left-color: #2d5f8a; }
      .sgfip-toast__icon {
        flex-shrink: 0;
        width: 24px;
        height: 24px;
        border-radius: 8px;
        display: grid;
        place-items: center;
        font-size: 13px;
        font-weight: 700;
        font-family: "Inter", sans-serif;
      }
      .sgfip-toast--success .sgfip-toast__icon { background: #e8f5e9; color: #16a34a; }
      .sgfip-toast--error .sgfip-toast__icon { background: #fef2f2; color: #dc2626; }
      .sgfip-toast--warning .sgfip-toast__icon { background: #fef3c7; color: #b45309; }
      .sgfip-toast--info .sgfip-toast__icon { background: #e3f2fd; color: #2d5f8a; }
      .sgfip-toast__body { flex: 1; min-width: 0; }
      .sgfip-toast__close {
        flex-shrink: 0;
        border: none;
        background: transparent;
        color: #94a3b8;
        cursor: pointer;
        padding: 2px 6px;
        border-radius: 6px;
        font-size: 18px;
        line-height: 1;
        transition: color 0.15s ease, background 0.15s ease;
      }
      .sgfip-toast__close:hover { background: #f1f5f9; color: #475569; }
      @media (prefers-reduced-motion: reduce) {
        .sgfip-toast { transition: opacity 0.15s ease; transform: none; }
        .sgfip-toast--visible { transform: none; }
      }
    `;
    document.head.appendChild(style);
  }

  function ensureHost() {
    injectStyles();
    if (!host) {
      host = document.createElement("div");
      host.className = HOST_CLASS;
      host.setAttribute("aria-live", "polite");
      document.body.appendChild(host);
    }
    return host;
  }

  const ICONS = {
    success: "✓",
    error: "!",
    warning: "‼",
    info: "i"
  };

  function dismiss(el) {
    if (!el || !el.parentNode) return;
    el.classList.remove("sgfip-toast--visible");
    setTimeout(() => el.remove(), 280);
  }

  function showToast(message, type, options) {
    if (!message) return;
    const opts = options || {};
    const t = ["success", "error", "warning", "info"].includes(type) ? type : "info";
    const duration =
      typeof opts.duration === "number"
        ? opts.duration
        : t === "error"
          ? 6500
          : 4200;

    const h = ensureHost();
    const el = document.createElement("div");
    el.className = "sgfip-toast sgfip-toast--" + t;
    el.setAttribute("role", t === "error" ? "alert" : "status");

    const icon = document.createElement("span");
    icon.className = "sgfip-toast__icon";
    icon.setAttribute("aria-hidden", "true");
    icon.textContent = ICONS[t] || ICONS.info;

    const body = document.createElement("div");
    body.className = "sgfip-toast__body";
    body.textContent = message;

    const close = document.createElement("button");
    close.type = "button";
    close.className = "sgfip-toast__close";
    close.setAttribute("aria-label", "Cerrar");
    close.innerHTML = "&times;";

    el.appendChild(icon);
    el.appendChild(body);
    el.appendChild(close);
    h.appendChild(el);

    requestAnimationFrame(() => el.classList.add("sgfip-toast--visible"));

    let timer = setTimeout(() => dismiss(el), duration);
    close.addEventListener("click", () => {
      clearTimeout(timer);
      dismiss(el);
    });
  }

  global.showToast = showToast;
})(typeof window !== "undefined" ? window : this);
