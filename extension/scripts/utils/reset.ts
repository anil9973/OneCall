globalThis.aiPlatform = location.host;
globalThis.eId = document.getElementById.bind(document);
globalThis.$on = (target, type, callback) => target.addEventListener(type, callback);

// Get element by CSS selector:
globalThis.$ = (selector, scope) => (scope || document).querySelector(selector);

//dispatch new event
globalThis.fireEvent = (/** @type {HTMLElement} */ target, /** @type {string} */ eventName, detail) =>
	target.dispatchEvent(detail ? new CustomEvent(eventName, { detail }) : new CustomEvent(eventName));

/**@type {chrome.i18n.getMessage} */
globalThis.i18n = chrome.i18n.getMessage.bind(this);
globalThis.setLang = (/** @type {string} */ key) => (eId(key).textContent = chrome.i18n.getMessage(key));

/**@type {chrome.storage.LocalStorageArea['get']} */
globalThis.getStore = chrome.storage.local.get.bind(chrome.storage.local);
/**@type {chrome.storage.LocalStorageArea['set']} */
globalThis.setStore = chrome.storage.local.set.bind(chrome.storage.local);

const snackbar = document.createElement("om-snackbar");
const insertToast = () => document.body.appendChild(snackbar);
globalThis.toast = (msg, isErr) => {
	snackbar.className = isErr ? "error" : "";
	snackbar.hidden = false;
	snackbar.innerText = msg;
	setTimeout(() => (snackbar.hidden = true), 5100);
};

document.readyState === "loading" ? document.addEventListener("load", insertToast) : insertToast();
