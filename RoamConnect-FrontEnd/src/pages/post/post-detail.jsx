import { useParams, useNavigate } from 'react-router-dom';
import { usePosts } from '../../contexts/PostContext';
import { ArrowLeftIcon, HeartIcon, ChatBubbleLeftIcon, ShareIcon } from '@heroicons/react/24/outline';

function PostDetail() {
  const { postId } = useParams();
  const navigate = useNavigate();
  const { posts } = usePosts();
  
  const post = posts.find(p => p.id === postId);

  if (!post) {
    return (
      <div className="pt-16 min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto p-6">
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-600">Post not found</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-16 min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto p-6">
        <button
          onClick={() => navigate(-1)}
          className="mb-6 flex items-center text-gray-600 hover:text-gray-900"
        >
          <ArrowLeftIcon className="h-5 w-5 mr-2" />
          Back
        </button>

        <div className="bg-white rounded-lg shadow overflow-hidden">
          {/* Post Header */}
          <div className="p-6 border-b">
            <div className="flex items-center mb-4">
              <img
                src={post.author.profilePicture}
                alt={post.author.name}
                className="h-10 w-10 rounded-full mr-3"
              />
              <div>
                <h3 className="font-semibold text-gray-900">{post.author.name}</h3>
                <p className="text-sm text-gray-500">{new Date(post.timestamp).toLocaleDateString()}</p>
              </div>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">{post.title}</h2>
          </div>

          {/* Post Content */}
          <div className="p-6">
            {post.type === 'image' && (
              <img
                src={post.image}
                alt={post.title}
                className="w-full rounded-lg mb-6"
              />
            )}
            {post.type === 'link' && (
              <a
                href={post.link}
                target="_blank"
                rel="noopener noreferrer"
                className="block mb-6 p-4 bg-gray-50 rounded-lg hover:bg-gray-100"
              >
                <p className="text-blue-600 hover:underline">{post.link}</p>
              </a>
            )}
            <div className="prose max-w-none">
              {post.content.split('\n').map((paragraph, index) => (
                <p key={index} className="mb-4 text-gray-700">
                  {paragraph}
                </p>
              ))}
            </div>
          </div>

          {/* Post Footer */}
          <div className="p-6 border-t bg-gray-50">
            <div className="flex items-center space-x-6">
              <button className="flex items-center text-gray-600 hover:text-red-500">
                <HeartIcon className="h-5 w-5 mr-2" />
                <span>{post.likes}</span>
              </button>
              <button className="flex items-center text-gray-600 hover:text-blue-500">
                <ChatBubbleLeftIcon className="h-5 w-5 mr-2" />
                <span>{post.comments.length}</span>
              </button>
              <button className="flex items-center text-gray-600 hover:text-gray-900">
                <ShareIcon className="h-5 w-5 mr-2" />
                <span>Share</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PostDetail; 