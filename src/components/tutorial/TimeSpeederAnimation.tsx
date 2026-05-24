'use client';

import { useEffect } from 'react';
import { useGameStore } from '@/stores/useGameStore';

/**
 * Full-screen overlay with a spinning clock — plays for ~2.5s whenever
 * a time speeder is used. The action (interest growth, inflation hit,
 * Meta Goal price tick) happens in parallel and is committed by
 * `useTimeSpeeder()` in the store; this component only renders the
 * visual flourish.
 *
 * Triggered by setting `timeSpeederAnimating = true` in the store.
 * Auto-clears the flag after the animation ends.
 */
const ANIMATION_MS = 2500;

export default function TimeSpeederAnimation() {
  const animating = useGameStore((s) => s.timeSpeederAnimating);
  const setAnimating = useGameStore((s) => s.setTimeSpeederAnimating);

  useEffect(() => {
    if (!animating) return;
    const t = setTimeout(() => setAnimating(false), ANIMATION_MS);
    return () => clearTimeout(t);
  }, [animating, setAnimating]);

  if (!animating) return null;

  return (
    <div className="tspeed-overlay" role="status" aria-live="polite">
      <div className="tspeed-clock">
        {/* Clock face */}
        <div className="tspeed-face">
          {/* 12 hour ticks */}
          {Array.from({ length: 12 }).map((_, i) => (
            <span
              key={i}
              className="tspeed-tick"
              style={{ transform: `rotate(${i * 30}deg)` }}
            />
          ))}
          {/* Hour + minute hands (rotate via CSS keyframes) */}
          <span className="tspeed-hand tspeed-hand--hour" />
          <span className="tspeed-hand tspeed-hand--minute" />
          {/* Center pin */}
          <span className="tspeed-pin" />
        </div>
        <div className="tspeed-caption">⏳ הזמן רץ…</div>
      </div>
    </div>
  );
}
