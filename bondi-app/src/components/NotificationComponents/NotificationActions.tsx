/**
 * This code was generated by Builder.io.
 */
import React from "react";

interface NotificationActionsProps {
  onView: () => void;
}

const NotificationActions: React.FC<NotificationActionsProps> = ({ onView }) => {
  return (
    <div className="flex gap-2 mt-2">
      <button 
        onClick={onView}
        className="px-2 py-1 text-[9px] font-medium text-app-light bg-app-primary-2 rounded hover:bg-app-dark transition-colors"
      >
        View
      </button>
    </div>
  );
};

export default NotificationActions;