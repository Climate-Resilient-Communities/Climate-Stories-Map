import { useState } from 'react';
import { useTheme } from '../themes/ThemeContext';
import './Taskbar.css';

interface TaskbarProps {
  onStoryClick?: () => void;
  onAboutClick?: () => void;
  onContactClick?: () => void;
  onFaqClick?: () => void;
  onModClick?: () => void;
  onPrivacyPolicyClick?: () => void;
  onTermsOfUseClick?: () => void;
  onVisibilityChange?: (isVisible: boolean) => void;
}

const themeIcons = {
  'winter': '❄️',
  'spring': '🌸',
  'summer': '☀️',
  'fall': '🍂'
};

const Taskbar: React.FC<TaskbarProps> = ({ 
  onStoryClick,
  onAboutClick, 
  onContactClick, 
  onFaqClick,
  onModClick,
  onPrivacyPolicyClick,
  onTermsOfUseClick,
  onVisibilityChange
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const { theme, setTheme, availableThemes } = useTheme();
  const [isThemeMenuOpen, setIsThemeMenuOpen] = useState(false);

  const toggleVisibility = () => {
    const newVisibility = !isVisible;
    setIsVisible(newVisibility);
    onVisibilityChange?.(newVisibility);
  };

  const handleThemeClick = () => {
    setIsThemeMenuOpen(!isThemeMenuOpen);
  };

  const handleThemeSelect = (newTheme: string) => {
    setTheme(newTheme as any);
    setIsThemeMenuOpen(false);
  };

  return (
    <>
      <button 
        className={`taskbar-toggle-button ${isVisible ? 'expanded' : 'collapsed'}`}
        onClick={toggleVisibility}
        aria-label={isVisible ? 'Hide taskbar' : 'Show taskbar'}
      >
        {isVisible ? '◀' : '▶'}
      </button>
      <nav className={`taskbar ${isVisible ? 'visible' : 'hidden'}`}>
        <div className="taskbar-content">
          <a className="taskbar-title">Climate Stories Map</a>
          <div className="taskbar-buttons">
            <button className="taskbar-button" onClick={onStoryClick}>How to use</button>
            <button className="taskbar-button" onClick={onAboutClick}>About</button>
            <button className="taskbar-button" onClick={onFaqClick}>FAQ's</button>
            <button className="taskbar-button" onClick={onModClick}>Moderation</button>
            <div className="theme-selector">
              <button 
                className="taskbar-button theme-toggle" 
                onClick={handleThemeClick}
                aria-label="Change theme"
                aria-expanded={isThemeMenuOpen}
              >
                {themeIcons[theme as keyof typeof themeIcons]}
              </button>
              {isThemeMenuOpen && (
                <div className="theme-menu">
                  {availableThemes.map((themeName) => (
                    <button
                      key={themeName}
                      className={`theme-option ${theme === themeName ? 'active' : ''}`}
                      onClick={() => handleThemeSelect(themeName)}
                    >
                      {themeIcons[themeName as keyof typeof themeIcons]} {themeName}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>
    </>
  );
};

export default Taskbar;