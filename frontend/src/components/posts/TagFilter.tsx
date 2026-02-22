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

  const handleTagToggle = (tag: string) => {
    if (selectedTags.includes(tag)) {
      onTagSelect(selectedTags.filter(t => t !== tag));
    } else {
      onTagSelect([...selectedTags, tag]);
    }
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
      
      {(isOpen || !showToggle) && (
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