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
  onTagSelect?: (tags: string[]) => void;
  selectedStoryPrompt?: string;
  isFilterVisible?: boolean;
}

const MapWithForm: React.FC<MapWithFormProps> = ({ 
  posts, 
  onPostSubmit, 
  taskbarVisible = true,
  createPostTrigger,
  onCreatePostTriggered,
  selectedTags: externalSelectedTags,
  onTagSelect: externalOnTagSelect,
  selectedStoryPrompt
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

  const handleTagSelect = (tags: string[]) => {
    setSelectedTags(tags);
    if (externalOnTagSelect) externalOnTagSelect(tags);
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
    const hasTagFilters = selectedTags.length > 0;
    const hasPromptFilter = typeof selectedStoryPrompt === 'string' && selectedStoryPrompt.trim() !== '';

    if (!hasTagFilters && !hasPromptFilter) return posts;

    return posts.filter(post => {
      const promptMatches = !hasPromptFilter || post.storyPrompt === selectedStoryPrompt;

      if (!hasTagFilters) return promptMatches;

      const mainTagMatches = selectedTags.includes(post.tag);
      const optionalTagMatches = post.optionalTags.some(tag => selectedTags.includes(tag));
      const tagMatches = mainTagMatches || optionalTagMatches;

      return promptMatches && tagMatches;
    });
  }, [posts, selectedTags, selectedStoryPrompt]);

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