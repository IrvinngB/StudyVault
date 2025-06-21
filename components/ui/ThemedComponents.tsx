// components/ui/ThemedComponents.tsx
import { useTheme } from '@/hooks/useTheme';
import { createStyles } from '@/utils/createStyles';
import React from 'react';
import {
  ActivityIndicator,
  Text,
  TextInput,
  TextInputProps,
  TextProps,
  TouchableOpacity,
  TouchableOpacityProps,
  View,
  ViewProps
} from 'react-native';

// Componente View con tema aplicado
interface ThemedViewProps extends ViewProps {
  variant?: 'background' | 'surface' | 'card' | 'transparent';
}

export function ThemedView({ 
  children, 
  variant = 'transparent', 
  style, 
  ...props 
}: ThemedViewProps) {
  const { theme } = useTheme();
  const styles = getViewStyles(theme);
  
  return (
    <View 
      style={[
        variant !== 'transparent' && styles[variant],
        style
      ]} 
      {...props}
    >
      {children}
    </View>
  );
}

// Componente Text con tema aplicado
interface ThemedTextProps extends TextProps {
  variant?: 'h1' | 'h2' | 'h3' | 'body' | 'bodySmall' | 'caption' | 'button';
  color?: 'primary' | 'secondary' | 'muted' | 'success' | 'warning' | 'error' | 'default';
}

export function ThemedText({ 
  children, 
  variant = 'body', 
  color = 'default',
  style, 
  ...props 
}: ThemedTextProps) {
  const { theme } = useTheme();
  const styles = getTextStyles(theme);
  
  return (
    <Text 
      style={[
        styles[variant],
        styles[`color_${color}`],
        style
      ]} 
      {...props}
    >
      {children}
    </Text>
  );
}

// Componente Button con tema aplicado - CON SOPORTE DE ICONOS
interface ThemedButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'success' | 'warning' | 'error';
  size?: 'small' | 'medium' | 'large';
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  iconOnly?: boolean;
}

export function ThemedButton({ 
  title, 
  variant = 'primary', 
  size = 'medium',
  loading = false,
  icon,
  iconPosition = 'left',
  iconOnly = false,
  style, 
  disabled,
  ...props 
}: ThemedButtonProps) {
  const { theme } = useTheme();
  const styles = getButtonStyles(theme);
  
  const isDisabled = disabled || loading;

  const getTextColor = () => {
    switch (variant) {
      case 'primary': return '#FFFFFF';
      case 'secondary': return '#FFFFFF';
      case 'outline': return theme.colors.primary;
      case 'ghost': return theme.colors.primary;
      case 'success': return '#FFFFFF';
      case 'warning': return '#FFFFFF';
      case 'error': return '#FFFFFF';
      default: return '#FFFFFF';
    }
  };
  const renderContent = () => {
    if (loading) {
      return (
        <View style={styles.contentContainer}>
          <ActivityIndicator 
            size="small" 
            color={getTextColor()} 
            style={icon && !iconOnly ? { marginRight: theme.spacing.xs } : undefined}
          />
          {!iconOnly && (
            <Text 
              style={[
                theme.typography.button,
                styles[`text_${variant}`],
                isDisabled && styles.disabledText
              ]}
            >
              {title}
            </Text>
          )}
        </View>
      );
    }

    if (iconOnly && icon) {
      return <View style={styles.iconOnlyContainer}>{icon}</View>;
    }

    if (icon && iconPosition === 'left') {
      return (
        <View style={styles.contentContainer}>
          <View style={styles.iconContainer}>{icon}</View>
          <Text 
            style={[
              theme.typography.button,
              styles[`text_${variant}`],
              isDisabled && styles.disabledText
            ]}
          >
            {title}
          </Text>
        </View>
      );
    }

    if (icon && iconPosition === 'right') {
      return (
        <View style={styles.contentContainer}>
          <Text 
            style={[
              theme.typography.button,
              styles[`text_${variant}`],
              isDisabled && styles.disabledText
            ]}
          >
            {title}
          </Text>
          <View style={[styles.iconContainer, { marginLeft: theme.spacing.xs, marginRight: 0 }]}>
            {icon}
          </View>
        </View>
      );
    }

    return (
      <Text 
        style={[
          theme.typography.button,
          styles[`text_${variant}`],
          isDisabled && styles.disabledText
        ]}
      >
        {title}
      </Text>
    );
  };
  
  return (
    <TouchableOpacity 
      style={[
        styles.base,
        styles[`variant_${variant}`],
        styles[`size_${size}`],
        iconOnly && styles.iconOnlyBase,
        isDisabled && styles.disabled,
        style
      ]}
      disabled={isDisabled}
      activeOpacity={0.7}
      {...props}
    >
      {renderContent()}
    </TouchableOpacity>
  );
}

// Componente Input con tema aplicado
interface ThemedInputProps extends TextInputProps {
  label?: string;
  error?: string;
  containerStyle?: ViewProps['style'];
}

