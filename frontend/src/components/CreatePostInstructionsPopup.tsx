import React, { useState } from 'react';
import Modal from './common/Modal';
import './CreatePostInstructionsPopup.css';

interface CreatePostInstructionsPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onNext: (dontShowAgain: boolean) => void;
}

const CreatePostInstructionsPopup: React.FC<CreatePostInstructionsPopupProps> = ({ 
  isOpen, 
  onClose, 
  onNext 
}) => {
  const [dontShowAgain, setDontShowAgain] = useState(false);

  const handleNext = () => {
    onNext(dontShowAgain);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="create-post-instructions-popup">
        <div className="instructions-content">
          <div className="instructions-icon">
            <div className="icon-placeholder">📝</div>
          </div>
          <div className="instructions-text">
            <h2>Add your Story</h2>
            <ul>
              <li>Click the location of your story on the map.</li>
              <li>Share your story in the box below.</li>
              <li>Click the Add button.</li>
            </ul>
          </div>
        </div>
        <div className="checkbox-container">
          <label className="checkbox-label">
            <input 
              type="checkbox" 
              checked={dontShowAgain} 
              onChange={(e) => setDontShowAgain(e.target.checked)} 
            />
            Do not show this to me again
          </label>
        </div>
        <div className="instructions-footer">
          <button className="next-btn" onClick={handleNext}>
            Next
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default CreatePostInstructionsPopup;