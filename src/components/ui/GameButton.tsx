'use client';

import type { ButtonHTMLAttributes, ReactNode } from 'react';

/**
 * Chunky, beveled, gradient-filled button. Backed entirely by `.ds-btn*`
 * classes (globals.css) so the design tokens stay in one place.
 *
 * Variants match semantic.intent roles from src/lib/designSystem.ts.
 */
export type GameButtonVariant = 'primary' | 'success' | 'danger' | 'purple';
export type GameButtonSize = 'sm' | 'md' | 'lg';

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: GameButtonVariant;
  size?: GameButtonSize;
  glow?: boolean; // adds the matching coloured halo
  children: ReactNode;
}

export default function GameButton({
  variant = 'primary',
  size = 'md',
  glow = false,
  className = '',
  children,
  ...rest
}: Props) {
  const glowClass = glow
    ? variant === 'success'
      ? 'ds-glow-success'
      : 'ds-glow-primary'
    : '';
  return (
    <button
      {...rest}
      className={`ds-btn ds-btn--${variant} ds-btn--${size} ${glowClass} ${className}`}
    >
      {children}
    </button>
  );
}
