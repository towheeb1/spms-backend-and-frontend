// src/contexts/ThemeContext.tsx
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(() => {
    // محاولة الحصول على الثيم المحفوظ
    const savedTheme = localStorage.getItem('theme') as Theme | null;
    if (savedTheme) return savedTheme;
    
    // أو استخدام تفضيلات النظام
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    
    return 'dark'; // افتراضياً وضع ليلي
  });

  useEffect(() => {
    const root = document.documentElement;
    
    // إزالة الكلاس القديم وإضافة الجديد
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
    
    // Apply CSS variables for quick theme adjustments
    if (theme === 'dark') {
      root.style.setProperty('--bg-primary', '#0b0f14');
      root.style.setProperty('--card-bg', '#0f1724');
      root.style.setProperty('--text-primary', '#e6eef8');
      root.style.setProperty('--muted', '#9aa6b2');
      root.style.setProperty('--button-bg', 'rgba(255,255,255,0.06)');
      root.style.setProperty('--button-text', '#e6eef8');
      root.style.setProperty('--accent', '#0b5c5f');
    } else {
      root.style.setProperty('--bg-primary', '#ffffff');
      root.style.setProperty('--card-bg', '#f8fafc');
      root.style.setProperty('--text-primary', '#0f1724');
      root.style.setProperty('--muted', '#6b7280');
      root.style.setProperty('--button-bg', 'rgba(15,23,36,0.05)');
      root.style.setProperty('--button-text', '#0f1724');
      root.style.setProperty('--accent', '#0b5c5f');
    }

    // حفظ التفضيل
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setThemeState(prev => prev === 'dark' ? 'light' : 'dark');
  };

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
}
