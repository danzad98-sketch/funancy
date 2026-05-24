'use client';

import { useEffect, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useGameStore } from '@/stores/useGameStore';
import {
  getCurrentStage3Step,
  STAGE3_STEPS,
  STAGE3_MISSION1_ORDERS,
  STAGE3_MISSION2_ORDERS,
  STAGE3_MISSION3_ORDERS,
  STAGE3_COMPLETE_ENERGY_REWARD,
  STAGE3_COMPLETE_BOOSTER_REWARD,
  STAGE3_MAKEUP_MULTIPLIER_PARTIAL,
  STAGE3_MAKEUP_MULTIPLIER_FULL,
  STAGE3_MAKEUP_TARGET_MAX_PARTIAL,
  STAGE3_MAKEUP_TARGET_MAX_FULL,
} from '@/data/stage3Steps';
import { t } from '@/data/strings';
import TutorialPopup from './TutorialPopup';
import Spotlight from './Spotlight';
import StageOpener from './StageOpener';
import {
  WeeklySavingsGraph,
  Stage3LessonBranch,
} from './Stage3Visuals';

/**
 * Stage 3 orchestrator — REBUILT for the standing-order flow.
 *
 * Lifecycle:
 *   stage1Completed === true  &&  stage3Completed === false
 *
 * Owns:
 *  - Stage opener (step 0)
 *  - Standing-order intro popup + setup tooltip (steps 1-2)
 *  - 3 missions of "complete X orders" with passive gates
 *  - 2 sales windows (game-time, ended by next booster)
 *  - Weekly-growth lesson graph (step 14)
 *  - Branched lesson popup at step 20 (disciplined / partial / spent)
 *  - Conditional makeup mission (steps 21-23)
 *  - Stage complete reward
 */
