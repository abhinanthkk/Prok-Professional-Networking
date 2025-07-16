import type { Profile, UserActivity, ProfileFormData, User } from '../../types';

export const mockProfile: Profile = {
  id: 1,
  user_id: 1,
  bio: "Passionate software engineer with 5+ years of experience in full-stack development. I love building scalable applications and contributing to open-source projects. Always eager to learn new technologies and solve complex problems.",
  location: "San Francisco, CA",
  title: "Senior Software Engineer",
  skills: ["React", "TypeScript", "Node.js", "Python", "AWS", "Docker", "PostgreSQL", "MongoDB"],
  experience: [
    {
      id: 1,
      title: "Senior Software Engineer",
      company: "TechCorp Inc.",
      start_date: "2022-01-01",
      end_date: undefined,
      description: "Leading development of microservices architecture and mentoring junior developers.",
      current: true
    },
    {
      id: 2,
      title: "Software Engineer",
      company: "StartupXYZ",
      start_date: "2020-03-01",
      end_date: "2021-12-31",
      description: "Built and maintained React-based frontend applications and REST APIs.",
      current: false
    },
    {
      id: 3,
      title: "Junior Developer",
      company: "Digital Solutions",
      start_date: "2019-06-01",
      end_date: "2020-02-28",
      description: "Developed web applications using JavaScript and Python.",
      current: false
    }
  ],
  education: [
    {
      id: 1,
      school: "Stanford University",
      degree: "Master of Science",
      field: "Computer Science",
      start_date: "2017-09-01",
      end_date: "2019-05-31",
      current: false
    },
    {
      id: 2,
      school: "University of California, Berkeley",
      degree: "Bachelor of Science",
      field: "Computer Science",
      start_date: "2013-09-01",
      end_date: "2017-05-31",
      current: false
    }
  ],
  social_links: {
    linkedin: "https://linkedin.com/in/johndoe",
    twitter: "https://twitter.com/johndoe",
    github: "https://github.com/johndoe",
    website: "https://johndoe.dev"
  },
  avatar_url: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
  connections_count: 342,
  mutual_connections: 15
};

export const mockUser: User = {
  id: 1,
  email: "john.doe@example.com",
  username: "johndoe",
  name: "John Doe",
  created_at: "2023-01-15T10:30:00Z"
};

export const mockActivity: UserActivity[] = [
  {
    id: 1,
    type: "post",
    content: "Just published a new article about React performance optimization techniques. Check it out!",
    created_at: "2024-01-15T14:30:00Z",
          related_post: {
        id: 1,
        user_id: 1,
        content: "Just published a new article about React performance optimization techniques. Check it out!",
        title: "React Performance Optimization",
        media_url: undefined,
        is_public: true,
        allow_comments: true,
        created_at: "2024-01-15T14:30:00Z",
        updated_at: "2024-01-15T14:30:00Z",
        likes: 24,
        comments: [],
        user: {
          id: 1,
          name: "John Doe",
          username: "johndoe",
          avatar_url: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
          title: "Senior Software Engineer",
          location: "San Francisco, CA"
        },
        tags: [],
        category: undefined
      } as any
  },
  {
    id: 2,
    type: "comment",
    content: "Great insights on microservices architecture!",
    created_at: "2024-01-14T16:45:00Z",
    related_user: {
      id: 2,
      email: "jane.smith@example.com",
      username: "janesmith",
      name: "Jane Smith",
      created_at: "2023-02-20T09:15:00Z"
    }
  },
  {
    id: 3,
    type: "connection",
    content: "Connected with Sarah Johnson",
    created_at: "2024-01-13T11:20:00Z",
    related_user: {
      id: 3,
      email: "sarah.johnson@example.com",
      username: "sarahjohnson",
      name: "Sarah Johnson",
      created_at: "2023-03-10T14:22:00Z"
    }
  },
  {
    id: 4,
    type: "like",
    content: "Liked a post about AI in software development",
    created_at: "2024-01-12T09:15:00Z"
  }
];

export const mockProfileFormData: ProfileFormData = {
  username: "johndoe",
  email: "john.doe@example.com",
  name: "John Doe",
  title: "Senior Software Engineer",
  bio: "Passionate software engineer with 5+ years of experience in full-stack development. I love building scalable applications and contributing to open-source projects. Always eager to learn new technologies and solve complex problems.",
  location: "San Francisco, CA",
  skills: ["React", "TypeScript", "Node.js", "Python", "AWS", "Docker", "PostgreSQL", "MongoDB"],
  experience: [
    {
      id: 1,
      title: "Senior Software Engineer",
      company: "TechCorp Inc.",
      start_date: "2022-01-01",
      end_date: undefined,
      description: "Leading development of microservices architecture and mentoring junior developers.",
      current: true
    }
  ],
  education: [
    {
      id: 1,
      school: "Stanford University",
      degree: "Master of Science",
      field: "Computer Science",
      start_date: "2017-09-01",
      end_date: "2019-05-31",
      current: false
    }
  ],
  social_links: {
    linkedin: "https://linkedin.com/in/johndoe",
    twitter: "https://twitter.com/johndoe",
    github: "https://github.com/johndoe",
    website: "https://johndoe.dev"
  },
  avatar_url: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face"
};

export const validationRules: Record<string, {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  message: string;
}> = {
  username: {
    required: true,
    minLength: 3,
    maxLength: 20,
    pattern: /^[a-zA-Z0-9_]+$/,
    message: "Username must be 3-20 characters long and contain only letters, numbers, and underscores"
  },
  email: {
    required: true,
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    message: "Please enter a valid email address"
  },
  name: {
    required: true,
    minLength: 2,
    maxLength: 50,
    message: "Name must be 2-50 characters long"
  },
  title: {
    required: true,
    maxLength: 100,
    message: "Title must be less than 100 characters"
  },
  bio: {
    maxLength: 500,
    message: "Bio must be less than 500 characters"
  },
  location: {
    maxLength: 100,
    message: "Location must be less than 100 characters"
  }
}; 