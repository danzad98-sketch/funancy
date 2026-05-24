'use client';

import { useGameStore } from '@/stores/useGameStore';
import { t } from '@/data/strings';

/**
 * Standing-order status row — rendered in the Finance Center while
 * Stage 3 is active and the standing order has been confirmed. Shows
 * the running total of coins auto-routed to the deposit so the player
 * can SEE the habit accumulating in real time.
 */
export default function StandingOrderRow() {
  const total = useGameStore((s) => s.s3StandingOrderTotal || 0);

  return (
    <div className="standing-order-row" role="status" aria-live="polite">
      <div className="standing-order-row-left">
        <span className="standing-order-row-icon" aria-hidden>🏦</span>
        <div className="flex flex-col items-start">
          <span>{t('standing_order_label')}</span>
          <span style={{ opacity: 0.7, fontSize: 11 }}>{t('standing_order_rate')}</span>
        </div>
      </div>
      <div className="standing-order-row-meta">
        <span style={{ fontSize: 13 }}>+{Math.round(total)} ₪</span>
      </div>
    </div>
  );
}
