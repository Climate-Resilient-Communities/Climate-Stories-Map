import React from 'react';
import CRCMap from './Map';
import CreatePostButton from './posts/CreatePostButton';
import TagFilter from './posts/TagFilter';
import { Post } from './posts/types';
import './MapLayout.css';

interface MapContainerProps {
  posts: Post[];
  onMapClick: (coordinates: [number, number], event: React.MouseEvent<HTMLDivElement>) => void;
  onMapRightClick?: () => void;
  selectedTags: string[];
  onTagSelect: (selectedTags: string[]) => void;
  onCreatePost: () => void;
  createPostDisabled?: boolean;
  taskbarVisible?: boolean;
}

const MapContainer: React.FC<MapContainerProps> = ({
  posts,
  onMapClick,
  onMapRightClick,
  selectedTags,
  onTagSelect,
  onCreatePost,
  createPostDisabled,
  taskbarVisible = true
}) => {
  return (
    <div className={`map-layout ${taskbarVisible ? '' : 'taskbar-hidden'}`}>
      <div className="map-controls">
        <CreatePostButton
          onClick={onCreatePost}
          disabled={createPostDisabled}
        />
        <TagFilter
          posts={posts}
          selectedTags={selectedTags}
          onTagSelect={onTagSelect}
        />
      </div>
      <CRCMap
        posts={posts}
        onMapClick={onMapClick}
        onMapRightClick={onMapRightClick}
        selectedTags={selectedTags}
      />
    </div>
  );
};

export default MapContainer;