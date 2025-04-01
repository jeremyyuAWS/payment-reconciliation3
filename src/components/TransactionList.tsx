import React, { useState } from 'react';
import { ReconciliationResult } from '../types';
import { getIssueDescription } from '../utils/reconciliationEngine';
import { CheckCircle, AlertTriangle, XCircle, ArrowUpDown, ChevronUp, ChevronDown } from 'lucide-react';

interface TransactionListProps {
  results: ReconciliationResult[];
  onSelectTransaction: (result: ReconciliationResult) => void;
}

const TransactionList: React.FC<TransactionListProps> = ({ results, onSelectTransaction }) => {
  const [sortField, setSortField] = useState<string>('payment_date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Reconciled':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'Partially Reconciled':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'Unreconciled':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return null;
    }
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };
  
  const handleSort = (field: string) => {
    if (sortField === field) {
      // Toggle direction if clicking the same field
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // Set new field and default to descending
      setSortField(field);
      setSortDirection('desc');
    }
  };
  
  const getSortIcon = (field: string) => {
    if (sortField !== field) {
      return <ArrowUpDown className="h-4 w-4 ml-1 text-gray-400" />;
    }
    return sortDirection === 'asc' 
      ? <ChevronUp className="h-4 w-4 ml-1 text-indigo-500" />
      : <ChevronDown className="h-4 w-4 ml-1 text-indigo-500" />;
  };
  
  // Sort the results
  const sortedResults = [...results].sort((a, b) => {
    let aValue, bValue;
    
    switch (sortField) {
      case 'payment_id':
        aValue = a.payment.payment_id;
        bValue = b.payment.payment_id;
        break;
      case 'payer_name':
        aValue = a.payment.payer_name.toLowerCase();
        bValue = b.payment.payer_name.toLowerCase();
        break;
      case 'amount':
        aValue = a.payment.amount;
        bValue = b.payment.amount;
        break;
      case 'payment_date':
        aValue = a.payment.payment_date;
        bValue = b.payment.payment_date;
        break;
      case 'invoice_id':
        aValue = a.matchedInvoice?.invoice_id || '';
        bValue = b.matchedInvoice?.invoice_id || '';
        break;
      case 'status':
        aValue = a.status;
        bValue = b.status;
        break;
      case 'issues':
        aValue = a.issues.length;
        bValue = b.issues.length;
        break;
      case 'confidence':
        aValue = a.confidenceScore || 0;
        bValue = b.confidenceScore || 0;
        break;
      default:
        return 0;
    }
    
    if (aValue < bValue) {
      return sortDirection === 'asc' ? -1 : 1;
    }
    if (aValue > bValue) {
      return sortDirection === 'asc' ? 1 : -1;
    }
    return 0;
  });

  if (results.length === 0) {
    return (
      <div className="p-6 text-center text-gray-500">
        No transactions match the current filters.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th 
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
              onClick={() => handleSort('status')}
            >
              <div className="flex items-center">
                Status
                {getSortIcon('status')}
              </div>
            </th>
            <th 
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
              onClick={() => handleSort('payment_id')}
            >
              <div className="flex items-center">
                Payment ID
                {getSortIcon('payment_id')}
              </div>
            </th>
            <th 
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
              onClick={() => handleSort('payer_name')}
            >
              <div className="flex items-center">
                Payer
                {getSortIcon('payer_name')}
              </div>
            </th>
            <th 
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
              onClick={() => handleSort('amount')}
            >
              <div className="flex items-center">
                Amount
                {getSortIcon('amount')}
              </div>
            </th>
            <th 
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
              onClick={() => handleSort('payment_date')}
            >
              <div className="flex items-center">
                Date
                {getSortIcon('payment_date')}
              </div>
            </th>
            <th 
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
              onClick={() => handleSort('invoice_id')}
            >
              <div className="flex items-center">
                Invoice
                {getSortIcon('invoice_id')}
              </div>
            </th>
            <th 
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
              onClick={() => handleSort('confidence')}
            >
              <div className="flex items-center">
                AI Confidence
                {getSortIcon('confidence')}
              </div>
            </th>
            <th 
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
              onClick={() => handleSort('issues')}
            >
              <div className="flex items-center">
                Issues
                {getSortIcon('issues')}
              </div>
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {sortedResults.map((result) => (
            <tr 
              key={result.payment.payment_id}
              className="hover:bg-gray-50 cursor-pointer"
              onClick={() => onSelectTransaction(result)}
            >
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  {getStatusIcon(result.status)}
                  <span 
                    className={`ml-2 text-sm ${
                      result.status === 'Reconciled' 
                        ? 'text-green-700' 
                        : result.status === 'Partially Reconciled'
                          ? 'text-yellow-700'
                          : 'text-red-700'
                    }`}
                  >
                    {result.status}
                  </span>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {result.payment.payment_id}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {result.payment.payer_name}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {formatCurrency(result.payment.amount)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {result.payment.payment_date}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {result.matchedInvoice ? result.matchedInvoice.invoice_id : 'N/A'}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {result.confidenceScore ? (
                  <div className="flex items-center">
                    <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                      <div 
                        className={`h-2 rounded-full ${
                          result.confidenceScore >= 80 ? 'bg-green-500' :
                          result.confidenceScore >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${Math.round(result.confidenceScore)}%` }}
                      ></div>
                    </div>
                    <span>{Math.round(result.confidenceScore)}%</span>
                  </div>
                ) : 'N/A'}
              </td>
              <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                {result.issues.length > 0 ? (
                  <span className="text-red-600">
                    {result.issues.length === 1 
                      ? getIssueDescription(result.issues[0])
                      : `${result.issues.length} issues detected`}
                  </span>
                ) : 'No issues'}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <button 
                  className="text-indigo-600 hover:text-indigo-900"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectTransaction(result);
                  }}
                >
                  Details
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TransactionList;