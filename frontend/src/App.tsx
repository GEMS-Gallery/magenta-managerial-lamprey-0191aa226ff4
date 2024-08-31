import React, { useState, useEffect } from 'react';
import { backend } from 'declarations/backend';
import { AppBar, Toolbar, Typography, Container, Grid, Card, CardHeader, CardMedia, CardContent, CardActions, Avatar, IconButton, CircularProgress } from '@mui/material';
import { Favorite, Comment, Add } from '@mui/icons-material';
import Modal from 'react-modal';

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
  const [loading, setLoading] = useState(true);
  const [modalIsOpen, setModalIsOpen] = useState(false);

  useEffect(() => {
    fetchPhotos();
  }, []);

  const fetchPhotos = async () => {
    try {
      const result = await backend.getPhotos();
      setPhotos(result);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching photos:', error);
      setLoading(false);
    }
  };

  const handleLike = async (id: bigint) => {
    try {
      await backend.likePhoto(id);
      fetchPhotos(); // Refresh photos after liking
    } catch (error) {
      console.error('Error liking photo:', error);
    }
  };

  const handleAddComment = async (id: bigint, content: string) => {
    try {
      await backend.addComment(id, 'Anonymous', content);
      fetchPhotos(); // Refresh photos after adding comment
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  const handleAddPhoto = async (title: string, category: string, imageUrl: string) => {
    try {
      await backend.addPhoto(title, category, imageUrl, 'Anonymous');
      fetchPhotos(); // Refresh photos after adding new photo
      setModalIsOpen(false);
    } catch (error) {
      console.error('Error adding photo:', error);
    }
  };

  return (
    <div className="App">
      <AppBar position="static">
        <Toolbar>
          <div className="logo-icon mr-2"></div>
          <Typography variant="h6">Pixel</Typography>
        </Toolbar>
      </AppBar>
      <Container maxWidth="md" className="mt-4">
        {loading ? (
          <CircularProgress />
        ) : (
          <Grid container spacing={4}>
            {photos.map((photo) => (
              <Grid item xs={12} sm={6} md={4} key={photo.id.toString()}>
                <Card>
                  <CardHeader
                    avatar={<Avatar>{photo.creator[0]}</Avatar>}
                    title={photo.title}
                    subheader={photo.category}
                  />
                  <CardMedia
                    component="img"
                    height="194"
                    image={photo.imageUrl}
                    alt={photo.title}
                  />
                  <CardContent>
                    <Typography variant="body2" color="text.secondary">
                      {photo.comments.length} comments
                    </Typography>
                  </CardContent>
                  <CardActions disableSpacing>
                    <IconButton aria-label="like" onClick={() => handleLike(photo.id)}>
                      <Favorite />
                    </IconButton>
                    <Typography>{photo.likes.toString()}</Typography>
                    <IconButton aria-label="comment">
                      <Comment />
                    </IconButton>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Container>
      <IconButton
        className="fixed bottom-4 right-4 bg-black text-white"
        onClick={() => setModalIsOpen(true)}
      >
        <Add />
      </IconButton>
      <Modal
        isOpen={modalIsOpen}
        onRequestClose={() => setModalIsOpen(false)}
        contentLabel="Add Photo"
        className="modal"
        overlayClassName="overlay"
      >
        <h2>Add Photo</h2>
        <form onSubmit={(e) => {
          e.preventDefault();
          const title = (e.target as any).title.value;
          const category = (e.target as any).category.value;
          const imageUrl = (e.target as any).imageUrl.value;
          handleAddPhoto(title, category, imageUrl);
        }}>
          <input name="title" type="text" placeholder="Title" required />
          <input name="category" type="text" placeholder="Category" required />
          <input name="imageUrl" type="text" placeholder="Image URL" required />
          <button type="submit">Add Photo</button>
        </form>
      </Modal>
    </div>
  );
};

export default App;