export default function Stage3Overlay() {
  const stage1Completed   = useGameStore((s) => s.stage1Completed);
  const stage3Completed   = useGameStore((s) => s.stage3Completed);
  const stage3Step        = useGameStore((s) => s.stage3Step);
  const advanceStage3     = useGameStore((s) => s.advanceStage3);
  const completeStage3    = useGameStore((s) => s.completeStage3);
  const setStage3Step     = useGameStore((s) => s.setStage3Step);
  const setMakeupTarget   = useGameStore((s) => s.setMakeupTarget);
  const activateStandingOrder = useGameStore((s) => s.activateStandingOrder);
  const startSale         = useGameStore((s) => s.startSale);
  const useTimeSpeederAction = useGameStore((s) => s.useTimeSpeeder);
  const timeSpeederAnimating = useGameStore((s) => s.timeSpeederAnimating);
  const addEnergy         = useGameStore((s) => s.addEnergy);
  const activeSale        = useGameStore((s) => s.activeSale);
  const totalOrders       = useGameStore((s) => s.totalOrdersCompleted);
  const s3m1Baseline      = useGameStore((s) => s.s3m1OrdersBaseline);
  const s3m2Baseline      = useGameStore((s) => s.s3m2OrdersBaseline);
  const s3m3Baseline      = useGameStore((s) => s.s3m3OrdersBaseline);
  const s3MakeupBaseline  = useGameStore((s) => s.s3MakeupOrdersBaseline);
  const s3MakeupTarget    = useGameStore((s) => s.s3MakeupTarget);

  const router = useRouter();
  const pathname = usePathname();

  // Body class — used by other UI to know Stage 3 is live (coin-split FX).
  useEffect(() => {
    if (typeof document === 'undefined') return;
    const active = stage1Completed && !stage3Completed;
    if (active) document.body.classList.add('stage3-active');
    else        document.body.classList.remove('stage3-active');
    return () => { document.body.classList.remove('stage3-active'); };
  }, [stage1Completed, stage3Completed]);

  // ----- One-shot per-step entry effects (non-baseline side effects) -----
  const lastEntryIdx = useRef<number>(-1);
  useEffect(() => {
    if (!stage1Completed || stage3Completed) return;
    if (lastEntryIdx.current === stage3Step) return;
    lastEntryIdx.current = stage3Step;

    const step = getCurrentStage3Step(stage3Step);
    if (!step) return;

    // The setup tooltip's confirm tap (step 2 → 3) activates the standing order.
    // We trigger it on entry to step 3 so the first sale during M1 already splits.
    if (stage3Step === 3) {
      activateStandingOrder();
    }
  }, [stage3Step, stage1Completed, stage3Completed, activateStandingOrder]);

  // ----- Unified baseline + threshold-check + paced auto-advance -----
  const lastBaselineEntry = useRef<number>(-1);
  const advanceTimerRef = useRef<number | null>(null);

  useEffect(() => {
    if (!stage1Completed || stage3Completed) return;
    const step = getCurrentStage3Step(stage3Step);
    if (!step) return;

    // Cancel pending advance if step changed.
    if (advanceTimerRef.current != null && lastBaselineEntry.current !== stage3Step) {
      window.clearTimeout(advanceTimerRef.current);
      advanceTimerRef.current = null;
    }

    // ---- Baseline capture (only on first entry where baseline is still 0) ----
    if (lastBaselineEntry.current !== stage3Step) {
      lastBaselineEntry.current = stage3Step;
      const state = useGameStore.getState();
      switch (step.gate) {
        case 'orders-threshold-s3-1':
          if (state.s3m1OrdersBaseline === 0) {
            useGameStore.setState({ s3m1OrdersBaseline: state.totalOrdersCompleted || 0 });
            return;
          }
          break;
        case 'orders-threshold-s3-2':
          if (state.s3m2OrdersBaseline === 0) {
            useGameStore.setState({ s3m2OrdersBaseline: state.totalOrdersCompleted || 0 });
            return;
          }
          break;
        case 'orders-threshold-s3-3':
          if (state.s3m3OrdersBaseline === 0) {
            useGameStore.setState({ s3m3OrdersBaseline: state.totalOrdersCompleted || 0 });
            return;
          }
          break;
        case 'orders-threshold-s3-makeup':
          if (state.s3MakeupOrdersBaseline === 0) {
            useGameStore.setState({ s3MakeupOrdersBaseline: state.totalOrdersCompleted || 0 });
            return;
          }
          break;
      }
    }

    // ---- Threshold checks ----
    const orders = totalOrders || 0;
    let thresholdMet = false;
    switch (step.gate) {
      case 'orders-threshold-s3-1':
        if (orders - s3m1Baseline >= STAGE3_MISSION1_ORDERS) thresholdMet = true;
        break;
      case 'orders-threshold-s3-2':
        if (orders - s3m2Baseline >= STAGE3_MISSION2_ORDERS) thresholdMet = true;
        break;
      case 'orders-threshold-s3-3':
        if (orders - s3m3Baseline >= STAGE3_MISSION3_ORDERS) thresholdMet = true;
        break;
      case 'orders-threshold-s3-makeup':
        if (s3MakeupTarget > 0 && orders - s3MakeupBaseline >= s3MakeupTarget) thresholdMet = true;
        break;
    }

    if (thresholdMet && advanceTimerRef.current == null) {
      advanceTimerRef.current = window.setTimeout(() => {
        advanceStage3();
        advanceTimerRef.current = null;
      }, 1500);
    }
  }, [totalOrders, stage3Step, stage1Completed, stage3Completed,
      s3m1Baseline, s3m2Baseline, s3m3Baseline,
      s3MakeupBaseline, s3MakeupTarget, advanceStage3]);

  // Sale-end gate — fires when the active sale clears (player tapped a booster).
  useEffect(() => {
    if (!stage1Completed || stage3Completed) return;
    const step = getCurrentStage3Step(stage3Step);
    if (step?.gate === 'sale-end' && activeSale === null) advanceStage3();
  }, [activeSale, stage3Step, stage1Completed, stage3Completed, advanceStage3]);

  // Speeder-anim done.
  useEffect(() => {
    if (!stage1Completed || stage3Completed) return;
    const step = getCurrentStage3Step(stage3Step);
    if (step?.gate === 'time-speeder-done' && !timeSpeederAnimating) advanceStage3();
  }, [timeSpeederAnimating, stage3Step, stage1Completed, stage3Completed, advanceStage3]);

  // ----- Render gating -----
  if (!stage1Completed || stage3Completed) return null;
  const step = getCurrentStage3Step(stage3Step);
  if (!step) return null;

  if (step.gate === 'orders-threshold-s3-1'
      || step.gate === 'orders-threshold-s3-2'
      || step.gate === 'orders-threshold-s3-3'
      || step.gate === 'orders-threshold-s3-makeup'
      || step.gate === 'sale-end') return null;

  if (step.route && step.route !== 'any' && pathname !== step.route) return null;
  if (timeSpeederAnimating) return null;
  if (step.kind === 'visual' && step.gate === 'time-speeder-done') return null;

  const isLastStep = stage3Step === STAGE3_STEPS.length - 1;
  const handleAdvance = () => {
    if (isLastStep) {
      addEnergy(STAGE3_COMPLETE_ENERGY_REWARD);
      useGameStore.setState((s) => ({
        timeSpeeders: s.timeSpeeders + STAGE3_COMPLETE_BOOSTER_REWARD,
      }));
      completeStage3();
    } else {
      advanceStage3();
    }
  };

  // ---- Lesson-branch visual (step 20) ----
  if (step.kind === 'visual' && step.visual === 'lesson-branch') {
    const state = useGameStore.getState();
    const ordersInSales = state.s3OrdersDuringSales || 0;
    const salesUsed = (state.s3SaleSpent1 > 0 ? 1 : 0) + (state.s3SaleSpent2 > 0 ? 1 : 0);
    const branch =
      salesUsed === 0 ? 'disciplined' :
      salesUsed === 1 ? 'partial'     :
                        'spent';

    return (
      <Stage3LessonBranch
        branch={branch}
        ordersInSales={ordersInSales}
        savedTotal={state.s3StandingOrderTotal || 0}
        spentTotal={state.s3SaleSpent1 + state.s3SaleSpent2}
        onContinue={() => {
          if (branch === 'disciplined') {
            // Jump straight to stage complete (step 24).
            setStage3Step(24);
          } else {
            const mult = branch === 'partial'
              ? STAGE3_MAKEUP_MULTIPLIER_PARTIAL
              : STAGE3_MAKEUP_MULTIPLIER_FULL;
            const cap  = branch === 'partial'
              ? STAGE3_MAKEUP_TARGET_MAX_PARTIAL
              : STAGE3_MAKEUP_TARGET_MAX_FULL;
            const target = Math.min(cap, Math.max(1, Math.round(ordersInSales * mult)));
            setMakeupTarget(target);
            advanceStage3();
          }
        }}
      />
    );
  }

  // ---- Visuals ----
  if (step.kind === 'visual') {
    if (step.visual === 'stage-opener') {
      return (
        <StageOpener
          stage={3}
          icon="💸"
          title={t('stage3_opener_title')}
          body={t('stage3_opener_body')}
          ctaLabel={t('stage3_opener_cta')}
          onContinue={handleAdvance}
        />
      );
    }
    if (step.visual === 'weekly-growth') {
      return (
        <WeeklySavingsGraph
          caption={t('visual_habit_savings')}
          ctaLabel={t(step.btnTextCode || 'visual_habit_to_goals_btn')}
          onContinue={() => { router.push('/goals'); handleAdvance(); }}
        />
      );
    }
  }

  // ---- Makeup-mission popup text picker (step 21) ----
  let popupText: string | null = step.textCode ? t(step.textCode) : '';
  if (step.textCode === 'stage3_makeup_mission') {
    const state = useGameStore.getState();
    const isFull = state.s3SaleSpent1 > 0 && state.s3SaleSpent2 > 0;
    const code = isFull ? 'stage3_makeup_mission_full' : 'stage3_makeup_mission';
    popupText = t(code).replaceAll('[TARGET]', String(s3MakeupTarget));
  }

  // ---- Special-button routing ----
  const handleSpecialButton = () => {
    switch (step.textCode) {
      case 'stage3_mission1_intro':      router.push('/board');   break;
      case 'stage3_mission1_complete':   router.push('/finance'); break;
      case 'sale_1_notification':        startSale(1); router.push('/goals'); break;
      case 'stage3_mission2_intro':      router.push('/board');   break;
      case 'stage3_mission2_complete':   router.push('/finance'); break;
      case 'sale_2_notification':        startSale(2); router.push('/goals'); break;
      case 'stage3_mission3_intro':      router.push('/board');   break;
      case 'stage3_mission3_complete':   router.push('/finance'); break;
      case 'stage3_makeup_mission':      router.push('/board');   break;
      case 'stage3_makeup_complete':     router.push('/goals');   break;
    }
    handleAdvance();
  };

  const handleSpeederButton = () => {
    const ok = useTimeSpeederAction();
    if (ok) advanceStage3();
  };

  const target = step.target ?? null;
  const continueHandler =
    step.gate === 'continue'        ? handleAdvance        :
    step.gate === 'special-button'  ? handleSpecialButton  :
    step.gate === 'time-speeder'    ? handleSpeederButton  :
    undefined;
  const continueLabel =
    step.gate === 'time-speeder' ? '⏳ הפעל מאיץ זמן' :
    step.btnTextCode             ? t(step.btnTextCode) :
    'המשך';
  const hideContinue =
    step.gate !== 'continue' &&
    step.gate !== 'special-button' &&
    step.gate !== 'time-speeder';

  const subtext = step.subTextCode ? t(step.subTextCode) : undefined;

  return (
    <>
      <Spotlight selector={target} blockClicks={true} />
      <TutorialPopup
        text={popupText ?? ''}
        subtext={subtext}
        position={step.position ?? 'center'}
        anchorSelector={target ?? undefined}
        onContinue={continueHandler}
        continueLabel={continueLabel}
        hideContinue={hideContinue}
      />
    </>
  );
}
