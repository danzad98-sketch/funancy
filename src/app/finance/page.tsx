'use client';

import GameShell from '@/components/layout/GameShell';
import AccountBreakdown from '@/components/finance/AccountBreakdown';
import TimeSpeederButton from '@/components/finance/TimeSpeederButton';

// NOTE: the legacy <MissionCard /> was removed here. It read `currentMission`
// from a parallel mission system whose updater (`checkMission`) is never
// called, so it was permanently frozen at "0/25" and contradicted the real
// MissionReminderWidget (rendered globally in GameShell). Single source of
// truth for missions is now the widget + the STAGE*_MISSION*_TARGET constants.
export default function FinancePage() {
  return (
    <GameShell>
      <div className="bg-finance-pattern min-h-full pb-4">
        <AccountBreakdown />
        <TimeSpeederButton />
      </div>
    </GameShell>
  );
}
