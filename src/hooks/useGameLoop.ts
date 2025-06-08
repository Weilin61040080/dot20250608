import { useRef, useEffect } from 'react';

type GameLoopCallback = (deltaTime: number) => void;

/**
 * Custom hook to handle the game loop
 * @param callback Function to call on each frame
 * @param fps Optional target FPS (defaults to using requestAnimationFrame)
 */
const useGameLoop = (callback: GameLoopCallback, fps?: number): void => {
  const requestRef = useRef<number | undefined>(undefined);
  const previousTimeRef = useRef<number | undefined>(undefined);
  const callbackRef = useRef<GameLoopCallback>(callback);
  
  // Keep the callback ref updated with the latest callback
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);
  
  useEffect(() => {
    const animate = (time: number) => {
      if (previousTimeRef.current !== undefined) {
        const deltaTime = time - previousTimeRef.current;
        callbackRef.current(deltaTime);
      }
      previousTimeRef.current = time;
      requestRef.current = requestAnimationFrame(animate);
    };
    
    // If a specific FPS is requested, use setInterval instead
    if (fps) {
      const interval = 1000 / fps;
      const intervalId = setInterval(() => {
        const now = performance.now();
        if (previousTimeRef.current !== undefined) {
          const deltaTime = now - previousTimeRef.current;
          callbackRef.current(deltaTime);
        }
        previousTimeRef.current = now;
      }, interval);
      
      return () => clearInterval(intervalId);
    } else {
      requestRef.current = requestAnimationFrame(animate);
      return () => {
        if (requestRef.current) {
          cancelAnimationFrame(requestRef.current);
        }
      };
    }
  }, [fps]);
};

export default useGameLoop; 