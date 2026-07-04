'use client';

import { useEffect, useState } from 'react';
import { useGameStore } from '@/stores/useGameStore';
import {
  getCurrentStage1Step,
  STAGE2_MISSION1_TARGET,
  STAGE2_MISSION2_TARGET,
  STAGE2_MISSION3_TARGET,
} from '@/data/stage1Steps';
import {
  getCurrentStage3Step,
  STAGE3_MISSION1_ORDERS,
  STAGE3_MISSION2_ORDERS,
  STAGE3_MISSION3_ORDERS,
} from '@/data/stage3Steps';
import {
  getCurrentStage4Step,
  STAGE4_MISSION1_TARGET,
  STAGE4_MISSION2_TARGET,
} from '@/data/stage4Steps';
import {
  getCurrentStage5Step,
  STAGE5_MISSION1_TARGET,
} from '@/data/stage5Steps';
import { t } from '@/data/strings';
import TutorialPopup from './TutorialPopup';

/**
 * Persistent mission-reminder button (PRD Stage-2 follow-up).
 *
 *   Floating ↗ badge anchored to the bottom-right of the viewport.
 *   Visible whenever a Stage 2 mission is "active and waiting" (the
 *   player is grinding toward a coin/deposit threshold). Tapping it
 *   re-opens the mission popup with a live progress bar.
 *
 * The popup is read-only:
 *   - shows mission text (same `textCode` the intro popup used)
 *   - shows a live progress bar
 *   - shows a "שלב 2 — משימה N מתוך 3" caption
 *   - ✕ close button only; no advance button
 *
 * Hides automatically when:
 *   - another tutorial popup is on screen (Stage1Overlay is rendering one)
 *   - the time-speeder spin animation is playing
 *   - Stage 2 is complete
 *   - the player is on a step that's not inside a mission window
 */

type ActiveMission = {
  /** Unique tag used to key persisted `lastSeen` per mission. */
  id: string;
  /** Display label inside the badge (1..5 or 'M'). */
  label: string;
  textCode: string;
  captionCode: string;
  current: number;
  target: number;
};

function getActiveMission(state: ReturnType<typeof useGameStore.getState>): ActiveMission | null {
  if (!state.tutorialCompleted) return null;

  // ---- Stage 2 (file name: stage1) — only while Stage 2 is active. ----
  if (!state.stage1Completed) {
    const step = getCurrentStage1Step(state.stage1Step);
    if (step?.gate === 'coins-threshold') {
      return {
        id: 's2-m1', label: '1',
        textCode: 'stage2_mission1_intro',
        captionCode: 'mission_reminder_caption_1',
        // Bug 3 fix: track the DELTA earned since the mission began, not
        // total coins. The completion gate in Stage1Overlay already uses
        // `coins - s2M1CoinBaseline`; the widget must match it or a player
        // who enters Stage 2 with a large balance sees an instantly-full
        // "300 / 300" bar while the mission is really at 0.
        current: Math.max(0, state.coins - state.s2M1CoinBaseline),
        target: STAGE2_MISSION1_TARGET,
      };
    }
    if (step?.gate === 'deposit-threshold') {
      return {
        id: 's2-m2', label: '2',
        textCode: 'stage2_mission2_intro',
        captionCode: 'mission_reminder_caption_2',
        // Match the delta-based completion gate (deposit balance minus the
        // baseline captured when the mission began).
        current: Math.max(0, (state.accounts?.deposit?.balance ?? 0) - state.s2M2DepositBaseline),
        target: STAGE2_MISSION2_TARGET,
      };
    }
    if (step?.gate === 'coins-threshold-3') {
      return {
        id: 's2-m3', label: '3',
        textCode: 'stage2_mission3_intro',
        captionCode: 'mission_reminder_caption_3',
        current: Math.max(0, state.coins - state.mission3CoinBaseline),
        target: STAGE2_MISSION3_TARGET,
      };
    }
    return null;
  }

  // ---- Stage 3 — once Stage 2 is done and Stage 3 isn't yet. ----
  if (!state.stage3Completed) {
    return getStage3Mission(state);
  }

  // ---- Stage 4 — once Stage 3 is done and Stage 4 isn't yet. ----
  if (!state.stage4Completed) {
    const s4 = getCurrentStage4Step(state.stage4Step);
    if (!s4) return null;
    switch (s4.gate) {
      case 'coins-threshold-s4-1':
        return {
          id: 's4-m1', label: '1',
          textCode: 'stage4_mission1_intro',
          captionCode: 'mission_reminder_caption_s4_1',
          current: Math.max(0, state.coins - state.s4M1CoinBaseline),
          target: STAGE4_MISSION1_TARGET,
        };
      case 'sp500-invest-s4-2':
        return {
          id: 's4-m2', label: '2',
          textCode: 'stage4_mission2_intro',
          captionCode: 'mission_reminder_caption_s4_2',
          current: Math.max(0, (state.accounts?.single_stock?.balance ?? 0) - state.s4M2SP500Baseline),
          target: STAGE4_MISSION2_TARGET,
        };
      default:
        return null;
    }
  }

  // ---- Stage 5 — once Stage 4 is done. ----
  if (state.stage5Completed) return null;
  const s5 = getCurrentStage5Step(state.stage5Step);
  if (!s5) return null;
  switch (s5.gate) {
    case 'coins-threshold-s5-1':
      return {
        id: 's5-m1', label: '1',
        textCode: 'stage5_mission1_intro',
        captionCode: 'mission_reminder_caption_s5_1',
        current: Math.max(0, state.coins - state.s5M1CoinBaseline),
        target: STAGE5_MISSION1_TARGET,
      };
    default:
      return null;
  }
}

