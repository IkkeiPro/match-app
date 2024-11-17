import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const showHomeButton = location.pathname !== '/home';

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
      {showHomeButton && (
        <button
          onClick={() => navigate('/home')}
          className="fixed top-4 left-4 p-2 rounded-full bg-white shadow-lg hover:shadow-xl transition-all duration-300"
        >
          <Home className="w-6 h-6 text-purple-600" />
        </button>
      )}
      <main className="container mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  );
};