// constants/Themes.ts
export const colorPalettes = {
  // Paleta Azul Profundo
  deepBlue: {
    primary: '#1E3A8A',      // Blue-800
    primaryLight: '#3B82F6',  // Blue-500
    primaryDark: '#1E40AF',   // Blue-700
    secondary: '#0F766E',     // Teal-600
    accent: '#F59E0B',        // Amber-500
    background: '#0F172A',    // Slate-900
    surface: '#1E293B',       // Slate-800
    surfaceLight: '#334155',  // Slate-700
    text: '#F8FAFC',          // Slate-50
    textSecondary: '#CBD5E1', // Slate-300
    textMuted: '#64748B',     // Slate-500
    border: '#475569',        // Slate-600
    success: '#10B981',       // Emerald-500
    warning: '#F59E0B',       // Amber-500
    error: '#EF4444',         // Red-500
    info: '#3B82F6',          // Blue-500
  },

  // Paleta Púrpura
  purple: {
    primary: '#7C3AED',       // Violet-600
    primaryLight: '#A855F7',  // Purple-500
    primaryDark: '#6D28D9',   // Violet-700
    secondary: '#EC4899',     // Pink-500
    accent: '#F59E0B',        // Amber-500
    background: '#1C1917',    // Stone-900
    surface: '#292524',       // Stone-800
    surfaceLight: '#44403C',  // Stone-700
    text: '#FAFAF9',          // Stone-50
    textSecondary: '#D6D3D1', // Stone-300
    textMuted: '#78716C',     // Stone-500
    border: '#57534E',        // Stone-600
    success: '#10B981',       // Emerald-500
    warning: '#F59E0B',       // Amber-500
    error: '#EF4444',         // Red-500
    info: '#A855F7',          // Purple-500
  },

  // Paleta Roja - Basada en tus colores específicos
  crimsonRed: {
    primary: '#DA1E37',       // Crimson
    primaryLight: '#E01E37',  // Poppy
    primaryDark: '#C71F37',   // Cardinal
    secondary: '#BD1F36',     // Red (NCS)
    accent: '#A71E34',        // Madder
    background: '#641220',    // Chocolate cosmos
    surface: '#6E1423',       // Burgundy
    surfaceLight: '#85182A',  // Burgundy variant
    text: '#FECACA',          // Red-200
    textSecondary: '#FCA5A5', // Red-300
    textMuted: '#F87171',     // Red-400
    border: '#A11D33',        // Madder variant
    success: '#10B981',       // Emerald-500
    warning: '#F59E0B',       // Amber-500
    error: '#EF4444',         // Red-500 (más claro para contraste)
    info: '#E01E37',          // Poppy
  },

  // Paleta Clara (para comparación)
  light: {
    primary: '#4F46E5',       // Indigo-600
    primaryLight: '#6366F1',  // Indigo-500
    primaryDark: '#4338CA',   // Indigo-700
    secondary: '#059669',     // Emerald-600
    accent: '#DC2626',        // Red-600
    background: '#F8FAFC',    // Slate-50
    surface: '#FFFFFF',       // White
    surfaceLight: '#F1F5F9',  // Slate-100
    text: '#1E293B',          // Slate-800
    textSecondary: '#475569', // Slate-600
    textMuted: '#64748B',     // Slate-500
    border: '#E2E8F0',        // Slate-200
    success: '#059669',       // Emerald-600
    warning: '#D97706',       // Amber-600
    error: '#DC2626',         // Red-600
    info: '#0284C7',          // Sky-600
  },

  // Paleta Azul Profundo - Versión Clara
  deepBlueLight: {
    primary: '#1E40AF',       // Blue-700
    primaryLight: '#3B82F6',  // Blue-500
    primaryDark: '#1E3A8A',   // Blue-800
    secondary: '#0F766E',     // Teal-600
    accent: '#F59E0B',        // Amber-500
    background: '#F0F9FF',    // Sky-50
    surface: '#FFFFFF',       // White
    surfaceLight: '#E0F2FE',  // Sky-100
    text: '#0C4A6E',          // Sky-900
    textSecondary: '#0369A1', // Sky-700
    textMuted: '#0284C7',     // Sky-600
    border: '#7DD3FC',        // Sky-300
    success: '#059669',       // Emerald-600
    warning: '#D97706',       // Amber-600
    error: '#DC2626',         // Red-600
    info: '#1E40AF',          // Blue-700
  },

  // Paleta Púrpura - Versión Clara
  purpleLight: {
    primary: '#7C3AED',       // Violet-600
    primaryLight: '#A855F7',  // Purple-500
    primaryDark: '#6D28D9',   // Violet-700
    secondary: '#EC4899',     // Pink-500
    accent: '#F59E0B',        // Amber-500
    background: '#FAF5FF',    // Violet-50
    surface: '#FFFFFF',       // White
    surfaceLight: '#F3E8FF',  // Violet-100
    text: '#581C87',          // Violet-900
    textSecondary: '#7C3AED', // Violet-600
    textMuted: '#8B5CF6',     // Violet-500
    border: '#C4B5FD',        // Violet-300
    success: '#059669',       // Emerald-600
    warning: '#D97706',       // Amber-600
    error: '#DC2626',         // Red-600
    info: '#7C3AED',          // Violet-600
  },

  // Paleta Roja Carmesí - Versión Clara
  crimsonRedLight: {
    primary: '#DC2626',       // Red-600
    primaryLight: '#EF4444',  // Red-500
    primaryDark: '#B91C1C',   // Red-700
    secondary: '#F97316',     // Orange-500
    accent: '#F59E0B',        // Amber-500
    background: '#FEF2F2',    // Red-50
    surface: '#FFFFFF',       // White
    surfaceLight: '#FEE2E2',  // Red-100
    text: '#7F1D1D',          // Red-900
    textSecondary: '#B91C1C', // Red-700
    textMuted: '#DC2626',     // Red-600
    border: '#FCA5A5',        // Red-300
    success: '#059669',       // Emerald-600
    warning: '#D97706',       // Amber-600
    error: '#DC2626',         // Red-600
    info: '#DC2626',          // Red-600
  }
};