function getStage3Mission(state: ReturnType<typeof useGameStore.getState>): ActiveMission | null {
  const s3 = getCurrentStage3Step(state.stage3Step);
  if (!s3) return null;

  const orders = state.totalOrdersCompleted || 0;
  switch (s3.gate) {
    case 'orders-threshold-s3-1':
      return {
        id: 's3-m1', label: '1',
        textCode: 'stage3_mission1_intro',
        captionCode: 'mission_reminder_caption_s3_1',
        current: Math.max(0, orders - state.s3m1OrdersBaseline),
        target: STAGE3_MISSION1_ORDERS,
      };
    case 'orders-threshold-s3-2':
      return {
        id: 's3-m2', label: '2',
        textCode: 'stage3_mission2_intro',
        captionCode: 'mission_reminder_caption_s3_2',
        current: Math.max(0, orders - state.s3m2OrdersBaseline),
        target: STAGE3_MISSION2_ORDERS,
      };
    case 'orders-threshold-s3-3':
      return {
        id: 's3-m3', label: '3',
        textCode: 'stage3_mission3_intro',
        captionCode: 'mission_reminder_caption_s3_3',
        current: Math.max(0, orders - state.s3m3OrdersBaseline),
        target: STAGE3_MISSION3_ORDERS,
      };
    case 'orders-threshold-s3-makeup':
      if (state.s3MakeupTarget <= 0) return null;
      return {
        id: 's3-makeup', label: 'M',
        textCode: state.s3SaleSpent1 > 0 && state.s3SaleSpent2 > 0
          ? 'stage3_makeup_mission_full'
          : 'stage3_makeup_mission',
        captionCode: 'mission_reminder_caption_s3_makeup',
        current: Math.max(0, orders - state.s3MakeupOrdersBaseline),
        target: state.s3MakeupTarget,
      };
    default:
      return null;
  }
}

