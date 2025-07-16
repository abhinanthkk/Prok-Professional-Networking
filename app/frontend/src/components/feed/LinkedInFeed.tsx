import React, { useEffect, useState, useRef } from 'react';
import { feedApi } from './api';
import ReactQuill from 'react-quill';
import 'quill/dist/quill.snow.css';
import { postsApi } from '../posts/api';
import type { Comment } from '../posts/api';
import { useAuth } from '../../context/AuthContext';
import { profileApi } from '../profile/api';
import { useNavigate } from 'react-router-dom';
import DefaultAvatar from '../ui/DefaultAvatar';
import LoadingSpinner from '../ui/LoadingSpinner';
import LinkedInSidebar from './LinkedInSidebar';
import { 
  HandThumbUpIcon, 
  ChatBubbleLeftEllipsisIcon, 
  ArrowPathIcon, 
  PaperAirplaneIcon,
  EllipsisHorizontalIcon
} from '@heroicons/react/24/outline';
import { HandThumbUpIcon as HandThumbUpSolid, HeartIcon as HeartSolid } from '@heroicons/react/24/solid';

interface Post {
  id: number;
  content: string;
  title?: string;
  imageUrl?: string;
  media_url?: string;
  user: {
    id: number;
    name: string;
    username: string;
    avatar_url?: string;
    title?: string;
    location?: string;
  };
  created_at: string;
  likes_count?: number;
  comments_count?: number;
  liked_by_current_user?: boolean;
}



interface MediaPreview {
  url: string;
  type: 'image' | 'video';
}

