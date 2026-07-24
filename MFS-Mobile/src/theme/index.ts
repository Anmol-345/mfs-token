import { TextStyle } from 'react-native';

export const colors = {
  bg: '#000000',
  bgSecondary: '#0D0D0D',
  bgCard: '#141414',
  bgElevated: '#1A1A1A',
  primary: '#FFFFFF',
  primaryLight: '#E0E0E0',
  primaryDark: '#CCCCCC',
  accent: '#FFFFFF',
  accentOrange: '#FF8C42',
  error: '#FF3333',
  warning: '#FFC107',
  success: '#AAAAAA',
  textPrimary: '#FFFFFF',
  textSecondary: '#888888',
  textMuted: '#555555',
  border: '#222222',
  borderLight: '#333333',
  white: '#FFFFFF',
  black: '#000000',
  transparent: 'transparent',
  overlay: 'rgba(0, 0, 0, 0.8)',
  gradientStart: '#FFFFFF',
  gradientEnd: '#AAAAAA',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const borderRadius = {
  sm: 2,
  md: 4,
  lg: 8,
  xl: 8,
  full: 9999,
};

export const typography: Record<string, TextStyle> = {
  h1: { fontSize: 24, fontWeight: '600' as const, lineHeight: 32, letterSpacing: 2.4, textTransform: 'uppercase' }, // headline-xl
  h2: { fontSize: 18, fontWeight: '600' as const, lineHeight: 24, letterSpacing: 1.44, textTransform: 'uppercase' }, // headline-lg
  h3: { fontSize: 16, fontWeight: '600' as const, lineHeight: 22, letterSpacing: 1.28, textTransform: 'uppercase' }, // headline-lg-mobile
  body: { fontSize: 14, fontWeight: '400' as const, lineHeight: 20, letterSpacing: -0.14 }, // body-md
  bodyLg: { fontSize: 16, fontWeight: '400' as const, lineHeight: 24, letterSpacing: -0.16 }, // body-lg
  bodySmall: { fontSize: 12, fontWeight: '500' as const, lineHeight: 16 }, // data-sm
  caption: { fontSize: 11, fontWeight: '600' as const, lineHeight: 16, textTransform: 'uppercase', letterSpacing: 1.32 }, // label-caps
  label: { fontSize: 11, fontWeight: '600' as const, lineHeight: 16, textTransform: 'uppercase', letterSpacing: 1.32 }, // label-caps
  button: { fontSize: 11, fontWeight: '600' as const, lineHeight: 16, textTransform: 'uppercase', letterSpacing: 1.32 }, // label-caps for buttons
  numberLg: { fontSize: 20, fontWeight: '700' as const, lineHeight: 28, letterSpacing: -0.4, fontVariant: ['tabular-nums'] }, // data-lg
  numberMd: { fontSize: 14, fontWeight: '500' as const, lineHeight: 20, fontVariant: ['tabular-nums'] }, // data-md
  numberSm: { fontSize: 12, fontWeight: '500' as const, lineHeight: 16, fontVariant: ['tabular-nums'] }, // data-sm
};
