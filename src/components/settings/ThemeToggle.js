import React from 'react';
import { useTheme } from '../../hooks/useTheme';
import { Icon } from '../common/Icon';
import './ThemeToggle.css';

export const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      type="button"
      className="theme-toggle-btn"
      onClick={toggleTheme}
      aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
      title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      <Icon name={theme === 'dark' ? 'sun' : 'moon'} size={20} />
    </button>
  );
};

export default ThemeToggle;
