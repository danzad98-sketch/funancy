'use client';

import { useEffect, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useGameStore } from '@/stores/useGameStore';
import {
  getCurrentStage5Step,
  STAGE5_STEPS,
  STAGE5_MISSION1_TARGET,
  STAGE5_MISSION1_REWARD,
  STAGE5_COMPLETE_ENERGY_REWARD,
  STAGE5_COMPLETE_BOOSTER_REWARD,
  STAGE5_META_PURCHASES_TO_COMPLETE,
} from '@/data/stage5Steps';
import { t } from '@/data/strings';
import TutorialPopup from './TutorialPopup';
import Spotlight from './Spotlight';
import StageOpener from './StageOpener';
import {
  ProvidentIntroScreen,
  ProvidentLockScreen,
  AllocationToolbar,
  ThreeInstrumentsGrowth,
  CameraEventScreen,
  ProvidentUnlockScreen,
  LessonTimeframe1Screen,
  LessonTimeframe2Screen,
} from './Stage5Visuals';

/**
 * Stage 5 orchestrator. The FINAL stage of the intro journey.
 *
 * Mounts after Stage 4 completes:
 *   stage4Completed === true && !stage5Completed
 *
 * Owns:
 *   - 5.1 Provident-fund intro (3 visual screens)
 *   - Mission 1 (earn coins)
 *   - 5.2 free allocation (non-blocking toolbar)
 *   - 5.3 first booster + parallel growth comparison
 *   - Forced camera event on /goals
 *   - 5.4 second booster + provident unlock + timeframe lessons
 *   - Final stage-complete popup that sets `intro_journey_completed`
 */
