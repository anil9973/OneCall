class AddShapeCommand {
  constructor(shapes, shape) {
    this.shapes = shapes;
    this.shape = shape;
  }
  execute() {
    this.shapes.push(this.shape);
  }
  undo() {
    const index = this.shapes.findIndex((s) => s.id === this.shape.id);
    if (index !== -1) this.shapes.splice(index, 1);
  }
}
class DeleteShapeCommand {
  constructor(shapes, shapeId) {
    this.shapes = shapes;
    this.shapeId = shapeId;
  }
  deletedShape = null;
  deletedIndex = -1;
  execute() {
    this.deletedIndex = this.shapes.findIndex((s) => s.id === this.shapeId);
    if (this.deletedIndex !== -1) {
      this.deletedShape = this.shapes[this.deletedIndex];
      this.shapes.splice(this.deletedIndex, 1);
    }
  }
  undo() {
    if (this.deletedShape && this.deletedIndex !== -1) this.shapes.splice(this.deletedIndex, 0, this.deletedShape);
  }
}
class MoveShapeCommand {
  constructor(shape, dx, dy) {
    this.shape = shape;
    this.dx = dx;
    this.dy = dy;
  }
  execute() {
    this.shape.move(this.dx, this.dy);
  }
  undo() {
    this.shape.move(-this.dx, -this.dy);
  }
}
class CommandStack {
  undoStack = [];
  redoStack = [];
  execute(command) {
    command.execute();
    this.undoStack.push(command);
    this.redoStack = [];
  }
  undo() {
    const command = this.undoStack.pop();
    if (!command) return false;
    command.undo();
    this.redoStack.push(command);
    return true;
  }
  redo() {
    const command = this.redoStack.pop();
    if (!command) return false;
    command.execute();
    this.undoStack.push(command);
    return true;
  }
  canUndo() {
    return this.undoStack.length > 0;
  }
  canRedo() {
    return this.redoStack.length > 0;
  }
  clear() {
    this.undoStack = [];
    this.redoStack = [];
  }
}
export {
  AddShapeCommand,
  CommandStack,
  DeleteShapeCommand,
  MoveShapeCommand
};
