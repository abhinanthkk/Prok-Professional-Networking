import { createBrowserRouter } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import Login from '../components/auth/Login';
import Signup from '../components/auth/Signup';
import ProfileView from '../components/profile/ProfileView';
import ProfileEdit from '../components/profile/ProfileEdit';
import PostCreate from '../components/posts/PostCreate';
import PostList from '../components/posts/PostList';
import Feed from '../components/feed/Feed';
import JobList from '../components/job-board/JobList';
import MessageList from '../components/messaging/MessageList';
import NotFound from '../components/NotFound';
import PostDetail from '../components/posts/PostDetail';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Login />,
  },
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/signup',
    element: <Signup />,
  },
  {
    path: '/',
    element: <Layout />,
    children: [
      {
        path: 'profile',
    element: <ProfileView />,
  },
  {
        path: 'profile/edit',
    element: <ProfileEdit />,
  },
  {
        path: 'posts/create',
    element: <PostCreate />,
  },
  {
        path: 'posts',
    element: <PostList />,
  },
  {
        path: 'create-post',
        element: <PostCreate />,
      },
  {
        path: 'feed',
        element: <Feed />,
      },
      {
        path: 'jobs',
    element: <JobList />,
  },
  {
        path: 'messages',
    element: <MessageList />,
      },
      {
        path: 'posts/:id',
        element: <PostDetail />,
      },
      {
        path: '*',
        element: <NotFound />,
      },
    ],
  },
]); 