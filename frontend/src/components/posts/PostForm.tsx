import React, { useState } from 'react';
import { MAIN_TAGS, TOPIC_TAGS } from '../../utils/tag-constants';
import HCaptcha from '@hcaptcha/react-hcaptcha';
import { PostFormData } from './types';
import './PostForm.css';
import { useNotification } from '../common/NotificationContext';
import { useTheme } from '../../themes/ThemeContext';
import PrivacyPolicyPopup from '../PrivacyPolicyPopup';
import TermsOfUsePopUp from '../TermsOfUsePopUp';
import ImageModal from '../common/ImageModal';
import { STORY_PROMPTS } from '../../utils/story-prompts';
import { trackSubmission } from '../../services/submissionTracking';

interface PostFormProps {
  onClose: () => void;
  initialCoordinates?: [number, number];
  onSubmitted?: (message: string) => void;
}

const CAPTCHA_SITE_KEY = import.meta.env.VITE_CAPTCHA_SITE_KEY || "10000000-ffff-ffff-ffff-000000000001";

const MOBILE_QUERY = '(max-width: 768px)';

// Mobile wizard steps: 0 prompt (optional), 1 title, 2 story, 3 photo (optional), 4 emotion, 5 topic, 6 review, 7 agree + submit
const LAST_STEP = 7;
const STEP_HEADINGS = [
  'Choose a story prompt',
  'Write a title',
  'Write your story',
  'Add a photo',
  'How does it feel?',
  'Choose a topic',
  'Review your story',
  'Agree and submit',
];
const OPTIONAL_STEPS = [0, 3];

const CAPTCHA_GRACE_TOKEN_KEY = 'captchaGraceToken';
const CAPTCHA_GRACE_EXPIRES_AT_KEY = 'captchaGraceExpiresAt';

function getStoredCaptchaGraceExpiresAtMs(): number | null {
  try {
    const expiresAtRaw = localStorage.getItem(CAPTCHA_GRACE_EXPIRES_AT_KEY);
    const expiresAt = expiresAtRaw ? Number(expiresAtRaw) : 0;
    if (!expiresAt || Number.isNaN(expiresAt)) return null;
    return expiresAt;
  } catch {
    return null;
  }
}

function getStoredCaptchaGraceToken(): string | null {
  try {
    const token = localStorage.getItem(CAPTCHA_GRACE_TOKEN_KEY);
    const expiresAtRaw = localStorage.getItem(CAPTCHA_GRACE_EXPIRES_AT_KEY);
    const expiresAt = expiresAtRaw ? Number(expiresAtRaw) : 0;
    if (!token || !expiresAt) return null;
    if (Number.isNaN(expiresAt) || Date.now() >= expiresAt) return null;
    return token;
  } catch {
    return null;
  }
}

function storeCaptchaGraceToken(token: string, expiresInSeconds: number) {
  try {
    const expiresAtMs = Date.now() + expiresInSeconds * 1000;
    localStorage.setItem(CAPTCHA_GRACE_TOKEN_KEY, token);
    localStorage.setItem(CAPTCHA_GRACE_EXPIRES_AT_KEY, String(expiresAtMs));
    return expiresAtMs;
  } catch {
    // Ignore storage failures (private mode, etc.)
    return null;
  }
}

function clearCaptchaGraceToken() {
  try {
    localStorage.removeItem(CAPTCHA_GRACE_TOKEN_KEY);
    localStorage.removeItem(CAPTCHA_GRACE_EXPIRES_AT_KEY);
  } catch {
    // Ignore
  }
}

