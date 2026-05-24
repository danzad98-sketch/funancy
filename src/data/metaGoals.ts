import type { MetaStage, MetaItem, MetaItemState } from '@/types/goals';

/**
 * Pricing contract (applies to every item kind):
 *   tiers[N].price is the cost to advance from level N to level N+1.
 *   Each tier price is paid EXACTLY ONCE across the lifetime of the item.
 *   There is no cumulative "upgrade" fee — each Buy = one tier price = one level up.
 *
 * Example (phone, purchase_only... no wait, upgradeable):
 *   tiers[0] = טלפון מקשים, price 300  → pay 300 once to go level_0 → level_1
 *   tiers[1] = סמארטפון,    price 800  → pay 800 once to go level_1 → level_2
 *   Total spent on phone chain = 1100. Nothing is charged twice.
 */

// --- Stage 1: טכנולוגיה אישית ---
const STAGE_1_ITEMS: MetaItem[] = [
  {
    id: 'phone',
    kind: 'upgradeable',
    state: 'level_0',
    tiers: [
      { emoji: '📞', name: 'טלפון מקשים', price: 300 },
      { emoji: '📱', name: 'סמארטפון', price: 800 },
    ],
  },
  {
    id: 'watch',
    kind: 'upgradeable',
    state: 'level_0',
    tiers: [
      { emoji: '🕐', name: 'שעון רגיל', price: 200 },
      { emoji: '⌚', name: 'שעון חכם', price: 600 },
    ],
  },
  {
    id: 'earbuds',
    kind: 'upgradeable',
    state: 'level_0',
    tiers: [
      { emoji: '🎵', name: 'אוזניות חוטיות', price: 150 },
      { emoji: '🎧', name: 'אוזניות בלוטוס', price: 500 },
    ],
  },
];

// --- Stage 2: עצמאות ---
const STAGE_2_ITEMS: MetaItem[] = [
  {
    id: 'computer',
    kind: 'upgradeable',
    state: 'locked',
    tiers: [
      { emoji: '🖥️', name: 'מחשב נייח', price: 2000 },
      { emoji: '💻', name: 'מחשב נייד', price: 5000 },
    ],
  },
  {
    id: 'car',
    kind: 'upgradeable',
    state: 'locked',
    tiers: [
      { emoji: '🚗', name: 'רכב ישן', price: 5000 },
      { emoji: '🚙', name: 'רכב חדש', price: 15000 },
    ],
  },
  {
    id: 'studies',
    kind: 'purchase_only',
    state: 'locked',
    tiers: [
      { emoji: '🎓', name: 'לימודים', price: 8000 },
    ],
  },
];

// --- Stage 3: דיור ושדרוג חיים ---
const STAGE_3_ITEMS: MetaItem[] = [
  {
    id: 'housing',
    kind: 'multi_level',
    state: 'locked',
    tiers: [
      { emoji: '🏚️', name: 'שכירות', price: 3000 },
      { emoji: '🏢', name: 'דירה בבניין מגורים', price: 25000 },
      { emoji: '🏡', name: 'בית צמוד קרקע', price: 100000 },
    ],
  },
  {
    id: 'vacation',
    kind: 'purchase_only',
    state: 'locked',
    tiers: [
      { emoji: '✈️', name: 'חופשה גדולה', price: 15000 },
    ],
  },
];

export function createInitialMetaStages(): MetaStage[] {
  return [
    {
      id: 1,
      name: 'טכנולוגיה אישית',
      description: 'ציוד בסיסי לחיים המודרניים',
      emoji: '📱',
      status: 'active',
      items: STAGE_1_ITEMS.map((item) => ({ ...item, tiers: item.tiers.map((t) => ({ ...t })) })),
    },
    {
      id: 2,
      name: 'עצמאות',
      description: 'צעדים ראשונים לעצמאות כלכלית',
      emoji: '🎓',
      status: 'locked',
      items: STAGE_2_ITEMS.map((item) => ({ ...item, tiers: item.tiers.map((t) => ({ ...t })) })),
    },
    {
      id: 3,
      name: 'דיור ושדרוג חיים',
      description: 'חלום גדול — בית ואיכות חיים',
      emoji: '🏡',
      status: 'locked',
      items: STAGE_3_ITEMS.map((item) => ({ ...item, tiers: item.tiers.map((t) => ({ ...t })) })),
    },
  ];
}

// ---------------------------------------------------------------------------
// Level helpers — the single source of truth for "what level does this item
// currently own?" Everything else derives from these.
// ---------------------------------------------------------------------------

/** Number of tier advances already purchased. 0 = nothing owned yet. */
export function getCurrentLevel(item: MetaItem): number {
  switch (item.state) {
    case 'locked':
    case 'level_0':
      return 0;
    case 'level_1':
      return 1;
    case 'level_2':
      return 2;
    case 'level_3':
      return 3;
    default:
      return 0;
  }
}

/** Highest reachable level for this item (== number of tiers). */
export function getMaxLevel(item: MetaItem): number {
  return item.tiers.length;
}

// --- Unlock rules (expressed in terms of current level) ---

