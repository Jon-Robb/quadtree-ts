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
      //quadtreeRef.current = quadtree;
      // Insert the points into the quadtree
      let i = 0;
      const insertloop = () => {
        if (i < points.length) {
          quadtree.insert(points[i]);
          quadtree.render(canvas);
          i++;
          setTimeout(insertloop, 100);
        }
      }
      insertloop();


      // const removeLoop = () => {
      //   points.forEach((point) => {
      //     quadtree.removeObject(point);
      //     quadtree.render(canvas);
      //   }
      //   )
      // }
      //   removeLoop()
      // for (const point of points) {
      //   quadtree.insert(point);
      // }
      // Render the quadtree over time
      // let lastFrameTime = Date.now();
      // let timeSinceLastFrame = 1000 / fps;
      // const renderLoop = () => {
      //   const currentTime = Date.now();
      //   const deltaTime = currentTime - lastFrameTime;
      //   lastFrameTime = currentTime;
      //   timeSinceLastFrame += deltaTime;

      //   if (timeSinceLastFrame >= 1000 / fps) {
      //     timeSinceLastFrame = 0;
      //     ctx?.clearRect(0, 0, canvas.width, canvas.height);
      //     quadtree.render(canvas);
      //   }

      //   // Call the render loop on the next frame
      //   requestAnimationFrame(renderLoop);
      // };

      // requestAnimationFrame(renderLoop);
    }
  }, [canvasRef, width, height, maxDepth, maxPoints, points]);

  return (
    <canvas ref={canvasRef} width={width} height={height} />
  );
};

export default QuadtreeRenderer;
