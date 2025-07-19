"use client";

import React, { useEffect } from 'react';
import { notification } from 'antd';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { removeNotification } from '@/store/slices/uiSlice';

const NotificationContainer: React.FC = () => {
  const dispatch = useAppDispatch();
  const notifications = useAppSelector((state) => state.ui.notifications);

  useEffect(() => {
    // Show new notifications
    notifications.forEach((notificationItem) => {
      if (!notificationItem.read) {
        notification[notificationItem.type]({
          message: notificationItem.title,
          description: notificationItem.message,
          key: notificationItem._id,
          duration: notificationItem.type === 'error' ? 0 : 4.5, // Error notifications don't auto-close
          onClose: () => {
            dispatch(removeNotification(notificationItem._id));
          },
        });
      }
    });
  }, [notifications, dispatch]);

  return null; // This component doesn't render anything visible
};

export default NotificationContainer; 