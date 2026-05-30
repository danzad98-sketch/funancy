'use client';

import { useEffect, useState } from 'react';
import { useGameStore } from '@/stores/useGameStore';
import {
  STAGE5_CAMERA_COST,
  STAGE5_CAMERA_TIMER_MS,
  STAGE5_PROVIDENT_BONUS,
  STAGE5_PROVIDENT_LOCK,
} from '@/data/stage5Steps';
import { t } from '@/data/strings';

/**
 * Stage 5 educational visuals + interactive surfaces (PRD user-flow 5).
 *
 *   1. ProvidentIntroScreen     — 5.1 Screen A (3-bar comparison)
 *   2. ProvidentLockScreen      — 5.1 Screen B (lock + counter)
 *   3. ProvidentBonusScreen     — 5.1 Screen C (coins falling, +10% bonus)
 *   4. AllocationToolbar        — 5.2 non-blocking sticky bar
 *   5. ThreeInstrumentsGrowth   — 5.3 result (3 mini-lines in parallel)
 *   6. CameraEventScreen        — forced liquidity moment on /goals
 *   7. ProvidentUnlockScreen    — 5.4 unlock animation
 *   8. LessonTimeframe1Screen   — 5.4 Screen A
 *   9. LessonTimeframe2Screen   — 5.4 Screen B (horizon → tool)
 */

interface ScreenProps {
  onContinue: () => void;
}

// ---------------- 5.1 A — Provident intro: 3 instruments after 5 years ----------------
export function ProvidentIntroScreen({ onContinue }: ScreenProps) {
  // Comparison: $100 → after 5 years
  // Deposit @ 2% → 110, S&P 500 ~10%/yr avg ≈ 161, Provident @ 4%/yr + 10% bonus = 134
  const rows = [
    { label: '🏦 פיקדון',    after: 110, color: '#4ade80', barPct: 110 / 161 },
    { label: '📈 S&P 500',   after: 161, color: '#ff9a1f', barPct: 1.0 },
    { label: '🔒 קופת גמל',  after: 134, color: '#a78bfa', barPct: 134 / 161 },
  ];
  return (
    <div className="inflation-screen" role="dialog" aria-modal="true">
      <div className="inflation-screen-inner">
        <div className="inflation-screen-caption">{t('intro_provident')}</div>
        <div className="provident-compare-caption">100 ₪ אחרי 5 שנים</div>
        <div className="provident-compare">
          {rows.map((r, i) => (
            <div key={r.label} className="provident-compare-row"
                 style={{ animationDelay: `${i * 140}ms` }}>
              <div className="provident-compare-label">{r.label}</div>
              <div className="provident-compare-bar">
                <div
                  className="provident-compare-bar-fill"
                  style={{
                    background: r.color,
                    ['--target-w' as string]: `${r.barPct * 100}%`,
                  } as React.CSSProperties}
                />
              </div>
              <div className="provident-compare-value" style={{ color: r.color }}>
                {r.after} ₪
              </div>
            </div>
          ))}
        </div>
        <button type="button" className="tut-popup-btn" onClick={onContinue}>הבא</button>
      </div>
    </div>
  );
}

// ---------------- 5.1 B — Lock visual ----------------
export function ProvidentLockScreen({ onContinue }: ScreenProps) {
  return (
    <div className="inflation-screen" role="dialog" aria-modal="true">
      <div className="inflation-screen-inner">
        <div className="inflation-screen-caption">{t('lock_provident')}</div>
        <div className="provident-lock-stage">
          <div className="provident-lock-coin" aria-hidden>🪙</div>
          <div className="provident-lock-icon" aria-hidden>🔒</div>
          <div className="provident-lock-counter">{STAGE5_PROVIDENT_LOCK} ⏳</div>
        </div>
        <button type="button" className="tut-popup-btn" onClick={onContinue}>הבא</button>
      </div>
    </div>
  );
}

// ---------------- 5.1 C — Bonus animation ----------------
export function ProvidentBonusScreen({ onContinue }: ScreenProps) {
  return (
    <div className="inflation-screen" role="dialog" aria-modal="true">
      <div className="inflation-screen-inner">
        <div className="inflation-screen-caption">{t('bonus_provident')}</div>
        <div className="provident-bonus-stage" aria-hidden>
          {/* falling bonus coins (decorative) */}
          <span className="provident-bonus-coin coin-a">🪙</span>
          <span className="provident-bonus-coin coin-b">🪙</span>
          <span className="provident-bonus-coin coin-c">🪙</span>
          <span className="provident-bonus-coin coin-d">🪙</span>
          <span className="provident-bonus-coin coin-e">🪙</span>
          <div className="provident-bonus-base">
            <span className="provident-bonus-jar">🏛️</span>
            <div className="provident-bonus-label">
              +{Math.round(STAGE5_PROVIDENT_BONUS * 100)}%
            </div>
          </div>
        </div>
        <button type="button" className="tut-popup-btn" onClick={onContinue}>
          {t('btn_invest')}
        </button>
      </div>
    </div>
  );
}

