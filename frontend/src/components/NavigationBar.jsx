import { Brain } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function NavigationBar() {
  const { isLoggedIn, user, logout } = useAuth();

  function handleLogin() {
    // This will be handled by the LoginCard component
    window.location.href = '/';
  }

  function handleLogout() {
    logout();
    window.location.href = '/';
  }

  return (
    <div className="bg-gray-900/95 backdrop-blur-md border-b border-gray-700 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">MetaMind</h1>
              <p className="text-white/60 text-xs">Digital Well-being</p>
            </div>
          </div>

           {/* Buttons */}
           <div className="flex items-center space-x-4">
             {isLoggedIn ? (
               <>
                 <div className="flex items-center space-x-2 px-3 py-2 bg-gray-800 rounded-lg">
                   <span className="text-white text-sm font-medium">{user?.name || 'User'}</span>
                 </div>
                 <button
                   onClick={handleLogout}
                   className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-all duration-200"
                 >
                   Logout
                 </button>
               </>
             ) : (
               <>
                 <button
                   onClick={handleLogin}
                   className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-all duration-200"
                 >
                   Login
                 </button>
                 <button 
                   onClick={handleLogin}
                   className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-lg transition-all duration-200"
                 >
                   Register
                 </button>
               </>
             )}
           </div>
        </div>
      </div>
    </div>
  );
}
