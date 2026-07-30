import React, { createContext, useContext, useEffect } from 'react';
import { useLocalStorage } from './useLocalStorage';

const ThemeContext = createContext(null);

// Shared via context so toggling the theme anywhere updates the whole app
// in one render instead of only the component that owns its own copy.
const useThemeState = () => {
  const [theme, setTheme] = useLocalStorage('stq-theme', 'light');

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.setAttribute('data-theme', 'dark');
    } else {
      root.removeAttribute('data-theme');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  return { theme, toggleTheme, setTheme };
};

export const ThemeProvider = ({ children }) => {
  const value = useThemeState();
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error('useTheme must be used within a <ThemeProvider>');
  }
  return ctx;
};
