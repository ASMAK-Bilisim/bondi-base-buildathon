import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CancelSquareIcon } from '@hugeicons/react';
import { formatDistanceToNow } from 'date-fns';
import NotificationHeader from './NotificationHeader';
import NotificationActions from './NotificationActions';

interface SlidingNotificationProps {
  notification: {
    id: string;
    title: string;
    message: string;
    timestamp: number;
  };
  onDismiss: (id: string) => void;
}

const SlidingNotification: React.FC<SlidingNotificationProps> = ({ notification, onDismiss }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss(notification.id);
    }, 4000);

    return () => clearTimeout(timer);
  }, [notification.id, onDismiss]);

  const timeAgo = formatDistanceToNow(notification.timestamp, { addSuffix: true });

  return (
    <AnimatePresence>
      <motion.div
        key={notification.id}
        initial={{ x: 300, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: 300, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 100, damping: 15 }}
        className="fixed right-4 top-[72px] w-72 bg-app-light rounded-lg shadow-lg overflow-hidden z-20 border border-app-primary-2"
      >
        <article className="p-3 border-b border-app-dark-mint hover:bg-app-dark-mint transition-colors relative">
          <div className="flex items-start">
            <img
              src="/assets/dashboard/Turtle.png"
              alt=""
              className="w-10 h-10 rounded-full object-cover mr-3 flex-shrink-0"
            />
            <div className="flex-1 min-w-0 overflow-hidden">
              <NotificationHeader title={notification.title} />
              <p className="mt-1 text-[11px] text-app-primary-2 line-clamp-2">{notification.message}</p>
              <NotificationActions onView={() => {}} />
              <span className="absolute bottom-2 right-2 text-[9px] text-app-primary-2 bg-app-dark-mint px-1 py-0.5 rounded">
                {timeAgo}
              </span>
            </div>
          </div>
          <button 
            onClick={() => onDismiss(notification.id)} 
            className="absolute top-2 right-2 text-app-primary-2 hover:text-app-accent transition-colors"
          >
            <CancelSquareIcon size={16} />
          </button>
        </article>
      </motion.div>
    </AnimatePresence>
  );
};

export default SlidingNotification;