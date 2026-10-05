import React, { useState } from 'react';
import './PageLayout.css';
import { useTheme } from '../../themes/ThemeContext';
import { CaretDown, X } from 'phosphor-react';
import { useNavigate } from 'react-router-dom';

interface FaqsProps {
  taskbarVisible?: boolean;
}

const Faqs: React.FC<FaqsProps> = ({ taskbarVisible = true }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);
  const { theme } = useTheme();
  const navigate = useNavigate();
  
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
        <button
          type="button"
          className="faq-mobile-close"
          onClick={() => navigate('/')}
          aria-label="Close FAQs page"
        >
          <X size={24} weight="bold" />
        </button>
        <div className="faq-mobile-accordion">
          {faqItems.map((item, index) => {
            const isOpen = openFaqIndex === index;
            return (
              <section className={`faq-mobile-item ${isOpen ? 'open' : ''}`} key={item.question}>
                <button
                  type="button"
                  className="faq-mobile-trigger"
                  onClick={() => setOpenFaqIndex(isOpen ? null : index)}
                  aria-expanded={isOpen}
                >
                  <img src={`/themes/${theme}/FAQ-Q${index + 1}.png`} alt="" aria-hidden="true" />
                  <span>{item.question}</span>
                  <CaretDown size={18} weight="bold" aria-hidden="true" />
                </button>
                {isOpen && <p className="faq-mobile-answer">{item.answer}</p>}
              </section>
            );
          })}
        </div>
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
                src={`/themes/${theme}/FAQ-Q${currentIndex + 1}.png`} 
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