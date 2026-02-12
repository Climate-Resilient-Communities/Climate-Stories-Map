// App.tsx
import { useCallback, useEffect, useState } from 'react';
import { NotificationProvider } from './components/common/NotificationContext';
import { ThemeProvider } from './themes/ThemeContext';

import { BrowserRouter as Router, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import './App.css';
import './components/Overlay.css';
import './components/MobileOrientationPrompt.css';
import MapWithForm from './components/MapWithForm';
import Taskbar from './components/Taskbar';
import DeveloperSettings from './components/DeveloperSettings';
import { createPost, fetchPosts } from './services/postService';
import { Post } from './components/posts/types';
import Home from './components/Home';
import WelcomePopup from './components/WelcomePopup';
import About from './components/pages/About';
import Faqs from './components/pages/Faqs';
import Moderation from './components/pages/Moderation';
import TermsOfUsePopUp from './components/TermsOfUsePopUp';
import PrivacyPolicyPopup from './components/PrivacyPolicyPopup';
import CreatePostInstructionsPopup from './components/CreatePostInstructionsPopup';
import { MobileOrientationManager } from './utils/mobileOrientationManager';

const AppContent: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isWelcomePopupOpen, setIsWelcomePopupOpen] = useState(false);
  const [isTermsOfUsePopupOpen, setIsTermsOfUsePopupOpen] = useState(false);
  const [isPrivacyPolicyPopupOpen, setIsPrivacyPolicyPopupOpen] = useState(false);
  const [posts, setPosts] = useState<Post[]>([]);
  const [isTaskbarVisible, setIsTaskbarVisible] = useState(true);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isFilterVisible, setIsFilterVisible] = useState(false);
  const [isCreatePostMode, setIsCreatePostMode] = useState(false);
  const isMapPage = location.pathname === '/';
  const isOtherPage = ['/about', '/faqs', '/moderation'].includes(location.pathname);
  const [isInstructionsPopupOpen, setIsInstructionsPopupOpen] = useState(false);

  const loadPosts = useCallback(async () => {
    try {
      const data = await fetchPosts();
      setPosts(data);
    } catch (error) {
      console.error('Error loading posts:', error);
    }
  }, []);

  useEffect(() => {
    loadPosts();
    setIsWelcomePopupOpen(true);
    
    // Initialize mobile orientation manager
    MobileOrientationManager.getInstance();
  }, [loadPosts]);
    
  const handlePostSubmit = async (formData: any): Promise<void> => {
    try {
      await createPost(formData);
      // Delay the posts reload to ensure smooth notification
      setTimeout(() => {
        loadPosts();
      }, 500);
    } catch (error) {
      console.error('Error creating post:', error);
      throw error; // Propagate error to form component
    }
  };
  


  // Handlers for Terms of Use and Privacy Policy popups
  const openTermsOfUsePopup = () => {
    setIsTermsOfUsePopupOpen(true);
  };

  const closeTermsOfUsePopup = () => {
    setIsTermsOfUsePopupOpen(false);
  };

  const openPrivacyPolicyPopup = () => {
    setIsPrivacyPolicyPopupOpen(true);
  };

  const closePrivacyPolicyPopup = () => {
    setIsPrivacyPolicyPopupOpen(false);
  };

  const handleCreatePost = () => {
    const dontShowInstructions = localStorage.getItem('dontShowCreatePostInstructions') === 'true';
    if (dontShowInstructions) {
      setIsCreatePostMode(true);
    } else {
      setIsInstructionsPopupOpen(true);
    }
  };

  const handleGoBackToMap = () => {
    navigate('/');
    setIsCreatePostMode(true);
  };

  const handleInstructionsNext = (dontShowAgain: boolean) => {
    if (dontShowAgain) {
      localStorage.setItem('dontShowCreatePostInstructions', 'true');
    }
    setIsInstructionsPopupOpen(false);
    setIsCreatePostMode(true);
  };

  const resetCreatePostMode = () => {
    setIsCreatePostMode(false);
  };

  const handleToggleFilter = () => {
    setIsFilterVisible(!isFilterVisible);
  };

  return (
    <div className="app-container">
            {isWelcomePopupOpen && (
              <div className="welcome-overlay" />
            )}
            <DeveloperSettings />
            <Taskbar 
              onPrivacyPolicyClick={openPrivacyPolicyPopup}
              onTermsOfUseClick={openTermsOfUsePopup}
              onVisibilityChange={setIsTaskbarVisible}
              onCreatePost={handleCreatePost}
              posts={posts}
              selectedTags={selectedTags}
              onTagSelect={setSelectedTags}
              isFilterVisible={isFilterVisible}
              onToggleFilter={handleToggleFilter}
              isCreatePostMode={isMapPage && isCreatePostMode}
              isOtherPage={isOtherPage}
              onGoBackToMap={handleGoBackToMap}
            />
            <main className="app-main">
              <WelcomePopup 
                isOpen={isWelcomePopupOpen}
                onClose={() => setIsWelcomePopupOpen(false)}
              />

              <TermsOfUsePopUp
                isOpen={isTermsOfUsePopupOpen}
                onClose={closeTermsOfUsePopup}
              />
              <PrivacyPolicyPopup
                isOpen={isPrivacyPolicyPopupOpen}
                onClose={closePrivacyPolicyPopup}
              />
              <CreatePostInstructionsPopup
                isOpen={isInstructionsPopupOpen}
                onClose={() => setIsInstructionsPopupOpen(false)}
                onNext={handleInstructionsNext}
              />
              <Routes>
                <Route
                  path="/posts"
                  element={
                    <Home
                      posts={posts}
                      isModalOpen={isModalOpen}
                      setIsModalOpen={setIsModalOpen}
                      onPostSubmit={handlePostSubmit}
                    />
                  }
                />
                <Route path="/about" element={<About taskbarVisible={isTaskbarVisible} />} />
                <Route path="/faqs" element={<Faqs taskbarVisible={isTaskbarVisible} />} />
                <Route path="/moderation" element={<Moderation taskbarVisible={isTaskbarVisible} />} />
                <Route path="/" element={<MapWithForm 
                  posts={posts} 
                  onPostSubmit={handlePostSubmit}
                  taskbarVisible={isTaskbarVisible}
                  selectedTags={selectedTags}
                  createPostTrigger={isCreatePostMode}
                  onCreatePostTriggered={resetCreatePostMode}
                />} />
              </Routes>
            </main>
          </div>
  );
};

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <NotificationProvider>
        <Router>
          <AppContent />
        </Router>
      </NotificationProvider>
    </ThemeProvider>
  );
};

export default App;