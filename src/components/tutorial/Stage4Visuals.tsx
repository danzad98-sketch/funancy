'use client';

import { useEffect, useState } from 'react';
import { useGameStore } from '@/stores/useGameStore';
import { t } from '@/data/strings';

/**
 * Stage 4 educational visuals (PRD "User flow part 4").
 *
 *   1. StockPiecesScreen   — "what is a stock"   (Screen A, intro_stock)
 *   2. IndexBasketScreen   — "what is an index"  (Screen B, intro_index)
 *   3. SP500LogosScreen    — "what is S&P 500"   (Screen C, intro_sp500)
 *   4. SP500GrowthGraph    — 4.2 result          (random bimodal series)
 *   5. SP500VolatilityGraph — 4.3 lesson         (scripted drop-and-recovery)
 *   6. RiskSpectrumScreen  — 4.4 comparison      (Deposit / MM / S&P)
 *
 * All consume their popup caption via t(textCode) so the central strings
 * file remains the single source of truth for Excel edits.
 */

interface ScreenProps {
  onContinue: () => void;
}

// ---------------- Screen A — Stock pieces ----------------
export function StockPiecesScreen({ onContinue }: ScreenProps) {
  // Pie sliced into 5 wedges around a company emoji.
  const pieces = 5;
  const cx = 100, cy = 100, r = 70;
  const wedgeColors = ['#ffd840', '#ffb938', '#ff9a1f', '#ff7a4a', '#ff4a3a'];

  return (
    <div className="inflation-screen" role="dialog" aria-modal="true">
      <div className="inflation-screen-inner">
        <div className="inflation-screen-caption">{t('intro_stock')}</div>
        <svg viewBox="0 0 200 200" width="200" height="200" aria-hidden
             className="stock-pieces-svg">
          {Array.from({ length: pieces }).map((_, i) => {
            const a0 = (i / pieces) * Math.PI * 2 - Math.PI / 2;
            const a1 = ((i + 1) / pieces) * Math.PI * 2 - Math.PI / 2;
            const x0 = cx + r * Math.cos(a0), y0 = cy + r * Math.sin(a0);
            const x1 = cx + r * Math.cos(a1), y1 = cy + r * Math.sin(a1);
            const d = `M ${cx} ${cy} L ${x0} ${y0} A ${r} ${r} 0 0 1 ${x1} ${y1} Z`;
            return (
              <path key={i} d={d}
                    fill={wedgeColors[i]} stroke="#fff8ed" strokeWidth="2"
                    className="stock-piece" style={{ animationDelay: `${i * 80}ms` }} />
            );
          })}
          <text x={cx} y={cy + 8} fontSize="32" textAnchor="middle">🏢</text>
        </svg>
        <div className="stock-pieces-caption">חברה אחת = {pieces} פיסות בעלות</div>
        <button type="button" className="tut-popup-btn" onClick={onContinue}>הבא</button>
      </div>
    </div>
  );
}

// ---------------- Screen B — Index basket ----------------
export function IndexBasketScreen({ onContinue }: ScreenProps) {
  // 10 mixed company emojis "inside the basket".
  const items = ['🏢', '🚗', '✈️', '🏭', '🏬', '💊', '📱', '🍔', '⛽', '🎬'];
  return (
    <div className="inflation-screen" role="dialog" aria-modal="true">
      <div className="inflation-screen-inner">
        <div className="inflation-screen-caption">{t('intro_index')}</div>
        <div className="index-basket">
          <div className="index-basket-handle">🧺</div>
          <div className="index-basket-grid">
            {items.map((emoji, i) => (
              <div key={i} className="index-basket-cell"
                   style={{ animationDelay: `${i * 60}ms` }}>
                {emoji}
              </div>
            ))}
          </div>
        </div>
        <button type="button" className="tut-popup-btn" onClick={onContinue}>הבא</button>
      </div>
    </div>
  );
}

