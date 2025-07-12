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
  createPost: async (content: string, media?: File, options?: { allow_comments?: boolean; is_public?: boolean; title?: string }): Promise<PostCreateResponse> => {
    return api.createPost(content, media, options);
  },

  getPosts: async (page: number = 1, per_page: number = 10) => {
    return api.getPosts(page, per_page);
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