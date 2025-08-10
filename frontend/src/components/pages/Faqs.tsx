import React from 'react';
import './PageLayout.css';

interface FaqsProps {
  taskbarVisible?: boolean;
}

const Faqs: React.FC<FaqsProps> = ({ taskbarVisible = true }) => {
  return (
    <div className={`page-container ${taskbarVisible ? '' : 'taskbar-hidden'}`}>
      <div className="page-content">
        <h1>FAQ's</h1>
        <div className="content-with-image">
          <div className="image-placeholder">
            <div className="community-icon">❓</div>
          </div>
          <div className="text-content">
            <div className="faq-item">
              <h3>Why can't I see my post on the map?</h3>
              <p>
                Every submission goes through a moderation process before it appears on the map. 
                This helps us ensure content follows our guidelines and keeps the platform safe 
                for everyone. We receive a lot of submissions, so it might take some time for 
                yours to be reviewed. If it's been more than a week and your post still isn't 
                visible, feel free to reach out to us at info@crcgreen.com.
              </p>
            </div>
            
            <div className="faq-item">
              <h3>Can I delete my post?</h3>
              <p>
                Yes! If you want to remove your story, just email us at info@crcgreen.com with 
                details about your post, and we'll take it down as soon as possible.
              </p>
            </div>
            
            <div className="faq-item">
              <h3>How can I become a moderator?</h3>
              <p>
                We love that you want to help! At the moment, our moderation team is small and 
                run by volunteers. If you're interested in joining, reach out to info@crcgreen.com.
              </p>
            </div>
            
            <div className="faq-item">
              <h3>Who made Climate Stories Map?</h3>
              <p>
                The Climate Stories Map was created by Climate Resilient Communities, a non-profit 
                based in Toronto, Ontario. We work to support communities in adapting to climate 
                change and sharing their experiences.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Faqs;