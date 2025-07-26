// components/ui/ThemeSelector.tsx
import { useTheme } from '@/hooks/useTheme';
import { createStyles } from '@/utils/createStyles';
import React from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';

interface ThemeSelectorProps {
  onThemeChange?: (themeName: string) => void;
  horizontal?: boolean;
  showLabels?: boolean;
}

export function ThemeSelector({ 
  onThemeChange, 
  horizontal = true, 
  showLabels = true 
}: ThemeSelectorProps) {
  const { currentTheme, setTheme, availableThemes, theme } = useTheme();
  const styles = getStyles(theme);

  const handleThemePress = async (themeName: any) => {
    await setTheme(themeName);
    onThemeChange?.(themeName);
  };

  const renderThemeOption = (themeOption: any) => {
    const isSelected = currentTheme === themeOption.name;
    
    return (
      <TouchableOpacity
        key={themeOption.name}
        style={[
          styles.themeOption,
          isSelected && styles.selectedTheme,
          !horizontal && styles.verticalOption
        ]}
        onPress={() => handleThemePress(themeOption.name)}
        activeOpacity={0.7}
      >
        <View style={[
          styles.colorPreview,
          { backgroundColor: getThemePreviewColor(themeOption.name) }
        ]} />
        
        {showLabels && (
          <Text style={[
            styles.themeText,
            isSelected && styles.selectedText
          ]}>
            {themeOption.displayName}
          </Text>
        )}
        
        {themeOption.isDark && (
          <View style={styles.darkIndicator}>
            <Text style={styles.darkIndicatorText}>🌙</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };  const getThemePreviewColor = (themeName: string): string => {
    const themeColors: Record<string, string> = {
      light: '#4F46E5',
      deepBlue: '#1E3A8A',
      deepBlueLight: '#1E40AF',
      purple: '#7C3AED',
      purpleLight: '#7C3AED',
      crimsonRed: '#DA1E37',
      crimsonRedLight: '#DC2626',
      emeraldGreen: '#10B981',
      emeraldGreenLight: '#059669',
    };
    return themeColors[themeName] || '#4F46E5';
  };

  if (horizontal) {
    return (
      <View style={styles.container}>
        {showLabels && (
          <Text style={styles.title}>Seleccionar Tema</Text>
        )}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.scrollContainer}
        >
          {availableThemes.map(renderThemeOption)}
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {showLabels && (
        <Text style={styles.title}>Seleccionar Tema</Text>
      )}
      <View style={styles.verticalContainer}>
        {availableThemes.map(renderThemeOption)}
      </View>
    </View>
  );
}

const getStyles = createStyles((theme) => ({
  container: {
    padding: theme.spacing.md,
  },
  title: {
    ...theme.typography.h3,
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  scrollContainer: {
    paddingHorizontal: theme.spacing.sm,
  },
  verticalContainer: {
    gap: theme.spacing.sm,
  },
  themeOption: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    marginHorizontal: theme.spacing.xs,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 2,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    minWidth: 80,
    ...theme.shadows.small,
  },
  verticalOption: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    paddingHorizontal: theme.spacing.lg,
    marginHorizontal: 0,
    minWidth: '100%',
  },
  selectedTheme: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primary,
    transform: [{ scale: 1.05 }],
  },
  colorPreview: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginBottom: theme.spacing.xs,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  themeText: {
    ...theme.typography.bodySmall,
    color: theme.colors.text,
    fontWeight: '600',
    textAlign: 'center',
  },
  selectedText: {
    color: '#FFFFFF',
  },
  darkIndicator: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  darkIndicatorText: {
    fontSize: 8,
  },
}));
