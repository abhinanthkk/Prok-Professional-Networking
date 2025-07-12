import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDebounce } from '../../hooks/useDebounce';
import { useInfiniteScroll } from '../../hooks/useInfiniteScroll';
import { postsApi } from './api';
import type { Post } from '../../types';
import LoadingSpinner from '../ui/LoadingSpinner';
import EmptyState from '../ui/EmptyState';
import PostCard from './PostCard';
import { useInfiniteQuery } from '@tanstack/react-query';
import type { QueryFunctionContext } from '@tanstack/react-query';

interface PostFilters {
  search: string;
  category: string;
  visibility: 'public' | 'private' | 'all';
  tags: string[];
  sortBy: 'created_at' | 'likes' | 'comments' | 'updated_at';
  sortOrder: 'asc' | 'desc';
}

const fetchPosts = async ({ pageParam, queryKey }: QueryFunctionContext<readonly unknown[]>) => {
  const [_key, filters] = queryKey;
  const page = typeof pageParam === 'number' ? pageParam : 1;
  const response = await postsApi.getPosts(page, 10, filters as any);
  return response.posts || [];
};

const PostList: React.FC = () => {
  const navigate = useNavigate();
  const [filters, setFilters] = useState<PostFilters>({
    search: '',
    category: '',
    visibility: 'all',
    tags: [],
    sortBy: 'created_at',
    sortOrder: 'desc',
  });

  const debouncedSearch = useDebounce(filters.search, 500);
  const queryFilters = { ...filters, search: debouncedSearch };

  const {
    data,
    error,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isLoading,
    refetch,
  } = useInfiniteQuery<Post[], Error>({
    queryKey: ['posts', queryFilters],
    queryFn: fetchPosts,
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) =>
      lastPage && lastPage.length === 10 ? allPages.length + 1 : undefined,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const posts = data ? (data.pages as Post[][]).flat() : [];

  // Infinite scroll observer
  const observerRef = useInfiniteScroll({
    hasMore: !!hasNextPage,
    isLoading: isFetching,
    onLoadMore: fetchNextPage,
  });

  // Reset and fetch posts when filters change
  useEffect(() => {
    refetch();
  }, [debouncedSearch, filters.category, filters.visibility, filters.tags, filters.sortBy, filters.sortOrder]);

  // Handle filter changes
  const handleFilterChange = (key: keyof PostFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  // Handle search input
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFilterChange('search', e.target.value);
  };

  // Handle category change
  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    handleFilterChange('category', e.target.value);
  };

  // Handle visibility change
  const handleVisibilityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    handleFilterChange('visibility', e.target.value);
  };

  // Handle sort change
  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const [sortBy, sortOrder] = e.target.value.split('-');
    handleFilterChange('sortBy', sortBy);
    handleFilterChange('sortOrder', sortOrder);
  };

  // Handle tag selection
  const handleTagToggle = (tag: string) => {
    setFilters(prev => ({
      ...prev,
      tags: prev.tags.includes(tag)
        ? prev.tags.filter(t => t !== tag)
        : [...prev.tags, tag]
    }));
  };

  // Clear all filters
  const clearFilters = () => {
    setFilters({
      search: '',
      category: '',
      visibility: 'all',
      tags: [],
      sortBy: 'created_at',
      sortOrder: 'desc',
    });
  };



  // Available categories and tags
  const categories = ['Technology', 'Business', 'Design', 'Marketing', 'Development', 'Other'];
  const availableTags = ['React', 'JavaScript', 'Python', 'Design', 'Marketing', 'Business', 'Technology', 'Development'];

  // Check if any filters are active
  const hasActiveFilters = useMemo(() => {
    return filters.search || filters.category || filters.visibility !== 'all' || filters.tags.length > 0;
  }, [filters]);

  if (error && posts.length === 0) {
    return (
      <div className="max-w-4xl mx-auto p-4">
        <EmptyState
          title="Error Loading Posts"
          description={error instanceof Error ? error.message : 'Failed to fetch posts'}
          action={
            <button
              onClick={() => refetch()}
              className="btn btn-primary"
            >
              Try Again
            </button>
          }
        />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      {/* Filters Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex flex-wrap gap-4 items-end">
          {/* Search */}
          <div className="flex-1 min-w-64">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search Posts
            </label>
            <input
              type="text"
              placeholder="Search posts by content, title, or tags..."
              value={filters.search}
              onChange={handleSearchChange}
              className="input w-full"
            />
          </div>

          {/* Category Filter */}
          <div className="min-w-48">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category
            </label>
            <select
              value={filters.category}
              onChange={handleCategoryChange}
              className="input"
            >
              <option value="">All Categories</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>

          {/* Visibility Filter */}
          <div className="min-w-48">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Visibility
            </label>
            <select
              value={filters.visibility}
              onChange={handleVisibilityChange}
              className="input"
            >
              <option value="all">All Posts</option>
              <option value="public">Public Only</option>
              <option value="private">Private Only</option>
            </select>
          </div>

          {/* Sort */}
          <div className="min-w-48">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sort By
            </label>
            <select
              value={`${filters.sortBy}-${filters.sortOrder}`}
              onChange={handleSortChange}
              className="input"
            >
              <option value="created_at-desc">Newest First</option>
              <option value="created_at-asc">Oldest First</option>
              <option value="likes-desc">Most Liked</option>
              <option value="comments-desc">Most Commented</option>
              <option value="updated_at-desc">Recently Updated</option>
            </select>
          </div>

          {/* Clear Filters */}
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="btn btn-secondary"
            >
              Clear Filters
            </button>
          )}
        </div>

        {/* Tags Filter */}
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tags
          </label>
          <div className="flex flex-wrap gap-2">
            {availableTags.map(tag => (
              <button
                key={tag}
                onClick={() => handleTagToggle(tag)}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                  filters.tags.includes(tag)
                    ? 'bg-primary text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Posts List */}
      <div className="space-y-6">
        {posts.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}

        {/* Loading Spinner */}
        {isLoading && (
          <div className="flex justify-center py-8">
            <LoadingSpinner size="lg" />
          </div>
        )}

        {/* Empty State */}
        {!isLoading && posts.length === 0 && !hasActiveFilters && (
          <EmptyState
            title="No Posts Yet"
            description="Be the first to share something with your network!"
            action={
              <button
                onClick={() => navigate('/posts/create')}
                className="btn btn-primary"
              >
                Create Your First Post
              </button>
            }
          />
        )}

        {!isLoading && posts.length === 0 && hasActiveFilters && (
          <EmptyState
            title="No Posts Found"
            description="Try adjusting your filters to see more posts."
            action={
              <button
                onClick={clearFilters}
                className="btn btn-secondary"
              >
                Clear Filters
              </button>
            }
          />
        )}

        {/* Infinite Scroll Observer */}
        <div ref={observerRef} className="h-4" />
      </div>
    </div>
  );
};

export default PostList; 