import { useMotionValue, useSpring, useInView } from 'framer-motion';
import { useRef, useEffect, useState } from 'react';

interface AnimatedCounterProps {
  value: number;
  suffix?: string;
  prefix?: string;
  decimals?: number;
  simulateLive?: boolean;
}

const AnimatedCounter = ({ value, suffix = '', prefix = '', decimals = 0, simulateLive = false }: AnimatedCounterProps) => {
  const ref = useRef(null);
  const motionValue = useMotionValue(0);
  const springValue = useSpring(motionValue, {
    damping: 30,
    stiffness: 100,
  });
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    if (isInView) {
      motionValue.set(value);
    }
  }, [isInView, value, motionValue]);

  useEffect(() => {
    return springValue.on("change", (latest) => {
      setDisplayValue(latest);
    });
  }, [springValue]);

  // Periodic "Live" increment effect
  useEffect(() => {
    if (!simulateLive) return;
    
    const interval = setInterval(() => {
      const increment = Math.random() * (value * 0.001);
      motionValue.set(value + increment);
      setTimeout(() => motionValue.set(value), 1500);
    }, 5000);
    return () => clearInterval(interval);
  }, [value, motionValue, simulateLive]);

  return (
    <span ref={ref}>
      {prefix}
      {displayValue.toLocaleString(undefined, {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      })}
      {suffix}
    </span>
  );
};

export default AnimatedCounter;
