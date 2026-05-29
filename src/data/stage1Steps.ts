/**
 * Stage 2 step configuration (PRD "User flow part 2").
 *
 * NOTE: file name is `stage1Steps.ts` for backward-compat with existing
 * imports. The CONTENT corresponds to PRD Stage 2 (inflation / interest /
 * compound). Stage 1 = the onboarding tutorial lives in `tutorialSteps.ts`.
 *
 * Each step is either a popup, a visual screen, or a passive auto-advance.
 * Steps are ordered; `stage1Step` in the store is the index into this array.
 *
 * Routes are 'any' wherever the popup should follow the player; otherwise
 * pinned to the specific screen.
 */

export type Stage1Gate =
  | 'continue'              // generic button advances
  | 'nav-finance'           // tap → route /finance + advance
  | 'nav-board'             // tap → route /board + advance
  | 'nav-goals'             // tap → route /goals + advance
  | 'coins-threshold'       // auto: coins >= STAGE2_MISSION1_TARGET
  | 'coins-threshold-3'     // auto: coins gained >= STAGE2_MISSION3_TARGET (from baseline)
  | 'deposit-threshold'     // auto: deposit balance >= STAGE2_MISSION2_TARGET
  | 'deposit-extra'         // auto: another deposit happened (Mission 3 follow-up)
  | 'time-speeder'          // popup has embedded booster button
  | 'time-speeder-done'     // auto: animation finished
  | 'special-button';       // popup-specific button → route + advance

export type Route = '/board' | '/finance' | '/goals';

export type Position =
  | 'center'
  | 'top-safe' | 'bottom-safe';

export type Kind = 'popup' | 'visual';

export interface Stage1Step {
  /** popup or visual screen */
  kind: Kind;
  /** code from data/strings.ts */
  textCode: string | null;
  /** optional separate button label code */
  btnTextCode?: string;
  /** CSS selector for spotlight target (popup only) */
  target?: string | null;
  /** popup position */
  position?: Position;
  /** advance trigger */
  gate: Stage1Gate;
  /** route this step lives on; 'any' if popup should follow the player */
  route?: Route | 'any';
  /** for kind=visual: which component */
  visual?:
    | 'stage-opener'
    | 'milk-carton'
    | 'basket'
    | 'time-speeder-anim'
    | 'compound-graph'
    | 'interest-hedge-compare';
}

// --- Numeric placeholders (PRD's [X] values, approved by user) ---
// Official Excel mission targets (sheet "תמחור משימות").
export const STAGE2_MISSION1_TARGET = 300;  // coins to earn (mission 1)
export const STAGE2_MISSION1_REWARD = 2;    // +2 time boosters
export const STAGE2_MISSION2_TARGET = 200;  // coins to deposit
export const STAGE2_MISSION2_REWARD = 1;    // +1 time booster
export const STAGE2_MISSION3_TARGET = 250;  // additional coins to earn
export const STAGE2_COMPLETE_ENERGY_REWARD = 50; // energy boost on stage complete
export const STAGE2_INFLATION_RATE_PER_YEAR = 0.01; // 1%/yr meta inflation

// Legacy export kept so old code paths don't crash.
export const STAGE1_THRESHOLD = STAGE2_MISSION1_TARGET;

