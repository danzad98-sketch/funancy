'use client';

import { useEffect, useRef, useState } from 'react';
import type { MetaItem } from '@/types/goals';
import { getNextPrice, getNextActionLabel, getCurrentTierIndex, getCurrentLevel, isItemComplete } from '@/data/metaGoals';
import { useGameStore } from '@/stores/useGameStore';

/**
 * Per-item track labels for the multi-level card badge. Each Meta Goal
 * item gets its own emoji + descriptive name; previously the badge was
 * a hardcoded "🏠 מסלול דיור" on every card regardless of item.
 */
const ITEM_TRACK_LABELS: Record<string, string> = {
  // Stage 1 — טכנולוגיה אישית
  phone:             '📱 מסלול הטלפון',
  watch:             '⌚ מסלול השעון',
  earbuds:           '🎧 מסלול האוזניות',
  // Stage 2 — בידור ופנאי
  smart_speaker:     '🔊 מסלול הרמקול',
  tablet:            '📔 מסלול הטאבלט',
  console:           '🎮 מסלול הקונסולה',
  // Stage 3 — ניידות ולמידה
  laptop:            '💻 מסלול המחשב',
  scooter:           '🛴 מסלול הקורקינט',
  studies:           '📚 מסלול הלימודים',
  // Stage 4 — עצמאות ועבודה
  car:               '🚗 מסלול הרכב',
  home_office:       '🖥️ מסלול ההום אופיס',
  vacation:          '✈️ מסלול החופשה',
  // Stage 5 — דיור ויוקרה
  housing:           '🏠 מסלול הדיור',
  furniture:         '🛋️ מסלול הריהוט',
  gourmet_vacation:  '🏖️ מסלול חופשת היוקרה',
};

interface Props {
  item: MetaItem;
  coins: number;
  onPurchase: (itemId: string) => void;
  stageLocked: boolean;
}

/**
 * Synchronous click guard — prevents double-charge when the user rapidly
 * taps (or mobile touch+click both fire). React can't flip the button's
 * `disabled` state fast enough between two synchronous clicks, so we use
 * a ref-backed lock that is set BEFORE the purchase action runs.
 *
 * The lock is released on the next animation frame, by which time React
 * has already re-rendered and `disabled={!canAfford}` reflects the new state.
 */
function useClickGuard() {
  const locked = useRef(false);
  const [, force] = useState(0);
  const guard = (fn: () => void) => {
    if (locked.current) return; // drop the second rapid tap
    locked.current = true;
    force((n) => n + 1); // trigger one render so aria-busy flips
    fn();
    // Release after one frame — React will have re-rendered by then
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        locked.current = false;
        force((n) => n + 1);
      });
    });
  };
  return { guard, isLocked: locked.current };
}

