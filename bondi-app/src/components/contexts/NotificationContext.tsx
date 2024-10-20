import React, { createContext, useContext, useState, useCallback } from 'react';

export interface Notification {
  id: string;
  title: string;
  message: string;
  timestamp: number;
  read: boolean;
  action?: () => void;
  actionLabel?: string;
}

interface NotificationContextType {
  notifications: Notification[];
  slidingNotification: Notification | null;
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;
  dismissNotification: (id: string) => void;
  markAsRead: (id: string) => void;
  dismissSlidingNotification: () => void;
  unreadCount: number;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

export const NotificationProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [slidingNotification, setSlidingNotification] = useState<Notification | null>(null);

  const addNotification = useCallback((notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString(),
      timestamp: Date.now(),
      read: false,
    };
    setSlidingNotification(newNotification);
    setTimeout(() => {
      setSlidingNotification(null);
      setNotifications(prev => [newNotification, ...prev]);
    }, 5000); // Show sliding notification for 5 seconds
  }, []);

  const dismissNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const markAsRead = useCallback((id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  }, []);

  const dismissSlidingNotification = useCallback(() => {
    if (slidingNotification) {
      setNotifications(prev => [slidingNotification, ...prev]);
      setSlidingNotification(null);
    }
  }, [slidingNotification]);

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <NotificationContext.Provider 
      value={{ 
        notifications, 
        slidingNotification, 
        addNotification, 
        dismissNotification, 
        markAsRead, 
        dismissSlidingNotification, 
        unreadCount 
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};