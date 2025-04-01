import React from 'react';
import { ReconciliationResult } from '../types';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend 
} from 'recharts';

interface IssuesTrendChartProps {
  results: ReconciliationResult[];
}

const IssuesTrendChart: React.FC<IssuesTrendChartProps> = ({ results }) => {
  // Process data to show issues trends by date
  const getIssuesTrendData = () => {
    const issuesByDate: Record<string, {
      date: string;
      duplicate_payment: number;
      missing_invoice: number;
      amount_mismatch: number;
      missing_ledger_entry: number;
      payer_name_mismatch: number;
      total: number;
    }> = {};
    
    // Sort results by date for chronological processing
    const sortedResults = [...results].sort(
      (a, b) => new Date(a.payment.payment_date).getTime() - new Date(b.payment.payment_date).getTime()
    );
    
    sortedResults.forEach(result => {
      const date = result.payment.payment_date;
      
      if (!issuesByDate[date]) {
        issuesByDate[date] = {
          date,
          duplicate_payment: 0,
          missing_invoice: 0,
          amount_mismatch: 0,
          missing_ledger_entry: 0,
          payer_name_mismatch: 0,
          total: 0
        };
      }
      
      // Count each issue type
      result.issues.forEach(issue => {
        if (issue.type in issuesByDate[date]) {
          issuesByDate[date][issue.type as keyof typeof issuesByDate[typeof date]]++;
          issuesByDate[date].total++;
        }
      });
    });
    
    // Convert to array and sort by date
    return Object.values(issuesByDate)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  };

  const issuesTrendData = getIssuesTrendData();
  
  // Don't render if not enough data points
  if (issuesTrendData.length < 2) {
    return null;
  }
  
  // Map issue types to human-readable labels
  const issueLabels: Record<string, string> = {
    duplicate_payment: 'Duplicate Payments',
    missing_invoice: 'Missing Invoices',
    amount_mismatch: 'Amount Mismatches',
    missing_ledger_entry: 'Missing Ledger Entries',
    payer_name_mismatch: 'Payer Name Mismatches'
  };
  
  // Colors for each issue type
  const issueColors: Record<string, string> = {
    duplicate_payment: '#EF4444', // red
    missing_invoice: '#F59E0B', // amber
    amount_mismatch: '#3B82F6', // blue
    missing_ledger_entry: '#8B5CF6', // purple
    payer_name_mismatch: '#EC4899' // pink
  };

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="px-4 py-5 sm:px-6 bg-indigo-50 border-b border-indigo-100">
        <h3 className="text-lg font-medium text-gray-900">Reconciliation Issues Trend</h3>
        <p className="mt-1 text-sm text-gray-500">
          Tracking issue types over time
        </p>
      </div>
      
      <div className="px-4 py-5 sm:p-6">
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={issuesTrendData}
              margin={{ top: 20, right: 30, left: 20, bottom: 10 }}
            >
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
              <XAxis 
                dataKey="date" 
                tick={{ fontSize: 12 }}
                tickMargin={10}
              />
              <YAxis 
                allowDecimals={false}
                tick={{ fontSize: 12 }}
              />
              <Tooltip 
                formatter={(value: number, name: string) => {
                  const label = name === 'total' ? 'Total Issues' : issueLabels[name];
                  return [value, label];
                }}
              />
              <Legend 
                formatter={(value, entry) => {
                  return value === 'total' ? 'Total Issues' : issueLabels[value];
                }}
              />
              
              {/* Lines for each issue type */}
              <Line 
                type="monotone" 
                dataKey="total" 
                name="total"
                stroke="#374151" 
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
              <Line 
                type="monotone" 
                dataKey="duplicate_payment" 
                name="duplicate_payment"
                stroke={issueColors.duplicate_payment} 
                strokeDasharray="5 5"
              />
              <Line 
                type="monotone" 
                dataKey="missing_invoice" 
                name="missing_invoice"
                stroke={issueColors.missing_invoice} 
                strokeDasharray="5 5"
              />
              <Line 
                type="monotone" 
                dataKey="amount_mismatch" 
                name="amount_mismatch"
                stroke={issueColors.amount_mismatch} 
                strokeDasharray="5 5"
              />
              <Line 
                type="monotone" 
                dataKey="missing_ledger_entry" 
                name="missing_ledger_entry"
                stroke={issueColors.missing_ledger_entry} 
                strokeDasharray="5 5"
              />
              <Line 
                type="monotone" 
                dataKey="payer_name_mismatch" 
                name="payer_name_mismatch"
                stroke={issueColors.payer_name_mismatch} 
                strokeDasharray="5 5"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default IssuesTrendChart;