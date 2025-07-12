import React from 'react';
import { useNavigate } from 'react-router-dom';
import type { Post } from '../../types';
import LazyImage from '../ui/LazyImage';
import DefaultAvatar from '../ui/DefaultAvatar';
import { HandThumbUpIcon, ChatBubbleLeftEllipsisIcon, ArrowUpRightIcon } from '@heroicons/react/24/outline';

interface PostCardProps {
  post: Post;
}

const PostCard: React.FC<PostCardProps> = React.memo(({ post }) => {
  const navigate = useNavigate();

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  const handleClick = () => {
    navigate(`/posts/${post.id}`);
  };

  const handleUserClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/profile/${post.user.id}`);
  };

  console.log('PostCard rendered');
  console.log('Post object:', post);
  console.log('Post media_url:', post.media_url);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6 max-w-2xl mx-auto cursor-pointer hover:shadow-md transition-shadow" onClick={handleClick}>
      {/* User Info Row */}
      <div className="flex items-start mb-3">
        <div 
          className="flex items-start cursor-pointer hover:opacity-80 transition-opacity"
          onClick={handleUserClick}
        >
          {post.user.avatar_url ? (
            <img
              src={post.user.avatar_url}
              alt={post.user.name}
              className="w-10 h-10 rounded-full object-cover mr-3 border border-gray-200"
            />
          ) : (
            <DefaultAvatar name={post.user.name} size="md" className="mr-3" />
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-semibold text-gray-900 leading-tight hover:text-blue-600 transition-colors">{post.user.name}</span>
              {post.user.title && (
                <span className="text-sm text-gray-600">• {post.user.title}</span>
              )}
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <span>@{post.user.username}</span>
              {post.user.location && (
                <>
                  <span>•</span>
                  <span>{post.user.location}</span>
                </>
              )}
              <span>•</span>
              <span>{formatDate(post.created_at)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Title */}
      {post.title && (
        <div className="font-bold text-lg text-gray-900 mb-1">{post.title}</div>
      )}

      {/* Content */}
      <div className="text-gray-700 mb-3">
        {post.content}
      </div>

      {/* Image */}
      {post.media_url && (
        <div className="my-3">
          <LazyImage
            src={post.media_url}
            alt="Post media"
            className="w-full h-64 object-cover rounded-lg"
          />
        </div>
      )}

      {/* Actions Row */}
      <div className="flex items-center space-x-8 text-gray-500 mt-2">
        <span className="flex items-center space-x-1">
          <HandThumbUpIcon className="w-5 h-5" />
          <span>{post.likes}</span>
        </span>
        <span className="flex items-center space-x-1">
          <ChatBubbleLeftEllipsisIcon className="w-5 h-5" />
          <span>{post.comments.length}</span>
        </span>
        <span className="flex items-center space-x-1 cursor-pointer hover:text-primary">
          <ArrowUpRightIcon className="w-5 h-5" />
          <span>Share</span>
        </span>
      </div>
    </div>
  );
});

PostCard.displayName = 'PostCard';

export default PostCard; 