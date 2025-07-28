import React, { useState } from 'react';
import CRCMap from './Map';
import PostForm from './posts/PostForm';
import TagFilter from './posts/TagFilter';
import './MapWithForm.css';
import './posts/TagFilter.css';
import './FilterButton.css';
import Modal from './common/Modal';
import { Post } from './posts/types';
import { FaFilter } from 'react-icons/fa';
import CreatePostButton from './posts/CreatePostButton';

interface MapWithFormProps {
  posts: Post[];
  onPostSubmit: (formData: any) => void;
  taskbarVisible?: boolean;
}

const MapWithForm: React.FC<MapWithFormProps> = ({ posts, onPostSubmit, taskbarVisible = true }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [coordinates, setCoordinates] = useState<[number, number] | undefined>(undefined);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isFilterVisible, setIsFilterVisible] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isCreatePostMode, setIsCreatePostMode] = useState(false);

  const toggleFilterVisibility = () => {
    setIsFilterVisible(prevState => !prevState);
  };

  const handleMapClick = (coords: [number, number]) => {
    if (isCreatePostMode) {
      setCoordinates(coords);
      setIsModalOpen(true);
      setIsCreatePostMode(false);
    }
  };

  const handleMapRightClick = () => {
    if (isCreatePostMode) {
      setIsCreatePostMode(false);
    }
    setCoordinates(undefined);
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
    <div className={`map-container${isCreatePostMode ? ' create-post-mode' : ''}`}>
      <CreatePostButton 
        onClick={() => setIsCreatePostMode(true)}
        disabled={false}
        taskbarVisible={taskbarVisible}
      />
      <button 
        className={`filter-toggle-button ${!taskbarVisible ? 'taskbar-hidden' : ''}`}
        onClick={toggleFilterVisibility}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        style={{ 
          minWidth: isHovered ? 'auto' : '36px'
        }}
      >
        <FaFilter />{isHovered && ' Filter by Tags'}
      </button>
      
      {isFilterVisible && (
        <div className={`filter-overlay ${!taskbarVisible ? 'taskbar-hidden' : ''}`}>
          <TagFilter 
            posts={posts} 
            selectedTags={selectedTags} 
            onTagSelect={setSelectedTags} 
          />
        </div>
      )}
      
      <CRCMap 
        onMapClick={handleMapClick} 
        onMapRightClick={handleMapRightClick} 
        posts={filteredPosts} 
        selectedTags={selectedTags}
        taskbarVisible={taskbarVisible}
        isCreatePostMode={isCreatePostMode}
      />
      <Modal isOpen={isModalOpen} onClose={handleClose}>
          <PostForm onSubmit={handleSubmit} onClose={handleClose} initialCoordinates={coordinates}/>
      </Modal>
    </div>
  );
};

export default MapWithForm;