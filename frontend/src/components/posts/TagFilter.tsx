import React from 'react';
import { Post } from './types';

interface TagFilterProps {
  posts: Post[];
  selectedTags: string[];
  onTagSelect: (selectedTags: string[]) => void;
}

const TagFilter: React.FC<TagFilterProps> = ({ posts, selectedTags, onTagSelect }) => {
  // Extract unique tags from posts (both main tags and optional tags)
  const getAllTags = () => {
    const tagSet = new Set<string>();
    
    posts.forEach(post => {
      // Add main tag
      if (post.tag) {
        tagSet.add(post.tag);
      }
      
      // Add optional tags
      post.optionalTags.forEach(tag => {
        tagSet.add(tag);
      });
    });
    
    return Array.from(tagSet).sort();
  };

  const allTags = getAllTags();

  const handleTagToggle = (tag: string) => {
    if (selectedTags.includes(tag)) {
      // Remove tag if already selected
      onTagSelect(selectedTags.filter(t => t !== tag));
    } else {
      // Add tag if not selected
      onTagSelect([...selectedTags, tag]);
    }
  };

  const clearFilters = () => {
    onTagSelect([]);
  };

  return (
    <div className="tag-filter">
      <h3>Filter by Tags</h3>
      <div className="filter-description">
        {selectedTags.length > 0 ? 
          'Showing posts with selected tags' : 
          'Showing all posts (no filters applied)'}
      </div>
      <div className="tag-buttons">
        {allTags.map(tag => (
          <button
            key={tag}
            className={`tag-button ${selectedTags.includes(tag) ? 'selected' : ''}`}
            onClick={() => handleTagToggle(tag)}
          >
            {tag}
          </button>
        ))}
      </div>
      {selectedTags.length > 0 && (
        <button className="clear-filters" onClick={clearFilters}>
          Clear Filters
        </button>
      )}
    </div>
  );
};

export default TagFilter;