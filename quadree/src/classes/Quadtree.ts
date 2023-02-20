import DoublyLinkedList from "./DoublyLinkedList";

export default interface GameObject {
  x: number;
  y: number;
  bottom: number;
  right: number;
}

export default class Quadtree {
  private objects: DoublyLinkedList<GameObject> = new DoublyLinkedList();
  private maxDepth: number;
  private maxPoints: number;
  private bounds: { x: number, y: number, width: number, height: number };
  private children: Quadtree[] = [];

  constructor(bounds: { x: number, y: number, width: number, height: number }, maxDepth: number, maxPoints: number) {
    this.bounds = bounds;
    this.maxDepth = maxDepth;
    this.maxPoints = maxPoints;
  }

  insert(object: GameObject, depth = 0) {
    if (!this.contains(object)) {
      return false;
    }

    if (this.objects.getSize() < this.maxPoints || depth >= this.maxDepth) {
      this.objects.addLast(object);
      return true;
    }

    if (this.children.length === 0) {
      this.subdivide();
    }

    for (const child of this.children) {
      if (child.insert(object, depth + 1)) {
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

  private contains(object: GameObject) {
    const { x, y, bottom, right } = object;
    const { x: boundsX, y: boundsY, width, height } = this.bounds;

    if (x + right < boundsX || x > boundsX + width) {
      return false;
    }

    if (y + bottom < boundsY || y > boundsY + height) {
      return false;
    }

    return true;
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

      for (const object of node.objects) {
        ctx.fillStyle = '#ff0000';
        const width = object.data.right - object.data.x;
        const height = object.data.bottom - object.data.y;
        ctx.fillRect(object.data.x, object.data.y, width, height);
      }
    } else {
      for (const child of node.children) {
        this.renderNode(child, ctx);
      }
    }
  }
}
