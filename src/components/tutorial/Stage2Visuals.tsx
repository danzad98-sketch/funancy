'use client';

import { t } from '@/data/strings';

/**
 * Stage 2 educational visuals (PRD User flow part 2).
 *
 *   1. InterestHedgeCompare — step 2.4 screen B
 *      Two horizontal bars: "🔴 inflation ↑ X%" vs "🟢 interest ↑ Y%"
 *      The bars animate from 0 width to their target widths.
 *
 *   2. CompoundGraph — step 2.6 screen B
 *      Animated year-by-year graph: a straight line for simple interest
 *      and an accelerating curve for compound interest. Both lines draw
 *      themselves left-to-right via stroke-dasharray.
 *
 *  Both screens take `onContinue` and render their own "הבא" button.
 */

interface ScreenProps {
  onContinue: () => void;
}

export function InterestHedgeCompare({ onContinue }: ScreenProps) {
  // Numbers come from the established time-scale: 1% inflation per year vs
  // ~2% deposit interest per year. The bars are sized proportionally.
  const inflationPct = 1;
  const interestPct = 2;
  return (
    <div className="inflation-screen" role="dialog" aria-modal="true">
      <div className="inflation-screen-inner">
        <div className="inflation-screen-caption">{t('interest_inflation_hedge')}</div>
        <div className="hedge-row">
          <div className="hedge-row-label">
            <span className="hedge-dot hedge-dot--red" aria-hidden /> אינפלציה
          </div>
          <div className="hedge-bar hedge-bar--track">
            <div
              className="hedge-bar-fill hedge-bar-fill--inflation"
              style={{ ['--pct' as string]: `${inflationPct * 30}%` } as React.CSSProperties}
            />
          </div>
          <div className="hedge-bar-value hedge-value--red">+{inflationPct}%</div>
        </div>
        <div className="hedge-row">
          <div className="hedge-row-label">
            <span className="hedge-dot hedge-dot--green" aria-hidden /> ריבית
          </div>
          <div className="hedge-bar hedge-bar--track">
            <div
              className="hedge-bar-fill hedge-bar-fill--interest"
              style={{ ['--pct' as string]: `${interestPct * 30}%` } as React.CSSProperties}
            />
          </div>
          <div className="hedge-bar-value hedge-value--green">+{interestPct}%</div>
        </div>
        <div className="hedge-conclusion">
          ריבית &gt; אינפלציה — הכסף שלך שומר על ערכו
          <span className="hedge-conclusion-mark" aria-hidden>✓</span>
        </div>
        <button type="button" className="tut-popup-btn" onClick={onContinue}>
          הבא
        </button>
      </div>
    </div>
  );
}

export function CompoundGraph({ onContinue }: ScreenProps) {
  // Simple vs compound interest @ 2% over 8 years, displayed at fixed dimensions.
  // We compute the y-coordinates inline so it's deterministic.
  const years = 8;
  const principal = 100;
  const rate = 0.02;
  const W = 280;
  const H = 160;
  const padL = 28, padR = 8, padT = 12, padB = 24;
  const plotW = W - padL - padR;
  const plotH = H - padT - padB;
  // Compound endpoint is the max — scale y axis to that
  const maxCompound = principal * Math.pow(1 + rate, years);
  const maxY = Math.max(principal * (1 + rate * years), maxCompound);
  const xFor = (yr: number) => padL + (yr / years) * plotW;
  const yFor = (v: number) => padT + plotH - ((v - principal) / (maxY - principal)) * plotH;
  const simplePath = Array.from({ length: years + 1 }, (_, i) => {
    const v = principal * (1 + rate * i);
    return `${i === 0 ? 'M' : 'L'} ${xFor(i)} ${yFor(v)}`;
  }).join(' ');
  const compoundPath = Array.from({ length: years + 1 }, (_, i) => {
    const v = principal * Math.pow(1 + rate, i);
    return `${i === 0 ? 'M' : 'L'} ${xFor(i)} ${yFor(v)}`;
  }).join(' ');
  return (
    <div className="inflation-screen" role="dialog" aria-modal="true">
      <div className="inflation-screen-inner">
        <div className="inflation-screen-caption">{t('compound_visual')}</div>
        <svg
          className="compound-graph-svg"
          viewBox={`0 0 ${W} ${H}`}
          width={W}
          height={H}
          aria-hidden
        >
          {/* axes */}
          <line x1={padL} y1={padT} x2={padL} y2={padT + plotH} stroke="rgba(74,41,0,0.35)" strokeWidth="1" />
          <line x1={padL} y1={padT + plotH} x2={padL + plotW} y2={padT + plotH} stroke="rgba(74,41,0,0.35)" strokeWidth="1" />
          {/* year ticks */}
          {Array.from({ length: years + 1 }).map((_, i) => (
            <text
              key={i}
              x={xFor(i)}
              y={padT + plotH + 14}
              fill="rgba(74,41,0,0.72)"
              fontSize="10"
              textAnchor="middle"
            >
              {i}
            </text>
          ))}
          {/* simple — straight blue */}
          <path
            d={simplePath}
            fill="none"
            stroke="#2b7fd4"
            strokeWidth="2.5"
            strokeLinecap="round"
            className="compound-line compound-line--simple"
          />
          {/* compound — accelerating gold */}
          <path
            d={compoundPath}
            fill="none"
            stroke="#d97706"
            strokeWidth="3"
            strokeLinecap="round"
            className="compound-line compound-line--compound"
          />
        </svg>
        <div className="compound-legend">
          <span><span className="hedge-dot" style={{ background: '#2b7fd4' }} aria-hidden /> ריבית רגילה</span>
          <span><span className="hedge-dot" style={{ background: '#d97706' }} aria-hidden /> ריבית דריבית</span>
        </div>
        <button type="button" className="tut-popup-btn" onClick={onContinue}>
          הבא
        </button>
      </div>
    </div>
  );
}
