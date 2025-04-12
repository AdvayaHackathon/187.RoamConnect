import { useState, useEffect } from 'react';
import { UserIcon, PencilIcon, CameraIcon, CogIcon, ShareIcon, PlusIcon, XMarkIcon, TrashIcon } from '@heroicons/react/24/outline';
import { useNavigate, Link } from 'react-router-dom';
import { useUser } from '../../contexts/UserContext';
import './profile.css';

function Profile() {
  const navigate = useNavigate();
  const { userData, loading, error } = useUser();
  const [posts, setPosts] = useState([]);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [postsError, setPostsError] = useState(null);
  const [showSharePopup, setShowSharePopup] = useState(false);
  const [showPostSharePopup, setShowPostSharePopup] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [copied, setCopied] = useState(false);
  const [deletingPostId, setDeletingPostId] = useState(null);

  useEffect(() => {
    async function fetchPosts() {
      if (!userData?.email) {
        setLoadingPosts(false);
        return;
      }

      setLoadingPosts(true);
      setPostsError(null);
      
      try {
        const response = await fetch('https://roamconnect.onrender.com/posts');
        const data = await response.json();
        
        console.log('API Response:', data);
        console.log('User Data:', userData);

        if (data.status === 'success' && Array.isArray(data.data)) {
          // Filter posts by matching creator_name with user's name
          const userPosts = data.data.filter(post => 
            post.creator_name === userData.name || 
            post.created_by === userData.id ||
            post.email === userData.email
          );
          console.log('Filtered posts:', userPosts);
          setPosts(userPosts);
        } else {
          setPosts([]);
        }
      } catch (err) {
        console.error('Error fetching posts:', err);
        setPostsError('Failed to load posts. Please try again later.');
        setPosts([]);
      } finally {
        setLoadingPosts(false);
      }
    }

    fetchPosts();
  }, [userData]);

  const handlePostClick = (postId) => {
    navigate(`/post/${postId}`);
  };

  const handleShareProfile = () => {
    setShowSharePopup(true);
  };

  const handleSharePost = (e, post) => {
    e.stopPropagation();
    setSelectedPost(post);
    setShowPostSharePopup(true);
  };

  const handleDeletePost = async (e, postId) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this post?')) {
      return;
    }

    setDeletingPostId(postId);
    try {
      const response = await fetch(`https://roamconnect.onrender.com/posts/${postId}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('Failed to delete post');
      }

      // Remove post from local state
      setPosts(posts.filter(post => post.id !== postId));
    } catch (error) {
      console.error('Error deleting post:', error);
      alert('Failed to delete post. Please try again.');
    } finally {
      setDeletingPostId(null);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-16 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen pt-16 flex items-center justify-center">
        <div className="text-red-500">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 top-16 bg-white">
      <div className="flex h-full">
        {/* Left Side - Profile Info */}
        <div className="w-[400px] bg-gray-100 overflow-y-auto">
          {/* Cover Photo */}
          <div 
            className="h-48 bg-cover bg-center relative"
            style={{ 
              backgroundImage: userData.coverPhoto ? `url(${userData.coverPhoto})` : 'linear-gradient(to bottom right, #4F46E5, #7C3AED)'
            }}
          >
            {/* Profile Picture - Positioned at the bottom of cover photo */}
            <div className="absolute -bottom-16 left-1/2 transform -translate-x-1/2">
              <div className="w-32 h-32 rounded-full border-4 border-white bg-gray-200 overflow-hidden">
                {userData.profilePicture ? (
                  <img
                    src={userData.profilePicture}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-300 flex items-center justify-center">
                    <UserIcon className="h-16 w-16 text-gray-400" />
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="p-8 pt-20">
            {/* User Info */}
            <div className="text-center">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">{userData.name}</h1>
              <div className="flex items-center justify-center space-x-2 mb-4">
                <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                  ⭐ lvl1
                </span>
                <span className="text-gray-600">{userData.location}</span>
              </div>
              {userData.bio && (
                <p className="text-gray-600 mb-4">{userData.bio}</p>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col space-y-3">
              <button
                onClick={handleShareProfile}
                className="text-white flex items-center justify-center px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 w-full"
              >
                <ShareIcon className="h-5 w-5 mr-2" />
                Share Profile
              </button>
              <button
                onClick={() => navigate('/profile/edit')}
                className="flex items-center justify-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 w-full"
              >
                <PencilIcon className="h-5 w-5 mr-2" />
                Edit Profile
              </button>
              <button
                onClick={() => navigate('/create-post')}
                className="flex items-center justify-center px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 w-full"
              >
                <PlusIcon className="h-5 w-5 mr-2" />
                Create Post
              </button>
            </div>
          </div>
        </div>

        {/* Right Side - Posts */}
        <div className="flex-1">
          <div className="h-full">
            <div className="p-4 border-b flex justify-between items-center bg-white">
              <h2 className="text-xl font-semibold text-gray-900">My Posts</h2>
              <span className="text-gray-500">{posts.length} posts</span>
            </div>
            <div className="h-[calc(100%-4rem)] overflow-y-auto p-6">
              {loadingPosts ? (
                <div className="flex justify-center items-center h-32">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                </div>
              ) : posts.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <div className="bg-gray-100 rounded-full p-4 mb-4">
                    <PlusIcon className="h-8 w-8 text-gray-400" />
                  </div>
                  <p className="text-gray-600 mb-4">No posts yet. Create your first post!</p>
                  <button
                    onClick={() => navigate('/create-post')}
                    className="bg-blue-500 text-white px-6 py-2 rounded-lg flex items-center hover:bg-blue-600"
                  >
                    <PlusIcon className="h-5 w-5 mr-2" />
                    Create Post
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-6">
                  {posts.map((post) => (
                    <div 
                      key={post.id} 
                      className="bg-white border rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                      onClick={() => handlePostClick(post.id)}
                    >
                      {post.image_url && (
                        <img
                          src={`https://roamconnect.onrender.com${post.image_url}`}
                          alt={post.title}
                          className="w-full h-48 object-cover rounded-t-lg"
                        />
                      )}
                      <div className="p-4">
                        <h3 className="font-semibold text-gray-900 mb-2">{post.title}</h3>
                        <div className="text-gray-600 text-sm line-clamp-3">{post.content}</div>
                        <div className="mt-4 flex justify-between items-center text-sm text-gray-500">
                          <span>{new Date(post.created_at).toLocaleDateString()}</span>
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={(e) => handleSharePost(e, post)}
                              className="flex items-center text-blue-500 hover:text-blue-600 px-2 py-1 rounded"
                            >
                              <ShareIcon className="h-4 w-4 mr-1" />
                              Share
                            </button>
                            <button
                              onClick={(e) => handleDeletePost(e, post.id)}
                              disabled={deletingPostId === post.id}
                              className="flex items-center text-red-500 hover:text-red-600 px-2 py-1 rounded"
                            >
                              {deletingPostId === post.id ? (
                                <div className="h-4 w-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin mr-1" />
                              ) : (
                                <TrashIcon className="h-4 w-4 mr-1" />
                              )}
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Share Profile Popup */}
      {showSharePopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">Share Profile</h3>
              <button
                onClick={() => setShowSharePopup(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
            <div className="text-black flex space-x-2">
              <input
                type="text"
                value={`${window.location.origin}/profile`}
                readOnly
                className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
              <button
                onClick={() => copyToClipboard(`${window.location.origin}/profile`)}
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
              >
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Share Post Popup */}
      {showPostSharePopup && selectedPost && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">Share Post</h3>
              <button
                onClick={() => {
                  setShowPostSharePopup(false);
                  setSelectedPost(null);
                }}
                className="text-gray-400 hover:text-gray-500"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
            <div className="text-black flex space-x-2">
              <input
                type="text"
                value={`${window.location.origin}/post/${selectedPost.id}`}
                readOnly
                className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
              <button
                onClick={() => copyToClipboard(`${window.location.origin}/post/${selectedPost.id}`)}
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
              >
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Profile; 