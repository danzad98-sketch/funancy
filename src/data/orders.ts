import type { ChainId, ItemLevel, SellRequest, SellRequestType, RewardType, SellRequestItem } from '@/types/game';
import { SELL_PRICES, SELL_MULTIPLIER_SINGLE, SELL_MULTIPLIER_DUO, SELL_MULTIPLIER_CATEGORY_SET } from '@/lib/constants';
import { getItemDef } from './itemChains';

// --- Character pool ---
// PRD: 5 painted buyer characters (rendered as SVG via BuyerCharacters.tsx).
// The `id` field maps to <BuyerCharacter id={N} />.  The `emoji` field
// is kept around purely for backward compat with any old persisted state
// — the live UI uses the SVG components.
type CharId = 1 | 2 | 3 | 4 | 5;
interface Character {
  id: CharId;
  emoji: string; // legacy fallback
  name: string;
}

const CHARACTERS: Character[] = [
  { id: 1, emoji: '👨',    name: 'דני' },     // blonde male, light blue shirt
  { id: 2, emoji: '👩‍🍳', name: 'מיכל' },    // brunette female chef
  { id: 3, emoji: '👮',    name: 'נועה' },    // Black female police officer
  { id: 4, emoji: '🧔',    name: 'שמעון' },   // older bearded farmer
  { id: 5, emoji: '👩‍🔬', name: 'יעל' },     // Asian female scientist
];

/**
 * Pick a character that is NOT already on stage (PRD: no duplicates).
 * `excludeIds` is the set of character IDs currently visible in the
 * active sell requests. With 5 characters and 3 slots, this is always
 * solvable. Falls back to a random pick if (somehow) all 5 are excluded.
 */
function pickCharacter(excludeIds: Set<CharId>): Character {
  const available = CHARACTERS.filter((c) => !excludeIds.has(c.id));
  const pool = available.length > 0 ? available : CHARACTERS;
  return pool[Math.floor(Math.random() * pool.length)];
}

// --- Hebrew labels ---
const TYPE_LABELS: Record<SellRequestType, string> = {
  single: 'פריט בודד',
  duo: 'עסקת זוג',
  category_set: 'סט קטגוריה',
};

const REWARD_LABELS: Record<RewardType, string> = {
  coins: 'מטבעות',
  time_booster: 'מאיץ זמן',
  energy: 'אנרגיה',
  mystery_box: 'תיבת הפתעה',
  merge_booster: 'מאיץ מיזוג',
};

/**
 * Per-reward-type emoji used in `request.rewardEmoji` for legacy display
 * paths (sell-reward float, reward speech bubble, toast).
 *
 * Note: For `coins` and `energy` rewards the UI no longer renders this
 * emoji — those reward types are routed through `rewardIconClass()` in
 * OrderGallery so the painted PNG header icons are used instead. The
 * empty strings below make any accidental fallback render as nothing
 * rather than a mismatched glyph. Other reward types (time_booster,
 * mystery_box, merge_booster) still use their emoji as before.
 */
const REWARD_EMOJIS: Record<RewardType, string> = {
  coins: '',
  time_booster: '⏩',
  energy: '',
  mystery_box: '🎁',
  merge_booster: '🔮',
};

// --- Helpers ---
const ALL_CHAINS: ChainId[] = ['sushi', 'burger', 'art'];

function randomPick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomLevel(min: number = 1, max: number = 6): ItemLevel {
  const lvl = Math.floor(Math.random() * (max - min + 1)) + min;
  return lvl as ItemLevel;
}

function itemPrice(level: ItemLevel): number {
  return SELL_PRICES[level] ?? 5;
}

function makeSellItem(chain: ChainId, level: ItemLevel): SellRequestItem {
  const def = getItemDef(chain, level);
  return {
    chain: def.chain,
    level: def.level,
    emoji: def.emoji,
    image: def.image,
    name: def.name,
  };
}