export default function MetaItemCard({ item, coins, onPurchase, stageLocked }: Props) {
  // Apply Meta Goal inflation factor — every Stage 1 speeder use bumps
  // all prices by 1% per simulated year (PRD page 2). The factor is
  // read-only here; the displayed price reflects it and pulses when it
  // changes.
  const metaInflationFactor = useGameStore((s) => s.metaInflationFactor);
  const activeSale = useGameStore((s) => s.activeSale);
  const stage3Completed = useGameStore((s) => s.stage3Completed);
  const rawNextPrice = getNextPrice(item);
  const inflatedPrice =
    rawNextPrice === null ? null : Math.round(rawNextPrice * metaInflationFactor);
  // Stage 3 sale window: 10% off if a sale is currently active.
  const isOnSale = activeSale != null && !stage3Completed;
  const nextPrice =
    inflatedPrice === null
      ? null
      : isOnSale
        ? Math.round(inflatedPrice * 0.9)
        : inflatedPrice;

  // Pulse animation key — triggers the price-tick keyframe on every change.
  const [pulseKey, setPulseKey] = useState(0);
  useEffect(() => {
    setPulseKey((k) => k + 1);
  }, [metaInflationFactor]);

  const actionLabel = getNextActionLabel(item);
  const currentTier = getCurrentTierIndex(item);
  const completed = isItemComplete(item);
  const canAfford = nextPrice !== null && coins >= nextPrice;
  const isLocked = stageLocked || item.state === 'locked';
  const { guard, isLocked: isProcessing } = useClickGuard();

  // Tutorial step 1.8 — when the player upgrades the WATCH on an armed
  // step, advance to step 1.9. Other meta items are blocked entirely
  // while step 1.8 is active.
  const tutorialCompleted = useGameStore((s) => s.tutorialCompleted);
  const tutorialStep = useGameStore((s) => s.tutorialStep);
  const tutorialArmed = useGameStore((s) => s.tutorialArmed);
  const advanceTutorial = useGameStore((s) => s.advanceTutorial);
  const isWatchStep = !tutorialCompleted && tutorialStep === 7;
  const isThisTheWatch = item.id === 'watch';
  // During tutorial step 1.8, block all non-watch items entirely; block
  // the watch too until the popup is armed.
  const tutBlocksPurchase =
    (isWatchStep && !isThisTheWatch) ||
    (isWatchStep && isThisTheWatch && !tutorialArmed) ||
    (!tutorialCompleted && !isWatchStep);

  const handleCardPurchase = (id: string) => {
    if (tutBlocksPurchase) return;
    onPurchase(id);
    if (isWatchStep && isThisTheWatch && tutorialArmed) advanceTutorial();
  };

  if (item.kind === 'multi_level') {
    return <MultiLevelCard item={item} coins={coins} onPurchase={handleCardPurchase} stageLocked={stageLocked} />;
  }

  // Upgradeable or purchase_only
  const baseTier = item.tiers[0];
  const upgradeTier = item.tiers.length > 1 ? item.tiers[1] : null;

  // PRD Stage 5 — vacation tile shows a small camera-outcome badge while
  // Stage 5 is active (broken = liquidity event hit, fixed = resolved OK).
  const s5CameraOutcome = useGameStore((s) => s.s5CameraOutcome);
  const stage5Completed = useGameStore((s) => s.stage5Completed);
  const stage4Completed = useGameStore((s) => s.stage4Completed);
  const showCameraBadge =
    item.id === 'vacation' &&
    stage4Completed && !stage5Completed &&
    (s5CameraOutcome === 'broken' || s5CameraOutcome === 'fixed');

  return (
    <div
      // data-tut="meta-watch" — used by the tutorial overlay (step 7)
      // to spotlight specifically the watch card.
      data-tut={isThisTheWatch ? 'meta-watch' : undefined}
      className={`rounded-2xl border-3 p-3 transition-all relative ${
        completed
          ? 'bg-gradient-to-b from-highlight-green-light to-white border-highlight-green'
          : isLocked
          ? 'bg-gradient-to-b from-gray-200 to-gray-300 border-gray-400 opacity-40'
          : 'game-panel'
      }`}
      style={
        completed
          ? { boxShadow: '0 4px 0 0 #2e7d32, 0 6px 12px rgba(76,175,80,0.3)' }
          : !isLocked
          ? { boxShadow: '0 4px 0 0 #b89060, 0 6px 12px rgba(0,0,0,0.2)' }
          : undefined
      }
    >
      {/* Camera-event outcome badge (Stage 5 only) */}
      {showCameraBadge && (
        <div
          className={`s5-camera-badge s5-camera-badge--${s5CameraOutcome}`}
          aria-label={s5CameraOutcome === 'broken' ? 'מצלמה שבורה' : 'מצלמה תוקנה'}
        >
          {s5CameraOutcome === 'broken' ? '📷💔' : '📸😊'}
        </div>
      )}
      {/* Item visual */}
      <div className="flex items-center justify-center gap-2 mb-2">
        {/* Base tier */}
        <div
          className={`flex flex-col items-center ${
            currentTier >= 0 ? 'opacity-50 scale-90' : completed ? 'opacity-50 scale-90' : ''
          }`}
        >
          <span className={`text-3xl ${isLocked ? 'grayscale' : ''}`}>
            {isLocked ? '🔒' : baseTier.emoji}
          </span>
          <span className="text-[9px] font-bold text-wood-dark/60 mt-0.5">
            {baseTier.name}
          </span>
        </div>

        {/* Arrow + upgrade tier (for upgradeable items) */}
        {upgradeTier && (
          <>
            <span className={`text-lg font-black ${isLocked ? 'text-gray-400' : 'text-coin-gold'}`}>
              ←
            </span>
            <div
              className={`flex flex-col items-center ${
                currentTier < 1 && !completed ? 'opacity-40' : ''
              }`}
            >
              <span
                className={`text-3xl ${
                  completed ? 'drop-shadow-lg' : isLocked ? 'grayscale' : currentTier < 1 ? 'grayscale' : ''
                }`}
              >
                {isLocked ? '🔒' : upgradeTier.emoji}
              </span>
              <span className="text-[9px] font-bold text-wood-dark/60 mt-0.5">
                {upgradeTier.name}
              </span>
            </div>
          </>
        )}
      </div>

      {/* Crown for max tier — replaces button + price panel (PRD 3). */}
      {completed && (
        <div className="mk-meta-crown" aria-label="הושלם">👑</div>
      )}

      {/* Action row — price panel + upgrade button next to each other.
          Hidden entirely when the item is at max tier (crown takes over). */}
      {!completed && !isLocked && actionLabel && nextPrice !== null && (
        <div className="mk-meta-action-row">
          <div className="mk-meta-price mk-meta-price-pulse" key={pulseKey}>
            <span className="mk-icon mk-icon-coin mk-icon--xs" aria-hidden />
            {isOnSale && inflatedPrice !== null && inflatedPrice !== nextPrice && (
              <span className="meta-price-strikethrough">{inflatedPrice.toLocaleString()}</span>
            )}
            <span className="mk-meta-price-num">{nextPrice.toLocaleString()}</span>
            {isOnSale && <span className="meta-price-discount">-10%</span>}
          </div>
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              guard(() => handleCardPurchase(item.id));
            }}
            disabled={!canAfford || isProcessing || tutBlocksPurchase}
            aria-busy={isProcessing}
            className={`mk-meta-buy ${canAfford ? '' : 'is-poor'} ${isProcessing ? 'is-processing' : ''}`}
          >
            {canAfford ? actionLabel : `חסרים ${(nextPrice - coins).toLocaleString()}`}
          </button>
        </div>
      )}

      {isLocked && (
        <div className="text-center mt-1">
          <span className="text-[10px] text-gray-500 font-bold">🔒 שלב נעול</span>
        </div>
      )}
    </div>
  );
}