// LinkedIn-style post card component
const LinkedInPostCard: React.FC<{
  post: Post;
  onLike: (postId: number) => void;
  onComment: (postId: number) => void;
  onShare: (postId: number) => void;
  onRepost: (postId: number) => void;
  likeLoading: boolean;
  showComments?: boolean;
  comments?: Comment[];

  onAddComment?: (postId: number, content: string) => void;
  commentInput?: string;
  onCommentInputChange?: (postId: number, value: string) => void;
  commentLoading?: boolean;
}> = ({ 
  post, 
  onLike, 
  onComment, 
  onShare, 
  onRepost, 
  likeLoading,
  showComments = false,
  comments = [],
  onAddComment,
  commentInput = '',
  onCommentInputChange,
  commentLoading = false
}) => {
  const navigate = useNavigate();
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);

  // Log post object for debugging
  console.log('Post object:', post);

  const handleFollow = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setFollowLoading(true);
    try {
      await profileApi.followUser();
      setIsFollowing(true);
    } catch (err) {
      console.error('Failed to follow user:', err);
    } finally {
      setFollowLoading(false);
    }
  };

  const handleUserClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/profile/${post.user.id}`);
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h`;
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d`;
    if (diffInHours < 720) return `${Math.floor(diffInHours / 168)}w`;
    return `${Math.floor(diffInHours / 720)}mo`;
  };

  const getMediaUrl = (mediaUrl?: string) => {
    if (!mediaUrl) return null;
    if (mediaUrl.startsWith('http')) return mediaUrl;
    return `http://localhost:5000${mediaUrl}`;
  };



  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-4 max-w-2xl mx-auto">
      {/* Post Header */}
      <div className="flex items-start p-4">
        <div 
          className="flex-shrink-0 cursor-pointer"
          onClick={handleUserClick}
        >
          {post.user.avatar_url ? (
            <img
              src={post.user.avatar_url}
              alt={post.user.name}
              className="w-12 h-12 rounded-full object-cover border border-gray-200"
            />
          ) : (
            <DefaultAvatar name={post.user.name} size="lg" />
          )}
        </div>
        
        <div className="flex-1 ml-3 min-w-0">
          <div 
            className="cursor-pointer"
            onClick={handleUserClick}
          >
            <div className="flex items-center gap-2">
              <span className="font-semibold text-gray-900 hover:text-blue-600 transition-colors">
                {post.user.name}
              </span>
              {post.user.title && (
                <span className="text-sm text-gray-600">• {post.user.title}</span>
              )}
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <span>@{post.user.username}</span>
              {post.user.location && (
                <>
                  <span>•</span>
                  <span>{post.user.location}</span>
                </>
              )}
              <span>•</span>
              <span>{formatTimeAgo(post.created_at)}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            className={`px-3 py-1 rounded-full text-sm font-medium transition ${
              isFollowing 
                ? 'bg-gray-100 text-gray-700' 
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
            onClick={handleFollow}
            disabled={followLoading}
          >
            {followLoading ? 'Following...' : isFollowing ? 'Following' : 'Follow'}
          </button>
          
          <button className="p-1 rounded-full hover:bg-gray-100 transition">
            <EllipsisHorizontalIcon className="w-5 h-5 text-gray-500" />
          </button>
        </div>
      </div>

      {/* Post Content */}
      <div className="px-4 pb-3">
        {post.title && (
          <h3 className="font-bold text-lg text-gray-900 mb-2">{post.title}</h3>
        )}
        <div 
          className="text-gray-900 mb-3 leading-relaxed"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />
        
        { (post.media_url || post.imageUrl) && (
          <div className="mb-3">
            <img
              src={post.media_url || post.imageUrl}
              alt="Post media"
              className="w-full max-h-96 object-cover rounded-lg"
              onError={e => {
                e.currentTarget.onerror = null;
                e.currentTarget.src =
                  'data:image/svg+xml;utf8,<svg width="400" height="300" xmlns="http://www.w3.org/2000/svg"><rect width="400" height="300" fill="%23eee"/><text x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" fill="%23999" font-size="24">No Image</text></svg>';
              }}
            />
          </div>
        )}
      </div>

      {/* Engagement Metrics */}
      <div className="px-4 py-2 border-t border-gray-100">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <div className="flex items-center gap-1">
            <div className="flex -space-x-1">
              <div className="w-5 h-5 bg-blue-500 rounded-full border-2 border-white flex items-center justify-center">
                <HandThumbUpSolid className="w-3 h-3 text-white" />
              </div>
              <div className="w-5 h-5 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                <HeartSolid className="w-3 h-3 text-white" />
              </div>
            </div>
            <span>{post.likes_count || 0} • {post.comments_count || 0} comments</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              <span>1.2k views</span>
            </span>
            <span>• 5 reposts</span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-around px-2 py-1 border-t border-gray-100">
        <button
          className={`flex items-center gap-2 px-4 py-2 rounded-full transition-colors ${
            post.liked_by_current_user 
              ? 'text-blue-600 bg-blue-50' 
              : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
          }`}
          onClick={() => onLike(post.id)}
          disabled={likeLoading}
        >
          {post.liked_by_current_user ? (
            <HandThumbUpSolid className="w-5 h-5" />
          ) : (
            <HandThumbUpIcon className="w-5 h-5" />
          )}
          <span className="font-medium">Like</span>
        </button>

        <button
          className="flex items-center gap-2 px-4 py-2 rounded-full text-gray-600 hover:text-blue-600 hover:bg-blue-50 transition-colors"
          onClick={() => onComment(post.id)}
        >
          <ChatBubbleLeftEllipsisIcon className="w-5 h-5" />
          <span className="font-medium">Comment</span>
        </button>

        <button
          className="flex items-center gap-2 px-4 py-2 rounded-full text-gray-600 hover:text-blue-600 hover:bg-blue-50 transition-colors"
          onClick={() => onRepost(post.id)}
        >
          <ArrowPathIcon className="w-5 h-5" />
          <span className="font-medium">Repost</span>
        </button>

        <button
          className="flex items-center gap-2 px-4 py-2 rounded-full text-gray-600 hover:text-blue-600 hover:bg-blue-50 transition-colors"
          onClick={() => onShare(post.id)}
        >
          <PaperAirplaneIcon className="w-5 h-5" />
          <span className="font-medium">Send</span>
        </button>
      </div>

      {/* Comments Section */}
      {showComments && (
        <div className="border-t border-gray-100 p-4">
          <div className="space-y-3 mb-4">
            {comments.map((comment) => (
              <div key={comment.id} className="flex gap-3">
                <div className="flex-shrink-0">
                  <DefaultAvatar name={comment.user?.name || 'User'} size="sm" />
                </div>
                <div className="flex-1">
                  <div className="bg-gray-50 rounded-2xl px-3 py-2">
                    <div className="font-medium text-sm text-gray-900">
                      {comment.user?.name || 'User'}
                    </div>
                    <div className="text-sm text-gray-700">{comment.content}</div>
                  </div>
                  <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                    <span>{formatTimeAgo(comment.created_at)}</span>
                    <button className="hover:text-blue-600">Like</button>
                    <button className="hover:text-blue-600">Reply</button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Add Comment */}
          <div className="flex gap-3">
            <div className="flex-shrink-0">
              <DefaultAvatar name="You" size="sm" />
            </div>
            <div className="flex-1">
              <input
                type="text"
                placeholder="Add a comment..."
                value={commentInput}
                onChange={(e) => onCommentInputChange?.(post.id, e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && commentInput.trim()) {
                    onAddComment?.(post.id, commentInput.trim());
                  }
                }}
              />
            </div>
            {commentInput.trim() && (
              <button
                onClick={() => onAddComment?.(post.id, commentInput.trim())}
                disabled={commentLoading}
                className="px-4 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:opacity-50 transition"
              >
                {commentLoading ? 'Posting...' : 'Post'}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// Main Feed Component
const LinkedInFeed: React.FC = () => {
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
  const [likeLoading, setLikeLoading] = useState<{[key: number]: boolean}>({});
  const [expandedComments, setExpandedComments] = useState<{[key: number]: boolean}>({});
  const [comments, setComments] = useState<{[key: number]: Comment[]}>({});
  const [commentInputs, setCommentInputs] = useState<{[key: number]: string}>({});
  const [commentLoading, setCommentLoading] = useState<{[key: number]: boolean}>({});
  
  const { user: currentUser } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchPosts = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await feedApi.getFeed();
      setPosts(res.posts || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load feed');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleMediaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setMedia(file);
      const url = URL.createObjectURL(file);
      if (file.type.startsWith('image/')) {
        setMediaPreview({ url, type: 'image' });
      } else if (file.type.startsWith('video/')) {
        setMediaPreview({ url, type: 'video' });
      }
    }
  };

  const handlePost = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    if (!body.trim()) {
      setFormError('Post content is required.');
      return;
    }
    setFormLoading(true);
    try {
      await postsApi.createPost(body, media || undefined, {
        title: title.trim() || undefined,
        allow_comments: true,
        is_public: true
      });
      setTitle('');
      setBody('');
      setMedia(null);
      setMediaPreview(null);
      setShowCreate(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
      fetchPosts(); // Refresh feed
    } catch (err: any) {
      setFormError(err.message || 'Failed to create post.');
    } finally {
      setFormLoading(false);
    }
  };

  const handleLike = async (postId: number) => {
    setLikeLoading(prev => ({ ...prev, [postId]: true }));
    try {
      await postsApi.likePost(postId);
      setPosts(prev => prev.map(post => 
        post.id === postId 
          ? { ...post, likes_count: (post.likes_count || 0) + 1, liked_by_current_user: true }
          : post
      ));
    } catch (err) {
      console.error('Failed to like post:', err);
    } finally {
      setLikeLoading(prev => ({ ...prev, [postId]: false }));
    }
  };

  const handleComment = async (postId: number) => {
    if (expandedComments[postId]) {
      setExpandedComments(prev => ({ ...prev, [postId]: false }));
      return;
    }

    try {
      const commentsData = await postsApi.getComments(postId);
      setComments(prev => ({ ...prev, [postId]: commentsData }));
      setExpandedComments(prev => ({ ...prev, [postId]: true }));
    } catch (err) {
      console.error('Failed to load comments:', err);
    }
  };

  const handleAddComment = async (postId: number, content: string) => {
    setCommentLoading(prev => ({ ...prev, [postId]: true }));
    try {
      const newComment = await postsApi.addComment(postId, content);
      setComments(prev => ({
        ...prev,
        [postId]: [...(prev[postId] || []), newComment]
      }));
      setCommentInputs(prev => ({ ...prev, [postId]: '' }));
      setPosts(prev => prev.map(post => 
        post.id === postId 
          ? { ...post, comments_count: (post.comments_count || 0) + 1 }
          : post
      ));
    } catch (err) {
      console.error('Failed to add comment:', err);
    } finally {
      setCommentLoading(prev => ({ ...prev, [postId]: false }));
    }
  };

  const handleShare = (postId: number) => {
    // Implement share functionality
    console.log('Share post:', postId);
  };

  const handleRepost = (postId: number) => {
    // Implement repost functionality
    console.log('Repost:', postId);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-lg mb-4">{error}</div>
          <button
            onClick={fetchPosts}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <LinkedInSidebar />
      
      {/* Main Feed */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-2xl mx-auto py-8 px-4">
          <div className="flex flex-col gap-6">
        {/* Create Post Card */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center gap-3 mb-4">
            {currentUser?.avatar_url ? (
              <img
                src={currentUser.avatar_url}
                alt={currentUser.name}
                className="w-12 h-12 rounded-full object-cover border border-gray-200"
              />
            ) : (
              <DefaultAvatar name={currentUser?.name || 'You'} size="lg" />
            )}
            <button
              className="flex-1 text-left px-4 py-3 border border-gray-200 rounded-full hover:bg-gray-50 text-gray-500 font-medium focus:outline-none transition"
              onClick={() => setShowCreate(true)}
            >
              Start a post
            </button>
          </div>

          {showCreate && (
            <form onSubmit={handlePost} className="space-y-4">
              <div>
                <input
                  type="text"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  disabled={formLoading}
                  maxLength={100}
                  placeholder="Add a title (optional)"
                />
              </div>
              <div>
                <ReactQuill
                  value={body}
                  onChange={setBody}
                  readOnly={formLoading}
                  theme="snow"
                  placeholder="What do you want to talk about?"
                  modules={{
                    toolbar: [
                      ['bold', 'italic', 'underline'],
                      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                      ['link'],
                      ['clean']
                    ]
                  }}
                />
              </div>
              
              <div>
                <input
                  type="file"
                  accept="image/*,video/*"
                  onChange={handleMediaChange}
                  ref={fileInputRef}
                  disabled={formLoading}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
                {mediaPreview && (
                  <div className="mt-2">
                    {mediaPreview.type === 'image' ? (
                      <img src={mediaPreview.url} alt="Preview" className="max-h-40 rounded-lg" />
                    ) : (
                      <video src={mediaPreview.url} controls className="max-h-40 rounded-lg" />
                    )}
                  </div>
                )}
              </div>

              {formError && (
                <div className="text-red-600 text-sm">{formError}</div>
              )}

              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
                  onClick={() => {
                    setShowCreate(false);
                    setFormError(null);
                  }}
                  disabled={formLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-6 py-2 rounded-full disabled:opacity-50 font-semibold hover:bg-blue-700 transition"
                  disabled={formLoading}
                >
                  {formLoading ? 'Posting...' : 'Post'}
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Posts Feed */}
        {posts.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-500 text-lg mb-4">No posts yet</div>
            <p className="text-gray-400">Be the first to share something with your network!</p>
          </div>
        ) : (
          posts.map(post => (
            <LinkedInPostCard
              key={post.id}
              post={post}
              onLike={handleLike}
              onComment={handleComment}
              onShare={handleShare}
              onRepost={handleRepost}
              likeLoading={likeLoading[post.id] || false}
              showComments={expandedComments[post.id]}
              comments={comments[post.id] || []}
              onAddComment={handleAddComment}
              commentInput={commentInputs[post.id] || ''}
              onCommentInputChange={(postId, value) => 
                setCommentInputs(prev => ({ ...prev, [postId]: value }))
              }
              commentLoading={commentLoading[post.id] || false}
            />
          ))
        )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LinkedInFeed; 