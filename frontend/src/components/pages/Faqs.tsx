import React, { useState } from 'react';
import './PageLayout.css';

interface FaqsProps {
  taskbarVisible?: boolean;
}

const Faqs: React.FC<FaqsProps> = ({ taskbarVisible = true }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  
  const faqItems = [
    {
      question: "Why can't I see my post on the map?",
      answer: "Every submission goes through a moderation process before it appears on the map. This helps us ensure content follows our guidelines and keeps the platform safe for everyone. We receive a lot of submissions, so it might take some time for yours to be reviewed. If it's been more than a week and your post still isn't visible, feel free to reach out to us at info@crcgreen.com."
    },
    {
      question: "Can I delete my post?",
      answer: "Yes! If you want to remove your story, just email us at info@crcgreen.com with details about your post, and we'll take it down as soon as possible."
    },
    {
      question: "How can I become a moderator?",
      answer: "We love that you want to help! At the moment, our moderation team is small and run by volunteers. If you're interested in joining, reach out to info@crcgreen.com."
    },
    {
      question: "Who made Climate Stories Map?",
      answer: "The Climate Stories Map was created by Climate Resilient Communities, a non-profit based in Toronto, Ontario. We work to support communities in adapting to climate change and sharing their experiences."
    }
  ];

  const goToPrevious = () => {
    setCurrentIndex(prev => prev > 0 ? prev - 1 : faqItems.length - 1);
  };

  const goToNext = () => {
    setCurrentIndex(prev => prev < faqItems.length - 1 ? prev + 1 : 0);
  };

  return (
    <div className={`page-container ${taskbarVisible ? '' : 'taskbar-hidden'}`}>
      <div className="faq-page-content">
        <h1>FAQ's</h1>
        <div className="faq-layout">
          <div className="faq-nav-left">
            {currentIndex > 0 && (
              <button className="faq-nav-button" onClick={goToPrevious}>
                &lt;
              </button>
            )}
          </div>
          <div className={`faq-content-area ${currentIndex % 2 === 1 ? 'reverse' : ''}`}>
            <div className="faq-icon-section">
              <img 
                src={`/themes/summer/FAQ-Q${currentIndex + 1}.png`} 
                alt={`FAQ ${currentIndex + 1}`} 
                className="faq-icon-image"
              />
            </div>
            <div className="faq-text-section">
              <h3>{faqItems[currentIndex].question}</h3>
              <p>{faqItems[currentIndex].answer}</p>
            </div>
          </div>
          <div className="faq-nav-right">
            {currentIndex < faqItems.length - 1 && (
              <button className="faq-nav-button" onClick={goToNext}>
                &gt; 
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Faqs;