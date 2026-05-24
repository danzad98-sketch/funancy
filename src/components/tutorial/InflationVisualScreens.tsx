'use client';

import { t } from '@/data/strings';

/**
 * Two full-screen educational visuals for the Stage 1 inflation
 * explanation (PRD page 2):
 *
 *   1. MilkCartonScreen — 3 milk cartons (2021/2023/2025) with
 *      prices 5.94 / 6.81 / 7.28 animating upward.
 *   2. BasketScreen — 3 grocery baskets (2005/2015/2025) showing
 *      the same 100₪ buying progressively fewer items.
 *
 * Both are pure CSS + emoji — no asset dependencies. Each takes an
 * `onContinue` prop wired to the Stage 1 step advance.
 */

interface ScreenProps {
  onContinue: () => void;
}

export function MilkCartonScreen({ onContinue }: ScreenProps) {
  const items = [
    { year: 2021, price: 5.94, delay: 0 },
    { year: 2023, price: 6.81, delay: 140 },
    { year: 2025, price: 7.28, delay: 280 },
  ];
  return (
    <div className="inflation-screen" role="dialog" aria-modal="true">
      <div className="inflation-screen-inner">
        <div className="inflation-screen-caption">{t('inflection_milk')}</div>
        <div className="inflation-milk-row">
          {items.map((it, idx) => {
            const delta = idx > 0 ? it.price - items[0].price : 0;
            return (
              <div
                key={it.year}
                className="inflation-milk-col"
                style={{ animationDelay: `${it.delay}ms` }}
              >
                <div className="inflation-year">{it.year}</div>
                <div className="inflation-carton" aria-hidden>
                  {/* Clean milk carton — gold spout, cream body, gold band. */}
                  <div className="inflation-carton-top" />
                  <div className="inflation-carton-body" />
                </div>
                <div
                  className={`inflation-price ${idx > 0 ? 'inflation-price-rise' : ''}`}
                  style={{ animationDelay: `${it.delay + 220}ms` }}
                >
                  ₪{it.price.toFixed(2)}
                </div>
                {idx > 0 && (
                  <div
                    className="inflation-delta"
                    style={{ animationDelay: `${it.delay + 480}ms` }}
                    aria-label={`עלייה של ${delta.toFixed(2)} שקלים`}
                  >
                    <span aria-hidden>↑</span>+₪{delta.toFixed(2)}
                  </div>
                )}
              </div>
            );
          })}
        </div>
        <button type="button" className="tut-popup-btn" onClick={onContinue}>
          המשך
        </button>
      </div>
    </div>
  );
}

export function BasketScreen({ onContinue }: ScreenProps) {
  // 100₪ buys progressively less. Labelled rows make the shrinking visible.
  const items: Array<{ emoji: string; label: string }> = [
    { emoji: '🍞', label: 'לחם' },
    { emoji: '🥛', label: 'חלב' },
    { emoji: '🧀', label: 'גבינה' },
    { emoji: '🥚', label: 'ביצים' },
    { emoji: '🥕', label: 'ירקות' },
  ];
  const baskets = [
    { year: 2005, count: 5, delay: 0 },
    { year: 2015, count: 3, delay: 200 },
    { year: 2025, count: 2, delay: 400 },
  ];
  const baseCount = baskets[0].count;
  return (
    <div className="inflation-screen" role="dialog" aria-modal="true">
      <div className="inflation-screen-inner">
        <div className="inflation-screen-caption">{t('inflection_basket')}</div>
        <div className="basket-grid">
          {baskets.map((b, bi) => {
            const lost = baseCount - b.count;
            return (
              <div
                key={b.year}
                className="basket-grid-col"
                style={{ animationDelay: `${b.delay}ms` }}
              >
                <div className="basket-grid-year">{b.year}</div>
                <div className="basket-grid-price">₪100</div>
                <div className="basket-grid-card" aria-hidden>
                  {items.slice(0, b.count).map((it, i) => (
                    <div key={i} className="basket-grid-row">
                      <span className="basket-grid-row-emoji">{it.emoji}</span>
                      <span className="basket-grid-row-label">{it.label}</span>
                    </div>
                  ))}
                  {/* Missing items rendered as ghost rows so the shrinkage shows. */}
                  {items.slice(b.count).map((it, i) => (
                    <div key={`g${i}`} className="basket-grid-row basket-grid-row--ghost">
                      <span className="basket-grid-row-emoji">{it.emoji}</span>
                      <span className="basket-grid-row-label">{it.label}</span>
                    </div>
                  ))}
                </div>
                <div className="basket-grid-count">{b.count} פריטים</div>
                {bi > 0 && lost > 0 && (
                  <div
                    className="basket-grid-lost"
                    aria-label={`אבדו ${lost} פריטים`}
                  >
                    <span aria-hidden>↓</span>אבדו {lost}
                  </div>
                )}
              </div>
            );
          })}
        </div>
        <button type="button" className="tut-popup-btn" onClick={onContinue}>
          המשך
        </button>
      </div>
    </div>
  );
}
