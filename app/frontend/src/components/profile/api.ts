const API_URL = 'http://localhost:5000';

export const profileApi = {
  getProfile: async (userId?: string) => {
    const url = userId ? `${API_URL}/profile/${userId}` : `${API_URL}/profile`;
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });
    return response.json();
  },

  updateProfile: async (profileData: any) => {
    const response = await fetch(`${API_URL}/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify(profileData),
    });
    return response.json();
  },

  uploadAvatar: async (file: File) => {
    const formData = new FormData();
    formData.append('avatar', file);

    const response = await fetch(`${API_URL}/profile/avatar`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      body: formData,
    });
    return response.json();
  },

  getUserActivity: async (userId?: string, page: number = 1, limit: number = 10) => {
    const url = userId 
      ? `${API_URL}/profile/${userId}/activity?page=${page}&limit=${limit}`
      : `${API_URL}/profile/activity?page=${page}&limit=${limit}`;
    
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });
    return response.json();
  },

  getConnections: async (userId?: string) => {
    const url = userId ? `${API_URL}/profile/${userId}/connections` : `${API_URL}/profile/connections`;
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });
    return response.json();
  },

  sendConnectionRequest: async (userId: string) => {
    const response = await fetch(`${API_URL}/connections/request`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify({ user_id: userId }),
    });
    return response.json();
  },

  acceptConnectionRequest: async (requestId: string) => {
    const response = await fetch(`${API_URL}/connections/accept`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify({ request_id: requestId }),
    });
    return response.json();
  },

  rejectConnectionRequest: async (requestId: string) => {
    const response = await fetch(`${API_URL}/connections/reject`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify({ request_id: requestId }),
    });
    return response.json();
  }
}; 