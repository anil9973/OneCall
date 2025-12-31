import { overLay } from "./crop-box.js";
async function captureShot(resolve, reject, ev) {
  try {
    let msgListener = function(message) {
      if (message?.request === "scroll")
        scrollBy({ top: message.top, behavior: "instant" });
    };
    const currentTarget = ev.currentTarget;
    const viewBox = overLay.firstElementChild;
    const rect0 = viewBox.getBoundingClientRect();
    const screenHeight = innerHeight;
    const withinViewPort = rect0.height <= screenHeight;
    if (rect0.y < 0)
      viewBox.scrollIntoView();
    if (!withinViewPort) {
      const header = document.querySelector("header");
      fixStickyPosition(header) || fixStickyPosition(header?.firstElementChild);
      const nav = document.querySelector("nav");
      fixStickyPosition(nav) || fixStickyPosition(nav?.firstElementChild);
      const aside = document.querySelector("aside");
      fixStickyPosition(aside) || fixStickyPosition(aside?.firstElementChild);
    }
    const rect = viewBox.getBoundingClientRect();
    const coordinate = {
      x: rect.x + 2,
      y: rect.y,
      width: rect.width - 2,
      height: rect.height
    };
    overLay.hidden = true;
    await new Promise((r) => setTimeout(r, 5));
    chrome.runtime.onMessage.addListener(msgListener);
    const requestMsg = { type: "CAPTURE_SCREENSHOT", coordinate, screenHeight, withinViewPort };
    const response = await chrome.runtime.sendMessage(requestMsg);
    if (response.errCaused) {
      chrome.runtime.onMessage.removeListener(msgListener);
      return reject(response.errCaused);
    }
    resolve({ blobArray: response.blobArray });
    setTimeout(() => document.querySelector("shot-cropper")?.remove(), 8e3);
    chrome.runtime.onMessage.removeListener(msgListener);
  } catch (error) {
    reject(error);
  }
}
function fixStickyPosition(elem) {
  if (!elem)
    return true;
  const styleMap = elem.computedStyleMap();
  const isStatic = styleMap.get("position")?.toString() === "static";
  isStatic || (elem.style.position = "static");
  return !isStatic;
}
function toast(msg, isErr = false) {
  const snackbar = overLay.nextElementSibling;
  if (!snackbar)
    return;
  snackbar.className = isErr ? "error" : "";
  snackbar.hidden = false;
  snackbar.textContent = msg;
  setTimeout(() => snackbar.hidden = true, 5100);
}
export {
  captureShot
};