// ---------------- 5.2 — Non-blocking allocation toolbar ----------------
export function AllocationToolbar({ onContinue }: ScreenProps) {
  // Sticky top tooltip: text + live wallet + Continue. Player interacts
  // with the existing AccountCard deposit/withdraw controls underneath.
  // Per partner-review: the Continue button is locked until the player
  // has deposited at least ₪10 into at least 2 of the 3 instruments.
  // (Loose `> 0` check would pass on a ₪1 token deposit — looks sloppy.)
  const MIN_PER_INSTRUMENT = 10;
  const coins    = useGameStore((s) => s.coins);
  const deposit  = useGameStore((s) => s.accounts?.deposit?.balance ?? 0);
  const sp500    = useGameStore((s) => s.accounts?.single_stock?.balance ?? 0);
  const provid   = useGameStore((s) => s.accounts?.provident?.balance ?? 0);
  const instrumentsUsed =
    (deposit >= MIN_PER_INSTRUMENT ? 1 : 0) +
    (sp500   >= MIN_PER_INSTRUMENT ? 1 : 0) +
    (provid  >= MIN_PER_INSTRUMENT ? 1 : 0);
  const canContinue = instrumentsUsed >= 2;
  return (
    <div className="allocation-toolbar" role="status" aria-live="polite">
      <div className="allocation-toolbar-text">
        {t('decision_allocation')}
        <span className="allocation-toolbar-balance">
          <span className="mk-icon mk-icon-coin mk-icon--xs" aria-hidden />
          {coins.toLocaleString()}
        </span>
      </div>
      {!canContinue && (
        <div className="allocation-toolbar-hint">{t('decision_allocation_hint')}</div>
      )}
      <button
        type="button"
        className={`tut-popup-btn allocation-toolbar-btn ${!canContinue ? 'tut-popup-btn--locked' : ''}`}
        onClick={canContinue ? onContinue : undefined}
        disabled={!canContinue}
      >
        {t('decision_allocation_btn')}
      </button>
    </div>
  );
}

// ---------------- 5.3 — Three instruments parallel growth (line graph) ----------------
export function ThreeInstrumentsGrowth({ onContinue }: ScreenProps) {
  // Per partner-review: replace bars with an SVG line graph that shows
  // how each instrument grew OVER TIME. 12 sample points across the stage.
  // Lines:
  //   - Deposit (green): straight line, gentle upward slope (4%/yr-ish)
  //   - S&P 500 (orange): bumpy line ending well above start
  //   - Provident (purple): step-up jumps (bonus on each deposit + interest)
  const accounts = useGameStore((s) => s.accounts);
  const dep  = accounts.deposit?.balance      ?? 0;
  const sp   = accounts.single_stock?.balance ?? 0;
  const prov = accounts.provident?.balance    ?? 0;

  const W = 320, H = 200;
  const padL = 36, padR = 14, padT = 18, padB = 28;
  const plotW = W - padL - padR;
  const plotH = H - padT - padB;
  const samples = 12;
  // Series — all start at base 100, end at scaled-relative values.
  const base = 100;
  const depEnd  = Math.max(105, base * Math.max(1, dep  / Math.max(1, dep  + sp + prov) * 1.6));
  const spEnd   = Math.max(125, base * Math.max(1, sp   / Math.max(1, dep  + sp + prov) * 2.1));
  const provEnd = Math.max(160, base * Math.max(1, prov / Math.max(1, dep  + sp + prov) * 2.5));
  const yMax = Math.max(depEnd, spEnd, provEnd) * 1.05;
  const xFor = (i: number) => padL + (i / (samples - 1)) * plotW;
  const yFor = (v: number) => padT + plotH - ((v - 80) / (yMax - 80)) * plotH;

  // Deterministic shapes per spec.
  const depSeries: number[] = Array.from({ length: samples }, (_, i) =>
    base + (depEnd - base) * (i / (samples - 1)),
  );
  const spSeries: number[] = Array.from({ length: samples }, (_, i) => {
    const t = i / (samples - 1);
    const trend = base + (spEnd - base) * t;
    const wiggle = Math.sin(i * 1.7) * 6 + Math.cos(i * 3.1) * 4;
    return trend + wiggle;
  });
  const provSeries: number[] = Array.from({ length: samples }, (_, i) => {
    // Step jumps every 3 samples
    const step = Math.floor(i / 3);
    const stepHeight = (provEnd - base) / Math.ceil(samples / 3);
    return base + step * stepHeight + (i % 3) * (stepHeight * 0.1);
  });

  const toPath = (series: number[]) =>
    series.map((v, i) => `${i === 0 ? 'M' : 'L'} ${xFor(i)} ${yFor(v)}`).join(' ');

  return (
    <div className="inflation-screen" role="dialog" aria-modal="true">
      <div className="inflation-screen-inner">
        <div className="inflation-screen-caption">{t('lesson_growth_three')}</div>
        <svg
          viewBox={`0 0 ${W} ${H}`}
          width={W}
          height={H}
          className="three-growth-svg"
          aria-hidden
        >
          {/* axes */}
          <line x1={padL} y1={padT} x2={padL} y2={padT + plotH}
                stroke="rgba(255,200,80,0.4)" strokeWidth="1" />
          <line x1={padL} y1={padT + plotH} x2={padL + plotW} y2={padT + plotH}
                stroke="rgba(255,200,80,0.4)" strokeWidth="1" />
          {/* lines */}
          <path d={toPath(depSeries)}  fill="none" stroke="#4ade80" strokeWidth="2.5"
                strokeLinecap="round" strokeLinejoin="round" className="three-growth-line three-growth-line--a" />
          <path d={toPath(spSeries)}   fill="none" stroke="#ff9a1f" strokeWidth="2.5"
                strokeLinecap="round" strokeLinejoin="round" className="three-growth-line three-growth-line--b" />
          <path d={toPath(provSeries)} fill="none" stroke="#a78bfa" strokeWidth="2.5"
                strokeLinecap="round" strokeLinejoin="round" className="three-growth-line three-growth-line--c" />
          {/* legend dots */}
          <circle cx={xFor(samples - 1)} cy={yFor(depSeries[samples - 1])}  r="4" fill="#4ade80" />
          <circle cx={xFor(samples - 1)} cy={yFor(spSeries[samples - 1])}   r="4" fill="#ff9a1f" />
          <circle cx={xFor(samples - 1)} cy={yFor(provSeries[samples - 1])} r="4" fill="#a78bfa" />
        </svg>
        <div className="three-growth-legend">
          <span><span className="hedge-dot" style={{ background: '#4ade80' }} aria-hidden /> 🏦 פיקדון</span>
          <span><span className="hedge-dot" style={{ background: '#ff9a1f' }} aria-hidden /> 📈 S&P 500</span>
          <span><span className="hedge-dot" style={{ background: '#a78bfa' }} aria-hidden /> 🔒 קופת גמל</span>
        </div>
        <button type="button" className="tut-popup-btn" onClick={onContinue}>
          {t('lesson_growth_three_btn')}
        </button>
      </div>
    </div>
  );
}

