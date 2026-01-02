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
  // Primary
  primary: '#ff6b9d',
  primaryLight: '#ff8eb5',
  primaryDark: '#e04f7f',
  primarySubtle: 'rgba(255, 107, 157, 0.15)',

  // Secondary
  secondary: '#7c4dff',
  secondaryLight: '#9d7aff',
  secondaryDark: '#5a2dd6',
  secondarySubtle: 'rgba(124, 77, 255, 0.15)',

  // Accent
  accent: '#00e5ff',
  accentLight: '#6effff',
  accentDark: '#00b2cc',
  accentSubtle: 'rgba(0, 229, 255, 0.15)',

  // Semantic
  success: '#4ecdc4',
  successLight: '#7ee8e1',
  successDark: '#38b2a7',
  successSubtle: 'rgba(78, 205, 196, 0.15)',

  warning: '#ffd93d',
  warningLight: '#ffe066',
  warningDark: '#e6c235',
  warningSubtle: 'rgba(255, 217, 61, 0.15)',

  error: '#f48771',
  errorLight: '#f7a594',
  errorDark: '#e06b52',
  errorSubtle: 'rgba(244, 135, 113, 0.15)',

  info: '#7dd3fc',
  infoLight: '#a5e1fd',
  infoDark: '#5bc0eb',
  infoSubtle: 'rgba(125, 211, 252, 0.15)',

  // Backgrounds
  bg: '#0a0a14',
  bgSecondary: 'rgba(19, 19, 38, 0.92)',
  bgTertiary: 'rgba(28, 28, 52, 0.85)',
  bgElevated: 'rgba(38, 38, 72, 0.9)',
  bgOverlay: 'rgba(0, 0, 0, 0.6)',
  bgHover: 'rgba(255, 255, 255, 0.02)',
  bgActive: 'rgba(255, 255, 255, 0.06)',
  bgSelected: 'rgba(255, 107, 157, 0.12)',

  // Text
  text: '#e4e4e7',
  textSecondary: '#a1a1aa',
  textMuted: 'rgba(228, 228, 231, 0.5)',
  textDisabled: 'rgba(228, 228, 231, 0.3)',
  textInverse: '#0a0a14',
  textLink: '#7dd3fc',

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
    display: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif",
  },
  fontSize: {
    xs: '0.6875rem',   // 11px
    sm: '0.8125rem',   // 13px
    base: '0.875rem',  // 14px
    md: '1rem',        // 16px
    lg: '1.125rem',    // 18px
    xl: '1.25rem',     // 20px
    '2xl': '1.5rem',   // 24px
    '3xl': '1.875rem', // 30px
    '4xl': '2.25rem',  // 36px
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
