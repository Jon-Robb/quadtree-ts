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
  public parent: Quadtree | null

  constructor(bounds: { x: number, y: number, width: number, height: number }, maxDepth: number, maxObjects: number, level = 0, parent: Quadtree | null = null) {
    this._bounds = bounds;
    this._maxDepth = maxDepth;
    this._maxObjects = maxObjects;
    this._level = level;
    this.parent = parent;

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

  set objects(objects: DoublyLinkedList<Object>) {
    this._objects = objects;
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
  insert(object: Object): boolean {
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
  private subdivide(): void {
    const { x, y, width, height } = this.bounds;
    const halfWidth = width / 2;
    const halfHeight = height / 2;

    // Create four child nodes, each with the same maximum depth and maximum number of objects as the current node
    this.children.push(new Quadtree({ x: x, y: y, width: halfWidth, height: halfHeight }, this.maxDepth, this.maxObjects, this.level + 1, this));
    this.children.push(new Quadtree({ x: x + halfWidth, y: y, width: halfWidth, height: halfHeight }, this.maxDepth, this.maxObjects, this.level + 1, this));
    this.children.push(new Quadtree({ x: x, y: y + halfHeight, width: halfWidth, height: halfHeight }, this.maxDepth, this.maxObjects, this.level + 1, this));
    this.children.push(new Quadtree({ x: x + halfWidth, y: y + halfHeight, width: halfWidth, height: halfHeight }, this.maxDepth, this.maxObjects, this.level + 1, this));
  }

  // 
  // private containsObject(bounds: { x: number, y: number, width: number, height: number }) {
  //   return bounds.x + bounds.width > this.bounds.x && bounds.x < this.bounds.x + this.bounds.width &&
  //          bounds.y + bounds.height > this.bounds.y && bounds.y < this.bounds.y + this.bounds.height;
  // }

  /**
 * Checks if an object is contained within the boundaries of this quadtree node.
 * @param object The object to check.
 * @returns True if the object is contained within this node's boundaries, false otherwise.
 */
  public containsObject(object: Object): boolean {
    return object.x + this.bounds.width > this.bounds.x && object.x < this.bounds.x + this.bounds.width &&
      object.y + this.bounds.height > this.bounds.y && object.y < this.bounds.y + this.bounds.height;
  }

  public retrieveObjects(object: Object): Object[] {
    const objects: Object[] = [];

    // If the search area does not intersect with this Quadtree node, return an empty array
    if (!this.intersectsObject(object)) {
      return objects;
    }

    // If this is not a leaf node, recursively retrieve objects from the relevant child nodes
    if (this.children.length > 0) {
      const index = this.getIndex(object);
      if (index !== -1) {
        const childObjects = this.children[index].retrieveObjects(object);
        objects.push(...childObjects);
      } else {
        for (const child of this.children) {
          const childObjects = child.retrieveObjects(object);
          objects.push(...childObjects);
        }
      }
    }

    // If this is a leaf node, add objects that intersect with the search area
    for (const obj of this.objects) {
      if (this.intersectsObject(obj.data) && this.containsObject(obj.data)) {
        objects.push(obj.data);
      }
    }
    return objects;
  }

  /**
 * Finds the Quadtree node that contains the specified object.
 * @param object - The object to find.
 * @returns The Quadtree node that contains the object, or null if the object is not contained in the Quadtree.
 */
  public findNode(object: Object): Quadtree | null {
    if (!this.containsObject(object)) {
      return null;
    }
    if (this.children.length === 0) {
      console.log(this)
      return this;
    }
    const index = this.getIndex(object);
    if (index !== -1) {
      console.log(this.children[index])
      return this.children[index];
      
    } else {
      console.log(this)
      return this;
    }
  }

  /**
 * Removes an empty node from the Quadtree and recursively removes empty parent nodes.
 * @param node - The empty node to remove. Type Quadtree.
 */
  public removeEmptyNode(node: Quadtree): void {
    // if the node has parent, remove it from the parent's children
    if(node.parent){
      const index = node.parent.children.indexOf(node);
      if(index !== -1){
        node.parent.children.splice(index, 1);
      }
    }
    //recursively remove empty parent nodes
    if (node.parent?.objects.getSize() === 0 && node.parent?.children.length === 0) {
      this.removeEmptyNode(node.parent);
    }
  }

  /**
 * Removes the specified object from the Quadtree.
 * @param object - The object to remove.
 */
  public removeObject(object: Object): void {
    // Traverse the Quadtree to find the node containing the object to remove
    const node = this.findNode(object);

    if (node) {
      // Remove the object from the node's list of objects
      node.objects.remove(object);

      // If the node is now empty and hasno children, remove it from the Quadtree
      if (node.objects.getSize() === 0 && node.children.length === 0) {
        this.removeEmptyNode(node);
      }
    }
  }


  /**
 * Checks if an object intersects with the boundaries of this quadtree node.
 * @param object The object to check.
 * @returns True if the object intersects with this node's boundaries, false otherwise.
 */
  public intersectsObject(object: Object): boolean {
    return object.x < this.bounds.x + this.bounds.width && object.x + object.width > this.bounds.x &&
      object.y < this.bounds.y + this.bounds.height && object.y + object.height > this.bounds.y;
  }

  /**
 * Determines the index of the child Quadtree node in which an object belongs, based on the object's boundaries and the current node's bounds.
 * The returned index corresponds to the child node at that position in the current node's children array, as follows:
 *
 *   1  |  2
 *  ____|____
 *      |
 *   3  |  4
 *  ____|____
 *
 * If the object is located in the boundary lines of the current node but not fully contained within any of the child nodes, returns -1.
 *
 * @param object - The object to be indexed.
 * @returns The index of the child Quadtree node in which the object belongs, or -1 if the object is not fully contained within any of the child nodes.
 */
  public getIndex(object: Object) {
    const { x, y, width, height } = object;
    const verticalMidpoint = this.bounds.x + (this.bounds.width / 2);
    const horizontalMidpoint = this.bounds.y + (this.bounds.height / 2);

    // Object can completely fit within quadrants bool variables
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
        //ctx.fillStyle = 'red';
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

// console.log(quadtree.getIndex(object1)); // should return 0
// console.log(quadtree.getIndex(object2)); // should return 1
// console.log(quadtree.getIndex(object3)); // should return 2
// console.log(quadtree.getIndex(object4)); // should return 3


// const quadtree = new Quadtree({ x: 0, y: 0, width: 100, height: 100 }, 4, 10);
// const object = { x: 10, y: 10, width: 20, height: 20 };
// console.log(quadtree.containsObject(object)); // should output true

// const quadtree2 = new Quadtree({ x: 0, y: 0, width: 100, height: 100 }, 4, 10);
// const object2 = { x: 150, y: 150, width: 20, height: 20 };
// console.log(quadtree.intersectsObject(object2)); // should output true

// const canvas = document.createElement('canvas');
// const quadtree = new Quadtree({ x: 0, y: 0, width: canvas.width, height: canvas.height }, 10, 4);
// const objects: Object[] = [
//   { x: 10, y: 10, width: 10, height: 10 },
//   { x: 30, y: 30, width: 10, height: 10 },
//   { x: 50, y: 50, width: 10, height: 10 },
//   { x: 70, y: 70, width: 10, height: 10 },
//   { x: 90, y: 90, width: 10, height: 10 }
// ];
// for (const obj of objects) {
//   quadtree.insert(obj);
// }

// const searchArea: Object = { x: 20, y: 20, width: 60, height: 60 };
// const searchResults = quadtree.retrieveObjects(searchArea);
// console.log(searchResults);

// const qt = new Quadtree({x: 0, y: 0, width: 100, height: 100}, 4, 10);

// // Add some objects to the Quadtree
// const objects = [
//   {x: 10, y: 10, width: 10, height: 10},
//   {x: 20, y: 20, width: 10, height: 10},
//   {x: 30, y: 30, width: 10, height: 10},
//   {x: 40, y: 40, width: 10, height: 10},
//   {x: 50, y: 50,  width: 10, height: 10},
// ];
// objects.forEach((obj) => qt.insert(obj));

// // Remove an object that is in the Quadtree
// const objToRemove = objects[2];
// qt.removeObject(objToRemove);

// console.log(objToRemove); // should output null
// // Check if the object was removed
// if (qt.findNode(objToRemove) !== null) {
//   console.log('Error: object was not removed');
// }

// // Check if the node was correctly removed
// if (qt.findNode(objects[0])?.parent !== null) {
//   console.log('Error: empty node was not removed');
// }

// // Remove all objects from the Quadtree
// objects.forEach((obj) => qt.removeObject(obj));

// // Check if the Quadtree is empty
// if (qt.findNode({x: 0, y: 0, width: 100, height: 100})?.objects.getSize() !== 0) {
//   console.log('Error: Quadtree is not empty');
// }

// // Create a new Quadtree
// const quadtree = new Quadtree({ x: 0, y: 0, width: 100, height: 100 }, 4, 10);
// // Add objects to the Quadtree
// const obj1 = { x: 10, y: 10, width: 10, height: 10 };
// const obj2 = { x: 50, y: 50, width: 10, height: 10 };
// quadtree.insert(obj1);
// quadtree.insert(obj2);

// // Verify that the objects are in the Quadtree
// console.log(quadtree.containsObject(obj1)); // should log true
// console.log(quadtree.containsObject(obj2)); // should log true

// // Remove an object from the Quadtree
// quadtree.removeObject(obj1);
// console.log(quadtree.objects.getSize()); // should log 1
// // Verify that the object was removed from the Quadtree
// console.log(quadtree.containsObject(obj1)); // should log false
// console.log(quadtree.containsObject(obj2)); // should log true
// console.log(quadtree.objects.contains(obj1)); // should log false

const quadtree = new Quadtree({ x: 0, y: 0, width: 100, height: 100 }, 4, 10);
const object1:Object = { x: 10, y: 10, width: 10, height: 10 };
const object2:Object = { x: 60, y: 10, width: 10, height: 10 };
const object3:Object = { x: 10, y: 60, width: 10, height: 10 };
const object4:Object = { x: 60, y: 60, width: 10, height: 10 };
for (const obj of [object1, object2, object3, object4]) {
  quadtree.insert(obj);
}
console.log(quadtree.getIndex(object1)); // should return 0
console.log(quadtree.getIndex(object2)); // should return 1
console.log(quadtree.getIndex(object3)); // should return 2
console.log(quadtree.getIndex(object4)); // should return 3
console.log(quadtree.objects); // should output 4 objects
console.log(quadtree.containsObject(object1)); // should output true
console.log(quadtree.removeObject(object1)); // should output true
console.log(quadtree.objects); // should output 3 objects