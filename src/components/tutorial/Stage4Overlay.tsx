'use client';

import { useEffect, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useGameStore } from '@/stores/useGameStore';
import {
  getCurrentStage4Step,
  STAGE4_STEPS,
  STAGE4_MISSION1_TARGET,
  STAGE4_MISSION1_REWARD,
  STAGE4_MISSION2_TARGET,
  STAGE4_COMPLETE_ENERGY_REWARD,
  STAGE4_COMPLETE_BOOSTER_REWARD,
  STAGE4_META_PURCHASES_TO_COMPLETE,
} from '@/data/stage4Steps';
import { t } from '@/data/strings';
import TutorialPopup from './TutorialPopup';
import Spotlight from './Spotlight';
import StageOpener from './StageOpener';
import {
  StockPiecesScreen,
  IndexBasketScreen,
  SP500LogosScreen,
  SP500GrowthGraph,
  SP500VolatilityGraph,
  RiskSpectrumScreen,
} from './Stage4Visuals';

/**
 * Stage 4 orchestrator. Mounts after Stage 3 completes:
 *   stage3Completed === true && !stage4Completed
 *
 * Owns:
 *  - Stock-market intro visuals (4.1 screens A/B/C)
 *  - Mission 1 (earn coins) + Mission 2 (invest in S&P 500)
 *  - 4.2 first booster animation + growth result graph
 *  - 4.3 second booster: arms the scripted-drop one-shot before the tap
 *  - 4.4 risk spectrum + bridge → /goals
 *  - Stage complete reward (+100 ⚡ + 5 ⏳)
 */
