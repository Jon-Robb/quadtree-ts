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
  const quadtreeRef = useRef<Quadtree | null>(null);
  const fps = 30;

  useEffect(() => {
    if (canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      const quadtree = new Quadtree({ x: 0, y: 0, width: width, height: height }, maxDepth, maxPoints);

      let i = 0;
      const insertloop = () => {
        if (i < points.length) {
          quadtree.insert(points[i]);
          quadtree.render(canvas);
          i++;
          setTimeout(insertloop, 100);
        }
      }
      for (let i = 0; i < points.length; i++) {
        quadtree.insert(points[i]);
      }

      const removeloop = () => {
        if (i < points.length) {
          quadtree.removeObject(points[i]);
          quadtree.render(canvas);
          i++;
          setTimeout(removeloop, 100);
          console.log("removing" + points[i]);
        }
      }
      removeloop();

      

    }
  }, [canvasRef, width, height, maxDepth, maxPoints, points]);

  return (
    <canvas ref={canvasRef} width={width} height={height} />
  );
};

export default QuadtreeRenderer;
