import { createContext, useContext, useState } from 'react';

const PostContext = createContext();

export function PostProvider({ children }) {
  const [posts, setPosts] = useState([
    {
      id: generateUniqueId(),
      title: 'Exploring the Hidden Gems of Bangalore',
      content: 'Just discovered some amazing local cafes and street art in the heart of the city. The culture here is vibrant and welcoming!',
      type: 'text',
      timestamp: Date.now(),
      author: {
        name: 'Travel Explorer',
        profilePicture: 'https://via.placeholder.com/32'
      }
    },
    {
      id: generateUniqueId(),
      title: 'Sunset at Nandi Hills',
      content: 'The view from Nandi Hills during sunset is absolutely breathtaking. A must-visit for anyone in Bangalore!',
      type: 'image',
      image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
      timestamp: Date.now() - 86400000,
      author: {
        name: 'Nature Lover',
        profilePicture: 'https://via.placeholder.com/32'
      }
    }
  ]);

  function generateUniqueId() {
    return Math.floor(100000000 + Math.random() * 900000000).toString();
  }

  const addPost = (newPost) => {
    const postWithId = {
      ...newPost,
      id: generateUniqueId()
    };
    setPosts([postWithId, ...posts]);
  };

  const removePost = (postId) => {
    setPosts(posts.filter(post => post.id !== postId));
  };

  return (
    <PostContext.Provider value={{ posts, addPost, removePost }}>
      {children}
    </PostContext.Provider>
  );
}

export function usePosts() {
  const context = useContext(PostContext);
  if (!context) {
    throw new Error('usePosts must be used within a PostProvider');
  }
  return context;
} 