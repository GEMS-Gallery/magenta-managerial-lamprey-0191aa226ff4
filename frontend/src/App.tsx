import React, { useState, useEffect } from 'react';
import { backend } from 'declarations/backend';
import { GridOn, Landscape, People, Restaurant, SportsBasketball, ViewList, ViewModule, ViewQuilt, Delete } from '@mui/icons-material';
import { useAuth } from './AuthContext';
import { Principal } from '@dfinity/principal';

interface Photo {
  id: bigint;
  title: string;
  category: string;
  imageUrl: string;
  creator: Principal;
  createdAt: bigint;
  likes: bigint;
  likedBy: Principal[];
  comments: Comment[];
}

interface Comment {
  author: Principal;
  content: string;
  createdAt: bigint;
}

const App: React.FC = () => {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'grid' | 'tile'>('grid');
  const [profilePictureModalOpen, setProfilePictureModalOpen] = useState(false);
  const [profilePicture, setProfilePicture] = useState<string | null>(null);
  const { isAuthenticated, login, logout, principal } = useAuth();

  useEffect(() => {
    fetchPhotos();
    if (isAuthenticated) {
      checkProfilePicture();
    }
  }, [selectedCategory, isAuthenticated]);

  useEffect(() => {
    const savedViewMode = localStorage.getItem('viewMode');
    if (savedViewMode && (savedViewMode === 'list' || savedViewMode === 'grid' || savedViewMode === 'tile')) {
      setViewMode(savedViewMode);
    }
  }, []);

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

  const checkProfilePicture = async () => {
    try {
      const profilePic = await backend.getProfilePicture();
      if (profilePic === null) {
        setProfilePictureModalOpen(true);
      } else {
        setProfilePicture(profilePic);
      }
    } catch (error) {
      console.error('Error checking profile picture:', error);
    }
  };

  const handleSetProfilePicture = async (imageUrl: string) => {
    try {
      const result = await backend.setProfilePicture(imageUrl);
      if ('ok' in result) {
        setProfilePicture(imageUrl);
        setProfilePictureModalOpen(false);
      } else {
        console.error('Error setting profile picture:', result.err);
      }
    } catch (error) {
      console.error('Error setting profile picture:', error);
    }
  };

  const handleLike = async (id: bigint) => {
    if (!isAuthenticated) {
      alert('Please login to like a photo');
      return;
    }
    try {
      const result = await backend.likePhoto(id);
      if ('ok' in result) {
        fetchPhotos();
      } else {
        console.error('Error liking photo:', result.err);
      }
    } catch (error) {
      console.error('Error liking photo:', error);
    }
  };

  const handleAddComment = async (id: bigint, content: string) => {
    if (!isAuthenticated) {
      alert('Please login to add a comment');
      return;
    }
    try {
      await backend.addComment(id, content);
      fetchPhotos();
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  const handleAddPhoto = async (title: string, category: string, imageUrl: string) => {
    if (!isAuthenticated) {
      alert('Please login to add a photo');
      return;
    }
    try {
      await backend.addPhoto(title, category, imageUrl);
      fetchPhotos();
      setModalIsOpen(false);
    } catch (error) {
      console.error('Error adding photo:', error);
    }
  };

  const handleRemovePhoto = async (id: bigint) => {
    if (!isAuthenticated) {
      alert('Please login to remove a photo');
      return;
    }
    if (confirm('Are you sure you want to remove this photo?')) {
      try {
        const result = await backend.removePhoto(id);
        if ('ok' in result) {
          fetchPhotos();
        } else {
          console.error('Error removing photo:', result.err);
        }
      } catch (error) {
        console.error('Error removing photo:', error);
      }
    }
  };

  const toggleViewMode = (mode: 'list' | 'grid' | 'tile') => {
    setViewMode(mode);
    localStorage.setItem('viewMode', mode);
  };

  const categoryIcons = {
    All: <GridOn />,
    Travel: <Landscape />,
    People: <People />,
    Food: <Restaurant />,
    Sports: <SportsBasketball />,
  };

  const formatPrincipal = (principal: Principal) => {
    const principalString = principal.toString();
    return `${principalString.slice(0, 5)}...${principalString.slice(-5)}`;
  };

  const hasUserLikedPhoto = (photo: Photo) => {
    return principal && photo.likedBy.some(p => p.toString() === principal.toString());
  };

  return (
    <div className="App">
      <header className="header">
        <div className="logo">
          <div className="logo-icon"></div>
          Pixel
        </div>
        <div className="view-toggle">
          <button
            className={`view-toggle-btn ${viewMode === 'list' ? 'active' : ''}`}
            onClick={() => toggleViewMode('list')}
          >
            <ViewList />
          </button>
          <button
            className={`view-toggle-btn ${viewMode === 'grid' ? 'active' : ''}`}
            onClick={() => toggleViewMode('grid')}
          >
            <ViewModule />
          </button>
          <button
            className={`view-toggle-btn ${viewMode === 'tile' ? 'active' : ''}`}
            onClick={() => toggleViewMode('tile')}
          >
            <ViewQuilt />
          </button>
        </div>
        <button className="auth-button" onClick={isAuthenticated ? logout : login}>
          {isAuthenticated ? 'Logout' : 'Login'}
        </button>
      </header>
      <div className="container">
        <nav className="left-menu">
          {Object.entries(categoryIcons).map(([category, icon]) => (
            <div
              key={category}
              className={`menu-item ${selectedCategory === category ? 'selected' : ''}`}
              onClick={() => setSelectedCategory(category)}
            >
              {icon}
              <span style={{ marginLeft: '8px' }}>{category}</span>
            </div>
          ))}
        </nav>
        <div className={`feed feed-${viewMode}`}>
          {photos.length === 0 ? (
            <div className="empty-state">No photos available. Be the first to add one!</div>
          ) : (
            photos.map((photo) => (
              <div key={photo.id.toString()} className={`post post-${viewMode}`}>
                <div className="post-header">
                  <img src={profilePicture || "https://via.placeholder.com/28"} alt="User Profile Picture" />
                  <span className="username">{formatPrincipal(photo.creator)}</span>
                  <span className="category-tag">{photo.category}</span>
                  {isAuthenticated && principal && photo.creator.toString() === principal.toString() && (
                    <Delete 
                      className="delete-icon" 
                      onClick={() => handleRemovePhoto(photo.id)} 
                      titleAccess="Delete post"
                    />
                  )}
                </div>
                <div className="post-image">
                  <img src={photo.imageUrl} alt={photo.title} />
                </div>
                <div className="post-actions">
                  <button 
                    className="action-btn like-btn" 
                    onClick={() => handleLike(photo.id)}
                    disabled={!isAuthenticated || hasUserLikedPhoto(photo)}
                  >
                    <svg 
                      className={`action-icon ${hasUserLikedPhoto(photo) ? 'liked' : ''}`} 
                      viewBox="0 0 24 24" 
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                    </svg>
                  </button>
                  <span className="post-likes">{photo.likes.toString()} likes</span>
                </div>
                <div className="post-caption">
                  <strong>{formatPrincipal(photo.creator)}</strong> {photo.title}
                </div>
                <div className="comments">
                  {photo.comments.map((comment, index) => (
                    <div key={index} className="comment">
                      <strong>{formatPrincipal(comment.author)}</strong> {comment.content}
                    </div>
                  ))}
                </div>
                {isAuthenticated && (
                  <form className="comment-form" onSubmit={(e) => {
                    e.preventDefault();
                    const input = e.currentTarget.elements.namedItem('comment') as HTMLInputElement;
                    handleAddComment(photo.id, input.value);
                    input.value = '';
                  }}>
                    <input type="text" name="comment" className="comment-input" placeholder="Add a comment..." />
                    <button type="submit" className="comment-submit">Post</button>
                  </form>
                )}
              </div>
            ))
          )}
        </div>
      </div>
      {isAuthenticated && (
        <button className="post-btn" onClick={() => setModalIsOpen(true)}>+</button>
      )}
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
              <input type="text" id="photoUrl" name="photoUrl" placeholder="Enter photo URL (1080x1080px recommended)" required />
              <button type="submit">Upload</button>
            </form>
          </div>
        </div>
      )}
      {profilePictureModalOpen && (
        <div className="profile-picture-modal">
          <div className="profile-picture-form">
            <h2>Set Profile Picture</h2>
            <input 
              type="text" 
              placeholder="Enter profile picture URL"
              onChange={(e) => setProfilePicture(e.target.value)}
            />
            <button onClick={() => handleSetProfilePicture(profilePicture || '')}>Set Profile Picture</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
