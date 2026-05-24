'use client';

import { useEffect, useState } from 'react';

interface Props {
  selector: string;
  /** Direction the arrow points. 'down' = arrow above target, pointing down. */
  direction?: 'down' | 'up' | 'left' | 'right';
}

/**
 * Bouncing arrow indicator that points at a target element.
 * Position re-measures on scroll/resize.
 */
export default function Arrow({ selector, direction = 'down' }: Props) {
  const [rect, setRect] = useState<DOMRect | null>(null);

  useEffect(() => {
    const measure = () => {
      const el = document.querySelector(selector) as HTMLElement | null;
      setRect(el ? el.getBoundingClientRect() : null);
    };
    measure();
    const interval = setInterval(measure, 200);
    window.addEventListener('resize', measure);
    window.addEventListener('scroll', measure, true);
    return () => {
      clearInterval(interval);
      window.removeEventListener('resize', measure);
      window.removeEventListener('scroll', measure, true);
    };
  }, [selector]);

  if (!rect) return null;

  const style: React.CSSProperties = { position: 'fixed', zIndex: 1002, pointerEvents: 'none' };
  switch (direction) {
    case 'down':
      style.left = rect.left + rect.width / 2;
      style.top = rect.top - 44;
      style.transform = 'translateX(-50%)';
      break;
    case 'up':
      style.left = rect.left + rect.width / 2;
      style.top = rect.bottom + 6;
      style.transform = 'translateX(-50%) rotate(180deg)';
      break;
    case 'left':
      style.left = rect.right + 6;
      style.top = rect.top + rect.height / 2;
      style.transform = 'translateY(-50%) rotate(-90deg)';
      break;
    case 'right':
      style.left = rect.left - 44;
      style.top = rect.top + rect.height / 2;
      style.transform = 'translateY(-50%) rotate(90deg)';
      break;
  }

  return (
    <div className="tut-arrow tut-arrow--polished" style={style} aria-hidden>
      <svg width="36" height="44" viewBox="0 0 36 44" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="tut-arrow-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"  stopColor="#ffd840" />
            <stop offset="55%" stopColor="#ffb23a" />
            <stop offset="100%" stopColor="#d98708" />
          </linearGradient>
          <filter id="tut-arrow-glow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="3" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <path
          d="M18 4 L18 28 M18 28 L8 18 M18 28 L28 18"
          stroke="url(#tut-arrow-grad)"
          strokeWidth="6"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
          filter="url(#tut-arrow-glow)"
        />
      </svg>
    </div>
  );
}