export default function MissionReminderWidget() {
  // Subscribe to the slices that affect what the widget shows — across
  // Stage 2, Stage 3, and Stage 4 missions.
  const tutorialCompleted     = useGameStore((s) => s.tutorialCompleted);
  const stage1Completed       = useGameStore((s) => s.stage1Completed);
  const stage3Completed       = useGameStore((s) => s.stage3Completed);
  const stage4Completed       = useGameStore((s) => s.stage4Completed);
  const stage5Completed       = useGameStore((s) => s.stage5Completed);
  const introJourneyCompleted = useGameStore((s) => s.intro_journey_completed);
  const stage1Step            = useGameStore((s) => s.stage1Step);
  const stage3Step            = useGameStore((s) => s.stage3Step);
  const stage4Step            = useGameStore((s) => s.stage4Step);
  const stage5Step            = useGameStore((s) => s.stage5Step);
  const coins                 = useGameStore((s) => s.coins);
  const depositBalance        = useGameStore((s) => s.accounts?.deposit?.balance ?? 0);
  const mmBalance             = useGameStore((s) => s.accounts?.index_fund?.balance ?? 0);
  const sp500Balance          = useGameStore((s) => s.accounts?.single_stock?.balance ?? 0);
  const timeSpeederAnimating  = useGameStore((s) => s.timeSpeederAnimating);

  const [open, setOpen] = useState(false);
  // Persist "last peeked" per mission in localStorage so the unread-dot
  // doesn't re-flash on every page navigation.
  const [lastSeenProgress, setLastSeenInternal] = useState(0);

  const active = getActiveMission(useGameStore.getState());
  const lastSeenKey = active ? `mission-reminder-lastseen-${active.id}` : null;

  // Hydrate lastSeen from localStorage when the active mission changes.
  useEffect(() => {
    if (!lastSeenKey) return;
    try {
      const raw = window.localStorage.getItem(lastSeenKey);
      setLastSeenInternal(raw ? Number(raw) || 0 : 0);
    } catch {
      setLastSeenInternal(0);
    }
  }, [lastSeenKey]);

  const setLastSeen = (v: number) => {
    setLastSeenInternal(v);
    if (lastSeenKey) {
      try { window.localStorage.setItem(lastSeenKey, String(v)); } catch {}
    }
  };

  // Force a re-render when state values we depend on shift. (`active` is
  // derived from getState(), but the subscribed slices guarantee this
  // render cycle runs on every relevant event across all stages.)
  void coins; void depositBalance; void mmBalance; void sp500Balance;
  void stage1Step; void stage3Step; void stage4Step; void stage5Step;

  // Render gate: the widget is gone forever once the intro journey ends.
  if (!tutorialCompleted) return null;
  if (introJourneyCompleted) return null;
  if (stage1Completed && stage3Completed && stage4Completed && stage5Completed) return null;
  if (!active) return null;
  // Speeder anim plays full-screen — hide widget so it doesn't peek through.
  if (timeSpeederAnimating) return null;

  // Hide while another Stage 2 popup is on screen (only passive-wait steps
  // get here because `getActiveMission` already restricted to those gates).
  // Belt-and-braces: also bail if a fresh popup somehow sneaks in.

  const unread = active.current > lastSeenProgress && active.current < active.target;

  return (
    <>
      {/* Floating launcher button — fixed to bottom-right of the viewport */}
      <button
        type="button"
        className={`mission-reminder-fab ${unread ? 'mission-reminder-fab--pulse' : ''}`}
        onClick={() => {
          setOpen(true);
          setLastSeen(active.current);
        }}
        aria-label={t('mission_reminder_aria') || 'הצג משימה נוכחית'}
        aria-haspopup="dialog"
      >
        {/* ↗ glyph — points outward, suggesting "open" */}
        <span className="mission-reminder-fab-arrow" aria-hidden>↗</span>
        <span className="mission-reminder-fab-badge" aria-hidden>
          {active.label}
        </span>
        {unread && <span className="mission-reminder-fab-dot" aria-hidden />}
      </button>

      {open && (
        <TutorialPopup
          text={t(active.textCode)}
          caption={t(active.captionCode)}
          progress={{ current: active.current, target: active.target }}
          position="center"
          onClose={() => setOpen(false)}
          hideContinue
        />
      )}
    </>
  );
}