// Working Board sell rewards are coins only (PRD 1: simplify the loop).
// Other reward types (time_booster, energy, mystery_box, merge_booster)
// still exist as constants and are used elsewhere — Finance Center mission
// rewards, Meta Goal completion bonuses, etc.
function randomRewardType(_earlyGame: boolean = false): RewardType {
  return 'coins';
}

// Weighted random sell request type.
// During the intro journey (`earlyGame === true`) we bias HEAVILY toward
// single-item requests so a fresh player isn't asked to merge 4-6 items
// into a duo/set immediately after learning the basics.
function randomRequestType(earlyGame: boolean = false): SellRequestType {
  const roll = Math.random();
  if (earlyGame) {
    if (roll < 0.80) return 'single';        // 80% singles in early game
    if (roll < 0.95) return 'duo';           // 15% duos
    return 'category_set';                   // 5% category sets
  }
  if (roll < 0.50) return 'single';
  if (roll < 0.80) return 'duo';
  return 'category_set';
}

/**
 * Per-stage difficulty tuning for Working Board sell requests.
 *
 * Stages 4 and 5 were too grindy: the default early-game pool asks for
 * tier 4-5 items (60-70 coins each) and mixes in duos/sets, so reaching
 * the 500 / 700-coin missions took many merges. Per demo-tuning request,
 * stages 4 and 5 now emit SIMPLE single requests of low-tier items (easy
 * to make in 1-2 merges) that pay a fixed high coin band, so the player
 * reaches the mission targets in a handful of sales.
 *
 *   Stage 4 → tier 3-4 items, 100-130 coins per sale
 *   Stage 5 → tier 3-4 items, 130-170 coins per sale
 */
export interface StageTune {
  minLevel: number;
  maxLevel: number;
  rewardMin: number;
  rewardMax: number;
}
export const STAGE4_TUNE: StageTune = { minLevel: 3, maxLevel: 4, rewardMin: 100, rewardMax: 130 };
export const STAGE5_TUNE: StageTune = { minLevel: 3, maxLevel: 4, rewardMin: 130, rewardMax: 170 };

/** Resolve the active stage's sell tune (or null if no special tuning). */
export function getStageTune(opts: {
  stage1Completed: boolean;
  stage3Completed: boolean;
  stage4Completed: boolean;
  stage5Completed: boolean;
}): StageTune | null {
  // Stage 5 active: stage 4 done, stage 5 not yet.
  if (opts.stage4Completed && !opts.stage5Completed) return STAGE5_TUNE;
  // Stage 4 active: stage 3 done, stage 4 not yet.
  if (opts.stage3Completed && !opts.stage4Completed) return STAGE4_TUNE;
  return null;
}

function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

let sellRequestIdCounter = 0;

/** Collect characterIds currently in use by other active requests so we
 *  can exclude them when picking a new one (PRD no-duplicate rule). */
function getActiveCharacterIds(active: SellRequest[] | undefined): Set<CharId> {
  const ids = new Set<CharId>();
  if (!active) return ids;
  for (const r of active) {
    if (r.characterId) ids.add(r.characterId as CharId);
  }
  return ids;
}

function generateSingleRequest(earlyGame: boolean, exclude: Set<CharId>): SellRequest {
  const chain = randomPick(ALL_CHAINS);
  // Tier 3+ is sellable. Early game asks for tier 3-5 (reachable in 2-4
  // merges); later game widens to tier 4-8 for bigger payouts.
  const level = randomLevel(earlyGame ? 3 : 4, earlyGame ? 5 : 8);
  const item = makeSellItem(chain, level);
  const rewardType = randomRewardType(earlyGame);
  const baseValue = Math.round(itemPrice(level) * SELL_MULTIPLIER_SINGLE);
  const rewardAmount = rewardType === 'coins' ? baseValue
    : rewardType === 'energy' ? Math.max(2, Math.ceil(baseValue / 30))
    : rewardType === 'time_booster' ? Math.max(1, Math.ceil(baseValue / 200))
    : 1;

  const character = pickCharacter(exclude);

  return {
    id: `sell_${Date.now()}_${sellRequestIdCounter++}`,
    type: 'single',
    label: TYPE_LABELS.single,
    items: [item],
    rewardType,
    rewardAmount,
    rewardLabel: REWARD_LABELS[rewardType],
    rewardEmoji: REWARD_EMOJIS[rewardType],
    characterEmoji: character.emoji,
    characterName: character.name,
    characterId: character.id,
    bonusMultiplier: SELL_MULTIPLIER_SINGLE,
  };
}

