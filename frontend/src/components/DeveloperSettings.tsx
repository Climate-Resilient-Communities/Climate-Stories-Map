import React, { useState, useEffect } from 'react';
import { MobileOrientationManager } from '../utils/mobileOrientationManager';
import { Gear, DeviceMobile } from 'phosphor-react';
import './DeveloperSettings.css';

const DeveloperSettings: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [forceLandscape, setForceLandscape] = useState(true);
  const orientationManager = MobileOrientationManager.getInstance();

  useEffect(() => {
    setForceLandscape(orientationManager.getForceLandscape());
    
    const listener = (force: boolean) => setForceLandscape(force);
    orientationManager.addListener(listener);
    
    return () => orientationManager.removeListener(listener);
  }, [orientationManager]);

  const handleToggleForceLandscape = () => {
    const newValue = !forceLandscape;
    orientationManager.setForceLandscape(newValue);
  };

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
            <div className="dev-setting-item">
              <div className="dev-setting-info">
                <DeviceMobile size={20} />
                <div>
                  <strong>Force Landscape Mode</strong>
                  <p>Show prompt when device is in portrait mode</p>
                </div>
              </div>
              <label className="dev-toggle">
                <input
                  type="checkbox"
                  checked={forceLandscape}
                  onChange={handleToggleForceLandscape}
                />
                <span className="dev-toggle-slider"></span>
              </label>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default DeveloperSettings;