// ---------------- Camera event (broken-camera popup on /goals) ----------------
export function CameraEventScreen(props: { onResolved: () => void }) {
  const startedAt        = useGameStore((s) => s.s5CameraStartedAt);
  const startCameraTimer = useGameStore((s) => s.startCameraTimer);
  const resolveCamera    = useGameStore((s) => s.resolveCameraEvent);
  const withdrawLiquid   = useGameStore((s) => s.withdrawLiquid);
  const coins            = useGameStore((s) => s.coins);
  const accounts         = useGameStore((s) => s.accounts);

  // Start the timer on first mount.
  useEffect(() => { startCameraTimer(); }, [startCameraTimer]);

  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 250);
    return () => window.clearInterval(id);
  }, []);

  const elapsed = startedAt ? now - startedAt : 0;
  const remaining = Math.max(0, STAGE5_CAMERA_TIMER_MS - elapsed);

  // Liquid bucket excludes provident (locked).
  const liquid =
    coins +
    (accounts.checking?.balance     ?? 0) +
    (accounts.deposit?.balance      ?? 0) +
    (accounts.index_fund?.balance   ?? 0) +
    (accounts.single_stock?.balance ?? 0);

  const canAfford = liquid >= STAGE5_CAMERA_COST;

  // Auto-resolve to BROKEN when the timer hits zero.
  useEffect(() => {
    if (remaining <= 0 && startedAt != null) {
      resolveCamera('broken');
      props.onResolved();
    }
  }, [remaining, startedAt, resolveCamera, props]);

  const handlePay = () => {
    const ok = withdrawLiquid(STAGE5_CAMERA_COST);
    resolveCamera(ok ? 'fixed' : 'broken');
    props.onResolved();
  };
  const handleIgnore = () => {
    resolveCamera('broken');
    props.onResolved();
  };

  const seconds = Math.ceil(remaining / 1000);

  return (
    <div className="camera-event-screen" role="dialog" aria-modal="true">
      <div className="camera-event-card">
        <div className="camera-event-emoji" aria-hidden>📸</div>
        <div className="camera-event-text">{t('event_urgency')}</div>
        <div className="camera-event-meta">
          <span className="camera-event-cost">
            <span className="mk-icon mk-icon-coin mk-icon--xs" aria-hidden />
            {STAGE5_CAMERA_COST}
          </span>
          <span className="camera-event-divider">•</span>
          <span className="camera-event-liquid">
            יש לך: {liquid.toLocaleString()}
          </span>
          <span className="camera-event-divider">•</span>
          <span className={`camera-event-timer ${seconds <= 10 ? 'camera-event-timer--urgent' : ''}`}>
            ⏳ {seconds}s
          </span>
        </div>
        <div className="camera-event-actions">
          <button type="button"
                  className="tut-popup-btn camera-event-pay"
                  onClick={handlePay}
                  disabled={!canAfford}
                  title={canAfford ? '' : 'אין מספיק כסף נזיל'}>
            {t('event_urgency_pay_btn')}
          </button>
          <button type="button"
                  className="camera-event-ignore"
                  onClick={handleIgnore}>
            {t('event_urgency_ignore_btn')}
          </button>
        </div>
      </div>
    </div>
  );
}

