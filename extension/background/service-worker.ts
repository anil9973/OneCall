import { injectCallWidget, registerFloatingCallButton } from "./utils.js";

/** Handle messages from content scripts and offscreen */
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
	if (message.type) return;
	if (message.request === "INJECT_CALL_WIDGET") injectCallWidget(sender.tab?.id);
});

/** Handle extension installation */
chrome.runtime.onInstalled.addListener(async () => {
	console.log("OneCall installed");
	registerFloatingCallButton();
});

/** Handle extension startup */
chrome.runtime.onStartup.addListener(async () => {});

console.log("OneCall Service Worker initialized");
