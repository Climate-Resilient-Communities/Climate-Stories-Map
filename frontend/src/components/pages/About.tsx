import React from 'react';
import './PageLayout.css';

interface AboutProps {
  taskbarVisible?: boolean;
}

const About: React.FC<AboutProps> = ({ taskbarVisible = true }) => {
  return (
    <div className={`page-container ${taskbarVisible ? '' : 'taskbar-hidden'}`}>
      <div className="page-content">
        <h1>ABOUT</h1>
        <div className="content-with-image">
          <div className="text-content">
            <p>
              The Climate Stories Map is a space for sharing personal experiences with climate change. 
              Whether you've felt hopeful, frustrated, or inspired, your story matters. Drop a pin, 
              share your thoughts, and connect with others who care about our planet. By sharing, 
              you're helping to build a collective understanding of what climate change really looks 
              like in our communities.
            </p>
          </div>
          <div className="image-placeholder">
            <div className="community-icon">👥</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;