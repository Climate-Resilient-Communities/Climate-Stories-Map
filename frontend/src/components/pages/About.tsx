import React from 'react';
import { useTheme } from '../../themes/ThemeContext';
import './PageLayout.css';

interface AboutProps {
  taskbarVisible?: boolean;
}

const About: React.FC<AboutProps> = ({ taskbarVisible = true }) => {
  const { theme } = useTheme();
  return (
    <div className={`page-container ${taskbarVisible ? '' : 'taskbar-hidden'}`}>
      <div className="about-page-content">
        <h1>ABOUT</h1>
        <div className="about-layout">
          <div className="about-text-section">
            <p>
              The Climate Stories Map is a space for sharing personal experiences with climate change. 
              Whether you've felt hopeful, frustrated, or inspired, your story matters. Drop a pin, 
              share your thoughts, and connect with others who care about our planet. By sharing, 
              you're helping to build a collective understanding of what climate change really looks 
              like in our communities.
            </p>
          </div>
          <div className="about-image-section">
            <img 
              src={`/themes/${theme}/About.png`} 
              alt="About" 
              className="about-page-image"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;