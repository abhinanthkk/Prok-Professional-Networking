import { RouterProvider } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { router } from './routes';
import './index.css';
import React, { useState, createContext, useContext } from 'react';

// Theme context for global theme switching
const ThemeContext = createContext<{ theme: string; toggleTheme: () => void }>({ theme: 'light', toggleTheme: () => {} });
export const useTheme = () => useContext(ThemeContext);

function App() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const toggleTheme = () => setTheme(theme === 'light' ? 'dark' : 'light');

  // Vibrant, colorful gradient backgrounds for both themes
  const bgClass = theme === 'dark'
    ? 'bg-gradient-to-br from-purple-900 via-indigo-900 to-gray-900'
    : 'bg-gradient-to-br from-pink-200 via-yellow-100 to-blue-200';

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      <AuthProvider>
        <div className={`min-h-screen w-full ${bgClass} transition-colors duration-500`}>
          {/* Fixed theme toggle button in top-right */}
          <button
            onClick={toggleTheme}
            className={`fixed top-4 right-4 z-50 px-4 py-2 rounded shadow font-semibold border transition-colors duration-300 ${theme === 'dark' ? 'bg-gray-800 text-white border-gray-700 hover:bg-gray-700' : 'bg-white text-gray-900 border-gray-300 hover:bg-gray-100'}`}
          >
            {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
          </button>
          <RouterProvider router={router} />
        </div>
      </AuthProvider>
    </ThemeContext.Provider>
  );
}

export default App;
