/**
 * ---------------------------------------------------------------
 *           PixoSpritz – Design System JavaScript Module
 * ---------------------------------------------------------------
 * Copyright (c) 2022-2025 Kyle Derby MacInnis
 *
 * JavaScript utilities and constants for the design system.
 * Import this module to access design tokens programmatically.
 */

// ============================================================
// COLOR PALETTE
// ============================================================
export const colors = {
  // Primary — ACHROMATIC (Kyle, 2026-10-06). High-contrast neutral;
  // primary surfaces render near-white with dark text.
  primary: '#ececf1',
  primaryLight: '#ffffff',
  primaryDark: '#d2d2dc',
  primarySubtle: 'rgba(236, 236, 241, 0.12)',
  onPrimary: '#0a0a12',

  // Secondary — teal chromatic accent (minimal, secondary use)
  secondary: '#4ecdc4',
  secondaryLight: '#5fe4db',
  secondaryDark: '#38b2a7',
  secondarySubtle: 'rgba(78, 205, 196, 0.12)',

  // Accent — pink chromatic accent (minimal, secondary use)
  accent: '#ff6b9d',
  accentLight: '#ff8eb5',
  accentDark: '#e04f7f',
  accentSubtle: 'rgba(255, 107, 157, 0.12)',

  // Warm — amber highlight accent
  warm: '#fbbf24',
  warmSubtle: 'rgba(251, 191, 36, 0.12)',

  // Semantic
  success: '#22c55e',
  successLight: '#4ade80',
  successDark: '#16a34a',
  successSubtle: 'rgba(34, 197, 94, 0.12)',

  warning: '#f59e0b',
  warningLight: '#fbbf24',
  warningDark: '#d97706',
  warningSubtle: 'rgba(245, 158, 11, 0.12)',

  error: '#ef4444',
  errorLight: '#f87171',
  errorDark: '#dc2626',
  errorSubtle: 'rgba(239, 68, 68, 0.12)',

  info: '#3b82f6',
  infoLight: '#60a5fa',
  infoDark: '#2563eb',
  infoSubtle: 'rgba(59, 130, 246, 0.12)',

  // Backgrounds
  bg: '#0a0a12',
  bgSecondary: '#0f0f1a',
  bgTertiary: '#151520',
  bgElevated: '#151520',
  bgOverlay: 'rgba(0, 0, 0, 0.6)',
  bgHover: '#1a1a28',
  bgActive: '#202030',
  bgSelected: 'rgba(236, 236, 241, 0.12)',

  // Text
  text: '#f0f0f5',
  textSecondary: '#a0a0b0',
  textMuted: '#606070',
  textDisabled: 'rgba(240, 240, 245, 0.3)',
  textInverse: '#0a0a12',
  textLink: '#4ecdc4',

  // Borders
  border: 'rgba(255, 255, 255, 0.08)',
  borderLight: 'rgba(255, 255, 255, 0.15)',
};

// ============================================================
// SPACING SCALE (in pixels)
// ============================================================
export const spacing = {
  0: 0,
  px: 1,
  0.5: 2,
  1: 4,
  1.5: 6,
  2: 8,
  2.5: 10,
  3: 12,
  3.5: 14,
  4: 16,
  5: 20,
  6: 24,
  7: 28,
  8: 32,
  9: 36,
  10: 40,
  12: 48,
  14: 56,
  16: 64,
  20: 80,
  24: 96,
  32: 128,

  // Semantic aliases
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  '2xl': 48,
};

// ============================================================
// TYPOGRAPHY
// ============================================================
export const typography = {
  fontFamily: {
    sans: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif",
    mono: "'JetBrains Mono', 'Fira Code', Consolas, Monaco, 'Andale Mono', monospace",
    display:
      "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif",
  },
  fontSize: {
    xs: '0.6875rem', // 11px
    sm: '0.8125rem', // 13px
    base: '0.875rem', // 14px
    md: '1rem', // 16px
    lg: '1.125rem', // 18px
    xl: '1.25rem', // 20px
    '2xl': '1.5rem', // 24px
    '3xl': '1.875rem', // 30px
    '4xl': '2.25rem', // 36px
  },
  fontWeight: {
    light: 300,
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },
  lineHeight: {
    tight: 1.2,
    snug: 1.35,
    normal: 1.5,
    relaxed: 1.65,
    loose: 2,
  },
};