// ---------------- Screen C — S&P 500 logos ----------------
export function SP500LogosScreen({ onContinue }: ScreenProps) {
  const companies = [
    { emoji: '🍎', name: 'Apple' },
    { emoji: '🔍', name: 'Google' },
    { emoji: '📦', name: 'Amazon' },
    { emoji: '🎬', name: 'Disney' },
    { emoji: '⚡', name: 'Tesla' },
    { emoji: '☕', name: 'Starbucks' },
  ];
  return (
    <div className="inflation-screen" role="dialog" aria-modal="true">
      <div className="inflation-screen-inner">
        <div className="sp500-title">📈 S&P 500</div>
        <div className="inflation-screen-caption">{t('intro_sp500')}</div>
        <div className="sp500-grid">
          {companies.map((c, i) => (
            <div key={c.name} className="sp500-logo-tile"
                 style={{ animationDelay: `${i * 70}ms` }}>
              <div className="sp500-logo-emoji">{c.emoji}</div>
              <div className="sp500-logo-name">{c.name}</div>
            </div>
          ))}
        </div>
        <div className="sp500-and-more">…ועוד 494 חברות</div>
        <button type="button" className="tut-popup-btn" onClick={onContinue}>
          {t('btn_invest')}
        </button>
      </div>
    </div>
  );
}

// ---------------- 4.2 / 4.3 — Path graph (shared) ----------------
function SP500PathGraph(props: {
  variant: 'growth' | 'volatility';
  path: number[];
  onContinue: () => void;
}) {
  const { path, onContinue, variant } = props;
  // Safety: if path empty (shouldn't happen post-booster), render a flat dot.
  const data = path.length > 1 ? path : [100, 100];

  const W = 320, H = 180;
  const padL = 32, padR = 12, padT = 16, padB = 28;
  const plotW = W - padL - padR;
  const plotH = H - padT - padB;
  const minY = Math.min(...data);
  const maxY = Math.max(...data);
  const yRange = Math.max(1, maxY - minY);
  // Pad y-range slightly so the line doesn't touch the axes.
  const yPad = yRange * 0.08;
  const yLo = minY - yPad, yHi = maxY + yPad;

  const xFor = (i: number) => padL + (i / (data.length - 1)) * plotW;
  const yFor = (v: number) => padT + plotH - ((v - yLo) / (yHi - yLo)) * plotH;

  const d = data
    .map((v, i) => `${i === 0 ? 'M' : 'L'} ${xFor(i)} ${yFor(v)}`)
    .join(' ');

  const startBal = data[0];
  const endBal   = data[data.length - 1];
  const growthPct = startBal > 0
    ? Math.round(((endBal - startBal) / startBal) * 100)
    : 0;
  const isPositive = endBal >= startBal;

  // 4.2 result popup interpolates the realized [GROWTH] %.
  const captionCode = variant === 'growth' ? 'result_growth_sp500' : 'lesson_volatility';
  const captionRaw = t(captionCode).replaceAll('[GROWTH]', String(growthPct));

  // y-axis ticks
  const ticks = 3;
  const tickValues = Array.from({ length: ticks + 1 }, (_, i) =>
    yLo + ((yHi - yLo) * i) / ticks,
  );

  // Mid-trough marker for the volatility variant — highlight the lowest point.
  const troughIdx = data.indexOf(Math.min(...data));
  const showTrough = variant === 'volatility' && troughIdx > 0;

  return (
    <div className="inflation-screen" role="dialog" aria-modal="true">
      <div className="inflation-screen-inner">
        <div className="inflation-screen-caption" style={{ whiteSpace: 'pre-line' }}>
          {captionRaw}
        </div>
        <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H} aria-hidden
             className="sp500-graph-svg">
          {/* axes */}
          <line x1={padL} y1={padT} x2={padL} y2={padT + plotH}
                stroke="rgba(255,200,80,0.4)" strokeWidth="1" />
          <line x1={padL} y1={padT + plotH} x2={padL + plotW} y2={padT + plotH}
                stroke="rgba(255,200,80,0.4)" strokeWidth="1" />
          {/* y-axis labels */}
          {tickValues.map((v, i) => (
            <text key={i} x={padL - 6} y={yFor(v) + 3}
                  fill="rgba(255, 220, 160, 0.7)" fontSize="9" textAnchor="end">
              {Math.round(v)}
            </text>
          ))}
          {/* horizontal start-balance reference line */}
          <line x1={padL} y1={yFor(startBal)} x2={padL + plotW} y2={yFor(startBal)}
                stroke="rgba(255,255,255,0.15)" strokeWidth="1" strokeDasharray="4 4" />
          {/* path */}
          <path
            d={d}
            fill="none"
            stroke={isPositive ? '#4ade80' : '#ff5a4a'}
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="sp500-graph-line"
          />
          {/* trough marker (volatility lesson only) */}
          {showTrough && (
            <>
              <circle cx={xFor(troughIdx)} cy={yFor(data[troughIdx])} r="5"
                      fill="#ff5a4a" stroke="#fff8ed" strokeWidth="2" />
              <text x={xFor(troughIdx)} y={yFor(data[troughIdx]) + 18}
                    fill="#ff7a4a" fontSize="10" fontWeight="900" textAnchor="middle">
                ירידה
              </text>
            </>
          )}
          {/* end-point marker */}
          <circle cx={xFor(data.length - 1)} cy={yFor(endBal)} r="6"
                  fill={isPositive ? '#4ade80' : '#ff5a4a'} stroke="#fff8ed" strokeWidth="2" />
          <text x={xFor(data.length - 1) - 8} y={yFor(endBal) - 10}
                fill="#fff8ed" fontSize="11" fontWeight="900" textAnchor="end">
            {Math.round(endBal)}
          </text>
        </svg>
        <div className="sp500-graph-stats">
          <span>התחלה: {Math.round(startBal)}</span>
          <span className={isPositive ? 'sp500-stat-up' : 'sp500-stat-down'}>
            {isPositive ? '↑' : '↓'} {Math.abs(growthPct)}%
          </span>
          <span>סוף: {Math.round(endBal)}</span>
        </div>
        <button type="button" className="tut-popup-btn" onClick={onContinue}>הבא</button>
      </div>
    </div>
  );
}

