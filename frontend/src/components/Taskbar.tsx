import { useState } from 'react';
import { useTheme } from '../themes/ThemeContext';
import { Link, useLocation } from 'react-router-dom';
// Fixed icons for hidden taskbar
import { Plus, Info, Question, Eye, Snowflake, Flower, Sun, Leaf, MapPin, Share, BookOpen, Notepad, ArrowLeft, MapTrifold } from 'phosphor-react';
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

const themeLeafColors = {
  'winter': '#3b82f6',
  'spring': '#10b981', 
  'summer': '#f59e0b',
  'autumn': '#F7926A'
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
                  <button className="taskbar-button" onClick={onGoBackToMap} title="Go Back to Map">
                    {isVisible ? 'Go Back to Map' : <MapTrifold size={16} />}
                  </button>
                </div>
              )
            ) : (
              <>
                {onCreatePost && (
                  <div className="taskbar-create-post">
                    <button 
                      className={`taskbar-button ${!isFilterVisible && location.pathname === '/' ? 'active' : ''}`} 
                      onClick={() => {
                        if (isFilterVisible && onToggleFilter) onToggleFilter();
                        onCreatePost();
                      }} 
                      title="Add your story"
                    >
                      {isVisible ? <><Plus size={16} />Add your story</>:<MapPin size={16} />}
                    </button>
                  </div>
                )}
                {onToggleFilter && (
                  <div className="taskbar-filter">
                    <button className={`taskbar-button ${isFilterVisible ? 'active' : ''}`} onClick={onToggleFilter} title="Filter by Tags">
                      {isVisible ? <>Filter by Tags</> : <Plus size={16} />}
                    </button>
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
              onClick={() => {
                if (isFilterVisible && onToggleFilter) onToggleFilter();
              }}
            >
              {isVisible ? <Info size={16} /> : <Share size={16} />}
              {isVisible && 'About'}
            </Link>
            <Link 
              to="/faqs" 
              className={`taskbar-button ${location.pathname === '/faqs' ? 'active' : ''}`} 
              title="FAQ's"
              onClick={() => {
                if (isFilterVisible && onToggleFilter) onToggleFilter();
              }}
            >
              {isVisible ? <Question size={16} /> : <BookOpen size={16} />}
              {isVisible && "FAQ's"}
            </Link>
            <Link 
              to="/moderation" 
              className={`taskbar-button ${location.pathname === '/moderation' ? 'active' : ''}`} 
              title="Moderation"
              onClick={() => {
                if (isFilterVisible && onToggleFilter) onToggleFilter();
              }}
            >
              {isVisible ? <Eye size={16} /> : <Notepad size={16} />}
              {isVisible && 'Moderation'}
            </Link>
            <div className="theme-selector">
              {isVisible && <div className="theme-label">Mode</div>}
              <div className="theme-options">
                {availableThemes.map((themeName) => (
                  <button
                    key={themeName}
                    className={`taskbar-button theme-option ${theme === themeName ? 'active' : ''}`}
                    onClick={() => handleThemeSelect(themeName)}
                    title={themeName.charAt(0).toUpperCase() + themeName.slice(1)}
                  >
                    {!isVisible && <Leaf size={16} color={themeLeafColors[themeName as keyof typeof themeLeafColors]} weight={theme === themeName ? 'bold' : 'regular'} />}
                    {isVisible && themeName.charAt(0).toUpperCase() + themeName.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </nav>
      {isFilterVisible && onTagSelect && (
        <TagFilter 
          posts={posts} 
          selectedTags={selectedTags} 
          onTagSelect={onTagSelect}
          showToggle={false}
          taskbarVisible={isVisible}
        />
      )}
    </>
  );
};

export default Taskbar;