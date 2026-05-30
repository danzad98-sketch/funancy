'use client';

import ResourceBar from './ResourceBar';
import LevelIndicator from './LevelIndicator';
import DemoModeBootstrap from './DemoModeBootstrap';
import DemoModeChip from './DemoModeChip';
import BottomNav from './BottomNav';
import ToastHost from '@/components/ui/ToastHost';
import TutorialOverlay from '@/components/tutorial/TutorialOverlay';
import Stage1Overlay from '@/components/tutorial/Stage1Overlay';
import Stage3Overlay from '@/components/tutorial/Stage3Overlay';
import Stage4Overlay from '@/components/tutorial/Stage4Overlay';
import Stage5Overlay from '@/components/tutorial/Stage5Overlay';
import MissionReminderWidget from '@/components/tutorial/MissionReminderWidget';
import CoinSplitFX from '@/components/tutorial/CoinSplitFX';
import TimeSpeederAnimation from '@/components/tutorial/TimeSpeederAnimation';
import MissionCompleteToast from '@/components/tutorial/MissionCompleteToast';
import { useEffect } from 'react';
import { useGameStore, createDemoGrid } from '@/stores/useGameStore';
import { generateDemoSellRequests, generateInitialTutorialSellRequests } from '@/data/orders';

export default function GameShell({ children }: { children: React.ReactNode }) {
  const regenEnergy = useGameStore((s) => s.regenEnergy);
  const applyRealTimeInflation = useGameStore((s) => s.applyRealTimeInflation);

  // Hydrate sell requests client-side after mount. Per partner-review fix
  // the BOARD now starts empty for new users — they spawn their first
  // items themselves during the onboarding tutorial. Only seed the demo
  // grid when the player is already past the tutorial AND the grid is
  // empty (e.g., they reset state without entering Stage 1 from scratch).
  useEffect(() => {
    const state = useGameStore.getState();
    const patch: Record<string, unknown> = {};
    if (!state.sellRequests || state.sellRequests.length === 0) {
      // Fresh Stage 1 player: seed T2 tutorial-bootstrap requests so the
      // sell step (1.5) is solvable from one merge. After the tutorial,
      // replacements come from `generateSingleRequest` which respects
      // MIN_SELLABLE_TIER=4 and gives the full Excel-spec economy.
      patch.sellRequests = state.tutorialCompleted
        ? generateDemoSellRequests()
        : generateInitialTutorialSellRequests();
    }
    // Only auto-seed the grid for post-tutorial demo URLs — never during
    // the Stage 1 onboarding (the board must start empty).
    if (state.tutorialCompleted && state.grid.every((c) => c.item === null)) {
      patch.grid = createDemoGrid();
    }
    if (Object.keys(patch).length > 0) {
      useGameStore.setState(patch);
    }
  }, []);

  // Game tick: energy regen + inflation
  useEffect(() => {
    const interval = setInterval(() => {
      regenEnergy();
      applyRealTimeInflation();
    }, 1000);
    return () => clearInterval(interval);
  }, [regenEnergy, applyRealTimeInflation]);

  return (
    <div className="relative flex flex-col min-h-dvh max-w-md mx-auto w-full bg-bg-warm shadow-[0_0_40px_rgba(0,0,0,0.5)]">
      {/* Demo-mode preset loader — applies `?demo=stageN` once on mount. */}
      <DemoModeBootstrap />
      {/* Top-left "🎬 Demo Mode" chip while a demo session is active. */}
      <DemoModeChip />
      <main className="flex-1 overflow-y-auto pb-24 no-scrollbar page-enter relative">
        {/* Header floats over the page background */}
        <ResourceBar />
        {/* Persistent intro-journey stage indicator (sticky bar under the
            header). Hides once intro_journey_completed === true. */}
        <LevelIndicator />
        {children}
      </main>
      {/* Toast host — mounted once at the root so any component can fire toasts */}
      <ToastHost />
      <BottomNav />
      {/* Tutorial overlay — renders nothing once tutorialCompleted=true. */}
      <TutorialOverlay />
      {/* Stage 1 overlay — kicks in after tutorial; renders nothing once
          stage1Completed=true. */}
      <Stage1Overlay />
      {/* Stage 3 overlay — money market, sales, savings habit. Renders
          nothing until Stage 2 is complete and disappears on stage3Completed. */}
      <Stage3Overlay />
      {/* Stage 4 overlay — stock market / S&P 500 / volatility lesson.
          Renders nothing until Stage 3 is complete, hides on stage4Completed. */}
      <Stage4Overlay />
      {/* Stage 5 overlay — provident fund + forced liquidity event + the
          finale that sets intro_journey_completed. */}
      <Stage5Overlay />
      {/* Persistent mission-reminder ↗ badge — visible during Stage 2
          and Stage 3 passive-wait phases; opens a read-only popup with
          live progress. Hides permanently after stage3Completed. */}
      <MissionReminderWidget />
      {/* Stage 3 coin-split visual feedback — fires once per sale while
          the standing order is active. */}
      <CoinSplitFX />
      {/* Spinning clock overlay — plays whenever `timeSpeederAnimating` flips on. */}
      <TimeSpeederAnimation />
      {/* Cross-cutting mission-complete toast (only for missions completed
          off-screen, post Stage-1). Auto-dismisses after 3s. */}
      <MissionCompleteToast />
    </div>
  );
}
