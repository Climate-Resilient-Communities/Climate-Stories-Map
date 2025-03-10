import React, { useState } from 'react';
import HCaptcha from '@hcaptcha/react-hcaptcha';
import { PostFormData } from './types';
import './PostForm.css';

interface PostFormProps {
  onSubmit: (formData: PostFormData) => void;
  onClose: () => void;
  initialCoordinates?: [number, number];
}

const CAPTCHA_SITE_KEY = import.meta.env.VITE_CAPTCHA_SITE_KEY || "10000000-ffff-ffff-ffff-000000000001";

const PostForm: React.FC<PostFormProps> = ({ onSubmit, onClose, initialCoordinates = [0, 0] }) => {
  const captchaRef = React.useRef<HCaptcha>(null);
  const [isActive, setIsActive] = useState(true);
  
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

  const handleModalClose = React.useCallback(() => {
    setIsActive(false);
    setFormData(prevData => ({
      ...prevData,
      captchaToken: '',
    }));
    onClose();
  }, [onClose]);

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
      case 'optionalTags':
        setFormData(prevData => ({
          ...prevData,
          optionalTags: value.split(',').map(optionalTags => optionalTags.trim()),
        }));
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Validate that tag is one of the allowed values
    if (formData.tag === '-') {
      alert('Please select a valid tag (Positive, Neutral, or Negative).');
      return;
    }
    
    if (formData.captchaToken) {
      onSubmit(formData);
    } else {
      alert('Please complete the hCaptcha.');
    }
  };

  const handleVerificationSuccess = React.useCallback((token: string) => {
    setFormData(prevData => ({
      ...prevData,
      captchaToken: token,
    }));
  }, []);

  return (
    <form className="post-form" onSubmit={handleSubmit}>
      <h2 className="post-form-title">Share Your Climate Story</h2>
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
      
      {/* Tag selector (mandatory) */}
      <div className="form-group">
        <label htmlFor="tag">Tag (Required): </label>
        <select
          id="tag"
          name="tag"
          value={formData.tag}
          onChange={handleChange}
          required
        >
          <option value="-">-</option>
          <option value="Positive">Positive</option>
          <option value="Neutral">Neutral</option>
          <option value="Negative">Negative</option>
        </select>
      </div>

      {/* Optional user tags */}
      <div className="form-group">
        <label htmlFor="optionalTags">Additional Tags (Optional):</label>
        <input
          type="text"
          id="optionalTags"
          name="optionalTags"
          placeholder="Enter optional tags (comma separated)"
          value={formData.optionalTags}
          onChange={handleChange}
        />
      </div>

      {isActive && (
        <HCaptcha
          ref={captchaRef}
          sitekey={CAPTCHA_SITE_KEY}
          onVerify={handleVerificationSuccess}
          onError={(err) => console.warn('hCaptcha Error:', err)}
          onClose={() => setIsActive(false)}
        />
      )}

      <div className="form-buttons">
        <button type="submit">Submit</button>
        <button type="button" onClick={handleModalClose}>Cancel</button>
      </div>
    </form>
  );
};

export default PostForm;