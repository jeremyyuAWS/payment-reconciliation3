import React, { useState } from 'react';
import { User, Mail, Shield, Calendar, Activity, ArrowLeft, Save } from 'lucide-react';

interface UserProfilePageProps {
  onBack: () => void;
}

// Mock user data
const MOCK_USER = {
  id: 'user-1',
  name: 'Jane Smith',
  email: 'jane.smith@example.com',
  role: 'Finance Manager',
  department: 'Finance',
  company: 'Acme Corp',
  permissions: ['view', 'edit', 'approve', 'admin'],
  avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
  lastActive: new Date(),
  joinDate: new Date('2024-01-15'),
  recentActivity: [
    { action: 'Approved reconciliation', timestamp: new Date(Date.now() - 3600000), item: 'INV-1004' },
    { action: 'Updated rules configuration', timestamp: new Date(Date.now() - 86400000), item: 'Fuzzy matching rules' },
    { action: 'Imported new data', timestamp: new Date(Date.now() - 172800000), item: 'March transactions' },
  ]
};

const UserProfilePage: React.FC<UserProfilePageProps> = ({ onBack }) => {
  const [user] = useState(MOCK_USER);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user.name,
    email: user.email,
    department: user.department,
    company: user.company
  });
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, this would call an API to update the user profile
    setIsEditing(false);
  };
  
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };
  
  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      <div className="px-4 py-4 bg-indigo-50 flex justify-between items-center">
        <div className="flex items-center">
          <button onClick={onBack} className="mr-2 text-indigo-600 hover:text-indigo-800">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h2 className="text-lg font-medium text-gray-800">User Profile</h2>
        </div>
        {!isEditing ? (
          <button
            onClick={() => setIsEditing(true)}
            className="inline-flex items-center px-3 py-1.5 border border-indigo-500 text-indigo-500 hover:bg-indigo-50 rounded-md text-sm"
          >
            Edit Profile
          </button>
        ) : (
          <button
            onClick={() => setIsEditing(false)}
            className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-md text-sm"
          >
            Cancel
          </button>
        )}
      </div>
      
      <div className="p-6">
        <div className="flex flex-col md:flex-row">
          <div className="md:w-1/3 text-center mb-6 md:mb-0">
            <div className="flex flex-col items-center">
              <img 
                src={user.avatar} 
                alt={user.name} 
                className="h-32 w-32 rounded-full mb-4 border-4 border-indigo-100"
              />
              <h3 className="text-xl font-semibold text-gray-900">{user.name}</h3>
              <p className="text-gray-500 text-sm">{user.role}</p>
              
              <div className="mt-4 bg-indigo-50 rounded-md px-4 py-2 text-center">
                <p className="text-xs text-gray-500">Member since</p>
                <p className="text-sm font-medium text-gray-700">{formatDate(user.joinDate)}</p>
              </div>
            </div>
          </div>
          
          <div className="md:w-2/3 md:pl-8">
            {isEditing ? (
              <form onSubmit={handleSubmit}>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">Full Name</label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email Address</label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="department" className="block text-sm font-medium text-gray-700">Department</label>
                    <input
                      type="text"
                      id="department"
                      name="department"
                      value={formData.department}
                      onChange={handleInputChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="company" className="block text-sm font-medium text-gray-700">Company</label>
                    <input
                      type="text"
                      id="company"
                      name="company"
                      value={formData.company}
                      onChange={handleInputChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                  </div>
                  
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      <Save className="h-4 w-4 mr-2" />
                      Save Changes
                    </button>
                  </div>
                </div>
              </form>
            ) : (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Profile Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-gray-50 p-3 rounded-md flex items-start">
                      <User className="text-gray-400 h-5 w-5 mt-0.5 mr-3" />
                      <div>
                        <p className="text-xs text-gray-500">Full Name</p>
                        <p className="text-sm font-medium text-gray-900">{user.name}</p>
                      </div>
                    </div>
                    
                    <div className="bg-gray-50 p-3 rounded-md flex items-start">
                      <Mail className="text-gray-400 h-5 w-5 mt-0.5 mr-3" />
                      <div>
                        <p className="text-xs text-gray-500">Email</p>
                        <p className="text-sm font-medium text-gray-900">{user.email}</p>
                      </div>
                    </div>
                    
                    <div className="bg-gray-50 p-3 rounded-md flex items-start">
                      <Shield className="text-gray-400 h-5 w-5 mt-0.5 mr-3" />
                      <div>
                        <p className="text-xs text-gray-500">Role & Department</p>
                        <p className="text-sm font-medium text-gray-900">{user.role}, {user.department}</p>
                      </div>
                    </div>
                    
                    <div className="bg-gray-50 p-3 rounded-md flex items-start">
                      <Calendar className="text-gray-400 h-5 w-5 mt-0.5 mr-3" />
                      <div>
                        <p className="text-xs text-gray-500">Last Active</p>
                        <p className="text-sm font-medium text-gray-900">{formatDate(user.lastActive)}</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Permissions</h3>
                  <div className="flex flex-wrap gap-2">
                    {user.permissions.map(permission => (
                      <span 
                        key={permission}
                        className="px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-xs font-medium"
                      >
                        {permission.charAt(0).toUpperCase() + permission.slice(1)}
                      </span>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Activity</h3>
                  <div className="space-y-4">
                    {user.recentActivity.map((activity, index) => (
                      <div key={index} className="flex">
                        <div className="mr-3 flex-shrink-0">
                          <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center">
                            <Activity className="h-4 w-4 text-indigo-600" />
                          </div>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                          <p className="text-xs text-gray-500">
                            {activity.item} - {activity.timestamp.toLocaleDateString()} at {activity.timestamp.toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfilePage;