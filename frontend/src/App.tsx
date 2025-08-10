// App.tsx
import { useCallback, useEffect, useState } from 'react';
import { NotificationProvider } from './components/common/NotificationContext';
import { ThemeProvider } from './themes/ThemeContext';

import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import './App.css';
import './components/Overlay.css';
import MapWithForm from './components/MapWithForm';
import Taskbar from './components/Taskbar';
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

const App: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isWelcomePopupOpen, setIsWelcomePopupOpen] = useState(false);
  const [isTermsOfUsePopupOpen, setIsTermsOfUsePopupOpen] = useState(false);
  const [isPrivacyPolicyPopupOpen, setIsPrivacyPolicyPopupOpen] = useState(false);
  const [posts, setPosts] = useState<Post[]>([]);
  const [isTaskbarVisible, setIsTaskbarVisible] = useState(true);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isFilterVisible, setIsFilterVisible] = useState(false);
  const [isCreatePostMode, setIsCreatePostMode] = useState(false);
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
    <ThemeProvider>
      <NotificationProvider>
        <Router>
          <div className="app-container">
            {isWelcomePopupOpen && (
              <div className="welcome-overlay" />
            )}
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
                      taskbarVisible={isTaskbarVisible}
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
                  onTagSelect={setSelectedTags}
                  isFilterVisible={isFilterVisible}
                  onToggleFilter={handleToggleFilter}
                  createPostTrigger={isCreatePostMode}
                  onCreatePostTriggered={resetCreatePostMode}
                />} />
              </Routes>
            </main>
          </div>
        </Router>
      </NotificationProvider>
    </ThemeProvider>
  );
};

export default App;