/** Self-fetches the most recent S&P 500 booster path from the store. */
export function SP500GrowthGraph({ onContinue }: ScreenProps) {
  const path = useGameStore((s) => s.s4LastSP500Path);
  return <SP500PathGraph variant="growth" path={path ?? []} onContinue={onContinue} />;
}
export function SP500VolatilityGraph({ onContinue }: ScreenProps) {
  const path = useGameStore((s) => s.s4LastSP500Path);
  return <SP500PathGraph variant="volatility" path={path ?? []} onContinue={onContinue} />;
}

// ---------------- 4.4 — Risk spectrum ----------------
export function RiskSpectrumScreen({ onContinue }: ScreenProps) {
  // Stagger the row entrance animations.
  const [ready, setReady] = useState(false);
  useEffect(() => { setReady(true); }, []);
  void ready;

  const rows = [
    {
      id: 'deposit',
      emoji: '🏛️',
      label: 'spectrum_risk_deposit_label',
      risk: 'spectrum_risk_deposit_risk',
      ret:  'spectrum_risk_deposit_return',
      use:  'spectrum_risk_deposit_use',
      riskFill: '20%',
      color: '#4ade80',
    },
    // Money Market row removed per partner-review feedback — only the
    // 2 instruments that exist in the intro journey: Deposit + S&P 500.
    {
      id: 'sp500',
      emoji: '📈',
      label: 'spectrum_risk_sp500_label',
      risk: 'spectrum_risk_sp500_risk',
      ret:  'spectrum_risk_sp500_return',
      use:  'spectrum_risk_sp500_use',
      riskFill: '75%',
      color: '#ff7a4a',
    },
  ];

  return (
    <div className="inflation-screen" role="dialog" aria-modal="true">
      <div className="inflation-screen-inner">
        <div className="inflation-screen-caption">{t('spectrum_risk')}</div>

        <div className="risk-spectrum-list">
          {rows.map((row, i) => (
            <div key={row.id} className="risk-row" style={{ animationDelay: `${i * 120}ms` }}>
              <div className="risk-row-head">
                <span className="risk-row-emoji">{row.emoji}</span>
                <span className="risk-row-label">{t(row.label)}</span>
              </div>
              <div className="risk-row-meter">
                <div className="risk-row-meter-fill"
                     style={{ width: row.riskFill, background: row.color }} />
              </div>
              <div className="risk-row-meta">
                <span>{t(row.risk)}</span>
                <span>•</span>
                <span>{t(row.ret)}</span>
              </div>
              <div className="risk-row-use">
                <strong>מתאים ל:</strong> {t(row.use)}
              </div>
            </div>
          ))}
        </div>

        <button type="button" className="tut-popup-btn" onClick={onContinue}>
          {t('spectrum_risk_btn')}
        </button>
      </div>
    </div>
  );
}
