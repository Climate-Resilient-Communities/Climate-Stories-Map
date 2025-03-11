// App.tsx
import { useCallback, useEffect, useState } from 'react';
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

const App: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isWelcomePopupOpen, setIsWelcomePopupOpen] = useState(false);
  const [isInfoPopupOpen, setIsInfoPopupOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<ContentSection>('about');
  const [posts, setPosts] = useState<Post[]>([]);

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
    
    // Check if this is the first visit
    //const hasVisited = localStorage.getItem('hasVisited');
    //if (!hasVisited) {
      setIsWelcomePopupOpen(true);
      //localStorage.setItem('hasVisited', 'true');
    //}
  }, [loadPosts]);
    
  const handlePostSubmit = async (formData: any) => {
    try {
      await createPost(formData);
      loadPosts(); // Reload posts after a new post is created
    } catch (error) {
      console.error('Error creating post:', error);
    }
  };
  
  // Handlers for the InformationPopup
  const closeInfoPopup = () => setIsInfoPopupOpen(false);
  
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
  
  const handleSectionChange = (section: ContentSection) => {
    setActiveSection(section);
  };

  return (
    <Router>
      <div className="app-container">
          {isWelcomePopupOpen && (
            <div className="welcome-overlay" />
          )}
          <Taskbar 
            onAboutClick={openAboutSection}
            onContactClick={openContactSection}
            onFaqClick={openFaqSection}
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
            onSectionChange={handleSectionChange}
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
            <Route path="/" element={<MapWithForm posts={posts} onPostSubmit={handlePostSubmit}/>} />
          </Routes>
        </main>
      </div>
    </Router>
  );
};

export default App;