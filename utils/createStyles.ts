// utils/createStyles.ts
import { Theme } from '@/hooks/useTheme';
import { StyleSheet } from 'react-native';

// Función para crear estilos con temas
export function createStyles<T extends StyleSheet.NamedStyles<T>>(
  stylesFn: (theme: Theme) => T
) {
  return (theme: Theme) => StyleSheet.create(stylesFn(theme));
}

// Función helper para crear estilos inline con tema
export function createThemedStyle(theme: Theme) {
  return {
    // Contenedores base
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    } as const,
    
    safeContainer: {
      flex: 1,
      backgroundColor: theme.colors.background,
      paddingHorizontal: theme.spacing.md,
    } as const,
    
    card: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.md,
      padding: theme.spacing.md,
      marginVertical: theme.spacing.sm,
      ...theme.shadows.small,
    } as const,
    
    // Textos comunes
    title: {
      ...theme.typography.h1,
      color: theme.colors.text,
    } as const,
    
    subtitle: {
      ...theme.typography.h2,
      color: theme.colors.text,
    } as const,
    
    body: {
      ...theme.typography.body,
      color: theme.colors.text,
    } as const,
    
    // Botones comunes
    primaryButton: {
      backgroundColor: theme.colors.primary,
      paddingVertical: theme.spacing.sm,
      paddingHorizontal: theme.spacing.lg,
      borderRadius: theme.borderRadius.md,
      alignItems: 'center',
      justifyContent: 'center',
      ...theme.shadows.small,
    } as const,
    
    primaryButtonText: {
      ...theme.typography.button,
      color: '#FFFFFF',
    } as const,
  };
}

// Hook para estilos globales que se pueden usar en cualquier componente
export const getGlobalStyles = (theme: Theme) => StyleSheet.create({
  // Flex containers
  flex1: { flex: 1 },
  flexRow: { flexDirection: 'row' },
  flexColumn: { flexDirection: 'column' },
  flexCenter: { justifyContent: 'center', alignItems: 'center' },
  flexBetween: { justifyContent: 'space-between' },
  flexAround: { justifyContent: 'space-around' },
  flexEnd: { justifyContent: 'flex-end' },
  alignCenter: { alignItems: 'center' },
  alignEnd: { alignItems: 'flex-end' },
  
  // Margins
  mt_xs: { marginTop: theme.spacing.xs },
  mt_sm: { marginTop: theme.spacing.sm },
  mt_md: { marginTop: theme.spacing.md },
  mt_lg: { marginTop: theme.spacing.lg },
  mb_xs: { marginBottom: theme.spacing.xs },
  mb_sm: { marginBottom: theme.spacing.sm },
  mb_md: { marginBottom: theme.spacing.md },
  mb_lg: { marginBottom: theme.spacing.lg },
  ml_xs: { marginLeft: theme.spacing.xs },
  ml_sm: { marginLeft: theme.spacing.sm },
  ml_md: { marginLeft: theme.spacing.md },
  ml_lg: { marginLeft: theme.spacing.lg },
  mr_xs: { marginRight: theme.spacing.xs },
  mr_sm: { marginRight: theme.spacing.sm },
  mr_md: { marginRight: theme.spacing.md },
  mr_lg: { marginRight: theme.spacing.lg },
  mx_xs: { marginHorizontal: theme.spacing.xs },
  mx_sm: { marginHorizontal: theme.spacing.sm },
  mx_md: { marginHorizontal: theme.spacing.md },
  mx_lg: { marginHorizontal: theme.spacing.lg },
  my_xs: { marginVertical: theme.spacing.xs },
  my_sm: { marginVertical: theme.spacing.sm },
  my_md: { marginVertical: theme.spacing.md },
  my_lg: { marginVertical: theme.spacing.lg },
  
  // Paddings
  p_xs: { padding: theme.spacing.xs },
  p_sm: { padding: theme.spacing.sm },
  p_md: { padding: theme.spacing.md },
  p_lg: { padding: theme.spacing.lg },
  px_xs: { paddingHorizontal: theme.spacing.xs },
  px_sm: { paddingHorizontal: theme.spacing.sm },
  px_md: { paddingHorizontal: theme.spacing.md },
  px_lg: { paddingHorizontal: theme.spacing.lg },
  py_xs: { paddingVertical: theme.spacing.xs },
  py_sm: { paddingVertical: theme.spacing.sm },
  py_md: { paddingVertical: theme.spacing.md },
  py_lg: { paddingVertical: theme.spacing.lg },
  
  // Backgrounds
  bgPrimary: { backgroundColor: theme.colors.primary },
  bgSecondary: { backgroundColor: theme.colors.secondary },
  bgSurface: { backgroundColor: theme.colors.surface },
  bgBackground: { backgroundColor: theme.colors.background },
  
  // Text colors
  textPrimary: { color: theme.colors.primary },
  textSecondary: { color: theme.colors.textSecondary },
  textMuted: { color: theme.colors.textMuted },
  textSuccess: { color: theme.colors.success },
  textWarning: { color: theme.colors.warning },
  textError: { color: theme.colors.error },
  
  // Borders
  borderPrimary: { borderColor: theme.colors.primary },
  borderSecondary: { borderColor: theme.colors.border },
  border1: { borderWidth: 1 },
  border2: { borderWidth: 2 },
  
  // Border radius
  rounded_xs: { borderRadius: theme.borderRadius.xs },
  rounded_sm: { borderRadius: theme.borderRadius.sm },
  rounded_md: { borderRadius: theme.borderRadius.md },
  rounded_lg: { borderRadius: theme.borderRadius.lg },
  rounded_xl: { borderRadius: theme.borderRadius.xl },
  rounded_full: { borderRadius: theme.borderRadius.full },
  
  // Shadows
  shadowSmall: theme.shadows.small,
  shadowMedium: theme.shadows.medium,
  shadowLarge: theme.shadows.large,
});
