// hooks/useTheme.ts
import { ThemeName, themes } from '@/constants/Themes';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';

// Inferir el tipo Theme de los temas existentes
export type Theme = (typeof themes)[keyof typeof themes];

interface ThemeContextType {
  currentTheme: ThemeName;
  theme: Theme;
  setTheme: (themeName: ThemeName) => Promise<void>;
  availableThemes: { name: ThemeName; displayName: string; isDark: boolean }[];
  isLoading: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = '@studyvault_theme';

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [currentTheme, setCurrentTheme] = useState<ThemeName>('light');
  const [isLoading, setIsLoading] = useState(true);

  // Cargar tema guardado al iniciar la app
  useEffect(() => {
    loadSavedTheme();
  }, []);

  const loadSavedTheme = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY);
      if (savedTheme && savedTheme in themes) {
        setCurrentTheme(savedTheme as ThemeName);
      }
    } catch (error) {
      console.error('Error loading saved theme:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const setTheme = async (themeName: ThemeName) => {
    try {
      setCurrentTheme(themeName);
      await AsyncStorage.setItem(THEME_STORAGE_KEY, themeName);
    } catch (error) {
      console.error('Error saving theme:', error);
    }
  };

  // Lista de temas disponibles con información adicional
  const availableThemes = Object.entries(themes).map(([key, theme]) => ({
    name: key as ThemeName,
    displayName: theme.name,
    isDark: theme.isDark,
  }));

  const value: ThemeContextType = {
    currentTheme,
    theme: themes[currentTheme],
    setTheme,
    availableThemes,
    isLoading,
  };

  return React.createElement(
    ThemeContext.Provider,
    { value },
    children
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

// Hook adicional para obtener solo los colores (más ligero)
export function useColors() {
  const { theme } = useTheme();
  return theme.colors;
}

// Hook para obtener estilos comunes
export function useCommonStyles() {
  const { theme } = useTheme();
  
  return {
    // Contenedores
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    card: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.md,
      padding: theme.spacing.md,
      ...theme.shadows.small,
    },
    cardFlat: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.md,
      padding: theme.spacing.md,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    
    // Textos
    title: {
      ...theme.typography.h2,
      color: theme.colors.text,
    },
    subtitle: {
      ...theme.typography.h3,
      color: theme.colors.text,
    },
    body: {
      ...theme.typography.body,
      color: theme.colors.text,
    },
    caption: {
      ...theme.typography.caption,
      color: theme.colors.textMuted,
    },
    
    // Botones
    primaryButton: {
      backgroundColor: theme.colors.primary,
      paddingVertical: theme.spacing.sm,
      paddingHorizontal: theme.spacing.md,
      borderRadius: theme.borderRadius.md,
      alignItems: 'center' as const,
    },
    primaryButtonText: {
      ...theme.typography.button,
      color: '#FFFFFF',
    },
    secondaryButton: {
      backgroundColor: 'transparent',
      paddingVertical: theme.spacing.sm,
      paddingHorizontal: theme.spacing.md,
      borderRadius: theme.borderRadius.md,
      borderWidth: 1,
      borderColor: theme.colors.primary,
      alignItems: 'center' as const,
    },
    secondaryButtonText: {
      ...theme.typography.button,
      color: theme.colors.primary,
    },
    
    // Inputs
    input: {
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: theme.borderRadius.md,
      paddingVertical: theme.spacing.sm,
      paddingHorizontal: theme.spacing.md,
      color: theme.colors.text,
      ...theme.typography.body,
    },
    
    // Separadores
    divider: {
      height: 1,
      backgroundColor: theme.colors.border,
      marginVertical: theme.spacing.md,
    },
    
    // Estados
    success: {
      backgroundColor: theme.colors.success,
    },
    warning: {
      backgroundColor: theme.colors.warning,
    },
    error: {
      backgroundColor: theme.colors.error,
    },
    info: {
      backgroundColor: theme.colors.info,
    },
  };
}
