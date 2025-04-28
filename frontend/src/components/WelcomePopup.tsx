// WelcomePopup.tsx
import React, { useState } from 'react';
import WelcomeModal from './WelcomeModal';
import PrivacyPolicyPopup from './PrivacyPolicyPopup';
import TermsOfUsePopUp from './TermsOfUsePopUp';
import './WelcomePopup.css';

interface WelcomePopupProps {
  isOpen: boolean;
  onClose: () => void;
}

const WelcomePopup: React.FC<WelcomePopupProps> = ({ isOpen, onClose }) => {
  const [isAgreedToAll, setIsAgreedToAll] = useState(false);
  const [isPrivacyPolicyOpen, setIsPrivacyPolicyOpen] = useState(false);
  const [isTermsOfUseOpen, setIsTermsOfUseOpen] = useState(false);
  
  const handleAgreementCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsAgreedToAll(e.target.checked);
  };
  
  const openPrivacyPolicy = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsPrivacyPolicyOpen(true);
  };
  
  const closePrivacyPolicy = () => {
    setIsPrivacyPolicyOpen(false);
  };
  
  const openTermsOfUse = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsTermsOfUseOpen(true);
  };
  
  const closeTermsOfUse = () => {
    setIsTermsOfUseOpen(false);
  };
  
  const isGetStartedEnabled = isAgreedToAll;
  
  return (
    <WelcomeModal isOpen={isOpen} onClose={onClose}>
      <div className="welcome-popup">
        <h1> Canadian Climate Stories Map</h1>
        <h3><div style={{textAlign: 'center' }}>Welcome to the Canadian Climate Stories Map!</div></h3><br/>
        <p>
          The Climate Stories Map is a space for sharing personal experiences with climate change. 
          By sharing, you're helping to build a collective understanding of what climate change really looks like in our communities.        
        </p>
        
      <div className="checkbox-container">
        <div className="checkbox-row">
          <label className="checkbox-label">
            <input 
              type="checkbox" 
              checked={isAgreedToAll} 
              onChange={handleAgreementCheckboxChange} 
            />
            <span>By clicking this, you agree to the following:</span>
          </label>
        </div>
        <ul className="agreement-list">
          <li>I certify that I meet the age requirements <i>(13+ or with parental/guardian consent if under 18)</i></li>
          <li>I have read and agreed to the <a href="#" onClick={openPrivacyPolicy}>Privacy Policy</a></li>
          <li>I have read and agreed to the <a href="#" onClick={openTermsOfUse}>Terms of Use</a></li>
        </ul>
      </div>
      
        <button 
          className={`welcome-btn ${!isGetStartedEnabled ? 'welcome-btn-disabled' : ''}`} 
          onClick={onClose}
          disabled={!isGetStartedEnabled}
        >
          Get Started
        </button>
      </div>
      <PrivacyPolicyPopup isOpen={isPrivacyPolicyOpen} onClose={closePrivacyPolicy} />
      <TermsOfUsePopUp isOpen={isTermsOfUseOpen} onClose={closeTermsOfUse} />
    </WelcomeModal>
  );
};

export default WelcomePopup;
