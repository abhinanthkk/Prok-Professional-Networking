import { api } from '../../services/api';

export const postsApi = {
  createPost: async (content: string) => {
    return api.createPost(content);
  },

  getPosts: async (page: number = 1, per_page: number = 10) => {
    return api.getPosts(page, per_page);
  },

  likePost: async (postId: number) => {
    return api.likePost(postId);
  },
}; 