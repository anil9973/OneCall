import type { Shape, SerializedShape } from "./types.js";

export interface Command {
	execute(): void;
	undo(): void;
}

export class AddShapeCommand implements Command {
	constructor(private shapes: Shape[], private shape: Shape) {}

	execute(): void {
		this.shapes.push(this.shape);
	}

	undo(): void {
		const index = this.shapes.findIndex((s) => s.id === this.shape.id);
		if (index !== -1) this.shapes.splice(index, 1);
	}
}

export class DeleteShapeCommand implements Command {
	private deletedShape: Shape | null = null;
	private deletedIndex = -1;

	constructor(private shapes: Shape[], private shapeId: string) {}

	execute(): void {
		this.deletedIndex = this.shapes.findIndex((s) => s.id === this.shapeId);
		if (this.deletedIndex !== -1) {
			this.deletedShape = this.shapes[this.deletedIndex];
			this.shapes.splice(this.deletedIndex, 1);
		}
	}

	undo(): void {
		if (this.deletedShape && this.deletedIndex !== -1) this.shapes.splice(this.deletedIndex, 0, this.deletedShape);
	}
}

export class MoveShapeCommand implements Command {
	constructor(private shape: Shape, private dx: number, private dy: number) {}

	execute(): void {
		this.shape.move(this.dx, this.dy);
	}

	undo(): void {
		this.shape.move(-this.dx, -this.dy);
	}
}

export class CommandStack {
	private undoStack: Command[] = [];
	private redoStack: Command[] = [];

	execute(command: Command): void {
		command.execute();
		this.undoStack.push(command);
		this.redoStack = []; // Clear redo on new action
	}

	undo(): boolean {
		const command = this.undoStack.pop();
		if (!command) return false;

		command.undo();
		this.redoStack.push(command);
		return true;
	}

	redo(): boolean {
		const command = this.redoStack.pop();
		if (!command) return false;

		command.execute();
		this.undoStack.push(command);
		return true;
	}

	canUndo(): boolean {
		return this.undoStack.length > 0;
	}

	canRedo(): boolean {
		return this.redoStack.length > 0;
	}

	clear(): void {
		this.undoStack = [];
		this.redoStack = [];
	}
}
