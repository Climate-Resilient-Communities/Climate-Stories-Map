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
import InformationPopup, { ContentSection } from './components/InformationPopup';
import TermsOfUsePopUp from './components/TermsOfUsePopUp';
import PrivacyPolicyPopup from './components/PrivacyPolicyPopup';

const App: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isWelcomePopupOpen, setIsWelcomePopupOpen] = useState(false);
  const [isInfoPopupOpen, setIsInfoPopupOpen] = useState(false);
  const [isTermsOfUsePopupOpen, setIsTermsOfUsePopupOpen] = useState(false);
  const [isPrivacyPolicyPopupOpen, setIsPrivacyPolicyPopupOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<ContentSection>('about');
  const [posts, setPosts] = useState<Post[]>([]);
  const [isTaskbarVisible, setIsTaskbarVisible] = useState(true);

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
  
  // Handlers for the InformationPopup
  const closeInfoPopup = () => setIsInfoPopupOpen(false);

  const openStorySection = () => {
    setActiveSection('story');
    setIsInfoPopupOpen(true);
  };

  const openAboutSection = () => {
    setActiveSection('about');
    setIsInfoPopupOpen(true);
  };
  
  const openContactSection = () => {
    setActiveSection('contact');
    setIsInfoPopupOpen(true);
  };
  
  const openFaqSection = () => {
    setActiveSection('faq');
    setIsInfoPopupOpen(true);
  };

  const openModerationSection = () => {
    setActiveSection('moderation');
    setIsInfoPopupOpen(true);
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

  return (
    <ThemeProvider>
      <NotificationProvider>
        <Router>
          <div className="app-container">
            {isWelcomePopupOpen && (
              <div className="welcome-overlay" />
            )}
            <Taskbar 
              onStoryClick={openStorySection}
              onAboutClick={openAboutSection}
              onContactClick={openContactSection}
              onFaqClick={openFaqSection}
              onModClick={openModerationSection}
              onPrivacyPolicyClick={openPrivacyPolicyPopup}
              onTermsOfUseClick={openTermsOfUsePopup}
              onVisibilityChange={setIsTaskbarVisible}
            />
            <main className="app-main">
              <WelcomePopup 
                isOpen={isWelcomePopupOpen}
                onClose={() => setIsWelcomePopupOpen(false)}
              />
              <InformationPopup
                isOpen={isInfoPopupOpen}
                onClose={closeInfoPopup}
                activeSection={activeSection}
                openTermsOfUse={openTermsOfUsePopup}
                openPrivacyPolicy={openPrivacyPolicyPopup}
              />
              <TermsOfUsePopUp
                isOpen={isTermsOfUsePopupOpen}
                onClose={closeTermsOfUsePopup}
              />
              <PrivacyPolicyPopup
                isOpen={isPrivacyPolicyPopupOpen}
                onClose={closePrivacyPolicyPopup}
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
                <Route path="/" element={<MapWithForm 
                  posts={posts} 
                  onPostSubmit={handlePostSubmit}
                  taskbarVisible={isTaskbarVisible}
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