/**
 * Funancy — Design System
 * ---------------------------------------------------------------
 * Single source of truth for colors, type, spacing, radius, and
 * shadows. Every component must reference tokens from here or their
 * CSS-variable mirrors in globals.css (@theme). No hardcoded hex
 * values, font sizes, or bespoke shadows belong in components.
 *
 * Inspired by casual mobile games in the Travel Town / Coin Master
 * space: warm, playful, chunky, beveled, never flat.
 */

// ============================================================
// Color palette — each family has 5 shades (50 / 200 / 400 / 600 / 800)
// ============================================================
export const palette = {
  // Warm orange/gold — the hero colour for CTAs, rewards, coins.
  primary: {
    50:  '#fff6e3',
    200: '#ffd98a',
    400: '#ffb23a',
    600: '#d98708',
    800: '#8a5500',
  },
  // Deep purple — energy, special items, spawners.
  secondary: {
    50:  '#f3e7fb',
    200: '#d6a6f0',
    400: '#a855d6',
    600: '#7b1fa2',
    800: '#3d0a5a',
  },
  // Vibrant green — success, sell, growth.
  success: {
    50:  '#e8f6ea',
    200: '#a5d6a7',
    400: '#66bb6a',
    600: '#2e7d32',
    800: '#14431a',
  },
  // Warm red — danger, losses, inflation.
  danger: {
    50:  '#ffe6e3',
    200: '#ffa499',
    400: '#e63838',
    600: '#a8201c',
    800: '#5a0d0a',
  },
  // Warm neutrals — backgrounds, panels, text. NOT gray.
  neutral: {
    50:  '#fff8ee', // cream surface
    200: '#f5e6c8', // card inner
    400: '#d4a96a', // card border
    600: '#7a4a1e', // wood-dark text
    800: '#2a1508', // deep brown bg
  },
} as const;

// ============================================================
// Typography — single playful rounded family (Heebo — full Hebrew support).
// ============================================================
export const typography = {
  family: {
    // Rounded sans — body + UI.
    display: "'Heebo', 'Rubik', system-ui, Arial, sans-serif",
    // Chunky display for numbers (coins, prices, balance).
    numeric: "'Heebo', 'Rubik', system-ui, Arial, sans-serif",
  },
  // Sizes are exact pixel values — we do not scale these based on context.
  size: {
    hero:    '32px', // screen-dominant number (balance, big reward)
    title:   '24px', // section header
    body:    '16px', // default text
    caption: '12px', // helper / secondary
    tiny:    '10px', // badges, footnotes
  },
  weight: {
    header:  800,
    body:    500,
    numeric: 900,
  },
  // Subtle text shadow for game-y headers.
  shadow: {
    header:  '0 2px 0 rgba(42,21,8,0.35), 0 3px 6px rgba(0,0,0,0.25)',
    numeric: '0 1px 0 rgba(0,0,0,0.2)',
  },
} as const;

// ============================================================
// Spacing — strict 4px grid.
// ============================================================
export const spacing = {
  xs:  '4px',
  sm:  '8px',
  md:  '12px',
  lg:  '16px',
  xl:  '24px',
  xxl: '32px',
  xxxl:'48px',
  xxxxl:'64px',
} as const;

// ============================================================
// Border radius — 4-step scale.
// ============================================================
export const radius = {
  sm:   '8px',   // chips, tiny controls
  md:   '16px',  // cards, panels
  lg:   '24px',  // big buttons, hero cards
  full: '9999px',// pills, circular badges
} as const;

// ============================================================
// Shadows — 3 depth levels. Each level has both a neutral and a
// coloured "glow" variant (for pressed/active highlights).
// ============================================================
export const shadow = {
  // Cards at rest
  subtle: '0 2px 6px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.35)',
  // Floating elements (modals, toasts, pressable buttons at rest)
  medium:
    '0 4px 0 rgba(0,0,0,0.22), 0 6px 14px rgba(0,0,0,0.22), inset 0 1px 0 rgba(255,255,255,0.35)',
  // Active/pressed states — used WITH colour tinting in per-variant glow
  heavy:
    '0 6px 0 rgba(0,0,0,0.28), 0 10px 20px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.4)',
  // Coloured glows, applied on hover / win states
  glow: {
    primary: '0 0 16px rgba(255,178,58,0.55), 0 0 32px rgba(255,178,58,0.25)',
    success: '0 0 16px rgba(102,187,106,0.55), 0 0 32px rgba(102,187,106,0.25)',
    danger:  '0 0 16px rgba(230,56,56,0.55), 0 0 32px rgba(230,56,56,0.25)',
    purple:  '0 0 16px rgba(168,85,214,0.55), 0 0 32px rgba(168,85,214,0.25)',
  },
} as const;

// ============================================================
// Motion tokens — animation durations & easings.
// ============================================================
export const motion = {
  duration: {
    fast:    '120ms',
    normal:  '220ms',
    slow:    '420ms',
    celebrate:'900ms',
  },
  easing: {
    // Chunky, bouncy default — feels like a game, not a spreadsheet.
    bounce:  'cubic-bezier(0.34, 1.56, 0.64, 1)',
    smooth:  'cubic-bezier(0.22, 1, 0.36, 1)',
    linear:  'linear',
  },
} as const;

// ============================================================
// Semantic roles — name things by what they DO, not what they look like.
// Every component references these, not the raw palette indexes.
// ============================================================
export const semantic = {
  bg: {
    app:      palette.neutral[800],
    surface:  palette.neutral[50],
    surfaceAlt: palette.neutral[200],
  },
  text: {
    primary:   palette.neutral[600], // on cream surfaces
    onDark:    palette.neutral[50],  // on dark backgrounds
    muted:     'rgba(122,74,30,0.65)',
    inverse:   palette.neutral[50],
  },
  border: {
    card:  palette.neutral[400],
    inset: 'rgba(180,120,50,0.25)',
  },
  // CTA intents
  intent: {
    primary: { bg: palette.primary[400], bgDark: palette.primary[600], fg: palette.neutral[800] },
    success: { bg: palette.success[400], bgDark: palette.success[600], fg: '#ffffff' },
    danger:  { bg: palette.danger[400],  bgDark: palette.danger[600],  fg: '#ffffff' },
    purple:  { bg: palette.secondary[400], bgDark: palette.secondary[600], fg: '#ffffff' },
  },
} as const;

// Re-export as a single object for ergonomic imports.
export const tokens = { palette, typography, spacing, radius, shadow, motion, semantic } as const;

export type Tokens = typeof tokens;
