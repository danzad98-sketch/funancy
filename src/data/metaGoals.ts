import type { MetaStage, MetaItem, MetaItemState } from '@/types/goals';

/**
 * Pricing contract (applies to every item kind):
 *   tiers[N].price is the cost to advance from level N to level N+1.
 *   Each tier price is paid EXACTLY ONCE across the lifetime of the item.
 *   There is no cumulative "upgrade" fee — each Buy = one tier price = one level up.
 *
 * Every item now has 4 tiers (base + 3 upgrades). After tier 3 the item is at
 * `level_4` and a crown shows; no further Buy actions are possible.
 *
 * Item prices are the official spreadsheet values (funancy_economy.xlsx).
 * Meta Goal inflation (1% per time-booster use) is applied at render time
 * via `metaInflationFactor` in the store — base prices below are pre-inflation.
 */

// --- Stage 1: טכנולוגיה אישית (Personal Tech) ---
const STAGE_1_ITEMS: MetaItem[] = [
  {
    id: 'phone',
    kind: 'multi_level',
    state: 'level_0',
    tiers: [
      { emoji: '📞', name: 'טלפון בסיסי',  price: 20 },
      { emoji: '📱', name: 'סמארטפון',     price: 32 },
      { emoji: '📲', name: 'סמארטפון מתקדם', price: 48 },
      { emoji: '🌟', name: 'טלפון פרימיום', price: 70 },
    ],
  },
  {
    id: 'watch',
    kind: 'multi_level',
    state: 'level_0',
    tiers: [
      { emoji: '🕐', name: 'שעון רגיל',     price: 16 },
      { emoji: '⌚', name: 'שעון איכותי',   price: 26 },
      { emoji: '⏰', name: 'שעון חכם',      price: 38 },
      { emoji: '🎖️', name: 'שעון יוקרה',    price: 56 },
    ],
  },
  {
    id: 'earbuds',
    kind: 'multi_level',
    state: 'level_0',
    tiers: [
      { emoji: '🎵', name: 'אוזניות חוטיות', price: 12 },
      { emoji: '🎧', name: 'אוזניות בלוטוס', price: 20 },
      { emoji: '🎶', name: 'אוזניות פרימיום', price: 30 },
      { emoji: '🌟', name: 'אוזניות סטודיו', price: 44 },
    ],
  },
];

// --- Stage 2: בידור ופנאי (Entertainment & Leisure) ---
const STAGE_2_ITEMS: MetaItem[] = [
  {
    id: 'smart_speaker',
    kind: 'multi_level',
    state: 'locked',
    tiers: [
      { emoji: '🔊', name: 'רמקול בלוטוס',    price: 35 },
      { emoji: '📻', name: 'רמקול חכם',       price: 55 },
      { emoji: '🎙️', name: 'מערכת רמקולים',   price: 85 },
      { emoji: '🌟', name: 'מערכת סטריאו',    price: 125 },
    ],
  },
  {
    id: 'tablet',
    kind: 'multi_level',
    state: 'locked',
    tiers: [
      { emoji: '📔', name: 'טאבלט בסיסי',   price: 28 },
      { emoji: '📱', name: 'טאבלט',         price: 44 },
      { emoji: '📲', name: 'טאבלט מקצועי',  price: 68 },
      { emoji: '🌟', name: 'טאבלט פרימיום', price: 100 },
    ],
  },
  {
    id: 'console',
    kind: 'multi_level',
    state: 'locked',
    tiers: [
      { emoji: '🕹️', name: 'קונסולה רטרו',   price: 22 },
      { emoji: '🎮', name: 'קונסולה',         price: 35 },
      { emoji: '👾', name: 'קונסולה מתקדמת', price: 54 },
      { emoji: '🌟', name: 'קונסולת דור הבא', price: 79 },
    ],
  },
];

