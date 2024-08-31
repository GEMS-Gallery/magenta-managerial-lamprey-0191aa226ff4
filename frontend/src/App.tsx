import React, { useState, useEffect } from 'react';
import { backend } from 'declarations/backend';
import { GridOn, Landscape, People, Restaurant, SportsBasketball } from '@mui/icons-material';

interface Photo {
  id: bigint;
  title: string;
  category: string;
  imageUrl: string;
  creator: string;
  createdAt: bigint;
  likes: bigint;
  comments: Comment[];
}

interface Comment {
  author: string;
  content: string;
  createdAt: bigint;
}

const App: React.FC = () => {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [modalIsOpen, setModalIsOpen] = useState(false);

  useEffect(() => {
    fetchPhotos();
  }, [selectedCategory]);

  const fetchPhotos = async () => {
    try {
      let result;
      if (selectedCategory === 'All') {
        result = await backend.getPhotos();
      } else {
        result = await backend.getPhotosByCategory(selectedCategory);
      }
      setPhotos(result);
    } catch (error) {
      console.error('Error fetching photos:', error);
    }
  };

  const handleLike = async (id: bigint) => {
    try {
      await backend.likePhoto(id);
      fetchPhotos();
    } catch (error) {
      console.error('Error liking photo:', error);
    }
  };

  const handleAddComment = async (id: bigint, content: string) => {
    try {
      await backend.addComment(id, 'Anonymous', content);
      fetchPhotos();
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  const handleAddPhoto = async (title: string, category: string, imageUrl: string) => {
    try {
      await backend.addPhoto(title, category, imageUrl, 'Anonymous');
      fetchPhotos();
      setModalIsOpen(false);
    } catch (error) {
      console.error('Error adding photo:', error);
    }
  };

  const categoryIcons = {
    All: <GridOn />,
    Travel: <Landscape />,
    People: <People />,
    Food: <Restaurant />,
    Sports: <SportsBasketball />,
  };

  return (
    <div className="App">
      <header className="header">
        <div className="logo">
          <div className="logo-icon"></div>
          Pixel
        </div>
      </header>
      <div className="container">
        <nav className="left-menu">
          {Object.entries(categoryIcons).map(([category, icon]) => (
            <div
              key={category}
              className="menu-item"
              onClick={() => setSelectedCategory(category)}
            >
              {icon}
              <span style={{ marginLeft: '8px' }}>{category}</span>
            </div>
          ))}
        </nav>
        <div className="feed">
          {photos.map((photo) => (
            <div key={photo.id.toString()} className="post">
              <div className="post-header">
                <img src="/api/placeholder/32/32" alt="User Avatar" />
                <span className="username">{photo.creator}</span>
                <span className="category-tag">{photo.category}</span>
              </div>
              <div className="post-image">
                <img src={photo.imageUrl} alt={photo.title} />
              </div>
              <div className="post-actions">
                <button className="action-btn like-btn" onClick={() => handleLike(photo.id)}>
                  <svg className="action-icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" fill="none" stroke="#000" strokeWidth="2"/>
                  </svg>
                </button>
                <span className="post-likes">{photo.likes.toString()} likes</span>
              </div>
              <div className="post-caption">
                <strong>{photo.creator}</strong> {photo.title}
              </div>
              <div className="comments">
                {photo.comments.map((comment, index) => (
                  <div key={index} className="comment">
                    <strong>{comment.author}</strong> {comment.content}
                  </div>
                ))}
              </div>
              <form className="comment-form" onSubmit={(e) => {
                e.preventDefault();
                const input = e.currentTarget.elements.namedItem('comment') as HTMLInputElement;
                handleAddComment(photo.id, input.value);
                input.value = '';
              }}>
                <input type="text" name="comment" className="comment-input" placeholder="Add a comment..." />
                <button type="submit" className="comment-submit">Post</button>
              </form>
            </div>
          ))}
        </div>
      </div>
      <button className="post-btn" onClick={() => setModalIsOpen(true)}>+</button>
      {modalIsOpen && (
        <div className="modal">
          <div className="modal-content">
            <span className="close" onClick={() => setModalIsOpen(false)}>&times;</span>
            <h2>Upload a Photo</h2>
            <form className="upload-form" onSubmit={(e) => {
              e.preventDefault();
              const title = (e.currentTarget.elements.namedItem('photoTitle') as HTMLInputElement).value;
              const category = (e.currentTarget.elements.namedItem('photoCategory') as HTMLSelectElement).value;
              const imageUrl = (e.currentTarget.elements.namedItem('photoUrl') as HTMLInputElement).value;
              handleAddPhoto(title, category, imageUrl);
            }}>
              <input type="text" id="photoTitle" name="photoTitle" placeholder="Enter photo title" required />
              <select id="photoCategory" name="photoCategory" required>
                <option value="">Select a category</option>
                <option value="Travel">Travel</option>
                <option value="People">People</option>
                <option value="Food">Food</option>
                <option value="Sports">Sports</option>
              </select>
              <input type="text" id="photoUrl" name="photoUrl" placeholder="Enter photo URL" required />
              <button type="submit">Upload</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
