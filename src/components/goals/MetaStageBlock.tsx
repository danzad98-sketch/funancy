'use client';

import type { MetaStage } from '@/types/goals';
import { isItemComplete } from '@/data/metaGoals';
import MetaItemCard from './MetaItemCard';

interface Props {
  stage: MetaStage;
  coins: number;
  onPurchase: (stageId: number, itemId: string) => void;
}

export default function MetaStageBlock({ stage, coins, onPurchase }: Props) {
  const isLocked = stage.status === 'locked';
  const isCompleted = stage.status === 'completed';
  const completedCount = stage.items.filter((i) => isItemComplete(i)).length;
  const totalCount = stage.items.length;

  return (
    <div
      // Stage 1 (id === 1) carries the tutorial spotlight anchor for the
      // onboarding meta-upgrade step (1.8). Previously the step targeted
      // `[data-tut="meta-watch"]`, which only existed on the legacy
      // single-tier card; after the Excel rewrite every item became a
      // multi-level card and the selector resolved to nothing, so the
      // Spotlight fell back to a full-screen click blocker and the whole
      // /goals screen became unclickable (the "buy does nothing" bug).
      // Anchoring on the first stage's block keeps all three Stage-1 items
      // inside the spotlight cutout so any of them is purchasable.
      data-tut={stage.id === 1 ? 'meta-items' : undefined}
      className={`mx-3 mt-3 rounded-2xl overflow-hidden transition-all ${
        isCompleted
          ? 'border-3 border-highlight-green shadow-lg'
          : isLocked
          ? 'border-3 border-gray-500/30 opacity-60'
          : 'border-3 border-card-border shadow-lg'
      }`}
      style={
        isCompleted
          ? { boxShadow: '0 0 20px rgba(76,175,80,0.3), 0 6px 12px rgba(0,0,0,0.2)' }
          : !isLocked
          ? { boxShadow: '0 6px 16px rgba(0,0,0,0.3)' }
          : undefined
      }
    >
      {/* Stage header */}
      <div
        className={`text-center py-3 px-4 ${
          isCompleted
            ? 'bg-gradient-to-l from-highlight-green to-[#2e7d32]'
            : isLocked
            ? 'bg-gradient-to-l from-gray-500 to-gray-600'
            : 'bg-gradient-to-l from-bg-goals to-[#1a0a30]'
        }`}
      >
        <div className="flex items-center justify-center gap-2">
          {isCompleted && <span className="text-xl">🏆</span>}
          {isLocked && <span className="text-xl">🔒</span>}
          <span className="text-xl">{stage.emoji}</span>
          <span className="font-black text-base text-white game-text-outline tracking-wide">
            {stage.name}
          </span>
          {isCompleted && <span className="text-xl">🏆</span>}
        </div>
        <div className="text-[10px] text-white/60 font-bold mt-0.5">
          {stage.description}
        </div>

        {/* Progress indicator */}
        <div className="mt-2 flex items-center justify-center gap-2">
          <div className="flex-1 max-w-[140px] progress-bar-game h-3">
            <div
              className="progress-fill-gold h-full"
              style={{ width: `${totalCount > 0 ? (completedCount / totalCount) * 100 : 0}%` }}
            />
          </div>
          <span className="text-[10px] font-black text-white/80">
            {completedCount}/{totalCount}
          </span>
        </div>
      </div>

      {/* Stage items */}
      <div
        className={`p-3 ${
          isCompleted
            ? 'bg-gradient-to-b from-highlight-green-light/30 to-white/80'
            : isLocked
            ? 'bg-gradient-to-b from-gray-200/50 to-gray-300/50'
            : 'bg-gradient-to-b from-card-cream to-card-inner'
        }`}
      >
        <div className="grid grid-cols-2 gap-2.5">
          {stage.items.map((item) => (
            <MetaItemCard
              key={item.id}
              item={item}
              coins={coins}
              onPurchase={(itemId) => onPurchase(stage.id, itemId)}
              stageLocked={isLocked}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
