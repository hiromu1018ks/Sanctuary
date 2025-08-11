/**
 * Sanctuary Design Tokens - TypeScript Definitions
 * Type-safe access to design tokens for components
 */

// ================================
// COLOR TOKENS
// ================================

export const colors = {
  // Brand Colors
  brand: {
    50: 'var(--color-brand-50)',
    100: 'var(--color-brand-100)',
    200: 'var(--color-brand-200)',
    300: 'var(--color-brand-300)',
    400: 'var(--color-brand-400)',
    500: 'var(--color-brand-500)', // Primary
    600: 'var(--color-brand-600)',
    700: 'var(--color-brand-700)',
    800: 'var(--color-brand-800)',
    900: 'var(--color-brand-900)',
  },
  
  // Semantic Colors
  success: {
    50: 'var(--color-success-50)',
    100: 'var(--color-success-100)',
    200: 'var(--color-success-200)',
    300: 'var(--color-success-300)',
    400: 'var(--color-success-400)',
    500: 'var(--color-success-500)', // Primary
    600: 'var(--color-success-600)',
    700: 'var(--color-success-700)',
    800: 'var(--color-success-800)',
    900: 'var(--color-success-900)',
  },
  
  warning: {
    50: 'var(--color-warning-50)',
    100: 'var(--color-warning-100)',
    200: 'var(--color-warning-200)',
    300: 'var(--color-warning-300)',
    400: 'var(--color-warning-400)',
    500: 'var(--color-warning-500)', // Primary
    600: 'var(--color-warning-600)',
    700: 'var(--color-warning-700)',
    800: 'var(--color-warning-800)',
    900: 'var(--color-warning-900)',
  },
  
  danger: {
    50: 'var(--color-danger-50)',
    100: 'var(--color-danger-100)',
    200: 'var(--color-danger-200)',
    300: 'var(--color-danger-300)',
    400: 'var(--color-danger-400)',
    500: 'var(--color-danger-500)', // Primary
    600: 'var(--color-danger-600)',
    700: 'var(--color-danger-700)',
    800: 'var(--color-danger-800)',
    900: 'var(--color-danger-900)',
  },
  
  info: {
    50: 'var(--color-info-50)',
    100: 'var(--color-info-100)',
    200: 'var(--color-info-200)',
    300: 'var(--color-info-300)',
    400: 'var(--color-info-400)',
    500: 'var(--color-info-500)', // Primary
    600: 'var(--color-info-600)',
    700: 'var(--color-info-700)',
    800: 'var(--color-info-800)',
    900: 'var(--color-info-900)',
  },
  
  // Neutral Colors
  neutral: {
    0: 'var(--color-neutral-0)',     // White
    50: 'var(--color-neutral-50)',
    100: 'var(--color-neutral-100)',
    200: 'var(--color-neutral-200)',
    300: 'var(--color-neutral-300)',
    400: 'var(--color-neutral-400)',
    500: 'var(--color-neutral-500)',
    600: 'var(--color-neutral-600)',
    700: 'var(--color-neutral-700)',
    800: 'var(--color-neutral-800)',
    900: 'var(--color-neutral-900)',
    950: 'var(--color-neutral-950)', // Near Black
  },
} as const;

// ================================
// SPACING TOKENS
// ================================

export const spacing = {
  0: 'var(--space-0)',
  px: 'var(--space-px)',
  0.5: 'var(--space-0-5)',   // 2px
  1: 'var(--space-1)',       // 4px
  1.5: 'var(--space-1-5)',   // 6px
  2: 'var(--space-2)',       // 8px - Base unit
  2.5: 'var(--space-2-5)',   // 10px
  3: 'var(--space-3)',       // 12px
  3.5: 'var(--space-3-5)',   // 14px
  4: 'var(--space-4)',       // 16px
  5: 'var(--space-5)',       // 20px
  6: 'var(--space-6)',       // 24px
  7: 'var(--space-7)',       // 28px
  8: 'var(--space-8)',       // 32px
  9: 'var(--space-9)',       // 36px
  10: 'var(--space-10)',     // 40px
  11: 'var(--space-11)',     // 44px
  12: 'var(--space-12)',     // 48px
  14: 'var(--space-14)',     // 56px
  16: 'var(--space-16)',     // 64px
  20: 'var(--space-20)',     // 80px
  24: 'var(--space-24)',     // 96px
  28: 'var(--space-28)',     // 112px
  32: 'var(--space-32)',     // 128px
  36: 'var(--space-36)',     // 144px
  40: 'var(--space-40)',     // 160px
  44: 'var(--space-44)',     // 176px
  48: 'var(--space-48)',     // 192px
  52: 'var(--space-52)',     // 208px
  56: 'var(--space-56)',     // 224px
  60: 'var(--space-60)',     // 240px
  64: 'var(--space-64)',     // 256px
  72: 'var(--space-72)',     // 288px
  80: 'var(--space-80)',     // 320px
  96: 'var(--space-96)',     // 384px
} as const;

