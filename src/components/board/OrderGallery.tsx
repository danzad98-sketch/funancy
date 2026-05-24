'use client';

import { useState, useCallback } from 'react';
import { useGameStore } from '@/stores/useGameStore';
import { canFulfillRequest } from '@/engine/orderEngine';
import type { SellRequest } from '@/types/game';
import { toast } from '@/components/ui/toast';
import { BuyerCharacter, type BuyerId } from './BuyerCharacters';
import CoinFlyToHeader from '@/components/tutorial/CoinFlyToHeader';

/* ================================================================
 * Working Board sell area — PRD follow-up.
 * Each active sell request:
 *   - A unique buyer character (1 of 5 SVGs) stands behind the counter
 *   - In front of them on the counter sits the dark-brown sell card
 *     (Reference 4): yellow reward + gold coin, white item square, green SELL
 * Game logic (sell fulfilment, store wiring) is UNCHANGED.
 * ================================================================ */

function SellRewardFloat({ text }: { text: string }) {
  return (
    <div className="absolute -top-3 left-1/2 -translate-x-1/2 pointer-events-none z-50 sell-reward-float">
      <div className="mk-ticket-reward-float">
        <span className="mk-icon mk-icon-coin mk-icon--sm" aria-hidden />
        <span className="text-xs font-black text-[#2c1608]">{text}</span>
      </div>
    </div>
  );
}

function SellRequestSlot({ request }: { request: SellRequest }) {
  const grid = useGameStore((s) => s.grid);
  const fulfillSellRequest = useGameStore((s) => s.fulfillSellRequest);

  const canFulfill = canFulfillRequest(grid, request);
  const [sellReward, setSellReward] = useState<string | null>(null);
  // One-shot coin-fly trigger — flips true on sell, back to false after
  // the animation finishes (the CoinFlyToHeader component self-unmounts).
  const [coinFlyId, setCoinFlyId] = useState(0);

  // Fallback to char 1 if persisted data predates the characterId field.
  const buyerId: BuyerId = (request.characterId as BuyerId) ?? 1;

  const tutorialCompleted = useGameStore((s) => s.tutorialCompleted);
  const tutorialStep = useGameStore((s) => s.tutorialStep);
  const tutorialArmed = useGameStore((s) => s.tutorialArmed);
  const advanceTutorial = useGameStore((s) => s.advanceTutorial);

  // Tutorial: block selling entirely until the SELL step is armed.
  // Step 1.5 (`tutorialStep === 4`) + armed → SELL allowed → advances.
  const tutorialBlocks =
    !tutorialCompleted && (tutorialStep !== 4 || !tutorialArmed);

  const handleSell = useCallback(() => {
    if (tutorialBlocks) return;
    const text = `+${request.rewardAmount}`;
    const success = fulfillSellRequest(request.id);
    if (success) {
      setSellReward(text);
      setTimeout(() => setSellReward(null), 1200);
      // Coin-fly-to-Header animation (PRD step 1.5) — every sell fires it.
      setCoinFlyId((n) => n + 1);
      toast.primary(text, { iconClass: 'mk-icon mk-icon-coin mk-icon--sm' });
      // Tutorial step 1.5 — selling on armed step advances to 1.6.
      if (!tutorialCompleted && tutorialStep === 4 && tutorialArmed) {
        advanceTutorial();
      }
    }
  }, [request, fulfillSellRequest, tutorialCompleted, tutorialStep, tutorialArmed, advanceTutorial, tutorialBlocks]);

  return (
    <div className="mk-slot">
      {/* Character — stands behind the counter */}
      <div className="mk-slot-buyer">
        <BuyerCharacter id={buyerId} size={68} />
      </div>

      {/* Sell card — matches Reference 4: dark brown rounded rectangle
          with yellow reward header at top, white item square + green
          SELL pill in the body row below.
          Forced dir="ltr" so the composition matches the mockup
          literally (item LEFT, SELL RIGHT) regardless of the page's
          Hebrew RTL direction. */}
      <div
        dir="ltr"
        className={`mk-sellcard ${canFulfill ? 'is-ready' : 'is-pending'}`}
      >
        {sellReward && <SellRewardFloat text={sellReward} />}

        {/* Reward header — yellow number + painted coin, INSIDE the card.
            `data-fly-origin` doubles as the coin-fly-to-header start anchor. */}
        <div className="mk-sellcard-header" data-fly-origin={`reward-${request.id}`}>
          <span className="mk-sellcard-reward-num">{request.rewardAmount}</span>
          <span className="mk-icon mk-icon-coin mk-icon--sm" aria-hidden />
        </div>

        {/* Body row — white item square (start) + SELL button (end) */}
        <div className="mk-sellcard-body">
          <div className="mk-sellcard-items">
            {request.items.map((item, idx) => (
              <span key={idx} className="mk-sellcard-item" aria-label={item.name}>
                {item.emoji}
              </span>
            ))}
          </div>
          <button
            type="button"
            onClick={handleSell}
            disabled={!canFulfill}
            className="mk-sellcard-sell"
            aria-label={canFulfill ? 'מכור' : 'אין מספיק פריטים'}
          >
            SELL
          </button>
        </div>
      </div>
      {coinFlyId > 0 && (
        <CoinFlyToHeader
          key={coinFlyId}
          fromSelector={`[data-fly-origin="reward-${request.id}"]`}
        />
      )}
    </div>
  );
}

export default function OrderGallery() {
  const sellRequests = useGameStore((s) => s.sellRequests);
  const mergeBoosterActive = useGameStore((s) => s.mergeBoosterActive);

  return (
    <div className="relative mx-3 mt-2">
      {mergeBoosterActive && (
        <div className="text-center mb-1 relative z-30">
          <span className="text-[10px] font-black bg-gradient-to-b from-indigo-400 to-indigo-600 text-white px-2 py-0.5 rounded-full border border-indigo-700 shadow-sm animate-pulse">
            🔮 מאיץ מיזוג חד פעמי! — המיזוג הבא קופץ 2 שלבים
          </span>
        </div>
      )}

      {/* Painted stall backdrop (awning, lanterns, register, counter, market behind). */}
      <div className="mk-stall">
        {/* Slots row — characters stand behind the counter, cards sit in front. */}
        <div className="mk-stall-stage">
          {sellRequests.map((request) => (
            <SellRequestSlot key={request.id} request={request} />
          ))}
        </div>
      </div>
    </div>
  );
}
