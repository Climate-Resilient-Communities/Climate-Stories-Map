// WelcomePopup.tsx
import React from 'react';
import WelcomeModal from './WelcomeModal';
import './WelcomePopup.css';

interface WelcomePopupProps {
  isOpen: boolean;
  onClose: () => void;
}
const WelcomePopup: React.FC<WelcomePopupProps> = ({ isOpen, onClose }) => {  
  return (
    <WelcomeModal isOpen={isOpen} onClose={onClose}>
      <div className="welcome-popup">
        <h1>Canadian Climate Stories Map</h1>
        <h3><div style={{textAlign: 'center' }}>Welcome to the Canadian Climate Stories Map!</div></h3><br/>
        <p>
          The Climate Stories Map is a space for sharing personal experiences with climate change. 
          By sharing, you're helping to build a collective understanding of what climate change really looks like in our communities.        
        </p>
        
        <button 
          className="welcome-btn"
          onClick={onClose}
        >
          Get Started
        </button>
      </div>
    </WelcomeModal>
  );
};

export default WelcomePopup;
