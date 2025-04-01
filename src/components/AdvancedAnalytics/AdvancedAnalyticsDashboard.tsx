import React, { useState } from 'react';
import { ArrowLeft, BarChart2, PieChart, TrendingUp, Network, AlertTriangle, FileText, Calendar } from 'lucide-react';
import { ReconciliationResult, ReconciliationSummary } from '../../types';
import TimeSeriesAnalysisChart from '../AdvancedVisualization/TimeSeriesAnalysisChart';
import RelationshipFlowChart from '../AdvancedVisualization/RelationshipFlowChart';
import AnomalyDetectionPanel from './AnomalyDetectionPanel';
import PaymentPredictionModel from './PaymentPredictionModel';
import EntityResolutionDashboard from './EntityResolutionDashboard';
import ReconciliationMetricsPanel from './ReconciliationMetricsPanel';
import CustomerAnalysisChart from '../CustomerAnalysisChart';
import IssuesTrendChart from '../IssuesTrendChart';
import TransactionList from '../TransactionList';
import ReconciliationSummaryCard from '../ReconciliationSummaryCard';
import { generateReconciliationSummary } from '../../utils/reconciliationEngine';

interface AdvancedAnalyticsDashboardProps {
  results: ReconciliationResult[];
  onBack: () => void;
}

const AdvancedAnalyticsDashboard: React.FC<AdvancedAnalyticsDashboardProps> = ({ results, onBack }) => {
  const [activeView, setActiveView] = useState<string>('overview');
  const [selectedTransaction, setSelectedTransaction] = useState<ReconciliationResult | null>(null);
  
  // Generate summary
  const summary = generateReconciliationSummary(results);
  
  const renderActiveView = () => {
    switch (activeView) {
      case 'time-series':
        return <TimeSeriesAnalysisChart results={results} />;
      case 'relationship':
        return <RelationshipFlowChart results={results} />;
      case 'anomalies':
        return <AnomalyDetectionPanel results={results} />;
      case 'predictions':
        return <PaymentPredictionModel results={results} />;
      case 'entity-resolution':
        return <EntityResolutionDashboard results={results} nameVariations={[]} />;
      case 'metrics':
        return <ReconciliationMetricsPanel results={results} />;
      default:
        return (
          <div className="space-y-6">
            {/* Summary Card */}
            <ReconciliationSummaryCard summary={summary} />
            
            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <CustomerAnalysisChart results={results} />
              <IssuesTrendChart results={results} />
            </div>
            
            {/* Transactions */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="px-4 py-5 sm:px-6 bg-gray-50 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">Transactions</h2>
                <p className="mt-1 text-sm text-gray-500">
                  {results.length} transactions
                </p>
              </div>
              <TransactionList 
                results={results} 
                onSelectTransaction={setSelectedTransaction}
              />
            </div>
          </div>
        );
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <button
                onClick={onBack}
                className="mr-4 text-gray-400 hover:text-gray-500"
              >
                <ArrowLeft className="h-6 w-6" />
              </button>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Advanced Analytics Dashboard</h1>
                <p className="text-sm text-gray-500">AI-powered financial analysis and insights</p>
              </div>
            </div>
            
            <div className="flex space-x-2">
              <button
                onClick={() => setActiveView('overview')}
                className={`px-3 py-2 text-sm font-medium rounded-md ${
                  activeView === 'overview' 
                    ? 'bg-indigo-100 text-indigo-700' 
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveView('relationship')}
                className={`px-3 py-2 text-sm font-medium rounded-md ${
                  activeView === 'relationship' 
                    ? 'bg-indigo-100 text-indigo-700' 
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                }`}
              >
                <span className="flex items-center">
                  <Network className="h-4 w-4 mr-1.5" />
                  Flow Analysis
                </span>
              </button>
              <button
                onClick={() => setActiveView('time-series')}
                className={`px-3 py-2 text-sm font-medium rounded-md ${
                  activeView === 'time-series' 
                    ? 'bg-indigo-100 text-indigo-700' 
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                }`}
              >
                <span className="flex items-center">
                  <Calendar className="h-4 w-4 mr-1.5" />
                  Time Series
                </span>
              </button>
              <button
                onClick={() => setActiveView('anomalies')}
                className={`px-3 py-2 text-sm font-medium rounded-md ${
                  activeView === 'anomalies' 
                    ? 'bg-indigo-100 text-indigo-700' 
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                }`}
              >
                <span className="flex items-center">
                  <AlertTriangle className="h-4 w-4 mr-1.5" />
                  Anomalies
                </span>
              </button>
              <button
                onClick={() => setActiveView('entity-resolution')}
                className={`px-3 py-2 text-sm font-medium rounded-md ${
                  activeView === 'entity-resolution' 
                    ? 'bg-indigo-100 text-indigo-700' 
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                }`}
              >
                <span className="flex items-center">
                  <BarChart2 className="h-4 w-4 mr-1.5" />
                  Entity Analysis
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        {renderActiveView()}
      </div>
    </div>
  );
};

export default AdvancedAnalyticsDashboard;