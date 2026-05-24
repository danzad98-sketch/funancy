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

import { createDemoGrid } from '@/stores/useGameStore';
import { STARTING_COINS, STARTING_ENERGY, STARTING_TIME_SPEEDERS, GRID_SIZE } from '@/lib/constants';
import type { GridCell } from '@/types/game';
import { createInitialAccounts } from '@/data/accounts';
import { createInitialMetaStages } from '@/data/metaGoals';
import { LIFE_GOALS } from '@/data/goals';
import { getMissionForStage } from '@/data/missions';
import { generateDemoSellRequests } from '@/data/orders';

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
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify({ state: snapshot, version: 1 })); } catch {}

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
  const accounts = createInitialAccounts();
  if (stage >= 2) {
    accounts.deposit.isUnlocked = true;
  }
  if (stage >= 3) {
    accounts.deposit.balance        = 100;  // M2 deposit + Sale leftover
    accounts.deposit.totalDeposited = 100;
  }
  if (stage >= 4) {
    // Standing order through Stage 3 grew the deposit.
    accounts.deposit.balance        = 250;
    accounts.deposit.totalDeposited = 250;
    accounts.single_stock.isUnlocked = true; // unlocked at start of Stage 4
  }
  if (stage >= 5) {
    accounts.deposit.balance        = 300;  // Slight more growth + small allocation prep
    accounts.deposit.totalDeposited = 300;
    accounts.single_stock.balance        = 100; // Stage 4 player invested ~₪100 in S&P
    accounts.single_stock.totalDeposited = 100;
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
    // Stage 1 is the onboarding — the demo presenter experiences the
    // real fresh-player path: empty board, fresh-start wallet (per
    // STARTING_COINS, currently 500 — enough to clear the tutorial's
    // meta-upgrade gate without grinding), no boosters, 100 energy.
    // The Stage 1 tutorial teaches spawn → merge → sell from scratch.
    1: { coins: STARTING_COINS, timeSpeeders: STARTING_TIME_SPEEDERS,
         tutorialCompleted: false, tutorialStep: 0,
         stage1Completed: false, stage1Step: 0,
         stage3Completed: false, stage3Step: 0,
         stage4Completed: false, stage4Step: 0,
         stage5Completed: false, stage5Step: 0 },
    // Stage 2: matches Stage 1 ending wallet (player buys watch -200 +
    // earns ~200 in sells during onboarding). Smooth M1/M2/M3 progression.
    2: { coins: 500,  timeSpeeders: 3,
         tutorialCompleted: true,  tutorialStep: 99,
         stage1Completed: false, stage1Step: 0,
         stage3Completed: false, stage3Step: 0,
         stage4Completed: false, stage4Step: 0,
         stage5Completed: false, stage5Step: 0 },
    // Stage 3: reflects S2 ending — M3 +150 gain offset partly by Meta
    // browsing, deposit holds M2's 50 + earnings.
    3: { coins: 600,  timeSpeeders: 5,
         tutorialCompleted: true,  tutorialStep: 99,
         stage1Completed: true,  stage1Step: 99,
         stage3Completed: false, stage3Step: 0,
         stage4Completed: false, stage4Step: 0,
         stage5Completed: false, stage5Step: 0 },
    // Stage 4: reflects S3 ending — standing-order grew deposit, wallet
    // earned half of every sale. Ready for S&P invest.
    4: { coins: 800,  timeSpeeders: 7,
         tutorialCompleted: true,  tutorialStep: 99,
         stage1Completed: true,  stage1Step: 99,
         stage3Completed: true,  stage3Step: 99,
         stage4Completed: false, stage4Step: 0,
         stage5Completed: false, stage5Step: 0 },
    // Stage 5: reflects S4 ending — comfortable for allocation phase
    // (≥₪10 × 3 instruments) + camera repair (60) + headroom.
    5: { coins: 1000, timeSpeeders: 12,
         tutorialCompleted: true,  tutorialStep: 99,
         stage1Completed: true,  stage1Step: 99,
         stage3Completed: true,  stage3Step: 99,
         stage4Completed: true,  stage4Step: 99,
         stage5Completed: false, stage5Step: 0 },
  };
  const s = perStage[stage];

  // Stage 1: empty board so the onboarding tutorial can teach spawning
  //   from scratch. Stages 2-5: pre-seeded demo grid so the presenter has
  //   something to interact with immediately.
  const emptyGrid: GridCell[] = Array.from(
    { length: GRID_SIZE },
    (_, i) => ({ index: i, item: null }),
  );

  return {
    coins: s.coins,
    energy: STARTING_ENERGY,
    timeSpeeders: s.timeSpeeders,
    level: 1,
    lastEnergyRegenTimestamp: now,
    lastInflationTimestamp:   now,
    lastOnlineTimestamp:      now,
    grid: stage === 1 ? emptyGrid : createDemoGrid(),
    orders: [],
    sellRequests: stage === 1 ? [] : generateDemoSellRequests(),
    mergeBoosterActive: false,
    totalMerges: 0,
    totalSellsTier3Plus: 0,
    totalSpeedersUsed: 0,
    gameYear: 1,
    accounts,
    currentStage: 1,
    currentMission: getMissionForStage(1),
    marketCrashTriggered: false,
    lastChanges: {},
    goals: LIFE_GOALS.map((g) => ({ ...g })),
    metaStages: createInitialMetaStages(),
    gameCompleted: false,

    // Tutorial / Stage 2
    tutorialStep: s.tutorialStep,
    tutorialCompleted: s.tutorialCompleted,
    tutorialArmed: false,
    producerTapCount: 0,
    stage1Step: s.stage1Step,
    stage1Completed: s.stage1Completed,
    s2M1CoinBaseline: 0,
    s2M2DepositBaseline: 0,
    mission3CoinBaseline: 0,
    mission6DepositBaseline: 0,

    // Stage 3
    stage3Step: s.stage3Step,
    stage3Completed: s.stage3Completed,
    s3StandingOrderActive: false,
    s3StandingOrderTotal: 0,
    s3m1OrdersBaseline: 0, s3m2OrdersBaseline: 0, s3m3OrdersBaseline: 0,
    s3MakeupOrdersBaseline: 0, s3MakeupTarget: 0,
    s3OrdersDuringSales: 0,
    totalOrdersCompleted: 0,
    activeSale: null,
    s3SaleSpent1: 0, s3SaleSpent2: 0,

    // Stage 4
    stage4Step: s.stage4Step,
    stage4Completed: s.stage4Completed,
    s4M1CoinBaseline: 0, s4M2SP500Baseline: 0,
    s4SP500StartBalance: 0,
    s4LastSP500Path: [],
    s4ScriptedDropPending: false, s4PositiveSeriesPending: false,
    s4MetaPurchaseCount: 0,

    // Stage 5
    stage5Step: s.stage5Step,
    stage5Completed: s.stage5Completed,
    intro_journey_completed: false,
    s5M1CoinBaseline: 0,
    s5CameraOutcome: 'pending',
    s5CameraStartedAt: null,
    s5MetaPurchaseCount: 0,

    // Meta inflation
    metaInflationFactor: 1.0,
    metaInflationStarted: false,
  };
}
