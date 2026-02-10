import React from 'react';
import Modal from './common/Modal';
import './SubmissionPopup.css';

interface SubmissionPopupProps {
  isOpen: boolean;
  onClose: () => void;
  message?: string; // Optional custom message
}

const SubmissionPopup: React.FC<SubmissionPopupProps> = ({
  isOpen,
  onClose,
  message = "Your submission was successful!"
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="large">
      <div className="submission-confirmation">
        <h2>Success!</h2>
        <p>{message}</p>
        <button className="confirm-btn" onClick={onClose} autoFocus>
          OK
        </button>
      </div>
    </Modal>
  );
};

export default SubmissionPopup;