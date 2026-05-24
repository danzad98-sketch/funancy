'use client';

import { useEffect, useState } from 'react';

/**
 * Drag-gesture demo (PRD step 1.3).
 *
 * Shows a finger glyph that loops from the first occupied grid cell
 * onto an adjacent same-chain cell, miming a drag-to-merge gesture.
 * Renders as a fixed-position element over the board; positions are
 * derived from `getBoundingClientRect` on the chosen cells.
 *
 * Component self-positions and re-measures on resize/scroll.
 */
export default function DragGestureDemo() {
  const [path, setPath] = useState<{ from: DOMRect; to: DOMRect } | null>(null);

  useEffect(() => {
    const measure = () => {
      // Find two adjacent items of the same chain on the grid. The demo
      // grid seeds 2x 🍚 at indices 0+1, so cell index 0 → cell index 1
      // is the natural target. Fall back to any 2 occupied cells.
      const cells = [...document.querySelectorAll('.mk-grid-cell')].filter(
        (c) => c.querySelector('.item-bubble'),
      ) as HTMLElement[];
      if (cells.length < 2) {
        setPath(null);
        return;
      }
      const from = cells[0].getBoundingClientRect();
      const to = cells[1].getBoundingClientRect();
      setPath({ from, to });
    };
    measure();
    const interval = setInterval(measure, 400);
    window.addEventListener('resize', measure);
    window.addEventListener('scroll', measure, true);
    return () => {
      clearInterval(interval);
      window.removeEventListener('resize', measure);
      window.removeEventListener('scroll', measure, true);
    };
  }, []);

  if (!path) return null;

  const fromX = path.from.left + path.from.width / 2;
  const fromY = path.from.top + path.from.height / 2;
  const dx = path.to.left + path.to.width / 2 - fromX;
  const dy = path.to.top + path.to.height / 2 - fromY;

  return (
    <div
      className="drag-demo"
      style={{
        position: 'fixed',
        left: `${fromX - 18}px`,
        top: `${fromY - 18}px`,
        // CSS custom properties consumed by the keyframe
        ['--drag-dx' as string]: `${dx}px`,
        ['--drag-dy' as string]: `${dy}px`,
        pointerEvents: 'none',
        zIndex: 1001,
      } as React.CSSProperties}
      aria-hidden
    >
      <div className="drag-demo-finger">👆</div>
    </div>
  );
}
