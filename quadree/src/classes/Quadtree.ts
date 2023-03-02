import DoublyLinkedList from "./DoublyLinkedList";

export interface BoundingBoxInterface {
  x: number;
  y: number;
  width: number;
  height: number;
}

export default class Quadtree {
  private _boundingBoxes: DoublyLinkedList<BoundingBoxInterface> = new DoublyLinkedList();
  // private _maxDepth: number;
  private _maxObjects: number;
  private _bounds: { x: number, y: number, width: number, height: number };
  private _children: Quadtree[] = [];
  private _level: number;
  private _parent: Quadtree | null
  private _collisionTreshold : number = 128;
  public count = 0 // for debugging

  constructor(bounds: { x: number, y: number, width: number, height: number },
    //  maxDepth: number, 
    maxObjects: number, level = 0, parent: Quadtree | null = null) {
    this._bounds = bounds;
    // this._maxDepth = maxDepth;
    this._maxObjects = maxObjects;
    this._level = level;
    this._parent = parent;

  }

  get parent() {
    return this._parent;
  }

  get collisionTreshold() {
    return this._collisionTreshold;
  }

  get level() {
    return this._level
  
  }

  // get maxDepth() {
  //   return this._maxDepth;
  // }

  get maxObjects() {
    return this._maxObjects;
  }

  get bounds() {
    return this._bounds;
  }

