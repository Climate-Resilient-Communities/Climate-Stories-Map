import { useState } from 'react';
import { useTheme } from '../themes/ThemeContext';
import { Link, useLocation } from 'react-router-dom';
import TagFilter from './posts/TagFilter';
import { Post } from './posts/types';
import './Taskbar.css';

interface TaskbarProps {
  onPrivacyPolicyClick?: () => void;
  onTermsOfUseClick?: () => void;
  onVisibilityChange?: (isVisible: boolean) => void;
  onCreatePost?: () => void;
  posts?: Post[];
  selectedTags?: string[];
  onTagSelect?: (tags: string[]) => void;
  isFilterVisible?: boolean;
  onToggleFilter?: () => void;
  isCreatePostMode?: boolean;
  isOtherPage?: boolean;
  onGoBackToMap?: () => void;
}

const themeIcons = {
  'winter': '❄️',
  'spring': '🌸',
  'summer': '☀️',
  'fall': '🍂'
};

const Taskbar: React.FC<TaskbarProps> = ({ 
  onPrivacyPolicyClick,
  onTermsOfUseClick,
  onVisibilityChange,
  onCreatePost,
  posts = [],
  selectedTags = [],
  onTagSelect,
  isFilterVisible = false,
  onToggleFilter,
  isCreatePostMode = false,
  isOtherPage = false,
  onGoBackToMap
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const { theme, setTheme, availableThemes } = useTheme();
  const location = useLocation();
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
          <Link to="/" className="taskbar-title">Climate Stories Map</Link>
          <div className="taskbar-main">
            {isOtherPage ? (
              onGoBackToMap && (
                <div className="taskbar-go-back">
                  <button className="taskbar-button" onClick={onGoBackToMap} title="Go Back to Map">Go Back to Map</button>
                </div>
              )
            ) : (
              <>
                {onCreatePost && (
                  <div className="taskbar-create-post">
                    <button className="taskbar-button active" onClick={onCreatePost} title="Add your story">Add your story</button>
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
              </>
            )}
          </div>
          <div className="taskbar-buttons">
            <Link 
              to="/about" 
              className={`taskbar-button ${location.pathname === '/about' ? 'active' : ''}`} 
              title="About"
            >
              About
            </Link>
            <Link 
              to="/faqs" 
              className={`taskbar-button ${location.pathname === '/faqs' ? 'active' : ''}`} 
              title="FAQ's"
            >
              FAQ's
            </Link>
            <Link 
              to="/moderation" 
              className={`taskbar-button ${location.pathname === '/moderation' ? 'active' : ''}`} 
              title="Moderation"
            >
              Moderation
            </Link>
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