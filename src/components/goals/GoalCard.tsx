'use client';

import type { LifeGoal } from '@/types/goals';
import type { Stage } from '@/types/finance';

interface Props {
  goal: LifeGoal;
  currentStage: Stage;
  coins: number;
  onPurchase: (id: string) => void;
}

export default function GoalCard({ goal, currentStage, coins, onPurchase }: Props) {
  const isLocked = currentStage < goal.stageRequired;
  const canAfford = coins >= goal.price;
  const isPurchased = goal.isPurchased;

  return (
    <div
      className={`rounded-xl border-3 p-4 flex flex-col items-center gap-2 transition-all ${
        isPurchased
          ? 'bg-gradient-to-b from-highlight-green-light to-white border-highlight-green shadow-lg'
          : isLocked
          ? 'bg-gradient-to-b from-gray-200 to-gray-300 border-gray-400 opacity-50'
          : 'game-panel'
      }`}
      style={!isPurchased && !isLocked ? {
        boxShadow: '0 4px 0 0 #b89060, 0 6px 12px rgba(0,0,0,0.2)',
      } : isPurchased ? {
        boxShadow: '0 4px 0 0 #2e7d32, 0 6px 12px rgba(76,175,80,0.3)',
      } : undefined}
    >
      <span className={`text-5xl drop-shadow-lg ${isPurchased ? 'bounce-in' : ''}`}>
        {isPurchased ? '✅' : isLocked ? '🔒' : goal.emoji}
      </span>
      <span className="font-black text-sm text-center text-wood-dark">{goal.name}</span>

      <div className="flex items-center gap-1 text-sm bg-gradient-to-l from-coin-shine/30 to-coin-gold/30 rounded-full px-3 py-0.5 border border-coin-dark/20">
        <span className="mk-icon mk-icon-coin mk-icon--sm" aria-hidden />
        <span className="font-black text-wood-dark">{goal.price.toLocaleString()}</span>
      </div>

      {isLocked && (
        <span className="text-[10px] text-gray-600 font-bold">🔒 נדרש שלב {goal.stageRequired}</span>
      )}

      {!isPurchased && !isLocked && (
        <button
          onClick={() => onPurchase(goal.id)}
          disabled={!canAfford}
          className={`w-full py-2.5 rounded-xl font-black text-sm transition-all active:scale-95 ${
            canAfford
              ? 'btn-game btn-green'
              : 'bg-gradient-to-b from-gray-300 to-gray-400 text-gray-500 cursor-not-allowed rounded-xl border-none'
          }`}
        >
          {canAfford ? 'רכוש' : 'אין מספיק מטבעות'}
        </button>
      )}

      {isPurchased && (
        <span className="text-highlight-green font-black text-sm">נרכש! 🎉</span>
      )}
    </div>
  );
}
