import { useCallback } from 'react';
import { useAppDispatch } from '@/store/hooks';
import { addNotification, removeNotification } from '@/store/slices/uiSlice';
import { Notification } from '@/types';

type NotificationType = Notification['type'];
type NotificationTitle = string;
type NotificationMessage = string;

export const useNotification = () => {
  const dispatch = useAppDispatch();

  const showNotification = useCallback((
    type: NotificationType,
    title: NotificationTitle,
    message: NotificationMessage
  ) => {
    dispatch(addNotification({
      type,
      title,
      message,
    }));
  }, [dispatch]);

  const removeNotificationById = useCallback((_id: string) => {
    dispatch(removeNotification(id));
  }, [dispatch]);

  const success = useCallback((title: string, message?: string) => {
    showNotification('success', title, message || title);
  }, [showNotification]);

  const error = useCallback((title: string, message?: string) => {
    showNotification('error', title, message || title);
  }, [showNotification]);

  const warning = useCallback((title: string, message?: string) => {
    showNotification('warning', title, message || title);
  }, [showNotification]);

  const info = useCallback((title: string, message?: string) => {
    showNotification('info', title, message || title);
  }, [showNotification]);

  return {
    showNotification,
    removeNotification: removeNotificationById,
    success,
    error,
    warning,
    info,
  };
}; 