import React, { useState } from 'react';
import { MAIN_TAGS } from '../../utils/tag-constants';
import HCaptcha from '@hcaptcha/react-hcaptcha';
import { PostFormData } from './types';
import './PostForm.css';
import { useNotification } from '../common/NotificationContext';
import { useTheme } from '../../themes/ThemeContext';
import PrivacyPolicyPopup from '../PrivacyPolicyPopup';
import TermsOfUsePopUp from '../TermsOfUsePopUp';
import ImageModal from '../common/ImageModal';

interface PostFormProps {
  onSubmit: (formData: PostFormData) => void;
  onClose: () => void;
  initialCoordinates?: [number, number];
}

const CAPTCHA_SITE_KEY = import.meta.env.VITE_CAPTCHA_SITE_KEY || "10000000-ffff-ffff-ffff-000000000001";

const PostForm: React.FC<PostFormProps> = ({ onSubmit, onClose, initialCoordinates = [0, 0] }) => {
  const captchaRef = React.useRef<HCaptcha>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [isActive, setIsActive] = useState(true);
  const { showNotification } = useNotification();
  const { theme } = useTheme();
  const [isAgreedToAll, setIsAgreedToAll] = useState(false);
  const [isPrivacyPolicyOpen, setIsPrivacyPolicyOpen] = useState(false);
  const [isTermsOfUseOpen, setIsTermsOfUseOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [tagInput, setTagInput] = useState('');

  const handleAgreementCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsAgreedToAll(e.target.checked);
  };
  
  const openPrivacyPolicy = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsPrivacyPolicyOpen(true);
  };
  
  const closePrivacyPolicy = () => {
    setIsPrivacyPolicyOpen(false);
  };
  
  const openTermsOfUse = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsTermsOfUseOpen(true);
  };
  
  const closeTermsOfUse = () => {
    setIsTermsOfUseOpen(false);
  };
  
  React.useEffect(() => {
    return () => {
      setIsActive(false);
    };
  }, []);
  
  // Updated formData to include mandatory Tag
  const [formData, setFormData] = useState<PostFormData>({
    title: '',
    content: { description: '' },
    location: { type: 'Point', coordinates: initialCoordinates },
    tag: '-', // Default to "-", but will validate to Positive/Neutral/Negative on submit
    optionalTags: [],
    captchaToken: '',
  });

  React.useEffect(() => {
    if (
      formData.location.coordinates[0] !== initialCoordinates[0] ||
      formData.location.coordinates[1] !== initialCoordinates[1]
    ) {
      setFormData(prevData => ({
        ...prevData,
        location: { ...prevData.location, coordinates: initialCoordinates },
      }));
    }
  }, [initialCoordinates]);

  React.useEffect(() => {
    setTagInput(formData.optionalTags.join(', '));
  }, [formData.optionalTags]);

  const handleModalClose = React.useCallback(() => {
    setIsActive(false);
    setFormData(prevData => ({
      ...prevData,
      captchaToken: '',
    }));
    onClose();
  }, [onClose]);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      setSelectedImage(null);
      setImagePreview('');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      showNotification('Image must be less than 5MB', true);
      return;
    }

    setSelectedImage(file);
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const updateNestedField = (fieldPath: (string | number)[], value: any) => {
      setFormData(prevData => {
        const updatedData = { ...prevData };
        let currentLevel: any = updatedData;
        for (let i = 0; i < fieldPath.length - 1; i++) {
          currentLevel = currentLevel[fieldPath[i]] as any;
        }
        currentLevel[fieldPath[fieldPath.length - 1]] = value;
        return updatedData;
      });
    };

    switch (name) {
      case 'description':
        updateNestedField(['content', 'description'], value);
        break;
      case 'image':
        updateNestedField(['content', 'image'], value);
        break;
      case 'longitude':
        updateNestedField(['location', 'coordinates', 0], value === '' ? 0 : parseFloat(value) || 0);
        break;
      case 'latitude':
        updateNestedField(['location', 'coordinates', 1], value === '' ? 0 : parseFloat(value) || 0);
        break;

      case 'tag':
        setFormData(prevData => ({
          ...prevData,
          tag: value as '-' | 'Positive' | 'Neutral' | 'Negative',
        }));
        break;
      default:
        setFormData(prevData => ({ ...prevData, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAgreedToAll) {
      showNotification('Please agree to the Privacy Policy and Terms of Use before submitting.', true);
      return;
    }
    if (formData.tag === '-') {
      showNotification('Please select a valid tag (Positive, Neutral, or Negative).', true);
      return;
    }
    
    if (formData.captchaToken) {
      try {
        const submitData = new FormData();
        submitData.append('postData', JSON.stringify(formData));
        if (selectedImage) {
          submitData.append('image', selectedImage);
        }
        
        const response = await fetch('/api/posts/create', {
          method: 'POST',
          body: submitData,
        });
        
        if (response.ok) {
          showNotification('Your post has been submitted for review with our moderators!');
          setTimeout(() => {
            onClose();
          }, 100);
        } else {
          throw new Error('Failed to submit post');
        }
      } catch (error) {
        console.error('Error submitting post:', error);
        showNotification('There was an error submitting your post. Please try again.', true);
        return;
      }
    } else {
      showNotification('Please complete the hCaptcha.', true);
    }
  };

  const handleVerificationSuccess = React.useCallback((token: string) => {
    setFormData(prevData => ({
      ...prevData,
      captchaToken: token,
    }));
  }, []);

  const handleTagInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTagInput(e.target.value);
  };

  const handleTagInputBlur = () => {
    const tags = tagInput ? tagInput.split(',').map(tag => tag.trim()).filter(tag => tag) : [];
    const longTag = tags.find(tag => tag.length > 50);
    if (longTag) {
      showNotification('Each tag must be 50 characters or less', true);
      return;
    }
    if (tags.length > 3) {
      showNotification('Maximum 3 optional tags allowed', true);
      return;
    }
    setFormData(prevData => ({
      ...prevData,
      optionalTags: tags,
    }));
  };

  const isFormValid = () => {
    const tags = tagInput ? tagInput.split(',').map(tag => tag.trim()).filter(tag => tag) : [];
    const hasLongTag = tags.some(tag => tag.length > 50);
    const hasTooManyTags = tags.length > 3;
    
    return formData.title.trim() !== '' &&
           formData.content.description.trim() !== '' &&
           formData.tag !== '-' &&
           isAgreedToAll &&
           formData.captchaToken !== '' &&
           !hasLongTag &&
           !hasTooManyTags;
  };



  const renderForm = () => (
    <form className="post-form" onSubmit={handleSubmit}>
      <div 
        className="post-form-left"
        style={{ 
          backgroundImage: `url("/themes/${theme}/Share your climate story.png")`,
          backgroundColor: '#000000' // fallback color if image doesn't load
        }}
      ></div>
      <div className="post-form-right">
        <h2 className="post-form-title">Share your Climate Story</h2>
        
        <div className="tag-checkboxes">
          {MAIN_TAGS.map((tag) => (
            <label key={tag} className="tag-checkbox">
              <input
                type="checkbox"
                checked={formData.tag === tag}
                onChange={() => setFormData(prev => ({ ...prev, tag: formData.tag === tag ? '-' : tag }))}
              />
              {tag}
            </label>
          ))}
        </div>

        <input
          type="text"
          name="title"
          placeholder="Title"
          value={formData.title}
          onChange={handleChange}
          required
        />
        
        <textarea
          name="description"
          placeholder="Description"
          value={formData.content.description}
          onChange={handleChange}
          required
        />
        
        <div className="image-upload-section">
          <label htmlFor="image-upload" className="image-upload-label">
            Upload Image (Optional)
          </label>
          <div className="image-upload-content">
            <input
              id="image-upload"
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageSelect}
              className="image-upload-input"
            />
            {imagePreview && (
              <div className="image-preview">
                <img 
                  src={imagePreview} 
                  alt="Preview" 
                  onClick={() => setIsImageModalOpen(true)}
                  style={{ cursor: 'pointer' }}
                  title="Click to view full size"
                />
                <button 
                  type="button" 
                  onClick={() => {
                    setSelectedImage(null);
                    setImagePreview('');
                    if (fileInputRef.current) {
                      fileInputRef.current.value = '';
                    }
                  }}
                  className="remove-image-btn"
                  title="Remove image"
                >
                  ×
                </button>
              </div>
            )}
          </div>
        </div>
        
        <input
          type="text"
          name="optionalTags"
          placeholder="Add Tags (max 3, comma separated)"
          value={tagInput}
          onChange={handleTagInputChange}
          onBlur={handleTagInputBlur}
        />
        <div className="checkbox-container">
          <div className="checkbox-row">
            <label className="checkbox-label">
              <input 
                type="checkbox" 
                checked={isAgreedToAll} 
                onChange={handleAgreementCheckboxChange} 
              />
              <span>By clicking this, you agree to the following:</span>
            </label>
          </div>
          <ul className="agreement-list">
            <li>I certify that I meet the age requirements (13+ or with parental/guardian consent if under 18)</li>
            <li>I have read and agreed to the <a href="#" onClick={openPrivacyPolicy}>Privacy Policy</a></li>
            <li>I have read and agreed to the <a href="#" onClick={openTermsOfUse}>Terms of Use</a></li>
          </ul>
        </div>

        <div className="form-buttons">
          <button type="button" onClick={handleModalClose}>Cancel</button>
          {isActive && (
            <HCaptcha
              ref={captchaRef}
              sitekey={CAPTCHA_SITE_KEY}
              onVerify={handleVerificationSuccess}
              onError={(err) => console.warn('hCaptcha Error:', (err?.message || 'Unknown error').replace(/[\r\n\t]/g, ' '))}
              onClose={() => setIsActive(false)}
            />
          )}
          <button type="submit" disabled={!isFormValid()}>Add</button>
        </div>
      </div>
    </form>
  );

  return (
    <>
      {renderForm()}
      <PrivacyPolicyPopup isOpen={isPrivacyPolicyOpen} onClose={closePrivacyPolicy} />
      <TermsOfUsePopUp isOpen={isTermsOfUseOpen} onClose={closeTermsOfUse} />
      <ImageModal 
        isOpen={isImageModalOpen} 
        onClose={() => setIsImageModalOpen(false)} 
        imageSrc={imagePreview} 
        imageAlt="Image preview" 
      />
    </>
  );
};

export default PostForm;