// Pure-logic simulation of the meta-goal purchase flow.
// Mirrors src/data/metaGoals.ts and the purchaseMetaItem reducer in
// src/stores/useGameStore.ts so we can verify: one tap = one price = one level.

const STAGE_1 = [
  { id: 'phone', kind: 'upgradeable', state: 'level_0', tiers: [
    { emoji: '📞', name: 'טלפון מקשים', price: 300 },
    { emoji: '📱', name: 'סמארטפון', price: 800 },
  ]},
  { id: 'watch', kind: 'upgradeable', state: 'level_0', tiers: [
    { emoji: '🕐', name: 'שעון רגיל', price: 200 },
    { emoji: '⌚', name: 'שעון חכם', price: 600 },
  ]},
  { id: 'earbuds', kind: 'upgradeable', state: 'level_0', tiers: [
    { emoji: '🎵', name: 'אוזניות חוטיות', price: 150 },
    { emoji: '🎧', name: 'אוזניות בלוטוס', price: 500 },
  ]},
];

const STAGE_2 = [
  { id: 'computer', kind: 'upgradeable', state: 'locked', tiers: [
    { emoji: '🖥️', name: 'מחשב נייח', price: 2000 },
    { emoji: '💻', name: 'מחשב נייד', price: 5000 },
  ]},
  { id: 'car', kind: 'upgradeable', state: 'locked', tiers: [
    { emoji: '🚗', name: 'רכב ישן', price: 5000 },
    { emoji: '🚙', name: 'רכב חדש', price: 15000 },
  ]},
  { id: 'studies', kind: 'purchase_only', state: 'locked', tiers: [
    { emoji: '🎓', name: 'לימודים', price: 8000 },
  ]},
];

function getCurrentLevel(item) {
  switch (item.state) {
    case 'locked': case 'level_0': return 0;
    case 'level_1': return 1;
    case 'level_2': return 2;
    case 'level_3': return 3;
    default: return 0;
  }
}
function getMaxLevel(item) { return item.tiers.length; }
function getNextPrice(item) {
  if (item.state === 'locked') return null;
  const l = getCurrentLevel(item);
  if (l >= getMaxLevel(item)) return null;
  return item.tiers[l].price;
}
function advance(item) {
  const next = { ...item, tiers: item.tiers.map(t => ({ ...t })) };
  const l = getCurrentLevel(item);
  if (item.state === 'locked' || l >= getMaxLevel(item)) return next;
  next.state = `level_${l + 1}`;
  return next;
}
function isItemComplete(item) { return getCurrentLevel(item) >= getMaxLevel(item); }

function checkStage1Complete(items) {
  const allAtLeast1 = items.every(i => getCurrentLevel(i) >= 1);
  const twoAt2 = items.filter(i => getCurrentLevel(i) >= 2).length >= 2;
  return allAtLeast1 && twoAt2;
}

let failures = 0;
function assert(cond, msg) {
  if (!cond) { console.log('FAIL:', msg); failures++; }
  else       { console.log('ok  :', msg); }
}

// --- Test 1: one tap = one tier price, no double-charge ---
console.log('\n# Test 1: exact-balance per step');
let coins = 1000;
let phone = { ...STAGE_1[0], tiers: STAGE_1[0].tiers.map(t => ({ ...t })) };

// Step A: buy tier 0 (300)
let p = getNextPrice(phone);
assert(p === 300, `price before first buy == 300 (got ${p})`);
coins -= p; phone = advance(phone);
assert(coins === 700, `balance after first buy == 700 (got ${coins})`);
assert(phone.state === 'level_1', `state after first buy == level_1 (got ${phone.state})`);

// Step B: buy tier 1 (800) — NOT enough coins, should report affordability off
p = getNextPrice(phone);
assert(p === 800, `price for second buy == 800 (got ${p})`);
assert(coins < p, `700 < 800 → cannot afford, UI should show 'חסרים 100'`);

// Give enough, then buy
coins = 800;
coins -= p; phone = advance(phone);
assert(coins === 0, `exact balance after second buy (got ${coins})`);
assert(phone.state === 'level_2', `state after second buy == level_2 (got ${phone.state})`);
assert(isItemComplete(phone), 'phone chain fully complete');
assert(getNextPrice(phone) === null, 'no further price — no hidden upgrade fee');

// --- Test 2: rapid-tap protection (reducer-level: second call must no-op on insufficient funds) ---
console.log('\n# Test 2: rapid-tap semantics at reducer level');
let rc = 300;
let w = { ...STAGE_1[1], tiers: STAGE_1[1].tiers.map(t => ({ ...t })) }; // watch, 200/600
// Tap 1
let pr = getNextPrice(w);
if (rc >= pr) { rc -= pr; w = advance(w); }
// Tap 2 (same frame) — next price is 600, can't afford, reducer rejects
pr = getNextPrice(w);
const canAfford = rc >= pr;
assert(!canAfford, `second rapid tap rejected by funds check (need ${pr}, have ${rc})`);
assert(rc === 100, `wallet holds exactly 100 after one buy (got ${rc})`);
assert(w.state === 'level_1', `watch advanced exactly one level (got ${w.state})`);

// --- Test 3: Stage 2 unlocks with new level-based rule ---
console.log('\n# Test 3: Stage 1 → 2 unlock via level rule');
const items = STAGE_1.map(i => ({ ...i, tiers: i.tiers.map(t => ({ ...t })) }));
// phone tier0 only
items[0] = advance(items[0]);
// watch tier0+tier1
items[1] = advance(advance(items[1]));
// earbuds tier0+tier1
items[2] = advance(advance(items[2]));
assert(checkStage1Complete(items),
  'Stage1 complete: all≥L1 and ≥2 at L2 (phone=L1, watch=L2, earbuds=L2)');

// Counter-example: only 1 at L2
const items2 = STAGE_1.map(i => ({ ...i, tiers: i.tiers.map(t => ({ ...t })) }));
items2[0] = advance(items2[0]);
items2[1] = advance(items2[1]);
items2[2] = advance(advance(items2[2]));
assert(!checkStage1Complete(items2),
  'Stage1 NOT complete when only 1 item at L2');

console.log(`\n${failures === 0 ? 'ALL PASS' : failures + ' FAIL(S)'}`);
process.exit(failures === 0 ? 0 : 1);
