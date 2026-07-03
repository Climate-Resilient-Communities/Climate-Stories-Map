import React, { useState } from 'react';
import { Gear } from 'phosphor-react';
import './DeveloperSettings.css';

const DeveloperSettings: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  // Only show on mobile devices or when explicitly testing
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
                   (window.innerWidth <= 768 && 'ontouchstart' in window);

  if (!isMobile && !window.location.search.includes('dev=true')) {
    return null;
  }

  return (
    <>
      <button 
        className="dev-settings-toggle"
        onClick={() => setIsOpen(!isOpen)}
        title="Developer Settings"
      >
        <Gear size={20} />
      </button>
      
      {isOpen && (
        <div className="dev-settings-panel">
          <div className="dev-settings-header">
            <h3>Developer Settings</h3>
            <button 
              className="dev-settings-close"
              onClick={() => setIsOpen(false)}
            >
              ×
            </button>
          </div>
          
          <div className="dev-settings-content">
            <p>Mobile orientation prompt has been disabled.</p>
          </div>
        </div>
      )}
    </>
  );
};

export default DeveloperSettings;