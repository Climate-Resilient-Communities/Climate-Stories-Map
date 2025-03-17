import React from 'react';
import { Post } from './types';

interface TagFilterProps {
  posts: Post[];
  selectedTags: string[];
  onTagSelect: (selectedTags: string[]) => void;
}

const TagFilter: React.FC<TagFilterProps> = ({ posts, selectedTags, onTagSelect }) => {
  const [tagFilter, setTagFilter] = React.useState('');

  const getAllTags = () => {
    const tagSet = new Set<string>();
    
    posts.forEach(post => {
      if (post.tag) {
        tagSet.add(post.tag);
      }
      
      post.optionalTags.forEach(tag => {
        tagSet.add(tag);
      });
    });
    
    return Array.from(tagSet).sort();
  };

  const allTags = getAllTags();
  const filteredTags = allTags.filter(tag => 
    tag.toLowerCase().includes(tagFilter.toLowerCase())
  );

  const handleTagToggle = (tag: string) => {
    if (selectedTags.includes(tag)) {
      onTagSelect(selectedTags.filter(t => t !== tag));
    } else {
      onTagSelect([...selectedTags, tag]);
    }
  };

  const clearFilters = () => {
    onTagSelect([]);
  };

  return (
    <div className="tag-filter">
      <h3>Filter by Tags</h3>
      <input
        type="text"
        placeholder="Search tags..."
        value={tagFilter}
        onChange={(e) => setTagFilter(e.target.value)}
        className="tag-search"
      />
      <div className="filter-description">
        {selectedTags.length > 0 ? 
          'Showing posts with selected tags' : 
          'Showing all posts (no filters applied)'}
      </div>
      <div className="tag-buttons">
        {filteredTags.map(tag => (
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