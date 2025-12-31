import type { Shape, Point, BoundingBox, ShapeStyle, SerializedShape } from "./types.js";

/** Base shape with common functionality */
abstract class BaseShape implements Shape {
	constructor(public id: string, public type: string, public style: ShapeStyle) {}

	abstract draw(ctx: CanvasRenderingContext2D): void;
	abstract hitTest(x: number, y: number): boolean;
	abstract move(dx: number, dy: number): void;
	abstract getBounds(): BoundingBox;
	abstract serialize(): SerializedShape;

	protected applyStyle(ctx: CanvasRenderingContext2D): void {
		ctx.strokeStyle = this.style.strokeColor;
		ctx.lineWidth = this.style.strokeWidth;
		if (this.style.fillColor) ctx.fillStyle = this.style.fillColor;
	}
}

export class LineShape extends BaseShape {
	constructor(id: string, public start: Point, public end: Point, style: ShapeStyle) {
		super(id, "line", style);
	}

	draw(ctx: CanvasRenderingContext2D): void {
		this.applyStyle(ctx);
		ctx.beginPath();
		ctx.moveTo(this.start.x, this.start.y);
		ctx.lineTo(this.end.x, this.end.y);
		ctx.stroke();
	}

	hitTest(x: number, y: number): boolean {
		const threshold = Math.max(this.style.strokeWidth, 10);
		const dist = this.distanceToLine(x, y);
		return dist <= threshold;
	}

	private distanceToLine(x: number, y: number): number {
		const { start, end } = this;
		const dx = end.x - start.x;
		const dy = end.y - start.y;
		const lenSq = dx * dx + dy * dy;

		if (lenSq === 0) return Math.hypot(x - start.x, y - start.y);

		let t = ((x - start.x) * dx + (y - start.y) * dy) / lenSq;
		t = Math.max(0, Math.min(1, t));

		const projX = start.x + t * dx;
		const projY = start.y + t * dy;

		return Math.hypot(x - projX, y - projY);
	}

	move(dx: number, dy: number): void {
		this.start.x += dx;
		this.start.y += dy;
		this.end.x += dx;
		this.end.y += dy;
	}

	getBounds(): BoundingBox {
		const minX = Math.min(this.start.x, this.end.x);
		const minY = Math.min(this.start.y, this.end.y);
		const maxX = Math.max(this.start.x, this.end.x);
		const maxY = Math.max(this.start.y, this.end.y);
		return {
			x: minX,
			y: minY,
			width: maxX - minX,
			height: maxY - minY,
		};
	}

	serialize(): SerializedShape {
		return {
			id: this.id,
			type: this.type,
			data: { start: this.start, end: this.end },
			style: this.style,
		};
	}
}

export class RectangleShape extends BaseShape {
	constructor(
		id: string,
		public x: number,
		public y: number,
		public width: number,
		public height: number,
		style: ShapeStyle
	) {
		super(id, "rectangle", style);
	}

	draw(ctx: CanvasRenderingContext2D): void {
		this.applyStyle(ctx);
		ctx.strokeRect(this.x, this.y, this.width, this.height);
		if (this.style.fillColor) {
			ctx.fillRect(this.x, this.y, this.width, this.height);
		}
	}

	hitTest(x: number, y: number): boolean {
		const threshold = this.style.strokeWidth / 2;
		return (
			x >= this.x - threshold &&
			x <= this.x + this.width + threshold &&
			y >= this.y - threshold &&
			y <= this.y + this.height + threshold
		);
	}

	move(dx: number, dy: number): void {
		this.x += dx;
		this.y += dy;
	}

	getBounds(): BoundingBox {
		return {
			x: this.x,
			y: this.y,
			width: this.width,
			height: this.height,
		};
	}

	serialize(): SerializedShape {
		return {
			id: this.id,
			type: this.type,
			data: { x: this.x, y: this.y, width: this.width, height: this.height },
			style: this.style,
		};
	}
}

export class BlurShape extends BaseShape {
	constructor(
		id: string,
		public x: number,
		public y: number,
		public width: number,
		public height: number,
		style: ShapeStyle
	) {
		super(id, "blur", style);
	}