// Configuración común para todos los temas
export const commonThemeConfig = {
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },
  borderRadius: {
    xs: 4,
    sm: 6,
    md: 8,
    lg: 12,
    xl: 16,
    full: 9999,
  },
  typography: {
    h1: { 
      fontSize: 32, 
      fontWeight: 'bold' as const,
      lineHeight: 40 
    },
    h2: { 
      fontSize: 24, 
      fontWeight: '600' as const,
      lineHeight: 32 
    },
    h3: { 
      fontSize: 20, 
      fontWeight: '600' as const,
      lineHeight: 28 
    },
    body: { 
      fontSize: 16, 
      fontWeight: '400' as const,
      lineHeight: 24 
    },
    bodySmall: { 
      fontSize: 14, 
      fontWeight: '400' as const,
      lineHeight: 20 
    },
    caption: { 
      fontSize: 12, 
      fontWeight: '400' as const,
      lineHeight: 16 
    },
    button: { 
      fontSize: 16, 
      fontWeight: '600' as const,
      lineHeight: 24 
    },
  },
  shadows: {
    small: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 3.84,
      elevation: 5,
    },
    medium: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 6.27,
      elevation: 10,
    },
    large: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.2,
      shadowRadius: 10.32,
      elevation: 16,
    }
  }
};

// Crear temas completos combinando paletas con configuración común
export const themes = {
  light: {
    ...commonThemeConfig,
    colors: colorPalettes.light,
    name: 'Claro',
    isDark: false,
  },
  deepBlue: {
    ...commonThemeConfig,
    colors: colorPalettes.deepBlue,
    name: 'Azul Profundo',
    isDark: true,
  },
  deepBlueLight: {
    ...commonThemeConfig,
    colors: colorPalettes.deepBlueLight,
    name: 'Azul Profundo Claro',
    isDark: false,
  },
  purple: {
    ...commonThemeConfig,
    colors: colorPalettes.purple,
    name: 'Púrpura',
    isDark: true,
  },
  purpleLight: {
    ...commonThemeConfig,
    colors: colorPalettes.purpleLight,
    name: 'Púrpura Claro',
    isDark: false,
  },
  crimsonRed: {
    ...commonThemeConfig,
    colors: colorPalettes.crimsonRed,
    name: 'Rojo Carmesí',
    isDark: true,
  },
  crimsonRedLight: {
    ...commonThemeConfig,
    colors: colorPalettes.crimsonRedLight,
    name: 'Rojo Carmesí Claro',
    isDark: false,
  }
} as const;

// Tipos TypeScript para autocompletado
export type ThemeName = keyof typeof themes;
export type Theme = typeof themes.light;
export type ColorPalette = typeof colorPalettes.light;

// Helper para agregar nuevos temas fácilmente
export function createCustomTheme(
  name: string,
  colors: ColorPalette,
  isDark: boolean = false,
  customConfig?: Partial<typeof commonThemeConfig>
) {
  return {
    ...commonThemeConfig,
    ...customConfig,
    colors,
    name,
    isDark,
  };
}

// Utilidades para trabajar con colores
export const colorUtils = {
  // Función para obtener un color con opacidad
  withOpacity: (color: string, opacity: number) => {
    // Si el color ya tiene opacidad (rgba), reemplazarla
    if (color.includes('rgba')) {
      return color.replace(/[\d\.]+\)$/g, `${opacity})`);
    }
    // Si es hex, convertir a rgba
    if (color.startsWith('#')) {
      const hex = color.replace('#', '');
      const r = parseInt(hex.substr(0, 2), 16);
      const g = parseInt(hex.substr(2, 2), 16);
      const b = parseInt(hex.substr(4, 2), 16);
      return `rgba(${r}, ${g}, ${b}, ${opacity})`;
    }
    return color;
  },
  
  // Función para obtener color de contraste
  getContrastColor: (backgroundColor: string, lightColor: string = '#FFFFFF', darkColor: string = '#000000') => {
    // Lógica simple para determinar si usar texto claro u oscuro
    // En un caso real, podrías usar una librería como chroma-js
    const darkBackgrounds = ['deepBlue', 'purple', 'crimsonRed'];
    return darkBackgrounds.some(theme => backgroundColor.includes(theme)) ? lightColor : darkColor;
  }
};
