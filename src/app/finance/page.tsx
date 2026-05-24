'use client';

import GameShell from '@/components/layout/GameShell';
import MissionCard from '@/components/finance/MissionCard';
import AccountBreakdown from '@/components/finance/AccountBreakdown';
import TimeSpeederButton from '@/components/finance/TimeSpeederButton';

export default function FinancePage() {
  return (
    <GameShell>
      <div className="bg-finance-pattern min-h-full pb-4">
        <MissionCard />
        <AccountBreakdown />
        <TimeSpeederButton />
      </div>
    </GameShell>
  );
}
