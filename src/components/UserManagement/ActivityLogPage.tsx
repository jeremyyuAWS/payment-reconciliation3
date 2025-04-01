import React, { useState } from 'react';
import { ArrowLeft, Filter, Download, Search, Activity, Settings, User, RefreshCw, ExternalLink, AlertTriangle, CheckCircle, FileText } from 'lucide-react';

interface ActivityLogPageProps {
  onBack: () => void;
}

// Mock activity log data
const MOCK_ACTIVITY_LOG = [
  {
    id: 'act-1',
    user: {
      id: 'user-1',
      name: 'Jane Smith',
      avatar: 'https://randomuser.me/api/portraits/women/44.jpg'
    },
    action: 'updated_rules',
    actionText: 'Updated reconciliation rules',
    target: 'Fuzzy matching algorithm',
    timestamp: new Date(Date.now() - 3600000), // 1 hour ago
    ip: '192.168.1.234',
    details: 'Changed name matching sensitivity from 70% to 80%',
    category: 'configuration'
  },
  {
    id: 'act-2',
    user: {
      id: 'user-1',
      name: 'Jane Smith',
      avatar: 'https://randomuser.me/api/portraits/women/44.jpg'
    },
    action: 'imported_data',
    actionText: 'Imported data',
    target: 'March transactions',
    timestamp: new Date(Date.now() - 86400000), // 1 day ago
    ip: '192.168.1.234',
    details: 'Imported 245 invoices, 312 payments, and 201 ledger entries',
    category: 'data'
  },
  {
    id: 'act-3',
    user: {
      id: 'user-2',
      name: 'John Doe',
      avatar: 'https://randomuser.me/api/portraits/men/32.jpg'
    },
    action: 'approved_reconciliation',
    actionText: 'Approved reconciliation',
    target: 'INV-1004',
    timestamp: new Date(Date.now() - 172800000), // 2 days ago
    ip: '192.168.1.101',
    details: 'Manually approved reconciliation for invoice INV-1004 with payment PAY-505',
    category: 'reconciliation'
  },
  {
    id: 'act-4',
    user: {
      id: 'user-3',
      name: 'Alex Johnson',
      avatar: 'https://randomuser.me/api/portraits/women/68.jpg'
    },
    action: 'login',
    actionText: 'Logged in',
    target: 'Web application',
    timestamp: new Date(Date.now() - 259200000), // 3 days ago
    ip: '192.168.1.187',
    details: 'Successful login from Chrome on Windows',
    category: 'authentication'
  },
  {
    id: 'act-5',
    user: {
      id: 'user-2',
      name: 'John Doe',
      avatar: 'https://randomuser.me/api/portraits/men/32.jpg'
    },
    action: 'api_connection',
    actionText: 'Connected API',
    target: 'QuickBooks Online',
    timestamp: new Date(Date.now() - 345600000), // 4 days ago
    ip: '192.168.1.101',
    details: 'Established new API connection to QuickBooks Online accounting system',
    category: 'integration'
  },
  {
    id: 'act-6',
    user: {
      id: 'user-1',
      name: 'Jane Smith',
      avatar: 'https://randomuser.me/api/portraits/women/44.jpg'
    },
    action: 'export_data',
    actionText: 'Exported data',
    target: 'Reconciliation report',
    timestamp: new Date(Date.now() - 432000000), // 5 days ago
    ip: '192.168.1.234',
    details: 'Exported reconciliation report as CSV containing 156 transactions',
    category: 'data'
  },
  {
    id: 'act-7',
    user: {
      id: 'user-4',
      name: 'Sarah Williams',
      avatar: 'https://randomuser.me/api/portraits/women/17.jpg'
    },
    action: 'system_error',
    actionText: 'System error',
    target: 'Payment matching engine',
    timestamp: new Date(Date.now() - 518400000), // 6 days ago
    ip: '192.168.1.199',
    details: 'Encountered error during matching process: timeout after 30 seconds',
    category: 'system'
  }
];

