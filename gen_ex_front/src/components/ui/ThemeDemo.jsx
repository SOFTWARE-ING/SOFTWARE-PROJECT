import React, { useEffect } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { themes } from '../../themes';

/**
 * Theme demo component that cycles through themes
 */
export const ThemeDemo = () => {
  const { setTheme } = useTheme();
  const themeIds = Object.keys(themes);

  useEffect(() => {
    let index = 0;
    const interval = setInterval(() => {
      setTheme(themeIds[index]);
      index = (index + 1) % themeIds.length;
    }, 3000); // Change theme every 3 seconds

    return () => clearInterval(interval);
  }, [setTheme, themeIds]);

  return (
    <div className="fixed top-4 right-4 z-50 glass-card p-4 max-w-xs">
      <h3 className="text-sm font-medium text-primary mb-2">Theme Demo</h3>
      <p className="text-xs text-muted">
        Themes change automatically every 3 seconds
      </p>
      <div className="mt-2 flex space-x-2">
        {themeIds.map((themeId) => (
          <div
            key={themeId}
            className="w-3 h-3 rounded-full border border-primary"
            style={{
              backgroundColor: `hsl(${themes[themeId].colors['--accent-primary']})`
            }}
          />
        ))}
      </div>
    </div>
  );
};