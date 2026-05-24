'use client';

import CountUp from './CountUp';

interface Props {
  amount: number;
  /** 'sm' = caption row, 'md' = inline pill, 'lg' = hero balance. */
  size?: 'sm' | 'md' | 'lg';
  /** When true, animates number changes. Defaults to true. */
  animate?: boolean;
  /** When true, wraps in a subtle shimmer (hero usage). */
  shimmer?: boolean;
  className?: string;
}

/**
 * Coin readout primitive — always a beveled gold star badge + a chunky
 * tabular number. Used anywhere we show a coin count.
 */
export default function CoinDisplay({
  amount,
  size = 'md',
  animate = true,
  shimmer = false,
  className = '',
}: Props) {
  const numClass =
    size === 'lg' ? 'ds-text-hero ds-text-num'
    : size === 'sm' ? 'ds-text-caption ds-text-num'
    : 'ds-text-body ds-text-num';

  return (
    <span
      className={`inline-flex items-center gap-1.5 ${shimmer ? 'ds-shimmer rounded-full px-2' : ''} ${className}`}
    >
      {/* Painted coin PNG — .ds-coin-badge is now a sized background-image
          wrapper (no emoji glyph). Kept for backward-compat with all
          existing call sites of <CoinDisplay>. */}
      <span className="ds-coin-badge" aria-hidden />

      <span className={numClass}>
        {animate ? <CountUp value={amount} /> : amount.toLocaleString()}
      </span>
    </span>
  );
}