export default function Stage5Overlay() {
  const stage4Completed       = useGameStore((s) => s.stage4Completed);
  const stage5Completed       = useGameStore((s) => s.stage5Completed);
  const stage5Step            = useGameStore((s) => s.stage5Step);
  const advanceStage5         = useGameStore((s) => s.advanceStage5);
  const completeStage5        = useGameStore((s) => s.completeStage5);
  const coins                 = useGameStore((s) => s.coins);
  const useTimeSpeederAction  = useGameStore((s) => s.useTimeSpeeder);
  const timeSpeederAnimating  = useGameStore((s) => s.timeSpeederAnimating);
  const addEnergy             = useGameStore((s) => s.addEnergy);
  const s5M1CoinBaseline      = useGameStore((s) => s.s5M1CoinBaseline);
  const s5MetaPurchaseCount   = useGameStore((s) => s.s5MetaPurchaseCount);

  const router = useRouter();
  const pathname = usePathname();

  // Body class (hooks for future CSS / non-overlay UI tweaks).
  useEffect(() => {
    if (typeof document === 'undefined') return;
    const active = stage4Completed && !stage5Completed;
    if (active) document.body.classList.add('stage5-active');
    else        document.body.classList.remove('stage5-active');
    return () => { document.body.classList.remove('stage5-active'); };
  }, [stage4Completed, stage5Completed]);

  // ----- One-shot per-step entry effects -----
  const lastEntryIdx = useRef<number>(-1);
  useEffect(() => {
    if (!stage4Completed || stage5Completed) return;
    if (lastEntryIdx.current === stage5Step) return;
    lastEntryIdx.current = stage5Step;

    const step = getCurrentStage5Step(stage5Step);
    if (!step) return;

    // Non-baseline side effects only.
    if (step.textCode === 'stage5_mission1_complete') {
      useGameStore.setState((s) => ({
        timeSpeeders: s.timeSpeeders + STAGE5_MISSION1_REWARD,
      }));
    }
  }, [stage5Step, stage4Completed, stage5Completed]);

  // ---- Unified baseline + threshold-check + paced auto-advance ----------
  const lastBaselineEntry = useRef<number>(-1);
  const advanceTimerRef = useRef<number | null>(null);

  useEffect(() => {
    if (!stage4Completed || stage5Completed) return;
    const step = getCurrentStage5Step(stage5Step);
    if (!step) return;

    if (advanceTimerRef.current != null && lastBaselineEntry.current !== stage5Step) {
      window.clearTimeout(advanceTimerRef.current);
      advanceTimerRef.current = null;
    }

    // ---- 1. Baseline capture (skip if already set — preserves across reload) ----
    if (lastBaselineEntry.current !== stage5Step) {
      lastBaselineEntry.current = stage5Step;
      const state = useGameStore.getState();
      if (step.gate === 'coins-threshold-s5-1' && state.s5M1CoinBaseline === 0) {
        useGameStore.setState({ s5M1CoinBaseline: state.coins });
        return;
      }
    }

    // ---- 2. Threshold check ----
    if (step.gate === 'coins-threshold-s5-1' &&
        coins - s5M1CoinBaseline >= STAGE5_MISSION1_TARGET) {
      if (advanceTimerRef.current == null) {
        advanceTimerRef.current = window.setTimeout(() => {
          advanceStage5();
          advanceTimerRef.current = null;
        }, 1500);
      }
    }
  }, [coins, s5M1CoinBaseline, stage5Step, stage4Completed, stage5Completed, advanceStage5]);

  // Speeder-anim done.
  useEffect(() => {
    if (!stage4Completed || stage5Completed) return;
    const step = getCurrentStage5Step(stage5Step);
    if (step?.gate === 'time-speeder-done' && !timeSpeederAnimating) advanceStage5();
  }, [timeSpeederAnimating, stage5Step, stage4Completed, stage5Completed, advanceStage5]);

  // Last-step freedom phase: auto-advance once player buys a meta item.
  useEffect(() => {
    if (!stage4Completed || stage5Completed) return;
    const step = getCurrentStage5Step(stage5Step);
    // Step 17 IS the stage-complete popup; freedom phase is implicit between
    // step 16's bridge popup (special-button → /goals) and the player tapping
    // "סיום". To create a true freedom phase that auto-fires the complete
    // popup, we re-use the Stage 4 pattern via the meta-purchase counter.
    if (step?.textCode === 'stage5_complete' && stage5Step === 17) {
      // Already on the complete popup — no auto-advance.
      return;
    }
  }, [stage5Step, stage4Completed, stage5Completed, s5MetaPurchaseCount]);

  // ----- Render gating -----
  if (!stage4Completed || stage5Completed) return null;
  const step = getCurrentStage5Step(stage5Step);
  if (!step) return null;
  if (step.gate === 'coins-threshold-s5-1') return null; // passive
  if (step.route && step.route !== 'any' && pathname !== step.route) return null;
  if (timeSpeederAnimating) return null;
  if (step.kind === 'visual' && step.gate === 'time-speeder-done') return null;

  const isLastStep = stage5Step === STAGE5_STEPS.length - 1;
  const handleAdvance = () => {
    if (isLastStep) {
      addEnergy(STAGE5_COMPLETE_ENERGY_REWARD);
      useGameStore.setState((s) => ({
        timeSpeeders: s.timeSpeeders + STAGE5_COMPLETE_BOOSTER_REWARD,
      }));
      completeStage5();
    } else {
      advanceStage5();
    }
  };

  // Visual step's "next" handler — if the step is gated on special-button,
  // route on advance too (visual screens drive their own continue button).
  const visualContinue = () => {
    if (step.gate === 'special-button') {
      if (step.btnTextCode === 'lesson_growth_three_btn') router.push('/goals');
    }
    handleAdvance();
  };

  // ----- Visuals -----
  if (step.kind === 'visual') {
    if (step.visual === 'stage-opener') {
      return (
        <StageOpener
          stage={5}
          icon="🗺️"
          title={t('stage5_opener_title')}
          body={t('stage5_opener_body')}
          ctaLabel={t('stage5_opener_cta')}
          onContinue={visualContinue}
        />
      );
    }
    if (step.visual === 'provident-intro')    return <ProvidentIntroScreen   onContinue={visualContinue} />;
    if (step.visual === 'provident-lock')     return <ProvidentLockScreen    onContinue={visualContinue} />;
    if (step.visual === 'allocation-toolbar') return <AllocationToolbar      onContinue={visualContinue} />;
    if (step.visual === 'three-growth')       return <ThreeInstrumentsGrowth onContinue={visualContinue} />;
    if (step.visual === 'camera-event')       return <CameraEventScreen      onResolved={handleAdvance} />;
    if (step.visual === 'provident-unlock')   return <ProvidentUnlockScreen  onContinue={visualContinue} />;
    if (step.visual === 'lesson-timeframe-1') return <LessonTimeframe1Screen onContinue={visualContinue} />;
    if (step.visual === 'lesson-timeframe-2') return <LessonTimeframe2Screen onContinue={visualContinue} />;
  }

  // ----- Special-button routing -----
  const handleSpecialButton = () => {
    switch (step.textCode) {
      case 'stage5_mission1_intro':    router.push('/board');   break;
      case 'stage5_mission1_complete': router.push('/finance'); break;
      // ThreeInstrumentsGrowth handles its own button — when this branch fires
      // (step.btnTextCode === lesson_growth_three_btn) we route to /goals.
    }
    if (step.btnTextCode === 'lesson_growth_three_btn') router.push('/goals');
    if (step.btnTextCode === 'stage5_to_goals_btn')     router.push('/goals');
    handleAdvance();
  };

  const handleSpeederButton = () => {
    const ok = useTimeSpeederAction();
    if (ok) advanceStage5();
  };

  const target = step.target ?? null;
  const continueHandler =
    step.gate === 'continue'        ? handleAdvance       :
    step.gate === 'special-button'  ? handleSpecialButton :
    step.gate === 'time-speeder'    ? handleSpeederButton :
    undefined;
  const continueLabel =
    step.gate === 'time-speeder' ? '⏳ הפעל מאיץ זמן' :
    step.btnTextCode             ? t(step.btnTextCode) :
    'המשך';
  const hideContinue =
    step.gate !== 'continue' &&
    step.gate !== 'special-button' &&
    step.gate !== 'time-speeder';

  return (
    <>
      <Spotlight selector={target} blockClicks={true} />
      <TutorialPopup
        text={step.textCode ? t(step.textCode) : ''}
        position={step.position ?? 'center'}
        anchorSelector={target ?? undefined}
        onContinue={continueHandler}
        continueLabel={continueLabel}
        hideContinue={hideContinue}
      />
    </>
  );
}
