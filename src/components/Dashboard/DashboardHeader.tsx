import React from 'react';
import { Filter, Upload, Download } from 'lucide-react';

const DashboardHeader: React.FC = () => {
  return (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <div className="flex space-x-2">
          <button className="flex items-center px-3 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50">
            <Upload className="h-4 w-4 mr-2" />
            Import
          </button>
          <button className="flex items-center px-3 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50">
            <Download className="h-4 w-4 mr-2" />
            Export
          </button>
          <button className="flex items-center px-3 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </button>
        </div>
      </div>
    </div>
  );
};

export default DashboardHeader;