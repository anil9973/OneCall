class BaseShape {
  constructor(id, type, style) {
    this.id = id;
    this.type = type;
    this.style = style;
  }
  applyStyle(ctx) {
    ctx.strokeStyle = this.style.strokeColor;
    ctx.lineWidth = this.style.strokeWidth;
    if (this.style.fillColor) ctx.fillStyle = this.style.fillColor;
  }
}
class LineShape extends BaseShape {
  constructor(id, start, end, style) {
    super(id, "line", style);
    this.start = start;
    this.end = end;
  }
  draw(ctx) {
    this.applyStyle(ctx);
    ctx.beginPath();
    ctx.moveTo(this.start.x, this.start.y);
    ctx.lineTo(this.end.x, this.end.y);
    ctx.stroke();
  }
  hitTest(x, y) {
    const threshold = Math.max(this.style.strokeWidth, 10);
    const dist = this.distanceToLine(x, y);
    return dist <= threshold;
  }
  distanceToLine(x, y) {
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
  move(dx, dy) {
    this.start.x += dx;
    this.start.y += dy;
    this.end.x += dx;
    this.end.y += dy;
  }
  getBounds() {
    const minX = Math.min(this.start.x, this.end.x);
    const minY = Math.min(this.start.y, this.end.y);
    const maxX = Math.max(this.start.x, this.end.x);
    const maxY = Math.max(this.start.y, this.end.y);
    return {
      x: minX,
      y: minY,
      width: maxX - minX,
      height: maxY - minY
    };
  }
  serialize() {
    return {
      id: this.id,
      type: this.type,
      data: { start: this.start, end: this.end },
      style: this.style
    };
  }
}
class RectangleShape extends BaseShape {
  constructor(id, x, y, width, height, style) {
    super(id, "rectangle", style);
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
  }
  draw(ctx) {
    this.applyStyle(ctx);
    ctx.strokeRect(this.x, this.y, this.width, this.height);
    if (this.style.fillColor) {
      ctx.fillRect(this.x, this.y, this.width, this.height);
    }
  }
  hitTest(x, y) {
    const threshold = this.style.strokeWidth / 2;
    return x >= this.x - threshold && x <= this.x + this.width + threshold && y >= this.y - threshold && y <= this.y + this.height + threshold;
  }
  move(dx, dy) {
    this.x += dx;
    this.y += dy;
  }
  getBounds() {
    return {
      x: this.x,
      y: this.y,
      width: this.width,
      height: this.height
    };
  }
  serialize() {
    return {
      id: this.id,
      type: this.type,
      data: { x: this.x, y: this.y, width: this.width, height: this.height },
      style: this.style
    };
  }
}
class BlurShape extends BaseShape {
  constructor(id, x, y, width, height, style) {
    super(id, "blur", style);
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
  }
  draw(ctx) {
    ctx.save();
    const blurAmount = this.style.blur || 20;
    ctx.filter = `blur(${blurAmount}px)`;
    ctx.fillStyle = "rgba(200, 200, 200, 0.5)";
    ctx.fillRect(this.x, this.y, this.width, this.height);
    ctx.restore();
    this.applyStyle(ctx);
    ctx.strokeRect(this.x, this.y, this.width, this.height);
  }
  hitTest(x, y) {
    const threshold = this.style.strokeWidth / 2;
    return x >= this.x - threshold && x <= this.x + this.width + threshold && y >= this.y - threshold && y <= this.y + this.height + threshold;
  }
  move(dx, dy) {
    this.x += dx;
    this.y += dy;
  }
  getBounds() {
    return {
      x: this.x,
      y: this.y,
      width: this.width,
      height: this.height
    };
  }
  serialize() {
    return {
      id: this.id,
      type: this.type,
      data: { x: this.x, y: this.y, width: this.width, height: this.height },
      style: this.style
    };
  }
}
class PathShape extends BaseShape {
  constructor(id, points, style) {
    super(id, "path", style);
    this.points = points;
  }
  draw(ctx) {
    if (this.points.length < 2) return;
    this.applyStyle(ctx);
    ctx.beginPath();
    ctx.moveTo(this.points[0].x, this.points[0].y);
    for (let i = 1; i < this.points.length; i++) {
      ctx.lineTo(this.points[i].x, this.points[i].y);
    }
    ctx.stroke();
  }
  hitTest(x, y) {
    const threshold = Math.max(this.style.strokeWidth, 10);
    for (let i = 0; i < this.points.length - 1; i++) {
      const p1 = this.points[i];
      const p2 = this.points[i + 1];
      const dist = this.distanceToSegment(x, y, p1, p2);
      if (dist <= threshold) return true;
    }
    return false;
  }
  distanceToSegment(x, y, p1, p2) {
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
  move(dx, dy) {
    for (const point of this.points) {
      point.x += dx;
      point.y += dy;
    }
  }
  getBounds() {
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
      height: maxY - minY
    };
  }
  serialize() {
    return {
      id: this.id,
      type: this.type,
      data: { points: this.points },
      style: this.style
    };
  }
}
class BezierArrowShape extends BaseShape {
  constructor(id, start, control1, control2, end, style) {
    super(id, "arrow", style);
    this.start = start;
    this.control1 = control1;
    this.control2 = control2;
    this.end = end;
  }
  draw(ctx) {
    this.applyStyle(ctx);
    ctx.beginPath();
    ctx.moveTo(this.start.x, this.start.y);
    ctx.bezierCurveTo(this.control1.x, this.control1.y, this.control2.x, this.control2.y, this.end.x, this.end.y);
    ctx.stroke();
    this.drawArrowhead(ctx);
  }
  drawArrowhead(ctx) {
    const t = 0.99;
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
  bezierPoint(t) {
    const t2 = t * t;
    const t3 = t2 * t;
    const mt = 1 - t;
    const mt2 = mt * mt;
    const mt3 = mt2 * mt;
    return {
      x: mt3 * this.start.x + 3 * mt2 * t * this.control1.x + 3 * mt * t2 * this.control2.x + t3 * this.end.x,
      y: mt3 * this.start.y + 3 * mt2 * t * this.control1.y + 3 * mt * t2 * this.control2.y + t3 * this.end.y
    };
  }
  hitTest(x, y) {
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
  move(dx, dy) {
    this.start.x += dx;
    this.start.y += dy;
    this.control1.x += dx;
    this.control1.y += dy;
    this.control2.x += dx;
    this.control2.y += dy;
    this.end.x += dx;
    this.end.y += dy;
  }
  getBounds() {
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
      height: maxY - minY
    };
  }
  serialize() {
    return {
      id: this.id,
      type: this.type,
      data: {
        start: this.start,
        control1: this.control1,
        control2: this.control2,
        end: this.end
      },
      style: this.style
    };
  }
}
class TextShape extends BaseShape {
  constructor(id, x, y, text, fontSize, style) {
    super(id, "text", style);
    this.x = x;
    this.y = y;
    this.text = text;
    this.fontSize = fontSize;
  }
  draw(ctx) {
    this.applyStyle(ctx);
    ctx.font = `${this.fontSize}px sans-serif`;
    ctx.fillStyle = this.style.strokeColor;
    ctx.fillText(this.text, this.x, this.y);
  }
  hitTest(x, y) {
    const bounds = this.getBounds();
    return x >= bounds.x && x <= bounds.x + bounds.width && y >= bounds.y && y <= bounds.y + bounds.height;
  }
  move(dx, dy) {
    this.x += dx;
    this.y += dy;
  }
  getBounds() {
    const width = this.text.length * this.fontSize * 0.6;
    const height = this.fontSize;
    return {
      x: this.x,
      y: this.y - height,
      width,
      height
    };
  }
  serialize() {
    return {
      id: this.id,
      type: this.type,
      data: { x: this.x, y: this.y, text: this.text, fontSize: this.fontSize },
      style: this.style
    };
  }
}
export {
  BezierArrowShape,
  BlurShape,
  LineShape,
  PathShape,
  RectangleShape,
  TextShape
};
