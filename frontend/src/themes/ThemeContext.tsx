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

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<Theme>(() => {
    // Try to get theme from localStorage, default to spring
    const savedTheme = localStorage.getItem('theme') as Theme;
    return availableThemes.includes(savedTheme) ? savedTheme : 'spring';
  });

  useEffect(() => {
    // Update data-theme attribute when theme changes
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
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