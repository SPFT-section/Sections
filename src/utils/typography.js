// Typography utilities

export const typography = {
  // Font families
  fonts: {
    primary: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    secondary: 'Georgia, "Merriweather", "Times New Roman", serif',
    mono: '"JetBrains Mono", "Fira Code", "Courier New", monospace',
  },

  // Font sizes (in rem)
  sizes: {
    xs: '0.75rem',
    sm: '0.875rem',
    base: '1rem',
    lg: '1.125rem',
    xl: '1.25rem',
    '2xl': '1.563rem',
    '3xl': '1.953rem',
    '4xl': '2.441rem',
    '5xl': '3.052rem',
  },

  // Font weights
  weights: {
    light: 300,
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },

  // Line heights
  lineHeights: {
    tight: 1.25,
    normal: 1.5,
    relaxed: 1.625,
    loose: 2,
  },

  // Letter spacing
  tracking: {
    tight: '-0.025em',
    normal: '0',
    wide: '0.025em',
    wider: '0.05em',
  },

  // Get font size in px
  getSizeInPx: (size) => {
    const sizes = {
      xs: 12,
      sm: 14,
      base: 16,
      lg: 18,
      xl: 20,
      '2xl': 25,
      '3xl': 31,
      '4xl': 39,
      '5xl': 49,
    };
    return sizes[size] || 16;
  },

  // Get font size in rem
  getSizeInRem: (size) => {
    return typography.sizes[size] || '1rem';
  },

  // Generate typography scale
  getScale: () => {
    return {
      xs: { fontSize: typography.sizes.xs, lineHeight: typography.lineHeights.normal },
      sm: { fontSize: typography.sizes.sm, lineHeight: typography.lineHeights.normal },
      base: { fontSize: typography.sizes.base, lineHeight: typography.lineHeights.relaxed },
      lg: { fontSize: typography.sizes.lg, lineHeight: typography.lineHeights.relaxed },
      xl: { fontSize: typography.sizes.xl, lineHeight: typography.lineHeights.relaxed },
      '2xl': { fontSize: typography.sizes['2xl'], lineHeight: typography.lineHeights.tight },
      '3xl': { fontSize: typography.sizes['3xl'], lineHeight: typography.lineHeights.tight },
      '4xl': { fontSize: typography.sizes['4xl'], lineHeight: typography.lineHeights.tight },
      '5xl': { fontSize: typography.sizes['5xl'], lineHeight: typography.lineHeights.tight },
    };
  },

  // Get CSS for reading
  getReadingCSS: (settings) => {
    const { fontSize, fontFamily, lineHeight, letterSpacing, margin } = settings;
    return {
      fontSize: `${fontSize}px`,
      fontFamily: fontFamily || typography.fonts.primary,
      lineHeight: lineHeight || typography.lineHeights.relaxed,
      letterSpacing: `${letterSpacing || 0}px`,
      padding: `${margin || 20}px`,
    };
  },
};