	draw(ctx: CanvasRenderingContext2D): void {
		ctx.save();

		// Apply blur filter
		const blurAmount = this.style.blur || 20;
		ctx.filter = `blur(${blurAmount}px)`;

		// Draw blurred region
		ctx.fillStyle = "rgba(200, 200, 200, 0.5)";
		ctx.fillRect(this.x, this.y, this.width, this.height);

		ctx.restore();

		// Draw border
		this.applyStyle(ctx);
		ctx.strokeRect(this.x, this.y, this.width, this.height);
	}

	hitTest(x: number, y: number): boolean {
		const threshold = this.style.strokeWidth / 2;
		return (
			x >= this.x - threshold &&
			x <= this.x + this.width + threshold &&
			y >= this.y - threshold &&
			y <= this.y + this.height + threshold
		);
	}

	move(dx: number, dy: number): void {
		this.x += dx;
		this.y += dy;
	}

	getBounds(): BoundingBox {
		return {
			x: this.x,
			y: this.y,
			width: this.width,
			height: this.height,
		};
	}

	serialize(): SerializedShape {
		return {
			id: this.id,
			type: this.type,
			data: { x: this.x, y: this.y, width: this.width, height: this.height },
			style: this.style,
		};
	}
}

export class PathShape extends BaseShape {
	constructor(id: string, public points: Point[], style: ShapeStyle) {
		super(id, "path", style);
	}

	draw(ctx: CanvasRenderingContext2D): void {
		if (this.points.length < 2) return;

		this.applyStyle(ctx);
		ctx.beginPath();
		ctx.moveTo(this.points[0].x, this.points[0].y);

		for (let i = 1; i < this.points.length; i++) {
			ctx.lineTo(this.points[i].x, this.points[i].y);
		}

		ctx.stroke();
	}

	hitTest(x: number, y: number): boolean {
		const threshold = Math.max(this.style.strokeWidth, 10);

		for (let i = 0; i < this.points.length - 1; i++) {
			const p1 = this.points[i];
			const p2 = this.points[i + 1];

			const dist = this.distanceToSegment(x, y, p1, p2);
			if (dist <= threshold) return true;
		}

		return false;
	}

	private distanceToSegment(x: number, y: number, p1: Point, p2: Point): number {
		const dx = p2.x - p1.x;
		const dy = p2.y - p1.y;
		const lenSq = dx * dx + dy * dy;

		if (lenSq === 0) return Math.hypot(x - p1.x, y - p1.y);

		let t = ((x - p1.x) * dx + (y - p1.y) * dy) / lenSq;
		t = Math.max(0, Math.min(1, t));

		const projX = p1.x + t * dx;
		const projY = p1.y + t * dy;

		return Math.hypot(x - projX, y - projY);
	}

	move(dx: number, dy: number): void {
		for (const point of this.points) {
			point.x += dx;
			point.y += dy;
		}
	}

	getBounds(): BoundingBox {
		if (this.points.length === 0) {
			return { x: 0, y: 0, width: 0, height: 0 };
		}

		let minX = this.points[0].x;
		let minY = this.points[0].y;
		let maxX = minX;
		let maxY = minY;

		for (const point of this.points) {
			minX = Math.min(minX, point.x);
			minY = Math.min(minY, point.y);
			maxX = Math.max(maxX, point.x);
			maxY = Math.max(maxY, point.y);
		}

		return {
			x: minX,
			y: minY,
			width: maxX - minX,
			height: maxY - minY,
		};
	}

	serialize(): SerializedShape {
		return {
			id: this.id,
			type: this.type,
			data: { points: this.points },
			style: this.style,
		};
	}
}

export class BezierArrowShape extends BaseShape {
	constructor(
		id: string,
		public start: Point,
		public control1: Point,
		public control2: Point,
		public end: Point,
		style: ShapeStyle
	) {
		super(id, "arrow", style);
	}

	draw(ctx: CanvasRenderingContext2D): void {
		this.applyStyle(ctx);

		// Draw curve
		ctx.beginPath();
		ctx.moveTo(this.start.x, this.start.y);
		ctx.bezierCurveTo(this.control1.x, this.control1.y, this.control2.x, this.control2.y, this.end.x, this.end.y);
		ctx.stroke();

		// Draw arrowhead
		this.drawArrowhead(ctx);
	}

