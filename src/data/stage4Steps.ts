/**
 * Stage 4 step configuration (PRD "User flow part 4" — risks &
 * opportunities in the stock market). Builds on Stages 1-3.
 *
 * `stage4Step` in the store is the index into STAGE4_STEPS.
 */

export type Stage4Gate =
  | 'continue'
  | 'special-button'
  | 'coins-threshold-s4-1'
  | 'sp500-invest-s4-2'
  | 'time-speeder'
  | 'time-speeder-done'
  | 'meta-progress-s4';

export type Route = '/board' | '/finance' | '/goals';
export type Position = 'center' | 'top-safe' | 'bottom-safe';
export type Kind = 'popup' | 'visual';

export interface Stage4Step {
  kind: Kind;
  textCode: string | null;
  btnTextCode?: string;
  target?: string | null;
  position?: Position;
  gate: Stage4Gate;
  route?: Route | 'any';
  visual?:
    | 'stock-pieces'
    | 'index-basket'
    | 'sp500-logos'
    | 'speeder-anim'
    | 'sp500-growth'
    | 'sp500-volatility'
    | 'risk-spectrum'
    | 'stage-opener';
}

// Official Excel mission targets (sheet "תמחור משימות").
export const STAGE4_MISSION1_TARGET   = 350;        // coin delta — eased from 500
export const STAGE4_MISSION1_REWARD   = 2;          // boosters
export const STAGE4_MISSION2_TARGET   = 350;        // coins invested in S&P 500 (lesson number — kept)

export const STAGE4_COMPLETE_ENERGY_REWARD  = 100;
export const STAGE4_COMPLETE_BOOSTER_REWARD = 5;

/** Player must buy at least this many Meta Goal items during the freedom
 *  phase before Stage 4 wraps up. */
export const STAGE4_META_PURCHASES_TO_COMPLETE = 1;

export const STAGE4_STEPS: Stage4Step[] = [
  // 0 — Stage 4 OPENER (new: same template as Stages 1/2/3/5)
  {
    kind: 'visual',
    textCode: null,
    visual: 'stage-opener',
    gate: 'continue',
    route: '/finance',
  },
  // 1 — intro stock visual (Screen A)
  {
    kind: 'visual',
    textCode: 'intro_stock',
    visual: 'stock-pieces',
    gate: 'continue',
    route: '/finance',
  },
  // 1 — intro index visual (Screen B)
  {
    kind: 'visual',
    textCode: 'intro_index',
    visual: 'index-basket',
    gate: 'continue',
    route: '/finance',
  },
  // 2 — intro S&P 500 visual (Screen C) → button "בוא נשקיע"
  {
    kind: 'visual',
    textCode: 'intro_sp500',
    visual: 'sp500-logos',
    gate: 'continue',
    route: '/finance',
  },
  // 3 — Mission 1 intro
  {
    kind: 'popup',
    textCode: 'stage4_mission1_intro',
    btnTextCode: 'stage4_mission1_intro_btn',
    target: null,
    position: 'center',
    gate: 'special-button',
    route: 'any',
  },
  // 4 — passive: earn 100 coins delta
  {
    kind: 'popup',
    textCode: null,
    gate: 'coins-threshold-s4-1',
    route: 'any',
  },
  // 5 — Mission 1 complete → /finance
  {
    kind: 'popup',
    textCode: 'stage4_mission1_complete',
    btnTextCode: 'stage4_mission1_complete_btn',
    target: null,
    position: 'center',
    gate: 'special-button',
    route: 'any',
  },
  // 6 — Mission 2 intro (spotlight S&P 500)
  {
    kind: 'popup',
    textCode: 'stage4_mission2_intro',
    btnTextCode: 'onboarding_btn_continue',
    target: '[data-tut="sp500-account"]',
    position: 'top-safe',
    gate: 'continue',
    route: '/finance',
  },
  // 7 — passive: invest 50 in S&P 500
  {
    kind: 'popup',
    textCode: null,
    gate: 'sp500-invest-s4-2',
    route: '/finance',
  },
  // 8 — 4.2 first booster prompt
  {
    kind: 'popup',
    textCode: 'intro_growth_sp500',
    target: null,
    position: 'top-safe',
    gate: 'time-speeder',
    route: '/finance',
  },
  // 9 — speeder anim
  {
    kind: 'visual',
    textCode: null,
    visual: 'speeder-anim',
    gate: 'time-speeder-done',
    route: '/finance',
  },
  // 10 — 4.2 result: growth graph
  {
    kind: 'visual',
    textCode: 'result_growth_sp500',
    visual: 'sp500-growth',
    gate: 'continue',
    route: '/finance',
  },
  // 11 — 4.3 second booster prompt (overlay arms scripted-drop one-shot)
  {
    kind: 'popup',
    textCode: 'intro_volatility',
    target: null,
    position: 'top-safe',
    gate: 'time-speeder',
    route: '/finance',
  },
  // 12 — speeder anim
  {
    kind: 'visual',
    textCode: null,
    visual: 'speeder-anim',
    gate: 'time-speeder-done',
    route: '/finance',
  },
  // 13 — 4.3 lesson: volatility graph
  {
    kind: 'visual',
    textCode: 'lesson_volatility',
    visual: 'sp500-volatility',
    gate: 'continue',
    route: '/finance',
  },
  // 14 — 4.4 risk spectrum
  {
    kind: 'visual',
    textCode: 'spectrum_risk',
    visual: 'risk-spectrum',
    gate: 'continue',
    route: '/finance',
  },
  // 15 — bridge → /goals
  {
    kind: 'popup',
    textCode: null,
    btnTextCode: 'stage4_to_goals_btn',
    target: null,
    position: 'bottom-safe',
    gate: 'special-button',
    route: '/finance',
  },
  // 16 — passive: wait for at least 1 Meta Goal purchase
  {
    kind: 'popup',
    textCode: null,
    gate: 'meta-progress-s4',
    route: '/goals',
  },
  // 17 — stage complete
  {
    kind: 'popup',
    textCode: 'stage4_complete',
    btnTextCode: 'btn_next_stage',
    target: null,
    position: 'center',
    gate: 'continue',
    route: 'any',
  },
];

export function getCurrentStage4Step(idx: number): Stage4Step | null {
  if (idx < 0 || idx >= STAGE4_STEPS.length) return null;
  return STAGE4_STEPS[idx];
}
