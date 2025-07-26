import { Ionicons } from '@expo/vector-icons';
import React, { useCallback, useEffect, useRef } from 'react';
import {
  Animated,
  BackHandler,
  Dimensions,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

export type ModalType = 'error' | 'warning' | 'info' | 'success' | 'confirm';

interface AppModalProps {
  visible: boolean;
  type: ModalType;
  title?: string;
  message: string;
  onClose: () => void;
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
  showCancel?: boolean;
  icon?: React.ReactNode;
  autoClose?: number; // Auto close after X milliseconds
  hapticFeedback?: boolean;
}

const { width: screenWidth } = Dimensions.get('window');

const typeConfig = {
  error: {
    color: '#EF4444',
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
    icon: <Ionicons name="close-circle" size={48} color="#EF4444" />, // error
    defaultTitle: 'Error'
  },
  warning: {
    color: '#F59E0B',
    backgroundColor: '#FFFBEB',
    borderColor: '#FDE68A',
    icon: <Ionicons name="warning" size={48} color="#F59E0B" />, // warning
    defaultTitle: 'Advertencia'
  },
  info: {
    color: '#3B82F6',
    backgroundColor: '#EFF6FF',
    borderColor: '#BFDBFE',
    icon: <Ionicons name="information-circle" size={48} color="#3B82F6" />, // info
    defaultTitle: 'Información'
  },
  success: {
    color: '#10B981',
    backgroundColor: '#ECFDF5',
    borderColor: '#A7F3D0',
    icon: <Ionicons name="checkmark-circle" size={48} color="#10B981" />, // success
    defaultTitle: 'Éxito'
  },
  confirm: {
    color: '#6366F1',
    backgroundColor: '#F0F9FF',
    borderColor: '#C7D2FE',
    icon: <Ionicons name="help-circle" size={48} color="#6366F1" />, // confirm
    defaultTitle: 'Confirmar'
  }
};

export const AppModal: React.FC<AppModalProps> = ({
  visible,
  type,
  title,
  message,
  onClose,
  confirmText = 'Aceptar',
  cancelText = 'Cancelar',
  onConfirm,
  onCancel,
  showCancel = type === 'confirm',
  icon,
  autoClose,
  hapticFeedback = true,
}) => {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const autoCloseTimer = useRef<NodeJS.Timeout | number | null>(null);

  const config = typeConfig[type];

  // Mover handleClose antes del useEffect
  const handleClose = useCallback(() => {
    // Evitar múltiples llamadas al cierre
    if (!visible) return;

    // Animar salida
    Animated.parallel([
      Animated.timing(scaleAnim, {
        toValue: 0.8,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onClose();
    });
  }, [visible, scaleAnim, opacityAnim, onClose]);

  useEffect(() => {
    if (visible) {
      // Animate in
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          useNativeDriver: true,
          tension: 100,
          friction: 8,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();

      // Auto close timer
      if (autoClose && autoClose > 0) {
        autoCloseTimer.current = setTimeout(() => {
          handleClose();
        }, autoClose);
      }

      // Android back button handler
      if (Platform.OS === 'android') {
        const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
          handleClose();
          return true;
        });
        return () => backHandler.remove();
      }
    } else {
      // Reset animations
      scaleAnim.setValue(0);
      opacityAnim.setValue(0);
      slideAnim.setValue(50);
      
      // Clear timer
      if (autoCloseTimer.current) {
        clearTimeout(autoCloseTimer.current);
      }
    }
  }, [visible, autoClose, handleClose, opacityAnim, scaleAnim, slideAnim]);

  useEffect(() => {
    if (!visible) {
      // Reset animations and clear timers when modal is not visible
      scaleAnim.setValue(0);
      opacityAnim.setValue(0);
      slideAnim.setValue(50);

      if (autoCloseTimer.current) {
        clearTimeout(autoCloseTimer.current);
        autoCloseTimer.current = null;
      }
    }

    return () => {
      // Cleanup on unmount or visibility change
      if (autoCloseTimer.current) {
        clearTimeout(autoCloseTimer.current);
      }
    };
  }, [visible, autoClose, handleClose, opacityAnim, scaleAnim, slideAnim]);

  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm();
    }
    handleClose(); // Asegurar que el modal se cierre después de confirmar
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    }
    handleClose(); // Asegurar que el modal se cierre después de cancelar
  };

  const displayTitle = title || config.defaultTitle;
  const displayIcon = icon || config.icon;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={handleClose}
      statusBarTranslucent
    >
      <Animated.View 
        style={[
          styles.overlay,
          { 
            opacity: opacityAnim,
          }
        ]}
      >
        <TouchableOpacity 
          style={styles.overlayTouchable} 
          activeOpacity={1} 
          onPress={handleClose}
        />
        
        <Animated.View
          style={[
            styles.container,
            {
              backgroundColor: config.backgroundColor,
              borderColor: config.borderColor,
              transform: [
                { scale: scaleAnim },
                { translateY: slideAnim }
              ],
            },
          ]}
        >
          {/* Icon */}
          {displayIcon && (
            <View style={styles.iconContainer}>
              {displayIcon}
            </View>
          )}

          {/* Title */}
          <Text style={[styles.title, { color: config.color }]}>
            {displayTitle}
          </Text>

          {/* Message */}
          <Text style={styles.message}>{message}</Text>

          {/* Buttons */}
          <View style={styles.buttonContainer}>
            {showCancel && (
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={handleCancel}
                activeOpacity={0.8}
              >
                <Text style={[styles.buttonText, styles.cancelButtonText]}>
                  {cancelText}
                </Text>
              </TouchableOpacity>
            )}
            
            <TouchableOpacity
              style={[
                styles.button, 
                styles.confirmButton,
                { backgroundColor: config.color },
                showCancel && styles.buttonMarginLeft
              ]}
              onPress={handleConfirm}
              activeOpacity={0.8}
            >
              <Text style={styles.confirmButtonText}>
                {confirmText}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Auto close indicator */}
          {autoClose && autoClose > 0 && (
            <Text style={styles.autoCloseText}>
              Se cerrará automáticamente en {Math.ceil(autoClose / 1000)}s
            </Text>
          )}
        </Animated.View>
      </Animated.View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlayTouchable: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  container: {
    width: Math.min(screenWidth - 40, 340),
    maxWidth: '90%',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 15,
  },
  iconContainer: {
    marginBottom: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    color: '#374151',
    marginBottom: 24,
    textAlign: 'center',
    lineHeight: 22,
  },
  buttonContainer: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'center',
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  buttonMarginLeft: {
    marginLeft: 12,
  },
  cancelButton: {
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  confirmButton: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButtonText: {
    color: '#6B7280',
  },
  confirmButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  autoCloseText: {
    marginTop: 12,
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'center',
  },
});

export default AppModal;