export const STAGE1_STEPS: Stage1Step[] = [
  // ============================================================
  // 0 — Stage 2 OPENER (new: same template as Stages 3/4/5)
  // ============================================================
  {
    kind: 'visual',
    textCode: null,
    visual: 'stage-opener',
    gate: 'continue',
    route: 'any',
  },
  // ============================================================
  // FINANCE CENTER — Mission 1: earn coins
  // ============================================================
  // 1 — Mission 1 intro popup (on /finance)
  {
    kind: 'popup',
    textCode: 'stage2_mission1_intro',
    btnTextCode: 'stage2_mission1_intro_btn', // "עבור לעבודה"
    target: null,
    position: 'center',
    gate: 'special-button', // single button → route /board + advance
    route: 'any',           // popup follows the player to /finance from anywhere
  },
  // ============================================================
  // WORKING BOARD — passive: wait for 100 coins
  // ============================================================
  // 1 — passive wait
  {
    kind: 'popup',
    textCode: null,
    gate: 'coins-threshold',
    route: 'any',
  },
  // 2 — Mission 1 complete popup, single button → /goals
  {
    kind: 'popup',
    textCode: 'stage2_mission1_complete',
    btnTextCode: 'stage2_mission1_complete_btn', // "עבור למטרות"
    target: null,
    position: 'center',
    gate: 'special-button',
    route: 'any',
  },
  // ============================================================
  // META GOAL — 2.1: first time booster use
  // ============================================================
  // 3 — booster tooltip
  {
    kind: 'popup',
    textCode: 'timespeeder_intro',
    target: null,
    position: 'top-safe',
    gate: 'time-speeder',
    route: '/goals',
  },
  // 4 — speeder animation visual
  {
    kind: 'visual',
    textCode: null,
    visual: 'time-speeder-anim',
    gate: 'time-speeder-done',
    route: '/goals',
  },
  // ============================================================
  // 2.2 — inflation explanation 4-screen popup
  // ============================================================
  // 5 — inflection_1 text
  {
    kind: 'popup',
    textCode: 'inflection_1',
    btnTextCode: 'btn_next', // "הבא"
    target: null,
    position: 'center',
    gate: 'continue',
    route: '/goals',
  },
  // 6 — milk carton visual
  {
    kind: 'visual',
    textCode: 'inflection_milk',
    visual: 'milk-carton',
    gate: 'continue',
    route: '/goals',
  },
  // 7 — basket visual
  {
    kind: 'visual',
    textCode: 'inflection_basket',
    visual: 'basket',
    gate: 'continue',
    route: '/goals',
  },
  // 8 — inflection_2 with embedded booster
  {
    kind: 'popup',
    textCode: 'inflection_2',
    target: null,
    position: 'top-safe',
    gate: 'time-speeder',
    route: '/goals',
  },
  // 9 — second speeder animation
  {
    kind: 'visual',
    textCode: null,
    visual: 'time-speeder-anim',
    gate: 'time-speeder-done',
    route: '/goals',
  },
  // 10 — bridge popup to Finance Center with the "עבור לניהול כספים" button
  {
    kind: 'popup',
    textCode: 'inflection_2',
    btnTextCode: 'inflection_2_finance_btn', // "עבור לניהול כספים"
    target: null,
    position: 'center',
    gate: 'special-button',
    route: '/goals',
  },
  // ============================================================
  // FINANCE CENTER — 2.3: deposit unlock
  // ============================================================
  // 11a — Inflation → deposit linker (new): bridges the inflation
  //       lesson and the deposit explanation so the player understands
  //       WHY they're about to learn about the deposit.
  {
    kind: 'popup',
    textCode: 'deposit_inflation_link',
    btnTextCode: 'btn_next',
    target: null,
    position: 'center',
    gate: 'continue',
    route: '/finance',
  },
  // 11b — deposit intro
  {
    kind: 'popup',
    textCode: 'deposit_intro',
    target: null,
    position: 'center',
    gate: 'continue',
    route: '/finance',
  },
  // ============================================================
  // Mission 2 — deposit 50 coins
  // ============================================================
  // 12 — mission 2 intro popup
  {
    kind: 'popup',
    textCode: 'stage2_mission2_intro',
    target: '[data-tut="deposit-account"]',
    position: 'top-safe',
    gate: 'continue',
    route: '/finance',
  },
  // 13 — wait for deposit threshold
  {
    kind: 'popup',
    textCode: null,
    gate: 'deposit-threshold',
    route: 'any',
  },
  // 14 — mission 2 complete
  {
    kind: 'popup',
    textCode: 'stage2_mission2_complete',
    target: null,
    position: 'center',
    gate: 'continue',
    route: '/finance',
  },
  // ============================================================
  // 2.4 — interest + inflation hedge (3 screens)
  // ============================================================
  // 15 — interest tooltip near booster, embedded booster button
  {
    kind: 'popup',
    textCode: 'interest_intro',
    target: null,
    position: 'top-safe',
    gate: 'time-speeder',
    route: '/finance',
  },
  // 16 — speeder animation
  {
    kind: 'visual',
    textCode: null,
    visual: 'time-speeder-anim',
    gate: 'time-speeder-done',
    route: '/finance',
  },
  // 17 — interest_1
  {
    kind: 'popup',
    textCode: 'interest_1',
    btnTextCode: 'btn_next',
    target: null,
    position: 'center',
    gate: 'continue',
    route: '/finance',
  },
  // 18 — interest_inflation_hedge (visual comparison)
  {
    kind: 'visual',
    textCode: 'interest_inflation_hedge',
    visual: 'interest-hedge-compare',
    gate: 'continue',
    route: '/finance',
  },
  // 19 — interest_hedge_conclusion + "תראה את זה בעצמך" button → /goals
  {
    kind: 'popup',
    textCode: 'interest_hedge_conclusion',
    btnTextCode: 'btn_show_me', // "תראה את זה בעצמך"
    target: null,
    position: 'center',
    gate: 'special-button',
    route: '/finance',
  },
  // ============================================================
  // 2.5 — Meta Goal live demo
  // ============================================================
  // 20 — demo tooltip (purchase buttons released; player can spend freely)
  {
    kind: 'popup',
    textCode: 'meta_hedge_demo',
    target: null,
    position: 'bottom-safe',
    gate: 'continue', // "הבנתי" button → closes popup; freedom phase
    route: '/goals',
  },
  // 21 — passive "freedom" step — auto-advances when the player taps
  //      the meta-back-to-board button (handled inline in the overlay)
  {
    kind: 'popup',
    textCode: null,
    btnTextCode: 'btn_back_to_work',
    target: null,
    position: 'bottom-safe',
    gate: 'special-button', // "חזור לעבודה" → /board + advance
    route: '/goals',
  },
  // ============================================================
  // Working Board — Mission 3: earn 150 more coins
  // ============================================================
  // 22 — Mission 3 intro
  {
    kind: 'popup',
    textCode: 'stage2_mission3_intro',
    btnTextCode: 'stage2_mission3_intro_btn', // "חזור לעבוד"
    target: null,
    position: 'center',
    gate: 'continue',
    route: '/board',
  },
  // 23 — passive wait for additional coin earnings
  {
    kind: 'popup',
    textCode: null,
    gate: 'coins-threshold-3',
    route: 'any',
  },
  // 24 — Mission 3 complete → /finance
  {
    kind: 'popup',
    textCode: 'stage2_mission3_complete',
    btnTextCode: 'stage2_mission3_complete_btn', // "חזור לניהול כספים"
    target: null,
    position: 'center',
    gate: 'special-button',
    route: 'any',
  },
  // ============================================================
  // 2.6 — additional deposit + compound interest
  // ============================================================
  // 25 — tooltip near deposit
  {
    kind: 'popup',
    textCode: 'deposit_more_intro',
    target: '[data-tut="deposit-account"]',
    position: 'top-safe',
    gate: 'continue',
    route: '/finance',
  },
  // 26 — wait for the extra deposit
  {
    kind: 'popup',
    textCode: null,
    gate: 'deposit-extra',
    route: '/finance',
  },
  // 27 — compound_intro near booster
  {
    kind: 'popup',
    textCode: 'compound_intro',
    target: null,
    position: 'top-safe',
    gate: 'time-speeder',
    route: '/finance',
  },
  // 28 — third speeder animation
  {
    kind: 'visual',
    textCode: null,
    visual: 'time-speeder-anim',
    gate: 'time-speeder-done',
    route: '/finance',
  },
  // 29 — compound_1
  {
    kind: 'popup',
    textCode: 'compound_1',
    btnTextCode: 'btn_next',
    target: null,
    position: 'center',
    gate: 'continue',
    route: '/finance',
  },
  // 30 — compound_visual (animated graph)
  {
    kind: 'visual',
    textCode: 'compound_visual',
    visual: 'compound-graph',
    gate: 'continue',
    route: '/finance',
  },
  // 31 — compound_2 closing
  {
    kind: 'popup',
    textCode: 'compound_2',
    target: null,
    position: 'center',
    gate: 'continue',
    route: '/finance',
  },
  // ============================================================
  // 2.7 — Meta Goal stage complete
  // ============================================================
  // 32 — stage complete popup (confetti + energy reward)
  {
    kind: 'popup',
    textCode: 'stage2_complete',
    btnTextCode: 'btn_next_stage',
    target: null,
    position: 'center',
    gate: 'continue', // last step → completeStage1()
    route: 'any',
  },
];

export function getCurrentStage1Step(idx: number): Stage1Step | null {
  if (idx < 0 || idx >= STAGE1_STEPS.length) return null;
  return STAGE1_STEPS[idx];
}
