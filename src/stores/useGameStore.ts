'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Item, GridCell, Order, ChainId, SellRequest } from '@/types/game';
import type { Account, AccountType, Mission, Stage } from '@/types/finance';
import type { LifeGoal, MetaStage } from '@/types/goals';
import {
  GRID_SIZE,
  STARTING_COINS,
  STARTING_ENERGY,
  STARTING_TIME_SPEEDERS,
  ENERGY_CAP,
  ENERGY_REGEN_MS,
  rollAnnualInflationRate,
} from '@/lib/constants';
import { createItem } from '@/data/itemChains';
import { generateSellRequest, generateInitialSellRequests, generateDemoSellRequests, generateOrder, generateInitialOrders } from '@/data/orders';
import { createInitialAccounts } from '@/data/accounts';
import { getMissionForStage } from '@/data/missions';
import { LIFE_GOALS } from '@/data/goals';
import { canMerge, doMerge } from '@/engine/mergeEngine';
import { findMatchingCellsForRequest, canFulfillRequest, findFirstMatchForOrder } from '@/engine/orderEngine';
import { calculateEnergyRegen } from '@/engine/energyEngine';
import { advanceSimWeeks } from '@/engine/economyEngine';
import { SPEEDER_WEEKS } from '@/lib/constants';
import { createInitialMetaStages, getNextPrice, advanceItemState, checkStageCompletion } from '@/data/metaGoals';

/**
 * Demo starting grid: pre-populated with low-tier items so the presenter
 * can demo a merge in the first 5 seconds without spawning anything.
 *   - 2x sushi tier 1 (🍚) at indices 0, 1   — merge to satisfy r2 chain demo
 *   - 2x burger tier 1 (🥩) at indices 6, 7  — merge to fulfil sell request 2
 *   - 2x art tier 1 (✏️)   at indices 12, 13 — merge to fulfil sell request 3
 * All other cells remain empty so the player can spawn / drag freely.
 */
export function createDemoGrid(): GridCell[] {
  const cells: GridCell[] = Array.from({ length: GRID_SIZE }, (_, i) => ({ index: i, item: null }));
  cells[0] = { index: 0, item: createItem('sushi', 1) };
  cells[1] = { index: 1, item: createItem('sushi', 1) };
  cells[6] = { index: 6, item: createItem('burger', 1) };
  cells[7] = { index: 7, item: createItem('burger', 1) };
  cells[12] = { index: 12, item: createItem('art', 1) };
  cells[13] = { index: 13, item: createItem('art', 1) };
  return cells;
}

function createEmptyGrid(): GridCell[] {
  return Array.from({ length: GRID_SIZE }, (_, i) => ({ index: i, item: null }));
}

interface GameState {
  // Resources
  coins: number;
  energy: number;
  timeSpeeders: number;
  level: number;

  // Time tracking
  lastEnergyRegenTimestamp: number;
  lastInflationTimestamp: number;
  lastOnlineTimestamp: number;

  // Board
  grid: GridCell[];
  orders: Order[]; // Legacy — kept for persist compat
  sellRequests: SellRequest[];

  // Boosters
  mergeBoosterActive: boolean; // Next merge jumps 2 tiers instead of 1

  // Stats tracking (for missions)
  totalMerges: number;
  totalSellsTier3Plus: number;
  totalSpeedersUsed: number;

  // Inflation tracking
  gameYear: number;
  lastInflationResult: {
    coinsLost: number;
    rate: number;
    wasProtected: boolean;
  } | null;

  // Finance
  accounts: Record<AccountType, Account>;
  currentStage: Stage;
  currentMission: Mission;
  marketCrashTriggered: boolean;
  lastChanges: Record<string, number>;

  // Goals (legacy)
  goals: LifeGoal[];

  // Meta Goals (new 3-stage progression)
  metaStages: MetaStage[];
  gameCompleted: boolean;

  // Onboarding (PRD "user flow part 1") --------------------------
  // Part A — first-time tutorial. tutorialStep = 0..9, advances as
  // the player completes each scripted action. tutorialCompleted
  // becomes true after step 9 confirms and never resets (except via
  // resetGame() which is the demo restart button).
  tutorialStep: number;
  tutorialCompleted: boolean;
  /** PRD v2: the popup's Continue tap "arms" the step. Action handlers
   *  (producer / merge / sell / upgrade) only fire when armed === true.
   *  Reset to false on every step transition. */
  tutorialArmed: boolean;
  // Sub-progress for step 2 ("tap producer 4 times").
  producerTapCount: number;
  // Part B — Stage 2 mission flow (field name kept for back-compat).
  stage1Step: number;
  stage1Completed: boolean;
  /** Coin baseline captured when Stage-2 Mission 1 begins (passive wait
   *  step). Mission auto-completes on coin DELTA from this baseline so a
   *  player with a large starting balance doesn't instant-complete. */
  s2M1CoinBaseline: number;
  /** Deposit balance baseline captured when Stage-2 Mission 2 begins. */
  s2M2DepositBaseline: number;
  /** Coin baseline captured when Mission 3 begins, so the "earn 150 more"
   *  target tracks deltas from that moment rather than total coins. */
  mission3CoinBaseline: number;
  /** Deposit balance baseline captured when Mission 3 follow-up begins,
   *  so "additional deposit" advance fires only on a fresh deposit. */
  mission6DepositBaseline: number;

  // ----- Stage 3 (PRD "User flow part 3" FINAL) — standing-order savings habit -----
  stage3Step: number;
  stage3Completed: boolean;
  /** True after the player taps "אשר" on the standing-order setup tooltip.
   *  Every sale on the Working Board auto-splits 50% to the deposit while
   *  this is true and the stage isn't yet complete. */
  s3StandingOrderActive: boolean;
  /** Running total of coins auto-routed to the deposit by the standing
   *  order during Stage 3. Used by the lesson popup to quote the [SAVED]
   *  amount the player accumulated without effort. */
  s3StandingOrderTotal: number;
  /** Per-mission ORDER baselines — the new gates count sell completions,
   *  not coins. Captured on entry to each passive-wait step. */
  s3m1OrdersBaseline: number;
  s3m2OrdersBaseline: number;
  s3m3OrdersBaseline: number;
  s3MakeupOrdersBaseline: number;
  /** Computed at lesson-popup time = orders × multiplier (capped). */
  s3MakeupTarget: number;
  /** Sum of orders the player completed DURING active sale windows. Drives
   *  the makeup mission target and the lesson-branch selection. */
  s3OrdersDuringSales: number;
  /** Active sale window (1 or 2). Null when no sale is on. Cleared by
   *  the next time-speeder tap (game-time duration). */
  activeSale: { id: 1 | 2 } | null;
  /** Cumulative coins spent on Meta Goal items during each sale. */
  s3SaleSpent1: number;
  s3SaleSpent2: number;
  /** Global counter of fulfilled sell requests. Bumped in fulfillSellRequest.
   *  Used by Stage 3 mission gates to track "complete X orders" deltas. */
  totalOrdersCompleted: number;

