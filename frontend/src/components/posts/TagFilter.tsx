import React from 'react';
import { Post } from './types';
import { MAIN_TAGS } from '../../utils/tag-constants';
import './TagFilter.css';

interface TagFilterProps {
  posts: Post[];
  selectedTags: string[];
  onTagSelect: (selectedTags: string[]) => void;
  showToggle?: boolean;
}

const TagFilter: React.FC<TagFilterProps> = ({ posts, selectedTags, onTagSelect, showToggle = true }) => {
  const [isOpen, setIsOpen] = React.useState(false);

  const getAllTags = () => {
    const tagSet = new Set<string>();
    
    posts.forEach(post => {
      if (post.tag && post.tag.trim()) {
        tagSet.add(post.tag);
      }
      
      post.optionalTags.forEach(tag => {
        if (tag && tag.trim()) {
          tagSet.add(tag);
        }
      });
    });
    
    return Array.from(tagSet).sort((a, b) => {
      const aIsMain = MAIN_TAGS.includes(a);
      const bIsMain = MAIN_TAGS.includes(b);
      if (aIsMain && !bIsMain) return -1;
      if (!aIsMain && bIsMain) return 1;
      if (aIsMain && bIsMain) {
        return MAIN_TAGS.indexOf(a) - MAIN_TAGS.indexOf(b);
      }
      return a.localeCompare(b);
    });
  };

  const allTags = getAllTags();

  const handleTagToggle = (tag: string) => {
    if (selectedTags.includes(tag)) {
      onTagSelect(selectedTags.filter(t => t !== tag));
    } else {
      onTagSelect([...selectedTags, tag]);
    }
  };

  return (
    <div className="tag-filter-dropdown">
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
          {allTags.map(tag => (
            <div 
              key={tag} 
              className="tag-option"
              onClick={() => handleTagToggle(tag)}
            >
              <span className={`tag-label ${tag} ${selectedTags.includes(tag) ? 'selected' : ''}`}>
                {tag}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TagFilter;