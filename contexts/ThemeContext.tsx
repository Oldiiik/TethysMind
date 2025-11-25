import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { getSettings, updateSettings } from '../utils/api';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  isLoading: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('light');
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  // Load theme on mount and when user changes
  useEffect(() => {
    const loadTheme = async () => {
      try {
        if (user?.id) {
          // Load theme from server for authenticated users
          const settings = await getSettings(user.id);
          const savedTheme = (settings.theme || 'light') as Theme;
          applyTheme(savedTheme);
        } else {
          // For non-authenticated users, use localStorage or system preference
          const localTheme = localStorage.getItem('theme') as Theme | null;
          const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
          const initialTheme = localTheme || (prefersDark ? 'dark' : 'light');
          applyTheme(initialTheme);
        }
      } catch (error) {
        console.error('Error loading theme:', error);
        // Fallback to localStorage or system preference
        const localTheme = localStorage.getItem('theme') as Theme | null;
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        const initialTheme = localTheme || (prefersDark ? 'dark' : 'light');
        applyTheme(initialTheme);
      } finally {
        setIsLoading(false);
      }
    };

    loadTheme();
  }, [user?.id]);

  const applyTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const setTheme = async (newTheme: Theme) => {
    applyTheme(newTheme);
    
    // Save to localStorage
    localStorage.setItem('theme', newTheme);
    
    // Save to server if user is authenticated
    if (user?.id) {
      try {
        await updateSettings({ theme: newTheme }, user.id);
      } catch (error) {
        console.error('Error saving theme:', error);
      }
    }
  };

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme, isLoading }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
