import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

interface Post {
  id: number;
  content: string;
  imageUrl?: string;
  user?: {
    id: number;
    name: string;
    username: string;
  };
  created_at: string;
}

const PostDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
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

  return (
    <div className="max-w-xl mx-auto bg-white rounded-xl shadow p-8 mt-8">
      <div className="mb-4">
        <div className="text-lg font-bold">{post.user?.name || 'User'}</div>
        <div className="text-gray-500 text-sm">@{post.user?.username} • {new Date(post.created_at).toLocaleString()}</div>
      </div>
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