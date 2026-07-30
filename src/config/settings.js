// Application settings

export const settings = {
  // Application settings
  app: {
    name: 'SECTiON',
    slogan: 'SECTiON — พื้นที่เขียนและอ่านนิยายในแบบของคุณ',
    version: '1.0.0',
  },

  // Storage settings
  storage: {
    prefix: 'stq-',
    defaultKey: 'stq-app',
    version: 1,
  },

  // UI settings
  ui: {
    defaultTheme: 'light',
    sidebarWidth: 280,
    headerHeight: 64,
    maxWidth: 1200,
    borderRadius: 8,
    transitionDuration: 300,
  },

  // Novel settings
  novel: {
    maxTitleLength: 100,
    maxAuthorLength: 50,
    maxSynopsisLength: 500,
    maxGenreCount: 5,
    defaultStatus: 'draft',
    maxChaptersPerNovel: 999,
  },

  // Reading settings
  reading: {
    minFontSize: 12,
    maxFontSize: 32,
    defaultFontSize: 16,
    minLineHeight: 1.2,
    maxLineHeight: 2.4,
    defaultLineHeight: 1.6,
    minMargin: 0,
    maxMargin: 80,
    defaultMargin: 20,
  },

  // History settings
  history: {
    maxItems: 100,
    autoSaveInterval: 5000,
  },

  // Export settings
  export: {
    formats: ['json', 'txt', 'markdown'],
    defaultFormat: 'json',
  },
};

export const getSettings = (key) => {
  return settings[key] || null;
};

export const updateSettings = (key, value) => {
  if (settings[key]) {
    settings[key] = { ...settings[key], ...value };
    return true;
  }
  return false;
};