// ================================
// TYPOGRAPHY TOKENS
// ================================

export const typography = {
  fontSize: {
    xs: 'var(--font-size-xs)',       // 12px
    sm: 'var(--font-size-sm)',       // 14px
    base: 'var(--font-size-base)',   // 16px
    lg: 'var(--font-size-lg)',       // 18px
    xl: 'var(--font-size-xl)',       // 20px
    '2xl': 'var(--font-size-2xl)',   // 24px
    '3xl': 'var(--font-size-3xl)',   // 30px
    '4xl': 'var(--font-size-4xl)',   // 36px
    '5xl': 'var(--font-size-5xl)',   // 48px
    '6xl': 'var(--font-size-6xl)',   // 60px
  },
  
  lineHeight: {
    none: 'var(--line-height-none)',       // 1
    tight: 'var(--line-height-tight)',     // 1.25
    snug: 'var(--line-height-snug)',       // 1.375
    normal: 'var(--line-height-normal)',   // 1.5
    relaxed: 'var(--line-height-relaxed)', // 1.625
    loose: 'var(--line-height-loose)',     // 2
  },
  
  fontWeight: {
    thin: 'var(--font-weight-thin)',         // 100
    light: 'var(--font-weight-light)',       // 300
    normal: 'var(--font-weight-normal)',     // 400
    medium: 'var(--font-weight-medium)',     // 500
    semibold: 'var(--font-weight-semibold)', // 600
    bold: 'var(--font-weight-bold)',         // 700
    extrabold: 'var(--font-weight-extrabold)', // 800
    black: 'var(--font-weight-black)',       // 900
  },
} as const;

// ================================
// BORDER RADIUS TOKENS
// ================================

export const borderRadius = {
  none: 'var(--radius-none)',    // 0
  sm: 'var(--radius-sm)',        // 2px
  base: 'var(--radius-base)',    // 4px
  md: 'var(--radius-md)',        // 6px
  lg: 'var(--radius-lg)',        // 8px
  xl: 'var(--radius-xl)',        // 12px
  '2xl': 'var(--radius-2xl)',    // 16px
  '3xl': 'var(--radius-3xl)',    // 24px
  full: 'var(--radius-full)',    // 9999px
} as const;

// ================================
// SHADOW TOKENS
// ================================

export const shadows = {
  xs: 'var(--shadow-xs)',
  sm: 'var(--shadow-sm)',
  base: 'var(--shadow-base)',
  md: 'var(--shadow-md)',
  lg: 'var(--shadow-lg)',
  xl: 'var(--shadow-xl)',
  '2xl': 'var(--shadow-2xl)',
  inner: 'var(--shadow-inner)',
} as const;

// ================================
// Z-INDEX TOKENS
// ================================

export const zIndex = {
  0: 'var(--z-0)',         // 0
  10: 'var(--z-10)',       // 10
  20: 'var(--z-20)',       // 20
  30: 'var(--z-30)',       // 30
  40: 'var(--z-40)',       // 40
  50: 'var(--z-50)',       // 50 - Header, Navigation
  modal: 'var(--z-modal)', // 1000 - Modal Dialog
  popover: 'var(--z-popover)', // 1010 - Dropdown, Tooltip
  toast: 'var(--z-toast)',     // 1020 - Toast Notification
  max: 'var(--z-max)',         // 9999 - Always on top
} as const;

// ================================
// TRANSITION TOKENS
// ================================

export const transitions = {
  none: 'var(--transition-none)',
  all: 'var(--transition-all)',
  default: 'var(--transition-default)', // 150ms
  fast: 'var(--transition-fast)',       // 100ms
  slow: 'var(--transition-slow)',       // 300ms
} as const;

export const easing = {
  linear: 'var(--ease-linear)',
  in: 'var(--ease-in)',
  out: 'var(--ease-out)',
  inOut: 'var(--ease-in-out)',
} as const;

// ================================
// TYPE DEFINITIONS
// ================================

