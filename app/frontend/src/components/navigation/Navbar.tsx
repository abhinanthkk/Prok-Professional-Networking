import React, { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Navbar: React.FC = () => {
  const { logout, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo/Brand */}
          <div className="flex items-center space-x-2">
            <span className="text-[#0a66c2] font-bold text-xl">Prok</span>
          </div>

          {/* Navigation Tabs */}
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/feed" className="text-gray-700 hover:text-[#0a66c2] font-medium transition-colors">Home</Link>
            <Link to="/network" className="text-gray-700 hover:text-[#0a66c2] font-medium transition-colors">My Network</Link>
            <Link to="/jobs" className="text-gray-700 hover:text-[#0a66c2] font-medium transition-colors">Jobs</Link>
            <Link to="/messages" className="text-gray-700 hover:text-[#0a66c2] font-medium transition-colors">Messages</Link>
            <Link to="/notifications" className="text-gray-700 hover:text-[#0a66c2] font-medium transition-colors">Notifications</Link>
          </div>

          {/* Profile Dropdown */}
          <div className="relative flex items-center space-x-2">
            <div ref={dropdownRef} className="relative">
              <button
                onClick={() => setDropdownOpen((open) => !open)}
                className="flex items-center space-x-2 focus:outline-none"
              >
                {/* Profile image or fallback */}
                {user && (user.profileImage || user.avatar_url) ? (
                  <img src={user.profileImage || user.avatar_url} className="h-8 w-8 w-8 rounded-full border-2 border-[#0a66c2] object-cover" alt="Profile" />
                ) : user && user.name ? (
                  <span className="h-8 w-8 flex items-center justify-center rounded-full border-2 border-[#0a66c2] bg-blue-100 text-[#0a66c2] font-bold text-lg">
                    {user.name.split(' ').map(n => n[0]).join('').slice(0,2)}
                  </span>
                ) : (
                  <svg className="h-8 w-8 rounded-full border-2 border-[#0a66c2] bg-blue-100 text-[#0a66c2]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                )}
                {/* Show name on desktop */}
                {user && user.name && (
                  <span className="hidden md:inline-block ml-2 font-medium text-gray-900 max-w-xs truncate">{user.name}</span>
                )}
                <svg className="w-4 h-4 text-gray-500 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                  <Link to="/profile" className="block px-4 py-2 text-gray-700 hover:bg-gray-100">View Profile</Link>
                  <Link to="/profile/edit" className="block px-4 py-2 text-gray-700 hover:bg-gray-100">Edit Profile</Link>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-red-600 hover:bg-gray-100"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 