  // ----- Stage 4 (PRD "User flow part 4") — stocks, S&P 500 -----
  stage4Step: number;
  stage4Completed: boolean;
  s4M1CoinBaseline: number;
  s4M2SP500Baseline: number;
  /** S&P 500 (`single_stock`) balance the moment the player enters 4.2 —
   *  used to compute the realized growth % shown in the result popup. */
  s4SP500StartBalance: number;
  /** Most recent S&P 500 week-by-week balance trajectory from a booster
   *  tap. Drives the animated growth + volatility graphs in 4.2 / 4.3. */
  s4LastSP500Path: number[];
  /** One-shot flag: when true, the NEXT time-speeder tap uses the scripted
   *  drop-and-recovery series for S&P 500 instead of bimodal random.
   *  Stage4Overlay arms this before the 4.3 booster prompt. */
  s4ScriptedDropPending: boolean;
  /** One-shot flag: when true, the NEXT time-speeder tap forces the
   *  bimodal sampler to re-roll until the year ends positive — so the
   *  4.2 growth-lesson popup is guaranteed to show a winning year.
   *  Stage4Overlay arms this before the 4.2 booster prompt. */
  s4PositiveSeriesPending: boolean;
  /** Counts Meta Goal purchases since entering the Stage 4 freedom phase
   *  (step 16). Auto-advances to Stage Complete once threshold met. */
  s4MetaPurchaseCount: number;

  // ----- Stage 5 (PRD "User flow part 5") — provident fund & journey end -----
  stage5Step: number;
  stage5Completed: boolean;
  /** End-of-intro-journey flag — set when the player taps "סיום" on the
   *  final stage5_complete popup. The Mission Reminder Widget reads this
   *  to disappear permanently. */
  intro_journey_completed: boolean;
  s5M1CoinBaseline: number;
  /** Forced-liquidity event outcome — drives the vacation-tile overlay
   *  for the rest of Stage 5. */
  s5CameraOutcome: 'pending' | 'fixed' | 'broken';
  /** Real-time epoch (ms) the camera popup appeared; the popup auto-
   *  resolves to "broken" after STAGE5_CAMERA_TIMER_MS elapses. */
  s5CameraStartedAt: number | null;
  /** Counts Meta Goal purchases after the camera event resolves, used
   *  to gate the final stage-complete popup. */
  s5MetaPurchaseCount: number;
  // Meta Goal inflation — starts at 1.0, multiplied by 1.01 per sim
  // year once the player fires their first Stage 1 time speeder
  // (PRD: "from this moment until end of game, prices rise by 1%/yr").
  metaInflationFactor: number;
  metaInflationStarted: boolean;
  // Time speeder overlay — true while the spinning clock plays.
  // Set by `useTimeSpeeder`, cleared by the animation component
  // after ~2.5s.
  timeSpeederAnimating: boolean;
  // -------------------------------------------------------------

  // Board actions
  spawnItem: (chain: ChainId) => boolean;
  moveItem: (fromIndex: number, toIndex: number) => void;
  mergeItems: (fromIndex: number, toIndex: number) => boolean;
  /**
   * Fired when the player drops two tier-8 (max level) items of the same
   * chain on top of each other. Both are consumed and a big "empire
   * complete" prize is awarded. Returns the prize amount on success, 0 if
   * the move wasn't a valid max-tier collision.
   */
  claimMaxTierBonus: (fromIndex: number, toIndex: number) => number;
  fulfillSellRequest: (requestId: string) => boolean;
  sellOrder: (orderId: string) => boolean; // Legacy compat

  // Resource actions
  addCoins: (amount: number) => void;
  spendCoins: (amount: number) => boolean;
  regenEnergy: () => void;
  addEnergy: (amount: number) => void;

  // Finance actions
  deposit: (accountType: AccountType, amount: number) => boolean;
  withdraw: (accountType: AccountType, amount: number) => boolean;
  useTimeSpeeder: () => boolean;
  applyRealTimeInflation: () => void;

  // Progress
  checkMission: () => void;
  purchaseGoal: (goalId: string) => boolean;

  // Meta Goals
  purchaseMetaItem: (stageId: number, itemId: string) => boolean;

  // Onboarding actions
  advanceTutorial: () => void;
  completeTutorial: () => void;
  armTutorialStep: () => void;
  bumpProducerTapCount: () => void;
  advanceStage1: () => void;
  completeStage1: () => void;
  advanceStage3: () => void;
  completeStage3: () => void;
  setStage3Step: (idx: number) => void;
  startSale: (id: 1 | 2) => void;
  endSale: () => void;
  setMakeupTarget: (target: number) => void;
  activateStandingOrder: () => void;
  advanceStage4: () => void;
  completeStage4: () => void;
  armStage4ScriptedDrop: () => void;
  armStage4PositiveSeries: () => void;
  advanceStage5: () => void;
  completeStage5: () => void;
  resolveCameraEvent: (outcome: 'fixed' | 'broken') => void;
  startCameraTimer: () => void;
  /** Pull a specific amount of liquid cash, starting from the wallet and
   *  cascading through checking → deposit → money-market → S&P 500.
   *  Provident is excluded (locked). Returns true if the full amount was
   *  raised, false otherwise. */
  withdrawLiquid: (amount: number) => boolean;
  bumpMetaInflation: (years: number) => void;
  startMetaInflation: () => void;
  setTimeSpeederAnimating: (v: boolean) => void;

  // Sync
  syncOffline: () => void;
  resetGame: () => void;
}

const now = Date.now();

