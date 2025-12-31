import { ToolType } from "./types.js";
import { html } from "../../../lib/om.compact.js";
import styles from './tool-selector.css' with { type: 'css' };

export class DrawToolSelector extends HTMLElement {
	private shadow: ShadowRoot;
	private activeTool: ToolType = ToolType.SELECT;
	private activeColor = "#FF0000";
	private strokeWidth = 3;

	constructor() {
		super();
		this.shadow = this.attachShadow({ mode: "open" });
	}

	async connectedCallback(){
		this.popover = "manual"
		this.shadow = this.attachShadow({ mode: "open" });
		this.shadow.adoptedStyleSheets = [styles];
		this.shadow.replaceChildren(this.render());
		this.attachEventListeners();
		this.showPopover()
		// Temp
		chrome.runtime.sendMessage("START_SCREEN_RECORDING")
	}

	private render(): DocumentFragment {
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
			
		docFrag
			.querySelector("button")
			?.after(new CanvasToolGroup(SHAPE_TOOLS, selectedShape), new CanvasToolGroup(LINE_TOOLS, selectedLIne));
		return docFrag;
	}

	private attachEventListeners(): void {
		const toolButtons = this.shadow.querySelectorAll("button");
		toolButtons.forEach((btn) => btn.addEventListener("click", this.handleToolClick));

		const colorPicker = this.shadow.querySelector(".color-picker") as HTMLInputElement;
		colorPicker?.addEventListener("input", (e) => {
			this.activeColor = (e.target as HTMLInputElement).value;
			this.dispatchEvent(new CustomEvent("colorchange", { detail: this.activeColor }));
		});

		const widthSlider = this.shadow.querySelector('input[type="range"]') as HTMLInputElement;
		const widthDisplay = this.shadow.querySelector(".stroke-width-wrapper span");

		widthSlider?.addEventListener("input", (e) => {
			this.strokeWidth = parseInt((e.target as HTMLInputElement).value);
			if (widthDisplay) widthDisplay.textContent = `${this.strokeWidth}px`;

			this.dispatchEvent(new CustomEvent("widthchange", { detail: this.strokeWidth }));
		});

		// Keyboard shortcuts
		document.addEventListener("keydown", (e) => {
			if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

			const shortcuts: Record<string, ToolType> = {
				v: ToolType.SELECT,
				l: ToolType.LINE,
				r: ToolType.RECTANGLE,
				b: ToolType.BLUR,
				p: ToolType.PEN,
				a: ToolType.ARROW,
				t: ToolType.TEXT,
			};

			const tool = shortcuts[e.key.toLowerCase()];
			tool && this.setActiveTool(tool);
		});
	}

	private handleToolClick = (e: Event): void => {
		const btn = e.currentTarget as HTMLButtonElement;
		const tool = btn.dataset.tool as ToolType;
		this.setActiveTool(tool);
	};

	private setActiveTool(tool: ToolType): void {
		this.activeTool = tool;

		const toolButtons = this.shadow.querySelectorAll(".tool-btn");
		toolButtons.forEach((btn) => {
			btn.getAttribute("data-tool") === tool ? btn.classList.add("active") : btn.classList.remove("active");
		});

		this.dispatchEvent(new CustomEvent("toolchange", { detail: tool }));
	}

	getActiveTool(): ToolType {
		return this.activeTool;
	}

	getActiveColor(): string {
		return this.activeColor;
	}

	getStrokeWidth(): number {
		return this.strokeWidth;
	}
}

//@ts-ignore
DrawToolSelector = customElements.define("canvas-draw-tool-selector", DrawToolSelector);

export class CanvasToolGroup extends HTMLElement {
	constructor(private tools: string[], private selectedTool: string) {
		super();
	}

	render(): DocumentFragment {
		const item = (tool: string) =>
			html`<li>
				<button title="${tool}" data-tool="${tool}"><svg class="${tool}" viewBox="0 0 24 24"><path /></svg></button>
			</li>`;
		return html`<button title="${this.selectedTool}" data-tool="${this.selectedTool}">
				<svg class="${this.selectedTool}" viewBox="0 0 24 24"><path /></svg>
			</button>
			<menu> ${this.tools.map(item)} </menu>`;
	}

	connectedCallback(tools: string[], selectedTool: string): void {
		this.tools = tools;
		this.selectedTool = selectedTool;
		this.tabIndex = 0;
		this.tabIndex = 0;
		this.replaceChildren(this.render());
	}
}

//@ts-ignore
CanvasToolGroup = customElements.define("canvas-tool-group", CanvasToolGroup);

class ColorSelector extends HTMLElement {
	constructor() {
		super();
	}

	pickColor(event: PointerEvent) {
		// event.stopImmediatePropagation();
		// //prettier-ignore
		// getSelection().setBaseAndExtent(this.range.startContainer, this.range.startOffset, this.range.endContainer, this.range.endOffset);
		// const hue = event.target.style.getPropertyValue("--hue");
		// const color = this.id === "backColor" ? `hsl(${hue} 70% 30%)` : `hsl(${hue} 90% 50%)`;
		// document.execCommand(this.id, null, color);
	}

	render() {
		return [...Array(48)].map((_, index) => `<var style="--hue:${index * 7}"></var>`).join("");
	}

	connectedCallback() {
		this.innerHTML = this.render();
		this.addEventListener("pointerdown", this.pickColor.bind(this));
	}
}

//@ts-ignore
ColorSelector = customElements.define("color-selector", ColorSelector);
