import Quadtree from "../classes/Quadtree";

describe('Quadtree', () => {
    describe('constructor', () => {
      it('creates a quadtree with the correct bounds', () => {
        const quadtree = new Quadtree({ x: 0, y: 0, width: 100, height: 100 }, 4, 4);
        expect(quadtree.bounds).toEqual({ x: 0, y: 0, width: 100, height: 100 });
        expect(quadtree.maxDepth).toBe(4);
        expect(quadtree.maxObjects).toBe(4);
        expect(quadtree.objects).toEqual([]);
        expect(quadtree.children).toEqual([]);
      });
    })});