import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { openModal, closeModal } from '@/store/slices/uiSlice';

export const useModal = (modalKey: string) => {
  const dispatch = useAppDispatch();
  const modalState = useAppSelector((state) => state.ui.modals[modalKey]);

  const isOpen = modalState?.isOpen || false;
  const data = modalState?.data;

  const open = useCallback((data?: any) => {
    dispatch(openModal({ key: modalKey, data }));
  }, [dispatch, modalKey]);

  const close = useCallback(() => {
    dispatch(closeModal(modalKey));
  }, [dispatch, modalKey]);

  const toggle = useCallback(() => {
    if (isOpen) {
      close();
    } else {
      open();
    }
  }, [isOpen, open, close]);

  return {
    isOpen,
    data,
    open,
    close,
    toggle,
  };
}; 