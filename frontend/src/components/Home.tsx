import { Post } from "./posts/types";
import Modal from "./common/Modal";
import PostForm from "./posts/PostForm";
import PostList from "./posts/PostList";

interface HomeProps {
    posts: Post[];
    isModalOpen: boolean;
    setIsModalOpen: (isOpen: boolean) => void;
  onPostSubmit: (formData: any) => void;
  }
  
  const Home: React.FC<HomeProps> = ({ posts, isModalOpen, setIsModalOpen, onPostSubmit }) => {
  
    return (
      <div>
        <div className="post-actions">
          <h2>Posts</h2>
          <button className="create-post-button" onClick={() => setIsModalOpen(true)}>
            Create New Post
          </button>
          <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
            <PostForm onClose={() => setIsModalOpen(false)} />
          </Modal>
        </div>
        <PostList posts={posts} />
      </div>
    );
  };

  export default Home;