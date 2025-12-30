import React from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../../contexts/ThemeContext';
import { themes } from '../../themes';
import { Check } from 'lucide-react';

/**
 * Theme preview card component
 */
const ThemeCard = ({ themeData, isActive, onClick }) => {
  const { colors } = themeData;

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`relative cursor-pointer rounded-xl border-2 overflow-hidden transition-all duration-200 ${
        isActive
          ? 'border-indigo-500 shadow-lg shadow-indigo-500/20'
          : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
      }`}
      onClick={onClick}
    >
      {/* Theme Preview */}
      <div
        className="h-24 p-3 flex items-end justify-between"
        style={{
          backgroundColor: `hsl(${colors['--bg-primary']})`,
          color: `hsl(${colors['--text-primary']})`
        }}
      >
        <div className="space-y-1">
          <div
            className="h-1.5 rounded-full w-8"
            style={{ backgroundColor: `hsl(${colors['--text-secondary']})` }}
          />
          <div
            className="h-1.5 rounded-full w-6"
            style={{ backgroundColor: `hsl(${colors['--text-muted']})` }}
          />
        </div>
        <div
          className="h-6 w-6 rounded-md"
          style={{ backgroundColor: `hsl(${colors['--accent-primary']})` }}
        />
      </div>

      {/* Theme Info */}
      <div className="p-3 bg-white dark:bg-slate-800">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-medium text-slate-900 dark:text-slate-100 text-sm">
              {themeData.name}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {themeData.description}
            </p>
          </div>
          {isActive && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="w-5 h-5 bg-indigo-500 rounded-full flex items-center justify-center"
            >
              <Check size={12} className="text-white" />
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

/**
 * Theme gallery component for theme selection
 */
export const ThemeGallery = () => {
  const { actualTheme, setTheme } = useTheme();

  const handleThemeChange = (themeId) => {
    setTheme(themeId);
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">
          Choose Theme
        </h3>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Select a theme that suits your style and enhances your productivity
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Object.values(themes).map((themeData) => (
          <ThemeCard
            key={themeData.id}
            themeData={themeData}
            isActive={actualTheme === themeData.id}
            onClick={() => handleThemeChange(themeData.id)}
          />
        ))}
      </div>

      <div className="flex items-center justify-center pt-4">
        <button
          onClick={() => handleThemeChange('system')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            actualTheme === 'system'
              ? 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
          }`}
        >
          Sync with System
        </button>
      </div>
    </div>
  );
};