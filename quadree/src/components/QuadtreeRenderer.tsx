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
          quadtree.render(ctx);
          i++;
          setTimeout(insertloop, 100);
        }
      }
      insertloop();

      // let j = points.length - 1;
      // const removeloop = () => {
      //   if (j !== 0) {
      //     quadtree.removeObject(points[j]);
      //     quadtree.render(canvas);
      //     j--;
      //     setTimeout(removeloop, 100);
      //   }
      // }
      // removeloop();

      

    }
  }, [canvasRef, width, height, maxDepth, maxPoints, points]);

  return (
    <canvas ref={canvasRef} width={width} height={height} />
  );
};

export default QuadtreeRenderer;
