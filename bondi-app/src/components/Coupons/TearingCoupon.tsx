import React, { useEffect, useState } from 'react';
import { useSpring, animated, config } from 'react-spring';

interface TearingCouponProps {
  children: React.ReactNode;
  redeemedContent: React.ReactNode;
  onTearComplete: () => void;
}

const TearingCoupon: React.FC<TearingCouponProps> = ({ children, redeemedContent, onTearComplete }) => {
  const [isTearing, setIsTearing] = useState(false);

  const { rotateZ, translateY, translateX, opacity, scale } = useSpring({
    rotateZ: isTearing ? -60 : 0, // Increased rotation angle for more dramatic effect
    translateY: isTearing ? 600 : 0, // Increased downward movement
    translateX: isTearing ? -150 : 0, // Increased leftward movement
    opacity: isTearing ? 0 : 1,
    scale: isTearing ? 0.7 : 1, // Increased scaling effect
    config: { ...config.molasses, duration: 1500 }, // Longer duration for more visible effect
    onRest: () => {
      if (isTearing) {
        onTearComplete();
      }
    },
  });

  useEffect(() => {
    const timer = setTimeout(() => setIsTearing(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="relative w-full h-full overflow-hidden">
      {/* Redeemed content (underneath) */}
      <div className="absolute inset-0">
        {redeemedContent}
      </div>

      {/* Tearing coupon (on top) */}
      <animated.div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          transformOrigin: 'top right',
          transform: rotateZ.to((r) => 
            `rotateZ(${r}deg) translateY(${translateY.get()}px) translateX(${translateX.get()}px) scale(${scale.get()})`
          ),
          opacity,
          zIndex: 10,
        }}
      >
        {children}
      </animated.div>
    </div>
  );
};

export default TearingCoupon;