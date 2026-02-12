import React, { useState } from 'react';
import CRCMap from './Map';
import PostForm from './posts/PostForm';
import './MapWithForm.css';
import Modal from './common/Modal';
import { Post } from './posts/types';

interface MapWithFormProps {
  posts: Post[];
  onPostSubmit: (formData: any) => void;
  taskbarVisible?: boolean;
  createPostTrigger?: boolean;
  onCreatePostTriggered?: () => void;
  selectedTags?: string[];
}

const MapWithForm: React.FC<MapWithFormProps> = ({ 
  posts, 
  taskbarVisible = true,
  createPostTrigger,
  onCreatePostTriggered,
  selectedTags: externalSelectedTags,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [coordinates, setCoordinates] = useState<[number, number] | undefined>(undefined);
  const [selectedTags, setSelectedTags] = useState<string[]>(externalSelectedTags || []);

  const [isCreatePostMode, setIsCreatePostMode] = useState(false);

  React.useEffect(() => {
    if (externalSelectedTags) setSelectedTags(externalSelectedTags);
  }, [externalSelectedTags]);


  const handleMapClick = (coords: [number, number]) => {
    if (isCreatePostMode) {
      setCoordinates(coords);
      setIsModalOpen(true);
      setIsCreatePostMode(false);
    }
  };

  React.useEffect(() => {
    if (createPostTrigger) {
      setIsCreatePostMode(true);
      if (onCreatePostTriggered) {
        onCreatePostTriggered();
      }
    }
  }, [createPostTrigger, onCreatePostTriggered]);

  const handleMapRightClick = () => {
    if (isCreatePostMode) {
      setIsCreatePostMode(false);
    }
    setCoordinates(undefined);
  };

  const handleClose = React.useCallback(() => {
    setIsModalOpen(false);
  }, []);

  // Filter posts based on selected tags
  const filteredPosts = React.useMemo(() => {
    const hasTagFilters = selectedTags.length > 0;

    if (!hasTagFilters) return posts;

    return posts.filter(post => {
      const mainTagMatches = selectedTags.includes(post.tag);
      const optionalTagMatches = post.optionalTags.some(tag => selectedTags.includes(tag));
      const tagMatches = mainTagMatches || optionalTagMatches;

      return tagMatches;
    });
  }, [posts, selectedTags]);

  return (  
    <div className={`map-container${isCreatePostMode ? ' create-post-mode' : ''}`}>
      <CRCMap 
        onMapClick={handleMapClick} 
        onMapRightClick={handleMapRightClick} 
        posts={filteredPosts} 
        selectedTags={selectedTags}
        taskbarVisible={taskbarVisible}
        isCreatePostMode={isCreatePostMode}
      />
      <Modal isOpen={isModalOpen} onClose={handleClose}>
          <PostForm onClose={handleClose} initialCoordinates={coordinates}/>
      </Modal>
    </div>
  );
};

export default MapWithForm;