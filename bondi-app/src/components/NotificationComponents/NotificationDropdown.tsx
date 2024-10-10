import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CancelSquareIcon } from '@hugeicons/react';

interface Notification {
  id: string;
  title: string;
  message: string;
  timestamp: number;
  read: boolean;
}

interface NotificationDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: Notification[];
  onDismiss: (id: string) => void;
  onView: (id: string) => void;
}

const NotificationDropdown: React.FC<NotificationDropdownProps> = ({ isOpen, onClose, notifications, onDismiss, onView }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
          className="absolute top-full right-0 mt-2 w-60 bg-[#F2FBF9] rounded-lg shadow-lg overflow-hidden z-10 border border-[#1C544E]"
        >
          <div className="relative p-2">
            <button 
              onClick={onClose} 
              className="absolute top-1 right-1 text-[#1C544E] hover:text-[#F49C4A] transition-colors"
            >
              <CancelSquareIcon size={20} />
            </button>
            <div className="max-h-60 overflow-y-auto">
              {notifications.length > 0 ? (
                notifications.map((notification) => (
                  <div key={notification.id} className="p-2 border-b border-[#1C544E] last:border-b-0">
                    <h4 className="font-semibold text-sm text-[#1C544E]">{notification.title}</h4>
                    <p className="text-xs text-[#1C544E] mt-1">{notification.message}</p>
                    <div className="mt-2 flex justify-between items-center">
                      <button
                        onClick={() => onView(notification.id)}
                        className="text-xs text-[#F49C4A] hover:underline"
                      >
                        View
                      </button>
                      <button
                        onClick={() => onDismiss(notification.id)}
                        className="text-xs text-[#1C544E] hover:underline"
                      >
                        Dismiss
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex items-center justify-center h-12">
                  <p className="text-sm text-center text-[#1C544E]">No notifications</p>
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