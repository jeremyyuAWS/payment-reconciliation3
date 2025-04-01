import React, { useState } from 'react';
import { Filter } from '../types';
import { X } from 'lucide-react';

interface FilterPanelProps {
  filter: Filter;
  onFilterChange: (filter: Filter) => void;
  onClose: () => void;
}

const FilterPanel: React.FC<FilterPanelProps> = ({ filter, onFilterChange, onClose }) => {
  const [localFilter, setLocalFilter] = useState<Filter>(filter);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setLocalFilter(prev => ({ ...prev, [name]: value === '' ? undefined : value }));
  };

  // Handle confidence score slider
  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    setLocalFilter(prev => ({ ...prev, minConfidence: value }));
  };

  const handleApply = () => {
    onFilterChange(localFilter);
  };

  const handleReset = () => {
    const emptyFilter: Filter = {};
    setLocalFilter(emptyFilter);
    onFilterChange(emptyFilter);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4 mb-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium">Filter Transactions</h3>
        <button 
          onClick={onClose}
          className="text-gray-400 hover:text-gray-500"
        >
          <X className="h-5 w-5" />
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div>
          <label htmlFor="customerName" className="block text-sm font-medium text-gray-700 mb-1">
            Customer/Payer Name
          </label>
          <input
            type="text"
            id="customerName"
            name="customerName"
            value={localFilter.customerName || ''}
            onChange={handleChange}
            className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
            placeholder="Enter customer name"
          />
        </div>

        <div>
          <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">
            Start Date
          </label>
          <input
            type="date"
            id="startDate"
            name="startDate"
            value={localFilter.startDate || ''}
            onChange={handleChange}
            className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
          />
        </div>

        <div>
          <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">
            End Date
          </label>
          <input
            type="date"
            id="endDate"
            name="endDate"
            value={localFilter.endDate || ''}
            onChange={handleChange}
            className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
          />
        </div>

        <div>
          <label htmlFor="issueType" className="block text-sm font-medium text-gray-700 mb-1">
            Issue Type
          </label>
          <select
            id="issueType"
            name="issueType"
            value={localFilter.issueType || ''}
            onChange={handleChange}
            className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
          >
            <option value="">All Issues</option>
            <option value="duplicate_payment">Duplicate Payment</option>
            <option value="missing_invoice">Missing Invoice</option>
            <option value="amount_mismatch">Amount Mismatch</option>
            <option value="missing_ledger_entry">Missing Ledger Entry</option>
            <option value="payer_name_mismatch">Payer Name Mismatch</option>
          </select>
        </div>
        
        <div>
          <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
            Reconciliation Status
          </label>
          <select
            id="status"
            name="status"
            value={localFilter.status || ''}
            onChange={handleChange}
            className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
          >
            <option value="">All Statuses</option>
            <option value="Reconciled">Reconciled</option>
            <option value="Partially Reconciled">Partially Reconciled</option>
            <option value="Unreconciled">Unreconciled</option>
          </select>
        </div>
        
        <div className="col-span-1 md:col-span-2">
          <label htmlFor="minConfidence" className="block text-sm font-medium text-gray-700 mb-1">
            Minimum AI Confidence Score: {localFilter.minConfidence || 0}%
          </label>
          <input
            type="range"
            id="minConfidence"
            name="minConfidence"
            min="0"
            max="100"
            step="5"
            value={localFilter.minConfidence || 0}
            onChange={handleSliderChange}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>0%</span>
            <span>50%</span>
            <span>100%</span>
          </div>
        </div>
      </div>
      
      <div className="mt-4 flex justify-end space-x-3">
        <button
          onClick={handleReset}
          className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Reset
        </button>
        <button
          onClick={handleApply}
          className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Apply Filters
        </button>
      </div>
    </div>
  );
};

export default FilterPanel;