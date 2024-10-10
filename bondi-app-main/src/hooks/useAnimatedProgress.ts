import { useState, useEffect } from 'react';

const easeOutCubic = (t: number): number => {
  return 1 - Math.pow(1 - t, 3);
};

const useAnimatedProgress = (targetValue: number, duration: number = 1000) => {
  const [value, setValue] = useState(0);

  useEffect(() => {
    let startTime: number | null = null;
    let animationFrameId: number;

    const animate = (currentTime: number) => {
      if (startTime === null) {
        startTime = currentTime;
      }

      const elapsedTime = currentTime - startTime;
      const progress = Math.min(elapsedTime / duration, 1);
      const easedProgress = easeOutCubic(progress);

      setValue(easedProgress * targetValue);

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(animate);
      }
    };

    animationFrameId = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(animationFrameId);
  }, [targetValue, duration]);

  return value;
};

export default useAnimatedProgress;