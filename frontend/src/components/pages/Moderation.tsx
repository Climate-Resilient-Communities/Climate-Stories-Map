import React, { useState } from 'react';
import './PageLayout.css';

interface ModerationProps {
  taskbarVisible?: boolean;
}

const Moderation: React.FC<ModerationProps> = ({ taskbarVisible = true }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  
  const moderationItems = [
    {
      title: "Why we Moderate?",
      content: "The Climate Stories Map is a space for sharing climate experiences and ideas. To keep it safe, respectful, and useful, we review all submissions before they go public. We're not here to police anyone—we just want to keep this a positive, secure space for everyone. We get a lot of submissions, so there may be some delays. Thanks for your patience!"
    },
    {
      title: "What We Don't Approve",
      content: "1. Personal Info - No full names, phone numbers, emails, social media handles, or exact home addresses. Don't post someone else's info without their okay.\n\n2. Hate Speech & Discrimination - No content that targets or threatens people based on race, ethnicity, nationality, ability, gender, sexuality, religion, or class. No promoting violence or discrimination.\n\n3. Harassment & Threats - No bullying, intimidation, or threats. No encouragement of self-harm or harm to others.\n\n4. Defamation & Privacy Violations - No false claims or personal attacks. No exposing private details about others.\n\n5. Spam & Ads - No ads, promotions, or sales pitches. No mass-posted or repetitive content.\n\n6. Copyright Violations - Don't post someone else's work without credit or permission.\n\n7. Malicious Content - No viruses, harmful links, or anything that disrupts the site."
    },
    {
      title: "Need Something Removed?",
      content: "If you see something that breaks these rules or want your own post removed, email us at info@crcgreen.com. We'll take a look as soon as we can."
    }
  ];

  const goToPrevious = () => {
    setCurrentIndex(prev => prev > 0 ? prev - 1 : moderationItems.length - 1);
  };

  const goToNext = () => {
    setCurrentIndex(prev => prev < moderationItems.length - 1 ? prev + 1 : 0);
  };

  return (
    <div className={`page-container ${taskbarVisible ? '' : 'taskbar-hidden'}`}>
      <div className="page-content">
        <h1>MODERATION GUIDELINES</h1>
        <div className="content-with-image">
          <div className="nav-left">
            {currentIndex > 0 && (
              <button className="nav-button" onClick={goToPrevious}>
                ‹
              </button>
            )}
          </div>
          <div className="content-center">
            <div className="image-placeholder">
              <div className="community-icon">⚖️</div>
            </div>
            <div className="text-content">
              <div className="moderation-section">
                <h3>{moderationItems[currentIndex].title}</h3>
                <p style={{whiteSpace: 'pre-line'}}>{moderationItems[currentIndex].content}</p>
              </div>
            </div>
          </div>
          <div className="nav-right">
            {currentIndex < moderationItems.length - 1 && (
              <button className="nav-button" onClick={goToNext}>
                ›
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Moderation;