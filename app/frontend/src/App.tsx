import { RouterProvider } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { router } from './routes';
import './index.css';

function App() {
  return (
    <AuthProvider>
      <div className="min-h-screen w-full bg-gradient-to-br from-pink-200 via-yellow-100 to-blue-200 transition-colors duration-500">
      <RouterProvider router={router} />
        </div>
    </AuthProvider>
  );
}

export default App;
