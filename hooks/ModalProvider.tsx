
import { AppModal } from '@/components/ui/AppModal';
import React, { createContext, useContext } from 'react';
import { useModal, type UseModalReturn } from './modals';

const ModalContext = createContext<UseModalReturn | null>(null);

export function ModalProvider({ children }: { children: React.ReactNode }) {
  const modal = useModal();
  return (
    <ModalContext.Provider value={modal}>
      {children}
      <AppModal {...modal.modalProps} />
    </ModalContext.Provider>
  );
}

export function useGlobalModal() {
  const context = useContext(ModalContext);
  if (!context) throw new Error('useGlobalModal must be used within ModalProvider');
  return context;
}
