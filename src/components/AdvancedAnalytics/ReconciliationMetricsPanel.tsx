import React, { useState } from 'react';
import { ReconciliationResult } from '../../types';
import { BarChart2, PieChart, CheckCircle, XCircle, AlertTriangle, Layers, Award, Clock, Download, Info } from 'lucide-react';
import { PieChart as RechartsProPieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from 'recharts';

interface ReconciliationMetricsPanelProps {
  results: ReconciliationResult[];
}

// Interface for summary metrics
interface MetricCard {
  title: string;
  value: string | number;
  subtitle: string;
  change?: string;
  icon: React.ReactNode;
  trend?: 'up' | 'down' | 'neutral';
}

const ReconciliationMetricsPanel: React.FC<ReconciliationMetricsPanelProps> = ({ results }) => {
  const [timeframe, setTimeframe] = useState<'all' | 'week' | 'month'>('all');
  const [chartType, setChartType] = useState<'byStatus' | 'byIssue' | 'byPerformance'>('byStatus');
  
  // Calculate metrics
  const totalTransactions = results.length;
  const reconciledCount = results.filter(r => r.status === 'Reconciled').length;
  const partiallyReconciledCount = results.filter(r => r.status === 'Partially Reconciled').length;
  const unreconciledCount = results.filter(r => r.status === 'Unreconciled').length;
  
  const reconciledPercentage = (reconciledCount / totalTransactions) * 100;
  const partiallyReconciledPercentage = (partiallyReconciledCount / totalTransactions) * 100;
  const unreconciledPercentage = (unreconciledCount / totalTransactions) * 100;
  
  // Calculate issue distribution
  const issueTypes: Record<string, number> = {};
  results.forEach(result => {
    result.issues.forEach(issue => {
      const issueType = issue.type;
      issueTypes[issueType] = (issueTypes[issueType] || 0) + 1;
    });
  });
  
  // Calculate average confidence score
  const scores = results.filter(r => r.confidenceScore !== undefined).map(r => r.confidenceScore || 0);
  const averageConfidence = scores.length > 0 
    ? scores.reduce((sum, score) => sum + score, 0) / scores.length
    : 0;
  
  // Calculate average time to reconcile (for demo, just use a static value)
  const averageTimeToReconcile = 57; // In seconds
  
  // Generate summary metrics
  const summaryMetrics: MetricCard[] = [
    {
      title: 'Reconciliation Rate',
      value: `${reconciledPercentage.toFixed(1)}%`,
      subtitle: `${reconciledCount} of ${totalTransactions} transactions`,
      icon: <CheckCircle className="h-6 w-6 text-green-500" />,
      trend: 'up',
      change: '+3.2%'
    },
    {
      title: 'Unreconciled Rate',
      value: `${unreconciledPercentage.toFixed(1)}%`,
      subtitle: `${unreconciledCount} of ${totalTransactions} transactions`,
      icon: <XCircle className="h-6 w-6 text-red-500" />,
      trend: 'down',
      change: '-2.1%'
    },
    {
      title: 'Avg. Confidence Score',
      value: `${averageConfidence.toFixed(1)}%`,
      subtitle: 'AI matching confidence',
      icon: <Award className="h-6 w-6 text-amber-500" />,
      trend: 'up',
      change: '+5.8%'
    },
    {
      title: 'Avg. Processing Time',
      value: `${averageTimeToReconcile}s`,
      subtitle: 'Per transaction',
      icon: <Clock className="h-6 w-6 text-blue-500" />,
      trend: 'down',
      change: '-12.3%'
    }
  ];
  
  // Prepare chart data
  const statusData = [
    { name: 'Reconciled', value: reconciledCount, color: '#10B981' },
    { name: 'Partially Reconciled', value: partiallyReconciledCount, color: '#F59E0B' },
    { name: 'Unreconciled', value: unreconciledCount, color: '#EF4444' }
  ];
  
  const issueData = Object.entries(issueTypes)
    .map(([type, count]) => ({
      name: type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      value: count,
      color: type === 'duplicate_payment' ? '#EF4444' :
             type === 'missing_invoice' ? '#F59E0B' :
             type === 'amount_mismatch' ? '#3B82F6' :
             type === 'missing_ledger_entry' ? '#8B5CF6' :
             type === 'payer_name_mismatch' ? '#EC4899' : '#6B7280'
    }))
    .sort((a, b) => b.value - a.value);
  
  // Performance metrics (radar chart data)
  const performanceData = [
    { metric: 'Accuracy', value: 85 },
    { metric: 'Speed', value: 92 },
    { metric: 'Confidence', value: averageConfidence / 10 }, // Scale to 0-10
    { metric: 'Coverage', value: 78 },
    { metric: 'Resolution Rate', value: reconciledPercentage / 10 }, // Scale to 0-10
    { metric: 'Customer Match', value: 88 }
  ];
  
  const renderTrendIndicator = (trend?: 'up' | 'down' | 'neutral', change?: string) => {
    if (!trend || !change) return null;
    
    const isPositive = trend === 'up' && !change.includes('-') || trend === 'down' && change.includes('-');
    const isNegative = trend === 'down' && !change.includes('-') || trend === 'up' && change.includes('-');
    
    return (
      <span className={`text-xs flex items-center ${
        isPositive ? 'text-green-600' : isNegative ? 'text-red-600' : 'text-gray-500'
      }`}>
        {trend === 'up' && <span className="mr-1">▲</span>}
        {trend === 'down' && <span className="mr-1">▼</span>}
        {change}
      </span>
    );
  };
  
  const renderChart = () => {
    switch (chartType) {
      case 'byStatus':
        return (
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsProPieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${value} transactions`, 'Count']} />
                <Legend />
              </RechartsProPieChart>
            </ResponsiveContainer>
          </div>
        );
      case 'byIssue':
        return (
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={issueData}
                margin={{ top: 20, right: 30, left: 20, bottom: 70 }}
                layout="vertical"
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={150} tick={{ fontSize: 12 }} />
                <Tooltip formatter={(value) => [`${value} instances`, 'Count']} />
                <Legend />
                <Bar dataKey="value" name="Issue Count">
                  {issueData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        );
      case 'byPerformance':
        return (
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={performanceData}>
                <PolarGrid />
                <PolarAngleAxis dataKey="metric" />
                <PolarRadiusAxis domain={[0, 100]} />
                <Radar
                  name="Current Performance"
                  dataKey="value"
                  stroke="#8884d8"
                  fill="#8884d8"
                  fillOpacity={0.6}
                />
                <Tooltip formatter={(value) => [`${value}%`, 'Score']} />
                <Legend />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        );
      default:
        return null;
    }
  };
  
  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="px-4 py-5 border-b border-gray-200 sm:px-6">
        <div className="flex items-center">
          <Layers className="h-6 w-6 text-indigo-500 mr-3" />
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Advanced Reconciliation Metrics
          </h3>
        </div>
        <p className="mt-1 max-w-2xl text-sm text-gray-500">
          In-depth metrics and KPIs for reconciliation performance analysis.
        </p>
      </div>
      
      <div className="px-4 py-5 sm:px-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {summaryMetrics.map((metric, index) => (
            <div key={index} className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-medium text-gray-700">{metric.title}</h4>
                {metric.icon}
              </div>
              <div className="flex items-baseline">
                <p className="text-2xl font-semibold text-gray-900">{metric.value}</p>
                <div className="ml-2">
                  {renderTrendIndicator(metric.trend, metric.change)}
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-1">{metric.subtitle}</p>
            </div>
          ))}
        </div>
        
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm mb-6">
          <div className="px-4 py-4 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
            <div className="flex space-x-4">
              <button
                onClick={() => setChartType('byStatus')}
                className={`flex items-center px-3 py-1 rounded text-sm ${
                  chartType === 'byStatus'
                    ? 'bg-indigo-100 text-indigo-700'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <PieChart className="h-4 w-4 mr-1.5" />
                By Status
              </button>
              <button
                onClick={() => setChartType('byIssue')}
                className={`flex items-center px-3 py-1 rounded text-sm ${
                  chartType === 'byIssue'
                    ? 'bg-indigo-100 text-indigo-700'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <BarChart2 className="h-4 w-4 mr-1.5" />
                By Issue Type
              </button>
              <button
                onClick={() => setChartType('byPerformance')}
                className={`flex items-center px-3 py-1 rounded text-sm ${
                  chartType === 'byPerformance'
                    ? 'bg-indigo-100 text-indigo-700'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <AlertTriangle className="h-4 w-4 mr-1.5" />
                Performance
              </button>
            </div>
            
            <div className="flex space-x-2">
              <button
                onClick={() => setTimeframe('all')}
                className={`px-3 py-1 text-xs rounded ${
                  timeframe === 'all'
                    ? 'bg-gray-200 text-gray-800'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                All Time
              </button>
              <button
                onClick={() => setTimeframe('month')}
                className={`px-3 py-1 text-xs rounded ${
                  timeframe === 'month'
                    ? 'bg-gray-200 text-gray-800'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                This Month
              </button>
              <button
                onClick={() => setTimeframe('week')}
                className={`px-3 py-1 text-xs rounded ${
                  timeframe === 'week'
                    ? 'bg-gray-200 text-gray-800'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                This Week
              </button>
            </div>
          </div>
          
          <div className="p-4">
            {renderChart()}
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-base font-medium text-gray-900">Reconciliation Rate Trend</h4>
              <button className="text-sm text-indigo-600 hover:text-indigo-800 flex items-center">
                <Download className="h-4 w-4 mr-1" />
                Export
              </button>
            </div>
            
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Period
                  </th>
                  <th scope="col" className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total
                  </th>
                  <th scope="col" className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Reconciled
                  </th>
                  <th scope="col" className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rate
                  </th>
                  <th scope="col" className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Change
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                <tr>
                  <td className="px-3 py-2 whitespace-nowrap text-sm font-medium text-gray-900">Current</td>
                  <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500 text-right">{totalTransactions}</td>
                  <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500 text-right">{reconciledCount}</td>
                  <td className="px-3 py-2 whitespace-nowrap text-sm font-medium text-gray-900 text-right">{reconciledPercentage.toFixed(1)}%</td>
                  <td className="px-3 py-2 whitespace-nowrap text-sm text-green-600 text-right">+3.2%</td>
                </tr>
                <tr>
                  <td className="px-3 py-2 whitespace-nowrap text-sm font-medium text-gray-900">Last Week</td>
                  <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500 text-right">185</td>
                  <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500 text-right">147</td>
                  <td className="px-3 py-2 whitespace-nowrap text-sm font-medium text-gray-900 text-right">79.5%</td>
                  <td className="px-3 py-2 whitespace-nowrap text-sm text-green-600 text-right">+1.8%</td>
                </tr>
                <tr>
                  <td className="px-3 py-2 whitespace-nowrap text-sm font-medium text-gray-900">2 Weeks Ago</td>
                  <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500 text-right">172</td>
                  <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500 text-right">133</td>
                  <td className="px-3 py-2 whitespace-nowrap text-sm font-medium text-gray-900 text-right">77.7%</td>
                  <td className="px-3 py-2 whitespace-nowrap text-sm text-red-600 text-right">-0.5%</td>
                </tr>
                <tr>
                  <td className="px-3 py-2 whitespace-nowrap text-sm font-medium text-gray-900">3 Weeks Ago</td>
                  <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500 text-right">198</td>
                  <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500 text-right">155</td>
                  <td className="px-3 py-2 whitespace-nowrap text-sm font-medium text-gray-900 text-right">78.2%</td>
                  <td className="px-3 py-2 whitespace-nowrap text-sm text-green-600 text-right">+2.1%</td>
                </tr>
                <tr>
                  <td className="px-3 py-2 whitespace-nowrap text-sm font-medium text-gray-900">Last Month</td>
                  <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500 text-right">764</td>
                  <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500 text-right">581</td>
                  <td className="px-3 py-2 whitespace-nowrap text-sm font-medium text-gray-900 text-right">76.1%</td>
                  <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500 text-right">—</td>
                </tr>
              </tbody>
            </table>
          </div>
          
          <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-base font-medium text-gray-900">Reconciliation Issues</h4>
              <button className="text-sm text-indigo-600 hover:text-indigo-800 flex items-center">
                <Download className="h-4 w-4 mr-1" />
                Export
              </button>
            </div>
            
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Issue Type
                  </th>
                  <th scope="col" className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Count
                  </th>
                  <th scope="col" className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    % of Issues
                  </th>
                  <th scope="col" className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Avg. Resolution Time
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {Object.entries(issueTypes)
                  .sort((a, b) => b[1] - a[1])
                  .map(([type, count], index) => {
                    const percentage = (count / Object.values(issueTypes).reduce((sum, val) => sum + val, 0)) * 100;
                    // Mock resolution time - would come from real data in a production app
                    const resolutionTimes = [45, 120, 65, 30, 95];
                    
                    return (
                      <tr key={index}>
                        <td className="px-3 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                          {type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500 text-right">{count}</td>
                        <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900 text-right">{percentage.toFixed(1)}%</td>
                        <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500 text-right">
                          {resolutionTimes[index % resolutionTimes.length]}s
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReconciliationMetricsPanel;