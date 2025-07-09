const API_URL = 'http://localhost:5000';

// Helper function to handle API responses
const handleResponse = async (response: Response) => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
  }
  return response.json();
};

// Helper function to get auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
};

export const api = {
  // Auth endpoints
  login: async (credentials: { email: string; password: string }) => {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });
    return handleResponse(response);
  },

  signup: async (userData: { email: string; password: string; username: string; confirm_password: string }) => {
    const response = await fetch(`${API_URL}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });
    return handleResponse(response);
  },

  // Profile endpoints
  getProfile: async () => {
    const response = await fetch(`${API_URL}/api/profile`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  updateProfile: async (profileData: any) => {
    const response = await fetch(`${API_URL}/api/profile`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(profileData),
    });
    return handleResponse(response);
  },

  uploadProfileImage: async (file: File) => {
    const formData = new FormData();
    formData.append('image', file);
    
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/api/profile/image`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });
    return handleResponse(response);
  },

  // Posts endpoints
  createPost: async (content: string) => {
    const response = await fetch(`${API_URL}/posts`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ content }),
    });
    return handleResponse(response);
  },

  getPosts: async (page: number = 1, per_page: number = 10) => {
    const response = await fetch(`${API_URL}/posts?page=${page}&per_page=${per_page}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  likePost: async (postId: number) => {
    const response = await fetch(`${API_URL}/posts/${postId}/like`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  // Feed endpoints
  getFeed: async (page: number = 1, per_page: number = 10) => {
    const response = await fetch(`${API_URL}/feed?page=${page}&per_page=${per_page}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  getUserFeed: async (userId: number, page: number = 1, per_page: number = 10) => {
    const response = await fetch(`${API_URL}/feed/user/${userId}?page=${page}&per_page=${per_page}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  // Jobs endpoints
  getJobs: async (page: number = 1, per_page: number = 10) => {
    const response = await fetch(`${API_URL}/jobs?page=${page}&per_page=${per_page}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  getJob: async (jobId: number) => {
    const response = await fetch(`${API_URL}/jobs/${jobId}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  applyForJob: async (jobId: number, coverLetter?: string) => {
    const response = await fetch(`${API_URL}/jobs/${jobId}/apply`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ cover_letter: coverLetter }),
    });
    return handleResponse(response);
  },

  createJob: async (jobData: any) => {
    const response = await fetch(`${API_URL}/jobs`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(jobData),
    });
    return handleResponse(response);
  },

  // Messaging endpoints
  getConversations: async () => {
    const response = await fetch(`${API_URL}/messages/conversations`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  getMessages: async (conversationId: number) => {
    const response = await fetch(`${API_URL}/messages/${conversationId}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  sendMessage: async (conversationId: number, content: string) => {
    const response = await fetch(`${API_URL}/messages/${conversationId}`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ content }),
    });
    return handleResponse(response);
  },

  createConversation: async (userId: number) => {
    const response = await fetch(`${API_URL}/messages/conversations`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ user_id: userId }),
    });
    return handleResponse(response);
  },
}; 