function generateDuoRequest(earlyGame: boolean, exclude: Set<CharId>): SellRequest {
  const chain = randomPick(ALL_CHAINS);
  const level1 = randomLevel(earlyGame ? 3 : 4, earlyGame ? 5 : 7);
  const level2 = randomLevel(earlyGame ? 3 : 4, earlyGame ? 5 : 7);
  const item1 = makeSellItem(chain, level1);
  const item2 = makeSellItem(chain, level2);
  const rewardType = randomRewardType(earlyGame);
  const combinedValue = itemPrice(level1) + itemPrice(level2);
  const baseValue = Math.round(combinedValue * SELL_MULTIPLIER_DUO);
  const rewardAmount = rewardType === 'coins' ? baseValue
    : rewardType === 'energy' ? Math.max(3, Math.ceil(baseValue / 25))
    : rewardType === 'time_booster' ? Math.max(1, Math.ceil(baseValue / 150))
    : 1;

  const character = pickCharacter(exclude);

  return {
    id: `sell_${Date.now()}_${sellRequestIdCounter++}`,
    type: 'duo',
    label: TYPE_LABELS.duo,
    items: [item1, item2],
    rewardType,
    rewardAmount,
    rewardLabel: REWARD_LABELS[rewardType],
    rewardEmoji: REWARD_EMOJIS[rewardType],
    characterEmoji: character.emoji,
    characterName: character.name,
    characterId: character.id,
    bonusMultiplier: SELL_MULTIPLIER_DUO,
  };
}

function generateCategorySetRequest(earlyGame: boolean, exclude: Set<CharId>): SellRequest {
  const chain = randomPick(ALL_CHAINS);
  const items: SellRequestItem[] = [];
  let totalValue = 0;
  for (let i = 0; i < 3; i++) {
    const level = randomLevel(earlyGame ? 3 : 4, earlyGame ? 5 : 6);
    items.push(makeSellItem(chain, level));
    totalValue += itemPrice(level);
  }
  const rewardType = randomRewardType(earlyGame);
  const baseValue = Math.round(totalValue * SELL_MULTIPLIER_CATEGORY_SET);
  const rewardAmount = rewardType === 'coins' ? baseValue
    : rewardType === 'energy' ? Math.max(4, Math.ceil(baseValue / 20))
    : rewardType === 'time_booster' ? Math.max(1, Math.ceil(baseValue / 100))
    : 1;

  const character = pickCharacter(exclude);

  return {
    id: `sell_${Date.now()}_${sellRequestIdCounter++}`,
    type: 'category_set',
    label: TYPE_LABELS.category_set,
    items,
    rewardType,
    rewardAmount,
    rewardLabel: REWARD_LABELS[rewardType],
    rewardEmoji: REWARD_EMOJIS[rewardType],
    characterEmoji: character.emoji,
    characterName: character.name,
    characterId: character.id,
    bonusMultiplier: SELL_MULTIPLIER_CATEGORY_SET,
  };
}

/**
 * Tuned single request for stages 4/5 — a low-tier item (easy to make)
 * that pays a fixed high coin band. Always a `single` so the player never
 * has to assemble a duo/set to make progress during these late stages.
 */
