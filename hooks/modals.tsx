import { useCallback, useState } from 'react';
import { ModalType } from '../components/ui/AppModal';

interface ModalState {
  visible: boolean;
  type: ModalType;
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
  showCancel?: boolean;
  autoClose?: number;
  onClose?: () => void;
}

interface UseModalReturn {
  modalProps: ModalState & { onClose: () => void };
  showModal: (config: Omit<ModalState, 'visible' | 'onClose'>) => void;
  hideModal: () => void;
  showError: (message: string, title?: string, onConfirm?: () => void) => void;
  showSuccess: (message: string, title?: string, onConfirm?: () => void) => void;
  showWarning: (message: string, title?: string, onConfirm?: () => void) => void;
  showInfo: (message: string, title?: string, onConfirm?: () => void) => void;
  showConfirm: (
    message: string, 
    onConfirm: () => void,
    onCancel?: () => void,
    title?: string
  ) => void;
}

export const useModal = (): UseModalReturn => {
  const [modalState, setModalState] = useState<ModalState>({
    visible: false,
    type: 'info',
    message: '',
  });

  const showModal = useCallback((config: Omit<ModalState, 'visible' | 'onClose'>) => {
    setModalState({
      ...config,
      visible: true,
    });
  }, []);

  const hideModal = useCallback(() => {
    setModalState(prev => ({
      ...prev,
      visible: false,
    }));
  }, []);

  const showError = useCallback((
    message: string, 
    title?: string, 
    onConfirm?: () => void
  ) => {
    showModal({
      type: 'error',
      message,
      title,
      onConfirm,
      showCancel: false,
    });
  }, [showModal]);

  const showSuccess = useCallback((
    message: string, 
    title?: string, 
    onConfirm?: () => void
  ) => {
    showModal({
      type: 'success',
      message,
      title,
      onConfirm,
      showCancel: false,
      autoClose: 3000, // Auto close success messages after 3 seconds
    });
  }, [showModal]);

  const showWarning = useCallback((
    message: string, 
    title?: string, 
    onConfirm?: () => void
  ) => {
    showModal({
      type: 'warning',
      message,
      title,
      onConfirm,
      showCancel: false,
    });
  }, [showModal]);

  const showInfo = useCallback((
    message: string, 
    title?: string, 
    onConfirm?: () => void
  ) => {
    showModal({
      type: 'info',
      message,
      title,
      onConfirm,
      showCancel: false,
    });
  }, [showModal]);

  const showConfirm = useCallback((
    message: string,
    onConfirm: () => void,
    onCancel?: () => void,
    title?: string
  ) => {
    showModal({
      type: 'confirm',
      message,
      title,
      onConfirm,
      onCancel,
      showCancel: true,
      confirmText: 'Confirmar',
      cancelText: 'Cancelar',
    });
  }, [showModal]);

  return {
    modalProps: {
      ...modalState,
      onClose: modalState.onClose || hideModal,
    },
    showModal,
    hideModal,
    showError,
    showSuccess,
    showWarning,
    showInfo,
    showConfirm,
  };
};