import React from 'react';
import './PageLayout.css';

interface ModerationProps {
  taskbarVisible?: boolean;
}

const Moderation: React.FC<ModerationProps> = ({ taskbarVisible = true }) => {
  return (
    <div className={`page-container ${taskbarVisible ? '' : 'taskbar-hidden'}`}>
      <div className="page-content">
        <h1>MODERATION GUIDELINES</h1>
        <div className="content-with-image">
          <div className="image-placeholder">
            <div className="community-icon">⚖️</div>
          </div>
          <div className="text-content">
            <div className="moderation-section">
              <h3>Why we Moderate?</h3>
              <p>
                The Climate Stories Map is a space for sharing climate experiences and ideas. 
                To keep it safe, respectful, and useful, we review all submissions before they 
                go public. We're not here to police anyone—we just want to keep this a positive, 
                secure space for everyone. We get a lot of submissions, so there may be some delays. 
                Thanks for your patience!
              </p>
            </div>

            <div className="moderation-section">
              <h3>What We Don't Approve</h3>
              
              <strong>1. Personal Info</strong>
              <p>No full names, phone numbers, emails, social media handles, or exact home addresses. Don't post someone else's info without their okay.</p>
              
              <strong>2. Hate Speech & Discrimination</strong>
              <p>No content that targets or threatens people based on race, ethnicity, nationality, ability, gender, sexuality, religion, or class. No promoting violence or discrimination.</p>
              
              <strong>3. Harassment & Threats</strong>
              <p>No bullying, intimidation, or threats. No encouragement of self-harm or harm to others.</p>
              
              <strong>4. Defamation & Privacy Violations</strong>
              <p>No false claims or personal attacks. No exposing private details about others.</p>
              
              <strong>5. Spam & Ads</strong>
              <p>No ads, promotions, or sales pitches. No mass-posted or repetitive content.</p>
              
              <strong>6. Copyright Violations</strong>
              <p>Don't post someone else's work without credit or permission.</p>
              
              <strong>7. Malicious Content</strong>
              <p>No viruses, harmful links, or anything that disrupts the site.</p>
            </div>

            <div className="moderation-section">
              <h3>Need Something Removed?</h3>
              <p>
                If you see something that breaks these rules or want your own post removed, 
                email us at info@crcgreen.com. We'll take a look as soon as we can.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Moderation;