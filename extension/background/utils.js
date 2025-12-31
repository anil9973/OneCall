import { injectActiveCaller } from "../scripts/func-script.js";
const crtTab = async () => (await chrome.tabs.query({ currentWindow: true, active: true }))[0];
async function injectCallWidget(tabId) {
  await insertCallEngineTab();
  await injectFuncScript(injectActiveCaller, tabId);
}
async function insertCallEngineTab() {
  const ENGINE_URL = chrome.runtime.getURL("engine/call-engine.html");
  try {
    const response = await chrome.runtime.sendMessage("CALL_ENGINE_PING");
    response || await createTab();
  } catch (error) {
    await createTab();
  }
  async function createTab() {
    (await chrome.tabs.create({ url: ENGINE_URL, index: 0, active: false })).id;
    await new Promise((r) => setTimeout(r, 200));
  }
}
async function registerFloatingCallButton() {
  try {
    const store = await chrome.storage.local.get(["matchPatterns", "excludePatterns"]);
    const matches = store.matchPatterns || ["http://*/*", "https://www.amazon.in/*"];
    const excludeMatches = store.excludePatterns || [];
    const SCRIPT_ID = "onecall-floating-button";
    await chrome.scripting.registerContentScripts([
      {
        id: SCRIPT_ID,
        js: ["scripts/floating-phone/floating-button.js"],
        matches,
        excludeMatches,
        runAt: "document_idle"
      }
    ]);
    console.log(`[OneCall] Registered floating button`);
  } catch (err) {
    console.error("[OneCall] Failed to register content script", err);
  }
}
async function injectFuncScript(func, ...args) {
  const tab = await crtTab();
  if (!tab)
    return;
  if (!tab.url?.startsWith("http"))
    return;
  try {
    const results = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func,
      args
    });
    return results[0]?.result;
  } catch (error) {
    console.warn(error);
  }
}
export {
  crtTab,
  injectCallWidget,
  injectFuncScript,
  insertCallEngineTab,
  registerFloatingCallButton
};
