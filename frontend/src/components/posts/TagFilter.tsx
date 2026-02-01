import React from 'react';
import { Post } from './types';
import { MAIN_TAGS, TOPIC_TAGS, getTagColor, hexToRgba } from '../../utils/tag-constants';
import './TagFilter.css';

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
    const tagSet = new Set<string>();
    posts.forEach(post => {
      if (post.tag && post.tag.trim()) tagSet.add(post.tag);
      post.optionalTags.forEach(tag => {
        if (tag && tag.trim()) tagSet.add(tag);
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
          {MAIN_TAGS.map(tag => (
            <div key={tag} className="tag-option" onClick={() => handleTagToggle(tag)}>
              <span
                className={`tag-label ${selectedTags.includes(tag) ? 'selected' : ''}`}
                style={{
                  backgroundColor: selectedTags.includes(tag)
                    ? hexToRgba(getTagColor(tag), 0.25)
                    : 'transparent',
                  borderColor: getTagColor(tag),
                  color: getTagColor(tag),
                }}
              >
                {tag}
              </span>
            </div>
          ))}

          <div className="tag-section-title">Topic</div>
          {TOPIC_TAGS.map(tag => (
            <div key={tag} className="tag-option" onClick={() => handleTagToggle(tag)}>
              <span
                className={`tag-label ${selectedTags.includes(tag) ? 'selected' : ''}`}
                style={{
                  backgroundColor: selectedTags.includes(tag)
                    ? hexToRgba(getTopicColor(), 0.12)
                    : 'transparent',
                  borderColor: getTopicColor(),
                  color: getTopicColor(),
                }}
              >
                {tag}
              </span>
            </div>
          ))}

          {legacyTags.length > 0 && (
            <>
              <div className="tag-section-title">Other</div>
              {legacyTags.map(tag => (
                <div key={tag} className="tag-option" onClick={() => handleTagToggle(tag)}>
                  <span className={`tag-label ${selectedTags.includes(tag) ? 'selected' : ''}`}>{tag}</span>
                </div>
              ))}
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default TagFilter;