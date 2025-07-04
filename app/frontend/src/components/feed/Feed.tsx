import React from 'react';
import { useTheme } from '../../App';

const Feed: React.FC = () => {
  const { theme } = useTheme();
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className={`max-w-2xl w-full p-8 rounded-lg shadow-lg backdrop-blur-md ${theme === 'dark' ? 'bg-gradient-to-br from-indigo-900/80 via-gray-900/80 to-purple-900/80 text-white' : 'bg-gradient-to-br from-pink-200/80 via-yellow-100/80 to-blue-200/80 text-gray-900'}`}>
        <div className="space-y-6">
          {/* Feed content will be implemented here */}
        </div>
      </div>
    </div>
  );
};

export default Feed; 