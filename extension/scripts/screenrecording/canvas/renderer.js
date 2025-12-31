class RenderEngine {
  constructor(canvas, ctx) {
    this.canvas = canvas;
    this.ctx = ctx;
  }
  needsRedraw = true;
  /** Mark canvas as needing redraw */
  invalidate() {
    this.needsRedraw = true;
  }
  /** Main render loop - call this every frame or on demand */
  render(shapes, selectedShapeId) {
    if (!this.needsRedraw) return;
    this.clear();
    this.drawShapes(shapes);
    if (selectedShapeId) {
      const selectedShape = shapes.find((s) => s.id === selectedShapeId);
      selectedShape && this.drawSelectionOverlay(selectedShape);
    }
    this.needsRedraw = false;
  }
  /** Clear entire canvas */
  clear() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }
  /** Draw all shapes in order */
  drawShapes(shapes) {
    for (const shape of shapes) {
      this.ctx.save();
      shape.draw(this.ctx);
      this.ctx.restore();
    }
  }
  /** Draw selection highlight around shape */
  drawSelectionOverlay(shape) {
    const bounds = shape.getBounds();
    const padding = 5;
    this.ctx.save();
    this.ctx.strokeStyle = "#4A90E2";
    this.ctx.lineWidth = 2;
    this.ctx.setLineDash([5, 5]);
    this.ctx.strokeRect(
      bounds.x - padding,
      bounds.y - padding,
      bounds.width + padding * 2,
      bounds.height + padding * 2
    );
    this.drawHandle(bounds.x - padding, bounds.y - padding);
    this.drawHandle(bounds.x + bounds.width + padding, bounds.y - padding);
    this.drawHandle(bounds.x - padding, bounds.y + bounds.height + padding);
    this.drawHandle(bounds.x + bounds.width + padding, bounds.y + bounds.height + padding);
    this.ctx.restore();
  }
  /** Draw selection handle */
  drawHandle(x, y) {
    const size = 6;
    this.ctx.fillStyle = "#FFFFFF";
    this.ctx.strokeStyle = "#4A90E2";
    this.ctx.lineWidth = 2;
    this.ctx.setLineDash([]);
    this.ctx.fillRect(x - size / 2, y - size / 2, size, size);
    this.ctx.strokeRect(x - size / 2, y - size / 2, size, size);
  }
  /** Resize canvas (e.g., on window resize) */
  resize(width, height) {
    this.canvas.width = width;
    this.canvas.height = height;
    this.invalidate();
  }
}
export {
  RenderEngine
};
