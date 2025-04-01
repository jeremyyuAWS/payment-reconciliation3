import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Shield, LogOut, User as UserIcon, Settings, Activity } from 'lucide-react';

interface UserAuthenticationProps {
  onLogout: () => void;
}

// Mock user data for demonstration
const MOCK_USER = {
  id: 'user-1',
  name: 'Jane Smith',
  email: 'jane.smith@example.com',
  role: 'Finance Manager',
  permissions: ['view', 'edit', 'approve', 'admin'],
  avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
  lastActive: new Date()
};

const UserAuthentication: React.FC<UserAuthenticationProps> = ({ onLogout }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [user] = useState(MOCK_USER); // In a real app, this would use context or state management
  const navigate = useNavigate();
  
  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };
  
  const handleLogout = () => {
    // In a real app, this would call an auth service
    onLogout();
  };
  
  const navigateTo = (path: string) => {
    setIsDropdownOpen(false);
    navigate(path);
  };
  
  return (
    <div className="relative">
      <button
        onClick={toggleDropdown}
        className="flex items-center space-x-2 text-gray-200 hover:text-white focus:outline-none"
      >
        <img 
          src={user.avatar} 
          alt={user.name} 
          className="h-8 w-8 rounded-full border-2 border-indigo-400"
        />
        <div className="hidden md:block text-left">
          <p className="text-sm font-semibold">{user.name}</p>
          <p className="text-xs opacity-75">{user.role}</p>
        </div>
      </button>
      
      {isDropdownOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-white rounded-md shadow-lg z-50">
          <div className="p-4 border-b border-gray-100">
            <div className="flex items-center">
              <img 
                src={user.avatar} 
                alt={user.name} 
                className="h-10 w-10 rounded-full mr-3"
              />
              <div>
                <p className="text-sm font-medium text-gray-900">{user.name}</p>
                <p className="text-xs text-gray-500">{user.email}</p>
              </div>
            </div>
          </div>
          
          <div className="py-2">
            <button 
              onClick={() => navigateTo('/profile')}
              className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            >
              <UserIcon className="h-4 w-4 mr-3 text-gray-400" />
              Your Profile
            </button>
            
            <button 
              onClick={() => navigateTo('/account-settings')}
              className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            >
              <Settings className="h-4 w-4 mr-3 text-gray-400" />
              Account Settings
            </button>
            
            <button 
              onClick={() => navigateTo('/activity-log')}
              className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            >
              <Activity className="h-4 w-4 mr-3 text-gray-400" />
              Activity Log
            </button>
            
            {user.permissions.includes('admin') && (
              <button 
                onClick={() => navigateTo('/user-management')}
                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                <Shield className="h-4 w-4 mr-3 text-gray-400" />
                User Management
              </button>
            )}
          </div>
          
          <div className="py-1 border-t border-gray-100">
            <button 
              onClick={handleLogout}
              className="flex items-center w-full px-4 py-2 text-sm text-red-700 hover:bg-red-50"
            >
              <LogOut className="h-4 w-4 mr-3 text-red-400" />
              Sign out
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserAuthentication;