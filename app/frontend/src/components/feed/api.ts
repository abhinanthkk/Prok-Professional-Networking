import { api } from '../../services/api';

export const feedApi = {
  getFeed: async (page: number = 1, per_page: number = 10) => {
    return api.getFeed(page, per_page);
  },

  getFeedByUser: async (userId: number, page: number = 1, per_page: number = 10) => {
    return api.getUserFeed(userId, page, per_page);
  },
}; 