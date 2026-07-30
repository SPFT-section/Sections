// Typography configuration

export const typographyConfig = {
  // Scale ratio (Modular Scale)
  scaleRatio: 1.25,

  // Base font size in px
  baseSize: 16,

  // Font families
  fontFamilies: {
    primary: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    secondary: '"Georgia", "Merriweather", "Times New Roman", serif',
    mono: '"JetBrains Mono", "Fira Code", "Courier New", monospace',
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

  // Generate typography scale
  getScale: () => {
    const ratio = typographyConfig.scaleRatio;
    const base = typographyConfig.baseSize;

    return {
      xs: `${base / Math.pow(ratio, 4)}px`,
      sm: `${base / Math.pow(ratio, 3)}px`,
      base: `${base}px`,
      lg: `${base * ratio}px`,
      xl: `${base * Math.pow(ratio, 2)}px`,
      '2xl': `${base * Math.pow(ratio, 3)}px`,
      '3xl': `${base * Math.pow(ratio, 4)}px`,
      '4xl': `${base * Math.pow(ratio, 5)}px`,
      '5xl': `${base * Math.pow(ratio, 6)}px`,
    };
  },

  // Get CSS variables for typography
  getCSSVariables: () => {
    const scale = typographyConfig.getScale();
    const families = typographyConfig.fontFamilies;
    const weights = typographyConfig.weights;
    const lineHeights = typographyConfig.lineHeights;
    const tracking = typographyConfig.tracking;

    return {
      '--font-primary': families.primary,
      '--font-secondary': families.secondary,
      '--font-mono': families.mono,
      '--text-xs': scale.xs,
      '--text-sm': scale.sm,
      '--text-base': scale.base,
      '--text-lg': scale.lg,
      '--text-xl': scale.xl,
      '--text-2xl': scale['2xl'],
      '--text-3xl': scale['3xl'],
      '--text-4xl': scale['4xl'],
      '--text-5xl': scale['5xl'],
      '--weight-light': weights.light,
      '--weight-normal': weights.normal,
      '--weight-medium': weights.medium,
      '--weight-semibold': weights.semibold,
      '--weight-bold': weights.bold,
      '--leading-tight': lineHeights.tight,
      '--leading-normal': lineHeights.normal,
      '--leading-relaxed': lineHeights.relaxed,
      '--leading-loose': lineHeights.loose,
      '--tracking-tight': tracking.tight,
      '--tracking-normal': tracking.normal,
      '--tracking-wide': tracking.wide,
      '--tracking-wider': tracking.wider,
    };
  },
};

export default typographyConfig;
