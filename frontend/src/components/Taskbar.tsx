import { useEffect, useMemo, useRef, useState } from 'react';
import { useTheme } from '../themes/ThemeContext';
import { Link, useLocation } from 'react-router-dom';
// Fixed icons for hidden taskbar
import { Plus, Info, Question, Eye, Leaf, MapPin, Share, BookOpen, Notepad, MapTrifold } from 'phosphor-react';
import TagFilter from './posts/TagFilter';
import { Post } from './posts/types';
import './Taskbar.css';
import './Taskbar.mobile.css';

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
  onVisibilityChange,
  onCreatePost,
  posts = [],
  selectedTags = [],
  onTagSelect,
  isFilterVisible = false,
  onToggleFilter,
  isOtherPage = false,
  onGoBackToMap
}) => {
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return false;
    return window.matchMedia('(max-width: 768px)').matches;
  });
  const [isVisible, setIsVisible] = useState(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return true;
    return !window.matchMedia('(max-width: 768px)').matches;
  });
  const [isThemeMenuOpen, setIsThemeMenuOpen] = useState(false);
  const { theme, setTheme, availableThemes } = useTheme();
  const location = useLocation();
  const themeSelectorRef = useRef<HTMLDivElement | null>(null);

  const otherThemes = useMemo(
    () => availableThemes.filter((themeName) => themeName !== theme),
    [availableThemes, theme]
  );

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;

    const mediaQuery = window.matchMedia('(max-width: 768px)');

    const applyMobileVisibility = (isMobile: boolean) => {
      setIsMobile(isMobile);
      setIsVisible(!isMobile);
      onVisibilityChange?.(!isMobile);
      setIsThemeMenuOpen(false);
    };

    applyMobileVisibility(mediaQuery.matches);

    const handleChange = (event: MediaQueryListEvent) => {
      applyMobileVisibility(event.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, [onVisibilityChange]);

  useEffect(() => {
    if (!isThemeMenuOpen) return;

    const onMouseDown = (event: MouseEvent) => {
      const target = event.target as Node | null;
      if (!target) return;

      const container = themeSelectorRef.current;
      if (!container) return;
      if (!container.contains(target)) {
        setIsThemeMenuOpen(false);
      }
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsThemeMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', onMouseDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onMouseDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [isThemeMenuOpen]);

  useEffect(() => {
    if (!(isMobile && isVisible)) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsVisible(false);
        onVisibilityChange?.(false);
        setIsThemeMenuOpen(false);
      }
    };

    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [isMobile, isVisible, onVisibilityChange]);

  useEffect(() => {
    if (!(isMobile && isVisible)) {
      document.body.style.overflow = '';
      return;
    }

    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobile, isVisible]);

  const toggleVisibility = () => {
    const newVisibility = !isVisible;
    setIsVisible(newVisibility);
    onVisibilityChange?.(newVisibility);
    setIsThemeMenuOpen(false);
  };

  const handleThemeSelect = (newTheme: string) => {
    setTheme(newTheme as any);
    setIsThemeMenuOpen(false);
  };

  const toggleThemeMenu = () => {
    setIsThemeMenuOpen((value) => !value);
  };

  const themeTitle = theme.charAt(0).toUpperCase() + theme.slice(1);
  const showMobileBackdrop = isMobile && isVisible;

  return (
    <>
      {isMobile ? (
        <header className={`taskbar-mobile-header ${isVisible ? 'open' : 'closed'}`}>
          <button
            className="taskbar-toggle-button taskbar-toggle-button-mobile"
            onClick={toggleVisibility}
            aria-label={isVisible ? 'Hide menu' : 'Show menu'}
          >
            <span className="taskbar-toggle-icon" aria-hidden="true" />
          </button>
          <Link to="/" className="taskbar-mobile-title">
            Climate
            <br />
            Stories Map
          </Link>
        </header>
      ) : (
        <button 
          className={`taskbar-toggle-button ${isVisible ? 'expanded' : 'collapsed'}`}
          onClick={toggleVisibility}
          aria-label={isVisible ? 'Hide taskbar' : 'Show taskbar'}
        >
          {isVisible ? '<' : '>'}
        </button>
      )}
      {showMobileBackdrop && (
        <button
          type="button"
          className="taskbar-mobile-backdrop"
          aria-label="Close menu"
          onClick={() => {
            setIsVisible(false);
            onVisibilityChange?.(false);
            setIsThemeMenuOpen(false);
          }}
        />
      )}
      <nav className={`taskbar ${isVisible ? 'visible' : 'hidden'} ${isMobile ? 'mobile-drawer' : ''}`}>
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
              <div
                ref={themeSelectorRef}
                className={`theme-selector-inner ${isThemeMenuOpen ? 'open' : 'closed'}`}
              >
                <button
                  type="button"
                  className="taskbar-button theme-toggle"
                  onClick={toggleThemeMenu}
                  aria-haspopup="menu"
                  aria-expanded={isThemeMenuOpen}
                  title={isThemeMenuOpen ? 'Close theme selection' : 'Open theme selection'}
                >
                  <Leaf
                    size={16}
                    color={themeLeafColors[theme as keyof typeof themeLeafColors]}
                    weight="bold"
                  />
                  {isVisible && (
                    <span className="theme-toggle-text">
                      Mode: {themeTitle}
                    </span>
                  )}
                </button>

                <div className="theme-options" role="menu">
                  {otherThemes.map((themeName) => (
                    <button
                      key={themeName}
                      type="button"
                      className="taskbar-button theme-option"
                      onClick={() => handleThemeSelect(themeName)}
                      title={themeName.charAt(0).toUpperCase() + themeName.slice(1)}
                      role="menuitem"
                    >
                      {!isVisible && (
                        <Leaf
                          size={16}
                          color={themeLeafColors[themeName as keyof typeof themeLeafColors]}
                          weight="regular"
                        />
                      )}
                      {isVisible && themeName.charAt(0).toUpperCase() + themeName.slice(1)}
                    </button>
                  ))}
                </div>
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