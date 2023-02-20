import DoublyLinkedList from "./DoublyLinkedList";

export interface Object {
  x: number;
  y: number;
  width: number;
  height: number;
}

export default class Quadtree {
  // private _objects: { object: Object, bounds: { x: number, y: number, width: number, height: number } }[] = [];
  private _objects: DoublyLinkedList<Object> = new DoublyLinkedList();
  private _maxDepth: number;
  private _maxObjects: number;
  private _bounds: { x: number, y: number, width: number, height: number };
  private _children: Quadtree[] = [];
  private _level: number;

  constructor(bounds: { x: number, y: number, width: number, height: number }, maxDepth: number, maxObjects: number, level = 0) {
    this._bounds = bounds;
    this._maxDepth = maxDepth;
    this._maxObjects = maxObjects;
    this._level = level;
    
  }

  get level() {
    return this._level
;
  }

  get maxDepth() {
    return this._maxDepth;
  }

  get maxObjects() {
    return this._maxObjects;
  }

  get bounds() {
    return this._bounds;
  }

  get objects() {
    return this._objects;
  }

  get children() {
    return this._children;
  }

  set level(level: number) {
    this._level = level;
  }

  set children(children: Quadtree[]) {
    this._children = children;
  }

  /**
 * Inserts an object into the Quadtree. If the object is not contained
 * within the current node, the insertion is aborted. If the current
 * node is at its maximum capacity, it is subdivided into four child
 * nodes and the objects are redistributed among the child nodes.
 * @param object - The object to insert.
 * @param depth - The depth of the current node in the tree.
 * @returns true if the object was successfully inserted, false otherwise.
 */
  insert(object: Object) {
    // Check if the object is contained within the current node
    if (!this.containsObject(object)) {
      return false;
    }

    // If the node is not full and we haven't reached the maximum depth, just add the object to the current node
    if (this.objects.getSize() < this.maxObjects || this.level >= this.maxDepth) {
      this.objects.addLast(object);
      return true;
    }

  // If the node is full and we haven't reached the maximum depth, subdivide the node and redistribute the objects
  if (this.children.length === 0) {
      this.subdivide();
    }

    // Recursively insert the object into the appropriate child node
    for (const child of this.children) {
      if (child.insert(object)) {
        return true;
      }
    }
    return false;
  }

 /**
 * Subdivides the current node into four child nodes and redistributes
 * the objects that were previously stored in the current node among
 * the child nodes. The child nodes are created with the same maximum
 * depth and maximum number of objects as the current node.
 */
  private subdivide() {
    const { x, y, width, height } = this.bounds;
    const halfWidth = width / 2;
    const halfHeight = height / 2;

    // Create four child nodes, each with the same maximum depth and maximum number of objects as the current node
    this.children.push(new Quadtree({ x: x, y: y, width: halfWidth, height: halfHeight }, this.maxDepth, this.maxObjects, this.level + 1));
    this.children.push(new Quadtree({ x: x + halfWidth, y: y, width: halfWidth, height: halfHeight }, this.maxDepth, this.maxObjects, this.level + 1));
    this.children.push(new Quadtree({ x: x, y: y + halfHeight, width: halfWidth, height: halfHeight }, this.maxDepth, this.maxObjects, this.level + 1));
    this.children.push(new Quadtree({ x: x + halfWidth, y: y + halfHeight, width: halfWidth, height: halfHeight }, this.maxDepth, this.maxObjects, this.level + 1));
  }

  // 
  // private containsObject(bounds: { x: number, y: number, width: number, height: number }) {
  //   return bounds.x + bounds.width > this.bounds.x && bounds.x < this.bounds.x + this.bounds.width &&
  //          bounds.y + bounds.height > this.bounds.y && bounds.y < this.bounds.y + this.bounds.height;
  // }

  public containsObject(object: Object) {
    return object.x + this.bounds.width > this.bounds.x && object.x < this.bounds.x + this.bounds.width &&
            object.y + this.bounds.height > this.bounds.y && object.y < this.bounds.y + this.bounds.height;
  }

