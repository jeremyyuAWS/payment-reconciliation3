import React from 'react';
import { ReconciliationSummary } from '../types';
import { CheckCircle, AlertTriangle, XCircle, Info } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';

interface ReconciliationSummaryCardProps {
  summary: ReconciliationSummary;
}

const ReconciliationSummaryCard: React.FC<ReconciliationSummaryCardProps> = ({ summary }) => {
  const reconciledPercentage = Math.round((summary.reconciledCount / summary.totalPayments) * 100);
  const partialPercentage = Math.round((summary.partiallyReconciledCount / summary.totalPayments) * 100);
  const unreconciledPercentage = Math.round((summary.unreconciledCount / summary.totalPayments) * 100);
  
  // Calculate top issues
  const topIssues = Object.entries(summary.issuesByType)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);
  
  // Map issue types to human-readable labels
  const issueLabels: Record<string, string> = {
    'duplicate_payment': 'Duplicate Payments',
    'missing_invoice': 'Missing Invoices',
    'amount_mismatch': 'Amount Mismatches',
    'missing_ledger_entry': 'Missing Ledger Entries',
    'reference_mismatch': 'Reference Mismatches',
    'payer_name_mismatch': 'Payer Name Mismatches'
  };

  // Data for pie chart
  const pieData = [
    { name: 'Reconciled', value: summary.reconciledCount, color: '#10B981' },
    { name: 'Partially Reconciled', value: summary.partiallyReconciledCount, color: '#F59E0B' },
    { name: 'Unreconciled', value: summary.unreconciledCount, color: '#EF4444' }
  ];

  // Data for bar chart
  const barData = Object.entries(summary.issuesByType).map(([type, count]) => ({
    name: issueLabels[type] || type,
    count: count
  }));

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="px-4 py-5 sm:p-6">
        <h3 className="text-lg font-medium text-gray-900">Reconciliation Summary</h3>
        
        <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <div className="bg-green-50 rounded-lg p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-3">
                <h4 className="text-sm font-medium text-green-800">Reconciled</h4>
                <div className="mt-1 flex items-baseline">
                  <p className="text-2xl font-semibold text-green-900">{summary.reconciledCount}</p>
                  <p className="ml-2 text-sm font-medium text-green-700">({reconciledPercentage}%)</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-yellow-50 rounded-lg p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <AlertTriangle className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-3">
                <h4 className="text-sm font-medium text-yellow-800">Partially Reconciled</h4>
                <div className="mt-1 flex items-baseline">
                  <p className="text-2xl font-semibold text-yellow-900">{summary.partiallyReconciledCount}</p>
                  <p className="ml-2 text-sm font-medium text-yellow-700">({partialPercentage}%)</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-red-50 rounded-lg p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <XCircle className="h-6 w-6 text-red-600" />
              </div>
              <div className="ml-3">
                <h4 className="text-sm font-medium text-red-800">Unreconciled</h4>
                <div className="mt-1 flex items-baseline">
                  <p className="text-2xl font-semibold text-red-900">{summary.unreconciledCount}</p>
                  <p className="ml-2 text-sm font-medium text-red-700">({unreconciledPercentage}%)</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-indigo-50 rounded-lg p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Info className="h-6 w-6 text-indigo-600" />
              </div>
              <div className="ml-3">
                <h4 className="text-sm font-medium text-indigo-800">Total Payments</h4>
                <div className="mt-1 flex items-baseline">
                  <p className="text-2xl font-semibold text-indigo-900">{summary.totalPayments}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Reconciliation Status Pie Chart */}
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <h4 className="text-sm font-medium text-gray-900 mb-4">Reconciliation Status</h4>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value) => [`${value} payments`, 'Count']}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Issue Types Bar Chart */}
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <h4 className="text-sm font-medium text-gray-900 mb-4">Reconciliation Issues</h4>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={barData}
                  layout="vertical"
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" width={150} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="count" name="Number of Issues" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
        
        <div className="mt-6">
          <h4 className="text-sm font-medium text-gray-900">Reconciliation Progress</h4>
          <div className="mt-2 w-full bg-gray-200 rounded-full h-2.5">
            <div className="bg-gradient-to-r from-green-500 to-green-600 h-2.5 rounded-full" style={{ width: `${reconciledPercentage}%` }}></div>
          </div>
          <div className="mt-2 flex justify-between text-sm text-gray-600">
            <div>{reconciledPercentage}% Reconciled</div>
            <div>{100 - reconciledPercentage}% Needs Review</div>
          </div>
        </div>
        
        {topIssues.length > 0 && (
          <div className="mt-6">
            <h4 className="text-sm font-medium text-gray-900">Top Issues</h4>
            <ul className="mt-2 divide-y divide-gray-200">
              {topIssues.map(([issueType, count]) => (
                <li key={issueType} className="py-2 flex justify-between">
                  <span className="text-sm text-gray-700">{issueLabels[issueType] || issueType}</span>
                  <span className="text-sm font-medium text-gray-900">{count}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReconciliationSummaryCard;