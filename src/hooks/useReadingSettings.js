import React, { createContext, useContext } from 'react';
import { useLocalStorage } from './useLocalStorage';

const defaultSettings = {
  fontSize: 16,
  fontFamily: 'Inter',
  lineHeight: 1.6,
  letterSpacing: 0.5,
  margin: 20,
  theme: 'light',
};

const ReadingSettingsContext = createContext(null);

// Shared across the app via context (see NovelProvider for rationale) so a
// change made in the reader immediately reflects in Profile and vice versa.
const useReadingSettingsState = () => {
  const [settings, setSettings] = useLocalStorage(
    'stq-reading-settings',
    defaultSettings
  );

  const updateSetting = (key, value) => {
    setSettings((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const resetSettings = () => {
    setSettings(defaultSettings);
  };

  const getFontFamilyClass = () => {
    const fontMap = {
      Inter: 'font-primary',
      Georgia: 'font-secondary',
      'JetBrains Mono': 'font-mono',
    };
    return fontMap[settings.fontFamily] || 'font-primary';
  };

  const getReadingStyles = () => {
    return {
      fontSize: `${settings.fontSize}px`,
      fontFamily: settings.fontFamily,
      lineHeight: settings.lineHeight,
      letterSpacing: `${settings.letterSpacing}px`,
      margin: `${settings.margin}px`,
    };
  };

  return {
    settings,
    updateSetting,
    resetSettings,
    getFontFamilyClass,
    getReadingStyles,
  };
};

export const ReadingSettingsProvider = ({ children }) => {
  const value = useReadingSettingsState();
  return (
    <ReadingSettingsContext.Provider value={value}>
      {children}
    </ReadingSettingsContext.Provider>
  );
};

export const useReadingSettings = () => {
  const ctx = useContext(ReadingSettingsContext);
  if (!ctx) {
    throw new Error('useReadingSettings must be used within a <ReadingSettingsProvider>');
  }
  return ctx;
};
