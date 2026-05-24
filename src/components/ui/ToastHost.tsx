'use client';

import { useEffect, useState } from 'react';
import { useToastStore, type Toast } from './toast';

const variantClass: Record<Toast['variant'], string> = {
  success: 'ds-btn--success',
  primary: 'ds-btn--primary',
  danger:  'ds-btn--danger',
  purple:  'ds-btn--purple',
};

/**
 * Fixed-position slide-in toast stack. Mount ONCE at the root (GameShell).
 *
 * Each toast is rendered as a pill using the design-system button
 * gradients — visually consistent with primary CTAs.
 */
export default function ToastHost() {
  const toasts = useToastStore((s) => s.toasts);
  // Only render on the client — SSR would produce empty markup anyway.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  return (
    <div
      aria-live="polite"
      aria-atomic="true"
      className="pointer-events-none fixed top-16 left-1/2 -translate-x-1/2 z-[60] flex flex-col items-center gap-2"
      style={{ direction: 'rtl' }}
    >
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`ds-toast-in ${variantClass[t.variant]} ds-btn ds-btn--md pointer-events-auto shadow-lg`}
          style={{ paddingTop: 8, paddingBottom: 8 }}
          role="status"
        >
          {t.iconClass ? (
            <span className={t.iconClass} aria-hidden />
          ) : t.emoji ? (
            <span className="text-lg leading-none" aria-hidden>{t.emoji}</span>
          ) : null}
          <span className="ds-text-body ds-text-num">{t.text}</span>
        </div>
      ))}
    </div>
  );
}
