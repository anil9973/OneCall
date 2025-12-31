import { ToolType } from "./types.js";
import { html } from "../../../lib/om.compact.js";
import styles from "./tool-selector.css" with { type: "css" };
class DrawToolSelector extends HTMLElement {
  shadow;
  activeTool = ToolType.SELECT;
  activeColor = "#FF0000";
  strokeWidth = 3;
  constructor() {
    super();
    this.shadow = this.attachShadow({ mode: "open" });
  }
  async connectedCallback() {
    this.popover = "manual";
    this.shadow = this.attachShadow({ mode: "open" });
    this.shadow.adoptedStyleSheets = [styles];
    this.shadow.replaceChildren(this.render());
    this.attachEventListeners();
    this.showPopover();
    chrome.runtime.sendMessage("START_SCREEN_RECORDING");
  }
  render() {
    const SHAPE_TOOLS = [ToolType.RECTANGLE, ToolType.CIRCLE, "triangle", ToolType.BLUR];
    const LINE_TOOLS = [ToolType.LINE, ToolType.ARROW, ToolType.DUAL_ARROW];
    const selectedShape = ToolType.RECTANGLE;
    const selectedLIne = "line";
    const docFrag = html`<div class="tools-row">
				<button title="Cursor" data-tool="${ToolType.SELECT}">
					<svg class="cursor" viewBox="0 0 24 24"><path /></svg>
				</button>

				<button title="pen" data-tool="${ToolType.PEN}">
					<svg class="pen" viewBox="0 0 24 24"><path /></svg>
				</button>

				<button title="highlighter" data-tool="${ToolType.HIGHLIGHTER}">
					<svg class="highlighter" viewBox="0 0 512 512"><path /></svg>
				</button>

				<button title="text" data-tool="${ToolType.TEXT}">
					<svg class="text" viewBox="0 0 24 24"><path /></svg>
				</button>

				<div tabindex="0" class="color-picker">
					<span></span>
					<color-selector></color-selector>
				</div>
			</div>
			<progress class="stroke-width" hidden></progress>`;
    docFrag.querySelector("button")?.after(new CanvasToolGroup(SHAPE_TOOLS, selectedShape), new CanvasToolGroup(LINE_TOOLS, selectedLIne));
    return docFrag;
  }
  attachEventListeners() {
    const toolButtons = this.shadow.querySelectorAll("button");
    toolButtons.forEach((btn) => btn.addEventListener("click", this.handleToolClick));
    const colorPicker = this.shadow.querySelector(".color-picker");
    colorPicker?.addEventListener("input", (e) => {
      this.activeColor = e.target.value;
      this.dispatchEvent(new CustomEvent("colorchange", { detail: this.activeColor }));
    });
    const widthSlider = this.shadow.querySelector('input[type="range"]');
    const widthDisplay = this.shadow.querySelector(".stroke-width-wrapper span");
    widthSlider?.addEventListener("input", (e) => {
      this.strokeWidth = parseInt(e.target.value);
      if (widthDisplay)
        widthDisplay.textContent = `${this.strokeWidth}px`;
      this.dispatchEvent(new CustomEvent("widthchange", { detail: this.strokeWidth }));
    });
    document.addEventListener("keydown", (e) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement)
        return;
      const shortcuts = {
        v: ToolType.SELECT,
        l: ToolType.LINE,
        r: ToolType.RECTANGLE,
        b: ToolType.BLUR,
        p: ToolType.PEN,
        a: ToolType.ARROW,
        t: ToolType.TEXT
      };
      const tool = shortcuts[e.key.toLowerCase()];
      tool && this.setActiveTool(tool);
    });
  }
  handleToolClick = (e) => {
    const btn = e.currentTarget;
    const tool = btn.dataset.tool;
    this.setActiveTool(tool);
  };
  setActiveTool(tool) {
    this.activeTool = tool;
    const toolButtons = this.shadow.querySelectorAll(".tool-btn");
    toolButtons.forEach((btn) => {
      btn.getAttribute("data-tool") === tool ? btn.classList.add("active") : btn.classList.remove("active");
    });
    this.dispatchEvent(new CustomEvent("toolchange", { detail: tool }));
  }
  getActiveTool() {
    return this.activeTool;
  }
  getActiveColor() {
    return this.activeColor;
  }
  getStrokeWidth() {
    return this.strokeWidth;
  }
}
DrawToolSelector = customElements.define("canvas-draw-tool-selector", DrawToolSelector);
class CanvasToolGroup extends HTMLElement {
  constructor(tools, selectedTool) {
    super();
    this.tools = tools;
    this.selectedTool = selectedTool;
  }
  render() {
    const item = (tool) => html`<li>
				<button title="${tool}" data-tool="${tool}"><svg class="${tool}" viewBox="0 0 24 24"><path /></svg></button>
			</li>`;
    return html`<button title="${this.selectedTool}" data-tool="${this.selectedTool}">
				<svg class="${this.selectedTool}" viewBox="0 0 24 24"><path /></svg>
			</button>
			<menu> ${this.tools.map(item)} </menu>`;
  }
  connectedCallback(tools, selectedTool) {
    this.tools = tools;
    this.selectedTool = selectedTool;
    this.tabIndex = 0;
    this.tabIndex = 0;
    this.replaceChildren(this.render());
  }
}
CanvasToolGroup = customElements.define("canvas-tool-group", CanvasToolGroup);
class ColorSelector extends HTMLElement {
  constructor() {
    super();
  }
  pickColor(event) {
  }
  render() {
    return [...Array(48)].map((_, index) => `<var style="--hue:${index * 7}"></var>`).join("");
  }
  connectedCallback() {
    this.innerHTML = this.render();
    this.addEventListener("pointerdown", this.pickColor.bind(this));
  }
}
ColorSelector = customElements.define("color-selector", ColorSelector);
export {
  CanvasToolGroup,
  DrawToolSelector
};
