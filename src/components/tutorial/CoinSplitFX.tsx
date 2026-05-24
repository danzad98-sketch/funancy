'use client';

import { useEffect, useState } from 'react';
import { useGameStore } from '@/stores/useGameStore';

/**
 * Coin-split visual effect — fires once per sale during Stage 3 (while the
 * standing order is active). One coin glyph appears center-screen, splits
 * into two, with the left half flying toward the wallet (header coin pill)
 * and the right half flying toward the bank deposit emoji. The animation
 * is purely visual feedback — the actual coin/balance split happens
 * synchronously in fulfillSellRequest. Duration ~900ms.
 *
 * Mounted in GameShell. Subscribes to `s3StandingOrderTotal` — whenever
 * it ticks up, we briefly render the split animation.
 */
export default function CoinSplitFX() {
  const savedTotal = useGameStore((s) => s.s3StandingOrderTotal || 0);
  const active     = useGameStore((s) => s.s3StandingOrderActive);
  const completed  = useGameStore((s) => s.stage3Completed);

  const [pulseKey, setPulseKey] = useState(0);
  const [prevTotal, setPrevTotal] = useState(savedTotal);

  useEffect(() => {
    if (!active || completed) return;
    if (savedTotal > prevTotal) {
      setPulseKey((k) => k + 1);
      setPrevTotal(savedTotal);
    }
  }, [savedTotal, active, completed, prevTotal]);

  // Auto-clear the pulse element after the animation runs.
  const [show, setShow] = useState(false);
  useEffect(() => {
    if (pulseKey === 0) return;
    setShow(true);
    const id = window.setTimeout(() => setShow(false), 950);
    return () => window.clearTimeout(id);
  }, [pulseKey]);

  if (!active || completed || !show) return null;

  return (
    <div className="coin-split-fx" aria-hidden key={pulseKey}>
      <span className="coin-split-fx-glyph coin-split-fx-glyph--left">🪙</span>
      <span className="coin-split-fx-glyph coin-split-fx-glyph--right">🪙</span>
    </div>
  );
}
