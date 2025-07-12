import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { validatePassword, validatePasswordMatch } from '../profile/validationUtils';

const API_URL = 'http://localhost:5000';

const Signup: React.FC = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [passwordValidation, setPasswordValidation] = useState<{ isValid: boolean; message: string }>({ isValid: false, message: '' });
  const navigate = useNavigate();

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPassword = e.target.value;
    setPassword(newPassword);
    setPasswordValidation(validatePassword(newPassword));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !email || !password || !confirmPassword) {
      setError('All fields are required.');
      return;
    }
    if (!validatePasswordMatch(password, confirmPassword)) {
      setError('Passwords do not match.');
      return;
    }
    if (!passwordValidation.isValid) {
      setError(passwordValidation.message);
      return;
    }
    setError('');
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password, confirm_password: confirmPassword }),
      });
      const data = await response.json();
      if (response.ok && data.access_token) {
        setSuccess('Signed up successfully! Please log in to continue.');
        setTimeout(() => {
          navigate('/login');
        }, 1500);
      } else {
        setError(data.message || 'Signup failed');
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
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-3xl font-bold text-center text-gray-900">Sign Up</h2>
        </div>
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700">Username</label>
            <input
              id="username"
              name="username"
              type="text"
              autoComplete="username"
              value={username}
              onChange={e => setUsername(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-white text-gray-900 border-gray-300"
              required
            />
          </div>
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
              autoComplete="new-password"
              value={password}
              onChange={handlePasswordChange}
              className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-white text-gray-900 ${
                password ? (passwordValidation.isValid ? 'border-green-300' : 'border-red-300') : 'border-gray-300'
              }`}
              required
            />
            {password && (
              <div className={`mt-1 text-sm ${passwordValidation.isValid ? 'text-green-600' : 'text-red-600'}`}>
                {passwordValidation.message}
              </div>
            )}
            <div className="mt-2 text-xs text-gray-500">
              Password must contain:
              <ul className="list-disc list-inside mt-1">
                <li>At least 8 characters</li>
                <li>One uppercase letter (A-Z)</li>
                <li>One lowercase letter (a-z)</li>
                <li>One number (0-9)</li>
                <li>One special character (!@#$%^&*(),.?":{}|&lt;&gt;)</li>
              </ul>
            </div>
          </div>
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">Confirm Password</label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              autoComplete="new-password"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-white text-gray-900 ${
                confirmPassword ? (validatePasswordMatch(password, confirmPassword) ? 'border-green-300' : 'border-red-300') : 'border-gray-300'
              }`}
              required
            />
            {confirmPassword && !validatePasswordMatch(password, confirmPassword) && (
              <div className="mt-1 text-sm text-red-600">Passwords do not match</div>
            )}
          </div>
          {error && <div className="text-red-500 text-sm">{error}</div>}
          {success && <div className="text-green-600 text-sm">{success}</div>}
          <button
            type="submit"
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={loading || !passwordValidation.isValid || !validatePasswordMatch(password, confirmPassword)}
          >
            {loading ? 'Signing up...' : 'Sign Up'}
          </button>
        </form>
        <div className="text-center text-sm mt-4">
          <span className="text-gray-700">Already have an account?</span>{' '}
          <Link
            to="/login"
            className="text-indigo-400 font-semibold transition-colors duration-300 hover:text-pink-400 hover:underline animate-pulse"
            style={{ animationDuration: '1.5s' }}
          >
            Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Signup; 