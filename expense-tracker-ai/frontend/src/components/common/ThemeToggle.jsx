import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

export const ThemeToggle = ({ className = '', style = {} }) => {
  const { theme, toggleTheme, isDark } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={`theme-toggle-btn ${className}`}
      title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      aria-label={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      style={{
        width: '36px',
        height: '36px',
        ...style,
      }}
    >
      {isDark ? (
        <Sun size={18} style={{ color: '#FBBF24', transition: 'transform 0.3s ease' }} />
      ) : (
        <Moon size={18} style={{ color: '#6366F1', transition: 'transform 0.3s ease' }} />
      )}
    </button>
  );
};
