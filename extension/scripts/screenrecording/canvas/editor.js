import { DrawToolSelector } from "./tool-selector.js";
import { InteractionManager } from "./interaction.js";
import { TextInputOverlay } from "./text-input.js";
import { RenderEngine } from "./renderer.js";
import { CommandStack } from "./commands.js";
class CanvasEditor {
  canvas;
  ctx;
  renderer;
  interaction;
  commandStack;
  toolSelector;
  textInput;
  state = {
    activeTool: "select",
    activeColor: "#FF0000",
    activeWidth: 3,
    shapes: [],
    selectedShapeId: null,
    isDragging: false,
    dragStart: null
  };
  animationFrameId = null;
  constructor() {
    this.canvas = document.createElement("canvas");
    this.canvas.width = document.body.offsetWidth;
    this.canvas.height = document.body.offsetHeight;
    this.canvas.style.cssText = `position: absolute; top: 0; left: 0; cursor: crosshair; touch-action: none; `;
    document.body.appendChild(this.canvas);
    const ctx = this.canvas.getContext("2d");
    if (!ctx)
      throw new Error("Failed to get 2D context");
    this.ctx = ctx;
    this.renderer = new RenderEngine(this.canvas, this.ctx);
    this.commandStack = new CommandStack();
    this.textInput = new TextInputOverlay();
    this.toolSelector = new DrawToolSelector();
    document.body.appendChild(this.toolSelector);
    this.interaction = new InteractionManager(
      this.canvas,
      this.state.shapes,
      this.commandStack,
      () => this.invalidate(),
      (x, y, callback) => this.textInput.show(x, y, callback),
      () => this.state.activeTool,
      () => this.getActiveStyle(),
      () => this.state.selectedShapeId,
      (id) => this.state.selectedShapeId = id
    );
    this.attachToolSelectorEvents();
    this.startRenderLoop();
  }
  attachToolSelectorEvents() {
    this.toolSelector.addEventListener("toolchange", (e) => {
      this.state.activeTool = e.detail;
      this.updateCursor();
    });
    this.toolSelector.addEventListener("colorchange", (e) => {
      this.state.activeColor = e.detail;
    });
    this.toolSelector.addEventListener("widthchange", (e) => {
      this.state.activeWidth = e.detail;
    });
  }
  updateCursor() {
    const cursors = {
      select: "default",
      line: "crosshair",
      rect: "crosshair",
      circle: "crosshair",
      highlighter: "crosshair",
      blur: "crosshair",
      pen: "crosshair",
      arrow: "crosshair",
      text: "text"
    };
    this.canvas.style.cursor = cursors[this.state.activeTool] || "crosshair";
  }
  getActiveStyle() {
    return {
      strokeColor: this.state.activeColor,
      strokeWidth: this.state.activeWidth,
      blur: 20
      // For blur shapes
    };
  }
  invalidate() {
    this.renderer.invalidate();
  }
  startRenderLoop() {
    const render = () => {
      this.renderer.render(this.state.shapes, this.state.selectedShapeId);
      this.animationFrameId = requestAnimationFrame(render);
    };
    render();
  }
  /** Export shapes as JSON */
  exportShapes() {
    const serialized = this.state.shapes.map((s) => s.serialize());
    return JSON.stringify(serialized, null, 2);
  }
  /** Clear all shapes */
  clear() {
    this.state.shapes = [];
    this.state.selectedShapeId = null;
    this.commandStack.clear();
    this.invalidate();
  }
  /** Resize canvas */
  resize(width, height) {
    this.renderer.resize(width, height);
  }
  /** Get canvas as data URL */
  toDataURL(type = "image/png") {
    return this.canvas.toDataURL(type);
  }
  /** Cleanup */
  destroy() {
    this.animationFrameId && cancelAnimationFrame(this.animationFrameId);
    this.interaction.detach();
    this.textInput.hide();
    this.canvas.remove();
    this.toolSelector.remove();
  }
}
export {
  CanvasEditor
};
