import { BoudingBox } from "../classes/Quadtree";
import { useEffect, useRef } from "react";
import Quadtree from "../classes/Quadtree";

interface Props {
  width: number;
  height: number;
  maxDepth: number;
  maxPoints: number;
  points: BoudingBox[];
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

      // let i = 0;
      // const insertloop = () => {
      //   if (i < points.length) {
      //     quadtree.insert(points[i]);
      //     quadtree.render(ctx!);
      //     i++;
      //     setTimeout(insertloop, 100);
      //   }
      // }
      // insertloop();
      for (let i = 0; i < points.length; i++) {
        quadtree.insert(points[i]);
      }
      // console.log(quadtree.retrieveCollisionsWithBB(points[0]));
      // console.log(points[0]);
      if (quadtree.queryRange(points[0]).size > 1) {
        console.log(quadtree.queryRange(points[0]))
        console.log(points[0]);
      }
      console.log(quadtree.retrieveAllCollisions());
      // console.log(quadtree.getTotalObjects());
      // // console.log(quadtree.retrieveCollisions(points[0]));
      // points.forEach(point => {
      //   if (quadtree.retrieveCollisions(point).length > 1) {
      //     console.log(quadtree.retrieveCollisions(point))
      //   }
      // })

      // quadtree.render(ctx!);
      // console.log(quadtree.getTotalObjects());
      // let j = points.length - 1;
      // const removeloop = () => {
      //   if (j !== 0) {
      //     quadtree.removeObject(points[j]);
      //     quadtree.render(ctx!);
      //     j--;
      //     setTimeout(removeloop, 100);
      //   }
      // }
      // removeloop();
      quadtree.render(ctx!);
      console.log(quadtree.getTotalObjects());

    }
  }, [canvasRef, width, height, maxDepth, maxPoints, points]);

  return (
    <canvas ref={canvasRef} width={width} height={height} />
  );
};

export default QuadtreeRenderer;
