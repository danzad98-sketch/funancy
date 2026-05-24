'use client';

/**
 * Working Board page.
 *
 * Layout (top -> bottom):
 *   - GameShell header (avatar + 3 resource pills)
 *   - OrderGallery     (painted sell stall, Asset 1)
 *   - MergeGrid        (painted 6x4 wooden grid, Asset 2)
 *   - ProducerArea     (3 painted spawner cards, Asset 3 split into thirds)
 *   - Wooden floor strip (matches the full-reference mockup, Asset 4)
 *
 * The page wrapper supplies the warm market gradient that visually
 * stitches the section PNGs together. No game mechanics are touched
 * here — this file is composition only.
 */

import GameShell from '@/components/layout/GameShell';
import OrderGallery from '@/components/board/OrderGallery';
import MergeGrid from '@/components/board/MergeGrid';
import ProducerArea from '@/components/board/ProducerArea';

export default function BoardPage() {
  return (
    <GameShell>
      <div className="mk-board-bg relative">
        <div className="relative z-10">
          <OrderGallery />
          <MergeGrid />
          <ProducerArea />
        </div>
        {/* Wooden floor strip below the spawner panel — matches Asset 4 */}
        <div className="mk-floor" />
      </div>
    </GameShell>
  );
}