// --- Multi-level item (housing chain) ---
function MultiLevelCard({
  item,
  coins,
  onPurchase,
  stageLocked,
}: Props) {
  const nextPrice = getNextPrice(item);
  const actionLabel = getNextActionLabel(item);
  const currentTier = getCurrentTierIndex(item);
  const completed = isItemComplete(item);
  const canAfford = nextPrice !== null && coins >= nextPrice;
  const isLocked = stageLocked || item.state === 'locked';
  const { guard, isLocked: isProcessing } = useClickGuard();

  return (
    <div
      className={`rounded-2xl border-3 p-3 transition-all col-span-2 ${
        completed
          ? 'bg-gradient-to-b from-highlight-green-light to-white border-highlight-green'
          : isLocked
          ? 'bg-gradient-to-b from-gray-200 to-gray-300 border-gray-400 opacity-40'
          : 'game-panel'
      }`}
      style={
        completed
          ? { boxShadow: '0 4px 0 0 #2e7d32, 0 6px 12px rgba(76,175,80,0.3)' }
          : !isLocked
          ? { boxShadow: '0 4px 0 0 #b89060, 0 6px 12px rgba(0,0,0,0.2)' }
          : undefined
      }
    >
      <div className="flex items-center justify-center gap-1 mb-2">
        <span className="text-xs font-black text-wood-dark/70">
          {ITEM_TRACK_LABELS[item.id] ?? `${item.tiers[0]?.emoji ?? '🎯'} מסלול ${item.tiers[0]?.name ?? ''}`}
        </span>
      </div>

      {/* Vertical tier chain */}
      <div className="flex items-center justify-center gap-3">
        {item.tiers.map((tier, idx) => {
          const isOwned = currentTier >= idx;
          const isNext = currentTier === idx - 1 || (currentTier === -1 && idx === 0);
          return (
            <div key={idx} className="flex items-center gap-2">
              {idx > 0 && (
                <span className={`text-lg font-black ${isOwned ? 'text-highlight-green' : 'text-gray-300'}`}>
                  ←
                </span>
              )}
              <div
                className={`flex flex-col items-center px-2 py-1.5 rounded-xl transition-all ${
                  isOwned
                    ? 'bg-highlight-green/10 border-2 border-highlight-green/40'
                    : isNext && !isLocked
                    ? 'bg-coin-gold/10 border-2 border-coin-gold/40 scale-105'
                    : 'border-2 border-transparent opacity-40'
                }`}
              >
                <span className={`text-2xl ${isLocked ? 'grayscale' : ''} ${isOwned ? 'drop-shadow-md' : ''}`}>
                  {isLocked ? '🔒' : tier.emoji}
                </span>
                <span className="text-[9px] font-bold text-wood-dark/60 mt-0.5 text-center leading-tight">
                  {tier.name}
                </span>
                {isOwned && (
                  <span className="text-[8px] text-highlight-green font-black">✅</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Crown at max tier — replaces price + button. */}
      {completed && (
        <div className="mk-meta-crown" aria-label="הושלם">👑</div>
      )}

      {!completed && !isLocked && actionLabel && nextPrice !== null && (
        <div className="mk-meta-action-row mt-3 max-w-xs mx-auto">
          <div className="mk-meta-price">
            <span className="mk-icon mk-icon-coin mk-icon--xs" aria-hidden />
            <span className="mk-meta-price-num">{nextPrice.toLocaleString()}</span>
          </div>
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              guard(() => onPurchase(item.id));
            }}
            disabled={!canAfford || isProcessing}
            aria-busy={isProcessing}
            className={`mk-meta-buy ${canAfford ? '' : 'is-poor'} ${isProcessing ? 'is-processing' : ''}`}
          >
            {canAfford ? actionLabel : `חסרים ${(nextPrice - coins).toLocaleString()}`}
          </button>
        </div>
      )}

      {isLocked && (
        <div className="text-center mt-2">
          <span className="text-[10px] text-gray-500 font-bold">🔒 שלב נעול</span>
        </div>
      )}
    </div>
  );
}
