import { useCallback, useState } from "react";
import { Post } from "./posts/types";
import Modal from "./common/Modal";
import PostForm from "./posts/PostForm";
import PostList from "./posts/PostList";
import SubmissionPopup from "./posts/SubmissionPopup";

interface HomeProps {
    posts: Post[];
    isModalOpen: boolean;
    setIsModalOpen: (isOpen: boolean) => void;
  onPostSubmit: (formData: any) => void;
  }
  
  const Home: React.FC<HomeProps> = ({ posts, isModalOpen, setIsModalOpen }) => {
    const [isSubmissionPopupOpen, setIsSubmissionPopupOpen] = useState(false);
    const [submissionMessage, setSubmissionMessage] = useState<string | undefined>(undefined);

    const handleSubmitted = useCallback((message: string) => {
      setIsModalOpen(false);
      setSubmissionMessage(message);
      setIsSubmissionPopupOpen(true);
    }, [setIsModalOpen]);
  
    return (
      <div>
        <div className="post-actions">
          <h2>Posts</h2>
          <button className="create-post-button" onClick={() => setIsModalOpen(true)}>
            Create New Post
          </button>
          <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
            <PostForm onClose={() => setIsModalOpen(false)} onSubmitted={handleSubmitted} />
          </Modal>
        </div>
        <PostList posts={posts} />

        <SubmissionPopup
          isOpen={isSubmissionPopupOpen}
          onClose={() => setIsSubmissionPopupOpen(false)}
          message={submissionMessage}
        />
      </div>
    );
  };

  export default Home;