// ============================================================
// SHADOWS
// ============================================================
export const shadows = {
  none: 'none',
  xs: '0 1px 2px rgba(0, 0, 0, 0.3)',
  sm: '0 1px 3px rgba(0, 0, 0, 0.25), 0 1px 2px rgba(0, 0, 0, 0.3)',
  md: '0 4px 6px rgba(0, 0, 0, 0.25), 0 2px 4px rgba(0, 0, 0, 0.3)',
  lg: '0 10px 15px rgba(0, 0, 0, 0.25), 0 4px 6px rgba(0, 0, 0, 0.3)',
  xl: '0 20px 25px rgba(0, 0, 0, 0.3), 0 8px 10px rgba(0, 0, 0, 0.35)',
  '2xl': '0 25px 50px rgba(0, 0, 0, 0.4)',
  inner: 'inset 0 2px 4px rgba(0, 0, 0, 0.3)',
  primary: '0 4px 14px rgba(255, 107, 157, 0.25)',
  secondary: '0 4px 14px rgba(124, 77, 255, 0.25)',
  focus: '0 0 0 3px rgba(255, 107, 157, 0.15)',
};

// ============================================================
// BORDER RADIUS
// ============================================================
export const borderRadius = {
  none: 0,
  sm: 2,
  default: 4,
  md: 6,
  lg: 8,
  xl: 12,
  '2xl': 16,
  '3xl': 24,
  full: 9999,
};

// ============================================================
// ANIMATION
// ============================================================
export const animation = {
  duration: {
    instant: 0,
    fast: 100,
    normal: 200,
    slow: 300,
    slower: 500,
    slowest: 700,
  },
  easing: {
    linear: 'linear',
    in: 'cubic-bezier(0.4, 0, 1, 1)',
    out: 'cubic-bezier(0, 0, 0.2, 1)',
    inOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
    elastic: 'cubic-bezier(0.68, -0.6, 0.32, 1.6)',
  },
};

// ============================================================
// Z-INDEX
// ============================================================
export const zIndex = {
  base: 0,
  dropdown: 100,
  sticky: 200,
  fixed: 300,
  modalBackdrop: 400,
  modal: 500,
  popover: 600,
  tooltip: 700,
  toast: 800,
  overlay: 900,
  max: 9999,
};

// ============================================================
// BREAKPOINTS (in pixels)
// ============================================================
export const breakpoints = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
};

// ============================================================
// UTILITY FUNCTIONS
// ============================================================

/**
 * Convert a spacing value to CSS
 * @param {number|string} value - Spacing value from the scale
 * @returns {string} CSS value with unit
 */
export function getSpacing(value) {
  const spaceValue = spacing[value];
  if (typeof spaceValue === 'number') {
    return `${spaceValue}px`;
  }
  return value;
}

/**
 * Get a CSS variable reference
 * @param {string} name - Variable name without -- prefix
 * @returns {string} CSS var() reference
 */
export function cssVar(name) {
  return `var(--${name})`;
}

/**
 * Create a transition string
 * @param {string[]} properties - CSS properties to transition
 * @param {string} duration - Duration key from animation.duration
 * @param {string} easing - Easing key from animation.easing
 * @returns {string} CSS transition value
 */
export function transition(properties, duration = 'normal', easing = 'inOut') {
  const dur = animation.duration[duration] || animation.duration.normal;
  const ease = animation.easing[easing] || animation.easing.inOut;
  return properties.map(prop => `${prop} ${dur}ms ${ease}`).join(', ');
}

/**
 * Check if we should reduce motion based on user preference
 * @returns {boolean} True if reduced motion is preferred
 */
export function prefersReducedMotion() {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Get responsive value based on current viewport
 * @param {Object} values - Object with breakpoint keys and values
 * @param {*} defaultValue - Default value if no breakpoint matches
 * @returns {*} The appropriate value for current viewport
 */
export function responsive(values, defaultValue) {
  if (typeof window === 'undefined') return defaultValue;

  const width = window.innerWidth;
  const breakpointOrder = ['2xl', 'xl', 'lg', 'md', 'sm'];

  for (const bp of breakpointOrder) {
    if (width >= breakpoints[bp] && values[bp] !== undefined) {
      return values[bp];
    }
  }

  return values.default ?? defaultValue;
}

// Default export with all tokens
export default {
  colors,
  spacing,
  typography,
  shadows,
  borderRadius,
  animation,
  zIndex,
  breakpoints,
  getSpacing,
  cssVar,
  transition,
  prefersReducedMotion,
  responsive,
};
