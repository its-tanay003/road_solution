/**
 * ROADSoS Design System
 * 
 * Philosophy: Extreme accessibility for all ages (10-70).
 * Standards: WCAG 2.1 AAA for emergency interfaces.
 */

export const COLORS = {
  emergencyRed: '#D32F2F', // SOS, danger
  safeGreen: '#388E3C',    // safe, confirmed, ok
  alertAmber: '#F57C00',   // warning, attention
  nightBlue: '#0D1B2A',    // dark backgrounds, map overlays
  pureWhite: '#FFFFFF',
  softGray: '#F5F5F5',
};

export const TYPOGRAPHY = {
  base: 16, // px
  xs: '0.75rem',  // 12px
  sm: '0.875rem', // 14px
  md: '1rem',     // 16px
  lg: '1.25rem',  // 20px
  xl: '1.5rem',   // 24px
  '2xl': '2rem',  // 32px
  '3xl': '3rem',  // 48px
};

export const INTERACTION = {
  minTouchTarget: '60px', // WCAG 2.1 AAA
  sosButtonDiameter: '180px',
  bottomNavHeight: '72px',
};

export const THEMES = {
  light: {
    bg: COLORS.softGray,
    surface: COLORS.pureWhite,
    text: COLORS.nightBlue,
    border: '#E0E0E0',
  },
  dark: {
    bg: COLORS.nightBlue,
    surface: '#1A2E35',
    text: COLORS.pureWhite,
    border: '#2C3E50',
  },
  highContrast: {
    bg: '#000000',
    surface: '#000000',
    text: '#FFFF00', // Yellow on black
    border: '#FFFFFF',
  },
};
