import { LineShape, RectangleShape, BlurShape, PathShape, BezierArrowShape, TextShape } from "./shapes.js";
import { CommandStack, AddShapeCommand, DeleteShapeCommand, MoveShapeCommand } from "./commands.js";
import { ToolType as Tools } from "./types.js";
class InteractionManager {
  // ~60fps
  constructor(canvas, shapes, commandStack, onInvalidate, onTextInput, getActiveTool, getActiveStyle, getSelectedShapeId, setSelectedShapeId) {
    this.canvas = canvas;
    this.shapes = shapes;
    this.commandStack = commandStack;
    this.onInvalidate = onInvalidate;
    this.onTextInput = onTextInput;
    this.getActiveTool = getActiveTool;
    this.getActiveStyle = getActiveStyle;
    this.getSelectedShapeId = getSelectedShapeId;
    this.setSelectedShapeId = setSelectedShapeId;
    this.attachEvents();
  }
  isDrawing = false;
  isDragging = false;
  startPoint = null;
  lastPoint = null;
  currentShape = null;
  draggedShape = null;
  dragOffset = null;
  currentPathPoints = [];
  lastAddedPointTime = 0;
  POINT_THROTTLE_MS = 16;
  attachEvents() {
    this.canvas.addEventListener("pointerdown", this.handlePointerDown);
    this.canvas.addEventListener("pointermove", this.handlePointerMove);
    this.canvas.addEventListener("pointerup", this.handlePointerUp);
    document.addEventListener("keydown", this.handleKeyDown);
  }
  detach() {
    this.canvas.removeEventListener("pointerdown", this.handlePointerDown);
    this.canvas.removeEventListener("pointermove", this.handlePointerMove);
    this.canvas.removeEventListener("pointerup", this.handlePointerUp);
    document.removeEventListener("keydown", this.handleKeyDown);
  }
  getCanvasPoint(e) {
    const rect = this.canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
  }
  handlePointerDown = (e) => {
    e.preventDefault();
    const point = this.getCanvasPoint(e);
    const tool = this.getActiveTool();
    console.log(tool);
    if (tool === Tools.SELECT) {
      this.handleSelectionStart(point);
    } else if (tool === Tools.TEXT) {
      this.handleTextToolClick(point);
    } else {
      this.handleDrawingStart(point, tool);
    }
  };
  handlePointerMove = (e) => {
    if (!this.isDrawing && !this.isDragging) return;
    const point = this.getCanvasPoint(e);
    const tool = this.getActiveTool();
    if (this.isDragging && this.draggedShape && this.dragOffset) {
      this.handleDragMove(point);
    } else if (this.isDrawing) {
      if (tool === Tools.PEN) {
        this.handlePenMove(point);
      } else {
        this.handleShapeUpdate(point, tool);
      }
    }
  };
  handlePointerUp = (e) => {
    if (this.isDragging && this.draggedShape && this.dragOffset) {
      this.finalizeDrag();
    } else if (this.isDrawing && this.currentShape) {
      this.finalizeDrawing();
    }
    this.isDrawing = false;
    this.isDragging = false;
    this.currentShape = null;
    this.draggedShape = null;
    this.dragOffset = null;
    this.startPoint = null;
    this.currentPathPoints = [];
  };
  handleSelectionStart(point) {
    const clicked = this.findShapeAt(point);
    if (clicked) {
      this.setSelectedShapeId(clicked.id);
      this.isDragging = true;
      this.draggedShape = clicked;
      this.dragOffset = {
        x: point.x - clicked.getBounds().x,
        y: point.y - clicked.getBounds().y
      };
      this.lastPoint = point;
    } else {
      this.setSelectedShapeId(null);
    }
    this.onInvalidate();
  }
  handleTextToolClick(point) {
    this.onTextInput(point.x, point.y, (text) => {
      if (!text.trim()) return;
      const style = this.getActiveStyle();
      const shape = new TextShape(this.generateId(), point.x, point.y, text, 20, style);
      const cmd = new AddShapeCommand(this.shapes, shape);
      this.commandStack.execute(cmd);
      this.onInvalidate();
    });
  }
  handleDrawingStart(point, tool) {
    this.isDrawing = true;
    this.startPoint = point;
    this.lastPoint = point;
    const style = this.getActiveStyle();
    const id = this.generateId();
    if (tool === Tools.PEN) {
      this.currentPathPoints = [point];
      this.currentShape = new PathShape(id, [point], style);
      this.shapes.push(this.currentShape);
    } else if (tool === Tools.LINE) {
      this.currentShape = new LineShape(id, point, point, style);
      this.shapes.push(this.currentShape);
    } else if (tool === Tools.RECTANGLE) {
      this.currentShape = new RectangleShape(id, point.x, point.y, 0, 0, style);
      this.shapes.push(this.currentShape);
    } else if (tool === Tools.BLUR) {
      this.currentShape = new BlurShape(id, point.x, point.y, 0, 0, style);
      this.shapes.push(this.currentShape);
    } else if (tool === Tools.ARROW) {
      this.currentShape = new BezierArrowShape(id, point, point, point, point, style);
      this.shapes.push(this.currentShape);
    }
    this.onInvalidate();
  }
  handlePenMove(point) {
    const now = Date.now();
    if (now - this.lastAddedPointTime < this.POINT_THROTTLE_MS) return;
    this.currentPathPoints.push(point);
    this.lastAddedPointTime = now;
    if (this.currentShape instanceof PathShape) {
      this.currentShape.points = [...this.currentPathPoints];
    }
    this.onInvalidate();
  }
  handleShapeUpdate(point, tool) {
    if (!this.startPoint || !this.currentShape) return;
    if (this.currentShape instanceof LineShape) {
      this.currentShape.end = point;
    } else if (this.currentShape instanceof RectangleShape || this.currentShape instanceof BlurShape) {
      const width = point.x - this.startPoint.x;
      const height = point.y - this.startPoint.y;
      this.currentShape.width = width;
      this.currentShape.height = height;
    } else if (this.currentShape instanceof BezierArrowShape) {
      const dx = point.x - this.startPoint.x;
      const dy = point.y - this.startPoint.y;
      this.currentShape.end = point;
      this.currentShape.control1 = {
        x: this.startPoint.x + dx * 0.33,
        y: this.startPoint.y + dy * 0.33
      };
      this.currentShape.control2 = {
        x: this.startPoint.x + dx * 0.66,
        y: this.startPoint.y + dy * 0.66
      };
    }
    this.onInvalidate();
  }
  handleDragMove(point) {
    if (!this.lastPoint || !this.draggedShape) return;
    const dx = point.x - this.lastPoint.x;
    const dy = point.y - this.lastPoint.y;
    this.draggedShape.move(dx, dy);
    this.lastPoint = point;
    this.onInvalidate();
  }
  finalizeDrag() {
    if (!this.draggedShape || !this.startPoint || !this.lastPoint) return;
    const dx = this.lastPoint.x - this.startPoint.x;
    const dy = this.lastPoint.y - this.startPoint.y;
    if (Math.abs(dx) > 1 || Math.abs(dy) > 1) {
      this.draggedShape.move(-dx, -dy);
      const cmd = new MoveShapeCommand(this.draggedShape, dx, dy);
      this.commandStack.execute(cmd);
    }
  }
  finalizeDrawing() {
    if (!this.currentShape) return;
    const bounds = this.currentShape.getBounds();
    if (bounds.width < 2 && bounds.height < 2) {
      const index = this.shapes.findIndex((s) => s.id === this.currentShape.id);
      if (index !== -1) {
        this.shapes.splice(index, 1);
      }
      return;
    }
    const cmd = new AddShapeCommand(this.shapes, this.currentShape);
    this.commandStack.execute(cmd);
  }
  findShapeAt(point) {
    for (let i = this.shapes.length - 1; i >= 0; i--) {
      if (this.shapes[i].hitTest(point.x, point.y)) return this.shapes[i];
    }
    return null;
  }
  handleKeyDown = (e) => {
    const selectedId = this.getSelectedShapeId();
    if ((e.key === "Delete" || e.key === "Backspace") && selectedId) {
      e.preventDefault();
      const cmd = new DeleteShapeCommand(this.shapes, selectedId);
      this.commandStack.execute(cmd);
      this.setSelectedShapeId(null);
      this.onInvalidate();
    } else if (e.ctrlKey || e.metaKey) {
      if (e.key === "z" && !e.shiftKey) {
        e.preventDefault();
        if (this.commandStack.undo()) {
          this.onInvalidate();
        }
      } else if (e.key === "z" && e.shiftKey || e.key === "y") {
        e.preventDefault();
        if (this.commandStack.redo()) {
          this.onInvalidate();
        }
      }
    }
  };
  generateId() {
    return `shape_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
export {
  InteractionManager
};
