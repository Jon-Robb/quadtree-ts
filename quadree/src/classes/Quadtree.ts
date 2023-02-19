import DoublyLinkedList from "./DoublyLinkedList";

interface Point {
  x: number;
  y: number;
}

export default class Quadtree {
  private points: DoublyLinkedList<Point> = new DoublyLinkedList();
  private maxDepth: number;
  private maxPoints: number;
  private bounds: { x: number, y: number, width: number, height: number };
  private children: Quadtree[] = [];

  constructor(bounds: { x: number, y: number, width: number, height: number }, maxDepth: number, maxPoints: number) {
    this.bounds = bounds;
    this.maxDepth = maxDepth;
    this.maxPoints = maxPoints;
  }

  insert(point: Point, depth = 0) {
    if (!this.contains(point)) {
      return false;
    }

    if (this.points.getSize() < this.maxPoints || depth >= this.maxDepth) {
      this.points.addLast(point);
      return true;
    }

    if (this.children.length === 0) {
      this.subdivide();
    }

    for (const child of this.children) {
      if (child.insert(point, depth + 1)) {
        return true;
      }
    }

    return false;
  }

  private subdivide() {
    const { x, y, width, height } = this.bounds;
    const halfWidth = width / 2;
    const halfHeight = height / 2;

    this.children.push(new Quadtree({ x: x, y: y, width: halfWidth, height: halfHeight }, this.maxDepth, this.maxPoints));
    this.children.push(new Quadtree({ x: x + halfWidth, y: y, width: halfWidth, height: halfHeight }, this.maxDepth, this.maxPoints));
    this.children.push(new Quadtree({ x: x, y: y + halfHeight, width: halfWidth, height: halfHeight }, this.maxDepth, this.maxPoints));
    this.children.push(new Quadtree({ x: x + halfWidth, y: y + halfHeight, width: halfWidth, height: halfHeight }, this.maxDepth, this.maxPoints));
  }

  private contains(point: Point) {
    return point.x >= this.bounds.x && point.x < this.bounds.x + this.bounds.width &&
           point.y >= this.bounds.y && point.y < this.bounds.y + this.bounds.height;
  }

  render(canvas: HTMLCanvasElement) {
    const ctx = canvas.getContext('2d');
    ctx!.clearRect(0, 0, canvas.width, canvas.height);
    this.renderNode(this, ctx!);
  }

  private renderNode(node: Quadtree, ctx: CanvasRenderingContext2D) {
    if (node.children.length === 0) {
      ctx.strokeStyle = '#000000';
      ctx.strokeRect(node.bounds.x, node.bounds.y, node.bounds.width, node.bounds.height);

      for (const point of node.points) {
        ctx.fillStyle = '#ff0000';
        ctx.fillRect(point.data.x, point.data.y, 1, 1);
      }
    } else {
      for (const child of node.children) {
        this.renderNode(child, ctx);
      }
    }
  }
}
