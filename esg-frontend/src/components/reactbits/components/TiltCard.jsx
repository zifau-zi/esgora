import { useRef } from 'react';
import { motion, useMotionValue, useSpring } from 'motion/react';

const springConfig = { damping: 30, stiffness: 150, mass: 0.5 };

export default function TiltCard({ children, className = '', maxTilt = 8, hoverScale = 1.01 }) {
  const ref = useRef(null);

  const rotateX = useSpring(useMotionValue(0), springConfig);
  const rotateY = useSpring(useMotionValue(0), springConfig);
  const scale = useSpring(1, springConfig);

  function handleMouseMove(e) {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width - 0.5;
    const py = (e.clientY - rect.top) / rect.height - 0.5;
    rotateX.set(-py * maxTilt);
    rotateY.set(px * maxTilt);
  }

  function handleMouseEnter() {
    scale.set(hoverScale);
  }

  function handleMouseLeave() {
    rotateX.set(0);
    rotateY.set(0);
    scale.set(1);
  }

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={className}
      style={{
        rotateX,
        rotateY,
        scale,
        transformStyle: 'preserve-3d',
        transformPerspective: 900,
        willChange: 'transform',
      }}
    >
      {children}
    </motion.div>
  );
}