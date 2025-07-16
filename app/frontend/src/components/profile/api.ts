import { api } from '../../services/api';

export const profileApi = {
  getProfile: async (userId?: string) => {
    if (userId) {
      // For viewing other users' profiles, we'll need to implement this endpoint
      throw new Error('Viewing other user profiles not implemented yet');
    }
    return api.getProfile();
  },

  updateProfile: async (profileData: any) => {
    return api.updateProfile(profileData);
  },

  uploadAvatar: async (file: File) => {
    return api.uploadProfileImage(file);
  },

  getUserActivity: async () => {
    // This endpoint needs to be implemented in the backend
    throw new Error('User activity endpoint not implemented yet');
  },

  getConnections: async () => {
    // This endpoint needs to be implemented in the backend
    throw new Error('Connections endpoint not implemented yet');
  },

  sendConnectionRequest: async () => {
    // This endpoint needs to be implemented in the backend
    throw new Error('Connection requests not implemented yet');
  },

  acceptConnectionRequest: async () => {
    // This endpoint needs to be implemented in the backend
    throw new Error('Connection requests not implemented yet');
  },

  rejectConnectionRequest: async () => {
    // This endpoint needs to be implemented in the backend
    throw new Error('Connection requests not implemented yet');
  },

  followUser: async () => {
    // TODO: Implement backend endpoint and call it here
    throw new Error('Follow user endpoint not implemented yet');
  },
  unfollowUser: async () => {
    // TODO: Implement backend endpoint and call it here
    throw new Error('Unfollow user endpoint not implemented yet');
  }
}; 