const PostForm: React.FC<PostFormProps> = ({ onClose, initialCoordinates = [0, 0], onSubmitted }) => {
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
  const [isMobile, setIsMobile] = useState<boolean>(() => window.matchMedia(MOBILE_QUERY).matches);
  const [step, setStep] = useState(0);
  const [hasCaptchaGrace, setHasCaptchaGrace] = useState<boolean>(() => !!getStoredCaptchaGraceToken());
  const [captchaGraceExpiresAtMs, setCaptchaGraceExpiresAtMs] = useState<number | null>(() => getStoredCaptchaGraceExpiresAtMs());

  const hasValidCaptchaGrace = !!getStoredCaptchaGraceToken();

  React.useEffect(() => {
    const mql = window.matchMedia(MOBILE_QUERY);
    const onChange = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mql.addEventListener('change', onChange);
    return () => mql.removeEventListener('change', onChange);
  }, []);

  React.useEffect(() => {
    if (!captchaGraceExpiresAtMs) return;

    const msUntilExpiry = captchaGraceExpiresAtMs - Date.now();
    if (msUntilExpiry <= 0) {
      clearCaptchaGraceToken();
      setHasCaptchaGrace(false);
      setCaptchaGraceExpiresAtMs(null);
      setFormData(prevData => ({
        ...prevData,
        captchaToken: '',
      }));
      captchaRef.current?.resetCaptcha();
      return;
    }

    const timeoutId = window.setTimeout(() => {
      clearCaptchaGraceToken();
      setHasCaptchaGrace(false);
      setCaptchaGraceExpiresAtMs(null);
      setFormData(prevData => ({
        ...prevData,
        captchaToken: '',
      }));
      captchaRef.current?.resetCaptcha();
    }, msUntilExpiry + 50);

    return () => window.clearTimeout(timeoutId);
  }, [captchaGraceExpiresAtMs]);

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

  React.useEffect(() => {
    if (hasCaptchaGrace && !hasValidCaptchaGrace) {
      setHasCaptchaGrace(false);
    }
  }, [hasCaptchaGrace, hasValidCaptchaGrace]);
  
  // Updated formData to include mandatory Tag
  const [formData, setFormData] = useState<PostFormData>({
    title: '',
    content: { description: '' },
    location: { type: 'Point', coordinates: initialCoordinates },
    tag: '-', // Default to "-", but must be set to a valid Emotion Tag on submit
    optionalTags: [],
    storyPrompt: undefined,
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
          tag: value as PostFormData['tag'],
        }));
        break;
      case 'topicTag':
        setFormData(prevData => ({
          ...prevData,
          optionalTags: value === '-' ? [] : [value],
        }));
        break;
      case 'storyPrompt':
        setFormData(prevData => ({
          ...prevData,
          storyPrompt: value === '-' ? undefined : value,
        }));
        break;
      default:
        setFormData(prevData => ({ ...prevData, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isMobile && step < LAST_STEP) {
      if (isStepValid(step)) setStep(step + 1);
      return;
    }
    if (!isAgreedToAll) {
      showNotification('Please agree to the Privacy Policy and Terms of Use before submitting.', true);
      return;
    }
    if (formData.tag === '-') {
      showNotification('Please select an emotion tag.', true);
      return;
    }
    if (!formData.optionalTags || formData.optionalTags.length === 0) {
      showNotification('Please select a topic tag.', true);
      return;
    }
    
    const graceToken = getStoredCaptchaGraceToken();
    const canSkipCaptcha = !!graceToken;

    if (formData.captchaToken || canSkipCaptcha) {
      try {
        const payload: PostFormData = {
          ...formData,
          // If we have a grace token, do not send a captchaToken.
          // Otherwise a previously-solved captcha token could be reused and effectively
          // keep extending the grace window.
          captchaToken: canSkipCaptcha ? '' : formData.captchaToken,
          captchaGraceToken: canSkipCaptcha ? graceToken ?? undefined : undefined,
        };

        const submitData = new FormData();
        submitData.append('postData', JSON.stringify(payload));
        if (selectedImage) {
          submitData.append('image', selectedImage);
        }
        
        const response = await fetch('/api/posts/create', {
          method: 'POST',
          body: submitData,
        });
        
        if (response.ok) {
          let responseJson: any = null;
          try {
            responseJson = await response.json();
          } catch {
            // Response might be empty; ignore.
          }

          if (responseJson?.captchaGraceToken && typeof responseJson?.captchaGraceExpiresInSeconds === 'number') {
            const expiresAtMs = storeCaptchaGraceToken(responseJson.captchaGraceToken, responseJson.captchaGraceExpiresInSeconds);
            setHasCaptchaGrace(true);
            if (expiresAtMs) setCaptchaGraceExpiresAtMs(expiresAtMs);
          }

          // Always clear any old captcha token after a successful submit.
          // This prevents an old captcha token from "bridging" an expired grace period.
          setFormData(prevData => ({
            ...prevData,
            captchaToken: '',
          }));
          captchaRef.current?.resetCaptcha();

          const postId = typeof responseJson?.post_id === 'string' ? responseJson.post_id : null;
          const accessToken = typeof responseJson?.submission_access_token === 'string'
            ? responseJson.submission_access_token
            : null;
          let successMessage = 'Your story was submitted, but this browser could not save a private status tracker.';
          if (postId && accessToken) {
            try {
              trackSubmission(postId, accessToken);
              successMessage = 'Your story is waiting for moderator review. You can check its status later from My submissions on this device.';
            } catch (error) {
              console.error('Could not save the private submission tracker:', error);
              successMessage = `Your story was submitted, but this browser could not save its private tracker. Keep this reference for moderators: ${postId}`;
            }
          } else {
            console.error('Submission response did not include the private tracking credentials.');
          }

          // Clear any previous captcha token so it can't be reused across posts.
          setFormData(prevData => ({
            ...prevData,
            captchaToken: '',
          }));
          captchaRef.current?.resetCaptcha();

          if (onSubmitted) {
            onSubmitted(successMessage);
          } else {
            showNotification(successMessage);
            setTimeout(() => {
              onClose();
            }, 100);
          }
          return;
        } else {
          let responseJson: any = null;
          try {
            responseJson = await response.json();
          } catch {
            // ignore
          }

          // If grace token was rejected/expired, fall back to hCaptcha (keep form data).
          if (canSkipCaptcha && (responseJson?.errorCode === 'captcha_grace_expired' || responseJson?.errorCode === 'captcha_required')) {
            clearCaptchaGraceToken();
            setHasCaptchaGrace(false);
            setCaptchaGraceExpiresAtMs(null);
          }

          if (responseJson?.errorCode === 'captcha_grace_expired') {
            showNotification('Your hCaptcha grace period expired. Please complete the hCaptcha to submit.', true);
            return;
          }

          throw new Error(responseJson?.error || responseJson?.message || 'Failed to submit post');
        }
      } catch (error) {
        console.error('Error submitting post:', error);
        const message = error instanceof Error ? error.message : 'There was an error submitting your post. Please try again.';
        showNotification(message, true);
        return;
      }
    } else {
      showNotification('Please complete the hCaptcha.', true);
    }
  };

  const handleVerificationSuccess = React.useCallback((token: string) => {
    // Validate token format
    if (typeof token === 'string' && token.length > 0) {
      setFormData(prevData => ({
        ...prevData,
        captchaToken: token,
      }));
    }
  }, []);

  const isFormValid = React.useCallback(() => {
    return formData.title.trim() !== '' &&
           formData.content.description.trim() !== '' &&
           formData.tag !== '-' &&
           !!formData.optionalTags?.length &&
           isAgreedToAll &&
           (formData.captchaToken !== '' || !!getStoredCaptchaGraceToken());
  }, [formData, isAgreedToAll]);

  const formValid = isFormValid();

  const isStepValid = (s: number) => {
    switch (s) {
      case 0: return !!formData.storyPrompt;
      case 3: return !!selectedImage;
      case 1: return formData.title.trim() !== '';
      case 2: return formData.content.description.trim() !== '';
      case 4: return formData.tag !== '-';
      case 5: return !!formData.optionalTags?.length;
      default: return true;
    }
  };

  // On desktop every section shows; on mobile only the current step does.
  const show = (s: number) => !isMobile || step === s;
  const isLastStep = !isMobile || step === LAST_STEP;

  const titlePlaceholder = 'Title *';
  const descriptionPlaceholder = formData.storyPrompt ? `Prompt: ${formData.storyPrompt} *` : 'Description *';

  const renderChoices = (
    options: readonly string[],
    selected: string | undefined,
    onPick: (value: string) => void,
  ) => (
    <div className="wizard-choices" role="radiogroup">
      {options.map((option) => (
        <button
          key={option}
          type="button"
          role="radio"
          aria-checked={selected === option}
          className={`wizard-choice${selected === option ? ' selected' : ''}`}
          onClick={() => onPick(option)}
        >
          {option}
        </button>
      ))}
    </div>
  );

  const renderForm = () => (
    <form className={`post-form${isMobile ? ' post-form-wizard' : ''}`} onSubmit={handleSubmit}>
      <div 
        className="post-form-left"
        style={{ 
          backgroundImage: `url("/themes/${theme}/Share your climate story.png")`,
          backgroundColor: 'var(--post-form-modal)'
        }}
      ></div>
      <div className="post-form-right">
        <h2 className="post-form-title">Share your Climate Story</h2>

        {isMobile && (
          <div className="wizard-progress" aria-live="polite">
            <div className="wizard-progress-text">
              Step {step + 1} of {LAST_STEP + 1}
              {OPTIONAL_STEPS.includes(step) ? ' (optional)' : ''}
            </div>
            <div className="wizard-progress-bar">
              <div
                className="wizard-progress-fill"
                style={{ width: `${((step + 1) / (LAST_STEP + 1)) * 100}%` }}
              />
            </div>
            <h3 className="wizard-step-heading">{STEP_HEADINGS[step]}</h3>
          </div>
        )}

        <div className="wizard-body">
        {show(0) && isMobile && renderChoices(
          STORY_PROMPTS,
          formData.storyPrompt,
          (prompt) => setFormData(prev => ({ ...prev, storyPrompt: prompt })),
        )}
        {show(0) && !isMobile && (
        <div className="post-form-select">
          <select
            name="storyPrompt"
            value={formData.storyPrompt ?? '-'}
            onChange={handleChange}
          >
            <option value="-">Choose a story prompt (optional)</option>
            {STORY_PROMPTS.map((prompt) => (
              <option key={prompt} value={prompt}>
                {prompt}
              </option>
            ))}
          </select>
        </div>
        )}

        {show(1) && (
        <input
          type="text"
          name="title"
          placeholder={titlePlaceholder}
          value={formData.title}
          onChange={handleChange}
          required
        />
        )}
        
        {show(2) && (
        <>
        {isMobile && formData.storyPrompt && (
          <p className="wizard-prompt-hint">Prompt: {formData.storyPrompt}</p>
        )}
        <textarea
          name="description"
          placeholder={descriptionPlaceholder}
          value={formData.content.description}
          onChange={handleChange}
          required
        />
        </>
        )}
        
        {show(3) && (
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
        )}

        {show(4) && isMobile && renderChoices(
          MAIN_TAGS,
          formData.tag,
          (tag) => setFormData(prev => ({ ...prev, tag: tag as PostFormData['tag'] })),
        )}
        {show(4) && !isMobile && (
        <div className="post-form-select">
          <select name="tag" value={formData.tag} onChange={handleChange} required>
            <option value="-" disabled>
              Select an emotion *
            </option>
            {MAIN_TAGS.map((tag) => (
              <option key={tag} value={tag}>
                {tag}
              </option>
            ))}
          </select>
        </div>
        )}

        {show(5) && isMobile && renderChoices(
          TOPIC_TAGS,
          formData.optionalTags[0],
          (topic) => setFormData(prev => ({ ...prev, optionalTags: [topic] })),
        )}
        {show(5) && !isMobile && (
        <div className="post-form-select">
          <select
            name="topicTag"
            value={formData.optionalTags[0] ?? '-'}
            onChange={handleChange}
            required
          >
            <option value="-" disabled>
              Select a topic *
            </option>
            {TOPIC_TAGS.map((topic) => (
              <option key={topic} value={topic}>
                {topic}
              </option>
            ))}
          </select>
        </div>
        )}

        {show(6) && isMobile && (
          <div className="wizard-review">
            {formData.storyPrompt && (
              <div className="wizard-review-item">
                <div className="wizard-review-label">Prompt</div>
                <div>{formData.storyPrompt}</div>
              </div>
            )}
            <div className="wizard-review-item">
              <div className="wizard-review-label">Title</div>
              <div>{formData.title}</div>
            </div>
            <div className="wizard-review-item">
              <div className="wizard-review-label">Story</div>
              <div className="wizard-review-story">{formData.content.description}</div>
            </div>
            {imagePreview && (
              <div className="wizard-review-item">
                <div className="wizard-review-label">Photo</div>
                <img src={imagePreview} alt="Your selected photo" className="wizard-review-image" />
              </div>
            )}
            <div className="wizard-review-item">
              <div className="wizard-review-label">Feeling</div>
              <div>{formData.tag}</div>
            </div>
            <div className="wizard-review-item">
              <div className="wizard-review-label">Topic</div>
              <div>{formData.optionalTags[0]}</div>
            </div>
            <p className="wizard-review-hint">Need to change something? Use Back.</p>
          </div>
        )}

        {show(7) && (
        <div className="checkbox-container">
          <div className="checkbox-row">
            <label className="checkbox-label">
              <input 
                type="checkbox" 
                checked={isAgreedToAll} 
                onChange={handleAgreementCheckboxChange} 
              />
              <span>By clicking this, you agree to the following *:</span>
            </label>
          </div>
          <ul className="agreement-list">
            <li>I certify that I meet the age requirements (13+ or with parental/guardian consent if under 18)</li>
            <li>I have read and agreed to the <a href="#" onClick={openPrivacyPolicy}>Privacy Policy</a></li>
            <li>I have read and agreed to the <a href="#" onClick={openTermsOfUse}>Terms of Use</a></li>
          </ul>
        </div>
        )}
        </div>

        <div className="form-buttons">
          {isMobile && step > 0 ? (
            <button type="button" onClick={() => setStep(step - 1)}>Back</button>
          ) : (
            <button type="button" onClick={handleModalClose}>Cancel</button>
          )}
          {isMobile && OPTIONAL_STEPS.includes(step) && (
            <button
              type="button"
              onClick={() => {
                if (step === 0) {
                  setFormData(prev => ({ ...prev, storyPrompt: undefined }));
                }
                if (step === 3) {
                  setSelectedImage(null);
                  setImagePreview('');
                  if (fileInputRef.current) fileInputRef.current.value = '';
                }
                setStep(step + 1);
              }}
            >
              Skip
            </button>
          )}
          {isMobile && step < LAST_STEP && (
            <button
              type="button"
              className="wizard-next-btn"
              disabled={!isStepValid(step)}
              onClick={() => setStep(step + 1)}
            >
              Next
            </button>
          )}
          {isLastStep && (
          <>
          <div className="captcha-container">
            {!hasValidCaptchaGrace && isActive && (
              <HCaptcha
                ref={captchaRef}
                sitekey={CAPTCHA_SITE_KEY}
                onVerify={handleVerificationSuccess}
                onExpire={() => {
                  setFormData(prevData => ({
                    ...prevData,
                    captchaToken: '',
                  }));
                }}
                onError={(err) => {
                  const errorMsg = typeof err === 'string' ? err : 'Unknown error';
                  console.warn('hCaptcha Error:', errorMsg.replace(/[\r\n\t<>"'&]/g, ' '));
                }}
                onClose={() => {
                  // If a user cancels/closes the challenge, keep the widget visible.
                  // Resetting allows them to try again without reloading the form.
                  captchaRef.current?.resetCaptcha();

                  // Closing/canceling should NOT count as a successful CAPTCHA.
                  setFormData(prevData => ({
                    ...prevData,
                    captchaToken: '',
                  }));
                }}
              />
            )}
          </div>
          <span className="tooltip-wrapper" title={formValid ? '' : 'Fill up required fields *'}>
            <button type="submit" disabled={!formValid}>Add</button>
          </span>
          </>
          )}
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