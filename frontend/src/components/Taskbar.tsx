import { useState } from 'react';
import { useTheme } from '../themes/ThemeContext';
import TagFilter from './posts/TagFilter';
import { Post } from './posts/types';
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
  onCreatePost?: () => void;
  posts?: Post[];
  selectedTags?: string[];
  onTagSelect?: (tags: string[]) => void;
  isFilterVisible?: boolean;
  onToggleFilter?: () => void;
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
  onVisibilityChange,
  onCreatePost,
  posts = [],
  selectedTags = [],
  onTagSelect,
  isFilterVisible = false,
  onToggleFilter
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const { theme, setTheme, availableThemes } = useTheme();
  const toggleVisibility = () => {
    const newVisibility = !isVisible;
    setIsVisible(newVisibility);
    onVisibilityChange?.(newVisibility);
  };

  const handleThemeSelect = (newTheme: string) => {
    setTheme(newTheme as any);
  };

  return (
    <>
      <button 
        className={`taskbar-toggle-button ${isVisible ? 'expanded' : 'collapsed'}`}
        onClick={toggleVisibility}
        aria-label={isVisible ? 'Hide taskbar' : 'Show taskbar'}
      >
        {isVisible ? '<' : '>'}
      </button>
      <nav className={`taskbar ${isVisible ? 'visible' : 'hidden'}`}>
        <div className="taskbar-content">
          <a className="taskbar-title">Climate Stories Map</a>
          <div className="taskbar-main">
            {onCreatePost && (
              <div className="taskbar-create-post">
                <button className="taskbar-button" onClick={onCreatePost} title="Add your story">Add your story</button>
              </div>
            )}
            {onToggleFilter && (
              <div className="taskbar-filter">
                <button className="taskbar-button" onClick={onToggleFilter} title="Filter by Tags">Filter by Tags</button>
                {isFilterVisible && onTagSelect && (
                  <div className="taskbar-filter-content">
                    <TagFilter 
                      posts={posts} 
                      selectedTags={selectedTags} 
                      onTagSelect={onTagSelect} 
                    />
                  </div>
                )}
              </div>
            )}
          </div>
          <div className="taskbar-buttons">
            <button className="taskbar-button" onClick={onAboutClick} title="About">About</button>
            <button className="taskbar-button" onClick={onFaqClick} title="FAQ's">FAQ's</button>
            <button className="taskbar-button" onClick={onModClick} title="Moderation">Moderation</button>
            <div className="theme-selector">
              <div className="theme-label">Mode</div>
              <div className="theme-options">
                {availableThemes.map((themeName) => (
                  <button
                    key={themeName}
                    className={`taskbar-button theme-option ${theme === themeName ? 'active' : ''}`}
                    onClick={() => handleThemeSelect(themeName)}
                    title={themeName.charAt(0).toUpperCase() + themeName.slice(1)}
                  >
                    {themeName.charAt(0).toUpperCase() + themeName.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </nav>
    </>
  );
};

export default Taskbar;