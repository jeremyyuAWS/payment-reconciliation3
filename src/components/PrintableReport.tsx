import React, { useEffect, useRef } from 'react';
import { ReconciliationResult, ReconciliationSummary } from '../types';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

interface PrintableReportProps {
  results: ReconciliationResult[];
  summary: ReconciliationSummary;
  onClose: () => void;
}

const PrintableReport: React.FC<PrintableReportProps> = ({ results, summary, onClose }) => {
  const printRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    // Add print event listener
    const handlePrint = () => {
      onClose(); // Close report after printing
    };
    
    window.addEventListener('afterprint', handlePrint);
    
    // Auto-trigger print dialog when component mounts
    setTimeout(() => {
      window.print();
    }, 500);
    
    return () => {
      window.removeEventListener('afterprint', handlePrint);
    };
  }, [onClose]);
  
  // Format date for report header
  const reportDate = new Date().toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
  
  // Data for simple pie chart
  const pieData = [
    { name: 'Reconciled', value: summary.reconciledCount, color: '#10B981' },
    { name: 'Partially Reconciled', value: summary.partiallyReconciledCount, color: '#F59E0B' },
    { name: 'Unreconciled', value: summary.unreconciledCount, color: '#EF4444' }
  ];
  
  // Top issues
  const topIssues = Object.entries(summary.issuesByType)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);
  
  // Map issue types to human-readable labels
  const issueLabels: Record<string, string> = {
    'duplicate_payment': 'Duplicate Payments',
    'missing_invoice': 'Missing Invoices',
    'amount_mismatch': 'Amount Mismatches',
    'missing_ledger_entry': 'Missing Ledger Entries',
    'reference_mismatch': 'Reference Mismatches',
    'payer_name_mismatch': 'Payer Name Mismatches'
  };
  
  // Format currency
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };
  
  // Calculate totals
  const totalPaymentAmount = results.reduce((sum, r) => sum + r.payment.amount, 0);
  const reconciledAmount = results
    .filter(r => r.status === 'Reconciled')
    .reduce((sum, r) => sum + r.payment.amount, 0);
  
  return (
    <div className="fixed inset-0 bg-white z-50 overflow-y-auto print:overflow-visible">
      <div className="max-w-4xl mx-auto p-6 print:p-0" ref={printRef}>
        {/* Print controls - hidden when printing */}
        <div className="flex justify-between mb-6 print:hidden">
          <h1 className="text-2xl font-bold text-gray-900">Payment Reconciliation Report</h1>
          <div className="space-x-2">
            <button
              onClick={() => window.print()}
              className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
            >
              Print
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50"
            >
              Close
            </button>
          </div>
        </div>
        
        {/* Report Header */}
        <div className="mb-8 border-b pb-6">
          <h1 className="text-2xl font-bold text-gray-900 print:text-xl">Payment Reconciliation Report</h1>
          <p className="text-gray-500">Generated on {reportDate}</p>
        </div>
        
        {/* Summary Section */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-4 text-gray-800 border-b pb-2">Summary</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="mb-4">
                <div className="flex justify-between mb-1">
                  <span className="text-gray-600">Total Transactions:</span>
                  <span className="font-medium">{summary.totalPayments}</span>
                </div>
                <div className="flex justify-between mb-1">
                  <span className="text-gray-600">Reconciled:</span>
                  <span className="font-medium text-green-600">{summary.reconciledCount} ({Math.round((summary.reconciledCount / summary.totalPayments) * 100)}%)</span>
                </div>
                <div className="flex justify-between mb-1">
                  <span className="text-gray-600">Partially Reconciled:</span>
                  <span className="font-medium text-yellow-600">{summary.partiallyReconciledCount} ({Math.round((summary.partiallyReconciledCount / summary.totalPayments) * 100)}%)</span>
                </div>
                <div className="flex justify-between mb-1">
                  <span className="text-gray-600">Unreconciled:</span>
                  <span className="font-medium text-red-600">{summary.unreconciledCount} ({Math.round((summary.unreconciledCount / summary.totalPayments) * 100)}%)</span>
                </div>
              </div>
              
              <div className="mb-4">
                <div className="flex justify-between mb-1">
                  <span className="text-gray-600">Total Payment Amount:</span>
                  <span className="font-medium">{formatCurrency(totalPaymentAmount)}</span>
                </div>
                <div className="flex justify-between mb-1">
                  <span className="text-gray-600">Reconciled Amount:</span>
                  <span className="font-medium text-green-600">{formatCurrency(reconciledAmount)} ({Math.round((reconciledAmount / totalPaymentAmount) * 100)}%)</span>
                </div>
                <div className="flex justify-between mb-1">
                  <span className="text-gray-600">Unreconciled Amount:</span>
                  <span className="font-medium text-red-600">{formatCurrency(totalPaymentAmount - reconciledAmount)} ({Math.round(((totalPaymentAmount - reconciledAmount) / totalPaymentAmount) * 100)}%)</span>
                </div>
              </div>
              
              <div>
                <h3 className="font-medium mb-2 text-gray-700">Top Issues:</h3>
                <ul className="list-disc pl-5 space-y-1">
                  {topIssues.map(([type, count]) => (
                    <li key={type}>
                      {issueLabels[type] || type}: <span className="font-medium">{count}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            
            <div className="h-64 print:h-48">
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
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
        
        {/* Transactions Section */}
        <div>
          <h2 className="text-lg font-semibold mb-4 text-gray-800 border-b pb-2">Transactions</h2>
          
          {/* Unreconciled Transactions */}
          {summary.unreconciledCount > 0 && (
            <div className="mb-6">
              <h3 className="font-medium text-red-800 mb-3">Unreconciled Transactions</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Payment ID</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Payer</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Issue</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {results
                      .filter(r => r.status === 'Unreconciled')
                      .map(result => (
                        <tr key={result.payment.payment_id}>
                          <td className="px-3 py-2 text-sm text-gray-900">{result.payment.payment_id}</td>
                          <td className="px-3 py-2 text-sm text-gray-900">{result.payment.payer_name}</td>
                          <td className="px-3 py-2 text-sm text-gray-900">{formatCurrency(result.payment.amount)}</td>
                          <td className="px-3 py-2 text-sm text-gray-900">{result.payment.payment_date}</td>
                          <td className="px-3 py-2 text-sm text-red-600">
                            {result.issues.length === 1 
                              ? issueLabels[result.issues[0].type] || result.issues[0].type
                              : `${result.issues.length} issues`}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          
          {/* Partially Reconciled Transactions */}
          {summary.partiallyReconciledCount > 0 && (
            <div className="mb-6">
              <h3 className="font-medium text-yellow-800 mb-3">Partially Reconciled Transactions</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Payment ID</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Payer</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Invoice</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Issue</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {results
                      .filter(r => r.status === 'Partially Reconciled')
                      .map(result => (
                        <tr key={result.payment.payment_id}>
                          <td className="px-3 py-2 text-sm text-gray-900">{result.payment.payment_id}</td>
                          <td className="px-3 py-2 text-sm text-gray-900">{result.payment.payer_name}</td>
                          <td className="px-3 py-2 text-sm text-gray-900">{formatCurrency(result.payment.amount)}</td>
                          <td className="px-3 py-2 text-sm text-gray-900">
                            {result.matchedInvoice ? result.matchedInvoice.invoice_id : 'N/A'}
                          </td>
                          <td className="px-3 py-2 text-sm text-yellow-600">
                            {result.issues.length === 1 
                              ? issueLabels[result.issues[0].type] || result.issues[0].type
                              : `${result.issues.length} issues`}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          
          {/* Reconciled Transactions Summary */}
          <div>
            <h3 className="font-medium text-green-800 mb-3">Reconciled Transactions</h3>
            <p className="text-gray-600 mb-2">
              {summary.reconciledCount} transactions successfully reconciled for a total amount of {formatCurrency(reconciledAmount)}.
            </p>
          </div>
        </div>
        
        {/* Footer */}
        <div className="mt-8 pt-6 border-t text-sm text-gray-500 text-center">
          <p>Generated by Payment Reconciliation Agent - AI-powered financial transaction matching</p>
          <p className="print:hidden">For demonstration purposes only</p>
        </div>
      </div>
    </div>
  );
};

export default PrintableReport;