export function ThemedInput({ 
  label, 
  error, 
  containerStyle,
  style, 
  ...props 
}: ThemedInputProps) {
  const { theme } = useTheme();
  const styles = getInputStyles(theme);
  
  return (
    <View style={[styles.container, containerStyle]}>
      {label && (
        <ThemedText variant="bodySmall" style={styles.label}>
          {label}
        </ThemedText>
      )}
      <TextInput
        style={[
          styles.input,
          error && styles.inputError,
          style
        ]}
        placeholderTextColor={theme.colors.textMuted}
        {...props}
      />
      {error && (
        <ThemedText variant="caption" color="error" style={styles.errorText}>
          {error}
        </ThemedText>
      )}
    </View>
  );
}

// Componente Card con tema aplicado
interface ThemedCardProps extends ViewProps {
  variant?: 'elevated' | 'outlined' | 'flat';
  padding?: 'none' | 'small' | 'medium' | 'large';
}

export function ThemedCard({ 
  children, 
  variant = 'elevated', 
  padding = 'medium',
  style, 
  ...props 
}: ThemedCardProps) {
  const { theme } = useTheme();
  const styles = getCardStyles(theme);
  
  return (
    <View 
      style={[
        styles.base,
        styles[`variant_${variant}`],
        styles[`padding_${padding}`],
        style
      ]} 
      {...props}
    >
      {children}
    </View>
  );
}

// Estilos para cada componente
const getViewStyles = createStyles((theme) => ({
  background: {
    backgroundColor: theme.colors.background,
  },
  surface: {
    backgroundColor: theme.colors.surface,
  },
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    ...theme.shadows.small,
  },
}));

const getTextStyles = createStyles((theme) => ({
  h1: theme.typography.h1,
  h2: theme.typography.h2,
  h3: theme.typography.h3,
  body: theme.typography.body,
  bodySmall: theme.typography.bodySmall,
  caption: theme.typography.caption,
  button: theme.typography.button,
  
  color_default: { color: theme.colors.text },
  color_primary: { color: theme.colors.primary },
  color_secondary: { color: theme.colors.textSecondary },
  color_muted: { color: theme.colors.textMuted },
  color_success: { color: theme.colors.success },
  color_warning: { color: theme.colors.warning },
  color_error: { color: theme.colors.error },
}));

const getButtonStyles = createStyles((theme) => ({
  base: {
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  
  // Variants
  variant_primary: {
    backgroundColor: theme.colors.primary,
    ...theme.shadows.small,
  },
  variant_secondary: {
    backgroundColor: theme.colors.secondary,
    ...theme.shadows.small,
  },
  variant_outline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: theme.colors.primary,
  },
  variant_ghost: {
    backgroundColor: 'transparent',
  },
  variant_success: {
    backgroundColor: theme.colors.success,
    ...theme.shadows.small,
  },
  variant_warning: {
    backgroundColor: theme.colors.warning,
    ...theme.shadows.small,
  },
  variant_error: {
    backgroundColor: theme.colors.error,
    ...theme.shadows.small,
  },
  
  // Sizes
  size_small: {
    paddingVertical: theme.spacing.xs,
    paddingHorizontal: theme.spacing.sm,
    minHeight: 32,
  },
  size_medium: {
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    minHeight: 40,
  },
  size_large: {
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    minHeight: 48,
  },

  // Contenido y iconos
  contentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    marginRight: theme.spacing.xs,
  },
  iconOnlyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconOnlyBase: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.sm,
    minWidth: 40,
    aspectRatio: 1,
  },
  
  // Text colors
  text_primary: { color: '#FFFFFF' },
  text_secondary: { color: '#FFFFFF' },
  text_outline: { color: theme.colors.primary },
  text_ghost: { color: theme.colors.primary },
  text_success: { color: '#FFFFFF' },
  text_warning: { color: '#FFFFFF' },
  text_error: { color: '#FFFFFF' },
  
  // States
  disabled: {
    opacity: 0.5,
  },
  disabledText: {
    opacity: 0.7,
  },
}));

const getInputStyles = createStyles((theme) => ({
  container: {
    marginVertical: theme.spacing.xs,
  },
  label: {
    marginBottom: theme.spacing.xs,
    fontWeight: '600',
  },
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
  inputError: {
    borderColor: theme.colors.error,
  },
  errorText: {
    marginTop: theme.spacing.xs,
  },
}));

const getCardStyles = createStyles((theme) => ({
  base: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
  },
  
  variant_elevated: {
    ...theme.shadows.medium,
  },
  variant_outlined: {
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  variant_flat: {
    // Sin sombra ni borde
  },
  
  padding_none: {},
  padding_small: {
    padding: theme.spacing.sm,
  },
  padding_medium: {
    padding: theme.spacing.md,
  },
  padding_large: {
    padding: theme.spacing.lg,
  },
}));