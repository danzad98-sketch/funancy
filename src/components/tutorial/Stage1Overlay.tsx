'use client';

import { useEffect, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useGameStore } from '@/stores/useGameStore';
import {
  getCurrentStage1Step,
  STAGE1_STEPS,
  STAGE2_MISSION1_TARGET,
  STAGE2_MISSION1_REWARD,
  STAGE2_MISSION2_TARGET,
  STAGE2_MISSION2_REWARD,
  STAGE2_MISSION3_TARGET,
  STAGE2_COMPLETE_ENERGY_REWARD,
} from '@/data/stage1Steps';
import { t } from '@/data/strings';
import TutorialPopup from './TutorialPopup';
import Spotlight from './Spotlight';
import { MilkCartonScreen, BasketScreen } from './InflationVisualScreens';
import { InterestHedgeCompare, CompoundGraph } from './Stage2Visuals';
import StageOpener from './StageOpener';

/**
 * Stage 2 orchestrator (file kept as Stage1Overlay for back-compat).
 *
 * Mounts when first-time onboarding is done and stage2 isn't yet:
 *   tutorialCompleted === true && stage1Completed === false
 *
 * Owns:
 *  - Spotlight + popup rendering for all 33 Stage 2 steps
 *  - Auto-advance on coin / deposit / animation gates
 *  - Side-effect rewards (speeders on mission completes, energy on
 *    stage complete) and routing on special-button steps
 *  - Capturing per-mission baselines (mission3 coins / mission6 deposit)
 */
