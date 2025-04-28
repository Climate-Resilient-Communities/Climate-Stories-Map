import './Taskbar.css';

interface TaskbarProps {
  onStoryClick?: () => void;
  onAboutClick?: () => void;
  onContactClick?: () => void;
  onFaqClick?: () => void;
  onModClick?: () => void;
  onPrivacyPolicyClick?: () => void;
  onTermsOfUseClick?: () => void;
}

const Taskbar: React.FC<TaskbarProps> = ({ 
  onStoryClick,
  onAboutClick, 
  onContactClick, 
  onFaqClick,
  onModClick,
  onPrivacyPolicyClick,
  onTermsOfUseClick
}) => {
  return (
    <nav className="taskbar">
      <div className="taskbar-content">
        <a className="taskbar-title">Climate Stories Map</a>
        <div className="taskbar-buttons">
        <button className="taskbar-button" onClick={onStoryClick}>How To Use</button>
          <button className="taskbar-button" onClick={onAboutClick}>About</button>
          <button className="taskbar-button" onClick={onContactClick}>Contact Us</button>
          <button className="taskbar-button" onClick={onFaqClick}>FAQs</button>
          <button className="taskbar-button" onClick={onModClick}>Moderation</button>
          <button className="taskbar-button" onClick={onPrivacyPolicyClick}>Privacy Policy</button>
          <button className="taskbar-button" onClick={onTermsOfUseClick}>Terms of Use</button>
        </div>
      </div>
    </nav>
  );
};

export default Taskbar;