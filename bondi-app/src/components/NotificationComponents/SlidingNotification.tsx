import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CancelSquareIcon } from '@hugeicons/react';
import { useNotifications } from '../contexts/NotificationContext';

const SlidingNotification: React.FC = () => {
  const { slidingNotification, dismissSlidingNotification } = useNotifications();

  useEffect(() => {
    if (slidingNotification) {
      const timer = setTimeout(() => {
        dismissSlidingNotification();
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [slidingNotification, dismissSlidingNotification]);

  if (!slidingNotification) return null;

  return (
    <AnimatePresence>
      <motion.div
        key={slidingNotification.id}
        initial={{ x: 300, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: 300, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 100, damping: 15 }}
        className="fixed right-4 top-[72px] w-72 bg-app-light rounded-lg shadow-lg overflow-hidden z-20 border border-app-primary-2"
      >
        <article className="p-3 border-b border-app-dark-mint hover:bg-app-dark-mint transition-colors relative">
          <div className="flex flex-col">
            <h3 className="font-semibold text-[13px] text-app-primary-2 truncate mr-2">{slidingNotification.title}</h3>
            <p className="mt-1 text-[11px] text-app-primary-2 line-clamp-2">{slidingNotification.message}</p>
            {slidingNotification.action && slidingNotification.actionLabel && (
              <button
                onClick={() => {
                  slidingNotification.action?.();
                  dismissSlidingNotification();
                }}
                className="mt-2 px-2 py-1 text-[9px] font-medium text-app-light bg-app-primary-2 rounded hover:bg-app-dark transition-colors self-start"
              >
                {slidingNotification.actionLabel}
              </button>
            )}
          </div>
          <button 
            onClick={dismissSlidingNotification} 
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