export default function Stage4Overlay() {
  const stage3Completed       = useGameStore((s) => s.stage3Completed);
  const stage4Completed       = useGameStore((s) => s.stage4Completed);
  const stage4Step            = useGameStore((s) => s.stage4Step);
  const advanceStage4         = useGameStore((s) => s.advanceStage4);
  const completeStage4        = useGameStore((s) => s.completeStage4);
  const armStage4ScriptedDrop = useGameStore((s) => s.armStage4ScriptedDrop);
  const armStage4PositiveSeries = useGameStore((s) => s.armStage4PositiveSeries);
  const coins                 = useGameStore((s) => s.coins);
  const accounts              = useGameStore((s) => s.accounts);
  const useTimeSpeederAction  = useGameStore((s) => s.useTimeSpeeder);
  const timeSpeederAnimating  = useGameStore((s) => s.timeSpeederAnimating);
  const addEnergy             = useGameStore((s) => s.addEnergy);
  const s4M1CoinBaseline      = useGameStore((s) => s.s4M1CoinBaseline);
  const s4M2SP500Baseline     = useGameStore((s) => s.s4M2SP500Baseline);
  const s4MetaPurchaseCount   = useGameStore((s) => s.s4MetaPurchaseCount);

  const router = useRouter();
  const pathname = usePathname();

  const sp500Balance = accounts?.single_stock?.balance ?? 0;

  useEffect(() => {
    if (typeof document === 'undefined') return;
    const active = stage3Completed && !stage4Completed;
    if (active) document.body.classList.add('stage4-active');
    else        document.body.classList.remove('stage4-active');
    return () => { document.body.classList.remove('stage4-active'); };
  }, [stage3Completed, stage4Completed]);

  // ----- One-shot per-step entry effects -----
  const lastEntryIdx = useRef<number>(-1);
  useEffect(() => {
    if (!stage3Completed || stage4Completed) return;
    if (lastEntryIdx.current === stage4Step) return;
    lastEntryIdx.current = stage4Step;

    const step = getCurrentStage4Step(stage4Step);
    if (!step) return;

    // Non-baseline side effects only — baselines handled by unified effect.
    if (step.gate === 'meta-progress-s4') {
      useGameStore.setState({ s4MetaPurchaseCount: 0 });
    }
    if (step.textCode === 'stage4_mission1_complete') {
      useGameStore.setState((s) => ({
        timeSpeeders: s.timeSpeeders + STAGE4_MISSION1_REWARD,
      }));
    }
    // 4.2: arm the positive-bias re-roll for the FIRST booster prompt so the
    // growth lesson always lands on a winning year.
    if (step.textCode === 'intro_growth_sp500') {
      armStage4PositiveSeries();
    }
    // 4.3: arm the scripted-drop one-shot the moment the prompt becomes
    // current (so the NEXT useTimeSpeeder call sees the flag set).
    if (step.textCode === 'intro_volatility') {
      armStage4ScriptedDrop();
    }
  }, [stage4Step, stage3Completed, stage4Completed,
      armStage4ScriptedDrop, armStage4PositiveSeries]);

  // ---- Unified baseline + threshold-check + paced auto-advance ----------
  const lastBaselineEntry = useRef<number>(-1);
  const advanceTimerRef = useRef<number | null>(null);

  useEffect(() => {
    if (!stage3Completed || stage4Completed) return;
    const step = getCurrentStage4Step(stage4Step);
    if (!step) return;

    if (advanceTimerRef.current != null && lastBaselineEntry.current !== stage4Step) {
      window.clearTimeout(advanceTimerRef.current);
      advanceTimerRef.current = null;
    }

    // ---- 1. Baseline capture (one-shot per step entry) ----
    // Skip re-capture if the baseline was already set in a prior session.
    if (lastBaselineEntry.current !== stage4Step) {
      lastBaselineEntry.current = stage4Step;
      const state = useGameStore.getState();
      if (step.gate === 'coins-threshold-s4-1' && state.s4M1CoinBaseline === 0) {
        useGameStore.setState({ s4M1CoinBaseline: state.coins });
        return;
      }
      if (step.gate === 'sp500-invest-s4-2' && state.s4M2SP500Baseline === 0) {
        useGameStore.setState({
          s4M2SP500Baseline: state.accounts.single_stock?.balance ?? 0,
        });
        return;
      }
    }

    // ---- 2. Threshold check (subsequent renders) ----
    let thresholdMet = false;
    if (step.gate === 'coins-threshold-s4-1' &&
        coins - s4M1CoinBaseline >= STAGE4_MISSION1_TARGET) thresholdMet = true;
    if (step.gate === 'sp500-invest-s4-2' &&
        sp500Balance - s4M2SP500Baseline >= STAGE4_MISSION2_TARGET) thresholdMet = true;
    if (step.gate === 'meta-progress-s4' &&
        s4MetaPurchaseCount >= STAGE4_META_PURCHASES_TO_COMPLETE) thresholdMet = true;

    if (thresholdMet && advanceTimerRef.current == null) {
      advanceTimerRef.current = window.setTimeout(() => {
        advanceStage4();
        advanceTimerRef.current = null;
      }, 1500);
    }
  }, [coins, sp500Balance, s4M1CoinBaseline, s4M2SP500Baseline,
      s4MetaPurchaseCount, stage4Step, stage3Completed, stage4Completed,
      advanceStage4]);

  // Speeder-anim done.
  useEffect(() => {
    if (!stage3Completed || stage4Completed) return;
    const step = getCurrentStage4Step(stage4Step);
    if (step?.gate === 'time-speeder-done' && !timeSpeederAnimating) {
      advanceStage4();
    }
  }, [timeSpeederAnimating, stage4Step, stage3Completed, stage4Completed, advanceStage4]);

  // ----- Render gating -----
  if (!stage3Completed || stage4Completed) return null;
  const step = getCurrentStage4Step(stage4Step);
  if (!step) return null;

  if (step.gate === 'coins-threshold-s4-1' ||
      step.gate === 'sp500-invest-s4-2' ||
      step.gate === 'meta-progress-s4') return null;

  if (step.route && step.route !== 'any' && pathname !== step.route) return null;
  if (timeSpeederAnimating) return null;
  if (step.kind === 'visual' && step.gate === 'time-speeder-done') return null;

  const isLastStep = stage4Step === STAGE4_STEPS.length - 1;
  const handleAdvance = () => {
    if (isLastStep) {
      addEnergy(STAGE4_COMPLETE_ENERGY_REWARD);
      useGameStore.setState((s) => ({
        timeSpeeders: s.timeSpeeders + STAGE4_COMPLETE_BOOSTER_REWARD,
      }));
      completeStage4();
    } else {
      advanceStage4();
    }
  };

  // ----- Visuals -----
  if (step.kind === 'visual') {
    if (step.visual === 'stage-opener') {
      return (
        <StageOpener
          stage={4}
          icon="📈"
          title={t('stage4_opener_title')}
          body={t('stage4_opener_body')}
          ctaLabel={t('stage4_opener_cta')}
          onContinue={handleAdvance}
        />
      );
    }
    if (step.visual === 'stock-pieces') return <StockPiecesScreen onContinue={handleAdvance} />;
    if (step.visual === 'index-basket') return <IndexBasketScreen onContinue={handleAdvance} />;
    if (step.visual === 'sp500-logos')  return <SP500LogosScreen  onContinue={handleAdvance} />;
    if (step.visual === 'sp500-growth') return <SP500GrowthGraph  onContinue={handleAdvance} />;
    if (step.visual === 'sp500-volatility') return <SP500VolatilityGraph onContinue={handleAdvance} />;
    if (step.visual === 'risk-spectrum') return <RiskSpectrumScreen onContinue={handleAdvance} />;
  }

  // ----- Special-button routing -----
  const handleSpecialButton = () => {
    switch (step.textCode) {
      case 'stage4_mission1_intro':    router.push('/board');   break;
      case 'stage4_mission1_complete': router.push('/finance'); break;
    }
    // The "עבור למטרות" bridge popup (step 15) has no textCode but uses btn_textCode.
    if (step.btnTextCode === 'stage4_to_goals_btn') router.push('/goals');
    handleAdvance();
  };

  const handleSpeederButton = () => {
    const ok = useTimeSpeederAction();
    if (ok) advanceStage4();
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
