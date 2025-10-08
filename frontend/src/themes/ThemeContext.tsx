import React, { createContext, useContext, useEffect, useState } from 'react';
import './spring.css';
import './summer.css';
import './autumn.css';
import './winter.css';

type Theme = 'winter' | 'spring' | 'summer' | 'autumn';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  availableThemes: Theme[];
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const availableThemes: Theme[] = ['winter', 'spring', 'summer', 'autumn'];

const getSeasonalTheme = (): Theme => {
  const month = new Date().getMonth(); // 0-11
  if (month >= 11 || month <= 1) return 'winter'; // Dec, Jan, Feb
  if (month >= 2 && month <= 4) return 'spring'; // Mar, Apr, May
  if (month >= 5 && month <= 7) return 'summer'; // Jun, Jul, Aug
  return 'autumn'; // Sep, Oct, Nov
};

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<Theme>(() => {
    // Try to get theme from localStorage with expiration check
    try {
      const savedData = localStorage.getItem('themeData');
      if (savedData) {
        const parsed = JSON.parse(savedData);
        const { theme: savedTheme, expiry } = parsed;
        if (Date.now() < expiry && availableThemes.includes(savedTheme)) {
          return savedTheme;
        }
      }
    } catch (error) {
      console.warn('Failed to parse theme data from localStorage:', error);
      localStorage.removeItem('themeData');
    }
    return getSeasonalTheme();
  });

  useEffect(() => {
    // Update data-theme attribute when theme changes
    if (availableThemes.includes(theme)) {
      document.documentElement.setAttribute('data-theme', theme);
      // Save theme with 1 week expiration
      try {
        const expiry = Date.now() + (7 * 24 * 60 * 60 * 1000);
        localStorage.setItem('themeData', JSON.stringify({ theme, expiry }));
      } catch (error) {
        console.warn('Failed to save theme to localStorage:', error);
      }
    }
  }, [theme]);

  const setTheme = (newTheme: Theme) => {
    if (availableThemes.includes(newTheme)) {
      setThemeState(newTheme);
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, availableThemes }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};