import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const Signup: React.FC = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !email || !password || !confirmPassword) {
      setError('All fields are required.');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      const res = await fetch('http://127.0.0.1:5000/api/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password })
      });
      const data = await res.json();
      if (res.ok && data.message) {
        setSuccess('Signup successful! You can now log in.');
        setError('');
        setUsername('');
        setEmail('');
        setPassword('');
        setConfirmPassword('');
      } else {
        setError(data.error || 'Signup failed.');
        setSuccess('');
      }
    } catch (err) {
      setError('Network error. Please try again.');
      setSuccess('');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-cyan-400 via-yellow-400 to-fuchsia-600">
      <div className="max-w-md w-full space-y-8 p-8 bg-white/90 rounded-lg shadow-lg border-2 border-cyan-500">
        <h2 className="text-3xl font-extrabold text-center text-cyan-700 drop-shadow">Sign Up</h2>
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="username" className="block text-sm font-bold text-cyan-800">Username</label>
            <input
              id="username"
              name="username"
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border-2 border-cyan-400 rounded-md shadow focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 bg-white text-cyan-900 placeholder-cyan-400"
              required
            />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-bold text-cyan-800">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border-2 border-cyan-400 rounded-md shadow focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 bg-white text-cyan-900 placeholder-cyan-400"
              required
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-bold text-cyan-800">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border-2 border-cyan-400 rounded-md shadow focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 bg-white text-cyan-900 placeholder-cyan-400"
              required
            />
          </div>
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-bold text-cyan-800">Confirm Password</label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border-2 border-cyan-400 rounded-md shadow focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 bg-white text-cyan-900 placeholder-cyan-400"
              required
            />
          </div>
          {error && <div className="text-red-600 text-sm font-bold">{error}</div>}
          {success && <div className="text-green-600 text-sm font-bold">{success}</div>}
          <button
            type="submit"
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow text-sm font-bold text-white bg-gradient-to-r from-cyan-500 via-yellow-400 to-fuchsia-600 hover:from-fuchsia-600 hover:to-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 animate-pulse"
            disabled={loading}
          >
            {loading ? 'Signing up...' : 'Sign Up'}
          </button>
        </form>
        <div className="text-center text-sm mt-4">
          <span className="text-cyan-800 font-semibold">Already have an account?</span>{' '}
          <Link
            to="/login"
            className="text-fuchsia-600 font-extrabold transition-colors duration-300 hover:text-cyan-500 hover:underline animate-bounce"
            style={{ animationDuration: '1.2s' }}
          >
            Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Signup; 