  get boundingBoxes() {
    return this._boundingBoxes;
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

  set boundingBoxes(boundingBoxes: DoublyLinkedList<BoundingBoxInterface>) {
    this._boundingBoxes = boundingBoxes;
  }


  /**
  Inserts a bounding box boundingBox into the quadtree. If the node already has children, it tries to insert the boundingBox into one of them
  based on the boundingBox's location relative to the node's bounds. If the boundingBox doesn't fit into any child node, it is added to the node's
  boundingBox list. If the node exceeds the maximum number of boundingBoxes it can hold and the maximum depth hasn't been reached, it subdivides and
  redistributes the boundingBoxes to its children.
  @param boundingBox - The bounding box boundingBox to be inserted into the quadtree.
  */
  insert(boundingBox: BoundingBoxInterface): void {
    let index: number;
    if (this.children[0]) {
      index = this.getIndex(boundingBox);
      if (index !== -1) {
        this.children[index].insert(boundingBox);
        return;
      }
    }
    this.boundingBoxes.addLast(boundingBox);
    this.count++; //for debugging

    // Check if the node shoukd be subdivided based  on boundingBox size and max boundingBox per node
    if (this.boundingBoxes.size >= this.maxObjects) {
      if (!this.children[0]) {
        this.subdivide();
      }
      this.boundingBoxes.forEach((node) => {
        index = this.getIndex(node);
        if (index !== -1) {
          this.children[index].insert(node);
          this.boundingBoxes.remove(node);
        }
      });
    }
  }

  /**
  * Subdivides the current node into four child nodes and redistributes
  * the boundingBoxes that were previously stored in the current node among
  * the child nodes. The child nodes are created with the same maximum
  * depth and maximum number of boundingBoxes as the current node.
  */
  private subdivide(): void {
    const { x, y, width, height } = this.bounds;
    const halfWidth = width / 2;
    const halfHeight = height / 2;

    // Create four child nodes, each with the same maximum depth and maximum number of boundingBoxes as the current node
    this.children.push(new Quadtree({ x: x, y: y, width: halfWidth, height: halfHeight }, this.maxObjects, this.level + 1, this));
    this.children.push(new Quadtree({ x: x + halfWidth, y: y, width: halfWidth, height: halfHeight }, this.maxObjects, this.level + 1, this));
    this.children.push(new Quadtree({ x: x, y: y + halfHeight, width: halfWidth, height: halfHeight }, this.maxObjects, this.level + 1, this));
    this.children.push(new Quadtree({ x: x + halfWidth, y: y + halfHeight, width: halfWidth, height: halfHeight }, this.maxObjects, this.level + 1, this));
  }

  /**
 * Checks if an boundingBox is contained within the boundaries of this quadtree node.
 * @param boundingBox The boundingBox to check.
 * @returns True if the boundingBox is contained within this node's boundaries, false otherwise.
 */
  public containsObject(boundingBox: BoundingBoxInterface): boolean {
    return boundingBox.x > this.bounds.x && boundingBox.x + boundingBox.width < this.bounds.x + this.bounds.width &&
      boundingBox.y > this.bounds.y && boundingBox.y + boundingBox.height < this.bounds.y + this.bounds.height;
  }

    /**
  * Checks if an boundingBox intersects with the boundaries of this quadtree node.
  * @param boundingBox The boundingBox to check.
  * @param obj2 The boundingBox to check against. Optional, if not provided, the node's own bounds are used.
  * @returns True if the boundingBox intersects with this node's boundaries, false otherwise.
  */
  public intersects(boundingBox: BoundingBoxInterface, obj2?: BoundingBoxInterface): boolean {
    const bounds = obj2 ? obj2 : this.bounds;
    return boundingBox.x < bounds.x + bounds.width && boundingBox.x + boundingBox.width > bounds.x &&
      boundingBox.y < bounds.y + bounds.height && boundingBox.y + boundingBox.height > bounds.y;
  }

  /**
   * Returns an array of boundingBoxes that are colliding with the given boundingBox.
   * @param boundingBox The boundingBox to check.
    */
  public retrieveIntersectingBoundingBoxes(boundingBox: BoundingBoxInterface): BoundingBoxInterface[] {
    const boundingBoxes: Set<BoundingBoxInterface> = new Set();
    this.boundingBoxes.forEach((obj) => {
      if (boundingBox !== obj && this.intersects(boundingBox, obj)) {
        boundingBoxes.add(obj);
      }
    });
    if (this.children[0]) {
      const index = this.getIndex(boundingBox);
      if (index !== -1) {
        const childObjects = this.children[index].retrieveIntersectingBoundingBoxes(boundingBox);
        for (const childObject of childObjects) {
          boundingBoxes.add(childObject);
        }
      } else {
        for (const child of this.children) {
          const childObjects = child.retrieveIntersectingBoundingBoxes(boundingBox);
          for (const childObject of childObjects) {
            boundingBoxes.add(childObject);
          }
        }
      }
    }
    return Array.from(boundingBoxes.keys());
  }

  public retrieveAllCollisions(): Set<BoundingBoxInterface> {
    const collisions: Set<BoundingBoxInterface> = new Set();
    this.boundingBoxes.forEach((boundingBox) => {
      const collidingBoundingBoxes = this.retrieveIntersectingBoundingBoxes(boundingBox);
      for (const collidingBoundingBox of collidingBoundingBoxes) {
        collisions.add(collidingBoundingBox);
      }
    });
    if (this.children[0]) {
      for (const child of this.children) {
        const childCollisions = child.retrieveAllCollisions();
        for (const childCollision of childCollisions) {
          collisions.add(childCollision);
        }
      }
    }
    return collisions;
  }


 

  public getDistance(boundingBox: BoundingBoxInterface, node: Quadtree): number {
    const { x, y, width, height } = node.bounds;
    const dx = Math.max(Math.abs(boundingBox.x - (x + width / 2)) - (width / 2 + boundingBox.width / 2), 0);
    const dy = Math.max(Math.abs(boundingBox.y - (y + height / 2)) - (height / 2 + boundingBox.height / 2), 0);
    return Math.sqrt(dx * dx + dy * dy);
  }

  private shouldTestCollision(node: Quadtree, boundingBox: BoundingBoxInterface) {
    return this.getDistance(boundingBox, node) < this.collisionTreshold;
  }

  public queryRange(range: BoundingBoxInterface): Set<BoundingBoxInterface> {
    const objectsFound: Set<BoundingBoxInterface> = new Set();
    if (!this.intersects(range)) {
      return objectsFound;
    }
    this.boundingBoxes.forEach((obj) => {
      if (this.intersects(obj, range)) {
        objectsFound.add(obj);
      }
    });
    if (this.children[0]) {
      for (const child of this.children) {
        if (this.shouldTestCollision(child, range)) {
          const childObjects = child.queryRange(range);
          for (const childObject of childObjects) {
            objectsFound.add(childObject);
          }
        }
      }
    }
    return objectsFound;
  }

  public getTotalObjects(): number {
    let count = this.boundingBoxes.size;
    for (const child of this.children) {
      count += child.getTotalObjects();
    }
    return count;
  }

  /**
 * Finds the Quadtree node that contains the specified boundingBox.
 * @param boundingBox - The boundingBox to find.
 * @returns The Quadtree node that contains the boundingBox, or null if the boundingBox is not contained in the Quadtree.
 */
  public findNode(boundingBox: BoundingBoxInterface): Quadtree | null {
    if (!this.intersects(boundingBox)) {
      return null;
    }
    if (this.children.length === 0) {
      return this;
    }
    const index = this.getIndex(boundingBox);
    if (index !== -1) {
      return this.children[index];

    } else {
      return this;
    }
  }

  public updateObject(boundingBox: BoundingBoxInterface): void {
    const node = this.findNode(boundingBox);
    if (!node) {
      return;
    }
    if (node.boundingBoxes.remove(boundingBox)) {
      const newNode = this.findNode(boundingBox);
      newNode?.insert(boundingBox);
    }
  }



  /**
 * Removes an empty node from the Quadtree and recursively removes empty parent nodes.
 * @param node - The empty node to remove. Type Quadtree.
 */
  public removeEmptyNode(node: Quadtree): void {
    // if the node has parent, remove it from the parent's children
    if (node.parent) {
      const index = node.parent.children.indexOf(node);
      if (index !== -1) {
        node.parent.children.splice(index, 1);
      }
    }
    //recursively remove empty parent nodes
    if (node.parent?.boundingBoxes.size === 0 && node.parent?.children.length === 0) {
      this.removeEmptyNode(node.parent);
    }
  }

  /**
 * Removes the specified boundingBox from the Quadtree.
 * @param boundingBox - The boundingBox to remove.
 */
  public removeObject(boundingBox: BoundingBoxInterface): void {
    // Traverse the Quadtree to find the node containing the boundingBox to remove
    const node = this.findNode(boundingBox);

    if (node) {
      // Remove the boundingBox from the node's list of boundingBoxes
      node.boundingBoxes.remove(boundingBox);

      // If the node is now empty and hasno children, remove it from the Quadtree
      if (node.boundingBoxes.size === 0 && node.children.length === 0) {
        this.removeEmptyNode(node);
      }
    }
  }

  /**
 * Determines the index of the child Quadtree node in which an boundingBox belongs, based on the boundingBox's boundaries and the current node's bounds.
 * The returned index corresponds to the child node at that position in the current node's children array, as follows:
 *
 *   0  |  1
 *  ____|____
 *      |
 *   2  |  3
 *  ____|____
 *
 * If the boundingBox is located in the boundary lines of the current node but not fully contained within any of the child nodes, returns -1.
 *
 * @param boundingBox - The boundingBox to be indexed.
 * @returns The index of the child Quadtree node in which the boundingBox belongs, or -1 if the boundingBox is not fully contained within any of the child nodes.
 */
  public getIndex(boundingBox: BoundingBoxInterface) {
    const { x, y, width, height } = boundingBox;
    const verticalMidpoint = this.bounds.x + (this.bounds.width / 2);
    const horizontalMidpoint = this.bounds.y + (this.bounds.height / 2);

    // BoundingBoxInterface can completely fit within quadrants bool variables
    const topQuadrant = (y < horizontalMidpoint && y + height < horizontalMidpoint);
    const leftQuadrant = (x < verticalMidpoint && x + width < verticalMidpoint);
    const rightQuadrant = (x > verticalMidpoint);

    if (leftQuadrant) {
      if (topQuadrant) {
        return 0;
      } else {
        return 2;
      }
    } else if (rightQuadrant) {
      if (topQuadrant) {
        return 1;
      } else {
        return 3;
      }
    }

    const objectCenterX = x + width / 2;
    const objectCenterY = y + height / 2;
    if (objectCenterX >= this.bounds.x && objectCenterX <= this.bounds.x + this.bounds.width &&
      objectCenterY >= this.bounds.y && objectCenterY <= this.bounds.y + this.bounds.height) {
      return -1;
    }
    
    return -1;
  }

  public clear() {
    this.boundingBoxes.clear();
    this.children.forEach(child => child.clear());
    this.children = [];
  }

  public render(ctx: CanvasRenderingContext2D): void {
    // Define the colors for different levels
    const colors = ['rgba(255, 255, 255, 0.5)', 'rgba(255, 0, 0, 0.5)', 'rgba(0, 255, 0, 0.5)', 'rgba(0, 0, 255, 0.5)'];

    const renderNode = (node: Quadtree) => {
      // Determine the color for this node based on its depth
      // const depth = this.maxDepth - node.level;
      ctx.fillStyle = "green";

      if (node.children.length === 0) {
        // Draw a rectangle for each boundingBox in this leaf node
        for (const boundingBox of node.boundingBoxes) {
          if (node.retrieveIntersectingBoundingBoxes(boundingBox.data)) {
            ctx.fillStyle = "red";
            ctx.fillRect(boundingBox.data.x, boundingBox.data.y, boundingBox.data.width, boundingBox.data.height);
          }
          else {
            ctx.fillRect(boundingBox.data.x, boundingBox.data.y, boundingBox.data.width, boundingBox.data.height);

          }

        }
      } else {
        // Render the child nodes recursively
        for (const child of node.children) {
          renderNode(child);
        }
      }

      // Draw a rectangle for this node
      ctx.strokeStyle = 'black';
      ctx.strokeRect(node.bounds.x, node.bounds.y, node.bounds.width, node.bounds.height);

      // Draw a label for this node showing the number of boundingBoxes it contains
      ctx.fillStyle = 'black';
      ctx.font = '12px Arial';
      ctx.textBaseline = 'middle';
      ctx.textAlign = 'center';
      ctx.fillText(node.boundingBoxes.size.toString(), node.bounds.x + node.bounds.width / 2, node.bounds.y + node.bounds.height / 2);
    }

    // Render the root node and its children recursively
    renderNode(this);
  }

  public renderTree(ctx: CanvasRenderingContext2D): void {
    const renderNode = (node: Quadtree) => {
      // Draw a rectangle for this node
      ctx.strokeStyle = 'black';
      ctx.strokeRect(node.bounds.x, node.bounds.y, node.bounds.width, node.bounds.height);

      // Draw a label for this node showing the number of boundingBoxes it contains
      ctx.fillStyle = 'black';
      ctx.font = '12px Arial';
      ctx.textBaseline = 'middle';
      ctx.textAlign = 'center';
      ctx.fillText(node.boundingBoxes.size.toString(), node.bounds.x + node.bounds.width / 2, node.bounds.y + node.bounds.height / 2);

      // Render the child nodes recursively
      for (const child of node.children) {
        renderNode(child);
      }
    }

    // Render the root node and its children recursively
    renderNode(this);
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

// console.log(quadtree.getIndex(object1)); // should return 0
// console.log(quadtree.getIndex(object2)); // should return 1
// console.log(quadtree.getIndex(object3)); // should return 2
// console.log(quadtree.getIndex(object4)); // should return 3


// const quadtree = new Quadtree({ x: 0, y: 0, width: 100, height: 100 }, 4, 10);
// const boundingBox = { x: 10, y: 10, width: 20, height: 20 };
// console.log(quadtree.containsObject(boundingBox)); // should output true

// const quadtree2 = new Quadtree({ x: 0, y: 0, width: 100, height: 100 }, 4, 10);
// const object2 = { x: 150, y: 150, width: 20, height: 20 };
// console.log(quadtree.intersects(object2)); // should output true

// const canvas = document.createElement('canvas');
// const quadtree = new Quadtree({ x: 0, y: 0, width: canvas.width, height: canvas.height }, 10, 4);
// const boundingBoxes: BoundingBoxInterface[] = [
//   { x: 10, y: 10, width: 10, height: 10 },
//   { x: 30, y: 30, width: 10, height: 10 },
//   { x: 50, y: 50, width: 10, height: 10 },
//   { x: 70, y: 70, width: 10, height: 10 },
//   { x: 90, y: 90, width: 10, height: 10 }
// ];
// for (const obj of boundingBoxes) {
//   quadtree.insert(obj);
// }

// const searchArea: BoundingBoxInterface = { x: 20, y: 20, width: 60, height: 60 };
// const searchResults = quadtree.retrieveObjects(searchArea);
// console.log(searchResults);

// const qt = new Quadtree({x: 0, y: 0, width: 100, height: 100}, 4, 10);

// // Add some boundingBoxes to the Quadtree
// const boundingBoxes = [
//   {x: 10, y: 10, width: 10, height: 10},
//   {x: 20, y: 20, width: 10, height: 10},
//   {x: 30, y: 30, width: 10, height: 10},
//   {x: 40, y: 40, width: 10, height: 10},
//   {x: 50, y: 50,  width: 10, height: 10},
// ];
// boundingBoxes.forEach((obj) => qt.insert(obj));

// // Remove an boundingBox that is in the Quadtree
// const objToRemove = boundingBoxes[2];
// qt.removeObject(objToRemove);

// console.log(objToRemove); // should output null
// // Check if the boundingBox was removed
// if (qt.findNode(objToRemove) !== null) {
//   console.log('Error: boundingBox was not removed');
// }

// // Check if the node was correctly removed
// if (qt.findNode(boundingBoxes[0])?.parent !== null) {
//   console.log('Error: empty node was not removed');
// }

// // Remove all boundingBoxes from the Quadtree
// boundingBoxes.forEach((obj) => qt.removeObject(obj));

// // Check if the Quadtree is empty
// if (qt.findNode({x: 0, y: 0, width: 100, height: 100})?.boundingBoxes.getSize() !== 0) {
//   console.log('Error: Quadtree is not empty');
// }

// // Create a new Quadtree
// const quadtree = new Quadtree({ x: 0, y: 0, width: 100, height: 100 }, 4, 10);
// // Add boundingBoxes to the Quadtree
// const obj1 = { x: 10, y: 10, width: 10, height: 10 };
// const obj2 = { x: 50, y: 50, width: 10, height: 10 };
// quadtree.insert(obj1);
// quadtree.insert(obj2);

// // Verify that the boundingBoxes are in the Quadtree
// console.log(quadtree.containsObject(obj1)); // should log true
// console.log(quadtree.containsObject(obj2)); // should log true

// // Remove an boundingBox from the Quadtree
// quadtree.removeObject(obj1);
// console.log(quadtree.boundingBoxes.getSize()); // should log 1
// // Verify that the boundingBox was removed from the Quadtree
// console.log(quadtree.containsObject(obj1)); // should log false
// console.log(quadtree.containsObject(obj2)); // should log true
// console.log(quadtree.boundingBoxes.contains(obj1)); // should log false

// const quadtree = new Quadtree({ x: 0, y: 0, width: 100, height: 100 }, 4, 10);
// const object1: BoundingBoxInterface = { x: 10, y: 10, width: 10, height: 10 };
// const object2: BoundingBoxInterface = { x: 60, y: 10, width: 10, height: 10 };
// const object3: BoundingBoxInterface = { x: 10, y: 60, width: 10, height: 10 };
// const object4: BoundingBoxInterface = { x: 100, y: 100, width: 10, height: 10 };
// for (const obj of [object1, object2, object3, object4]) {
//   quadtree.insert(obj);
// }
// console.log(quadtree.getIndex(object1)); // should return 0
// console.log(quadtree.getIndex(object2)); // should return 1
// console.log(quadtree.getIndex(object3)); // should return 2
// console.log(quadtree.getIndex(object4)); // should return 3
// console.log(quadtree.boundingBoxes); // should output 4 boundingBoxes
// console.log(quadtree.containsObject(object1)); // should output true
// console.log(quadtree.removeObject(object1)); // should output true
// console.log(quadtree.boundingBoxes); // should output 3 boundingBoxes

// const quadtree = new Quadtree({ x: 0, y: 0, width: 1920, height: 1080 }, 4, 10);
// for (let i = 0; i < 100; i++) {
//   quadtree.insert({ x: Math.random() * 750 + 33, y: Math.random() * 550 + 33, width: 32, height: 32 });
// }

// console.log(quadtree.getTotalObjects()); // should output 10

// const list = new DoublyLinkedList();
// for (let i = 0; i < 1000; i++) {
//   list.addLast(i);
// }
// console.log(list.getSize()); // should output 1000

// create a quadtree and insert some boundingBoxes
const quadtree = new Quadtree({ x: 0, y: 0, width: 100, height: 100 }, 10);
const boundingBoxes = [
  { x: 10, y: 10, width: 10, height: 10 },
  { x: 30, y: 30, width: 10, height: 10 },
  { x: 50, y: 50, width: 10, height: 10 },
  { x: 70, y: 70, width: 10, height: 10 },
  { x: 90, y: 90, width: 10, height: 10 },
];
for (const obj of boundingBoxes) {
  quadtree.insert(obj);
}
// query for boundingBoxes within a range
// const objectsInRange = quadtree.retrieveIntersectingBoundingBoxes({ x: 0, y: 0, width: 100, height: 100 });
// print the results
// console.log(objectsInRange);
console.log(quadtree)
// boundingBoxes.forEach((obj) => {obj.x += 50, obj.y += 50; quadtree.updateObject(obj);});
// console.log(quadtree)
