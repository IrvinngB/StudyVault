import { useTheme } from '@/hooks/useTheme';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';

interface FloatingActionButtonProps {
  onPress: () => void;
  icon?: React.ComponentProps<typeof Ionicons>['name'];
  size?: number;
}

export const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({ 
  onPress, 
  icon = 'add', 
  size = 56 
}) => {
  const { theme } = useTheme();

  return (
    <TouchableOpacity
      style={[
        styles.fab,
        {
          backgroundColor: theme.colors.primary,
          width: size,
          height: size,
          borderRadius: size / 2,
          shadowColor: theme.colors.text,
        }
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Ionicons 
        name={icon} 
        size={size * 0.4} 
        color={theme.colors.surface} 
      />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    zIndex: 1000,
  },
});