export type ColorScale = keyof typeof colors.brand;
export type ColorPalette = keyof typeof colors;
export type SpacingScale = keyof typeof spacing;
export type FontSize = keyof typeof typography.fontSize;
export type FontWeight = keyof typeof typography.fontWeight;
export type LineHeight = keyof typeof typography.lineHeight;
export type BorderRadius = keyof typeof borderRadius;
export type Shadow = keyof typeof shadows;
export type ZIndex = keyof typeof zIndex;
export type Transition = keyof typeof transitions;
export type Easing = keyof typeof easing;

// ================================
// UTILITY FUNCTIONS
// ================================

/**
 * Get a color value from the design tokens
 * @param palette - Color palette (brand, success, warning, etc.)
 * @param scale - Color scale (50, 100, 200, etc.)
 * @returns CSS custom property value
 * 
 * @example
 * getColor('brand', 500) // 'var(--color-brand-500)'
 * getColor('success', 600) // 'var(--color-success-600)'
 */
export function getColor(palette: ColorPalette, scale: ColorScale): string {
  return colors[palette][scale as keyof typeof colors.brand];
}

/**
 * Get a spacing value from the design tokens
 * @param scale - Spacing scale (0, 1, 2, etc.)
 * @returns CSS custom property value
 * 
 * @example
 * getSpacing(4) // 'var(--space-4)' (16px)
 * getSpacing(8) // 'var(--space-8)' (32px)
 */
export function getSpacing(scale: SpacingScale): string {
  return spacing[scale];
}

/**
 * Get a typography token
 * @param type - Typography type (fontSize, fontWeight, lineHeight)
 * @param scale - Typography scale
 * @returns CSS custom property value
 * 
 * @example
 * getTypography('fontSize', 'lg') // 'var(--font-size-lg)'
 * getTypography('fontWeight', 'bold') // 'var(--font-weight-bold)'
 */
export function getTypography<T extends keyof typeof typography>(
  type: T, 
  scale: keyof typeof typography[T]
): string {
  return typography[type][scale as keyof typeof typography[T]] as string;
}

/**
 * Create a CSS custom property
 * @param name - Custom property name (without --)
 * @param value - Custom property value
 * @returns CSS custom property definition
 * 
 * @example
 * createCustomProperty('my-color', colors.brand[500])
 * // Returns: '--my-color: var(--color-brand-500);'
 */
export function createCustomProperty(name: string, value: string): string {
  return `--${name}: ${value};`;
}

/**
 * Design token constants for common use cases
 */
export const tokens = {
  // Primary actions
  primary: {
    color: colors.brand[500],
    colorHover: colors.brand[600],
    colorActive: colors.brand[700],
    textColor: colors.neutral[0],
  },
  
  // Secondary actions  
  secondary: {
    color: colors.neutral[100],
    colorHover: colors.neutral[200],
    colorActive: colors.neutral[300],
    textColor: colors.neutral[900],
  },
  
  // Success states
  success: {
    color: colors.success[500],
    colorHover: colors.success[600],
    textColor: colors.neutral[0],
    background: colors.success[50],
    border: colors.success[200],
  },
  
  // Warning states
  warning: {
    color: colors.warning[500],
    colorHover: colors.warning[600],
    textColor: colors.neutral[900],
    background: colors.warning[50],
    border: colors.warning[200],
  },
  
  // Danger states
  danger: {
    color: colors.danger[500],
    colorHover: colors.danger[600],
    textColor: colors.neutral[0],
    background: colors.danger[50],
    border: colors.danger[200],
  },
  
  // Common spacings
  space: {
    xs: spacing[1],    // 4px
    sm: spacing[2],    // 8px
    md: spacing[4],    // 16px
    lg: spacing[6],    // 24px
    xl: spacing[8],    // 32px
    '2xl': spacing[12], // 48px
  },
  
  // Common border radius
  radius: {
    sm: borderRadius.sm,   // 2px
    md: borderRadius.md,   // 6px
    lg: borderRadius.lg,   // 8px
    full: borderRadius.full, // 9999px
  },
} as const;

// ================================
// CSS-in-JS HELPER
// ================================

/**
 * Create CSS-in-JS styles using design tokens
 * @param styles - CSS properties with design token values
 * @returns CSS-in-JS object
 * 
 * @example
 * const buttonStyles = createStyles({
 *   backgroundColor: tokens.primary.color,
 *   color: tokens.primary.textColor,
 *   padding: `${tokens.space.sm} ${tokens.space.md}`,
 *   borderRadius: tokens.radius.md,
 * });
 */
export function createStyles(styles: Record<string, string>): Record<string, string> {
  return styles;
}