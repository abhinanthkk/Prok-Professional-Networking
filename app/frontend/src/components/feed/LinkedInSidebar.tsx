import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import DefaultAvatar from '../ui/DefaultAvatar';
import {
  HomeIcon,
  UserGroupIcon,
  BriefcaseIcon,
  ChatBubbleLeftRightIcon,
  BellIcon,
  BookmarkIcon,
  AcademicCapIcon,
  GlobeAltIcon,
  FireIcon,
  UserPlusIcon
} from '@heroicons/react/24/outline';

const LinkedInSidebar: React.FC = () => {
  const { user: currentUser } = useAuth();

  const navigationItems = [
    { icon: HomeIcon, label: 'Home', path: '/feed', active: true },
    { icon: UserGroupIcon, label: 'My Network', path: '/network' },
    { icon: BriefcaseIcon, label: 'Jobs', path: '/jobs' },
    { icon: ChatBubbleLeftRightIcon, label: 'Messaging', path: '/messages' },
    { icon: BellIcon, label: 'Notifications', path: '/notifications' },
  ];

  const quickActions = [
    { icon: BookmarkIcon, label: 'My Items', path: '/bookmarks' },
    { icon: AcademicCapIcon, label: 'Learning', path: '/learning' },
    { icon: GlobeAltIcon, label: 'Groups', path: '/groups' },
  ];

  const trendingTopics = [
    { topic: 'Artificial Intelligence', posts: '2.3k posts' },
    { topic: 'Remote Work', posts: '1.8k posts' },
    { topic: 'Career Growth', posts: '1.5k posts' },
    { topic: 'Tech Industry', posts: '1.2k posts' },
    { topic: 'Professional Development', posts: '980 posts' },
  ];

  const suggestedConnections = [
    { name: 'Sarah Johnson', title: 'Senior Product Manager', avatar: null },
    { name: 'Mike Chen', title: 'Software Engineer', avatar: null },
    { name: 'Emily Davis', title: 'UX Designer', avatar: null },
    { name: 'Alex Rodriguez', title: 'Marketing Director', avatar: null },
  ];

  return (
    <div className="w-80 bg-white border-r border-gray-200 h-screen overflow-y-auto">
      {/* User Profile Section */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          {currentUser?.avatar_url ? (
            <img
              src={currentUser.avatar_url}
              alt={currentUser.name}
              className="w-12 h-12 rounded-full object-cover border border-gray-200"
            />
          ) : (
            <DefaultAvatar name={currentUser?.name || 'You'} size="lg" />
          )}
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-gray-900 truncate">
              {currentUser?.name || 'Your Name'}
            </div>
            <div className="text-sm text-gray-500 truncate">
              {currentUser?.username || 'Your Username'}
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="p-4">
        <nav className="space-y-1">
          {navigationItems.map((item) => (
            <Link
              key={item.label}
              to={item.path}
              className={`flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                item.active
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>
      </div>

      {/* Quick Actions */}
      <div className="p-4 border-t border-gray-100">
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
          Quick Actions
        </h3>
        <nav className="space-y-1">
          {quickActions.map((item) => (
            <Link
              key={item.label}
              to={item.path}
              className="flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <item.icon className="w-5 h-5" />
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>
      </div>

      {/* Trending Topics */}
      <div className="p-4 border-t border-gray-100">
        <div className="flex items-center space-x-2 mb-3">
          <FireIcon className="w-4 h-4 text-orange-500" />
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Trending Topics
          </h3>
        </div>
        <div className="space-y-3">
          {trendingTopics.map((topic, index) => (
            <div key={index} className="group cursor-pointer">
              <div className="text-sm font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
                #{topic.topic}
              </div>
              <div className="text-xs text-gray-500">{topic.posts}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Suggested Connections */}
      <div className="p-4 border-t border-gray-100">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Suggested Connections
          </h3>
          <Link to="/network" className="text-xs text-blue-600 hover:text-blue-700">
            See all
          </Link>
        </div>
        <div className="space-y-3">
          {suggestedConnections.map((connection, index) => (
            <div key={index} className="flex items-center space-x-3">
              {connection.avatar ? (
                <img
                  src={connection.avatar}
                  alt={connection.name}
                  className="w-8 h-8 rounded-full object-cover"
                />
              ) : (
                <DefaultAvatar name={connection.name} size="sm" />
              )}
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-gray-900 truncate">
                  {connection.name}
                </div>
                <div className="text-xs text-gray-500 truncate">
                  {connection.title}
                </div>
              </div>
              <button className="p-1 rounded-full hover:bg-gray-100 transition-colors">
                <UserPlusIcon className="w-4 h-4 text-gray-500" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-100 mt-auto">
        <div className="text-xs text-gray-500 space-y-2">
          <div className="flex flex-wrap gap-2">
            <Link to="/about" className="hover:text-gray-700">About</Link>
            <Link to="/privacy" className="hover:text-gray-700">Privacy</Link>
            <Link to="/terms" className="hover:text-gray-700">Terms</Link>
            <Link to="/help" className="hover:text-gray-700">Help</Link>
          </div>
          <div>© 2024 Prok Professional Network</div>
        </div>
      </div>
    </div>
  );
};

export default LinkedInSidebar; 