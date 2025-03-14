import { Link } from 'react-router-dom';
import './Taskbar.css';

interface TaskbarProps {
  onAboutClick?: () => void;
  onContactClick?: () => void;
  onFaqClick?: () => void;
}

const Taskbar: React.FC<TaskbarProps> = ({ 
  onAboutClick, 
  onContactClick, 
  onFaqClick 
}) => {
  return (
    <nav className="taskbar">
      <div className="taskbar-content">
        <a className="taskbar-title">Climate Stories Map</a>
        <div className="taskbar-buttons">
        {false && <Link to="/posts" className="taskbar-button">Posts</Link> }
        { false && <Link to="/" className="taskbar-button">Map</Link> }
          <button className="taskbar-button" onClick={onAboutClick}>About Us</button>
          <button className="taskbar-button" onClick={onContactClick}>Contact</button>
          <button className="taskbar-button" onClick={onFaqClick}>FAQs</button>
        </div>
      </div>
    </nav>
  );
};

export default Taskbar;