// WelcomePopup.tsx
import React from 'react';
import Modal from './common/Modal';
import './WelcomePopup.css';

interface WelcomePopupProps {
  isOpen: boolean;
  onClose: () => void;
}

const WelcomePopup: React.FC<WelcomePopupProps> = ({ isOpen, onClose }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="welcome-popup">
        <h1>Climate Stories Map</h1>
        <p>
        Welcome to the Climate Stories Map (the "Map"), a project by Climate Resilient Communities ("CRC"). The Map is an interactive platform for sharing and exploring stories about climate change and resilience. By accessing or using the Map, you agree to these Terms of Use. If you do not agree, please do not use the Map.
        We may update these Terms at any time. Your continued use of the Map means you accept the new Terms. Please check back regularly for any changes.
        </p>

        <h3> Purpose of the Map </h3>
        <p>The Climate Stories Map is a community-driven space for sharing experiences, knowledge, and perspectives on climate resilience. It is intended for non-commercial use and public awareness.</p>


      <h2>Your Rights and Responsibilities</h2> 
      <h3>Who Can Use the Map?</h3>
      <p>
      You must be at least 13 years old to use the Map.
      If you are under 18, ensure you have permission from a parent or guardian.
      {/*
      Pop-up window check box: data privacy consent
      //Protective feature (< 13 y of age, guardian/parent permission if < 18 y)
      //Verification tool (evaluation)
      }*/}
      </p>

      <h3> Submitting Content </h3> 
      <p>
      By submitting a story, you confirm that:
      You own or have permission to share the content.
      The content does not include personal contact details of yourself or others.
      The content does not infringe on intellectual property rights, violate privacy rights, or promote hate, violence, or discrimination.
      The content is truthful and does not intentionally mislead.
      You grant CRC a non-exclusive, worldwide, royalty-free license to share, display, and use your content for public awareness, research, and advocacy purposes.
      You may request the removal of your content at any time by contacting us at info@crcgreen.com.
      </p>
      <h3> Using the Map Respectfully</h3>
      <p>When using the Map, you agree not to:
      Submit false, misleading, or harmful information.
      Engage in harassment, discrimination, or hate speech.
      Spam or use the Map for commercial purposes.
      Attempt to hack, disrupt, or otherwise interfere with the Map’s operations.
      Collect or share personal information from other users.
      CRC reserves the right to remove content or restrict access to any user who violates these terms.
      </p>
      <h2> Intellectual Property</h2>
      <p>The Climate Stories Map and its content (excluding user-submitted stories) belong to Climate Resilient Communities.
      Stories submitted to the Map remain the intellectual property of their creators, but by posting, you give CRC permission to use them.
      </p>
      <h2> Limitation of Liability</h2>
      <p>The Map is provided "as is." We do not guarantee that it will always be available, free of errors, or function without interruptions.
      CRC is not responsible for:
      The accuracy or reliability of user-submitted content.
      Any harm or loss resulting from reliance on the information shared on the Map.
      Technical failures, data loss, or any other issues beyond our reasonable control.
      </p>
      <h2> Privacy and Data Protection</h2>
      <p>We take privacy seriously. We do not sell or share personal information with third parties.
      While submissions should not contain personal contact information, be mindful that stories may include personal experiences. By sharing, you consent to your story being publicly available.
      CRC reserves the right to remove stories that contain sensitive or identifying information that could put individuals at risk.
      For more details, please review our Privacy Policy.
      </p>
      <h2>External Links and Third-Party Content</h2>
      <p>
      The Map may contain links to external websites or third-party resources. CRC is not responsible for their content or privacy policies.
      Using third-party links is at your own risk.
      </p>

      <h2>Changes to the Map and Termination of Use</h2>
      <p>CRC may update or modify the Map at any time.
      We may suspend or terminate access to users who violate these Terms.
      If you wish to stop using the Map, you can simply discontinue use.
      </p>
      <h2>Governing Law</h2>
      <p>These Terms are governed by the laws of Ontario, Canada.
      Any disputes will be handled in the provincial or federal courts of Ontario.
      </p>
      <h2>Contact Us</h2>
      <p>If you have questions or concerns about these Terms, contact us at info@crcgreen.com.
      Thank you for contributing to the Climate Stories Map and helping build climate resilience through shared experiences!
      </p>
        <button className="welcome-btn" onClick={onClose}>
          Get Started
        </button>
      </div>
    </Modal>
  );
};

export default WelcomePopup;
