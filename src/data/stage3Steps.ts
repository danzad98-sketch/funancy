/**
 * Stage 3 step configuration — "User flow part 3" (FINAL version).
 *
 * New Stage 3 is built around a STANDING ORDER (הוראת קבע):
 *   - 50% of every Working Board sale auto-splits to the Bank Deposit
 *   - The player feels a habit forming as the deposit grows in the
 *     background while they work
 *   - Two limited-time sales tempt them in /goals between missions
 *   - A final behaviour-based lesson popup branches on what they did
 *
 * Money Market Fund (`index_fund`) is no longer part of this stage.
 * The standing order targets the Bank Deposit (`deposit` AccountType),
 * which was already unlocked at the start of Stage 2.
 *
 * `stage3Step` in the store is the index into STAGE3_STEPS.
 */

export type Stage3Gate =
  | 'continue'
  | 'special-button'
  | 'orders-threshold-s3-1'
  | 'orders-threshold-s3-2'
  | 'orders-threshold-s3-3'
  | 'orders-threshold-s3-makeup'
  | 'time-speeder'
  | 'time-speeder-done'
  | 'sale-end';

export type Route = '/board' | '/finance' | '/goals';
export type Position = 'center' | 'top-safe' | 'bottom-safe';
export type Kind = 'popup' | 'visual';

export interface Stage3Step {
  kind: Kind;
  textCode: string | null;
  btnTextCode?: string;
  /** Tagline / subtext rendered below the main popup text. */
  subTextCode?: string;
  target?: string | null;
  position?: Position;
  gate: Stage3Gate;
  route?: Route | 'any';
  visual?:
    | 'stage-opener'
    | 'speeder-anim'
    | 'weekly-growth'
    | 'lesson-branch';
}

// Official Excel mission targets (sheet "תמחור משימות").
export const STAGE3_MISSION1_ORDERS = 15;  // complete X orders
export const STAGE3_MISSION2_ORDERS = 20;
export const STAGE3_MISSION3_ORDERS = 25;

export const STAGE3_STANDING_ORDER_RATE = 0.5;     // 50% split per spec
export const STAGE3_SALE_DISCOUNT       = 0.10;
export const STAGE3_MM_ANNUAL_RATE      = 0.04;    // legacy — still used by Stage 2 compound-vs-MM visual

export const STAGE3_MAKEUP_MULTIPLIER_PARTIAL = 1.0;  // 1× orders done during sales
export const STAGE3_MAKEUP_MULTIPLIER_FULL    = 1.5;  // 1.5× for the both-sales case
export const STAGE3_MAKEUP_TARGET_MAX_PARTIAL = 8;    // cap (orders)
export const STAGE3_MAKEUP_TARGET_MAX_FULL    = 12;

export const STAGE3_COMPLETE_ENERGY_REWARD  = 75;
export const STAGE3_COMPLETE_BOOSTER_REWARD = 3;