  public intersectsObject(object: Object) {
    return object.x < this.bounds.x + this.bounds.width && object.x + object.width > this.bounds.x &&
            object.y < this.bounds.y + this.bounds.height && object.y + object.height > this.bounds.y;
  }

  public getIndex(object:Object){
    const {x, y, width, height} = object;
    const verticalMidpoint = this.bounds.x + (this.bounds.width / 2);
    const horizontalMidpoint = this.bounds.y + (this.bounds.height / 2);

    // Object can completely fit within the top quadrants
    const topQuadrant = (y < horizontalMidpoint && y + height < horizontalMidpoint);
    // Object can completely fit within the bottom quadrants
    const bottomQuadrant = (y > horizontalMidpoint);

    // Object can completely fit within the left quadrants
    if (x < verticalMidpoint && x + width < verticalMidpoint) {
      if (topQuadrant) {
        return 1;
      } else if (bottomQuadrant) {
        return 2;
      }
    }
    // Object can completely fit within the right quadrants
    else if (x > verticalMidpoint) {
      if (topQuadrant) {
        return 0;
      } else if (bottomQuadrant) {
        return 3;
      }
    }

    return -1;
  }

  public clear() {
    this.objects.clear();
    this.children.forEach(child => child.clear());
    this.children = [];
  }


  render(canvas: HTMLCanvasElement) {
    const ctx = canvas.getContext('2d');
    ctx!.clearRect(0, 0, canvas.width, canvas.height);
    this.renderNode(this, ctx!);
  }
  
  private renderNode(node: Quadtree, ctx: CanvasRenderingContext2D) {
    // Define the colors for different levels
    const colors = ['rgba(255, 255, 255, 0.5)', 'rgba(255, 0, 0, 0.5)', 'rgba(0, 255, 0, 0.5)', 'rgba(0, 0, 255, 0.5)'];
  
    // Determine the color for this node based on its depth
    const depth = this._maxDepth - node.level;
    ctx.fillStyle = colors[depth % colors.length];
  
    if (node.children.length === 0) {
      // Draw a rectangle for each object in this leaf node
      for (const object of node.objects) {
        ctx.fillStyle = 'red';
        ctx.fillRect(object.data.x, object.data.y, object.data.width, object.data.height);
      }
    } else {
      // Render the child nodes recursively
      for (const child of node.children) {
        this.renderNode(child, ctx);
      }
    }
  
    // Draw a rectangle for this node
    ctx.strokeStyle = 'white';
    ctx.strokeRect(node.bounds.x, node.bounds.y, node.bounds.width, node.bounds.height);
  
    // Draw a label for this node showing the number of objects it containsObject
    ctx.fillStyle = 'white';
    ctx.font = '12px Arial';
    ctx.textBaseline = 'middle';
    ctx.textAlign = 'center';
    ctx.fillText(node.objects.getSize().toString(), node.bounds.x + node.bounds.width / 2, node.bounds.y + node.bounds.height / 2);
  }
  
  
}
// const quadtree = new Quadtree({ x: 0, y: 0, width: 100, height: 100 }, 4, 10);
// const object1 = { x: 10, y: 10, width: 10, height: 10 };
// const object2 = { x: 60, y: 10, width: 10, height: 10 };
// const object3 = { x: 10, y: 60, width: 10, height: 10 };
// const object4 = { x: 60, y: 60, width: 10, height: 10 };

// quadtree.insert(object1);
// quadtree.insert(object2);
// quadtree.insert(object3);
// quadtree.insert(object4);

// console.log(quadtree.getIndex(object1)); // should return 1
// console.log(quadtree.getIndex(object2)); // should return 0
// console.log(quadtree.getIndex(object3)); // should return 2
// console.log(quadtree.getIndex(object4)); // should return 3


// const quadtree = new Quadtree({ x: 0, y: 0, width: 100, height: 100 }, 4, 10);
// const object = { x: 10, y: 10, width: 20, height: 20 };
// console.log(quadtree.containsObject(object)); // should output true

// const quadtree2 = new Quadtree({ x: 0, y: 0, width: 100, height: 100 }, 4, 10);
// const object2 = { x: 150, y: 150, width: 20, height: 20 };
// console.log(quadtree.intersectsObject(object2)); // should output true
