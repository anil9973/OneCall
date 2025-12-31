import { $on, $onO, overLay } from "./crop-box.js";
const bodyWidth = document.body.scrollWidth;
const bodyHeight = Math.max(document.body.scrollHeight, document.documentElement.scrollHeight);
const moverFuncs = {
  top: ({ pageY }) => {
    overLay.style.borderTopWidth = `${pageY}px`;
  },
  right: ({ pageX }) => {
    overLay.style.borderRightWidth = `${bodyWidth - pageX}px`;
  },
  bottom: ({ pageY }) => {
    overLay.style.borderBottomWidth = `${bodyHeight - pageY}px`;
  },
  left: ({ pageX }) => {
    overLay.style.borderLeftWidth = `${pageX}px`;
  },
  "top-left": ({ pageX, pageY }) => {
    overLay.style.borderTopWidth = `${pageY}px`;
    overLay.style.borderLeftWidth = `${pageX}px`;
  },
  "top-right": ({ pageX, pageY }) => {
    overLay.style.borderRightWidth = `${bodyWidth - pageX}px`;
    overLay.style.borderTopWidth = `${pageY}px`;
  },
  "bottom-left": ({ pageX, pageY }) => {
    overLay.style.borderBottomWidth = `${bodyHeight - pageY}px`;
    overLay.style.borderLeftWidth = `${pageX}px`;
  },
  "bottom-right": ({ pageX, pageY }) => {
    overLay.style.borderRightWidth = `${bodyWidth - pageX}px`;
    overLay.style.borderBottomWidth = `${bodyHeight - pageY}px`;
  },
  "view-box": ({ pageX, pageY }) => {
    overLay.style.borderTopWidth = `${downTopWidth - (downMY - pageY)}px`;
    overLay.style.borderBottomWidth = `${downBottomWidth + (downMY - pageY)}px`;
    overLay.style.borderRightWidth = `${downRightWidth + (downMX - pageX)}px`;
    overLay.style.borderLeftWidth = `${downLeftWidth - (downMX - pageX)}px`;
  }
};
function startSelector(className) {
  const cropListener = moverFuncs[className];
  $on(document.body, "mousemove", cropListener);
  $on(overLay.firstElementChild, "mousedown", setResizer);
  $onO(window, "mouseup", () => {
    document.body.removeEventListener("mousemove", cropListener);
    overLay.style.cursor = "default";
    overLay.lastElementChild.hidden = false;
  });
}
let downMY = 0;
let downMX = 0;
let downTopWidth = 0;
let downRightWidth = 0;
let downBottomWidth = 0;
let downLeftWidth = 0;
function setResizer(ev) {
  const target = ev.target;
  if (!target) return;
  const { pageX, pageY } = ev;
  downMY = pageY;
  downMX = pageX;
  downTopWidth = parseFloat(overLay.style.borderTopWidth) || 0;
  downRightWidth = parseFloat(overLay.style.borderRightWidth) || 0;
  downBottomWidth = parseFloat(overLay.style.borderBottomWidth) || 0;
  downLeftWidth = parseFloat(overLay.style.borderLeftWidth) || 0;
  startSelector(target.className);
}
export {
  setResizer,
  startSelector
};
