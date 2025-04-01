import React, { useState } from 'react';
import { ReconciliationResult, ReconciliationSummary } from '../../types';
import ReconciliationSummaryCard from '../ReconciliationSummaryCard';
import CustomerAnalysisChart from '../CustomerAnalysisChart';
import IssuesTrendChart from '../IssuesTrendChart';
import TransactionList from '../TransactionList';
import NaturalLanguageAssistant from '../NaturalLanguageAssistant';
import AIInsightPanel from '../AIInsightPanel';
import { X } from 'lucide-react';

interface DashboardContentProps {
  results: ReconciliationResult[];
  summary: ReconciliationSummary | null;
  isLoading: boolean;
}

const DashboardContent: React.FC<DashboardContentProps> = ({ results, summary, isLoading }) => {
  const [selectedTransaction, setSelectedTransaction] = useState<ReconciliationResult | null>(null);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {summary && <ReconciliationSummaryCard summary={summary} />}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CustomerAnalysisChart results={results} />
        <IssuesTrendChart results={results} />
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="px-4 py-5 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Transactions</h2>
        </div>
        <TransactionList 
          results={results} 
          onSelectTransaction={setSelectedTransaction}
        />
      </div>

      <NaturalLanguageAssistant results={results} />

      {/* Transaction Detail Modal */}
      {selectedTransaction && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[80vh] overflow-auto">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-medium text-gray-900">
                Transaction Details
              </h3>
              <button 
                onClick={() => setSelectedTransaction(null)}
                className="text-gray-400 hover:text-gray-500"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <div className="px-6 py-4">
              <AIInsightPanel selectedTransaction={selectedTransaction} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardContent;