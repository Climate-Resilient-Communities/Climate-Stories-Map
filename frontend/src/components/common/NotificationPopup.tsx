import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import './NotificationPopup.css';

interface NotificationPopupProps {
  message: string;
  isVisible: boolean;
  onClose: () => void;
  isError?: boolean;
}

const NotificationPopup: React.FC<NotificationPopupProps> = ({ message, isVisible, onClose, isError }) => {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onClose();
      }, 2000); // Show for 5 seconds to ensure visibility

      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  // Get or create portal container
  if (!document.getElementById('notification-portal')) {
    const portalElement = document.createElement('div');
    portalElement.id = 'notification-portal';
    document.body.appendChild(portalElement);
  }
  const portalElement = document.getElementById('notification-portal')!;

  return createPortal(
    <div 
      className={`notification-popup ${isVisible ? 'visible' : ''} ${isError ? 'error' : ''}`}
      role="alert"
    >
      {message}
    </div>,
    portalElement
  );
};

export default NotificationPopup;