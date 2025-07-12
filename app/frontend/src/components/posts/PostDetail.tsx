import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DefaultAvatar from '../ui/DefaultAvatar';

interface Post {
  id: number;
  content: string;
  imageUrl?: string;
  user?: {
    id: number;
    name: string;
    username: string;
    avatar_url?: string;
    title?: string;
    location?: string;
  };
  created_at: string;
}

const PostDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPost = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`http://localhost:5000/api/posts/${id}`, {
          headers: token ? { 'Authorization': `Bearer ${token}` } : {},
        });
        if (!res.ok) throw new Error('Failed to fetch post');
        const data = await res.json();
        setPost(data);
      } catch (err: any) {
        setError(err.message || 'Error loading post');
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchPost();
  }, [id]);

  if (loading) return <div className="max-w-xl mx-auto p-8 text-center">Loading...</div>;
  if (error) return <div className="max-w-xl mx-auto p-8 text-center text-red-600">{error}</div>;
  if (!post) return <div className="max-w-xl mx-auto p-8 text-center">Post not found.</div>;

  const handleUserClick = () => {
    navigate(`/profile/${post.user?.id}`);
  };

  return (
    <div className="max-w-xl mx-auto bg-white rounded-xl shadow p-8 mt-8">
      {/* User Profile Header */}
      <div 
        className="flex items-start mb-6 cursor-pointer hover:opacity-80 transition-opacity"
        onClick={handleUserClick}
      >
        {post.user?.avatar_url ? (
          <img
            src={post.user.avatar_url}
            alt={post.user?.name || 'User'}
            className="w-12 h-12 rounded-full object-cover mr-4 border border-gray-200"
          />
        ) : (
          <DefaultAvatar name={post.user?.name || 'User'} size="lg" className="mr-4" />
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <div className="text-lg font-bold hover:text-blue-600 transition-colors">{post.user?.name || 'User'}</div>
            {post.user?.title && (
              <span className="text-sm text-gray-600">• {post.user.title}</span>
            )}
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <span>@{post.user?.username}</span>
            {post.user?.location && (
              <>
                <span>•</span>
                <span>{post.user.location}</span>
              </>
            )}
            <span>•</span>
            <span>{new Date(post.created_at).toLocaleString()}</span>
          </div>
        </div>
      </div>
      
      {/* Post Content */}
      <div className="text-xl mb-4">{post.content}</div>
      {post.imageUrl && (
        <img
          src={post.imageUrl}
          alt="Post"
          className="w-full max-h-[400px] object-cover rounded-xl mt-2"
        />
      )}
    </div>
  );
};

export default PostDetail; 