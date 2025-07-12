import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { validatePassword, validatePasswordMatch } from '../profile/validationUtils';
import { api } from '../../services/api';

const ChangePassword: React.FC = () => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [passwordValidation, setPasswordValidation] = useState<{ isValid: boolean; message: string }>({ isValid: false, message: '' });
  const navigate = useNavigate();

  const handleNewPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPasswordValue = e.target.value;
    setNewPassword(newPasswordValue);
    setPasswordValidation(validatePassword(newPasswordValue));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword || !confirmPassword) {
      setError('All fields are required.');
      return;
    }
    if (!passwordValidation.isValid) {
      setError(passwordValidation.message);
      return;
    }
    if (!validatePasswordMatch(newPassword, confirmPassword)) {
      setError('New passwords do not match.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const response = await api.changePassword({
        current_password: currentPassword,
        new_password: newPassword,
        confirm_password: confirmPassword
      });
      
      if (response.message) {
        setSuccess('Password changed successfully!');
        setTimeout(() => {
          navigate('/profile');
        }, 1500);
      } else {
        setError('Failed to change password');
      }
    } catch (err: any) {
      setError(err.message || 'Server error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-200 via-yellow-100 to-blue-200 text-gray-900 transition-colors duration-500">
      <div className="max-w-md w-full space-y-8 p-8 rounded-lg shadow-lg backdrop-blur-md">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-3xl font-bold text-center text-gray-900">Change Password</h2>
        </div>
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700">Current Password</label>
            <input
              id="currentPassword"
              name="currentPassword"
              type="password"
              autoComplete="current-password"
              value={currentPassword}
              onChange={e => setCurrentPassword(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-white text-gray-900 border-gray-300"
              required
            />
          </div>
          <div>
            <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">New Password</label>
            <input
              id="newPassword"
              name="newPassword"
              type="password"
              autoComplete="new-password"
              value={newPassword}
              onChange={handleNewPasswordChange}
              className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-white text-gray-900 ${
                newPassword ? (passwordValidation.isValid ? 'border-green-300' : 'border-red-300') : 'border-gray-300'
              }`}
              required
            />
            {newPassword && (
              <div className={`mt-1 text-sm ${passwordValidation.isValid ? 'text-green-600' : 'text-red-600'}`}>
                {passwordValidation.message}
              </div>
            )}
            <div className="mt-2 text-xs text-gray-500">
              New password must contain:
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
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">Confirm New Password</label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              autoComplete="new-password"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-white text-gray-900 ${
                confirmPassword ? (validatePasswordMatch(newPassword, confirmPassword) ? 'border-green-300' : 'border-red-300') : 'border-gray-300'
              }`}
              required
            />
            {confirmPassword && !validatePasswordMatch(newPassword, confirmPassword) && (
              <div className="mt-1 text-sm text-red-600">Passwords do not match</div>
            )}
          </div>
          {error && <div className="text-red-500 text-sm">{error}</div>}
          {success && <div className="text-green-600 text-sm">{success}</div>}
          <div className="flex space-x-4">
            <button
              type="button"
              onClick={() => navigate('/profile')}
              className="flex-1 py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading || !passwordValidation.isValid || !validatePasswordMatch(newPassword, confirmPassword)}
            >
              {loading ? 'Changing...' : 'Change Password'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChangePassword; 