'use client';

import { useGameStore } from '@/stores/useGameStore';

export default function MissionCard() {
  const { currentMission } = useGameStore();
  const progress = Math.min(
    (currentMission.currentValue / currentMission.targetValue) * 100,
    100
  );

  return (
    <div className="game-panel mx-3 mt-3 overflow-hidden">
      <div className="bg-gradient-to-l from-energy-purple to-producer-purple text-white text-center py-2.5 font-black text-sm game-text-outline tracking-wide">
        משימה נוכחית
      </div>
      <div className="p-3">
        <p className="text-sm text-center mb-3 text-wood-dark font-bold">{currentMission.description}</p>
        {/* Progress bar */}
        <div className="progress-bar-game h-6 relative">
          <div
            className="progress-fill-gold absolute inset-y-0.5 right-0.5"
            style={{ width: `${progress}%` }}
          />
          <div className="absolute inset-0 flex items-center justify-center text-xs font-black text-white game-text-outline">
            {currentMission.currentValue}/{currentMission.targetValue}
          </div>
        </div>
      </div>
    </div>
  );
}
