import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const Login: React.FC = () => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier || !password) {
      setError('Both fields are required.');
      return;
    }
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      const res = await fetch('http://127.0.0.1:5000/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, password })
      });
      const data = await res.json();
      if (res.ok && data.token) {
        localStorage.setItem('token', data.token);
        setSuccess('Login successful!');
        setError('');
        // Optionally redirect or update auth context here
      } else {
        setError(data.error || 'Login failed.');
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-fuchsia-600 via-yellow-400 to-cyan-400">
      <div className="max-w-md w-full space-y-8 p-8 bg-white/90 rounded-lg shadow-lg border-2 border-fuchsia-600">
        <h2 className="text-3xl font-extrabold text-center text-fuchsia-700 drop-shadow">Login</h2>
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="identifier" className="block text-sm font-bold text-fuchsia-800">Username or Email</label>
            <input
              id="identifier"
              name="identifier"
              type="text"
              autoComplete="username"
              value={identifier}
              onChange={e => setIdentifier(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border-2 border-fuchsia-400 rounded-md shadow focus:outline-none focus:ring-2 focus:ring-fuchsia-500 focus:border-fuchsia-500 bg-white text-fuchsia-900 placeholder-fuchsia-400"
              placeholder="Enter your username or email"
              required
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-bold text-fuchsia-800">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border-2 border-fuchsia-400 rounded-md shadow focus:outline-none focus:ring-2 focus:ring-fuchsia-500 focus:border-fuchsia-500 bg-white text-fuchsia-900 placeholder-fuchsia-400"
              placeholder="Enter your password"
              required
            />
          </div>
          {error && <div className="text-red-600 text-sm font-bold">{error}</div>}
          {success && <div className="text-green-600 text-sm font-bold">{success}</div>}
          <button
            type="submit"
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow text-sm font-bold text-white bg-gradient-to-r from-fuchsia-600 via-pink-500 to-yellow-400 hover:from-yellow-400 hover:to-fuchsia-600 focus:outline-none focus:ring-2 focus:ring-fuchsia-500 animate-pulse"
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
        <div className="text-center text-sm mt-4">
          <span className="text-fuchsia-800 font-semibold">Don't have an account?</span>{' '}
          <Link
            to="/signup"
            className="text-yellow-500 font-extrabold transition-colors duration-300 hover:text-fuchsia-600 hover:underline animate-bounce"
            style={{ animationDuration: '1.2s' }}
          >
            Sign up
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login; 