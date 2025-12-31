import type { EditorState, ToolType, ShapeStyle } from "./types.js";
import { DrawToolSelector } from "./tool-selector.js";
import { InteractionManager } from "./interaction.js";
import { TextInputOverlay } from "./text-input.js";
import { RenderEngine } from "./renderer.js";
import { CommandStack } from "./commands.js";

export class CanvasEditor {
	private canvas: HTMLCanvasElement;
	private ctx: CanvasRenderingContext2D;
	private renderer: RenderEngine;
	private interaction: InteractionManager;
	private commandStack: CommandStack;
	private toolSelector: DrawToolSelector;
	private textInput: TextInputOverlay;

	private state: EditorState = {
		activeTool: "select" as ToolType,
		activeColor: "#FF0000",
		activeWidth: 3,
		shapes: [],
		selectedShapeId: null,
		isDragging: false,
		dragStart: null,
	};

	private animationFrameId: number | null = null;

	constructor() {
		// Create canvas
		this.canvas = document.createElement("canvas");
		this.canvas.width = document.body.offsetWidth;
		this.canvas.height = document.body.offsetHeight;
		this.canvas.style.cssText = `position: absolute; top: 0; left: 0; cursor: crosshair; touch-action: none; `;
		document.body.appendChild(this.canvas);

		const ctx = this.canvas.getContext("2d");
		if (!ctx) throw new Error("Failed to get 2D context");
		this.ctx = ctx;

		// Initialize components
		this.renderer = new RenderEngine(this.canvas, this.ctx);
		this.commandStack = new CommandStack();
		this.textInput = new TextInputOverlay();

		// Create tool selector
		this.toolSelector = new DrawToolSelector();
		document.body.appendChild(this.toolSelector);

		// Setup interaction manager
		this.interaction = new InteractionManager(
			this.canvas,
			this.state.shapes,
			this.commandStack,
			() => this.invalidate(),
			(x, y, callback) => this.textInput.show(x, y, callback),
			() => this.state.activeTool,
			() => this.getActiveStyle(),
			() => this.state.selectedShapeId,
			(id) => (this.state.selectedShapeId = id)
		);

		this.attachToolSelectorEvents();
		this.startRenderLoop();
	}

	private attachToolSelectorEvents(): void {
		this.toolSelector.addEventListener("toolchange", ((e: CustomEvent) => {
			this.state.activeTool = e.detail;
			this.updateCursor();
		}) as EventListener);

		this.toolSelector.addEventListener("colorchange", ((e: CustomEvent) => {
			this.state.activeColor = e.detail;
		}) as EventListener);

		this.toolSelector.addEventListener("widthchange", ((e: CustomEvent) => {
			this.state.activeWidth = e.detail;
		}) as EventListener);
	}

	private updateCursor(): void {
		const cursors: Record<ToolType, string> = {
			select: "default",
			line: "crosshair",
			rect: "crosshair",
			circle: "crosshair",
			highlighter: "crosshair",
			blur: "crosshair",
			pen: "crosshair",
			arrow: "crosshair",
			text: "text",
		};
		this.canvas.style.cursor = cursors[this.state.activeTool] || "crosshair";
	}

	private getActiveStyle(): ShapeStyle {
		return {
			strokeColor: this.state.activeColor,
			strokeWidth: this.state.activeWidth,
			blur: 20, // For blur shapes
		};
	}

	private invalidate(): void {
		this.renderer.invalidate();
	}

	private startRenderLoop(): void {
		const render = () => {
			this.renderer.render(this.state.shapes, this.state.selectedShapeId);
			this.animationFrameId = requestAnimationFrame(render);
		};
		render();
	}

	/** Export shapes as JSON */
	exportShapes(): string {
		const serialized = this.state.shapes.map((s) => s.serialize());
		return JSON.stringify(serialized, null, 2);
	}

	/** Clear all shapes */
	clear(): void {
		this.state.shapes = [];
		this.state.selectedShapeId = null;
		this.commandStack.clear();
		this.invalidate();
	}

	/** Resize canvas */
	resize(width: number, height: number): void {
		this.renderer.resize(width, height);
	}

	/** Get canvas as data URL */
	toDataURL(type = "image/png"): string {
		return this.canvas.toDataURL(type);
	}

	/** Cleanup */
	destroy(): void {
		this.animationFrameId && cancelAnimationFrame(this.animationFrameId);
		this.interaction.detach();
		this.textInput.hide();
		this.canvas.remove();
		this.toolSelector.remove();
	}
}
