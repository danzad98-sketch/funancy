'use client';

import { useEffect, useState } from 'react';

/**
 * Coin-fly-to-Header animation (PRD step 1.5).
 *
 * On mount, this component:
 *   1. Reads the bounding rect of `fromSelector` (the sell card's
 *      reward chip) and `toSelector` (the header coin pill).
 *   2. Renders a coin glyph at the `from` position.
 *   3. Animates it via CSS transform translate to the `to` position
 *      over ~700ms, then unmounts.
 *
 * Trigger: parent renders <CoinFlyToHeader /> immediately after a
 * successful sell; the component handles its own teardown.
 */
interface Props {
  fromSelector: string;
  toSelector?: string;
  /** Animation duration in ms. */
  duration?: number;
  /** Number of coins to fly (default 3 with stagger). */
  count?: number;
  onComplete?: () => void;
}

export default function CoinFlyToHeader({
  fromSelector,
  toSelector = '.mk-pill[aria-label="מטבעות"]',
  duration = 700,
  count = 3,
  onComplete,
}: Props) {
  const [coins, setCoins] = useState<Array<{ id: number; from: DOMRect; to: DOMRect }>>([]);

  useEffect(() => {
    const fromEl = document.querySelector(fromSelector);
    const toEl = document.querySelector(toSelector);
    if (!fromEl || !toEl) {
      onComplete?.();
      return;
    }
    const fromRect = fromEl.getBoundingClientRect();
    const toRect = toEl.getBoundingClientRect();
    setCoins(
      Array.from({ length: count }).map((_, i) => ({
        id: i,
        from: fromRect,
        to: toRect,
      })),
    );
    // Auto-cleanup after the animation finishes (plus the last stagger).
    const totalMs = duration + count * 80;
    const t = setTimeout(() => {
      setCoins([]);
      onComplete?.();
    }, totalMs);
    return () => clearTimeout(t);
  }, [fromSelector, toSelector, duration, count, onComplete]);

  if (coins.length === 0) return null;

  return (
    <>
      {coins.map((c) => {
        const dx = c.to.left + c.to.width / 2 - (c.from.left + c.from.width / 2);
        const dy = c.to.top + c.to.height / 2 - (c.from.top + c.from.height / 2);
        const startX = c.from.left + c.from.width / 2 - 14;
        const startY = c.from.top + c.from.height / 2 - 14;
        return (
          <span
            key={c.id}
            className="coin-fly"
            style={{
              left: `${startX}px`,
              top: `${startY}px`,
              animationDuration: `${duration}ms`,
              animationDelay: `${c.id * 80}ms`,
              // CSS custom properties consumed by the keyframe
              ['--coin-dx' as string]: `${dx}px`,
              ['--coin-dy' as string]: `${dy}px`,
            } as React.CSSProperties}
            aria-hidden
          />
        );
      })}
    </>
  );
}
