import { api } from '../../services/api';
import type { PostCreateResponse } from '../../services/api';
import { API_URL } from '../../services/api';

export interface Comment {
  id: number;
  content: string;
  created_at: string;
  user: {
    id: number;
    name: string;
    username: string;
  };
}

export const postsApi = {
  createPost: async (content: string, media?: File, options?: { allow_comments?: boolean; is_public?: boolean; title?: string }): Promise<PostCreateResponse & { media_url?: string }> => {
    const result = await api.createPost(content, media, options);
    return {
      ...result,
      media_url: result.imageUrl || result.media_url,
    };
  },

  getPosts: async (
    page: number = 1, 
    per_page: number = 10,
    filters?: {
      search?: string;
      category?: string;
      visibility?: 'public' | 'private' | 'all';
      tags?: string[];
      sortBy?: 'created_at' | 'likes' | 'comments' | 'updated_at';
      sortOrder?: 'asc' | 'desc';
    }
  ) => {
    const params = new URLSearchParams({
      page: page.toString(),
      per_page: per_page.toString(),
    });

    if (filters?.search) params.append('search', filters.search);
    if (filters?.category) params.append('category', filters.category);
    if (filters?.visibility) params.append('visibility', filters.visibility);
    if (filters?.tags?.length) params.append('tags', filters.tags.join(','));
    if (filters?.sortBy) params.append('sort_by', filters.sortBy);
    if (filters?.sortOrder) params.append('sort_order', filters.sortOrder);

    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/posts?${params.toString()}`, {
      headers: token ? { 'Authorization': `Bearer ${token}` } : {},
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch posts');
    }
    
    const data = await response.json();
    const posts = (data.posts || []).map((post: any) => ({
      ...post,
      media_url: post.imageUrl || post.media_url || undefined,
    }));
    return { ...data, posts };
  },

  likePost: async (postId: number) => {
    return api.likePost(postId);
  },

  getComments: async (postId: number): Promise<Comment[]> => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/posts/${postId}/comments`, {
      headers: token ? { 'Authorization': `Bearer ${token}` } : {},
    });
    const data = await response.json();
    return data.comments || [];
  },

  addComment: async (postId: number, content: string): Promise<Comment> => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/posts/${postId}/comments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
      },
      body: JSON.stringify({ content }),
    });
    return response.json();
  },

  editComment: async (postId: number, commentId: number, content: string): Promise<Comment> => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/posts/${postId}/comments/${commentId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
      },
      body: JSON.stringify({ content }),
    });
    return response.json();
  },

  deleteComment: async (postId: number, commentId: number): Promise<{ message: string; id: number }> => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/posts/${postId}/comments/${commentId}`, {
      method: 'DELETE',
      headers: {
        ...(token && { 'Authorization': `Bearer ${token}` })
      },
    });
    return response.json();
  },
}; 