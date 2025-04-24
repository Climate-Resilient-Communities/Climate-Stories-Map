// PrivacyPolicyPopup.tsx
import React from 'react';
import Modal from './common/Modal';
import './PrivacyPolicyPopup.css';

interface PrivacyPolicyPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

const PrivacyPolicyPopup: React.FC<PrivacyPolicyPopupProps> = ({ isOpen, onClose }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="privacy-policy-popup">
        <h1>Privacy Policy</h1>
        
        <div className="popup-content-section">
          <h2>Introduction</h2>
          <p>
          Climate Resilient Communities ("CRC") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and protect the information shared on the Climate Stories Map ("the Map"). By using the Map, you acknowledge that you have read, understood, and agree to this Privacy Policy. If you do not agree, please do not use the Map.
          We may update this Privacy Policy from time to time. Your continued use of the Map after any changes means you accept the updated terms. Please check back regularly for any updates.

          </p>
          
          <h2>Information We Collect</h2>
          <p>
            We collect the following types of information:
          </p>
          <p>
            <strong>User-Submitted Stories:</strong> The stories and locations users voluntarily submit.
          </p>
          <p>
            <strong>Tags/Categories:</strong> Users may classify stories using tags.
          </p>
          <p>
            <strong>Submission Timestamps:</strong> Automatically generated when a story is submitted to help organize content chronologically.
          </p>
          <p>
            <strong>Anonymized Data:</strong> We do not collect personal identifiers such as names, email addresses, or social media handles.
          </p>
          <p>
            Users may choose to share their stories anonymously. However, we recommend avoiding personal details in submissions to maintain privacy.
          </p>
          <h2>How We Use Your Information</h2>
          <p>We use collected data to:</p>
          <ul>
            <li>Display stories on the Climate Stories Map for public engagement and knowledge-sharing.</li>
            <li>Generate aggregated, anonymized insights for research and advocacy.</li>
            <li>Improve and maintain the functionality of the Map.</li>
          </ul>
          <p>We will never sell or share your data for commercial purposes.</p>
          <h2>Data Anonymity and Disclosure</h2>
          <p>
            <strong>Anonymity:</strong> All contributions are moderated to ensure they do not include personal contact details or identifiable information.
          </p>
          <p>
            <strong>Public Visibility:</strong> Once submitted, stories are visible to all users of the Map.
          </p>
          <p>
            <strong>Legal Compliance:</strong> We may disclose information in response to legal processes, compliance with applicable laws, or government requests where required.
          </p>

          <h2>Security Measures</h2>
          <p>We take reasonable measures to protect the data collected, including:</p>
          <p>
            <strong>Encryption:</strong> Data is encrypted both during transmission and storage.
 
          </p>
          <p>
            <strong>Moderation:</strong> Stories are reviewed to ensure they adhere to community guidelines and privacy standards.
          </p>
          <p>
            <strong>Security Audits:</strong> Regular assessments are conducted to ensure the safety of stored information.
          </p>
          <p>While we take strong precautions, no data transmission over the internet can be guaranteed 100% secure.</p>

          <h2>Retention and Deletion of Data</h2>
          <p>
            <strong>Public Contributions:</strong> Submitted stories remain available indefinitely to preserve the integrity of the Map’s purpose.
          </p>
          <p>
            <strong>Internal Logs:</strong> Any operational logs related to submissions are securely archived or deleted when no longer needed.
          </p>
          <p>
            <strong>User Requests:</strong> You may request the removal of your submitted content at any time by contacting us at info@crcgreen.com.
          </p>

          <h2>Third-Party Services</h2>
          <p>
          The Map may use third-party services for hosting, analytics, or functionality enhancements.<br/>
          These third-party services may have their own privacy policies. We encourage you to review them.<br/>
          Third party service/s include: 
          <ul>
            <li>Mapbox</li>
            <li>HCaptcha</li>
            <li>GeoJson</li>
          </ul>
          </p>

          <h2>Children’s Privacy</h2>
          <p>
          The Climate Stories Map is intended for users aged 13 and older.
          We do not knowingly collect information from children under 13. If you are under 13, please do not submit any content.
          If we learn that a submission was made by a child under 13, it will be removed.
          </p>
          <h2>Changes to This Privacy Policy</h2>
          <p>
          We may update this Privacy Policy at any time. Any changes will take effect immediately upon posting. 
          Continued use of the Map after changes are made constitutes agreement to the updated policy.
          </p>
          
          <h2>Contact Us</h2>
          <p>
            If you have any questions or concerns about this Privacy Policy, please contact us at info@crcgreen.com.
          </p>
        </div>
        <p>
            Thank you for contributing to the Climate Stories Map and helping build a more resilient world through shared experiences!
        </p>
        <div className="popup-footer">
          <button className="close-btn" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default PrivacyPolicyPopup;
