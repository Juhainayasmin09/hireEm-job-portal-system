import React, { createContext, useContext, useLayoutEffect, useState } from 'react';
import { storage } from '../services/storage';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Initialize state synchronously from storage to prevent flash
  const [theme, setThemeState] = useState<Theme>(() => {
    if (typeof window === 'undefined') return 'light';
    
    // 1. Check Local Storage (Guest/Device preference)
    const savedTheme = localStorage.getItem('theme') as Theme;
    if (savedTheme === 'dark' || savedTheme === 'light') {
      return savedTheme;
    }
    
    // 2. Check User Profile from storage if logged in (Server/User preference)
    const user = storage.getCurrentUser();
    if (user?.themePreference === 'dark' || user?.themePreference === 'light') {
      return user.themePreference;
    }

    // 3. Default to Light (Strict requirement: Do NOT auto-detect system theme)
    return 'light';
  });

  // Apply theme to DOM immediately before paint
  useLayoutEffect(() => {
    const root = document.documentElement;
    
    // Clean up classes
    root.classList.remove('light', 'dark');
    
    // Apply current theme
    root.classList.add(theme);
    root.setAttribute('data-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
  };

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem('theme', newTheme);
    
    // Persist to user profile if logged in
    const user = storage.getCurrentUser();
    if (user) {
      storage.updateProfile({ ...user, themePreference: newTheme });
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within a ThemeProvider');
  return context;
};