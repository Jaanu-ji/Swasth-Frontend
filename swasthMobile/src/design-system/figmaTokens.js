// ✅ Figma Design Tokens - Complete System
// Source: Figma_design/src/styles/globals.css
// Base font size: 16px, spacing unit: 0.25rem (4px)

export const figmaColors = {
  // Core semantic colors
  background: '#ffffff',
  foreground: '#252525',
  card: '#ffffff',
  cardForeground: '#252525',

  // Primary
  primary: '#030213',
  primaryForeground: '#ffffff',

  // Secondary
  secondary: '#f5f5f7',
  secondaryForeground: '#030213',

  // Muted
  muted: '#ececf0',
  mutedForeground: '#717182',

  // Accent
  accent: '#e9ebef',
  accentForeground: '#030213',

  // Destructive/Emergency
  destructive: '#d4183d',
  destructiveForeground: '#ffffff',

  // Border & Input
  border: 'rgba(0, 0, 0, 0.1)',
  input: 'transparent',
  inputBackground: '#f3f3f5',

  // Red
  red50: '#fef2f2',
  red100: '#fee2e2',
  red500: '#ef4444',
  red600: '#dc2626',
  red700: '#b91c1c',

  // Orange
  orange50: '#fff7ed',
  orange100: '#ffedd5',
  orange200: '#fed7aa',
  orange500: '#f97316',
  orange600: '#ea580c',
  orange700: '#c2410c',

  // Amber/Yellow
  amber100: '#fef3c7',
  amber500: '#fbbf24',
  yellow100: '#fef9c3',
  yellow500: '#eab308',
  yellow600: '#ca8a04',
  yellow700: '#a16207',

  // Green
  green50: '#f0fdf4',
  green100: '#dcfce7',
  green200: '#bbf7d0',
  green500: '#22c55e',
  green600: '#16a34a',
  green700: '#15803d',

  // Emerald
  emerald500: '#10b981',

  // Cyan
  cyan50: '#ecfeff',
  cyan100: '#cffafe',
  cyan500: '#06b6d4',
  cyan600: '#0891b2',

  // Blue
  blue50: '#eff6ff',
  blue100: '#dbeafe',
  blue200: '#bfdbfe',
  blue500: '#3b82f6',
  blue600: '#2563eb',
  blue700: '#1d4ed8',
  blue900: '#1e3a8a',

  // Purple
  purple50: '#faf5ff',
  purple100: '#f3e8ff',
  purple200: '#e9d5ff',
  purple500: '#a855f7',
  purple600: '#9333ea',

  // Pink/Rose
  pink500: '#ec4899',
  pink600: '#db2777',
  rose100: '#ffe4e6',
  rose500: '#f43f5e',
  rose600: '#e11d48',

  // Gray
  gray50: '#f9fafb',
  gray100: '#f3f4f6',
  gray200: '#e5e7eb',
  gray300: '#d1d5db',
  gray400: '#9ca3af',
  gray500: '#6b7280',
  gray600: '#4b5563',
  gray700: '#374151',
  gray900: '#111827',

  // Base
  black: '#000000',
  white: '#ffffff',
};

export const figmaSpacing = {
  '0': 0,
  '0.5': 2,
  '1': 4,
  '1.5': 6,
  '2': 8,
  '3': 12,
  '4': 16,
  '6': 24,
  '8': 32,
  '12': 48,
  '16': 64,
  '20': 80,
  '24': 96,
};

export const figmaTypography = {
  fontSize: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 30,
    '4xl': 36,
  },
  fontWeight: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
  lineHeight: {
    xs: 1.333,
    sm: 1.429,
    base: 1.5,
    '2xl': 1.333,
    '3xl': 1.2,
    '4xl': 1.111,
    tight: 1.25,
    normal: 1.5,
    relaxed: 1.75,
  },
};

export const figmaBorderRadius = {
  sm: 6,
  md: 8,
  base: 10,
  lg: 10,
  xl: 14,
  '2xl': 16,
  '3xl': 24,
  full: 9999,
};

export const figmaShadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 15,
    elevation: 8,
  },
  xl: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.1,
    shadowRadius: 25,
    elevation: 12,
  },
};

export const figmaGradients = {
  primary: ['#3b82f6', '#9333ea'],
  success: ['#22c55e', '#10b981'],
  warning: ['#f97316', '#ea580c'],
  danger: ['#ef4444', '#dc2626'],
  purple: ['#a855f7', '#ec4899'],
};

const figmaTokens = {
  colors: figmaColors,
  spacing: figmaSpacing,
  typography: figmaTypography,
  borderRadius: figmaBorderRadius,
  shadows: figmaShadows,
  gradients: figmaGradients,
};

export default figmaTokens;
