import { injectCallWidget, registerFloatingCallButton } from "./utils.js";
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type)
    return;
  if (message.request === "INJECT_CALL_WIDGET")
    injectCallWidget(sender.tab?.id);
});
chrome.runtime.onInstalled.addListener(async () => {
  console.log("OneCall installed");
  registerFloatingCallButton();
});
chrome.runtime.onStartup.addListener(async () => {
});
console.log("OneCall Service Worker initialized");
