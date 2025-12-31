import { setResizer, startSelector } from "./crop-selector.js";
import { captureShot } from "./crop-action.js";
import cropCss from "./shot-cropper.css" with { type: "css" };
const $on = (target, type, callback) => target.addEventListener(type, callback);
const $onO = (target, type, callback) => target.addEventListener(type, callback, { once: true });
function cropUi() {
  return `
	<article class="overlay">
		<div class="view-box">
			<span class="top-left"></span>
			<span class="top-right"></span>
			<span class="bottom-left"></span>
			<span class="bottom-right"></span>
			<var class="left"></var>
			<var class="top"></var>
			<var class="right"></var>
			<var class="bottom"></var>
		</div>
		<div class="crop-action-wrapper" hidden>
			<div class="crop-action">
				<button class="capture">\u2702\uFE0F Capture</button>
				<button>
					<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
						<path fill="red" d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z"/>
					</svg>
				</button>
			</div>
		</div>
	</article>
	<output hidden></output>`;
}
let overLay;
async function createCropUI() {
  const shotCropper = document.createElement("shot-cropper");
  const shadow = shotCropper.attachShadow({ mode: "open" });
  shadow.adoptedStyleSheets = [cropCss];
  shadow.innerHTML = cropUi();
  setInitialData(shotCropper);
  document.body.appendChild(shotCropper);
  return new Promise((resolve, reject) => {
    $onO(document.body, "mousedown", setOverLaySdw);
    $onO(document.body, "mouseup", setCropActionListener.bind(null, resolve, reject));
  });
}
function setInitialData(shotCropper) {
  const bodyHeight = Math.max(document.body.scrollHeight, document.documentElement.scrollHeight);
  overLay = shotCropper.shadowRoot.firstElementChild;
  overLay.style.bottom = innerHeight - bodyHeight + "px";
  overLay.style.borderBottomWidth = bodyHeight + "px";
  overLay.style.cursor = "crosshair";
}
function setOverLaySdw(ev) {
  const { pageX, pageY } = ev;
  const bdrRight = document.body.offsetWidth - pageX;
  const bodyHeight = document.body.scrollHeight;
  overLay.style.borderWidth = `${pageY}px ${bdrRight}px ${bodyHeight}px ${pageX}px`;
  const viewBox = overLay.firstElementChild;
  viewBox.style.visibility = "visible";
  $on(viewBox, "mousedown", setResizer);
  startSelector("bottom-right");
}
function setCropActionListener(resolve, reject) {
  getSelection()?.collapseToEnd();
  const wrapper = overLay.lastElementChild;
  const cropAction = wrapper.firstElementChild;
  const captureBtn = cropAction.firstElementChild;
  const closeBtn = cropAction.lastElementChild;
  $on(captureBtn, "click", captureShot.bind(null, resolve, reject));
  $on(closeBtn, "click", () => (overLay.remove(), resolve(void 0)));
}
export {
  $on,
  $onO,
  createCropUI,
  overLay
};