function generateTunedSingleRequest(tune: StageTune, exclude: Set<CharId>): SellRequest {
  const chain = randomPick(ALL_CHAINS);
  const level = randomLevel(tune.minLevel, tune.maxLevel);
  const item = makeSellItem(chain, level);
  const rewardAmount = randInt(tune.rewardMin, tune.rewardMax);
  const character = pickCharacter(exclude);

  return {
    id: `sell_${Date.now()}_${sellRequestIdCounter++}`,
    type: 'single',
    label: TYPE_LABELS.single,
    items: [item],
    rewardType: 'coins',
    rewardAmount,
    rewardLabel: REWARD_LABELS.coins,
    rewardEmoji: REWARD_EMOJIS.coins,
    characterEmoji: character.emoji,
    characterName: character.name,
    characterId: character.id,
    bonusMultiplier: SELL_MULTIPLIER_SINGLE,
  };
}

export function generateSellRequest(
  existingRequests?: SellRequest[],
  earlyGame: boolean = false,
  tune: StageTune | null = null,
): SellRequest {
  const excludeIds = getActiveCharacterIds(existingRequests);

  // Stage 4/5 tuning short-circuits the normal weighted pool: always a
  // simple, well-paying single request.
  if (tune) {
    let request = generateTunedSingleRequest(tune, excludeIds);
    if (existingRequests && existingRequests.length > 0) {
      const key = (r: SellRequest) =>
        r.items.map((i) => `${i.chain}:${i.level}`).join('|');
      const existingKeys = new Set(existingRequests.map(key));
      let attempts = 0;
      while (existingKeys.has(key(request)) && attempts < 10) {
        request = generateTunedSingleRequest(tune, excludeIds);
        attempts++;
      }
    }
    return request;
  }

  const type = randomRequestType(earlyGame);

  const gen = (t: SellRequestType) => {
    if (t === 'single') return generateSingleRequest(earlyGame, excludeIds);
    if (t === 'duo') return generateDuoRequest(earlyGame, excludeIds);
    return generateCategorySetRequest(earlyGame, excludeIds);
  };

  let request = gen(type);

  // Avoid duplicating exact same items as an existing request
  if (existingRequests && existingRequests.length > 0) {
    const key = (r: SellRequest) =>
      r.items.map((i) => `${i.chain}:${i.level}`).join('|');
    const existingKeys = new Set(existingRequests.map(key));
    let attempts = 0;
    while (existingKeys.has(key(request)) && attempts < 10) {
      request = gen(type);
      attempts++;
    }
  }

  return request;
}

/**
 * Three tuned single requests — used to seed the board when a stage with
 * special tuning (4 or 5) becomes active, so the very first sales already
 * pay the eased coin band instead of the leftover early-game requests.
 */
export function generateTunedSellRequests(tune: StageTune): SellRequest[] {
  const requests: SellRequest[] = [];
  const exclude = new Set<CharId>();
  for (let i = 0; i < 3; i++) {
    const r = generateTunedSingleRequest(tune, new Set(exclude));
    requests.push(r);
    exclude.add(r.characterId as CharId);
  }
  return requests;
}

export function generateInitialSellRequests(): SellRequest[] {
  const requests: SellRequest[] = [];
  const exclude = new Set<CharId>();
  const pushRequest = (r: SellRequest) => {
    requests.push(r);
    exclude.add(r.characterId as CharId);
  };
  pushRequest(generateSingleRequest(true, new Set(exclude)));
  pushRequest(generateDuoRequest(true, new Set(exclude)));
  pushRequest(generateCategorySetRequest(true, new Set(exclude)));
  return requests;
}

/**
 * DEMO sell requests — hand-crafted for the presentation flow.
 * Each request is solvable in 0–2 merges from the demo starting grid.
 * Per PRD 1, all Working Board rewards are coins only — the 3 requests
 * show 3 different coin amounts so the player sees clear value progression.
 */
