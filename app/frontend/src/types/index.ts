export interface User {
  id: number;
  email: string;
  username: string;
  name: string;
  created_at: string;
}

export interface Profile {
  id: number;
  user_id: number;
  bio: string;
  location: string;
  title: string;
  skills: string[];
  experience: Experience[];
  education: Education[];
  social_links: SocialLinks;
  avatar_url?: string;
  connections_count: number;
  mutual_connections: number;
}

export interface SocialLinks {
  linkedin?: string;
  twitter?: string;
  github?: string;
  website?: string;
}

export interface Experience {
  id: number;
  title: string;
  company: string;
  start_date: string;
  end_date?: string;
  description: string;
  current: boolean;
}

export interface Education {
  id: number;
  school: string;
  degree: string;
  field: string;
  start_date: string;
  end_date?: string;
  current: boolean;
}

export interface UserActivity {
  id: number;
  type: 'post' | 'comment' | 'like' | 'connection';
  content: string;
  created_at: string;
  related_user?: User;
  related_post?: Post;
}

export interface ProfileFormData {
  username: string;
  email: string;
  name: string;
  title: string;
  bio: string;
  location: string;
  skills: string[];
  experience: Experience[];
  education: Education[];
  social_links: SocialLinks;
  avatar_url?: string;
}

export interface FormValidation {
  [key: string]: {
    isValid: boolean;
    message: string;
  };
}

export interface Post {
  id: number;
  user_id: number;
  content: string;
  title?: string;
  media_url?: string;
  is_public: boolean;
  allow_comments: boolean;
  created_at: string;
  updated_at: string;
  likes: number;
  comments: Comment[];
  user: {
    id: number;
    name: string;
    username: string;
    avatar_url?: string;
    title?: string;
    location?: string;
  };
  tags?: string[];
  category?: string;
}

export interface Comment {
  id: number;
  user_id: number;
  content: string;
  created_at: string;
}

export interface Job {
  id: number;
  title: string;
  company: string;
  location: string;
  description: string;
  requirements: string[];
  created_at: string;
}

export interface Message {
  id: number;
  sender_id: number;
  receiver_id: number;
  content: string;
  created_at: string;
  read: boolean;
} 