/** Stage 1 → 2: every item bought at least once AND ≥2 of the 3 reached level 2. */
function checkStage1Complete(items: MetaItem[]): boolean {
  const allAtLeastLevel1 = items.every((i) => getCurrentLevel(i) >= 1);
  const atLeast2AtLevel2 = items.filter((i) => getCurrentLevel(i) >= 2).length >= 2;
  return allAtLeastLevel1 && atLeast2AtLevel2;
}

/** Stage 2 → 3: computer & car both at level 2, studies bought. */
function checkStage2Complete(items: MetaItem[]): boolean {
  const computer = items.find((i) => i.id === 'computer');
  const car = items.find((i) => i.id === 'car');
  const studies = items.find((i) => i.id === 'studies');
  if (!computer || !car || !studies) return false;
  return (
    getCurrentLevel(computer) >= 2 &&
    getCurrentLevel(car) >= 2 &&
    getCurrentLevel(studies) >= 1
  );
}

/** Game complete: housing at level 3, vacation purchased. */
export function checkStage3Complete(items: MetaItem[]): boolean {
  const housing = items.find((i) => i.id === 'housing');
  const vacation = items.find((i) => i.id === 'vacation');
  if (!housing || !vacation) return false;
  return getCurrentLevel(housing) >= 3 && getCurrentLevel(vacation) >= 1;
}

export function checkStageCompletion(stages: MetaStage[]): MetaStage[] {
  const updated = stages.map((s) => ({
    ...s,
    items: s.items.map((i) => ({ ...i, tiers: i.tiers.map((t) => ({ ...t })) })),
  }));

  // Stage 1 → unlock Stage 2
  if (updated[0].status === 'active' && checkStage1Complete(updated[0].items)) {
    updated[0].status = 'completed';
    if (updated[1].status === 'locked') {
      updated[1].status = 'active';
      updated[1].items = updated[1].items.map((item) => ({
        ...item,
        state: item.state === 'locked' ? 'level_0' : item.state,
      }));
    }
  }

  // Stage 2 → unlock Stage 3
  if (updated[1].status === 'active' && checkStage2Complete(updated[1].items)) {
    updated[1].status = 'completed';
    if (updated[2].status === 'locked') {
      updated[2].status = 'active';
      updated[2].items = updated[2].items.map((item) => ({
        ...item,
        state: item.state === 'locked' ? 'level_0' : item.state,
      }));
    }
  }

  // Stage 3 complete
  if (updated[2].status === 'active' && checkStage3Complete(updated[2].items)) {
    updated[2].status = 'completed';
  }

  return updated;
}

/** Price of the NEXT Buy, or null if nothing more to buy (locked or at max level). */
export function getNextPrice(item: MetaItem): number | null {
  if (item.state === 'locked') return null;
  const level = getCurrentLevel(item);
  if (level >= getMaxLevel(item)) return null;
  // tiers[level] is "the tier you unlock next" — its price is what you pay to advance.
  return item.tiers[level].price;
}

/**
 * Button label for the NEXT Buy.
 * Intentionally always 'רכוש' (Buy) — we do NOT label anything "שדרג" (Upgrade).
 * Every progression step is a distinct purchase of a distinct product.
 */
export function getNextActionLabel(item: MetaItem): string | null {
  return getNextPrice(item) !== null ? 'רכוש' : null;
}

/** Move the item forward by exactly one level. Idempotent once at max. */
export function advanceItemState(item: MetaItem): MetaItem {
  const next = { ...item, tiers: item.tiers.map((t) => ({ ...t })) };
  const level = getCurrentLevel(item);
  const max = getMaxLevel(item);
  if (item.state === 'locked' || level >= max) return next;
  const newLevelNum = level + 1;
  next.state = (`level_${newLevelNum}`) as MetaItemState;
  return next;
}

/**
 * Index of the tier the player currently OWNS in `item.tiers`.
 * Returns -1 when nothing has been purchased yet (level 0).
 */
export function getCurrentTierIndex(item: MetaItem): number {
  return getCurrentLevel(item) - 1;
}

/** True when the chain is fully bought out. */
export function isItemComplete(item: MetaItem): boolean {
  return getCurrentLevel(item) >= getMaxLevel(item);
}

/**
 * Total Meta-Goal upgrades possible across all stages.
 * Counts every individual tier purchase, not just items.
 */
export function getMetaTotalUpgrades(stages: MetaStage[]): number {
  return stages.reduce(
    (sum, s) => sum + s.items.reduce((isum, it) => isum + getMaxLevel(it), 0),
    0,
  );
}

/** Total Meta-Goal upgrades currently completed. */
export function getMetaCompletedUpgrades(stages: MetaStage[]): number {
  return stages.reduce(
    (sum, s) => sum + s.items.reduce((isum, it) => isum + getCurrentLevel(it), 0),
    0,
  );
}

/**
 * Progress fraction (0..1) for the 9-step Meta Goal bar (PRD 3).
 * Auto-scales — the bar fills proportionally regardless of how many
 * total upgrades exist, so adding new items doesn't require re-tuning.
 */
export function getMetaProgressFraction(stages: MetaStage[]): number {
  const total = getMetaTotalUpgrades(stages);
  if (total <= 0) return 0;
  return Math.min(1, getMetaCompletedUpgrades(stages) / total);
}