// --- Stage 3: ניידות ולמידה (Mobility & Learning) ---
const STAGE_3_ITEMS: MetaItem[] = [
  {
    id: 'laptop',
    kind: 'multi_level',
    state: 'locked',
    tiers: [
      { emoji: '💻', name: 'מחשב נייד בסיסי', price: 60 },
      { emoji: '🖥️', name: 'מחשב נייד',       price: 95 },
      { emoji: '⌨️', name: 'מחשב נייד מקצועי', price: 145 },
      { emoji: '🌟', name: 'מחשב נייד פרימיום', price: 215 },
    ],
  },
  {
    id: 'scooter',
    kind: 'multi_level',
    state: 'locked',
    tiers: [
      { emoji: '🛴', name: 'קורקינט',          price: 70 },
      { emoji: '🛵', name: 'קורקינט חשמלי',     price: 110 },
      { emoji: '⚡', name: 'קורקינט מהיר',     price: 170 },
      { emoji: '🌟', name: 'קורקינט פרימיום',  price: 250 },
    ],
  },
  {
    id: 'studies',
    kind: 'multi_level',
    state: 'locked',
    tiers: [
      { emoji: '📚', name: 'קורס מקצועי',       price: 50 },
      { emoji: '🎓', name: 'תעודה',             price: 78 },
      { emoji: '📜', name: 'דיפלומה',           price: 120 },
      { emoji: '🌟', name: 'תואר',              price: 177 },
    ],
  },
];

// --- Stage 4: עצמאות ועבודה (Independence & Work) ---
const STAGE_4_ITEMS: MetaItem[] = [
  {
    id: 'car',
    kind: 'multi_level',
    state: 'locked',
    tiers: [
      { emoji: '🚙', name: 'רכב יד שנייה',    price: 90 },
      { emoji: '🚗', name: 'רכב',             price: 140 },
      { emoji: '🏎️', name: 'רכב משפחתי',      price: 215 },
      { emoji: '🌟', name: 'רכב פרימיום',     price: 320 },
    ],
  },
  {
    id: 'home_office',
    kind: 'multi_level',
    state: 'locked',
    tiers: [
      { emoji: '🪑', name: 'פינת עבודה',       price: 72 },
      { emoji: '🖥️', name: 'הום אופיס',        price: 112 },
      { emoji: '💼', name: 'הום אופיס מתקדם',  price: 172 },
      { emoji: '🌟', name: 'אולפן ביתי',       price: 254 },
    ],
  },
  {
    id: 'vacation',
    kind: 'multi_level',
    state: 'locked',
    tiers: [
      { emoji: '🏝️', name: 'סופ״ש בארץ',       price: 80 },
      { emoji: '✈️', name: 'חופשה בחו״ל',      price: 125 },
      { emoji: '🌴', name: 'חופשה מורחבת',     price: 192 },
      { emoji: '🌟', name: 'חופשה יוקרתית',    price: 284 },
    ],
  },
];

