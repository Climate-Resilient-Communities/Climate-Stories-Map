import React from 'react';
import { FaPlusCircle } from 'react-icons/fa';
import './CreatePostButton.css';

interface CreatePostButtonProps {
  onClick: () => void;
  disabled?: boolean;
}

const CreatePostButton: React.FC<CreatePostButtonProps> = ({ onClick, disabled }) => {
  return (
    <button 
      className="create-post-button" 
      onClick={onClick}
      disabled={disabled}
      
    >
      <FaPlusCircle />
      { disabled ?       
        <span className="button-text">Kindly place marker on map</span> :       
        <span className="button-text">Create Post</span>
      }
    </button>
  );
};

export default CreatePostButton;