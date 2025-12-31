export type Point = { x: number; y: number };

export type BoundingBox = {
	x: number;
	y: number;
	width: number;
	height: number;
};

export enum ToolType {
	SELECT = "select",
	RECTANGLE = "rect",
	CIRCLE = "circle",
	BLUR = "blur",
	PEN = "pen",
	HIGHLIGHTER = "highlighter",
	ARROW = "arrow",
	DUAL_ARROW = "arrow",
	LINE = "line",
	TEXT = "text",
}

export type ShapeStyle = {
	strokeColor: string;
	strokeWidth: number;
	fillColor?: string;
	blur?: number;
};

export type SerializedShape = {
	id: string;
	type: string;
	data: Record<string, any>;
	style: ShapeStyle;
};

export interface Shape {
	id: string;
	type: string;
	style: ShapeStyle;

	/** Render shape to canvas context */
	draw(ctx: CanvasRenderingContext2D): void;

	/** Check if point (x,y) is inside/on the shape */
	hitTest(x: number, y: number): boolean;

	/** Move shape by delta */
	move(dx: number, dy: number): void;

	/** Get bounding box for selection highlight */
	getBounds(): BoundingBox;

	/** Serialize for undo/redo */
	serialize(): SerializedShape;
}

export type EditorState = {
	activeTool: ToolType;
	activeColor: string;
	activeWidth: number;
	shapes: Shape[];
	selectedShapeId: string | null;
	isDragging: boolean;
	dragStart: Point | null;
};
