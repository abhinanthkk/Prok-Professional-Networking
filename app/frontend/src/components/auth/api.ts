import { api } from '../../services/api';

export const authApi = {
  login: async (credentials: { email: string; password: string }) => {
    return api.login(credentials);
  },

  signup: async (userData: { email: string; password: string; username: string; confirm_password: string }) => {
    return api.signup(userData);
  },
}; 