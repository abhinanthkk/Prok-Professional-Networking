import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ProfileHeader } from './ProfileHeader';
import { ProfileInfo } from './ProfileInfo';
import { UserActivity } from './UserActivity';
import { mockActivity } from './mockData';
import type { Profile, User, UserActivity as UserActivityType } from '../../types';
import { profileApi } from './api';
import { useAuth } from '../../context/AuthContext';

const ProfileView: React.FC = () => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [activities, setActivities] = useState<UserActivityType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isOwnProfile, setIsOwnProfile] = useState(true);
  const { token } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Fetch profile data from API
        const response = await profileApi.getProfile();
        console.log('API profile response:', response);
        
        if (response.error) {
          if (response.error === 'Profile not found') {
            window.location.href = '/profile/edit';
            return;
          }
          setError(response.error);
          return;
        }

        // Transform API response to Profile type
        const profileData: Profile = {
          id: response.id,
          user_id: response.user_id || 0,
          bio: response.bio || '',
          location: response.location || '',
          title: response.title || '',
          skills: Array.isArray(response.skills) ? (response.skills.map((s: any) => typeof s === 'string' ? s : s.name)) : [],
          experience: Array.isArray(response.experience) ? response.experience : [],
          education: Array.isArray(response.education) ? response.education : [],
          social_links: {
            linkedin: response.linkedin || '',
            twitter: response.twitter || '',
            github: response.github || '',
            website: response.website || ''
          },
          avatar_url: response.avatar_url,
          connections_count: 0,
          mutual_connections: 0
        };
        console.log('Raw API response:', response);
        console.log('Mapped profile data:', profileData);
        console.log('Social links:', profileData.social_links);

        // Create user object from profile data
        const userData: User = {
          id: response.user_id || response.id,
          email: response.email || '',
          username: response.username || '',
          name: response.name || '',
          created_at: response.created_at || new Date().toISOString()
        };
        
        setProfile(profileData);
        setUser(userData);
        setActivities(mockActivity); // Keep mock activity for now
        
      } catch (err) {
        setError('Failed to load profile data');
        console.error('Error fetching profile:', err);
      } finally {
        setIsLoading(false);
      }
    };

    if (token) {
    fetchProfileData();
    } else {
      setError('Please login to view profile');
      setIsLoading(false);
    }
  }, [token]);

  const handleEditClick = () => {
    navigate('/profile/edit');
  };

  const handleLoadMoreActivity = async () => {
    await new Promise(resolve => setTimeout(resolve, 500));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto py-8 px-4">
          <div className="animate-pulse space-y-6">
            {/* Header skeleton */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="h-48 bg-gray-200"></div>
              <div className="relative px-6 pb-6">
                <div className="flex justify-center sm:justify-start">
                  <div className="relative -mt-20">
                    <div className="w-40 h-40 bg-gray-200 rounded-full"></div>
                  </div>
                </div>
                <div className="mt-4 space-y-2">
                  <div className="h-8 bg-gray-200 rounded w-1/3"></div>
                  <div className="h-6 bg-gray-200 rounded w-1/4"></div>
                </div>
              </div>
            </div>
            
            {/* Content skeleton */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
                    <div className="space-y-3">
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                      <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="space-y-6">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
                  <div className="space-y-3">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="flex space-x-3">
                        <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                        <div className="flex-1 space-y-2">
                          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full p-8">
          <div className="bg-white border border-red-200 rounded-lg p-6 text-center">
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full p-8">
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
    <div className="min-h-screen flex flex-col lg:flex-row bg-white text-gray-900 transition-colors duration-500">
      {/* Left Sidebar */}
      <aside className="hidden lg:block w-full max-w-xs p-4 bg-white border-r border-gray-100 shadow-sm">
        <ProfileHeader profile={profile} user={user} isOwnProfile={isOwnProfile} onEditClick={handleEditClick} />
      </aside>

      {/* Main Content */}
      <main className="flex-1 max-w-2xl mx-auto p-4 space-y-6">
        <ProfileInfo profile={profile} />
        {/* Recommendations Card */}
        <div className="bg-white rounded-xl shadow p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Recommendations</h3>
          <p className="text-gray-600">No recommendations yet.</p>
        </div>
        {/* Connections Preview Card */}
        <div className="bg-white rounded-xl shadow p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Connections</h3>
          <p className="text-gray-600">Connections preview coming soon.</p>
          </div>
      </main>

      {/* Right Sidebar */}
      <aside className="hidden xl:block w-80 p-4 bg-white border-l border-gray-100 shadow-sm">
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">People you may know</h3>
          <ul className="space-y-4">
            {/* Example suggestion */}
            <li className="flex items-center">
              <img src="https://ui-avatars.com/api/?name=John+Smith" className="h-10 w-10 rounded-full mr-3" alt="John Smith" />
              <div>
                <p className="font-medium text-gray-800">John Smith</p>
                <p className="text-gray-500 text-xs">Product Manager</p>
          </div>
              <button className="ml-auto bg-[#0a66c2] text-white px-3 py-1 rounded-full text-xs">Connect</button>
            </li>
            {/* Add more suggestions here */}
          </ul>
        </div>
        <div>
          <h4 className="text-md font-semibold text-gray-900 mb-2">Job Alerts</h4>
          <div className="bg-[#eaf4fb] rounded-lg p-3 text-[#0a66c2]">3 new jobs for you</div>
      </div>
      </aside>
    </div>
  );
};

export default ProfileView; 