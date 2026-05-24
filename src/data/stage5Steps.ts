/**
 * Stage 5 step configuration (PRD "User flow part 5" — short vs long term).
 *
 * Stage 5 introduces the Investment Provident Fund (קופת גמל להשקעה),
 * has the player allocate freely between 3 instruments, fires a forced
 * liquidity event (broken camera), and ends the entire intro journey.
 *
 * `stage5Step` in the store is the index into STAGE5_STEPS.
 */

export type Stage5Gate =
  | 'continue'
  | 'special-button'
  | 'coins-threshold-s5-1'
  | 'allocation-continue'    // 5.2 — non-blocking toolbar; player taps המשך
  | 'time-speeder'
  | 'time-speeder-done'
  | 'camera-resolved';       // popup auto-resolves on pay/ignore/expire

export type Route = '/board' | '/finance' | '/goals';
export type Position = 'center' | 'top-safe' | 'bottom-safe';
export type Kind = 'popup' | 'visual';

export interface Stage5Step {
  kind: Kind;
  textCode: string | null;
  btnTextCode?: string;
  target?: string | null;
  position?: Position;
  gate: Stage5Gate;
  route?: Route | 'any';
  visual?:
    | 'stage-opener'
    | 'provident-intro'
    | 'provident-lock'
    | 'allocation-toolbar'
    | 'speeder-anim'
    | 'three-growth'
    | 'camera-event'
    | 'provident-unlock'
    | 'lesson-timeframe-1'
    | 'lesson-timeframe-2';
}

// Stage 5 approved [X] values
export const STAGE5_MISSION1_TARGET   = 120;   // coin delta
export const STAGE5_MISSION1_REWARD   = 2;     // boosters
export const STAGE5_PROVIDENT_BONUS   = 0.10;  // +10% on every deposit into provident
export const STAGE5_PROVIDENT_LOCK    = 2;     // booster taps until unlocked
export const STAGE5_CAMERA_COST       = 60;
export const STAGE5_CAMERA_TIMER_MS   = 60_000; // 60 sec real-time

export const STAGE5_COMPLETE_ENERGY_REWARD  = 150;
export const STAGE5_COMPLETE_BOOSTER_REWARD = 10;

/** Player must buy at least this many Meta Goal items in 5.4-end freedom
 *  phase before the final stage-complete popup fires. */
export const STAGE5_META_PURCHASES_TO_COMPLETE = 1;

export const STAGE5_STEPS: Stage5Step[] = [
  // 0 — Stage 5 OPENER (new: same template as Stages 1/2/3/4)
  { kind: 'visual', textCode: null, visual: 'stage-opener',
    gate: 'continue', route: '/finance' },
  // 1 — Screen A: provident intro comparison
  { kind: 'visual', textCode: 'intro_provident', visual: 'provident-intro',
    gate: 'continue', route: '/finance' },
  // 2 — Screen B: lock explanation
  // (Screen C "bonus_provident" REMOVED per partner-review feedback)
  { kind: 'visual', textCode: 'lock_provident', visual: 'provident-lock',
    gate: 'continue', route: '/finance' },
  // 3 — Mission 1 intro
  { kind: 'popup', textCode: 'stage5_mission1_intro',
    btnTextCode: 'stage5_mission1_intro_btn',
    position: 'center', gate: 'special-button', route: 'any' },
  // 4 — passive: earn 120 coins delta
  { kind: 'popup', textCode: null, gate: 'coins-threshold-s5-1', route: 'any' },
  // 5 — Mission 1 complete → /finance
  { kind: 'popup', textCode: 'stage5_mission1_complete',
    btnTextCode: 'stage5_mission1_complete_btn',
    position: 'center', gate: 'special-button', route: 'any' },
  // 6 — 5.2 allocation phase: non-blocking toolbar, player splits freely
  { kind: 'visual', textCode: 'decision_allocation',
    visual: 'allocation-toolbar', gate: 'allocation-continue', route: '/finance' },
  // 7 — 5.3 first booster prompt
  { kind: 'popup', textCode: 'intro_timespeeder_1_stage5',
    position: 'top-safe', gate: 'time-speeder', route: '/finance' },
  // 8 — speeder anim
  { kind: 'visual', textCode: null, visual: 'speeder-anim',
    gate: 'time-speeder-done', route: '/finance' },
  // 9 — three-instrument growth comparison visual
  { kind: 'visual', textCode: 'lesson_growth_three', visual: 'three-growth',
    btnTextCode: 'lesson_growth_three_btn',
    gate: 'special-button', route: '/finance' },
  // 10 — camera event (on /goals)
  { kind: 'visual', textCode: 'event_urgency', visual: 'camera-event',
    gate: 'camera-resolved', route: '/goals' },
  // 11 — 5.4 second booster prompt (back to /finance)
  { kind: 'popup', textCode: 'intro_unlock_provident',
    position: 'top-safe', gate: 'time-speeder', route: '/finance' },
  // 12 — speeder anim
  { kind: 'visual', textCode: null, visual: 'speeder-anim',
    gate: 'time-speeder-done', route: '/finance' },
  // 13 — unlock visual
  { kind: 'visual', textCode: 'provident_unlocked', visual: 'provident-unlock',
    gate: 'continue', route: '/finance' },
  // 14 — lesson_timeframe_1
  { kind: 'visual', textCode: 'lesson_timeframe_1', visual: 'lesson-timeframe-1',
    gate: 'continue', route: '/finance' },
  // 15 — lesson_timeframe_2 (button "הבנתי")
  { kind: 'visual', textCode: 'lesson_timeframe_2', visual: 'lesson-timeframe-2',
    btnTextCode: 'lesson_timeframe_2_btn',
    gate: 'continue', route: '/finance' },
  // 16 — bridge → /goals
  { kind: 'popup', textCode: null, btnTextCode: 'stage5_to_goals_btn',
    position: 'bottom-safe', gate: 'special-button', route: '/finance' },
  // 17 — final: stage5_complete (sets intro_journey_completed)
  { kind: 'popup', textCode: 'stage5_complete', btnTextCode: 'btn_finish',
    position: 'center', gate: 'continue', route: 'any' },
];

export function getCurrentStage5Step(idx: number): Stage5Step | null {
  if (idx < 0 || idx >= STAGE5_STEPS.length) return null;
  return STAGE5_STEPS[idx];
}