export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
      // Initial state
      coins: STARTING_COINS,
      energy: STARTING_ENERGY,
      timeSpeeders: STARTING_TIME_SPEEDERS,
      level: 1,
      lastEnergyRegenTimestamp: now,
      lastInflationTimestamp: now,
      lastOnlineTimestamp: now,
      // Grid starts empty on the server to avoid SSR/client hydration
      // mismatch (dnd-kit auto-IDs drift if items mount on the server).
      // GameShell.useEffect populates the demo grid right after hydration.
      grid: createEmptyGrid(),
      orders: [], // Legacy — empty, we use sellRequests now
      sellRequests: [], // Initialized empty — hydrated from localStorage or populated on first client render
      mergeBoosterActive: false,
      totalMerges: 0,
      totalSellsTier3Plus: 0,
      totalSpeedersUsed: 0,
      gameYear: 1,
      lastInflationResult: null,
      accounts: createInitialAccounts(),
      currentStage: 1 as Stage,
      currentMission: getMissionForStage(1),
      marketCrashTriggered: false,
      lastChanges: {},
      goals: LIFE_GOALS.map((g) => ({ ...g })),
      metaStages: createInitialMetaStages(),
      gameCompleted: false,

      // Onboarding initial state
      tutorialStep: 0,
      tutorialCompleted: false,
      tutorialArmed: false,
      producerTapCount: 0,
      stage1Step: 0,
      stage1Completed: false,
      s2M1CoinBaseline: 0,
      s2M2DepositBaseline: 0,
      mission3CoinBaseline: 0,
      mission6DepositBaseline: 0,
      // Stage 3 (standing-order rebuild)
      stage3Step: 0,
      stage3Completed: false,
      s3StandingOrderActive: false,
      s3StandingOrderTotal: 0,
      s3m1OrdersBaseline: 0,
      s3m2OrdersBaseline: 0,
      s3m3OrdersBaseline: 0,
      s3MakeupOrdersBaseline: 0,
      s3MakeupTarget: 0,
      s3OrdersDuringSales: 0,
      activeSale: null,
      s3SaleSpent1: 0,
      s3SaleSpent2: 0,
      totalOrdersCompleted: 0,
      // Stage 4
      stage4Step: 0,
      stage4Completed: false,
      s4M1CoinBaseline: 0,
      s4M2SP500Baseline: 0,
      s4SP500StartBalance: 0,
      s4LastSP500Path: [],
      s4ScriptedDropPending: false,
      s4PositiveSeriesPending: false,
      s4MetaPurchaseCount: 0,
      // Stage 5
      stage5Step: 0,
      stage5Completed: false,
      intro_journey_completed: false,
      s5M1CoinBaseline: 0,
      s5CameraOutcome: 'pending',
      s5CameraStartedAt: null,
      s5MetaPurchaseCount: 0,
      metaInflationFactor: 1.0,
      metaInflationStarted: false,
      timeSpeederAnimating: false,

      // Onboarding actions
      advanceTutorial: () =>
        // Every transition resets the armed flag and the producer-tap
        // sub-counter (the latter is only used in step 1.2).
        set((s) => ({
          tutorialStep: s.tutorialStep + 1,
          tutorialArmed: false,
          producerTapCount: 0,
        })),
      completeTutorial: () =>
        // Stage 1 done unlocks Stage 2: the Bank Deposit (`deposit`)
        // becomes available. The `deposit_intro` popup later in Stage 2
        // (step 11) explains the new platform.
        set((s) => {
          const accounts = { ...s.accounts };
          accounts.deposit = { ...accounts.deposit, isUnlocked: true };
          return {
            tutorialCompleted: true,
            tutorialStep: 99,
            tutorialArmed: false,
            accounts,
          };
        }),
      armTutorialStep: () => set({ tutorialArmed: true }),
      bumpProducerTapCount: () =>
        set((s) => ({ producerTapCount: s.producerTapCount + 1 })),
      advanceStage1: () =>
        set((s) => ({ stage1Step: s.stage1Step + 1 })),
      completeStage1: () =>
        // Marking Stage 2 done also opens Stage 3: the Money Market Fund
        // (`index_fund`) is unlocked + a starting-balance baseline is captured
        // so the lesson popup can later quote the realized growth %.
        set((s) => {
          // New Stage 3 (standing order) targets the existing Bank Deposit
          // (`deposit` AccountType, already unlocked at Stage 2 start).
          // Money Market (`index_fund`) is no longer part of the intro
          // journey — it stays in code for post-journey content only.
          void s;
          return {
            stage1Completed: true,
            stage1Step: 99,
          };
        }),
      advanceStage3: () =>
        set((s) => ({ stage3Step: s.stage3Step + 1 })),
      completeStage3: () =>
        // Stage 3 done also opens Stage 4: unlock the S&P 500 (single_stock)
        // and snapshot its starting balance so the 4.2 result popup can
        // quote the realized growth %.
        set((s) => {
          const accounts = { ...s.accounts };
          accounts.single_stock = { ...accounts.single_stock, isUnlocked: true };
          return {
            stage3Completed: true,
            stage3Step: 99,
            accounts,
            s4SP500StartBalance: accounts.single_stock.balance,
          };
        }),
      setStage3Step: (idx: number) => set({ stage3Step: idx }),
      startSale: (id: 1 | 2) => set({ activeSale: { id } }),
      endSale: () => set({ activeSale: null }),
      setMakeupTarget: (target: number) => set({ s3MakeupTarget: target }),
      activateStandingOrder: () => set({ s3StandingOrderActive: true }),
      advanceStage4: () =>
        set((s) => ({ stage4Step: s.stage4Step + 1 })),
      completeStage4: () =>
        // Stage 4 done unlocks Stage 5: the Provident Fund (`provident`)
        // becomes available + the booster-lock counter is set to 2 so the
        // money is genuinely locked until the second Stage-5 booster.
        set((s) => {
          const accounts = { ...s.accounts };
          accounts.provident = {
            ...accounts.provident,
            isUnlocked: true,
            lockedUntilSpeeders: 2,
          };
          return {
            stage4Completed: true,
            stage4Step: 99,
            accounts,
          };
        }),
      armStage4ScriptedDrop: () => set({ s4ScriptedDropPending: true }),
      armStage4PositiveSeries: () => set({ s4PositiveSeriesPending: true }),
      advanceStage5: () =>
        set((s) => ({ stage5Step: s.stage5Step + 1 })),
      completeStage5: () =>
        // Final stage — mark BOTH stage5Completed AND the journey flag.
        set({
          stage5Completed: true,
          stage5Step: 99,
          intro_journey_completed: true,
        }),
      resolveCameraEvent: (outcome: 'fixed' | 'broken') =>
        set({ s5CameraOutcome: outcome, s5CameraStartedAt: null }),
      startCameraTimer: () =>
        set((s) => ({
          s5CameraStartedAt: s.s5CameraStartedAt ?? Date.now(),
        })),
      withdrawLiquid: (amount: number) => {
        const state = get();
        // Source priority: wallet → checking → deposit → money-market → S&P 500.
        // `provident` is excluded (locked).
        const sources: Array<'wallet' | AccountType> = [
          'wallet', 'checking', 'deposit', 'index_fund', 'single_stock',
        ];
        const liquid = sources.reduce((sum, src) => {
          if (src === 'wallet') return sum + state.coins;
          return sum + (state.accounts[src as AccountType]?.balance ?? 0);
        }, 0);
        if (liquid < amount) return false;

        let remaining = amount;
        let newCoins = state.coins;
        const newAccounts: Record<AccountType, Account> = { ...state.accounts };
        for (const src of sources) {
          if (remaining <= 0) break;
          if (src === 'wallet') {
            const take = Math.min(newCoins, remaining);
            newCoins -= take;
            remaining -= take;
            continue;
          }
          const acc = newAccounts[src as AccountType];
          if (!acc || acc.balance <= 0) continue;
          const take = Math.min(acc.balance, remaining);
          // Proportionally reduce totalDeposited so cost-basis stays honest.
          const withdrawRatio = acc.balance > 0 ? take / acc.balance : 0;
          const costBasisReduction = acc.totalDeposited * withdrawRatio;
          newAccounts[src as AccountType] = {
            ...acc,
            balance: acc.balance - take,
            totalDeposited: Math.max(0, acc.totalDeposited - costBasisReduction),
          };
          remaining -= take;
        }
        set({ coins: newCoins, accounts: newAccounts });
        return true;
      },
      startMetaInflation: () => set({ metaInflationStarted: true }),
      bumpMetaInflation: (years: number) =>
        set((s) =>
          s.metaInflationStarted
            ? { metaInflationFactor: s.metaInflationFactor * Math.pow(1.01, years) }
            : {},
        ),
      setTimeSpeederAnimating: (v: boolean) => set({ timeSpeederAnimating: v }),

      // Board actions
      spawnItem: (chain: ChainId) => {
        const state = get();
        if (state.energy < 1) return false;
        const emptyIndex = state.grid.findIndex((cell) => cell.item === null);
        if (emptyIndex === -1) return false;

        const newItem = createItem(chain, 1);
        const newGrid = state.grid.map((cell, i) =>
          i === emptyIndex
            ? { index: cell.index, item: newItem }
            : { index: cell.index, item: cell.item }
        );

        set({ grid: newGrid, energy: state.energy - 1 });
        return true;
      },

      moveItem: (fromIndex: number, toIndex: number) => {
        const state = get();
        const fromItem = state.grid[fromIndex].item;
        const toItem = state.grid[toIndex].item;

        const newGrid = state.grid.map((cell, i) => {
          if (i === fromIndex) return { index: cell.index, item: toItem };
          if (i === toIndex) return { index: cell.index, item: fromItem };
          return { index: cell.index, item: cell.item };
        });

        set({ grid: newGrid });
      },

      mergeItems: (fromIndex: number, toIndex: number) => {
        const state = get();
        const fromItem = state.grid[fromIndex].item;
        const toItem = state.grid[toIndex].item;

        if (!fromItem || !toItem) return false;
        if (!canMerge(fromItem, toItem)) return false;

        let merged = doMerge(fromItem, toItem);

        // If merge booster is active, merge one more tier (if possible)
        let boosterUsed = false;
        if (state.mergeBoosterActive && merged.level < 8) {
          const boostedLevel = (merged.level + 1) as typeof merged.level;
          merged = createItem(merged.chain, boostedLevel);
          boosterUsed = true;
        }

        const newGrid = state.grid.map((cell, i) => {
          if (i === fromIndex) return { index: cell.index, item: null };
          if (i === toIndex) return { index: cell.index, item: merged };
          return { index: cell.index, item: cell.item };
        });

        set({
          grid: newGrid,
          mergeBoosterActive: boosterUsed ? false : state.mergeBoosterActive,
          totalMerges: state.totalMerges + 1,
        });
        get().checkMission();
        return true;
      },

      claimMaxTierBonus: (fromIndex: number, toIndex: number) => {
        const state = get();
        const fromItem = state.grid[fromIndex]?.item;
        const toItem = state.grid[toIndex]?.item;

        // Both must exist, be the same chain, and both at MAX_LEVEL.
        // (Same-chain MAX+MAX is the only case `canMerge` rejects that
        // we want to reward — different chains or mismatched levels keep
        // their existing swap behavior.)
        if (!fromItem || !toItem) return 0;
        if (fromItem.chain !== toItem.chain) return 0;
        if (fromItem.level !== 8 || toItem.level !== 8) return 0;

        const PRIZE_COINS = 25_000;
        const PRIZE_SPEEDERS = 1;

        // Clear both source cells.
        const newGrid = state.grid.map((cell, i) => {
          if (i === fromIndex || i === toIndex) {
            return { index: cell.index, item: null };
          }
          return { index: cell.index, item: cell.item };
        });

        set({
          grid: newGrid,
          coins: state.coins + PRIZE_COINS,
          timeSpeeders: state.timeSpeeders + PRIZE_SPEEDERS,
          totalMerges: state.totalMerges + 1,
        });
        get().checkMission();
        return PRIZE_COINS;
      },

      fulfillSellRequest: (requestId: string) => {
        const state = get();
        const request = state.sellRequests.find((r) => r.id === requestId);
        if (!request) return false;

        const matchedIndices = findMatchingCellsForRequest(state.grid, request);
        if (!matchedIndices) return false;

        // Clear all matched cells from the grid
        const indicesToClear = new Set(matchedIndices);
        const newGrid = state.grid.map((cell) =>
          indicesToClear.has(cell.index)
            ? { index: cell.index, item: null }
            : { index: cell.index, item: cell.item }
        );

        // Generate a replacement sell request immediately.
        // Easy-mode (max item level 3, smaller duo/set sizes) stays ON for
        // the entire intro journey so the player never gets a level-4+
        // request during the guided phase. Reverts to full-game pool only
        // once the journey is officially complete.
        const remainingRequests = state.sellRequests.filter((r) => r.id !== requestId);
        const isEarlyGame = !state.intro_journey_completed;
        const newRequest = generateSellRequest(remainingRequests, isEarlyGame);
        const newSellRequests = state.sellRequests.map((r) =>
          r.id === requestId ? newRequest : r
        );

        // Apply reward based on type
        const updates: Partial<GameState> = {
          grid: newGrid,
          sellRequests: newSellRequests,
          // Stage 3 mission gates count orders, not coins. Bump on every sell.
          totalOrdersCompleted: (state.totalOrdersCompleted || 0) + 1,
        };
        // Stage 3 lesson-branch uses orders-during-sales to size the makeup.
        if (state.activeSale && !state.stage3Completed) {
          updates.s3OrdersDuringSales = (state.s3OrdersDuringSales || 0) + 1;
        }

        switch (request.rewardType) {
          case 'coins': {
            // STANDING-ORDER SPLIT — Stage 3 only. 50% of every coin reward
            // routes automatically to the bank deposit while the standing
            // order is active. The rest lands in the wallet as usual.
            const stage3SplitActive =
              state.s3StandingOrderActive && !state.stage3Completed;
            if (stage3SplitActive) {
              const bankShare   = Math.round(request.rewardAmount * 0.5);
              const walletShare = request.rewardAmount - bankShare;
              updates.coins = state.coins + walletShare;
              const newAccounts = { ...state.accounts };
              const dep = newAccounts.deposit;
              newAccounts.deposit = {
                ...dep,
                balance:         dep.balance + bankShare,
                totalDeposited:  dep.totalDeposited + bankShare,
              };
              updates.accounts = newAccounts;
              updates.s3StandingOrderTotal =
                (state.s3StandingOrderTotal || 0) + bankShare;
            } else {
              updates.coins = state.coins + request.rewardAmount;
            }
            break;
          }
          case 'energy':
            updates.energy = Math.min(state.energy + request.rewardAmount, ENERGY_CAP);
            break;
          case 'time_booster':
            updates.timeSpeeders = state.timeSpeeders + request.rewardAmount;
            break;
          case 'merge_booster':
            updates.mergeBoosterActive = true;
            break;
          case 'mystery_box': {
            // Spawn a random item (level 1-3) on an empty cell
            const chains: ChainId[] = ['sushi', 'burger', 'art'];
            const rndChain = chains[Math.floor(Math.random() * chains.length)];
            const rndLevel = (Math.floor(Math.random() * 3) + 1) as 1 | 2 | 3;
            const mysteryItem = createItem(rndChain, rndLevel);
            const emptyIdx = newGrid.findIndex((c) => c.item === null);
            if (emptyIdx !== -1) {
              const mysteryGrid = newGrid.map((cell, i) =>
                i === emptyIdx
                  ? { index: cell.index, item: mysteryItem }
                  : { index: cell.index, item: cell.item }
              );
              updates.grid = mysteryGrid;
            }
            break;
          }
        }

        // Track tier3+ sells
        const hasTier3Plus = request.items.some((i) => i.level >= 3);
        if (hasTier3Plus) {
          updates.totalSellsTier3Plus = (state.totalSellsTier3Plus || 0) + 1;
        }

        set(updates as GameState);
        get().checkMission();
        return true;
      },

      // Legacy sellOrder — redirects to new system or falls back
      sellOrder: (orderId: string) => {
        // Try new sell request system first
        const state = get();
        const asRequest = state.sellRequests.find((r) => r.id === orderId);
        if (asRequest) {
          return get().fulfillSellRequest(orderId);
        }

        // Legacy fallback for old persisted orders
        const order = state.orders.find((o) => o.id === orderId);
        if (!order) return false;
        const matchIndex = findFirstMatchForOrder(state.grid, order);
        if (matchIndex === null) return false;

        const newGrid = state.grid.map((cell, i) =>
          i === matchIndex
            ? { index: cell.index, item: null }
            : { index: cell.index, item: cell.item }
        );

        const newOrder = generateSellRequest();
        const newOrders = state.orders.filter((o) => o.id !== orderId);

        set({ grid: newGrid, orders: newOrders, coins: state.coins + order.coinReward });
        get().checkMission();
        return true;
      },

      // Resource actions
      addCoins: (amount: number) => set((s) => ({ coins: s.coins + amount })),

      spendCoins: (amount: number) => {
        const state = get();
        if (state.coins < amount) return false;
        set({ coins: state.coins - amount });
        return true;
      },

      regenEnergy: () => {
        const state = get();
        if (state.energy >= ENERGY_CAP) return;
        const now = Date.now();
        const result = calculateEnergyRegen(
          state.lastEnergyRegenTimestamp,
          now,
          state.energy
        );
        if (result.newEnergy !== state.energy) {
          set({
            energy: result.newEnergy,
            lastEnergyRegenTimestamp: result.newTimestamp,
          });
        }
      },

      addEnergy: (amount: number) =>
        set((s) => ({ energy: Math.min(s.energy + amount, ENERGY_CAP) })),

      // Finance actions
      deposit: (accountType: AccountType, amount: number) => {
        const state = get();
        if (state.coins < amount) return false;
        const account = state.accounts[accountType];
        if (!account.isUnlocked) return false;

        // PRD Stage 5: provident fund gets a +10% state bonus on every
        // deposit. Bonus is added to BOTH balance and totalDeposited so
        // the cost-basis (and any future P/L calc) is honest.
        const PROVIDENT_BONUS = 0.10;
        const credit = accountType === 'provident'
          ? Math.round(amount * (1 + PROVIDENT_BONUS))
          : amount;

        const newAccounts = { ...state.accounts };
        newAccounts[accountType] = {
          ...account,
          balance: account.balance + credit,
          totalDeposited: account.totalDeposited + credit,
        };

        set({ coins: state.coins - amount, accounts: newAccounts });
        get().checkMission();
        return true;
      },

      withdraw: (accountType: AccountType, amount: number) => {
        const state = get();
        const account = state.accounts[accountType];
        if (!account.isUnlocked) return false;
        if (account.lockedUntilSpeeders > 0) return false;
        if (account.balance < amount) return false;

        // Proportional cost basis adjustment:
        // If withdrawing X% of balance, reduce totalDeposited by X% too.
        const withdrawRatio = amount / account.balance;
        const costBasisReduction = account.totalDeposited * withdrawRatio;

        // Realized P/L for THIS withdrawal:
        //   amountReceived - proportionalCostBasis
        // This captures the profit (or loss) realized at the moment of withdrawal,
        // so history isn't lost when balance goes to zero.
        const realizedDelta = amount - costBasisReduction;

        const newAccounts = { ...state.accounts };
        newAccounts[accountType] = {
          ...account,
          balance: account.balance - amount,
          totalDeposited: account.totalDeposited - costBasisReduction,
          realizedProfitLoss: (account.realizedProfitLoss || 0) + realizedDelta,
          // Store transaction-level P/L so we can display it when balance == 0.
          lastTransactionPL: realizedDelta,
        };

        set({ coins: state.coins + amount, accounts: newAccounts });
        return true;
      },

      useTimeSpeeder: () => {
        const state = get();
        if (state.timeSpeeders < 1) return false;

        // Fire the spinning-clock overlay; animation auto-clears after ~2.5s.
        set({ timeSpeederAnimating: true });

        // Bump Meta Goal price inflation by 1% × years (PRD: from the
        // first Stage 1 speeder onwards, prices rise 1% per sim year).
        // The flag is auto-started on the first speeder used after Stage 1
        // begins (handled below).
        if (!state.metaInflationStarted) {
          set({ metaInflationStarted: true });
        }
        // 1 speeder = SPEEDER_WEEKS / WEEKS_PER_YEAR years
        const yearsElapsed = SPEEDER_WEEKS / 52;
        // Apply the inflation factor multiplicatively (no-op if not started)
        set((s) => ({
          metaInflationFactor: s.metaInflationFactor * Math.pow(1.01, yearsElapsed),
        }));

        // Stage 3 teaching window: deterministic 4%/yr on the money market
        // (index_fund) so the savings-growth lesson lands. Reverts to the
        // normal stochastic engine after Stage 3 completes.
        const stage3Active = state.stage1Completed && !state.stage3Completed;

        // Stage 4 one-shots:
        // - scriptedDrop:    THIS tap uses the deterministic drop-and-recovery
        //                    for S&P 500 (4.3 lesson)
        // - positiveSeries:  THIS tap re-rolls bimodal until the year ends
        //                    positive (4.2 growth lesson — guaranteed up)
        const scriptedDrop    = state.s4ScriptedDropPending;
        const positiveSeries  = state.s4PositiveSeriesPending;

        // One speeder = SPEEDER_WEEKS sim weeks (= 52 = 1 sim year by default).
        const result = advanceSimWeeks(
          state.accounts,
          state.accounts.checking.balance,
          state.marketCrashTriggered,
          SPEEDER_WEEKS,
          stage3Active,
          scriptedDrop,
          positiveSeries,
        );

        const friendlyChanges: Record<string, number> = {};
        for (const [type, change] of Object.entries(result.changes)) {
          const account = state.accounts[type as AccountType];
          // Store by type (for AccountCard lookups) AND by name (for TimeSpeeder popup)
          friendlyChanges[type] = change;
          if (account) {
            friendlyChanges[account.name] = change;
          }
        }

        const finalAccounts = { ...result.accounts };
        finalAccounts.checking = {
          ...finalAccounts.checking,
          balance: result.checkingBalance,
        };

        // Apply random ±1%–3% inflation to the wallet (uninvested coins).
        // Positive rate = inflation (wallet loses value).
        // Negative rate = deflation (wallet gains value).
        // Investments are never touched by inflation.
        const currentYear = state.gameYear || 1;
        const inflationRate = rollAnnualInflationRate(); // ∈ [-0.03, -0.01] ∪ [0.01, 0.03]
        const uninvestedCoins = state.coins;
        let coinsDelta = 0;        // signed: negative = lost, positive = gained
        let wasProtected = false;

        if (uninvestedCoins <= 0) {
          // No wallet cash to inflate or deflate — fully protected.
          wasProtected = true;
        } else {
          // Round and clamp so the wallet can't go negative.
          coinsDelta = -Math.round(uninvestedCoins * inflationRate);
          // If inflation positive → coinsDelta negative (loss). Never lose
          // more than the wallet itself.
          if (coinsDelta < 0) {
            coinsDelta = Math.max(coinsDelta, -Math.floor(uninvestedCoins));
          }
        }

        // Friendly label for the time-speeder summary popup.
        if (coinsDelta < 0) {
          friendlyChanges['אינפלציה על מזומן'] = coinsDelta; // already negative
        } else if (coinsDelta > 0) {
          friendlyChanges['דפלציה — בונוס מזומן'] = coinsDelta; // positive
        }

        set({
          coins: state.coins + coinsDelta,
          timeSpeeders: state.timeSpeeders - 1,
          accounts: finalAccounts,
          lastChanges: friendlyChanges,
          marketCrashTriggered: state.marketCrashTriggered || result.crashOccurred,
          totalSpeedersUsed: (state.totalSpeedersUsed || 0) + 1,
          gameYear: currentYear + 1,
          lastInflationResult: {
            // Positive number for "lost", negative for "gained". UI reads
            // `coinsLost > 0` for the inflation message and `< 0` for deflation.
            coinsLost: -coinsDelta,
            rate: inflationRate,
            wasProtected,
          },
          // Stage 3: a time-speeder tap ends any active sale (1 game-year duration).
          activeSale: state.activeSale ? null : state.activeSale,
          // Stage 4: stash this tap's S&P 500 weekly path so the animated
          // result graph in 4.2 / 4.3 can render it. Clear the one-shot
          // teaching flags after consumption.
          s4LastSP500Path: result.sp500Path ?? [],
          s4ScriptedDropPending: false,
          s4PositiveSeriesPending: false,
        });
        get().checkMission();
        return true;
      },

      applyRealTimeInflation: () => {
        // Inflation no longer ticks in real time. It is rolled once per
        // time speeder use as a random ±1%–3% on the wallet only. This
        // function is kept as a no-op so the periodic call site in
        // GameShell.tsx doesn't crash, and persisted state migrations
        // referencing the old timestamp still work.
        const state = get();
        if (state.lastInflationTimestamp) return;
        set({ lastInflationTimestamp: Date.now() });
      },

      checkMission: () => {
        const state = get();
        const mission = state.currentMission;
        let currentValue = 0;

        switch (mission.type) {
          case 'earn_coins':
            currentValue = state.coins;
            break;
          case 'deposit':
            currentValue = Object.values(state.accounts).reduce(
              (sum, a) => sum + a.totalDeposited, 0
            );
            break;
          case 'profit':
            currentValue = Math.max(0, Object.values(state.accounts).reduce(
              (sum, a) => sum + (a.balance - a.totalDeposited) + (a.realizedProfitLoss || 0), 0
            ));
            break;
          case 'diversify':
            currentValue = Object.values(state.accounts).filter(
              (a) => a.type !== 'checking' && a.isUnlocked && a.totalDeposited > 0
            ).length;
            break;
          case 'survive_crash':
            currentValue = state.marketCrashTriggered ? 1 : 0;
            break;
          case 'first_deposit':
            // Has the player deposited anything into any non-checking account?
            currentValue = Object.values(state.accounts).some(
              (a) => a.type !== 'checking' && a.totalDeposited > 0
            ) ? 1 : 0;
            break;
          case 'deposit_profit':
            // Total profit earned from deposits (unrealized + realized, non-checking accounts)
            currentValue = Math.max(0, Math.round(
              Object.values(state.accounts)
                .filter((a) => a.type !== 'checking')
                .reduce((sum, a) => sum + (a.balance - a.totalDeposited) + (a.realizedProfitLoss || 0), 0)
            ));
            break;
          case 'sell_tier3':
            currentValue = state.totalSellsTier3Plus || 0;
            break;
          case 'merge_count':
            currentValue = state.totalMerges || 0;
            break;
          case 'use_speeder':
            currentValue = state.totalSpeedersUsed || 0;
            break;
        }

        const updated = { ...mission, currentValue };

        if (currentValue >= mission.targetValue && state.currentStage < 5) {
          const nextStage = (state.currentStage + 1) as Stage;
          const nextMission = getMissionForStage(nextStage);
          set({
            currentStage: nextStage,
            currentMission: nextMission,
            level: state.level + 1,
            timeSpeeders: state.timeSpeeders + 2,
          });
        } else {
          set({ currentMission: updated });
        }
      },

      purchaseGoal: (goalId: string) => {
        const state = get();
        const goal = state.goals.find((g) => g.id === goalId);
        if (!goal || goal.isPurchased) return false;
        if (state.currentStage < goal.stageRequired) return false;
        if (state.coins < goal.price) return false;

        const newGoals = state.goals.map((g) =>
          g.id === goalId ? { ...g, isPurchased: true } : g
        );

        set({ coins: state.coins - goal.price, goals: newGoals });
        return true;
      },

      purchaseMetaItem: (stageId: number, itemId: string) => {
        const state = get();
        const stageIndex = state.metaStages.findIndex((s) => s.id === stageId);
        if (stageIndex === -1) return false;
        const stage = state.metaStages[stageIndex];
        if (stage.status === 'locked') return false;

        const itemIndex = stage.items.findIndex((i) => i.id === itemId);
        if (itemIndex === -1) return false;
        const item = stage.items[itemIndex];

        const rawPrice = getNextPrice(item);
        if (rawPrice === null) return false; // Already fully completed

        // Apply meta inflation factor (matches MetaItemCard's displayed price).
        const inflatedPrice = Math.round(rawPrice * state.metaInflationFactor);

        // Stage 3 sale: 10% off if a sale window is active.
        const STAGE3_SALE_DISCOUNT = 0.10;
        const isOnSale = state.activeSale != null && !state.stage3Completed;
        const price = isOnSale
          ? Math.round(inflatedPrice * (1 - STAGE3_SALE_DISCOUNT))
          : inflatedPrice;

        if (state.coins < price) return false;

        // Advance item state
        const newItem = advanceItemState(item);

        // Deep-copy stages and apply the item change
        const newStages = state.metaStages.map((s, si) => ({
          ...s,
          items: s.items.map((it, ii) => {
            if (si === stageIndex && ii === itemIndex) return newItem;
            return { ...it, tiers: it.tiers.map((t) => ({ ...t })) };
          }),
        }));

        // Check unlock rules
        const checkedStages = checkStageCompletion(newStages);

        // Check if game is fully completed
        const allComplete = checkedStages.every((s) => s.status === 'completed');

        // Track Stage 3 sale spending — the lesson popup later branches on this.
        const saleUpdate: Partial<GameState> = {};
        if (isOnSale && state.activeSale) {
          if (state.activeSale.id === 1) {
            saleUpdate.s3SaleSpent1 = state.s3SaleSpent1 + price;
          } else {
            saleUpdate.s3SaleSpent2 = state.s3SaleSpent2 + price;
          }
        }
        // Stage 4 freedom phase: count Meta Goal purchases so the overlay
        // can auto-advance once the threshold is met.
        const stage4Active = state.stage3Completed && !state.stage4Completed;
        if (stage4Active) {
          saleUpdate.s4MetaPurchaseCount = state.s4MetaPurchaseCount + 1;
        }
        // Stage 5 final freedom phase: same idea — used to gate the
        // intro-journey-complete popup.
        const stage5Active = state.stage4Completed && !state.stage5Completed;
        if (stage5Active) {
          saleUpdate.s5MetaPurchaseCount = state.s5MetaPurchaseCount + 1;
        }

        set({
          coins: state.coins - price,
          metaStages: checkedStages,
          gameCompleted: allComplete,
          ...saleUpdate,
        });
        return true;
      },

      syncOffline: () => {
        const state = get();
        const now = Date.now();
        const result = calculateEnergyRegen(
          state.lastEnergyRegenTimestamp,
          now,
          state.energy
        );
        set({
          energy: result.newEnergy,
          lastEnergyRegenTimestamp: result.newTimestamp,
          lastOnlineTimestamp: now,
        });
      },

      resetGame: () => {
        // Demo restart: wipe ALL progression (Meta Goal, Finance, board,
        // missions, sell requests) and re-seed the curated demo state.
        // Resources (coins/energy/timeSpeeders) snap back to the demo
        // defaults so the presenter never runs dry between audiences.
        const n = Date.now();
        set({
          coins: STARTING_COINS,
          energy: STARTING_ENERGY,
          timeSpeeders: STARTING_TIME_SPEEDERS,
          level: 1,
          lastEnergyRegenTimestamp: n,
          lastInflationTimestamp: n,
          lastOnlineTimestamp: n,
          grid: createDemoGrid(),
          orders: [],
          sellRequests: generateDemoSellRequests(),
          mergeBoosterActive: false,
          totalMerges: 0,
          totalSellsTier3Plus: 0,
          totalSpeedersUsed: 0,
          gameYear: 1,
          lastInflationResult: null,
          accounts: createInitialAccounts(),
          currentStage: 1 as Stage,
          currentMission: getMissionForStage(1),
          marketCrashTriggered: false,
          lastChanges: {},
          goals: LIFE_GOALS.map((g) => ({ ...g })),
          metaStages: createInitialMetaStages(),
          gameCompleted: false,
          // Onboarding — restart replays the tutorial + Stage 1 flow.
          tutorialStep: 0,
          tutorialCompleted: false,
          producerTapCount: 0,
          stage1Step: 0,
          stage1Completed: false,
          s2M1CoinBaseline: 0,
          s2M2DepositBaseline: 0,
          mission3CoinBaseline: 0,
          mission6DepositBaseline: 0,
          // Stage 3 (standing-order rebuild) — full reset on demo restart
          stage3Step: 0,
          stage3Completed: false,
          s3StandingOrderActive: false,
          s3StandingOrderTotal: 0,
          s3m1OrdersBaseline: 0,
          s3m2OrdersBaseline: 0,
          s3m3OrdersBaseline: 0,
          s3MakeupOrdersBaseline: 0,
          s3MakeupTarget: 0,
          s3OrdersDuringSales: 0,
          activeSale: null,
          s3SaleSpent1: 0,
          s3SaleSpent2: 0,
          totalOrdersCompleted: 0,
          // Stage 4 — full reset on demo restart
          stage4Step: 0,
          stage4Completed: false,
          s4M1CoinBaseline: 0,
          s4M2SP500Baseline: 0,
          s4SP500StartBalance: 0,
          s4LastSP500Path: [],
          s4ScriptedDropPending: false,
          s4PositiveSeriesPending: false,
          s4MetaPurchaseCount: 0,
          // Stage 5 — full reset on demo restart
          stage5Step: 0,
          stage5Completed: false,
          intro_journey_completed: false,
          s5M1CoinBaseline: 0,
          s5CameraOutcome: 'pending',
          s5CameraStartedAt: null,
          s5MetaPurchaseCount: 0,
          metaInflationFactor: 1.0,
          metaInflationStarted: false,
        });
      },
    }),
    {
      name: 'funancy-game-state',
      version: 1,
      // Migrate old persisted meta-item states (base_owned/upgraded) to the
      // unified level-based model. Older sessions may still carry the legacy
      // strings in localStorage — without this, the level helpers would silently
      // treat them as level_0 and progression would look broken.
      migrate: (persisted: unknown, fromVersion: number) => {
        if (!persisted || typeof persisted !== 'object') return persisted;
        const p = persisted as Record<string, unknown>;
        if (fromVersion < 1 && Array.isArray(p.metaStages)) {
          const remap = (s: string): string => {
            if (s === 'base_owned') return 'level_1';
            if (s === 'upgraded') return 'level_2';
            // Any other unknown value → treat as unowned under the new model.
            if (s !== 'locked' && s !== 'level_0' && s !== 'level_1' && s !== 'level_2' && s !== 'level_3' && s !== 'level_4') {
              return 'level_0';
            }
            return s;
          };
          p.metaStages = (p.metaStages as Array<Record<string, unknown>>).map((stage) => ({
            ...stage,
            items: Array.isArray(stage.items)
              ? (stage.items as Array<Record<string, unknown>>).map((item) => ({
                  ...item,
                  state: typeof item.state === 'string' ? remap(item.state) : 'level_0',
                }))
              : stage.items,
          }));
        }
        return p;
      },
      partialize: (state) => ({
        coins: state.coins,
        energy: state.energy,
        timeSpeeders: state.timeSpeeders,
        level: state.level,
        lastEnergyRegenTimestamp: state.lastEnergyRegenTimestamp,
        lastInflationTimestamp: state.lastInflationTimestamp,
        lastOnlineTimestamp: state.lastOnlineTimestamp,
        grid: state.grid,
        orders: state.orders,
        sellRequests: state.sellRequests,
        mergeBoosterActive: state.mergeBoosterActive,
        totalMerges: state.totalMerges,
        totalSellsTier3Plus: state.totalSellsTier3Plus,
        totalSpeedersUsed: state.totalSpeedersUsed,
        gameYear: state.gameYear,
        accounts: state.accounts,
        currentStage: state.currentStage,
        currentMission: state.currentMission,
        marketCrashTriggered: state.marketCrashTriggered,
        lastChanges: state.lastChanges,
        goals: state.goals,
        metaStages: state.metaStages,
        gameCompleted: state.gameCompleted,
        // Onboarding state — must persist or the tutorial replays
        // on every reload and progress mid-flow is lost (PRD fix).
        tutorialStep: state.tutorialStep,
        tutorialCompleted: state.tutorialCompleted,
        tutorialArmed: state.tutorialArmed,
        producerTapCount: state.producerTapCount,
        stage1Step: state.stage1Step,
        stage1Completed: state.stage1Completed,
        s2M1CoinBaseline: state.s2M1CoinBaseline,
        s2M2DepositBaseline: state.s2M2DepositBaseline,
        mission3CoinBaseline: state.mission3CoinBaseline,
        mission6DepositBaseline: state.mission6DepositBaseline,
        // Stage 3 (standing-order) — all flags/baselines persist
        stage3Step: state.stage3Step,
        stage3Completed: state.stage3Completed,
        s3StandingOrderActive: state.s3StandingOrderActive,
        s3StandingOrderTotal: state.s3StandingOrderTotal,
        s3m1OrdersBaseline: state.s3m1OrdersBaseline,
        s3m2OrdersBaseline: state.s3m2OrdersBaseline,
        s3m3OrdersBaseline: state.s3m3OrdersBaseline,
        s3MakeupOrdersBaseline: state.s3MakeupOrdersBaseline,
        s3MakeupTarget: state.s3MakeupTarget,
        s3OrdersDuringSales: state.s3OrdersDuringSales,
        activeSale: state.activeSale,
        s3SaleSpent1: state.s3SaleSpent1,
        s3SaleSpent2: state.s3SaleSpent2,
        totalOrdersCompleted: state.totalOrdersCompleted,
        // Stage 4
        stage4Step: state.stage4Step,
        stage4Completed: state.stage4Completed,
        s4M1CoinBaseline: state.s4M1CoinBaseline,
        s4M2SP500Baseline: state.s4M2SP500Baseline,
        s4SP500StartBalance: state.s4SP500StartBalance,
        s4LastSP500Path: state.s4LastSP500Path,
        s4ScriptedDropPending: state.s4ScriptedDropPending,
        s4PositiveSeriesPending: state.s4PositiveSeriesPending,
        s4MetaPurchaseCount: state.s4MetaPurchaseCount,
        // Stage 5
        stage5Step: state.stage5Step,
        stage5Completed: state.stage5Completed,
        intro_journey_completed: state.intro_journey_completed,
        s5M1CoinBaseline: state.s5M1CoinBaseline,
        s5CameraOutcome: state.s5CameraOutcome,
        s5CameraStartedAt: state.s5CameraStartedAt,
        s5MetaPurchaseCount: state.s5MetaPurchaseCount,
        metaInflationFactor: state.metaInflationFactor,
        metaInflationStarted: state.metaInflationStarted,
        // Note: timeSpeederAnimating is intentionally NOT persisted —
        // it's a transient UI flag; if the user reloads mid-animation
        // we want it to default to false on next load, not stay stuck.
      }),
    }
  )
);

// PRD v2 (Stage 1 onboarding): if the player quits BEFORE completing the
// tutorial, restart from step 0 on next launch. Implemented as a one-shot
// reset that fires synchronously at module load, AFTER Zustand's persist
// middleware has rehydrated. We use `setState` so the new values are saved
// back to localStorage via `partialize`.
if (typeof window !== 'undefined') {
  // Defer to next microtask so persist's rehydrate has settled.
  Promise.resolve().then(() => {
    const s = useGameStore.getState();
    if (!s.tutorialCompleted && (s.tutorialStep !== 0 || s.tutorialArmed || s.producerTapCount !== 0)) {
      useGameStore.setState({
        tutorialStep: 0,
        tutorialArmed: false,
        producerTapCount: 0,
      });
    }
  });
}
