import React from 'react';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import { Sun, Moon, Monitor } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

/**
 * Theme switcher component with smooth animations
 */
export const ThemeSwitcher = () => {
  const { theme, setTheme } = useTheme();

  const themes = [
    { key: 'light', icon: Sun, label: 'Light' },
    { key: 'dark', icon: Moon, label: 'Dark' },
    { key: 'system', icon: Monitor, label: 'System' }
  ];

  return (
    <div className="flex items-center space-x-1 glass border border-primary rounded-2xl p-1 shadow-lg">
      {/* eslint-disable-next-line no-unused-vars */}
      {themes.map(({ key, icon: Icon, label }) => (
        <button
          key={key}
          onClick={() => setTheme(key)}
          className={`relative flex items-center justify-center w-8 h-8 rounded-xl transition-all duration-200 ${
            theme === key
              ? 'text-accent-primary'
              : 'text-muted hover:text-primary'
          }`}
          title={label}
        >
          <Icon size={16} />
          {theme === key && (
            <motion.div
              layoutId="activeTheme"
              className="absolute inset-0 bg-accent-primary/10 rounded-xl border border-accent-primary/20"
              initial={false}
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            />
          )}
        </button>
      ))}
    </div>
  );
};