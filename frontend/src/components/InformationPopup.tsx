// InformationPopup.tsx
import React from 'react';
import Modal from './common/Modal';
import './InformationPopup.css';

// Define types for our popup content sections
export type ContentSection = 'story' | 'about' | 'contact' | 'faq' | 'moderation';

interface InformationPopupProps {
  isOpen: boolean;
  onClose: () => void;
  activeSection: ContentSection;
  openTermsOfUse?: () => void;
  openPrivacyPolicy?: () => void;
}

const InformationPopup: React.FC<InformationPopupProps> = ({ 
  isOpen, 
  onClose, 
  activeSection,
  openTermsOfUse,
  openPrivacyPolicy
}) => {

  // Function to render the appropriate content based on activeSection
  const renderContent = () => {
    switch (activeSection) {
      case 'story':
        return (
          <div className="popup-content-section">
            <h2>Add Your Story</h2>
            <p>
            1. Click the location of your story on the map.<br/>
            2. Share your story in the the box below.<br/>
            3. Click the Add button.<br/><br/>
            
            By submitting I agree to the <a href="#" onClick={(e) => { e.preventDefault(); openTermsOfUse && openTermsOfUse(); }}>Terms of Use</a> and <a href="#" onClick={(e) => { e.preventDefault(); openPrivacyPolicy && openPrivacyPolicy(); }}>Privacy Policy</a>.</p>
          </div>
        );
      case 'about':
        return (
          <div className="popup-content-section">
            <h2>About</h2>
            <p>
            The Climate Stories Map is a space for sharing personal experiences with climate change. Whether you've felt hopeful, frustrated, or inspired, your story matters. 
            Drop a pin, share your thoughts, and connect with others who care about our planet. 
            By sharing, you're helping to build a collective understanding of what climate change really looks like in our communities.
            </p>
          </div>
        );
      case 'moderation':
        return (
          <div className="popup-content-section">
            <h2>Moderation Guidelines</h2>
            <h3>Why We Moderate</h3>
            <p>The Climate Stories Map is a space for sharing climate experiences and ideas. To keep it safe, respectful, and useful, we review all submissions before they go public. We're not here to police anyone—we just want to keep this a positive, secure space for everyone. We get a lot of submissions, so there may be some delays. Thanks for your patience!</p>
            <h3>What We Don't Approve</h3>
            <strong>1. Personal Info </strong><br/>
            No full names, phone numbers, emails, social media handles, or exact home addresses.<br/>
            Don't post someone else's info without their okay.<br/>
            <strong>2. Hate Speech & Discrimination</strong><br/>
            No content that targets or threatens people based on race, ethnicity, nationality, ability, gender, sexuality, religion, or class.<br/>
            No promoting violence or discrimination.<br/>
            <strong>3. Harassment & Threats</strong> <br/>
            No bullying, intimidation, or threats.<br/>
            No encouragement of self-harm or harm to others.<br/>
            <strong>4. Defamation & Privacy Violations</strong><br/>
            No false claims or personal attacks.<br/>
            No exposing private details about others.<br/>
            <strong>5. Spam & Ads</strong><br/>
            No ads, promotions, or sales pitches.<br/>
            No mass-posted or repetitive content.<br/>
            <strong>6. Copyright Violations</strong><br/>
            Don't post someone else's work without credit or permission.<br/>
            <strong>7. Malicious Content</strong><br/>
            No viruses, harmful links, or anything that disrupts the site.<br/><br/>
            <h3>Need Something Removed?</h3>
            If you see something that breaks these rules or want your own post removed, email us at info@crcgreen.com. We'll take a look as soon as we can.
          </div>
        );
      case 'contact':
        return (
          <div className="popup-content-section">
            <h2>Contact Information</h2>
            <p>
            If you have any questions or want to get in touch you can reach us at <strong>info@crcgreen.com.</strong> <br/>
            Stay connected with us on Linkedin or Instagram!
            </p>
          </div>
        );
      case 'faq':
        return (
          <div className="popup-content-section">
            <h2>Frequently Asked Questions</h2>
            <div className="faq-item">
              <h3>Why can't I see my post on the map?</h3>
              <p>Every submission goes through a moderation process before it appears on the map. This helps us ensure content follows our guidelines and keeps the platform safe for everyone. We receive a lot of submissions, so it might take some time for yours to be reviewed. If it's been more than a week and your post still isn't visible, feel free to reach out to us at info@crcgreen.com.</p>
            </div>
            <div className="faq-item">
              <h3>Can I delete my post?</h3>
              <p>Yes! If you want to remove your story, just email us at info@crcgreen.com with details about your post, and we'll take it down as soon as possible.</p>
            </div>
            <div className="faq-item">
              <h3>How can I become a moderator?</h3>
              <p>We love that you want to help! At the moment, our moderation team is small and run by volunteers. If you're interested in joining, reach out to info@crcgreen.com.</p>
            </div>
            <div className="faq-item">
              <h3>Who made Climate Stories Map?</h3>
              <p>The Climate Stories Map was created by Climate Resilient Communities, a non-profit based in Toronto, Ontario. We work to support communities in adapting to climate change and sharing their experiences. Learn more about us on our website or foll</p>
            </div>
          </div>
        );
      default:
        return <div></div>;
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="information-popup">

        {renderContent()}
        
        <div className="popup-footer">
          <button className="close-btn" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default InformationPopup;