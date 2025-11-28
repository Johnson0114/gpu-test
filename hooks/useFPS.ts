import { useRef, useEffect, useState } from 'react';

export const useFPS = () => {
  const requestRef = useRef<number>();
  const previousTimeRef = useRef<number>();
  const [fps, setFps] = useState(0);
  const frameCount = useRef(0);
  const lastCheck = useRef(0);

  const animate = (time: number) => {
    if (previousTimeRef.current !== undefined) {
      frameCount.current++;
      
      // Update FPS every 500ms
      if (time - lastCheck.current >= 500) {
        const delta = time - lastCheck.current;
        const currentFps = Math.round((frameCount.current * 1000) / delta);
        setFps(currentFps);
        frameCount.current = 0;
        lastCheck.current = time;
      }
    } else {
      lastCheck.current = time;
    }
    
    previousTimeRef.current = time;
    requestRef.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
    requestRef.current = requestAnimationFrame(animate);
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, []);

  return fps;
};