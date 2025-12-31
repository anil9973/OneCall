var __getOwnPropNames = Object.getOwnPropertyNames;
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var require_reset = __commonJS({
  "scripts/utils/reset.ts"(exports) {
    globalThis.aiPlatform = location.host;
    globalThis.eId = document.getElementById.bind(document);
    globalThis.$on = (target, type, callback) => target.addEventListener(type, callback);
    globalThis.$ = (selector, scope) => (scope || document).querySelector(selector);
    globalThis.fireEvent = (target, eventName, detail) => target.dispatchEvent(detail ? new CustomEvent(eventName, { detail }) : new CustomEvent(eventName));
    globalThis.i18n = chrome.i18n.getMessage.bind(exports);
    globalThis.setLang = (key) => eId(key).textContent = chrome.i18n.getMessage(key);
    globalThis.getStore = chrome.storage.local.get.bind(chrome.storage.local);
    globalThis.setStore = chrome.storage.local.set.bind(chrome.storage.local);
    const snackbar = document.createElement("om-snackbar");
    const insertToast = () => document.body.appendChild(snackbar);
    globalThis.toast = (msg, isErr) => {
      snackbar.className = isErr ? "error" : "";
      snackbar.hidden = false;
      snackbar.innerText = msg;
      setTimeout(() => snackbar.hidden = true, 5100);
    };
    document.readyState === "loading" ? document.addEventListener("load", insertToast) : insertToast();
  }
});
export default require_reset();
