import { EngineToWidgetToolAction, WidgetToEngineAction } from "../shared/protocol.js";
import { injectFuncScript } from "../background/utils.js";
import { injectActiveCaller } from "../scripts/func-script.js";
import { ConversationManager } from "./conversation/Manager.js";
import { ScreenRecorder } from "./utils/screen-recording.js";
import { WebsiteDetector } from "./utils/website-detector.js";
const conversationManagers = /* @__PURE__ */ new Map();
const detector = new WebsiteDetector();
let screenRecorder = null;
function getManager(tabId) {
  const manager = conversationManagers.get(tabId);
  if (manager)
    return manager;
  throw new Error(`No ConversationManager found for tabId ${tabId}`);
}
async function checkMicPermission() {
  try {
    const status = await navigator.permissions.query({ name: "microphone" });
    status.state === "prompt" ? await navigator.mediaDevices.getUserMedia({ audio: true }) : console.log(status);
  } catch {
    return "unsupported";
  }
}
const handlers = {
  [WidgetToEngineAction.START_CALL]: async (message, tabId) => {
    if (conversationManagers.has(tabId))
      return console.log(`Conversation already running for tabId ${tabId}`);
    const websiteType = await detector.detect(message.url);
    const pageContext = await chrome.tabs.sendMessage(tabId, { type: EngineToWidgetToolAction.GET_PAGE_CONTEXT });
    pageContext.location.websiteType = websiteType;
    const manager = new ConversationManager({ id: tabId, url: message });
    manager.startConversation(pageContext);
    await checkMicPermission();
    conversationManagers.set(tabId, manager);
  },
  SHOW_ONGOING_CALL_WIDGET: async (_, tabId) => {
    if (!conversationManagers.has(tabId))
      return;
    await injectFuncScript(injectActiveCaller, tabId);
  },
  [WidgetToEngineAction.END_CALL]: async (_, tabId) => {
    if (!conversationManagers.has(tabId))
      return;
    const manager = getManager(tabId);
    await manager.endConversation();
    conversationManagers.delete(tabId);
  },
  [WidgetToEngineAction.UPDATE_VOLUME]: async (message) => {
    const manager = getManager(message.tabId);
    return manager.setVolume(message.volume);
  },
  [WidgetToEngineAction.TOGGLE_MIC_MUTE]: async (message) => {
    const manager = getManager(message.tabId);
    return manager.setMicMuted(message.isMuted);
  },
  [WidgetToEngineAction.SEND_CONTEXT_UPDATE]: async (message) => {
    const manager = getManager(message.tabId);
    return manager.sendContextualUpdate(message.context);
  },
  [WidgetToEngineAction.SEND_USER_MESSAGE]: async (message) => {
    const manager = getManager(message.tabId);
    return manager.sendUserMessage(message.text);
  },
  [WidgetToEngineAction.CAPTURE_SCREENSHOT]: async (request, sender) => {
    const { Screenshoter } = await import("./utils/screenshot.js");
    new Screenshoter(request.coordinate, request.screenHeight, sender.tab?.id).captureAndUpload(request);
  },
  [WidgetToEngineAction.START_SCREEN_RECORDING]: () => {
    screenRecorder = new ScreenRecorder();
    screenRecorder.start();
  },
  [WidgetToEngineAction.STOP_RECORDING]: () => {
    screenRecorder.stop();
    screenRecorder = null;
  }
};
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message === "CALL_ENGINE_PING")
    sendResponse("pong");
  const handler = handlers[message.type];
  if (handler) {
    handler(message, sender.tab?.id)?.then(sendResponse).catch((err) => {
      console.error(err);
      sendResponse({ errCaused: err.message });
    });
    return true;
  }
});
chrome.tabs.onRemoved.addListener(async (tabId) => {
  handlers.END_CALL(null, tabId);
});
console.log("[OneCall]  Engine initialised");
