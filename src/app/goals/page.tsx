'use client';

import GameShell from '@/components/layout/GameShell';
import MetaStageBlock from '@/components/goals/MetaStageBlock';
import GameCompleteBanner from '@/components/goals/GameCompleteBanner';
import MetaProgressBar from '@/components/goals/MetaProgressBar';
import { useGameStore } from '@/stores/useGameStore';
import { getMetaProgressFraction } from '@/data/metaGoals';
import { t } from '@/data/strings';

/**
 * Meta Goal page (PRD 3).
 *  - "מסלול החיים" title removed
 *  - New CSS-generated aspirational background (.mk-meta-bg)
 *  - 9-step progress bar at the top, %-auto-scaled
 *  - Items: visual + small price panel + upgrade button per card
 *  - Crown 👑 on max-tier items (button + price hidden)
 *  - Structure ready to receive a new item list via data/metaGoals.ts
 */
export default function GoalsPage() {
  const metaStages = useGameStore((s) => s.metaStages);
  const coins = useGameStore((s) => s.coins);
  const gameCompleted = useGameStore((s) => s.gameCompleted);
  const purchaseMetaItem = useGameStore((s) => s.purchaseMetaItem);
  const activeSale = useGameStore((s) => s.activeSale);

  const progress = getMetaProgressFraction(metaStages);

  return (
    <GameShell>
      <div className="mk-meta-bg min-h-full pb-24">
        {/* 9-step progress bar — auto-scales: fills proportionally to
            % of all possible Meta-Goal upgrades the player has bought. */}
        <div className="px-3 pt-3">
          <MetaProgressBar fraction={progress} />
        </div>

        {/* Stage 3 active-sale banner — only visible during the 1-game-year
            sale window. Disappears the moment the player taps a time-speeder. */}
        {activeSale && (
          <div className="px-3 mt-2 flex justify-center">
            <div className="sale-active-banner">{t('sale_active_banner')}</div>
          </div>
        )}

        {/* Game complete banner */}
        {gameCompleted && <GameCompleteBanner />}

        {/* Stage blocks */}
        {metaStages.map((stage) => (
          <MetaStageBlock
            key={stage.id}
            stage={stage}
            coins={coins}
            onPurchase={purchaseMetaItem}
          />
        ))}

        <div className="h-4" />
      </div>
    </GameShell>
  );
}
