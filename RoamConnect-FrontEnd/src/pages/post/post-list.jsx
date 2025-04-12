import { useNavigate } from 'react-router-dom';
import { usePosts } from '../../contexts/PostContext';
import { PlusIcon, ShareIcon, XMarkIcon, TrashIcon } from '@heroicons/react/24/outline';
import { useState, useEffect } from 'react';

function PostList() {
  const navigate = useNavigate();
  const { removePost } = usePosts();
  const [showSharePopup, setShowSharePopup] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [posts, setPosts] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const response = await fetch('https://roamconnect.onrender.com/posts');
      if (!response.ok) {
        throw new Error('Failed to fetch posts');
      }
      const result = await response.json();
      setPosts(result.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleShare = (postId) => {
    setShowSharePopup(postId);
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      alert('Link copied to clipboard!');
      setShowSharePopup(null);
    });
  };

  const handlePostClick = (postId) => {
    navigate(`/post/${postId}`);
  };

  const handleDelete = async (e, postId) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this post?')) {
      return;
    }

    setDeletingId(postId);
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
      setDeletingId(null);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 top-16 bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed inset-0 top-16 bg-gray-50 flex items-center justify-center">
        <div className="text-red-500">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="absolute inset-0 top-16 bg-gray-50 overflow-y-auto">
      <div className="max-w-5xl mx-auto px-4 py-4">
        <div className="flex justify-between items-center mb-4 sticky top-0 bg-gray-50 py-4 z-10">
          <h1 className="text-xl font-bold text-gray-900">All Posts</h1>
          <button 
            onClick={() => navigate('/create-post')}
            className="bg-blue-500 text-white px-4 py-2 rounded-full flex items-center hover:bg-blue-600 text-sm"
          >
            <PlusIcon className="h-5 w-5 mr-1" />
            Create Post
          </button>
        </div>

        {!posts || posts.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <p className="text-gray-600">No posts yet. Create your first post!</p>
          </div>
        ) : (
          <div className="space-y-4 pb-6">
            {posts.map((post) => (
              <div
                key={post.id}
                className="bg-white rounded-lg shadow hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => handlePostClick(post.id)}
              >
                <div className="p-6">
                  {/* Post Header */}
                  <div className="flex items-center text-xs text-gray-500 mb-3">
                    <span className="font-medium text-gray-900">{post.creator_name || 'Anonymous'}</span>
                    <span className="mx-2">•</span>
                    <span>{new Date(post.created_at).toLocaleDateString()}</span>
                  </div>

                  {/* Post Title */}
                  <h2 className="text-xl font-semibold text-gray-900 mb-3">{post.title}</h2>

                  {/* Post Image */}
                  {post.image_url && (
                    <div className="relative mb-4">
                      <img
                        src={`https://roamconnect.onrender.com${post.image_url}`}
                        alt={post.title}
                        className="w-full max-h-[500px] object-cover rounded-md"
                      />
                    </div>
                  )}

                  {/* Post Content */}
                  <div className="text-gray-600 mb-4 whitespace-pre-wrap">{post.content}</div>

                  {/* Location Link */}
                  {post.loc_link && (
                    <a
                      href={post.loc_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="text-blue-500 hover:text-blue-600 text-sm inline-block mb-4"
                    >
                      View Location
                    </a>
                  )}

                  {/* Action Buttons */}
                  <div className="flex justify-end items-center space-x-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleShare(post.id);
                      }}
                      className="text-gray-500 flex items-center hover:bg-gray-100 rounded-md px-3 py-1.5"
                    >
                      <ShareIcon className="h-4 w-4 mr-1.5" />
                      <span>Share</span>
                    </button>
                    <button
                      onClick={(e) => handleDelete(e, post.id)}
                      disabled={deletingId === post.id}
                      className="text-red-500 flex items-center hover:bg-red-50 rounded-md px-3 py-1.5"
                    >
                      {deletingId === post.id ? (
                        <div className="h-4 w-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin mr-1.5" />
                      ) : (
                        <TrashIcon className="h-4 w-4 mr-1.5" />
                      )}
                      <span>Delete</span>
                    </button>
                  </div>
                </div>

                {/* Share Popup */}
                {showSharePopup === post.id && (
                  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold">Share Post</h3>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowSharePopup(null);
                          }}
                          className="text-gray-500 hover:text-gray-700"
                        >
                          <XMarkIcon className="h-5 w-5" />
                        </button>
                      </div>
                      <div className="mb-4">
                        <p className="text-sm text-gray-600 mb-2">Copy this link to share:</p>
                        <div className="flex">
                          <input
                            type="text"
                            value={`${window.location.origin}/post/${post.id}`}
                            readOnly
                            className="flex-1 px-3 py-2 border rounded-l-lg text-sm"
                          />
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              copyToClipboard(`${window.location.origin}/post/${post.id}`);
                            }}
                            className="bg-blue-500 text-white px-4 py-2 rounded-r-lg hover:bg-blue-600"
                          >
                            Copy
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default PostList; 