/**
 * Demo Mode — five `?demo=stageN` entry presets.
 *
 * Each preset wipes the persisted game state, writes a fresh per-stage
 * snapshot to localStorage, sets a session marker for the Demo chip, and
 * does a hard navigation to the stage's home route. On the next page
 * load Zustand persist rehydrates from the snapshot and the player lands
 * at the start of the chosen stage.
 *
 * URLs:
 *   http://localhost:PORT/?demo=stage1
 *   http://localhost:PORT/?demo=stage2
 *   http://localhost:PORT/?demo=stage3
 *   http://localhost:PORT/?demo=stage4
 *   http://localhost:PORT/?demo=stage5
 */

import { createDemoGrid, createInitialGameData } from '@/stores/useGameStore';
import { STARTING_COINS, STARTING_TIME_SPEEDERS } from '@/lib/constants';
import { createInitialAccounts } from '@/data/accounts';
import { generateDemoSellRequests, generateTunedSellRequests, STAGE4_TUNE, STAGE5_TUNE } from '@/data/orders';
import type { Stage } from '@/types/finance';

export type DemoStage = 1 | 2 | 3 | 4 | 5;

export const DEMO_ROUTES: Record<DemoStage, string> = {
  1: '/board',
  2: '/finance',
  3: '/finance',
  4: '/finance',
  5: '/finance',
};

const STORAGE_KEY      = 'funancy-game-state';
const DEMO_SESSION_KEY = 'funancy-demo-mode';

export function detectDemoStage(): DemoStage | null {
  if (typeof window === 'undefined') return null;
  const params = new URLSearchParams(window.location.search);
  const raw = params.get('demo');
  if (!raw) return null;
  const m = /^stage([1-5])$/.exec(raw);
  return m ? (Number(m[1]) as DemoStage) : null;
}

export function currentDemoStage(): DemoStage | null {
  if (typeof sessionStorage === 'undefined') return null;
  const v = sessionStorage.getItem(DEMO_SESSION_KEY);
  if (!v) return null;
  const n = Number(v);
  return n >= 1 && n <= 5 ? (n as DemoStage) : null;
}

export function clearDemoSession(): void {
  if (typeof sessionStorage === 'undefined') return;
  sessionStorage.removeItem(DEMO_SESSION_KEY);
}

/**
 * Write a fresh persisted-state snapshot for the chosen stage to
 * localStorage, set the session marker, and navigate to the stage's
 * home route. The next render rehydrates from the snapshot.
 */
export function applyDemoPreset(stage: DemoStage): void {
  if (typeof window === 'undefined') return;

  try { sessionStorage.setItem(DEMO_SESSION_KEY, String(stage)); } catch {}

  const snapshot = buildSnapshot(stage);
  // version MUST match the store's persist version (2). Writing an older
  // version here would run migrate() on load and wipe metaStages /
  // sellRequests / grid — destroying the tuned per-stage snapshot.
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify({ state: snapshot, version: 2 })); } catch {}

  // Strip `?demo=` and land on the stage's home route. Hard navigation
  // forces Zustand persist to rehydrate from the snapshot we just wrote.
  window.location.replace(DEMO_ROUTES[stage]);
}