	private drawArrowhead(ctx: CanvasRenderingContext2D): void {
		const t = 0.99; // Near end for tangent
		const pt = this.bezierPoint(t);
		const pt2 = this.bezierPoint(t - 0.05);

		const angle = Math.atan2(pt.y - pt2.y, pt.x - pt2.x);
		const headLength = 15;
		const headAngle = Math.PI / 6;

		ctx.beginPath();
		ctx.moveTo(this.end.x, this.end.y);
		ctx.lineTo(
			this.end.x - headLength * Math.cos(angle - headAngle),
			this.end.y - headLength * Math.sin(angle - headAngle)
		);
		ctx.moveTo(this.end.x, this.end.y);
		ctx.lineTo(
			this.end.x - headLength * Math.cos(angle + headAngle),
			this.end.y - headLength * Math.sin(angle + headAngle)
		);
		ctx.stroke();
	}

	private bezierPoint(t: number): Point {
		const t2 = t * t;
		const t3 = t2 * t;
		const mt = 1 - t;
		const mt2 = mt * mt;
		const mt3 = mt2 * mt;

		return {
			x: mt3 * this.start.x + 3 * mt2 * t * this.control1.x + 3 * mt * t2 * this.control2.x + t3 * this.end.x,
			y: mt3 * this.start.y + 3 * mt2 * t * this.control1.y + 3 * mt * t2 * this.control2.y + t3 * this.end.y,
		};
	}

	hitTest(x: number, y: number): boolean {
		const threshold = Math.max(this.style.strokeWidth, 10);
		const steps = 50;

		for (let i = 0; i <= steps; i++) {
			const t = i / steps;
			const pt = this.bezierPoint(t);
			const dist = Math.hypot(x - pt.x, y - pt.y);
			if (dist <= threshold) return true;
		}

		return false;
	}

	move(dx: number, dy: number): void {
		this.start.x += dx;
		this.start.y += dy;
		this.control1.x += dx;
		this.control1.y += dy;
		this.control2.x += dx;
		this.control2.y += dy;
		this.end.x += dx;
		this.end.y += dy;
	}

	getBounds(): BoundingBox {
		const points = [this.start, this.control1, this.control2, this.end];
		let minX = points[0].x;
		let minY = points[0].y;
		let maxX = minX;
		let maxY = minY;

		for (const point of points) {
			minX = Math.min(minX, point.x);
			minY = Math.min(minY, point.y);
			maxX = Math.max(maxX, point.x);
			maxY = Math.max(maxY, point.y);
		}

		return {
			x: minX,
			y: minY,
			width: maxX - minX,
			height: maxY - minY,
		};
	}

	serialize(): SerializedShape {
		return {
			id: this.id,
			type: this.type,
			data: {
				start: this.start,
				control1: this.control1,
				control2: this.control2,
				end: this.end,
			},
			style: this.style,
		};
	}
}

export class TextShape extends BaseShape {
	constructor(
		id: string,
		public x: number,
		public y: number,
		public text: string,
		public fontSize: number,
		style: ShapeStyle
	) {
		super(id, "text", style);
	}

	draw(ctx: CanvasRenderingContext2D): void {
		this.applyStyle(ctx);
		ctx.font = `${this.fontSize}px sans-serif`;
		ctx.fillStyle = this.style.strokeColor;
		ctx.fillText(this.text, this.x, this.y);
	}

	hitTest(x: number, y: number): boolean {
		const bounds = this.getBounds();
		return x >= bounds.x && x <= bounds.x + bounds.width && y >= bounds.y && y <= bounds.y + bounds.height;
	}

	move(dx: number, dy: number): void {
		this.x += dx;
		this.y += dy;
	}

	getBounds(): BoundingBox {
		// Approximate text bounds
		const width = this.text.length * this.fontSize * 0.6;
		const height = this.fontSize;

		return {
			x: this.x,
			y: this.y - height,
			width,
			height,
		};
	}

	serialize(): SerializedShape {
		return {
			id: this.id,
			type: this.type,
			data: { x: this.x, y: this.y, text: this.text, fontSize: this.fontSize },
			style: this.style,
		};
	}
}
