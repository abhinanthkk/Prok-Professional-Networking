import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { profileApi } from '../profile/api';

const API_URL = 'http://localhost:5000';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login: doLogin, setUser } = useAuth();

  // Clear form fields when component mounts
  useEffect(() => {
    setEmail('');
    setPassword('');
    setError('');
  }, []);

  const handleClearForm = () => {
    setEmail('');
    setPassword('');
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Both fields are required.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      if (response.ok && data.access_token) {
        localStorage.setItem('token', data.access_token);
        doLogin(data.access_token);
        // Fetch user profile and set in context
        try {
          const profile = await profileApi.getProfile();
          setUser({
            id: profile.user_id || profile.id,
            name: profile.name || '',
            email: profile.email || '',
            username: profile.username || '',
            avatar_url: profile.avatar_url || ''
          });
        } catch (e) {
          setUser(null);
        }
        navigate('/feed');
      } else {
        setError(data.message || 'Invalid credentials');
      }
    } catch (err) {
      setError('Server error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-200 via-yellow-100 to-blue-200 text-gray-900 transition-colors duration-500">
      <div className="max-w-md w-full space-y-8 p-8 rounded-lg shadow-lg backdrop-blur-md">
        <h2 className="text-3xl font-bold text-center text-gray-900">Login</h2>
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-white text-gray-900 border-gray-300"
              required
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-white text-gray-900 border-gray-300"
              required
            />
          </div>
          {error && <div className="text-red-500 text-sm">{error}</div>}
          <div className="flex space-x-3">
            <button
              type="submit"
              className="flex-1 flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none"
              disabled={loading}
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>
            <button
              type="button"
              onClick={handleClearForm}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
            >
              Clear
            </button>
          </div>
        </form>
        <div className="text-center text-sm mt-4">
          <span className="text-gray-700">Don't have an account?</span>{' '}
          <Link
            to="/signup"
            className="text-indigo-400 font-semibold transition-colors duration-300 hover:text-pink-400 hover:underline animate-pulse"
            style={{ animationDuration: '1.5s' }}
          >
            Sign up
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login; 