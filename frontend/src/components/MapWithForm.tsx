import React, { useState } from 'react';
import CRCMap from './Map';
import PostForm from './posts/PostForm';
import TagFilter from './posts/TagFilter';
import './MapWithForm.css';
import './posts/TagFilter.css';
import Modal from './common/Modal';
import { Post } from './posts/types';
import { FaFilter } from 'react-icons/fa';

interface MapWithFormProps {
  posts: Post[];
  onPostSubmit: (formData: any) => void;
}

const MapWithForm: React.FC<MapWithFormProps> = ({ posts, onPostSubmit }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [coordinates, setCoordinates] = useState<[number, number] | undefined>(undefined);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isFilterVisible, setIsFilterVisible] = useState(false);

  const toggleFilterVisibility = () => {
    setIsFilterVisible(prevState => !prevState);
  };

  const handleMapClick = (coords: [number, number]) => {
    setCoordinates(coords);
    setIsModalOpen(true);
  };

  const handleClose = React.useCallback(() => {
    setIsModalOpen(false);
  }, []);

  const handleSubmit = React.useCallback((formData: any) => {
    onPostSubmit(formData);
    setIsModalOpen(false);
  }, [onPostSubmit]);

  // Filter posts based on selected tags
  const filteredPosts = React.useMemo(() => {
    // If no tags are selected, show all posts
    if (selectedTags.length === 0) {
      return posts;
    }

    // Otherwise, filter posts that have any of the selected tags
    return posts.filter(post => {
      // Check if the main tag is in selectedTags
      const mainTagMatches = selectedTags.includes(post.tag);
      
      // Check if any optional tag is in selectedTags
      const optionalTagMatches = post.optionalTags.some(tag => 
        selectedTags.includes(tag)
      );
      
      // Return true if either main or any optional tag matches
      return mainTagMatches || optionalTagMatches;
    });
  }, [posts, selectedTags]);

  return (  
    <div className="map-container">
      <button 
        className="filter-toggle-button" 
        onClick={toggleFilterVisibility}
        style={{ 
          position: 'absolute', 
          top: '60px', 
          left: '10px', 
          zIndex: 999,
          padding: '8px',
          display: 'flex',
          alignItems: 'center',
          gap: '5px',
          background: '#4285F4',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer'
        }}
      >
        <FaFilter /> {isFilterVisible ? 'Hide Filters' : 'Show Filters'}
      </button>
      
      {isFilterVisible && (
        <div className="filter-overlay" style={{ 
          position: 'absolute', 
          top: '50px', 
          left: '10px', 
          zIndex: 998,
          width: '300px' 
        }}>
          <TagFilter 
            posts={posts} 
            selectedTags={selectedTags} 
            onTagSelect={setSelectedTags} 
          />
        </div>
      )}
      
      <CRCMap onMapClick={handleMapClick} posts={filteredPosts} selectedTags={selectedTags} />
      <Modal isOpen={isModalOpen} onClose={handleClose}>
          <PostForm onSubmit={handleSubmit} onClose={handleClose} initialCoordinates={coordinates}/>
      </Modal>
    </div>
  );
};

export default MapWithForm;