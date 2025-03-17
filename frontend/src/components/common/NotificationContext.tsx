import React, { createContext, useContext, useState } from 'react';
import NotificationPopup from './NotificationPopup';

interface NotificationContextType {
  showNotification: (message: string, isError?: boolean) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);

  const handleClose = () => {
    setIsVisible(false);
  };

  const showNotification = (msg: string, error: boolean = false) => {
    setMessage(msg);
    setIsError(error);
    setIsVisible(true);
  };

  return (
    <NotificationContext.Provider value={{ showNotification }}>
      {children}
      <NotificationPopup 
        message={message}
        isVisible={isVisible}
        onClose={handleClose}
        isError={isError}
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