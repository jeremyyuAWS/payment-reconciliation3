import React, { useState } from 'react';
import { ReconciliationResult } from '../../types';
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Scatter,
  Area
} from 'recharts';
import { ArrowUpDown, PieChart } from 'lucide-react';

interface TimeSeriesAnalysisChartProps {
  results: ReconciliationResult[];
}

const TimeSeriesAnalysisChart: React.FC<TimeSeriesAnalysisChartProps> = ({ results }) => {
  const [chartType, setChartType] = useState<'daily' | 'monthly'>('daily');
  
  // Group and process data for time series analysis
  const processTimeSeriesData = () => {
    const dateMap = new Map<string, {
      date: string;
      totalPayments: number;
      reconciledCount: number;
      partialCount: number;
      unreconciledCount: number;
      totalAmount: number;
      reconciledAmount: number;
      issueCount: number;
      avgConfidence: number;
    }>();
    
    // Sort results by payment date
    const sortedResults = [...results].sort((a, b) => {
      return new Date(a.payment.payment_date).getTime() - new Date(b.payment.payment_date).getTime();
    });
    
    sortedResults.forEach(result => {
      let dateKey: string;
      
      if (chartType === 'daily') {
        dateKey = result.payment.payment_date;
      } else {
        // Monthly grouping - extract YYYY-MM
        dateKey = result.payment.payment_date.substring(0, 7);
      }
      
      const isReconciled = result.status === 'Reconciled';
      const isPartial = result.status === 'Partially Reconciled';
      
      if (!dateMap.has(dateKey)) {
        dateMap.set(dateKey, {
          date: dateKey,
          totalPayments: 0,
          reconciledCount: 0,
          partialCount: 0,
          unreconciledCount: 0,
          totalAmount: 0,
          reconciledAmount: 0,
          issueCount: 0,
          avgConfidence: 0
        });
      }
      
      const dayData = dateMap.get(dateKey)!;
      
      // Update counts
      dayData.totalPayments += 1;
      if (isReconciled) {
        dayData.reconciledCount += 1;
        dayData.reconciledAmount += result.payment.amount;
      } else if (isPartial) {
        dayData.partialCount += 1;
        // Count partial payments as half reconciled for visualization
        dayData.reconciledAmount += result.payment.amount / 2;
      } else {
        dayData.unreconciledCount += 1;
      }
      
      dayData.totalAmount += result.payment.amount;
      dayData.issueCount += result.issues.length;
      
      // Track confidence scores for averaging
      if (result.confidenceScore !== undefined) {
        // Weighted running average
        const currentTotal = dayData.avgConfidence * (dayData.totalPayments - 1);
        dayData.avgConfidence = (currentTotal + result.confidenceScore) / dayData.totalPayments;
      }
      
      dateMap.set(dateKey, dayData);
    });
    
    // Convert to array and sort by date
    return Array.from(dateMap.values()).sort((a, b) => {
      return new Date(a.date).getTime() - new Date(b.date).getTime();
    });
  };
  
  const timeSeriesData = processTimeSeriesData();
  
  // Format date for display
  const formatDate = (date: string) => {
    if (chartType === 'daily') {
      // Format YYYY-MM-DD to MM/DD
      const parts = date.split('-');
      return `${parts[1]}/${parts[2]}`;
    } else {
      // Format YYYY-MM to MMM YYYY
      const parts = date.split('-');
      const month = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1).toLocaleString('default', { month: 'short' });
      return `${month} ${parts[0]}`;
    }
  };
  
  return (
    <div className="w-full bg-white rounded-lg shadow-md overflow-hidden">
      <div className="px-4 py-3 bg-indigo-50 border-b border-indigo-100 flex justify-between items-center">
        <div className="flex items-center">
          <PieChart className="h-5 w-5 text-indigo-600 mr-2" />
          <h3 className="text-lg font-medium text-gray-900">Time Series Analysis</h3>
        </div>
        <div className="flex items-center space-x-2">
          <select
            value={chartType}
            onChange={(e) => setChartType(e.target.value as 'daily' | 'monthly')}
            className="text-sm border-gray-300 rounded-md shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
          >
            <option value="daily">Daily View</option>
            <option value="monthly">Monthly View</option>
          </select>
        </div>
      </div>
      
      <div className="p-4">
        <div className="h-[350px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart
              data={timeSeriesData}
              margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
            >
              <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
              <XAxis 
                dataKey="date" 
                tickFormatter={formatDate}
                tick={{ fontSize: 12 }}
              />
              <YAxis 
                yAxisId="left"
                tickFormatter={(value) => `$${value}`}
                tick={{ fontSize: 12 }}
              />
              <YAxis 
                yAxisId="right" 
                orientation="right" 
                domain={[0, 'dataMax + 5']}
                tick={{ fontSize: 12 }}
              />
              <Tooltip 
                formatter={(value, name) => {
                  if (name === 'totalAmount' || name === 'reconciledAmount') {
                    return [`$${Number(value).toFixed(2)}`, name === 'totalAmount' ? 'Total Amount' : 'Reconciled Amount'];
                  }
                  if (name === 'avgConfidence') {
                    return [`${Number(value).toFixed(1)}%`, 'Avg Confidence'];
                  }
                  return [value, name];
                }}
                labelFormatter={(label) => {
                  return chartType === 'daily' 
                    ? new Date(label).toLocaleDateString() 
                    : new Date(label + '-01').toLocaleDateString('default', { month: 'long', year: 'numeric' });
                }}
              />
              <Legend />
              
              {/* Total Transaction Amount */}
              <Area 
                yAxisId="left"
                type="monotone"
                dataKey="totalAmount"
                fill="#8884d833"
                stroke="#8884d8"
                name="Total Amount"
              />
              
              {/* Reconciled Amount */}
              <Bar 
                yAxisId="left"
                dataKey="reconciledAmount" 
                fill="#10b981" 
                name="Reconciled Amount"
                barSize={20}
              />
              
              {/* Issue Count */}
              <Line 
                yAxisId="right"
                type="monotone" 
                dataKey="issueCount" 
                stroke="#ef4444" 
                name="Issues"
                strokeWidth={2}
              />
              
              {/* Average Confidence */}
              <Line 
                yAxisId="right"
                type="monotone" 
                dataKey="avgConfidence" 
                stroke="#f59e0b" 
                name="Avg Confidence"
                strokeWidth={2}
              />
              
              {/* Reconciled Transaction Count */}
              <Scatter 
                yAxisId="right"
                dataKey="reconciledCount" 
                fill="#10b981" 
                name="Reconciled Count"
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
        
        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gray-50 p-3 rounded-md">
            <h3 className="text-sm font-medium text-gray-700 mb-1">Volume Analysis</h3>
            <p className="text-xs text-gray-500">
              {chartType === 'daily' 
                ? 'Daily transaction volume shows patterns in payment behavior.'
                : 'Monthly volume reveals seasonal trends in reconciliation success.'}
            </p>
          </div>
          
          <div className="bg-gray-50 p-3 rounded-md">
            <h3 className="text-sm font-medium text-gray-700 mb-1">Value Analysis</h3>
            <p className="text-xs text-gray-500">
              Compare total payment value to successfully reconciled amount to identify value leakage.
            </p>
          </div>
          
          <div className="bg-gray-50 p-3 rounded-md">
            <h3 className="text-sm font-medium text-gray-700 mb-1">Confidence Trends</h3>
            <p className="text-xs text-gray-500">
              Track AI confidence scores over time to identify periods where matching is less reliable.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TimeSeriesAnalysisChart;