import React from 'react';
import { useEffect, useState } from 'react';
import { ProfileHeader } from '../profile/ProfileHeader';
import { UserActivity } from '../profile/UserActivity';
import { mockProfile, mockActivity } from '../profile/mockData';

const Feed: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="max-w-2xl w-full p-8 rounded-lg shadow-lg backdrop-blur-md bg-gradient-to-br from-pink-200/80 via-yellow-100/80 to-blue-200/80 text-gray-900">
        <div className="space-y-6">
          {/* Feed content will be implemented here */}
          <h2 className="text-2xl font-bold text-center">Welcome to your Feed</h2>
          <p className="text-center text-gray-500">Your posts and updates will appear here.</p>
        </div>
      </div>
    </div>
  );
};

export default Feed; 