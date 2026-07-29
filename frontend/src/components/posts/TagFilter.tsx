import React from 'react';
import { Post } from './types';
import { MAIN_TAGS, TOPIC_TAGS, getTagColor, hexToRgba } from '../../utils/tag-constants';
import { STORY_PROMPTS } from '../../utils/story-prompts';
import TopicMarkerIcon from '../markers/TopicMarkerIcon';
import './TagFilter.css';

const EMOTION_EMOJIS: Record<string, string> = {
  Anxious: '😰',
  Overwhelmed: '😵‍💫',
  Hopeful: '🌱',
  Empowered: '💪',
  Frustrated: '😤',
  Angry: '😠',
  Concerned: '😟',
  'Sad/Grief': '😢',
  Motivated: '🔥',
  Inspired: '✨',
  Determined: '🎯',
  Resilient: '🌲',
  Fearful: '😨',
  Curious: '🤔',
};

interface TagFilterProps {
  posts: Post[];
  selectedTags: string[];
  onTagSelect: (selectedTags: string[]) => void;
  showToggle?: boolean;
  taskbarVisible?: boolean;
}

const TagFilter: React.FC<TagFilterProps> = ({ posts, selectedTags, onTagSelect, showToggle = true, taskbarVisible = true }) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const [currentPage, setCurrentPage] = React.useState(0);
  const [isMobile, setIsMobile] = React.useState(window.innerWidth <= 768);
  const touchStartX = React.useRef<number | null>(null);
  const touchStartY = React.useRef<number | null>(null);

  React.useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const legacyTags = React.useMemo(() => {
    const storyPromptSet = new Set<string>(STORY_PROMPTS);
    const tagSet = new Set<string>();
    posts.forEach(post => {
      if (post.tag && post.tag.trim() && !storyPromptSet.has(post.tag.trim())) tagSet.add(post.tag.trim());
      post.optionalTags.forEach(tag => {
        const normalized = typeof tag === 'string' ? tag.trim() : '';
        if (normalized && !storyPromptSet.has(normalized)) tagSet.add(normalized);
      });
    });

    const known = new Set<string>([...MAIN_TAGS, ...TOPIC_TAGS]);
    return Array.from(tagSet)
      .filter(tag => !known.has(tag))
      .sort((a, b) => a.localeCompare(b));
  }, [posts]);

  const getTopicColor = () => '#6b7280';

  const pages = [
    { title: 'Filter by Tags - Emotions', type: 'emotion' },
    { title: 'Filter by Tags - Topics', type: 'topic' },
    ...(legacyTags.length > 0 ? [{ title: 'Filter by Tags - Others', type: 'other' }] : [])
  ];

  const handleTagToggle = (tag: string) => {
    if (selectedTags.includes(tag)) {
      onTagSelect(selectedTags.filter(t => t !== tag));
    } else {
      onTagSelect([...selectedTags, tag]);
    }
  };

  const handleTouchStart = (event: React.TouchEvent<HTMLDivElement>) => {
    const touch = event.touches[0];
    touchStartX.current = touch.clientX;
    touchStartY.current = touch.clientY;
  };

  const handleTouchEnd = (event: React.TouchEvent<HTMLDivElement>) => {
    if (touchStartX.current === null || touchStartY.current === null) return;

    const touch = event.changedTouches[0];
    const deltaX = touch.clientX - touchStartX.current;
    const deltaY = touch.clientY - touchStartY.current;
    const minSwipeDistance = 40;

    touchStartX.current = null;
    touchStartY.current = null;

    if (Math.abs(deltaX) < minSwipeDistance || Math.abs(deltaX) <= Math.abs(deltaY)) {
      return;
    }

    if (deltaX < 0) {
      setCurrentPage((prev) => Math.min(prev + 1, pages.length - 1));
      return;
    }

    setCurrentPage((prev) => Math.max(prev - 1, 0));
  };

  return (
    <div className={`tag-filter-dropdown ${!taskbarVisible ? 'taskbar-hidden' : ''}`}>
      {showToggle && (
        <button 
          className="filter-toggle"
          onClick={() => setIsOpen(!isOpen)}
        >
          Filter by Tags
          <span className={`dropdown-arrow ${isOpen ? 'open' : ''}`}>▼</span>
        </button>
      )}
      
      {(isOpen || !showToggle) && isMobile && (
        <div className={`filter-dropdown carousel-mode`}>
          <div className="filter-modal-header">
            <h3 className="filter-modal-title">Filter by Tags</h3>
            <button 
              className="filter-modal-close" 
              onClick={() => setIsOpen(false)}
              aria-label="Close filter"
            >
              ✕
            </button>
          </div>

          <div
            className="carousel-container"
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            <div className="carousel-slides" style={{ transform: `translateX(-${currentPage * 100}%)` }}>
              {/* Emotion Page */}
              <div className="carousel-page">
                <div className="filter-section">
                  <div className="filter-panel-header">
                    <div className="filter-panel-title">Emotions</div>
                    <div className="filter-panel-subtitle">Select how you feel</div>
                  </div>
                  <div className="tag-grid carousel-grid emotion-grid" role="group" aria-label="Emotion tags">
                    {MAIN_TAGS.map(tag => (
                      <div key={tag} className="tag-option emotion-option" onClick={() => handleTagToggle(tag)} title={tag} aria-label={tag}>
                        <span
                          className={`tag-label tag-label--emotion-emoji ${selectedTags.includes(tag) ? 'selected' : ''}`}
                          style={{
                            backgroundColor: selectedTags.includes(tag)
                              ? hexToRgba(getTagColor(tag), 0.35)
                              : 'transparent',
                            borderColor: getTagColor(tag),
                            color: getTagColor(tag),
                          }}
                          aria-hidden="true"
                        >
                          {EMOTION_EMOJIS[tag] ?? '•'}
                        </span>
                        <div className="emotion-label">{tag}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Topic Page */}
              <div className="carousel-page">
                <div className="filter-section">
                  <div className="filter-panel-header">
                    <div className="filter-panel-title">Topics</div>
                    <div className="filter-panel-subtitle">Select a topic</div>
                  </div>
                  <div className="tag-grid carousel-grid topic-grid" role="group" aria-label="Topic tags">
                    {TOPIC_TAGS.map(tag => (
                      <div
                        key={tag}
                        className="tag-option topic-option"
                        onClick={() => handleTagToggle(tag)}
                        title={tag}
                        aria-label={tag}
                      >
                        <span
                          className={`tag-label tag-label--topic-icon ${selectedTags.includes(tag) ? 'selected' : ''}`}
                          style={{
                            backgroundColor: selectedTags.includes(tag)
                              ? hexToRgba(getTopicColor(), 0.22)
                              : 'transparent',
                            borderColor: getTopicColor(),
                            color: getTopicColor(),
                          }}
                          aria-hidden="true"
                        >
                          <TopicMarkerIcon topicTag={tag as any} size={16} />
                        </span>
                        <div className="topic-label">{tag}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Other Page */}
              {legacyTags.length > 0 && (
                <div className="carousel-page">
                  <div className="filter-section">
                    <div className="filter-panel-header">
                      <div className="filter-panel-title">Others</div>
                      <div className="filter-panel-subtitle">Browse more tags</div>
                    </div>
                    <div className="tag-grid carousel-grid other-grid" role="group" aria-label="Other tags">
                      {legacyTags.map(tag => (
                        <div key={tag} className="tag-option other-option" onClick={() => handleTagToggle(tag)} title={tag} aria-label={tag}>
                          <span className={`tag-label ${selectedTags.includes(tag) ? 'selected' : ''}`}>{tag}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Pagination Dots */}
          <div className="carousel-pagination">
            {pages.map((_, index) => (
              <button
                key={index}
                className={`pagination-dot ${index === currentPage ? 'active' : ''}`}
                onClick={() => setCurrentPage(index)}
                aria-label={`Go to page ${index + 1}`}
              />
            ))}
          </div>
        </div>
      )}

      {(isOpen || !showToggle) && !isMobile && (
        <div className="filter-dropdown">
          <div className="tag-section-title">Emotion</div>
          <div className="tag-grid" role="group" aria-label="Emotion tags">
            {MAIN_TAGS.map(tag => (
              <div key={tag} className="tag-option" onClick={() => handleTagToggle(tag)} title={tag} aria-label={tag}>
                <span
                  className={`tag-label tag-label--emotion-emoji ${selectedTags.includes(tag) ? 'selected' : ''}`}
                  style={{
                    backgroundColor: selectedTags.includes(tag)
                      ? hexToRgba(getTagColor(tag), 0.35)
                      : 'transparent',
                    borderColor: getTagColor(tag),
                    color: getTagColor(tag),
                  }}
                  aria-hidden="true"
                >
                  {EMOTION_EMOJIS[tag] ?? '•'}
                </span>
              </div>
            ))}
          </div>

          <div className="tag-section-title">Topic</div>
          <div className="tag-grid" role="group" aria-label="Topic tags">
            {TOPIC_TAGS.map(tag => (
              <div
                key={tag}
                className="tag-option"
                onClick={() => handleTagToggle(tag)}
                title={tag}
                aria-label={tag}
              >
                <span
                  className={`tag-label tag-label--topic-icon ${selectedTags.includes(tag) ? 'selected' : ''}`}
                  style={{
                    backgroundColor: selectedTags.includes(tag)
                      ? hexToRgba(getTopicColor(), 0.22)
                      : 'transparent',
                    borderColor: getTopicColor(),
                    color: getTopicColor(),
                  }}
                  aria-hidden="true"
                >
                  <TopicMarkerIcon topicTag={tag as any} size={16} />
                </span>
              </div>
            ))}
          </div>

          {legacyTags.length > 0 && (
            <>
              <div className="tag-section-title">Other</div>
              <div className="tag-grid tag-grid--scroll" role="group" aria-label="Other tags">
                {legacyTags.map(tag => (
                  <div key={tag} className="tag-option" onClick={() => handleTagToggle(tag)} title={tag} aria-label={tag}>
                    <span className={`tag-label ${selectedTags.includes(tag) ? 'selected' : ''}`}>{tag}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default TagFilter;