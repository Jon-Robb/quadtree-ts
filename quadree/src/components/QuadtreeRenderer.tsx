import React, { useRef, useEffect } from 'react';
import Quadtree from '../classes/Quadtree';
import GameObject from '../classes/Quadtree';

interface Props {
  width: number;
  height: number;
  maxDepth: number;
  maxPoints: number;
  objects: GameObject [];
}

export const QuadtreeRenderer: React.FC<Props> = ({ width, height, maxDepth, maxPoints, objects }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');

      const quadtree = new Quadtree({ x: 0, y: 0, width: width, height: height }, maxDepth, maxPoints);

      for (const point of objects) {
        quadtree.insert(point);
      }

      quadtree.render(canvas);
    }
  }, [canvasRef, width, height, maxDepth, maxPoints, objects]);

  return (
    <canvas ref={canvasRef} width={width} height={height} />
  );
};

export default QuadtreeRenderer;
