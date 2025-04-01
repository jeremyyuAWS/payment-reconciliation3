import React, { useState } from 'react';
import { ArrowLeft, UserPlus, Edit, Trash2, Search, Shield, AlertCircle, CheckCircle } from 'lucide-react';

interface UserManagementPageProps {
  onBack: () => void;
}

// Mock user data
const MOCK_USERS = [
  {
    id: 'user-1',
    name: 'Jane Smith',
    email: 'jane.smith@example.com',
    role: 'Finance Manager',
    department: 'Finance',
    status: 'active',
    permissions: ['view', 'edit', 'approve', 'admin'],
    avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
    lastActive: new Date(Date.now() - 3600000) // 1 hour ago
  },
  {
    id: 'user-2',
    name: 'John Doe',
    email: 'john.doe@example.com',
    role: 'Finance Analyst',
    department: 'Finance',
    status: 'active',
    permissions: ['view', 'edit'],
    avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
    lastActive: new Date(Date.now() - 86400000) // 1 day ago
  },
  {
    id: 'user-3',
    name: 'Alex Johnson',
    email: 'alex.johnson@example.com',
    role: 'Accountant',
    department: 'Accounting',
    status: 'active',
    permissions: ['view', 'edit', 'approve'],
    avatar: 'https://randomuser.me/api/portraits/women/68.jpg',
    lastActive: new Date(Date.now() - 259200000) // 3 days ago
  },
  {
    id: 'user-4',
    name: 'Sarah Williams',
    email: 'sarah.williams@example.com',
    role: 'CFO',
    department: 'Executive',
    status: 'active',
    permissions: ['view', 'edit', 'approve', 'admin'],
    avatar: 'https://randomuser.me/api/portraits/women/17.jpg',
    lastActive: new Date(Date.now() - 432000000) // 5 days ago
  },
  {
    id: 'user-5',
    name: 'Michael Brown',
    email: 'michael.brown@example.com',
    role: 'IT Administrator',
    department: 'IT',
    status: 'inactive',
    permissions: ['view', 'admin'],
    avatar: 'https://randomuser.me/api/portraits/men/52.jpg',
    lastActive: new Date(Date.now() - 1209600000) // 14 days ago
  }
];

const UserManagementPage: React.FC<UserManagementPageProps> = ({ onBack }) => {
  const [users, setUsers] = useState(MOCK_USERS);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState('');
  const [showInactive, setShowInactive] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  
  // Filter users based on search query and filters
  const filteredUsers = users.filter(user => {
    // Filter by search query
    if (searchQuery && !(
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.department.toLowerCase().includes(searchQuery.toLowerCase())
    )) {
      return false;
    }
    
    // Filter by role
    if (selectedRole && user.role !== selectedRole) {
      return false;
    }
    
    // Filter by status
    if (!showInactive && user.status === 'inactive') {
      return false;
    }
    
    return true;
  });
  
  // Get unique roles for filter options
  const roles = Array.from(new Set(users.map(user => user.role)));
  
  // Format relative time
  const getRelativeTime = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffSecs / 60);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffSecs < 60) {
      return 'Just now';
    } else if (diffMins < 60) {
      return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`;
    } else if (diffHours < 24) {
      return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    } else {
      return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
    }
  };
  
  const handleDeleteUser = (userId: string) => {
    setUsers(users.filter(user => user.id !== userId));
    setShowDeleteConfirm(null);
  };
  
  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      <div className="px-4 py-4 bg-indigo-50 flex justify-between items-center">
        <div className="flex items-center">
          <button onClick={onBack} className="mr-2 text-indigo-600 hover:text-indigo-800">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h2 className="text-lg font-medium text-gray-800">User Management</h2>
        </div>
        <button
          className="inline-flex items-center px-3 py-1.5 border border-transparent bg-indigo-600 text-white hover:bg-indigo-700 rounded-md text-sm font-medium"
        >
          <UserPlus className="h-4 w-4 mr-1.5" />
          Add User
        </button>
      </div>
      
      <div className="p-4">
        <div className="mb-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="relative flex-grow">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search users..."
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
          
          <div className="flex flex-col md:flex-row gap-4">
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
            >
              <option value="">All Roles</option>
              {roles.map(role => (
                <option key={role} value={role}>{role}</option>
              ))}
            </select>
            
            <div className="flex items-center">
              <input
                id="show-inactive"
                type="checkbox"
                checked={showInactive}
                onChange={(e) => setShowInactive(e.target.checked)}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
              <label htmlFor="show-inactive" className="ml-2 text-sm text-gray-700">
                Show inactive users
              </label>
            </div>
          </div>
        </div>
        
        <div className="overflow-hidden border border-gray-200 rounded-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Permissions
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Active
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsers.map((user) => (
                <tr key={user.id} className={user.status === 'inactive' ? 'bg-gray-50' : ''}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-10 w-10 flex-shrink-0">
                        <img 
                          className="h-10 w-10 rounded-full" 
                          src={user.avatar} 
                          alt="" 
                        />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{user.name}</div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{user.role}</div>
                    <div className="text-sm text-gray-500">{user.department}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {user.status === 'active' ? (
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        Active
                      </span>
                    ) : (
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                        Inactive
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-wrap gap-1">
                      {user.permissions.map(permission => (
                        <span 
                          key={permission}
                          className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-indigo-100 text-indigo-800"
                        >
                          {permission.charAt(0).toUpperCase() + permission.slice(1)}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {getRelativeTime(user.lastActive)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    {showDeleteConfirm === user.id ? (
                      <div className="flex items-center justify-end space-x-2">
                        <span className="text-red-600 text-xs">Confirm delete?</span>
                        <button 
                          onClick={() => handleDeleteUser(user.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <CheckCircle className="h-5 w-5" />
                        </button>
                        <button 
                          onClick={() => setShowDeleteConfirm(null)}
                          className="text-gray-400 hover:text-gray-500"
                        >
                          <AlertCircle className="h-5 w-5" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex space-x-2 justify-end">
                        <button 
                          className="text-indigo-600 hover:text-indigo-900"
                          title="Edit user"
                        >
                          <Edit className="h-5 w-5" />
                        </button>
                        <button 
                          onClick={() => setShowDeleteConfirm(user.id)}
                          className="text-red-600 hover:text-red-900"
                          title="Delete user"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
              {filteredUsers.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">
                    No users found matching your criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        <div className="mt-4 flex justify-between text-sm text-gray-500">
          <span>Showing {filteredUsers.length} of {users.length} users</span>
          {(searchQuery || selectedRole || showInactive) && (
            <button 
              onClick={() => {
                setSearchQuery('');
                setSelectedRole('');
                setShowInactive(false);
              }}
              className="text-indigo-600 hover:text-indigo-800"
            >
              Clear filters
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserManagementPage;