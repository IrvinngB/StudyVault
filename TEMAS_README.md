# 🎨 Sistema de Temas StudyVault - Guía Completa para Desarrolladores

## 📋 Índice
1. [Descripción General](#descripción-general)
2. [Temas Disponibles](#temas-disponibles)
3. [Instalación y Configuración](#instalación-y-configuración)
4. [Guía de Uso](#guía-de-uso)
5. [Arquitectura del Sistema](#arquitectura-del-sistema)
6. [Crear Nuevos Temas](#crear-nuevos-temas)
7. [Componentes Temáticos](#componentes-temáticos)
8. [API de Referencia](#api-de-referencia)
9. [Mejores Prácticas](#mejores-prácticas)
10. [Troubleshooting](#troubleshooting)

---

## Descripción General

StudyVault incluye un sistema de temas **robusto, escalable y type-safe** que permite cambiar dinámicamente entre diferentes esquemas de colores. El sistema está diseñado con los siguientes principios:

- ✅ **Fácil de usar**: Cambia temas con un solo tap
- ✅ **Escalable**: Agrega nuevos temas sin modificar código existente
- ✅ **Consistente**: Todos los componentes se adaptan automáticamente
- ✅ **Type-Safe**: Full TypeScript con autocompletado e IntelliSense
- ✅ **Persistente**: Recuerda la preferencia del usuario
- ✅ **Performante**: Optimizado para React Native

---

## Temas Disponibles

### 🌈 **7 Temas Incluidos**

| Tema | Nombre Técnico | Tipo | Descripción | Uso Recomendado |
|------|----------------|------|-------------|-----------------|
| 🌟 | `light` | Claro | Tema claro estándar | Uso diurno general |
| 🌊 | `deepBlue` | Oscuro | Azul profesional nocturno | Estudio nocturno, concentración |
| 🌅 | `deepBlueLight` | Claro | Azul profesional diurno | Trabajo profesional diurno |
| 💜 | `purple` | Oscuro | Púrpura elegante nocturno | Creatividad, diseño nocturno |
| � | `purpleLight` | Claro | Púrpura elegante diurno | Creatividad, diseño diurno |
| 🔴 | `crimsonRed` | Oscuro | Rojo intenso nocturno | Urgencia, exámenes nocturnos |
| 🌹 | `crimsonRedLight` | Claro | Rojo intenso diurno | Urgencia, exámenes diurnos |

### 🎨 **Paletas de Colores Detalladas**

#### 🌟 Light (Tema Base)
```typescript
{
  primary: '#4F46E5',       // Indigo-600 - Color principal
  primaryLight: '#6366F1',  // Indigo-500 - Variante clara  
  primaryDark: '#4338CA',   // Indigo-700 - Variante oscura
  secondary: '#059669',     // Emerald-600 - Color secundario
  accent: '#DC2626',        // Red-600 - Color de acento
  background: '#F8FAFC',    // Slate-50 - Fondo principal
  surface: '#FFFFFF',       // White - Superficies/tarjetas
  surfaceLight: '#F1F5F9',  // Slate-100 - Superficies claras
  text: '#1E293B',          // Slate-800 - Texto principal
  textSecondary: '#475569', // Slate-600 - Texto secundario
  textMuted: '#64748B',     // Slate-500 - Texto atenuado
  border: '#E2E8F0',        // Slate-200 - Bordes
  success: '#059669',       // Emerald-600 - Estados exitosos
  warning: '#D97706',       // Amber-600 - Advertencias
  error: '#DC2626',         // Red-600 - Errores
  info: '#0284C7',          // Sky-600 - Información
}
```

#### 🌊 Deep Blue (Oscuro)
```typescript
{
  primary: '#1E3A8A',       // Blue-800
  background: '#0F172A',    // Slate-900
  surface: '#1E293B',       // Slate-800
  text: '#F8FAFC',          // Slate-50
  // ... resto de colores optimizados para tema oscuro
}
```

#### 🌅 Deep Blue Light (Claro)
```typescript
{
  primary: '#1E40AF',       // Blue-700
  background: '#F0F9FF',    // Sky-50
  surface: '#FFFFFF',       // White
  text: '#0C4A6E',          // Sky-900
  // ... resto de colores optimizados para tema claro
}
```

---

## Instalación y Configuración

### 📦 **Dependencias Requeridas**

```bash
npm install @react-native-async-storage/async-storage
# o si usas Expo:
npx expo install @react-native-async-storage/async-storage
```

### ⚙️ **Configuración Inicial**

1. **Agregar el ThemeProvider** en tu app principal (`app/_layout.tsx`):

```tsx
import { ThemeProvider as CustomThemeProvider } from '@/hooks/useTheme';

export default function RootLayout() {
  return (
    <CustomThemeProvider>
      {/* Tu app aquí */}
    </CustomThemeProvider>
  );
}
```

2. **Verificar estructura de archivos**:
```
constants/
  └── Themes.ts          // ✅ Definiciones de temas
hooks/
  └── useTheme.ts        // ✅ Hook principal
utils/
  └── createStyles.ts    // ✅ Utilidades de estilos
components/ui/
  ├── ThemeSelector.tsx     // ✅ Selector de temas
  └── ThemedComponents.tsx  // ✅ Componentes temáticos
```

---

## Guía de Uso

### 🎯 **Uso Básico - Hook useTheme**

```tsx
import { useTheme } from '@/hooks/useTheme';

function MiComponente() {
  const { theme, currentTheme, setTheme, isLoading } = useTheme();
  
  return (
    <View style={{ backgroundColor: theme.colors.background }}>
      <Text style={{ color: theme.colors.text }}>
        Tema actual: {theme.name}
      </Text>
      <TouchableOpacity 
        style={{ backgroundColor: theme.colors.primary }}
        onPress={() => setTheme('deepBlue')}
      >
        <Text style={{ color: '#FFFFFF' }}>Cambiar a Azul</Text>
      </TouchableOpacity>
    </View>
  );
}
```

### 🎨 **Uso Avanzado - Componentes Temáticos**

```tsx
import { 
  ThemedView, 
  ThemedText, 
  ThemedButton, 
  ThemedCard,
  ThemedInput 
} from '@/components/ui/ThemedComponents';

function PantallaEjemplo() {
  return (
    <ThemedView variant="background" style={{ flex: 1 }}>
      <ThemedCard variant="elevated" padding="large">
        
        <ThemedText variant="h1" color="primary">
          📚 Mi App de Estudio
        </ThemedText>
        
        <ThemedText variant="body" color="secondary">
          Este texto se adapta automáticamente al tema seleccionado
        </ThemedText>
        
        <ThemedInput 
          label="Nombre de la materia"
          placeholder="Ej: Matemáticas"
        />
        
        <ThemedButton 
          title="Guardar" 
          variant="primary" 
          size="large"
        />
        
      </ThemedCard>
    </ThemedView>
  );
}
```

### 🔧 **Selector de Temas**

```tsx
import { ThemeSelector } from '@/components/ui/ThemeSelector';

// Horizontal (recomendado para settings)
<ThemeSelector horizontal={true} showLabels={true} />

// Vertical (para modales/pantallas dedicadas)
<ThemeSelector horizontal={false} showLabels={true} />

// Con callback personalizado
<ThemeSelector 
  onThemeChange={(themeName) => {
    console.log(`Tema cambiado a: ${themeName}`);
    // Analíticas, logs, etc.
  }}
/>
```

---

## Arquitectura del Sistema

### 🏗️ **Estructura de Archivos**

```
📁 constants/Themes.ts
├── colorPalettes        // Paletas de colores crudas
├── commonThemeConfig    // Espaciado, tipografía, sombras
├── themes              // Temas completos combinados
└── utilidades          // colorUtils, createCustomTheme

📁 hooks/useTheme.ts
├── ThemeProvider       // Context provider
├── useTheme           // Hook principal
└── useColors          // Hook optimizado solo para colores

📁 utils/createStyles.ts
├── createStyles       // Función para crear estilos temáticos
├── createThemedStyle  // Helper para estilos inline
└── getGlobalStyles    // Clases de utilidad globales

📁 components/ui/
├── ThemeSelector.tsx      // Selector visual de temas
└── ThemedComponents.tsx   // Componentes pre-temáticos
```

### 🔄 **Flujo de Datos**

```
[Usuario selecciona tema] 
       ↓
[ThemeSelector llama setTheme()] 
       ↓
[useTheme actualiza estado + AsyncStorage] 
       ↓
[Context Provider notifica cambios] 
       ↓
[Todos los componentes se re-renderizan con nuevo tema]
```

### 💾 **Persistencia**

```typescript
// Automática - no requiere configuración adicional
const THEME_STORAGE_KEY = '@studyvault_theme';

// Al cambiar tema:
await AsyncStorage.setItem(THEME_STORAGE_KEY, themeName);

// Al cargar app:
const savedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY);
```---

## Crear Nuevos Temas

### 🎯 **Método Rápido - Usando Helper**

```typescript
import { createCustomTheme, colorPalettes } from '@/constants/Themes';

// Crear tema personalizado rápidamente
const miTemaPersonalizado = createCustomTheme(
  'Mi Tema Único',           // Nombre display
  {
    primary: '#FF6B6B',      // Color principal
    secondary: '#4ECDC4',    // Color secundario
    accent: '#45B7D1',       // Color de acento
    background: '#F8F9FA',   // Fondo
    surface: '#FFFFFF',      // Superficies
    surfaceLight: '#F1F3F4', // Superficies claras
    text: '#212529',         // Texto principal
    textSecondary: '#6C757D',// Texto secundario
    textMuted: '#ADB5BD',    // Texto atenuado
    border: '#DEE2E6',       // Bordes
    success: '#28A745',      // Éxito
    warning: '#FFC107',      // Advertencia
    error: '#DC3545',        // Error
    info: '#17A2B8',         // Información
  },
  false, // isDark
  {
    // Configuraciones opcionales personalizadas
    borderRadius: {
      xs: 8, sm: 12, md: 16, lg: 20, xl: 24, full: 9999,
    }
  }
);
```

### 🔧 **Método Detallado - Paso a Paso**

#### **Paso 1: Agregar Paleta de Colores**

En `constants/Themes.ts`, agrega tu paleta al objeto `colorPalettes`:

```typescript
export const colorPalettes = {
  // ...existing palettes...
  
  // 🌿 Nuevo tema verde naturaleza
  forestGreen: {
    primary: '#059669',        // Emerald-600
    primaryLight: '#10B981',   // Emerald-500
    primaryDark: '#047857',    // Emerald-700
    secondary: '#84CC16',      // Lime-500
    accent: '#F59E0B',         // Amber-500
    background: '#F0FDF4',     // Green-50
    surface: '#FFFFFF',        // White
    surfaceLight: '#DCFCE7',   // Green-100
    text: '#14532D',           // Green-900
    textSecondary: '#166534',  // Green-800
    textMuted: '#16A34A',      // Green-600
    border: '#BBF7D0',         // Green-200
    success: '#10B981',        // Emerald-500
    warning: '#F59E0B',        // Amber-500
    error: '#EF4444',          // Red-500
    info: '#059669',           // Emerald-600
  },
};
```

#### **Paso 2: Agregar al Objeto de Temas**

```typescript
export const themes = {
  // ...existing themes...
  
  forestGreen: {
    ...commonThemeConfig,
    colors: colorPalettes.forestGreen,
    name: 'Verde Bosque',
    isDark: false,
  }
} as const;
```

#### **Paso 3: Actualizar Preview (Opcional)**

En `components/ui/ThemeSelector.tsx`:

```typescript
const getThemePreviewColor = (themeName: string): string => {
  const themeColors: Record<string, string> = {
    // ...existing colors...
    forestGreen: '#059669',  // 👈 Agregar aquí
  };
  return themeColors[themeName] || '#4F46E5';
};
```

#### **Paso 4: ¡Listo! 🎉**

Tu nuevo tema aparecerá automáticamente en el selector.

---

## Componentes Temáticos

### 📦 **Componentes Disponibles**

| Componente | Props Principales | Descripción |
|------------|-------------------|-------------|
| `ThemedView` | `variant`, `style` | Container que se adapta al tema |
| `ThemedText` | `variant`, `color`, `style` | Texto con tipografía temática |
| `ThemedButton` | `variant`, `size`, `loading` | Botón completamente temático |
| `ThemedCard` | `variant`, `padding` | Tarjeta con sombras/bordes |
| `ThemedInput` | `label`, `error` | Input con estilos consistentes |

### 🎨 **ThemedView - Variantes**

```tsx
// Fondo principal de la app
<ThemedView variant="background">

// Superficie/tarjeta
<ThemedView variant="surface">

// Tarjeta con padding y sombra
<ThemedView variant="card">

// Transparente (sin styling)
<ThemedView variant="transparent">
```

### ✏️ **ThemedText - Variantes y Colores**

```tsx
// Variantes de tipografía
<ThemedText variant="h1">Título Principal</ThemedText>
<ThemedText variant="h2">Subtítulo</ThemedText>
<ThemedText variant="h3">Título Sección</ThemedText>
<ThemedText variant="body">Texto normal</ThemedText>
<ThemedText variant="bodySmall">Texto pequeño</ThemedText>
<ThemedText variant="caption">Metadatos</ThemedText>
<ThemedText variant="button">Estilo botón</ThemedText>

// Colores temáticos
<ThemedText color="primary">Texto primario</ThemedText>
<ThemedText color="secondary">Texto secundario</ThemedText>
<ThemedText color="muted">Texto atenuado</ThemedText>
<ThemedText color="success">Texto de éxito</ThemedText>
<ThemedText color="warning">Texto de advertencia</ThemedText>
<ThemedText color="error">Texto de error</ThemedText>
<ThemedText color="default">Texto por defecto</ThemedText>
```

### 🔘 **ThemedButton - Variantes y Tamaños**

```tsx
// Variantes de estilo
<ThemedButton title="Primario" variant="primary" />
<ThemedButton title="Secundario" variant="secondary" />
<ThemedButton title="Outline" variant="outline" />
<ThemedButton title="Ghost" variant="ghost" />
<ThemedButton title="Éxito" variant="success" />
<ThemedButton title="Advertencia" variant="warning" />
<ThemedButton title="Error" variant="error" />

// Tamaños
<ThemedButton title="Pequeño" size="small" />
<ThemedButton title="Mediano" size="medium" />
<ThemedButton title="Grande" size="large" />

// Estados
<ThemedButton title="Deshabilitado" disabled />
<ThemedButton title="Cargando..." loading />
```

### 🃏 **ThemedCard - Variantes**

```tsx
// Con sombra (recomendado)
<ThemedCard variant="elevated" padding="medium">

// Con borde
<ThemedCard variant="outlined" padding="large">

// Plana (sin sombra ni borde)
<ThemedCard variant="flat" padding="small">

// Sin padding
<ThemedCard variant="elevated" padding="none">
```

---

## API de Referencia

### 🔧 **Hook useTheme**

```typescript
interface ThemeContextType {
  currentTheme: ThemeName;           // Nombre del tema actual
  theme: Theme;                      // Objeto del tema completo
  setTheme: (name: ThemeName) => Promise<void>; // Cambiar tema
  availableThemes: ThemeInfo[];      // Lista de temas disponibles
  isLoading: boolean;                // Estado de carga inicial
}

// Uso
const { currentTheme, theme, setTheme, availableThemes, isLoading } = useTheme();
```

### 🎨 **Hook useColors (Optimizado)**

```typescript
// Solo para acceso a colores (más performante)
const colors = useColors();

// Equivale a:
const { theme } = useTheme();
const colors = theme.colors;
```

### 🛠️ **Utilidades createStyles**

```typescript
// Función principal para estilos temáticos
const getStyles = createStyles((theme: Theme) => ({
  container: {
    backgroundColor: theme.colors.background,
    padding: theme.spacing.md,
  },
  title: {
    ...theme.typography.h1,
    color: theme.colors.text,
  }
}));

// Uso en componente
function MiComponente() {
  const { theme } = useTheme();
  const styles = getStyles(theme);
  
  return <View style={styles.container}>...</View>;
}
```

### 📐 **Tipos TypeScript**

```typescript
// Nombres de temas disponibles
type ThemeName = 'light' | 'deepBlue' | 'deepBlueLight' | 'purple' | 'purpleLight' | 'crimsonRed' | 'crimsonRedLight';

// Estructura completa de un tema
interface Theme {
  colors: ColorPalette;
  spacing: SpacingConfig;
  typography: TypographyConfig;
  borderRadius: BorderRadiusConfig;
  shadows: ShadowsConfig;
  name: string;
  isDark: boolean;
}

// Paleta de colores
interface ColorPalette {
  primary: string;
  primaryLight: string;
  primaryDark: string;
  secondary: string;
  accent: string;
  background: string;
  surface: string;
  surfaceLight: string;
  text: string;
  textSecondary: string;
  textMuted: string;
  border: string;
  success: string;
  warning: string;
  error: string;
  info: string;
}
```

---

## Mejores Prácticas

### ✅ **DO's (Recomendado)**

```tsx
// ✅ Usar componentes temáticos cuando sea posible
<ThemedView variant="background">
  <ThemedText variant="h1">Mi Título</ThemedText>
</ThemedView>

// ✅ Acceder a colores a través del tema
const { theme } = useTheme();
<View style={{ backgroundColor: theme.colors.primary }} />

// ✅ Usar el hook useColors para solo colores
const colors = useColors();

// ✅ Nombrar temas de forma descriptiva
forestGreen: { name: 'Verde Bosque', ... }

// ✅ Mantener consistencia en nombres de colores
primary, secondary, accent, background, surface, text...

// ✅ Probar temas en diferentes dispositivos
```

### ❌ **DON'Ts (Evitar)**

```tsx
// ❌ Hardcodear colores
<View style={{ backgroundColor: '#FF0000' }} />

// ❌ Acceder directamente a paletas
import { colorPalettes } from '@/constants/Themes';

// ❌ Nombres de tema confusos
weirdTheme: { name: 'asdf123', ... }

// ❌ Romper la estructura de colores
// (saltarse colores requeridos)

// ❌ Modificar commonThemeConfig sin motivo
// (afecta todos los temas)
```

### 🎯 **Convenciones de Naming**

```typescript
// Temas base
light, dark

// Variantes por color
deepBlue, deepBlueLight
purple, purpleLight
crimsonRed, crimsonRedLight

// Temas por contexto
focusMode, examMode, nightStudy

// Temas por materia
mathTheme, literatureTheme, scienceTheme
```

---

## Troubleshooting

### 🐛 **Problemas Comunes**

#### **Error: "useTheme must be used within a ThemeProvider"**
```tsx
// ❌ Problema: No hay ThemeProvider
function App() {
  return <MyComponent />; // useTheme falla aquí
}

// ✅ Solución: Agregar ThemeProvider
function App() {
  return (
    <ThemeProvider>
      <MyComponent />
    </ThemeProvider>
  );
}
```

#### **Tema no persiste entre sesiones**
```tsx
// ✅ Verificar que AsyncStorage esté instalado
npm install @react-native-async-storage/async-storage

// ✅ Verificar permisos en app.json (si usas Expo)
{
  "expo": {
    "plugins": ["@react-native-async-storage/async-storage"]
  }
}
```

#### **Colores no se aplican correctamente**
```tsx
// ❌ Problema: Usar colores hardcodeados
style={{ color: '#000000' }}

// ✅ Solución: Usar colores del tema
const { theme } = useTheme();
style={{ color: theme.colors.text }}
```

#### **TypeScript no reconoce nuevo tema**
```typescript
// ✅ Verificar que el tema esté en el tipo
export const themes = {
  // ...existing themes...
  myNewTheme: { ... }
} as const; // 👈 Importante el 'as const'

// ✅ El tipo se genera automáticamente
type ThemeName = keyof typeof themes;
```

### 🔍 **Debug y Desarrollo**

```tsx
// Componente para debug de temas
function ThemeDebugger() {
  const { theme, currentTheme } = useTheme();
  
  if (__DEV__) {
    console.log('Current theme:', currentTheme);
    console.log('Theme object:', theme);
  }
  
  return (
    <ThemedView>
      <ThemedText>Tema actual: {theme.name}</ThemedText>
      <ThemedText>Es oscuro: {theme.isDark ? 'Sí' : 'No'}</ThemedText>
    </ThemedView>
  );
}

// Ver todos los colores disponibles
function ColorPalette() {
  const { theme } = useTheme();
  
  return (
    <ScrollView>
      {Object.entries(theme.colors).map(([key, color]) => (
        <View key={key} style={{ 
          backgroundColor: color, 
          padding: 10, 
          margin: 5 
        }}>
          <Text>{key}: {color}</Text>
        </View>
      ))}
    </ScrollView>
  );
}
```

### 📊 **Performance**

```tsx
// ✅ Usar useColors cuando solo necesites colores
const colors = useColors(); // Más liviano que useTheme()

// ✅ Memoizar estilos complejos
const styles = useMemo(() => createStyles(theme), [theme]);

// ✅ Evitar re-renders innecesarios
const MemoizedComponent = React.memo(function MyComponent() {
  const { theme } = useTheme();
  return <View style={{ backgroundColor: theme.colors.background }} />;
});
```

---

## 🎯 **Casos de Uso Específicos StudyVault**

### 📚 **Temas por Materia**

```tsx
// Implementar en el futuro
const subjectThemes = {
  mathematics: 'deepBlue',      // Azul para lógica
  literature: 'crimsonRed',     // Rojo para creatividad
  science: 'forestGreen',       // Verde para naturaleza
  history: 'purple',            // Púrpura para elegancia
};

function SubjectScreen({ subject }: { subject: keyof typeof subjectThemes }) {
  const { setTheme } = useTheme();
  
  useEffect(() => {
    setTheme(subjectThemes[subject]);
  }, [subject]);
  
  return <ThemedView>...</ThemedView>;
}
```

### 🕐 **Temas por Hora del Día**

```tsx
function AutoThemeSwitcher() {
  const { setTheme } = useTheme();
  
  useEffect(() => {
    const hour = new Date().getHours();
    
    if (hour >= 6 && hour < 18) {
      setTheme('light');           // Día
    } else if (hour >= 18 && hour < 22) {
      setTheme('deepBlueLight');   // Tarde
    } else {
      setTheme('deepBlue');        // Noche
    }
  }, []);
  
  return null;
}
```

### 🎯 **Temas por Estado de Ánimo**

```tsx
function MoodThemeSelector() {
  const { setTheme } = useTheme();
  
  const moodThemes = {
    focused: 'deepBlue',
    creative: 'purple', 
    energetic: 'crimsonRed',
    calm: 'light'
  };
  
  return (
    <ThemedView>
      {Object.entries(moodThemes).map(([mood, theme]) => (
        <ThemedButton 
          key={mood}
          title={mood}
          onPress={() => setTheme(theme)}
        />
      ))}
    </ThemedView>
  );
}
```

---

## 🚀 **Próximos Pasos**

1. **Instalar AsyncStorage**: `npm install @react-native-async-storage/async-storage`
2. **Probar en la demo**: Ve a la pestaña "Temas" en tu app
3. **Crear tu primer tema personalizado**: Sigue la guía paso a paso
4. **Integrar en tu flujo de desarrollo**: Usa componentes temáticos en nuevas features

---

## 📞 **Soporte**

Si tienes problemas:
1. Revisa la sección [Troubleshooting](#troubleshooting)
2. Verifica que tengas todas las dependencias instaladas
3. Consulta la demo en `app/(tabs)/themes-demo.tsx`

---

**¡Happy coding! 🎨✨**
