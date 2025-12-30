import React, { createContext, useContext, useEffect, useState } from 'react';
import { themes } from '../themes';

/**
 * Theme context types
 * @typedef {keyof typeof themes | 'system'} Theme
 */

/**
 * Theme context
 */
const ThemeContext = createContext({
  theme: 'system',
  setTheme: () => {},
  actualTheme: 'frost',
  currentThemeData: themes.frost,
});

/**
 * Theme provider component
 */
export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    // Load from localStorage or default to 'system'
    return localStorage.getItem('genex-theme') || 'system';
  });

  const [actualTheme, setActualTheme] = useState('frost');
  const [currentThemeData, setCurrentThemeData] = useState(themes.frost);

  useEffect(() => {
    let effectiveTheme;

    if (theme === 'system') {
      effectiveTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'onyx' : 'frost';
    } else {
      effectiveTheme = theme;
    }

    // Apply theme directly in effect to avoid setState in effect
    const root = window.document.documentElement;
    const themeData = themes[effectiveTheme];

    if (themeData) {
      // Apply CSS variables
      Object.entries(themeData.colors).forEach(([property, value]) => {
        root.style.setProperty(property, value);
      });

      // Set data attribute for additional styling
      root.setAttribute('data-theme', effectiveTheme);

      // eslint-disable-next-line react-hooks/set-state-in-effect
      setCurrentThemeData(themeData);
    }

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setActualTheme(effectiveTheme);

    // Save to localStorage
    localStorage.setItem('genex-theme', theme);
  }, [theme]);

  // Listen for system theme changes when in system mode
  useEffect(() => {
    if (theme !== 'system') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const handleChange = () => {
      const newThemeId = mediaQuery.matches ? 'onyx' : 'frost';

      // Apply theme directly
      const root = window.document.documentElement;
      const themeData = themes[newThemeId];

      if (themeData) {
        Object.entries(themeData.colors).forEach(([property, value]) => {
          root.style.setProperty(property, value);
        });
        root.setAttribute('data-theme', newThemeId);
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setCurrentThemeData(themeData);
      }

      // eslint-disable-next-line react-hooks/set-state-in-effect
      setActualTheme(newThemeId);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme]);

  const value = {
    theme,
    setTheme,
    actualTheme,
    currentThemeData
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

/**
 * Hook to use theme context
 */
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};