// ---------------- 5.4 — Provident unlock animation ----------------
export function ProvidentUnlockScreen({ onContinue }: ScreenProps) {
  const providentBalance = useGameStore((s) => s.accounts.provident?.balance ?? 0);
  return (
    <div className="inflation-screen" role="dialog" aria-modal="true">
      <div className="inflation-screen-inner">
        <div className="inflation-screen-caption">{t('provident_unlocked')}</div>
        <div className="provident-unlock-stage">
          <div className="provident-unlock-lock" aria-hidden>🔓</div>
          <div className="provident-unlock-bal">{Math.round(providentBalance)} ₪</div>
          <div className="provident-unlock-bonus">בונוס +10% שולם</div>
        </div>
        <button type="button" className="tut-popup-btn" onClick={onContinue}>הבא</button>
      </div>
    </div>
  );
}

// ---------------- 5.4 Screen A — Timeframe lesson 1 (comparison) ----------------
export function LessonTimeframe1Screen({ onContinue }: ScreenProps) {
  const accounts = useGameStore((s) => s.accounts);
  const dep  = accounts.deposit?.balance      ?? 0;
  const sp   = accounts.single_stock?.balance ?? 0;
  const prov = accounts.provident?.balance    ?? 0;
  const max  = Math.max(dep, sp, prov, 1);

  const rows = [
    { label: '🏦 פיקדון',    v: Math.round(dep),  c: '#4ade80' },
    { label: '📈 S&P 500',   v: Math.round(sp),   c: '#ff9a1f' },
    { label: '🔒 קופת גמל', v: Math.round(prov), c: '#a78bfa' },
  ];
  return (
    <div className="inflation-screen" role="dialog" aria-modal="true">
      <div className="inflation-screen-inner">
        <div className="inflation-screen-caption">{t('lesson_timeframe_1')}</div>
        <div className="three-growth">
          {rows.map((r, i) => (
            <div key={r.label} className="three-growth-row" style={{ animationDelay: `${i * 140}ms` }}>
              <div className="three-growth-label">{r.label}</div>
              <div className="three-growth-bar">
                <div className="three-growth-fill three-growth-fill--straight"
                     style={{ background: r.c, ['--target-w' as string]: `${(r.v / max) * 100}%` } as React.CSSProperties} />
              </div>
              <div className="three-growth-value" style={{ color: r.c }}>{r.v} ₪</div>
            </div>
          ))}
        </div>
        <button type="button" className="tut-popup-btn" onClick={onContinue}>הבא</button>
      </div>
    </div>
  );
}

// ---------------- 5.4 Screen B — Horizon → tool ----------------
export function LessonTimeframe2Screen({ onContinue }: ScreenProps) {
  const rows = [
    { range: t('timeframe_short'), tool: t('timeframe_short_tool'), color: '#4ade80' },
    { range: t('timeframe_mid'),   tool: t('timeframe_mid_tool'),   color: '#ff9a1f' },
    { range: t('timeframe_long'),  tool: t('timeframe_long_tool'),  color: '#a78bfa' },
  ];
  return (
    <div className="inflation-screen" role="dialog" aria-modal="true">
      <div className="inflation-screen-inner">
        <div className="inflation-screen-caption">{t('lesson_timeframe_2')}</div>
        <div className="timeframe-question">מתי תצטרך את הכסף?</div>
        <div className="timeframe-list">
          {rows.map((r, i) => (
            <div key={r.range} className="timeframe-row" style={{ animationDelay: `${i * 140}ms` }}>
              <div className="timeframe-range" style={{ background: r.color }}>{r.range}</div>
              <div className="timeframe-arrow">←</div>
              <div className="timeframe-tool">{r.tool}</div>
            </div>
          ))}
        </div>
        <button type="button" className="tut-popup-btn" onClick={onContinue}>
          {t('lesson_timeframe_2_btn')}
        </button>
      </div>
    </div>
  );
}
