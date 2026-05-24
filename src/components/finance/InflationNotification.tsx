'use client';

import { useEffect, useState } from 'react';
import { useGameStore } from '@/stores/useGameStore';

export default function InflationNotification() {
  const lastInflationResult = useGameStore((s) => s.lastInflationResult);
  const [visible, setVisible] = useState(false);
  const [animating, setAnimating] = useState(false);

  useEffect(() => {
    if (!lastInflationResult) return;
    setVisible(true);
    setAnimating(true);
    const timer = setTimeout(() => {
      setAnimating(false);
    }, 2500);
    const hideTimer = setTimeout(() => {
      setVisible(false);
    }, 3500);
    return () => {
      clearTimeout(timer);
      clearTimeout(hideTimer);
    };
  }, [lastInflationResult]);

  if (!visible || !lastInflationResult) return null;

  const { coinsLost, rate, wasProtected } = lastInflationResult;
  // coinsLost > 0 → wallet shrunk (inflation).
  // coinsLost < 0 → wallet grew (deflation).
  const isDeflation = coinsLost < 0;
  const magnitude = Math.abs(coinsLost);

  if (wasProtected) {
    return (
      <div className={`mx-3 mt-2 rounded-xl border-2 border-highlight-green/60 bg-gradient-to-l from-highlight-green/20 to-highlight-green/10 p-3 ${animating ? 'bounce-in' : 'opacity-50 transition-opacity duration-500'}`}>
        <div className="flex items-center justify-center gap-2">
          <span className="text-2xl">🛡️</span>
          <div className="text-center">
            <div className="font-black text-sm text-highlight-green">!הכסף שלך מוגן</div>
            <div className="text-[10px] text-highlight-green/70 font-bold">אין מזומן לא מושקע — האינפלציה לא פוגעת בך</div>
          </div>
          <span className="text-2xl">✨</span>
        </div>
      </div>
    );
  }

  if (magnitude <= 0) return null;

  if (isDeflation) {
    // Deflation = bonus to the wallet — green / positive styling.
    return (
      <div className={`mx-3 mt-2 rounded-xl border-2 border-highlight-green/60 bg-gradient-to-l from-highlight-green/20 to-highlight-green/10 p-3 ${animating ? 'bounce-in' : 'opacity-50 transition-opacity duration-500'}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">📈</span>
            <div>
              <div className="font-black text-sm text-highlight-green">דפלציה: +{magnitude.toLocaleString()} מטבעות</div>
              <div className="text-[10px] text-highlight-green/70 font-bold">
                שיעור דפלציה: {(Math.abs(rate) * 100).toFixed(1)}% — המזומן שלך הרוויח ערך!
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`mx-3 mt-2 rounded-xl border-2 border-loss-red/60 bg-gradient-to-l from-loss-red/20 to-loss-red/10 p-3 ${animating ? 'bounce-in' : 'opacity-50 transition-opacity duration-500'}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-2xl inflation-icon">📉</span>
          <div>
            <div className="font-black text-sm text-loss-red">אינפלציה: -{magnitude.toLocaleString()} מטבעות</div>
            <div className="text-[10px] text-loss-red/70 font-bold">
              שיעור אינפלציה: {(Math.abs(rate) * 100).toFixed(1)}% — כסף לא מושקע מאבד ערך!
            </div>
          </div>
        </div>
        <div className="flex flex-col items-center">
          {/* Floating coins animation — three painted-PNG spans share
              the inflationCoinFly* keyframes, just at different sizes
              and stagger delays. */}
          {animating && (
            <div className="relative h-8 w-8">
              <span className="absolute mk-icon mk-icon-coin inflation-coin-1" aria-hidden />
              <span className="absolute mk-icon mk-icon-coin inflation-coin-2" aria-hidden />
              <span className="absolute mk-icon mk-icon-coin inflation-coin-3" aria-hidden />
            </div>
          )}
        </div>
      </div>
      <div className="mt-2 pt-2 border-t border-loss-red/20 text-center">
        <span className="text-[10px] text-wood-dark/60 font-bold">
          💡 הפקד כסף בפקדון או בקרן כדי להגן עליו!
        </span>
      </div>
    </div>
  );
}
