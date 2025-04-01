import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Activity, Settings, BarChart2, PieChart } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser, logout } = useAuth();

  const getActivePage = () => {
    switch (location.pathname) {
      case '/analytics':
        return 'analytics';
      case '/performance':
        return 'performance';
      case '/testing':
        return 'testing';
      default:
        return 'dashboard';
    }
  };

  const handleNavigation = (page: string) => {
    switch (page) {
      case 'analytics':
        navigate('/analytics');
        break;
      case 'performance':
        navigate('/performance');
        break;
      case 'testing':
        navigate('/testing');
        break;
      default:
        navigate('/');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-indigo-700 text-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <PieChart className="h-8 w-8" />
            <div>
              <h1 className="text-2xl font-bold">Payment Reconciliation Agent</h1>
              <p className="text-indigo-100 text-sm">AI-powered financial transaction matching</p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <nav className="hidden md:flex space-x-1">
              <button
                onClick={() => handleNavigation('dashboard')}
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  getActivePage() === 'dashboard' 
                    ? 'bg-indigo-800 text-white' 
                    : 'text-indigo-100 hover:bg-indigo-600'
                }`}
              >
                Dashboard
              </button>

              <button
                onClick={() => handleNavigation('performance')}
                className={`performance-button px-3 py-2 rounded-md text-sm font-medium ${
                  getActivePage() === 'performance' 
                    ? 'bg-indigo-800 text-white' 
                    : 'text-indigo-100 hover:bg-indigo-600'
                }`}
              >
                <span className="flex items-center">
                  <Settings className="h-4 w-4 mr-1.5" />
                  Performance
                </span>
              </button>

              <button
                onClick={() => handleNavigation('testing')}
                className={`testing-button px-3 py-2 rounded-md text-sm font-medium ${
                  getActivePage() === 'testing' 
                    ? 'bg-indigo-800 text-white' 
                    : 'text-indigo-100 hover:bg-indigo-600'
                }`}
              >
                <span className="flex items-center">
                  <Activity className="h-4 w-4 mr-1.5" />
                  Testing
                </span>
              </button>

              <button
                onClick={() => handleNavigation('analytics')}
                className={`advanced-analytics-button px-3 py-2 rounded-md text-sm font-medium ${
                  getActivePage() === 'analytics' 
                    ? 'bg-indigo-800 text-white' 
                    : 'text-indigo-100 hover:bg-indigo-600'
                }`}
              >
                <span className="flex items-center">
                  <BarChart2 className="h-4 w-4 mr-1.5" />
                  Analytics
                </span>
              </button>
            </nav>

            {currentUser && (
              <button
                onClick={logout}
                className="px-3 py-2 border border-indigo-500 rounded text-indigo-100 hover:bg-indigo-600 transition-colors"
              >
                Logout
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
};

export default MainLayout;