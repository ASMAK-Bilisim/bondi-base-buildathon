import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CancelSquareIcon } from '@hugeicons/react';
import { formatDistanceToNow } from 'date-fns';
import { Notification } from '../contexts/NotificationContext';

interface NotificationDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: Notification[];
  onDismiss: (id: string) => void;
}

const NotificationDropdown: React.FC<NotificationDropdownProps> = ({ isOpen, onClose, notifications, onDismiss }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
          className="absolute top-full right-0 mt-2 w-72 bg-app-light rounded-lg shadow-lg overflow-hidden z-10 border border-app-primary-2"
        >
          <div className="relative p-2">
            <button 
              onClick={onClose} 
              className="absolute top-2 right-2 text-app-primary-2 hover:text-app-accent transition-colors"
            >
              <CancelSquareIcon size={16} />
            </button>
            <div className="max-h-60 overflow-y-auto">
              {notifications.length > 0 ? (
                notifications.map((notification) => (
                  <div key={notification.id} className="p-3 border-b border-app-dark-mint last:border-b-0 hover:bg-app-dark-mint transition-colors">
                    <h3 className="font-semibold text-[13px] text-app-primary-2 truncate mr-2">{notification.title}</h3>
                    <p className="mt-1 text-[11px] text-app-primary-2 line-clamp-2">{notification.message}</p>
                    <div className="mt-2 flex justify-between items-center">
                      <button
                        onClick={() => onDismiss(notification.id)}
                        className="text-[9px] font-medium text-app-light bg-app-primary-2 rounded hover:bg-app-dark transition-colors px-2 py-1"
                      >
                        Dismiss
                      </button>
                      <span className="text-[9px] text-app-primary-2">
                        {formatDistanceToNow(notification.timestamp, { addSuffix: true })}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex items-center justify-center h-12">
                  <p className="text-[11px] text-center text-app-primary-2">No notifications</p>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default NotificationDropdown;
