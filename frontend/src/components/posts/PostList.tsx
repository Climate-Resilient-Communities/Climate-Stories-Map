// src/components/posts/PostList.tsx
import React, { useState } from 'react';
import { Post } from './types';
import './PostList.css';
import ImageModal from '../common/ImageModal';

interface PostListProps {
  posts: Post[];
}

const PostList: React.FC<PostListProps> = ({ posts }) => {
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [modalImageSrc, setModalImageSrc] = useState('');
  const [modalImageAlt, setModalImageAlt] = useState('');

  return (
    <div className="post-list-container">
      {posts.length > 0 ? (
        <div className="post-list">
          <div className="post-list-header">
            <span>Title</span>
            <span>Description</span>
            <span>Image</span>
            <span>Longitude</span>
            <span>Latitude</span>
            <span>Tag</span>
            <span>Optional Tag(s)</span>
          </div>
          <div className="post-list">
            {posts.map((post) => (
              <div className="post-item" key={post._id}>
                <div className="post-title">{post.title}</div>
                <div className="post-description">{post.content.description}</div>
                <div className="post-image">
                  {post.content.image && (
                    <img 
                      src={post.content.image} 
                      alt={post.title} 
                      onClick={() => {
                        setModalImageSrc(post.content.image!);
                        setModalImageAlt(post.title);
                        setIsImageModalOpen(true);
                      }}
                      style={{ cursor: 'pointer' }}
                      title="Click to view full size"
                    />
                  )}
                </div>
                <div className="post-longitude">{post.location.coordinates[0]}</div>
                <div className="post-latitude">{post.location.coordinates[1]}</div>
                <div className="post-tag">{post.tag}</div>
                <div className="post-opt-tags">{post.optionalTags.join(', ')}</div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <p>No posts available.</p>
      )}
      <ImageModal 
        isOpen={isImageModalOpen} 
        onClose={() => setIsImageModalOpen(false)} 
        imageSrc={modalImageSrc} 
        imageAlt={modalImageAlt} 
      />
    </div>
  );
};

export default PostList;
