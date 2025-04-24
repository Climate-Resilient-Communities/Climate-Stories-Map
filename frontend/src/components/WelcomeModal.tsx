// WelcomeModal.tsx
import React from 'react';
import './common/Modal.css'; // Reuse the existing Modal CSS

interface WelcomeModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

const WelcomeModal: React.FC<WelcomeModalProps> = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button className="modal-close-button" onClick={onClose}>
          &times;
        </button>
        {children}
      </div>
    </div>
  );
};

export default WelcomeModal;