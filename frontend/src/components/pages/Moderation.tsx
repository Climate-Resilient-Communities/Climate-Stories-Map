import React, { useState } from 'react';
import './PageLayout.css';
import { useTheme } from '../../themes/ThemeContext';

interface ModerationProps {
  taskbarVisible?: boolean;
}

const Moderation: React.FC<ModerationProps> = ({ taskbarVisible = true }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const { theme } = useTheme();
  
  const moderationItems = [
    {
      title: "Why we Moderate?",
      content: "The Climate Stories Map is a space for sharing climate experiences and ideas. To keep it safe, respectful, and useful, we review all submissions before they go public. We're not here to police anyone—we just want to keep this a positive, secure space for everyone. We get a lot of submissions, so there may be some delays. Thanks for your patience!",
      type: "standard"
    },
    {
      title: "What We Don't Approve",
      type: "grid",
      gridItems: [
        {
          title: "1. Personal Info",
          content: "• No full names, phone numbers, emails, social media handles, or exact home addresses.\n• Don't post someone else's information."
        },
        {
          title: "2. Hate Speech & Discrimination",
          content: "• No content that targets or threatens people based on race, ethnicity, nationality, ability, gender, sexuality, religion, or class.\n• Don't post someone else's information."
        },
        {
          title: "3. Harassment, Threats and Defamation",
          content: "• No bullying, intimidation, or threats.\n• No encouragement of self-harm or harm to others.\n• No false claims or personal attacks."
        },
        {
          title: "4. Spam & Ads",
          content: "• No ads, promotions, or sales pitches.\n• No mass-posted or repetitive content"
        },
        {
          title: "5. Copyright Violations",
          content: "• Don't post someone else's work without credit or permission."
        },
        {
          title: "6. Malicious Content",
          content: "• No viruses, harmful links, or anything that disrupts the site."
        }
      ]
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
      <div className="moderation-page-content">
        <h1>MODERATION GUIDELINES</h1>
        <div className="moderation-layout">
          <div className="moderation-nav-left">
            {currentIndex > 0 && (
              <button className="moderation-nav-button" onClick={goToPrevious}>
                &lt;
              </button>
            )}
          </div>
          <div className="moderation-content-area">
            {moderationItems[currentIndex].type === 'grid' ? (
              <div className="moderation-grid-layout">
                <div className="moderation-grid">
                  {moderationItems[currentIndex].gridItems?.map((item, index) => (
                    <div key={index} className="moderation-grid-item">
                      <h4>{item.title}</h4>
                      <p style={{whiteSpace: 'pre-line'}}>{item.content}</p>
                    </div>
                  ))}
                </div>
                <div className="moderation-blackbox">
                  <h4>Need Something Removed?</h4>
                  <p>If you see something that breaks these rules or want your own post removed, email us at info@crcgreen.com. We'll take a look as soon as we can.</p>
                </div>
              </div>
            ) : (
              <>
                <div className="moderation-icon-section">
                  <img 
                    src={`/themes/${theme}/moderation.png`} 
                    alt="Moderation" 
                    className="faq-icon-image"
                  />
                </div>
                <div className="moderation-text-section">
                  <h3>{moderationItems[currentIndex].title}</h3>
                  <p style={{whiteSpace: 'pre-line'}}>{moderationItems[currentIndex].content}</p>
                </div>
              </>
            )}
          </div>
          <div className="moderation-nav-right">
            {currentIndex < moderationItems.length - 1 && (
              <button className="moderation-nav-button" onClick={goToNext}>
                &gt;
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Moderation;