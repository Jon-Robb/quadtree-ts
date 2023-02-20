import { Object } from "../classes/Quadtree";
import { useEffect, useRef } from "react";
import Quadtree from "../classes/Quadtree";

interface Props {
  width: number;
  height: number;
  maxDepth: number;
  maxPoints: number;
  points: Object[];
}

const QuadtreeRenderer: React.FC<Props> = ({ width, height, maxDepth, maxPoints, points }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');

      const quadtree = new Quadtree({ x: 0, y: 0, width: width, height: height }, maxDepth, maxPoints);

      for (const point of points) {
        quadtree.insert(point);
      }
      quadtree.render(canvas);
      console.log(quadtree);
    }
  }, [canvasRef, width, height, maxDepth, maxPoints, points]);

  return (
    <canvas ref={canvasRef} width={width} height={height} />
  );
};

export default QuadtreeRenderer;
