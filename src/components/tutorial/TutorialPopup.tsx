'use client';

import { useEffect, useRef, useState } from 'react';

type Position =
  | 'center'
  | 'top' | 'bottom'
  | 'above-target' | 'below-target'
  | 'top-safe'   // pinned to upper area (below header, never covers center/bottom)
  | 'bottom-safe'; // pinned to lower area (above nav, never covers top/middle)

interface Props {
  /** Text from `t(code)`. */
  text: string;
  /** Optional small sub-text or hint. */
  subtext?: string;
  /** Where to position the popup. */
  position?: Position;
  /**
   * If `position === 'above-target'` or `'below-target'`, anchor relative
   * to this element's bounding box. Pass a CSS selector or an HTMLElement.
   */
  anchorSelector?: string;
  /** Continue handler. If omitted, no Continue button is shown — the
   *  popup waits for an external advance trigger (e.g. tap-producer-4-times). */
  onContinue?: () => void;
  /** Override the Continue button label. */
  continueLabel?: string;
  /** Hide Continue (popup is informational only, action gate advances). */
  hideContinue?: boolean;
  /** Optional caption above the main text (e.g. "שלב 2 — משימה 1 מתוך 3"). */
  caption?: string;
  /** Optional live progress bar (rendered below text, above any button). */
  progress?: { current: number; target: number };
  /** If supplied, an ✕ button appears top-start and calls this on tap.
   *  Used by Mission-Reminder mode so the popup is a read-only peek. */
  onClose?: () => void;
  /** Minimum milliseconds the popup must be visible before the Continue
   *  button becomes tappable. Prevents accidental double-taps and gives
   *  the Hebrew text time to register. Default 1500. */
  minDisplayMs?: number;
}

/**
 * Tutorial popup primitive. Renders a centered modal card with text +
 * optional Continue button, sitting above a full-screen interaction
 * blocker (`.tutorial-blocker`). Action gates outside the popup are
 * handled by the host component checking the current tutorial step.
 */
export default function TutorialPopup({
  text,
  subtext,
  position = 'center',
  anchorSelector,
  onContinue,
  continueLabel = 'המשך',
  hideContinue = false,
  caption,
  progress,
  onClose,
  minDisplayMs = 1500,
}: Props) {
  const popupRef = useRef<HTMLDivElement>(null);
  const [anchorRect, setAnchorRect] = useState<DOMRect | null>(null);
  // Lock-out window so the player can read the Hebrew text before tapping.
  const [canDismiss, setCanDismiss] = useState(minDisplayMs <= 0);
  useEffect(() => {
    if (minDisplayMs <= 0) { setCanDismiss(true); return; }
    setCanDismiss(false);
    const id = window.setTimeout(() => setCanDismiss(true), minDisplayMs);
    return () => window.clearTimeout(id);
  }, [minDisplayMs, text]);

  // Re-measure anchor on mount and on scroll/resize.
  useEffect(() => {
    if (!anchorSelector) return;
    const measure = () => {
      const el = document.querySelector(anchorSelector) as HTMLElement | null;
      setAnchorRect(el ? el.getBoundingClientRect() : null);
    };
    measure();
    const interval = setInterval(measure, 200); // re-poll in case the target mounts late or moves
    window.addEventListener('resize', measure);
    window.addEventListener('scroll', measure, true);
    return () => {
      clearInterval(interval);
      window.removeEventListener('resize', measure);
      window.removeEventListener('scroll', measure, true);
    };
  }, [anchorSelector]);

  // Compute popup position. "Safe" positions pin the popup to a region
  // that's guaranteed not to overlap the gameplay target.
  const style: React.CSSProperties = (() => {
    if (position === 'top' || position === 'top-safe') {
      return { top: 96, left: '50%', transform: 'translateX(-50%)' };
    }
    if (position === 'bottom' || position === 'bottom-safe') {
      return { bottom: 112, left: '50%', transform: 'translateX(-50%)' };
    }
    if (anchorRect && position === 'above-target') {
      return {
        top: Math.max(64, anchorRect.top - 16),
        left: anchorRect.left + anchorRect.width / 2,
        transform: 'translate(-50%, -100%)',
      };
    }
    if (anchorRect && position === 'below-target') {
      return {
        top: anchorRect.bottom + 16,
        left: anchorRect.left + anchorRect.width / 2,
        transform: 'translateX(-50%)',
      };
    }
    // center fallback
    return { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' };
  })();

  return (
    <div
      ref={popupRef}
      className="tut-popup"
      style={style}
      role="dialog"
      aria-modal="true"
    >
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          className="tut-popup-close"
          aria-label="סגור"
        >
          ✕
        </button>
      )}
      {caption && <div className="tut-popup-caption">{caption}</div>}
      <div className="tut-popup-text">{text}</div>
      {subtext && <div className="tut-popup-sub">{subtext}</div>}
      {progress && (
        <div className="tut-popup-progress" aria-label={`${progress.current} מתוך ${progress.target}`}>
          <div className="tut-popup-progress-track">
            <div
              className="tut-popup-progress-fill"
              style={{ width: `${Math.min(100, Math.max(0, (progress.current / progress.target) * 100))}%` }}
            />
          </div>
          <div className="tut-popup-progress-label" dir="ltr">
            {Math.min(progress.current, progress.target)} / {progress.target}
          </div>
        </div>
      )}
      {!hideContinue && onContinue && (
        <button
          type="button"
          onClick={canDismiss ? onContinue : undefined}
          disabled={!canDismiss}
          aria-disabled={!canDismiss}
          className={`tut-popup-btn ${!canDismiss ? 'tut-popup-btn--locked' : ''}`}
        >
          {continueLabel}
        </button>
      )}
    </div>
  );
}
