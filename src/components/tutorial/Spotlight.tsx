'use client';

import { useEffect, useState } from 'react';

interface Props {
  /** CSS selector of the element to highlight. If empty/null, the
   *  whole screen is dimmed with no cutout (used when the tutorial
   *  popup is centred and the user is just reading). */
  selector?: string | null;
  /** Extra padding around the target's bounding box for the cutout. */
  padding?: number;
  /**
   * If true, this Spotlight ALSO blocks clicks outside the cutout —
   * use this for steps where the user MUST tap the highlighted target.
   * Default true. Set false for Continue-only popups where we want
   * the blocker handled separately.
   */
  blockClicks?: boolean;
}

/**
 * Dim everything except a single target element. The cutout follows
 * the target's getBoundingClientRect() and re-measures on scroll/resize.
 * Uses an SVG mask so the cutout has soft corners and casts no DOM
 * shadow over the highlighted region.
 */
export default function Spotlight({
  selector,
  padding = 8,
  blockClicks = true,
}: Props) {
  const [rect, setRect] = useState<DOMRect | null>(null);

  useEffect(() => {
    if (!selector) {
      setRect(null);
      return;
    }
    const measure = () => {
      const el = document.querySelector(selector) as HTMLElement | null;
      setRect(el ? el.getBoundingClientRect() : null);
    };
    measure();
    const interval = setInterval(measure, 200);
    window.addEventListener('resize', measure);
    window.addEventListener('scroll', measure, true);
    return () => {
      clearInterval(interval);
      window.removeEventListener('resize', measure);
      window.removeEventListener('scroll', measure, true);
    };
  }, [selector]);

  if (!rect) {
    // No target → full-screen dim, blocks everything.
    return <div className="tut-dim" data-blocking={blockClicks} />;
  }

  const x = rect.left - padding;
  const y = rect.top - padding;
  const w = rect.width + padding * 2;
  const h = rect.height + padding * 2;
  const r = 12;

  return (
    <>
      {/* SVG dim layer with a rounded-rectangle cutout over the target. */}
      <svg
        className="tut-spotlight-svg"
        xmlns="http://www.w3.org/2000/svg"
        style={{
          position: 'fixed',
          inset: 0,
          width: '100vw',
          height: '100vh',
          pointerEvents: 'none',
          zIndex: 1000,
        }}
      >
        <defs>
          <mask id="tut-spot-mask">
            <rect width="100%" height="100%" fill="white" />
            <rect x={x} y={y} width={w} height={h} rx={r} ry={r} fill="black" />
          </mask>
        </defs>
        <rect
          width="100%"
          height="100%"
          fill="rgba(10, 6, 2, 0.62)"
          mask="url(#tut-spot-mask)"
        />
        {/* Animated outline ring around the cutout */}
        <rect
          x={x}
          y={y}
          width={w}
          height={h}
          rx={r}
          ry={r}
          fill="none"
          stroke="rgba(255, 220, 120, 0.85)"
          strokeWidth="3"
          className="tut-spot-ring"
        />
      </svg>

      {/* Click blocker layer with a transparent hole over the target.
          The two halves above/below the target and two halves left/right
          block clicks; the cutout window passes them through to the
          actual target element. */}
      {blockClicks && (
        <div className="tut-blocker-hole" style={{ pointerEvents: 'none', zIndex: 999 }}>
          {/* Top */}
          <div
            className="tut-blocker"
            style={{
              position: 'fixed',
              left: 0,
              top: 0,
              width: '100vw',
              height: Math.max(0, y),
            }}
          />
          {/* Bottom */}
          <div
            className="tut-blocker"
            style={{
              position: 'fixed',
              left: 0,
              top: y + h,
              width: '100vw',
              height: `calc(100vh - ${y + h}px)`,
            }}
          />
          {/* Left of target */}
          <div
            className="tut-blocker"
            style={{
              position: 'fixed',
              left: 0,
              top: y,
              width: Math.max(0, x),
              height: h,
            }}
          />
          {/* Right of target */}
          <div
            className="tut-blocker"
            style={{
              position: 'fixed',
              left: x + w,
              top: y,
              width: `calc(100vw - ${x + w}px)`,
              height: h,
            }}
          />
        </div>
      )}
    </>
  );
}
