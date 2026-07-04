/**
 * Tutorial step configuration — PRD "שלב 1 — הדרכה" v2.
 *
 * Flow pattern (PRD-strict): EVERY step shows a popup with a Continue button.
 * Tapping the button "arms" the step — the popup hides, the spotlight stays,
 * and the required action (tap producer, merge, sell, etc.) becomes possible.
 * The action handler then auto-advances to the next step. Steps that have
 * no follow-up action (welcome, coins, progress) advance immediately on
 * button tap.
 *
 * Button labels vary per PRD:
 *   - default → "המשך"  (onboarding_btn_continue)
 *   - 1.7     → "עבור"   (onboarding_btn_go)
 *   - 1.9     → "הבנתי"  (onboarding_btn_got_it)
 */

export type GateKind =
  | 'continue'           // Continue button → advance immediately (no action)
  | 'producer-tap-4'     // arm → tap oven 4 times → advance
  | 'merge-any'          // arm → perform any merge → advance
  | 'has-ready-sell'     // arm → auto-advance when a sell ticket becomes ready
  | 'sell-first-ready'   // arm → tap SELL on the first ready ticket → advance
  | 'nav-meta'           // tap button → route to /goals → advance
  | 'meta-upgrade-any';  // arm → upgrade watch → advance

export type Route = '/board' | '/goals';

export interface TutorialStep {
  /** PRD-canonical text code, e.g. `onboarding_welcome`. */
  textCode: string;
  /** CSS selector for spotlight target. null = full-screen dim. */
  target: string | null;
  /** Popup position relative to the target / screen. */
  position:
    | 'center'
    | 'top-safe' | 'bottom-safe'
    | 'above-target' | 'below-target';
  /** Optional bouncing arrow at the target. */
  arrow?: 'down' | 'up' | 'left' | 'right';
  /** Optional inline drag-gesture demo (used for step 1.3 merge intro). */
  dragDemo?: boolean;
  /** What advances. */
  gate: GateKind;
  /** Custom button text code; defaults to `onboarding_btn_continue` ("המשך"). */
  btnTextCode?: string;
  /** Route this step takes place on. */
  route: Route;
}

export const TUTORIAL_STEPS: TutorialStep[] = [
  // 1.1 — Welcome popup
  {
    textCode: 'onboarding_welcome',
    target: null,
    position: 'center',
    gate: 'continue',
    route: '/board',
  },
  // 1.2 — Producer introduction
  {
    textCode: 'onboarding_producer',
    target: '.mk-spawner-card--burger',
    position: 'top-safe',
    arrow: 'down',
    gate: 'producer-tap-4',
    route: '/board',
  },
  // 1.3 — Merge introduction (with drag-gesture demo)
  {
    textCode: 'onboarding_merge',
    target: '.mk-grid',
    position: 'bottom-safe',
    dragDemo: true,
    gate: 'merge-any',
    route: '/board',
  },
  // 1.4 — Order introduction
  {
    textCode: 'onboarding_order',
    target: '.mk-stall',
    position: 'bottom-safe',
    gate: 'has-ready-sell',
    route: '/board',
  },
  // 1.5 — Perform sale
  {
    textCode: 'onboarding_sell',
    target: '.mk-sellcard-sell:not(:disabled)',
    position: 'bottom-safe',
    arrow: 'down',
    gate: 'sell-first-ready',
    route: '/board',
  },
  // 1.6 — Coins introduction
  {
    textCode: 'onboarding_coins',
    target: '.mk-pill[aria-label="מטבעות"]',
    position: 'bottom-safe',
    gate: 'continue',
    route: '/board',
  },
  // 1.7 — Transition to Meta Goal — button text "עבור"
  {
    textCode: 'onboarding_meta_nav',
    target: '[data-tut="nav-goals"]',
    position: 'top-safe',
    arrow: 'down',
    gate: 'nav-meta',
    btnTextCode: 'onboarding_btn_go',
    route: '/board',
  },
  // 1.8 — Meta items introduction. Targets the whole Stage-1 meta block
  // (data-tut="meta-items") so ALL three items sit inside the spotlight
  // cutout and any of them can be purchased to satisfy `meta-upgrade-any`.
  {
    textCode: 'onboarding_meta_item',
    target: '[data-tut="meta-items"]',
    position: 'bottom-safe',
    arrow: 'down',
    gate: 'meta-upgrade-any',
    route: '/goals',
  },
  // 1.9 — Progress bar — button text "הבנתי"
  {
    textCode: 'onboarding_progress_bar',
    target: '.mk-meta-progress',
    position: 'bottom-safe',
    gate: 'continue',
    btnTextCode: 'onboarding_btn_got_it',
    route: '/goals',
  },
];

export function getCurrentTutorialStep(stepIdx: number): TutorialStep | null {
  if (stepIdx < 0 || stepIdx >= TUTORIAL_STEPS.length) return null;
  return TUTORIAL_STEPS[stepIdx];
}

/**
 * Gates whose action handlers fire BEFORE armed is set need to do nothing
 * unless armed. Helper so consumer components can ask "should the user be
 * able to perform this action right now?"
 */
export function gateNeedsArm(gate: GateKind): boolean {
  return gate !== 'continue' && gate !== 'nav-meta';
}
