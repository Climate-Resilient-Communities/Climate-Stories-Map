// CustomPopup.tsx
import React from 'react';
import './Popup.css';
import { Post } from './posts/types';

interface CustomPopupProps {
  post: Post;
}

const CustomPopup: React.FC<CustomPopupProps> = ({ post }) => (
  <div className="custom-popup">
    <h3 className="popup-title">{post.title}</h3>
    <p className="popup-description">{post.content.description}</p>
    <small className="popup-date">
      {new Date(post.createdAt).toLocaleDateString()}
    </small>
    <div className="popup-tag">
        <span key={post.tag} className="popup-tag">#{post.tag}</span>
    </div>
    <div className="popup-opt-tags">
      {post.optionalTags.length > 0 && post.optionalTags.map(tag => (
        <span key={tag} className="popup-tag">#{tag}</span>
      ))}
    </div>
  </div>
);

export default CustomPopup;