export function generateDemoSellRequests(): SellRequest[] {
  const id = () => `sell_${Date.now()}_${sellRequestIdCounter++}`;

  // Hand-pick 3 distinct characters for the demo so the audience sees
  // variety immediately (cycling through different archetypes).
  const demoChars: Character[] = [CHARACTERS[0], CHARACTERS[1], CHARACTERS[2]];

  const makeCoinRequest = (chain: ChainId, level: ItemLevel, char: Character): SellRequest => {
    const item = makeSellItem(chain, level);
    const reward = Math.round(itemPrice(level) * SELL_MULTIPLIER_SINGLE);
    return {
      id: id(),
      type: 'single',
      label: TYPE_LABELS.single,
      items: [item],
      rewardType: 'coins',
      rewardAmount: reward,
      rewardLabel: REWARD_LABELS.coins,
      rewardEmoji: REWARD_EMOJIS.coins,
      characterEmoji: char.emoji,
      characterName: char.name,
      characterId: char.id,
      bonusMultiplier: SELL_MULTIPLIER_SINGLE,
    };
  };

  // Per official spec: orders only target sellable tiers (4-8).
  return [
    makeCoinRequest('sushi',  4 as ItemLevel, demoChars[0]),
    makeCoinRequest('burger', 4 as ItemLevel, demoChars[1]),
    makeCoinRequest('art',    4 as ItemLevel, demoChars[2]),
  ];
}

/**
 * Stage 1 TUTORIAL sell requests — special bootstrap for the onboarding
 * flow only. The player taps the burger producer (per tutorial step 1.2),
 * gets 4× T1 קמח, drags two together = T2 בצק. They then need to fulfil
 * a sale to complete step 1.5 — but per Excel spec T1-T3 are normally
 * board-only. This generator is the documented exception: a one-shot
 * T2-level set of requests at a fixed ₪10 each. Once the player completes
 * the first sale, replacements come from `generateSingleRequest` which
 * respects MIN_SELLABLE_TIER (= 3) and gives the player the spec economy.
 *
 * Three requests, one per chain, so the tutorial works regardless of
 * which producer the player taps if they explore.
 */
export const STAGE1_TUTORIAL_REWARD = 10;

export function generateInitialTutorialSellRequests(): SellRequest[] {
  const id = () => `sell_${Date.now()}_${sellRequestIdCounter++}`;
  const tutChars: Character[] = [CHARACTERS[0], CHARACTERS[1], CHARACTERS[2]];

  const makeTutorialRequest = (chain: ChainId, char: Character): SellRequest => {
    const item = makeSellItem(chain, 2 as ItemLevel);
    return {
      id: id(),
      type: 'single',
      label: TYPE_LABELS.single,
      items: [item],
      rewardType: 'coins',
      rewardAmount: STAGE1_TUTORIAL_REWARD,
      rewardLabel: REWARD_LABELS.coins,
      rewardEmoji: REWARD_EMOJIS.coins,
      characterEmoji: char.emoji,
      characterName: char.name,
      characterId: char.id,
      bonusMultiplier: SELL_MULTIPLIER_SINGLE,
    };
  };

  return [
    makeTutorialRequest('burger', tutChars[0]),  // primary tutorial path (T2 בצק)
    makeTutorialRequest('sushi',  tutChars[1]),  // backup if player taps sushi spawner
    makeTutorialRequest('art',    tutChars[2]),  // backup if player taps art spawner
  ];
}

// Legacy compat — kept so old persisted data doesn't crash
export function generateOrder(): { id: string; requiredChain: ChainId; requiredLevel: ItemLevel; coinReward: number; characterEmoji: string; characterName: string; itemEmoji: string } {
  const r = generateSingleRequest(false, new Set<CharId>());
  return {
    id: r.id,
    requiredChain: r.items[0].chain,
    requiredLevel: r.items[0].level,
    coinReward: r.rewardAmount,
    characterEmoji: r.characterEmoji,
    characterName: r.characterName,
    itemEmoji: r.items[0].emoji,
  };
}

export function generateInitialOrders() {
  return generateInitialSellRequests().map((r) => ({
    id: r.id,
    requiredChain: r.items[0].chain,
    requiredLevel: r.items[0].level,
    coinReward: r.rewardAmount,
    characterEmoji: r.characterEmoji,
    characterName: r.characterName,
    itemEmoji: r.items[0].emoji,
  }));
}
