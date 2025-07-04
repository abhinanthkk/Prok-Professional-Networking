import React, { useState, useEffect } from 'react';
import { ProfileHeader } from './ProfileHeader';
import { ProfileInfo } from './ProfileInfo';
import { UserActivity } from './UserActivity';
import { mockProfile, mockUser, mockActivity } from './mockData';
import type { Profile, User, UserActivity as UserActivityType } from '../../types';
import { useTheme } from '../../App';

const ProfileView: React.FC = () => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [activities, setActivities] = useState<UserActivityType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isOwnProfile, setIsOwnProfile] = useState(true); // For demo purposes
  const { theme } = useTheme();

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // For now, use mock data
        // In production, you would fetch from the API
        setProfile(mockProfile);
        setUser(mockUser);
        setActivities(mockActivity);
        
      } catch (err) {
        setError('Failed to load profile data');
        console.error('Error fetching profile:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfileData();
  }, []);

  const handleEditClick = () => {
    // Navigate to edit profile page
    window.location.href = '/profile/edit';
  };

  const handleLoadMoreActivity = async () => {
    // Simulate loading more activity
    await new Promise(resolve => setTimeout(resolve, 500));
    // In production, you would fetch more activity from the API
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className={`max-w-2xl w-full p-8 rounded-lg shadow-lg backdrop-blur-md ${theme === 'dark' ? 'bg-gradient-to-br from-indigo-900/80 via-gray-900/80 to-purple-900/80 text-white' : 'bg-gradient-to-br from-pink-200/80 via-yellow-100/80 to-blue-200/80 text-gray-900'}`}>
          <div className="animate-pulse space-y-6">
            {/* Header skeleton */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="h-32 bg-gray-200"></div>
              <div className="relative px-6 pb-6">
                <div className="flex justify-center sm:justify-start">
                  <div className="relative -mt-16">
                    <div className="w-32 h-32 bg-gray-200 rounded-full"></div>
                  </div>
                </div>
                <div className="mt-4 space-y-2">
                  <div className="h-6 bg-gray-200 rounded w-1/3"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                </div>
              </div>
            </div>
            
            {/* Content skeleton */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                    <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
                    <div className="space-y-2">
                      <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="space-y-6">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                  <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
                  <div className="space-y-3">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="flex space-x-3">
                        <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                        <div className="flex-1 space-y-2">
                          <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                          <div className="h-2 bg-gray-200 rounded w-1/2"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className={`max-w-2xl w-full p-8 rounded-lg shadow-lg backdrop-blur-md ${theme === 'dark' ? 'bg-gradient-to-br from-indigo-900/80 via-gray-900/80 to-purple-900/80 text-white' : 'bg-gradient-to-br from-pink-200/80 via-yellow-100/80 to-blue-200/80 text-gray-900'}`}>
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <svg className="w-12 h-12 text-red-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="text-lg font-medium text-red-800 mb-2">Error Loading Profile</h3>
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!profile || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className={`max-w-2xl w-full p-8 rounded-lg shadow-lg backdrop-blur-md ${theme === 'dark' ? 'bg-gradient-to-br from-indigo-900/80 via-gray-900/80 to-purple-900/80 text-white' : 'bg-gradient-to-br from-pink-200/80 via-yellow-100/80 to-blue-200/80 text-gray-900'}`}>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
            <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Profile Not Found</h3>
            <p className="text-gray-600">The profile you're looking for doesn't exist or has been removed.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className={`max-w-2xl w-full p-8 rounded-lg shadow-lg backdrop-blur-md ${theme === 'dark' ? 'bg-gradient-to-br from-indigo-900/80 via-gray-900/80 to-purple-900/80 text-white' : 'bg-gradient-to-br from-pink-200/80 via-yellow-100/80 to-blue-200/80 text-gray-900'}`}>
        {/* Profile Header */}
        <div className="mb-6">
          <ProfileHeader
            profile={profile}
            user={user}
            isOwnProfile={isOwnProfile}
            onEditClick={handleEditClick}
          />
        </div>

        {/* Profile Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <ProfileInfo profile={profile} />
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <UserActivity
              activities={activities}
              hasMore={activities.length > 5}
              onLoadMore={handleLoadMoreActivity}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileView; 