const ActivityLogPage: React.FC<ActivityLogPageProps> = ({ onBack }) => {
  const [activities] = useState(MOCK_ACTIVITY_LOG);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  
  // Filter activities based on search query and filters
  const filteredActivities = activities.filter(activity => {
    // Filter by search query
    if (searchQuery && !activity.actionText.toLowerCase().includes(searchQuery.toLowerCase()) && 
        !activity.target.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !activity.user.name.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    
    // Filter by category
    if (selectedCategories.length > 0 && !selectedCategories.includes(activity.category)) {
      return false;
    }
    
    // Filter by date range
    if (startDate && new Date(activity.timestamp) < new Date(startDate)) {
      return false;
    }
    
    if (endDate && new Date(activity.timestamp) > new Date(endDate)) {
      return false;
    }
    
    return true;
  });
  
  const handleCategoryToggle = (category: string) => {
    setSelectedCategories(prev => 
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };
  
  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategories([]);
    setStartDate('');
    setEndDate('');
  };
  
  // Get unique categories for filter options
  const categories = Array.from(new Set(activities.map(a => a.category)));
  
  // Get the icon for the activity type
  const getActivityIcon = (activity: typeof MOCK_ACTIVITY_LOG[0]) => {
    switch(activity.action) {
      case 'updated_rules':
        return <Settings className="h-5 w-5 text-blue-500" />;
      case 'imported_data':
      case 'export_data':
        return <FileText className="h-5 w-5 text-green-500" />;
      case 'approved_reconciliation':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'login':
        return <User className="h-5 w-5 text-indigo-500" />;
      case 'api_connection':
        return <ExternalLink className="h-5 w-5 text-purple-500" />;
      case 'system_error':
        return <AlertTriangle className="h-5 w-5 text-red-500" />;
      default:
        return <Activity className="h-5 w-5 text-gray-500" />;
    }
  };
  
  // Format timestamp to readable format
  const formatTimestamp = (timestamp: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(timestamp);
  };
  
  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      <div className="px-4 py-4 bg-indigo-50 flex justify-between items-center">
        <div className="flex items-center">
          <button onClick={onBack} className="mr-2 text-indigo-600 hover:text-indigo-800">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h2 className="text-lg font-medium text-gray-800">Activity Log</h2>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`inline-flex items-center px-3 py-1.5 border rounded-md text-sm ${
              showFilters 
                ? 'border-indigo-500 text-indigo-500 bg-indigo-50'
                : 'border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Filter className="h-4 w-4 mr-1.5" />
            Filters
          </button>
          <button
            className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-md text-sm"
          >
            <Download className="h-4 w-4 mr-1.5" />
            Export
          </button>
        </div>
      </div>
      
      <div className="p-4">
        <div className="flex items-center mb-4">
          <div className="relative flex-grow">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search activities..."
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
          <div className="ml-4 flex items-center text-sm text-gray-500">
            <span>{filteredActivities.length} results</span>
            {(searchQuery || selectedCategories.length > 0 || startDate || endDate) && (
              <button
                onClick={clearFilters}
                className="ml-2 text-indigo-600 hover:text-indigo-800"
              >
                Clear filters
              </button>
            )}
          </div>
        </div>
        
        {showFilters && (
          <div className="mb-4 p-4 bg-gray-50 rounded-md border border-gray-200">
            <h3 className="text-sm font-medium text-gray-700 mb-3">Filter Options</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Categories
                </label>
                <div className="space-y-2">
                  {categories.map(category => (
                    <div key={category} className="flex items-center">
                      <input
                        type="checkbox"
                        id={`category-${category}`}
                        checked={selectedCategories.includes(category)}
                        onChange={() => handleCategoryToggle(category)}
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                      />
                      <label htmlFor={`category-${category}`} className="ml-2 text-sm text-gray-700 capitalize">
                        {category}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <label htmlFor="start-date" className="block text-sm font-medium text-gray-700 mb-1">
                  Start Date
                </label>
                <input
                  type="date"
                  id="start-date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                />
              </div>
              
              <div>
                <label htmlFor="end-date" className="block text-sm font-medium text-gray-700 mb-1">
                  End Date
                </label>
                <input
                  type="date"
                  id="end-date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                />
              </div>
            </div>
          </div>
        )}
        
        <div className="overflow-hidden border border-gray-200 sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {filteredActivities.length > 0 ? (
              filteredActivities.map((activity) => (
                <li key={activity.id} className="px-4 py-4 sm:px-6 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 mr-3">
                        <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center">
                          {getActivityIcon(activity)}
                        </div>
                      </div>
                      <div>
                        <div className="flex items-center">
                          <p className="text-sm font-medium text-indigo-600 mr-2">
                            {activity.user.name}
                          </p>
                          <p className="text-sm text-gray-900">
                            {activity.actionText} • <span className="font-medium">{activity.target}</span>
                          </p>
                        </div>
                        <div className="mt-1 flex items-center text-xs text-gray-500">
                          <span>{formatTimestamp(activity.timestamp)}</span>
                          <span className="mx-1">•</span>
                          <span>IP: {activity.ip}</span>
                          <span className="mx-1.5">•</span>
                          <span className="capitalize">{activity.category}</span>
                        </div>
                      </div>
                    </div>
                    <div className="ml-2">
                      <button
                        className="text-indigo-600 hover:text-indigo-900 text-sm font-medium"
                      >
                        Details
                      </button>
                    </div>
                  </div>
                  <div className="mt-2 text-sm text-gray-700">
                    <p>{activity.details}</p>
                  </div>
                </li>
              ))
            ) : (
              <li className="px-4 py-8 sm:px-6 text-center">
                <p className="text-gray-500">No activities match your filters.</p>
              </li>
            )}
          </ul>
        </div>
        
        <div className="flex justify-between items-center mt-4 text-sm text-gray-500">
          <div>
            <span>Showing {filteredActivities.length} of {activities.length} entries</span>
          </div>
          <div className="flex space-x-1">
            <button className="inline-flex items-center px-3 py-1.5 border border-gray-300 bg-white hover:bg-gray-50 rounded-md text-sm font-medium text-gray-700">
              <RefreshCw className="h-4 w-4 mr-1.5" />
              Refresh
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActivityLogPage;