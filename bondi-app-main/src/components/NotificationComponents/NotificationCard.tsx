import React from "react";
import NotificationHeader from "./NotificationHeader";
import NotificationActions from "./NotificationActions";
import { CancelSquareIcon } from '@hugeicons/react'; // Changed from CancelSquareIcon to CancelSquare
import { formatDistanceToNow } from 'date-fns';

interface NotificationCardProps {
  id: string;
  imageSrc: string;
  title: string;
  message: string;
  timestamp: number;
  onDismiss: (id: string) => void;
}

const NotificationCard: React.FC<NotificationCardProps> = ({ id, imageSrc, title, message, timestamp, onDismiss }) => {
  const timeAgo = formatDistanceToNow(timestamp, { addSuffix: true });

  return (
    <article className="p-3 border-b border-app-dark-mint hover:bg-app-dark-mint transition-colors relative">
      <div className="flex items-start">
        <img
          src={imageSrc}
          alt=""
          className="w-10 h-10 rounded-full object-cover mr-3 flex-shrink-0"
        />
        <div className="flex-1 min-w-0 overflow-hidden">
          <NotificationHeader title={title} />
          <p className="mt-1 text-[11px] text-app-primary-2 line-clamp-2">{message}</p>
          <NotificationActions onView={() => onView(notification.id)} />
          <span className="absolute bottom-2 right-2 text-[9px] text-app-primary-2 bg-app-dark-mint px-1 py-0.5 rounded">
            {timeAgo}
          </span>
        </div>
      </div>
      <button 
        onClick={() => onDismiss(id)} 
        className="absolute top-2 right-2 text-app-primary-2 hover:text-app-accent transition-colors"
      >
        <CancelSquareIcon size={16} />
      </button>
    </article>
  );
};

export default NotificationCard;
