import React, { createContext, useContext, useState } from 'react';
import NotificationPopup from '../NotificationPopup';

interface NotificationContextType {
  showNotification: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [isVisible, setIsVisible] = useState(false);

  const handleClose = () => {
    setIsVisible(false);
  };

  const showNotification = () => {
    setIsVisible(true);
  };

  return (
    <NotificationContext.Provider value={{ showNotification }}>
      {children}
      <NotificationPopup 
        message="Your post has been submitted for review with our moderators!"
        isVisible={isVisible}
        onClose={handleClose}
      />
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};