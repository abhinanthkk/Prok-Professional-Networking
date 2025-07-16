import React, { useEffect, useState, useRef } from 'react';
import { feedApi } from './api';
import ReactQuill from 'react-quill';
import 'quill/dist/quill.snow.css';
import { postsApi } from '../posts/api';
import type { Comment } from '../posts/api';
import { useAuth } from '../../context/AuthContext';
import { profileApi } from '../profile/api';
import { Link } from 'react-router-dom';

interface Post {
  id: number;
  content: string;
  imageUrl?: string;
  user: {
    id: number;
    name: string;
    username: string;
    avatar_url?: string; // <-- Add this field
  };
  created_at: string;
  likes_count?: number;
  liked_by_current_user?: boolean; // <-- Add this field
}



interface MediaPreview {
  url: string;
  type: 'image' | 'video';
}

// Add placeholder data for who liked
const placeholderWhoLiked = [
  { name: 'Alice', avatar_url: 'https://randomuser.me/api/portraits/women/1.jpg' },
  { name: 'Bob', avatar_url: 'https://randomuser.me/api/portraits/men/2.jpg' },
  { name: 'Carol', avatar_url: 'https://randomuser.me/api/portraits/women/3.jpg' },
];

// Utility to sanitize post HTML and strip placeholder/broken links
function sanitizePostHtml(html: string): string {
  // Remove <a href="#">...</a> and <a href="/unknown">...</a> and similar
  // Replace with just the inner text
  return html.replace(/<a[^>]+href=["'](?:#|\/unknown)["'][^>]*>(.*?)<\/a>/gi, '$1');
}

// Helper for LinkedIn-style card preview (used in both feed and preview)
function PostCard({ post, showActions = true, likeLoading, handleLike }: { post: any, showActions?: boolean, likeLoading?: any, handleLike?: any }) {
  const [isFollowing, setIsFollowing] = React.useState(false);
  const [followLoading, setFollowLoading] = React.useState(false);

  const handleFollow = async () => {
    setFollowLoading(true);
    try {
      // TODO: Replace with actual userId and backend call
      await profileApi.followUser();
      setIsFollowing(true);
    } catch (err) {
      // Optionally show error
    } finally {
      setFollowLoading(false);
    }
  };
  return (
    <div className="bg-surface rounded-2xl shadow-md border border-gray-100 p-4 mb-4 max-w-2xl mx-auto hover:shadow-lg transition-all font-sans text-text">
      <Link to={`/posts/${post.id}`} className="block focus:outline-none">
        {/* Header */}
        <div className="flex items-center gap-3 mb-2">
          <img src={post.user?.avatar_url} alt={post.user?.name} className="w-12 h-12 rounded-full object-cover border-2 border-primary" />
          <div>
            <div className="font-semibold text-text">{post.user?.name}</div>
            <div className="text-sm text-gray-500">@{post.user?.username}</div>
          </div>
          <button className="ml-auto px-4 py-1 rounded-full bg-primary text-white font-semibold hover:bg-blue-700 transition">Connect</button>
        </div>
        <div className="text-text mb-2">{post.content}</div>
        {post.imageUrl && (
          <img src={post.imageUrl} alt="Post" className="w-full rounded-xl mt-2" />
        )}
        <div className="flex gap-4 mt-3">
          <button className="flex-1 py-2 rounded-xl bg-background hover:bg-primary/10 text-primary font-medium transition">Like</button>
          <button className="flex-1 py-2 rounded-xl bg-background hover:bg-accent/10 text-accent font-medium transition">Comment</button>
        </div>
      </Link>
    </div>
  );
}



const Feed: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [media, setMedia] = useState<File | null>(null);
  const [mediaPreview, setMediaPreview] = useState<MediaPreview | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [likeLoading, setLikeLoading] = useState<{[key: number]: boolean}>({});
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user: currentUser } = useAuth();
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchPosts = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await feedApi.getFeed();
      setPosts(res.posts || []);
      // If backend does not provide liked_by_current_user, you may need to map it here based on currentUser and post.likes (if available)
      setPosts(prevPosts => prevPosts.map(post => ({
        ...post,
        liked_by_current_user: post.liked_by_current_user, // Assuming backend provides this
      })));
    } catch (err: any) {
      setError(err.message || 'Failed to load feed');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  React.useEffect(() => {
    posts.forEach(post => {
      if (post.imageUrl) {
        console.log('Post imageUrl:', post.imageUrl);
      }
    });
  }, [posts]);

  const handleMediaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setMedia(file);
      const url = URL.createObjectURL(file);
      if (file.type.startsWith('image/')) {
        setMediaPreview({ url, type: 'image' });
      } else if (file.type.startsWith('video/')) {
        setMediaPreview({ url, type: 'video' });
      } else {
        setMediaPreview(null);
        setFormError('Only image and video files are supported.');
      }
    }
  };

  const handlePost = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    if (!body.trim()) {
      setFormError('Post body is required.');
      return;
    }
    setFormLoading(true);
    try {
      const { postsApi } = await import('../posts/api');
      await postsApi.createPost(body, media || undefined);
      setFormLoading(false);
      setTitle('');
      setBody('');
      setMedia(null);
      setMediaPreview(null);
      setShowCreate(false);
      setShowPreview(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
      fetchPosts();
    } catch (err: any) {
      setFormLoading(false);
      setFormError(err.message || 'Failed to create post.');
    }
  };

  const handleLike = async (postId: number) => {
    setLikeLoading(prev => ({ ...prev, [postId]: true }));
    try {
      const { postsApi } = await import('../posts/api');
      await postsApi.likePost(postId);
      // Optimistically update like count
      setPosts(prevPosts => prevPosts.map(post =>
        post.id === postId ? { ...post, likes_count: (post.likes_count || 0) + 1, liked_by_current_user: true } : post
      ));
    } catch (err) {
      // Optionally show error
    } finally {
      setLikeLoading(prev => ({ ...prev, [postId]: false }));
    }
  };



  return (
    <div className="min-h-screen bg-[#f3f2ef] py-8">
      <div className="max-w-2xl mx-auto flex flex-col gap-6">
        {/* Start a Post Card (LinkedIn style) */}
        <div className="bg-white rounded-2xl shadow border border-gray-200 p-0 mb-2">
          <div className="flex items-center px-6 pt-6 pb-2">
            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center font-bold text-blue-700 text-xl mr-4 border-2 border-white shadow">
              {currentUser?.avatar_url ? (
                <img
                  src={currentUser.avatar_url}
                  alt={currentUser.name}
                  className="w-12 h-12 rounded-full object-cover"
                />
              ) : (
                currentUser?.name ? currentUser.name[0] : 'A'
              )}
            </div>
            <button
              className="flex-1 text-left px-4 py-3 border border-gray-200 rounded-full hover:bg-gray-50 text-gray-500 font-medium focus:outline-none transition"
              onClick={() => setShowCreate(true)}
            >
              What do you want to talk about?
            </button>
          </div>
          {showCreate && (
            <form onSubmit={handlePost} className="px-6 pb-4 pt-2 space-y-4">
              <div>
                <input
                  type="text"
                  className="w-full border rounded px-3 py-2"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  disabled={formLoading}
                  maxLength={100}
                  placeholder="Title (optional)"
                />
              </div>
              <div>
                <ReactQuill
                  value={body}
                  onChange={setBody}
                  readOnly={formLoading}
                  theme="snow"
                  placeholder="Write your post..."
                />
              </div>
              <div>
                <input
                  type="file"
                  accept="image/*,video/*"
                  onChange={handleMediaChange}
                  ref={fileInputRef}
                  disabled={formLoading}
                />
                {mediaPreview && (
                  <div className="mt-2">
                    {mediaPreview.type === 'image' ? (
                      <img src={mediaPreview.url} alt="Preview" className="max-h-40 rounded" />
                    ) : (
                      <video src={mediaPreview.url} controls className="max-h-40 rounded" />
                    )}
                  </div>
                )}
              </div>
              {formError && <div className="text-red-600 font-medium">{formError}</div>}
              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  className="px-4 py-2 rounded border border-gray-300 text-gray-700 hover:bg-gray-50"
                  onClick={() => setShowPreview(!showPreview)}
                  disabled={formLoading}
                >
                  {showPreview ? 'Hide Preview' : 'Preview'}
                </button>
                <button
                  type="button"
                  className="px-4 py-2 rounded border border-gray-300 text-gray-700 hover:bg-gray-50"
                  onClick={() => {
                    setShowCreate(false);
                    setShowPreview(false);
                    setFormError(null);
                  }}
                  disabled={formLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-[#0a66c2] text-white px-4 py-2 rounded-full disabled:opacity-50 font-semibold shadow-sm hover:bg-[#004182] transition"
                  disabled={formLoading}
                >
                  {formLoading ? 'Posting...' : 'Post'}
                </button>
              </div>
              {showPreview && (
                <PostCard
                  post={{
                    user: currentUser || { name: 'You', username: 'you' },
                    title,
                    content: body,
                    media_url: mediaPreview?.url,
                    created_at: new Date().toISOString(),
                  }}
                  showActions={false}
                />
              )}
            </form>
          )}
        </div>
        {/* Feed Posts */}
        {loading ? (
          <div className="text-center text-lg">Loading feed...</div>
        ) : error ? (
          <div className="text-center text-red-600">{error}</div>
        ) : posts.length === 0 ? (
          <p className="text-center text-gray-500">No posts yet.</p>
        ) : (
          posts.map(post => (
            <PostCard key={post.id} post={post} likeLoading={likeLoading} handleLike={handleLike} />
          ))
        )}
      </div>

      {/* Toast Notification */}
      {toast && (
        <div className={`fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50 px-6 py-3 rounded shadow-lg text-white transition-all ${toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}>
          {toast.message}
        </div>
      )}
    </div>
  );
};

export default Feed;