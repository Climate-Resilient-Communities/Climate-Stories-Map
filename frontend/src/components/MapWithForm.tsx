import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import CRCMap from './Map';
import PostForm from './posts/PostForm';
import SubmissionPopup from './posts/SubmissionPopup';
import './MapWithForm.css';
import Modal from './common/Modal';
import { Post } from './posts/types';
import { loadMapSubmissions, SUBMISSIONS_CHANGED_EVENT } from '../services/submissionTracking';

const isPost = (value: unknown): value is Post => {
  if (!value || typeof value !== 'object') return false;

  const post = value as Partial<Post>;
  return typeof post._id === 'string' &&
    typeof post.title === 'string' &&
    typeof post.content?.description === 'string' &&
    Array.isArray(post.location?.coordinates) &&
    post.location.coordinates.length === 2 &&
    post.location.coordinates.every(Number.isFinite) &&
    typeof post.tag === 'string' &&
    Array.isArray(post.optionalTags) &&
    typeof post.createdAt === 'string';
};

interface MapWithFormProps {
  posts: Post[];
  onPostSubmit: (formData: any) => void;
  taskbarVisible?: boolean;
  createPostTrigger?: boolean;
  onCreatePostTriggered?: () => void;
  onMobileCreatePost: () => void;
  selectedTags?: string[];
}

const MapWithForm: React.FC<MapWithFormProps> = ({ 
  posts, 
  taskbarVisible = true,
  createPostTrigger,
  onCreatePostTriggered,
  onMobileCreatePost,
  selectedTags: externalSelectedTags,
}) => {
  const location = useLocation();
  const routePost = (location.state as { focusPost?: unknown } | null)?.focusPost;
  const candidatePost = isPost(routePost) ? routePost : null;
  const focusedPost = candidatePost &&
    (candidatePost.status === undefined ||
      candidatePost.status === 'pending' ||
      candidatePost.status === 'approved')
    ? candidatePost
    : null;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [coordinates, setCoordinates] = useState<[number, number] | undefined>(undefined);
  const [selectedTags, setSelectedTags] = useState<string[]>(externalSelectedTags || []);

  const [isSubmissionPopupOpen, setIsSubmissionPopupOpen] = useState(false);
  const [submissionMessage, setSubmissionMessage] = useState<string | undefined>(undefined);

  const [isCreatePostMode, setIsCreatePostMode] = useState(false);
  const [privateMapPosts, setPrivateMapPosts] = useState<Post[]>([]);

  React.useEffect(() => {
    if (externalSelectedTags) setSelectedTags(externalSelectedTags);
  }, [externalSelectedTags]);

  React.useEffect(() => {
    let isCurrent = true;
    const refreshPrivatePosts = async () => {
      try {
        const trackedPosts = await loadMapSubmissions();
        if (isCurrent) setPrivateMapPosts(trackedPosts);
      } catch (error) {
        console.error('Could not load private map submissions:', error);
      }
    };

    void refreshPrivatePosts();
    window.addEventListener(SUBMISSIONS_CHANGED_EVENT, refreshPrivatePosts);
    return () => {
      isCurrent = false;
      window.removeEventListener(SUBMISSIONS_CHANGED_EVENT, refreshPrivatePosts);
    };
  }, []);


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

  const handleSubmitted = React.useCallback((message: string) => {
    setIsModalOpen(false);
    setSubmissionMessage(message);
    setIsSubmissionPopupOpen(true);
  }, []);

  // Filter posts based on selected tags
  const mapPosts = React.useMemo(() => {
    const mergedPosts = [
      ...posts,
      ...privateMapPosts,
    ];
    if (focusedPost) {
      const existingIndex = mergedPosts.findIndex((post) => post._id === focusedPost._id);
      if (existingIndex === -1) {
        mergedPosts.push(focusedPost);
      } else {
        mergedPosts[existingIndex] = focusedPost;
      }
    }

    return Array.from(new Map(mergedPosts.map((post) => [post._id, post])).values());
  }, [posts, privateMapPosts, focusedPost]);

  const filteredPosts = React.useMemo(() => {
    const hasTagFilters = selectedTags.length > 0;

    if (!hasTagFilters) return mapPosts;

    return mapPosts.filter(post => {
      if (post._id === focusedPost?._id) return true;
      const mainTagMatches = selectedTags.includes(post.tag);
      const optionalTagMatches = post.optionalTags.some(tag => selectedTags.includes(tag));
      const tagMatches = mainTagMatches || optionalTagMatches;

      return tagMatches;
    });
  }, [mapPosts, selectedTags, focusedPost]);

  return (  
    <div className={`map-container ${isCreatePostMode ? ' create-post-mode' : ''}`}>
      <CRCMap 
        onMapClick={handleMapClick} 
        onMapRightClick={handleMapRightClick} 
        onMobileCreatePost={onMobileCreatePost}
        onCancelCreatePost={() => setIsCreatePostMode(false)}
        posts={filteredPosts} 
        focusedPost={focusedPost}
        selectedTags={selectedTags}
        taskbarVisible={taskbarVisible}
        isCreatePostMode={isCreatePostMode}
      />
      <Modal isOpen={isModalOpen} onClose={handleClose} contentClassName="post-form-modal">
          <PostForm onClose={handleClose} initialCoordinates={coordinates} onSubmitted={handleSubmitted} />
      </Modal>

      <SubmissionPopup
        isOpen={isSubmissionPopupOpen}
        onClose={() => setIsSubmissionPopupOpen(false)}
        message={submissionMessage}
      />
    </div>
  );
};

export default MapWithForm;