export default function Stage1Overlay() {
  const tutorialCompleted = useGameStore((s) => s.tutorialCompleted);
  const stage1Completed   = useGameStore((s) => s.stage1Completed);
  const stage1Step        = useGameStore((s) => s.stage1Step);
  const advanceStage1     = useGameStore((s) => s.advanceStage1);
  const completeStage1    = useGameStore((s) => s.completeStage1);
  const coins             = useGameStore((s) => s.coins);
  const accounts          = useGameStore((s) => s.accounts);
  const useTimeSpeederAction = useGameStore((s) => s.useTimeSpeeder);
  const timeSpeederAnimating = useGameStore((s) => s.timeSpeederAnimating);
  const s2M1CoinBaseline        = useGameStore((s) => s.s2M1CoinBaseline);
  const s2M2DepositBaseline     = useGameStore((s) => s.s2M2DepositBaseline);
  const mission3CoinBaseline    = useGameStore((s) => s.mission3CoinBaseline);
  const mission6DepositBaseline = useGameStore((s) => s.mission6DepositBaseline);
  const addEnergy         = useGameStore((s) => s.addEnergy);

  const router = useRouter();
  const pathname = usePathname();

  const depositBalance = accounts?.deposit?.balance ?? 0;

  // Body class so action gates can know Stage 2 is active.
  useEffect(() => {
    if (typeof document === 'undefined') return;
    const active = tutorialCompleted && !stage1Completed;
    if (active) document.body.classList.add('stage1-active');
    else        document.body.classList.remove('stage1-active');
    return () => { document.body.classList.remove('stage1-active'); };
  }, [tutorialCompleted, stage1Completed]);

  // ----- One-shot per-step entry side effects (non-baseline) -------------
  // Reward grants etc. — anything that runs once when a step becomes current.
  // Baseline captures are handled by the unified effect below.
  const lastEntryIdx = useRef<number>(-1);
  useEffect(() => {
    if (stage1Completed || !tutorialCompleted) return;
    if (lastEntryIdx.current === stage1Step) return;
    lastEntryIdx.current = stage1Step;

    const step = getCurrentStage1Step(stage1Step);
    if (!step) return;

    // Mission-2 complete (step 14): grant +1 speeder once on entry.
    if (step.textCode === 'stage2_mission2_complete') {
      useGameStore.setState((s) => ({
        timeSpeeders: s.timeSpeeders + STAGE2_MISSION2_REWARD,
      }));
    }
  }, [stage1Step, stage1Completed, tutorialCompleted]);

  // ----- Unified baseline + threshold-check + paced auto-advance ----------
  //
  // Race-condition fix: when a delta-tracked gate step becomes current we
  // MUST capture the baseline BEFORE the threshold check ever runs. If we
  // split these across two effects, the threshold check can fire on the
  // entry tick reading baseline=0 (stale) and instant-complete the mission.
  //
  // Unified flow per render where stage1Step changed to a delta gate:
  //   1. Capture baseline via setState, set lastBaselineEntry to this step.
  //   2. `return;` — skip the threshold check for THIS tick. The setState
  //      will trigger a re-render that fires this effect again with the
  //      fresh baseline available via the subscribed selector.
  //
  // Pacing fix: when threshold IS met, schedule the advance via setTimeout
  // (1.5 s) so the player can see the progress bar fill before the next
  // popup. The timer is ref-guarded so re-renders during the wait don't
  // schedule multiple advances.
  const lastBaselineEntry = useRef<number>(-1);
  const advanceTimerRef = useRef<number | null>(null);

  useEffect(() => {
    if (!tutorialCompleted || stage1Completed) return;
    const step = getCurrentStage1Step(stage1Step);
    if (!step) return;

    // Cancel any pending advance if we moved past the step that scheduled it.
    if (advanceTimerRef.current != null && lastBaselineEntry.current !== stage1Step) {
      window.clearTimeout(advanceTimerRef.current);
      advanceTimerRef.current = null;
    }

    // ---- 1. Baseline capture (one-shot per step entry) ----
    // Skip re-capture if the baseline was already set in a prior session
    // (persisted value > 0). This way a mid-mission page refresh doesn't
    // reset the snapshot to the player's current (already-earned) value.
    if (lastBaselineEntry.current !== stage1Step) {
      lastBaselineEntry.current = stage1Step;
      const state = useGameStore.getState();
      if (step.gate === 'coins-threshold' && state.s2M1CoinBaseline === 0) {
        useGameStore.setState({ s2M1CoinBaseline: state.coins });
        return;
      }
      if (step.gate === 'deposit-threshold' && state.s2M2DepositBaseline === 0) {
        const bal = state.accounts?.deposit?.balance ?? 0;
        useGameStore.setState({ s2M2DepositBaseline: bal });
        return;
      }
      if (step.gate === 'coins-threshold-3' && state.mission3CoinBaseline === 0) {
        useGameStore.setState({ mission3CoinBaseline: state.coins });
        return;
      }
      if (step.gate === 'deposit-extra' && state.mission6DepositBaseline === 0) {
        const bal = state.accounts?.deposit?.balance ?? 0;
        useGameStore.setState({ mission6DepositBaseline: bal });
        return;
      }
    }

    // ---- 2. Threshold check (subsequent renders, after baseline is set) ----
    let thresholdMet = false;
    let onAdvance: (() => void) | null = null;

    if (step.gate === 'coins-threshold' &&
        coins - s2M1CoinBaseline >= STAGE2_MISSION1_TARGET) {
      thresholdMet = true;
      onAdvance = () => useGameStore.setState((s) => ({
        timeSpeeders: s.timeSpeeders + STAGE2_MISSION1_REWARD,
      }));
    } else if (step.gate === 'deposit-threshold' &&
               depositBalance - s2M2DepositBaseline >= STAGE2_MISSION2_TARGET) {
      thresholdMet = true;
    } else if (step.gate === 'coins-threshold-3' &&
               coins - mission3CoinBaseline >= STAGE2_MISSION3_TARGET) {
      thresholdMet = true;
    } else if (step.gate === 'deposit-extra' &&
               depositBalance > mission6DepositBaseline) {
      thresholdMet = true;
    }

    if (thresholdMet && advanceTimerRef.current == null) {
      advanceTimerRef.current = window.setTimeout(() => {
        if (onAdvance) onAdvance();
        advanceStage1();
        advanceTimerRef.current = null;
      }, 1500);
    }
  }, [coins, depositBalance, stage1Step, stage1Completed, tutorialCompleted,
      s2M1CoinBaseline, s2M2DepositBaseline,
      mission3CoinBaseline, mission6DepositBaseline,
      advanceStage1]);

  // Speeder-animation done — advance once the animating flag flips off.
  useEffect(() => {
    if (stage1Completed) return;
    const step = getCurrentStage1Step(stage1Step);
    if (!step) return;
    if (step.gate === 'time-speeder-done' && !timeSpeederAnimating) {
      advanceStage1();
    }
  }, [timeSpeederAnimating, stage1Step, stage1Completed, advanceStage1]);

  // ----- Render gating -----------------------------------------------------
  if (!tutorialCompleted || stage1Completed) return null;

  const step = getCurrentStage1Step(stage1Step);
  if (!step) return null;

  // Pure-passive wait steps have no UI.
  if (step.gate === 'coins-threshold')   return null;
  if (step.gate === 'coins-threshold-3') return null;
  if (step.gate === 'deposit-threshold') return null;
  if (step.gate === 'deposit-extra')     return null;

  // Route gating: render only on the correct screen (or 'any').
  if (step.route && step.route !== 'any' && pathname !== step.route) return null;

  const isLastStep = stage1Step === STAGE1_STEPS.length - 1;

  const handleAdvance = () => {
    if (isLastStep) {
      addEnergy(STAGE2_COMPLETE_ENERGY_REWARD);
      completeStage1();
    } else {
      advanceStage1();
    }
  };

  // ----- Special-button routing -------------------------------------------
  // Each special-button step pushes to its next screen and advances.
  const handleSpecialButton = () => {
    switch (step.textCode) {
      case 'stage2_mission1_intro':       router.push('/board');   break;
      case 'stage2_mission1_complete':    router.push('/goals');   break;
      case 'inflection_2':                router.push('/finance'); break;
      case 'interest_hedge_conclusion':   router.push('/goals');   break;
      case 'stage2_mission3_complete':    router.push('/finance'); break;
      default:
        // step 21 "back to work" has textCode: null + btn_back_to_work.
        if (step.btnTextCode === 'btn_back_to_work') router.push('/board');
    }
    handleAdvance();
  };

  // While the spinning clock plays, suppress this overlay.
  if (timeSpeederAnimating) return null;

  // Visual: speeder-animation placeholder — Stage1Overlay idles, the
  // TimeSpeederAnimation component renders the spinning clock.
  if (step.kind === 'visual' && step.gate === 'time-speeder-done') return null;

  // Educational visuals.
  if (step.kind === 'visual') {
    if (step.visual === 'stage-opener') {
      return (
        <StageOpener
          stage={2}
          icon="🛡️"
          title={t('stage2_opener_title')}
          body={t('stage2_opener_body')}
          ctaLabel={t('stage2_opener_cta')}
          onContinue={handleAdvance}
        />
      );
    }
    if (step.visual === 'milk-carton') return <MilkCartonScreen onContinue={handleAdvance} />;
    if (step.visual === 'basket')      return <BasketScreen      onContinue={handleAdvance} />;
    if (step.visual === 'interest-hedge-compare')
      return <InterestHedgeCompare onContinue={handleAdvance} />;
    if (step.visual === 'compound-graph')
      return <CompoundGraph onContinue={handleAdvance} />;
    return <div className="tut-dim" onClick={handleAdvance} aria-hidden="true" style={{ cursor: 'pointer' }} />;
  }

  // Embedded time-booster button on `time-speeder` gate popups.
  const handleSpeederButton = () => {
    const ok = useTimeSpeederAction();
    if (ok) advanceStage1();
  };

  const target = step.target ?? null;
  const continueHandler =
    step.gate === 'continue'        ? handleAdvance        :
    step.gate === 'special-button'  ? handleSpecialButton  :
    step.gate === 'time-speeder'    ? handleSpeederButton  :
    undefined;
  const continueLabel =
    step.gate === 'time-speeder' ? '⏳ הפעל מאיץ זמן' :
    step.btnTextCode             ? t(step.btnTextCode)  :
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