/** Build the full persisted snapshot for a demo stage. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function buildSnapshot(stage: DemoStage): any {
  const now = Date.now();

  // Pre-populate prior-stage unlocks + investments on the accounts map.
  // Each platform unlocks AT THE START of its stage:
  //   Stage 2 → deposit
  //   Stage 3 → (standing-order, no new platform; deposits to existing `deposit`)
  //   Stage 4 → single_stock (S&P 500)
  //   Stage 5 → provident
  // Money Market (`index_fund`) is no longer part of the intro journey.
  // Account balances reflect what a natural player would carry into each
  // stage. Wallet + accounts both monotonically non-decreasing across the
  // 5 stage demo URLs — never take coins from the player at a transition.
  // Sized for the official Excel mission targets + Meta Goal totals.
  const accounts = createInitialAccounts();
  if (stage >= 2) {
    accounts.deposit.isUnlocked = true;
  }
  if (stage >= 3) {
    accounts.deposit.balance        = 200;  // S2 M2 deposit (200) carried in
    accounts.deposit.totalDeposited = 200;
  }
  if (stage >= 4) {
    // S3 standing-order moved ~50% of order rewards to deposit.
    accounts.deposit.balance        = 800;
    accounts.deposit.totalDeposited = 800;
    accounts.single_stock.isUnlocked = true; // unlocked at start of Stage 4
  }
  if (stage >= 5) {
    accounts.deposit.balance        = 1000; // Continued growth + interest
    accounts.deposit.totalDeposited = 1000;
    accounts.single_stock.balance        = 400; // S4 M2 S&P invest 350 + slight growth
    accounts.single_stock.totalDeposited = 350;
    accounts.provident.isUnlocked        = true; // unlocked at start of Stage 5
    accounts.provident.lockedUntilSpeeders = 2;
  }

  // Stage-specific resources + journey flags.
  const perStage: Record<DemoStage, {
    coins: number; timeSpeeders: number;
    tutorialCompleted: boolean; tutorialStep: number;
    stage1Completed: boolean; stage1Step: number;
    stage3Completed: boolean; stage3Step: number;
    stage4Completed: boolean; stage4Step: number;
    stage5Completed: boolean; stage5Step: number;
  }> = {
    // Stage 1 onboarding — fresh-player path with new low Meta prices
    // (cheapest tier-1 item = ₪12). STARTING_COINS now 100 = enough to
    // buy earbuds (12) + watch (16) for tutorial gate, leave room to grow.
    1: { coins: STARTING_COINS, timeSpeeders: STARTING_TIME_SPEEDERS,
         tutorialCompleted: false, tutorialStep: 0,
         stage1Completed: false, stage1Step: 0,
         stage3Completed: false, stage3Step: 0,
         stage4Completed: false, stage4Step: 0,
         stage5Completed: false, stage5Step: 0 },
    // Stage 2: comfortable for M2 deposit 200 + Stage 2 Meta total 730.
    // Player earns 300 (M1) + 250 (M3) = 550 throughput.
    // 400 start + 550 earn − 200 deposit = 750 wallet — covers 730 Meta.
    2: { coins: 400,  timeSpeeders: 3,
         tutorialCompleted: true,  tutorialStep: 99,
         stage1Completed: false, stage1Step: 0,
         stage3Completed: false, stage3Step: 0,
         stage4Completed: false, stage4Step: 0,
         stage5Completed: false, stage5Step: 0 },
    // Stage 3: orders-based. 60 orders × ~55 coins each = 3,300 gross.
    // Standing-order moves 50% → 1,650 to wallet + 1,650 to deposit.
    // 500 start + 1,650 earn = 2,150 wallet — well over Stage 3 Meta 1,540.
    3: { coins: 500,  timeSpeeders: 5,
         tutorialCompleted: true,  tutorialStep: 99,
         stage1Completed: true,  stage1Step: 99,
         stage3Completed: false, stage3Step: 0,
         stage4Completed: false, stage4Step: 0,
         stage5Completed: false, stage5Step: 0 },
    // Stage 4: M1 earn 500 + M2 S&P invest 350 + Stage 4 Meta 2,056.
    // 1,500 start + 500 (M1) − 350 (S&P) = 1,650; ~80% of Meta affordable
    // with the presenter doing a mix of S&P invest + Meta purchases.
    4: { coins: 1500, timeSpeeders: 7,
         tutorialCompleted: true,  tutorialStep: 99,
         stage1Completed: true,  stage1Step: 99,
         stage3Completed: true,  stage3Step: 99,
         stage4Completed: false, stage4Step: 0,
         stage5Completed: false, stage5Step: 0 },
    // Stage 5: M1 earn 700 + allocation across 3 instruments + camera 60
    // + Stage 5 Meta 2,675. 2,500 start + 700 (M1) − 60 (camera) = 3,140;
    // well over Stage 5 Meta with room for ₪300/instrument allocation.
    5: { coins: 2500, timeSpeeders: 12,
         tutorialCompleted: true,  tutorialStep: 99,
         stage1Completed: true,  stage1Step: 99,
         stage3Completed: true,  stage3Step: 99,
         stage4Completed: true,  stage4Step: 99,
         stage5Completed: false, stage5Step: 0 },
  };
  const s = perStage[stage];

  // Stage-specific sell requests:
  //   Stage 1 — empty (onboarding teaches spawning from scratch).
  //   Stages 4/5 — tuned low-tier / high-reward requests.
  //   Stages 2/3 — standard demo requests.
  const sellRequests =
    stage === 1
      ? []
      : stage === 4
        ? generateTunedSellRequests(STAGE4_TUNE)
        : stage === 5
          ? generateTunedSellRequests(STAGE5_TUNE)
          : generateDemoSellRequests();

  // SINGLE INIT PATH: start from the same builder the normal game uses,
  // then apply only the per-stage demo overrides. This guarantees demo
  // start and normal start cannot structurally diverge — every field the
  // store persists is present with a correct default, and we override just
  // the deltas below.
  return {
    ...createInitialGameData(now),

    // Resources / progression
    coins: s.coins,
    timeSpeeders: s.timeSpeeders,
    level: stage as Stage,
    currentStage: stage as Stage,

    // Board: Stage 1 stays empty (from the builder); 2-5 get the demo grid.
    grid: stage === 1 ? createInitialGameData(now).grid : createDemoGrid(),
    sellRequests,
    accounts,

    // Journey flags
    tutorialStep: s.tutorialStep,
    tutorialCompleted: s.tutorialCompleted,
    stage1Step: s.stage1Step,
    stage1Completed: s.stage1Completed,
    stage3Step: s.stage3Step,
    stage3Completed: s.stage3Completed,
    stage4Step: s.stage4Step,
    stage4Completed: s.stage4Completed,
    stage5Step: s.stage5Step,
    stage5Completed: s.stage5Completed,
  };
}