export const STAGE3_STEPS: Stage3Step[] = [
  // 0 — Stage opener
  { kind: 'visual', textCode: null, visual: 'stage-opener',
    gate: 'continue', route: '/finance' },

  // 1 — Standing-order concept popup
  { kind: 'popup', textCode: 'intro_order_standing',
    btnTextCode: 'intro_order_standing_btn',
    position: 'center', gate: 'continue', route: '/finance' },

  // 2 — Standing-order setup tooltip (anchored on the deposit card)
  { kind: 'popup', textCode: 'setup_order_standing',
    btnTextCode: 'setup_order_standing_btn',
    target: '[data-tut="deposit-account"]',
    position: 'top-safe', gate: 'continue', route: '/finance' },

  // 3 — Mission 1 intro → /board
  { kind: 'popup', textCode: 'stage3_mission1_intro',
    subTextCode: 'stage3_mission1_tagline',
    btnTextCode: 'stage3_mission1_intro_btn',
    position: 'center', gate: 'special-button', route: 'any' },

  // 4 — passive: complete 4 orders
  { kind: 'popup', textCode: null,
    gate: 'orders-threshold-s3-1', route: 'any' },

  // 5 — Mission 1 complete → /finance
  { kind: 'popup', textCode: 'stage3_mission1_complete',
    btnTextCode: 'stage3_mission1_complete_btn',
    position: 'center', gate: 'special-button', route: 'any' },

  // 6 — Standing order in action (tooltip on deposit row)
  { kind: 'popup', textCode: 'result_order_standing',
    btnTextCode: 'result_order_standing_btn',
    target: '[data-tut="deposit-account"]',
    position: 'top-safe', gate: 'continue', route: '/finance' },

  // 7 — Sale 1 notification → /goals + start sale
  { kind: 'popup', textCode: 'sale_1_notification',
    btnTextCode: 'onboarding_btn_got_it',
    position: 'center', gate: 'special-button', route: 'any' },

  // 8 — passive: sale 1 active (advances when player taps a booster)
  { kind: 'popup', textCode: null,
    gate: 'sale-end', route: 'any' },

  // 9 — Mission 2 intro → /board
  { kind: 'popup', textCode: 'stage3_mission2_intro',
    btnTextCode: 'stage3_mission2_intro_btn',
    position: 'center', gate: 'special-button', route: 'any' },

  // 10 — passive: complete 5 orders
  { kind: 'popup', textCode: null,
    gate: 'orders-threshold-s3-2', route: 'any' },

  // 11 — Mission 2 complete → /finance
  { kind: 'popup', textCode: 'stage3_mission2_complete',
    btnTextCode: 'stage3_mission2_complete_btn',
    position: 'center', gate: 'special-button', route: 'any' },

  // 12 — Growth tooltip (anchored to booster)
  { kind: 'popup', textCode: 'intro_growth_savings',
    btnTextCode: 'intro_growth_savings_btn',
    position: 'top-safe', gate: 'time-speeder', route: '/finance' },

  // 13 — speeder anim
  { kind: 'visual', textCode: null, visual: 'speeder-anim',
    gate: 'time-speeder-done', route: '/finance' },

  // 14 — Weekly-growth lesson graph
  { kind: 'visual', textCode: 'visual_habit_savings', visual: 'weekly-growth',
    btnTextCode: 'visual_habit_to_goals_btn',
    gate: 'special-button', route: '/finance' },

  // 15 — Sale 2 notification → /goals + start sale 2
  { kind: 'popup', textCode: 'sale_2_notification',
    btnTextCode: 'onboarding_btn_got_it',
    position: 'center', gate: 'special-button', route: 'any' },

  // 16 — passive: sale 2 active
  { kind: 'popup', textCode: null,
    gate: 'sale-end', route: 'any' },

  // 17 — Mission 3 intro → /board
  { kind: 'popup', textCode: 'stage3_mission3_intro',
    btnTextCode: 'stage3_mission3_intro_btn',
    position: 'center', gate: 'special-button', route: 'any' },

  // 18 — passive: complete 6 orders
  { kind: 'popup', textCode: null,
    gate: 'orders-threshold-s3-3', route: 'any' },

  // 19 — Mission 3 complete → /finance
  { kind: 'popup', textCode: 'stage3_mission3_complete',
    btnTextCode: 'stage3_mission3_complete_btn',
    position: 'center', gate: 'special-button', route: 'any' },

  // 20 — Lesson branch (disciplined / partial / spent)
  { kind: 'visual', textCode: null, visual: 'lesson-branch',
    gate: 'special-button', route: '/finance' },

  // 21 — Makeup mission intro (conditional; disciplined jumps over)
  { kind: 'popup', textCode: 'stage3_makeup_mission',
    btnTextCode: 'stage3_mission3_intro_btn', // "חזור לעבוד"
    position: 'center', gate: 'special-button', route: 'any' },

  // 22 — passive: makeup orders threshold
  { kind: 'popup', textCode: null,
    gate: 'orders-threshold-s3-makeup', route: 'any' },

  // 23 — Makeup complete
  { kind: 'popup', textCode: 'stage3_makeup_complete',
    btnTextCode: 'stage3_makeup_complete_btn',
    position: 'center', gate: 'special-button', route: 'any' },

  // 24 — Stage 3 complete
  { kind: 'popup', textCode: 'stage3_complete',
    btnTextCode: 'btn_next_stage',
    position: 'center', gate: 'continue', route: 'any' },
];

export function getCurrentStage3Step(idx: number): Stage3Step | null {
  if (idx < 0 || idx >= STAGE3_STEPS.length) return null;
  return STAGE3_STEPS[idx];
}