// --- Stage 5: דיור ויוקרה (Housing & Luxury) ---
const STAGE_5_ITEMS: MetaItem[] = [
  {
    id: 'housing',
    kind: 'multi_level',
    state: 'locked',
    tiers: [
      { emoji: '🏚️', name: 'שכירות',           price: 115 },
      { emoji: '🏢', name: 'דירה',              price: 180 },
      { emoji: '🏡', name: 'בית פרטי',          price: 276 },
      { emoji: '🌟', name: 'דירת יוקרה',        price: 406 },
    ],
  },
  {
    id: 'furniture',
    kind: 'multi_level',
    state: 'locked',
    tiers: [
      { emoji: '🪑', name: 'ריהוט בסיסי',       price: 95 },
      { emoji: '🛋️', name: 'ריהוט ושיפוץ',      price: 148 },
      { emoji: '🛏️', name: 'ריהוט מעוצב',       price: 228 },
      { emoji: '🌟', name: 'שיפוץ יוקרתי',      price: 336 },
    ],
  },
  {
    id: 'gourmet_vacation',
    kind: 'multi_level',
    state: 'locked',
    tiers: [
      { emoji: '🏖️', name: 'חופשת חוף',        price: 105 },
      { emoji: '🍷', name: 'חופשת גורמה',       price: 164 },
      { emoji: '🛥️', name: 'שייט יוקרה',        price: 252 },
      { emoji: '🌟', name: 'חופשה אקסקלוסיבית', price: 370 },
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
      name: 'בידור ופנאי',
      description: 'איכות חיים ופנאי יומיומי',
      emoji: '🎮',
      status: 'locked',
      items: STAGE_2_ITEMS.map((item) => ({ ...item, tiers: item.tiers.map((t) => ({ ...t })) })),
    },
    {
      id: 3,
      name: 'ניידות ולמידה',
      description: 'כלים להתקדמות אישית ומקצועית',
      emoji: '🎓',
      status: 'locked',
      items: STAGE_3_ITEMS.map((item) => ({ ...item, tiers: item.tiers.map((t) => ({ ...t })) })),
    },
    {
      id: 4,
      name: 'עצמאות ועבודה',
      description: 'בסיס לחיים עצמאיים',
      emoji: '🚗',
      status: 'locked',
      items: STAGE_4_ITEMS.map((item) => ({ ...item, tiers: item.tiers.map((t) => ({ ...t })) })),
    },
    {
      id: 5,
      name: 'דיור ויוקרה',
      description: 'חלום גדול — בית ואיכות חיים',
      emoji: '🏡',
      status: 'locked',
      items: STAGE_5_ITEMS.map((item) => ({ ...item, tiers: item.tiers.map((t) => ({ ...t })) })),
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
    case 'level_4':
      return 4;
    default:
      return 0;
  }
}

/** Highest reachable level for this item (== number of tiers). */
export function getMaxLevel(item: MetaItem): number {
  return item.tiers.length;
}

// --- Unlock rules (relaxed: 2 of 3 items at max-level AND every item ≥ level_2) ---

function relaxedStageComplete(items: MetaItem[]): boolean {
  if (items.length === 0) return false;
  const everyAtLeastLevel2 = items.every((i) => getCurrentLevel(i) >= 2);
  const atLeast2Maxed = items.filter((i) => getCurrentLevel(i) >= getMaxLevel(i)).length >= 2;
  return everyAtLeastLevel2 && atLeast2Maxed;
}

/** Stage N → N+1 advance gate (relaxed: 2 of 3 fully bought + all at ≥ tier-2). */
function checkStage1Complete(items: MetaItem[]): boolean { return relaxedStageComplete(items); }
function checkStage2Complete(items: MetaItem[]): boolean { return relaxedStageComplete(items); }
export function checkStage3Complete(items: MetaItem[]): boolean { return relaxedStageComplete(items); }
function checkStage4Complete(items: MetaItem[]): boolean { return relaxedStageComplete(items); }
function checkStage5Complete(items: MetaItem[]): boolean { return relaxedStageComplete(items); }

export function checkStageCompletion(stages: MetaStage[]): MetaStage[] {
  const updated = stages.map((s) => ({
    ...s,
    items: s.items.map((i) => ({ ...i, tiers: i.tiers.map((t) => ({ ...t })) })),
  }));

  // Cascade unlocks 1 → 2 → 3 → 4 → 5
  const checks = [
    checkStage1Complete,
    checkStage2Complete,
    checkStage3Complete,
    checkStage4Complete,
    checkStage5Complete,
  ];
  for (let i = 0; i < updated.length; i++) {
    if (updated[i].status === 'active' && checks[i](updated[i].items)) {
      updated[i].status = 'completed';
      // Unlock next stage if there is one
      const next = updated[i + 1];
      if (next && next.status === 'locked') {
        next.status = 'active';
        next.items = next.items.map((item) => ({
          ...item,
          state: item.state === 'locked' ? 'level_0' : item.state,
        }));
      }
    }
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
    (sum, stage) => sum + stage.items.reduce((s, item) => s + item.tiers.length, 0),
    0,
  );
}

/** Total Meta-Goal upgrades the player has completed so far. */
export function getMetaCompletedUpgrades(stages: MetaStage[]): number {
  return stages.reduce(
    (sum, stage) => sum + stage.items.reduce((s, item) => s + getCurrentLevel(item), 0),
    0,
  );
}

/** Fraction of Meta progression complete across all stages (0..1). */
export function getMetaProgressFraction(stages: MetaStage[]): number {
  const total = getMetaTotalUpgrades(stages);
  if (total === 0) return 0;
  return Math.min(1, getMetaCompletedUpgrades(stages) / total);
}
