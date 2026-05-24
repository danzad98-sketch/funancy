'use client';

import { useEffect, useRef, useState } from 'react';

interface Props {
  value: number;
  /** Animation duration in ms (default 420). */
  duration?: number;
  /** If true, briefly pops the number with a scale flash on every change. */
  flash?: boolean;
  /** Format value for display (default: toLocaleString). */
  format?: (n: number) => string;
  className?: string;
}

/**
 * Smoothly animates a numeric value when it changes. Purely visual — the
 * actual store value remains the authoritative source, so game logic is
 * unaffected even mid-animation.
 */
export default function CountUp({
  value,
  duration = 420,
  flash = true,
  format = (n) => Math.round(n).toLocaleString(),
  className = '',
}: Props) {
  const [display, setDisplay] = useState(value);
  const [popKey, setPopKey] = useState(0);
  const fromRef = useRef(value);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    if (value === display) return;
    const start = performance.now();
    const from = fromRef.current;
    const to = value;

    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      // easeOutCubic
      const eased = 1 - Math.pow(1 - t, 3);
      const current = from + (to - from) * eased;
      setDisplay(current);
      if (t < 1) rafRef.current = requestAnimationFrame(tick);
      else {
        fromRef.current = to;
        setDisplay(to);
      }
    };
    rafRef.current = requestAnimationFrame(tick);
    if (flash) setPopKey((k) => k + 1);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      fromRef.current = value; // ensure next transition starts from final target
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  return (
    <span
      key={popKey}
      className={`inline-block ${flash ? 'ds-count-pop' : ''} ${className}`}
    >
      {format(display)}
    </span>
  );
}
