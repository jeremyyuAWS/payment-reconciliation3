import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Filter, ReconciliationResult, ReconciliationSummary, ReconciliationRules } from '../types';
import { reconcilePayments, generateReconciliationSummary, filterReconciliationResults } from '../utils/reconciliationEngine';
import { invoices, payments, ledgerEntries } from '../data/sampleData';
import { 
  PieChart, InfoIcon, Filter as FilterIcon, Search, Upload, 
  Download, Brain, Settings, FolderUp, Link2, BarChart2 
} from 'lucide-react';

import FilterPanel from './FilterPanel';
import NaturalLanguageAssistant from './NaturalLanguageAssistant';
import CSVImporter from './CSVImporter';
import DataExporter from './DataExporter';
import AIInsightPanel from './AIInsightPanel';
import GuidedTour, { TourButton, WelcomeModal } from './GuidedTour';
import ReconciliationRulesPanel from './CustomRules/ReconciliationRulesPanel';
import BatchProcessingPanel from './BatchProcessing/BatchProcessingPanel';
import APIIntegrationPanel from './APIIntegration/APIIntegrationPanel';
import ReconciliationSummaryCard from './ReconciliationSummaryCard';
import CustomerAnalysisChart from './CustomerAnalysisChart';
import IssuesTrendChart from './IssuesTrendChart';
import TransactionList from './TransactionList';

interface ReconciliationDashboardProps {
  onResultsUpdate: (results: ReconciliationResult[]) => void;
}

const DEFAULT_RULES: ReconciliationRules = {
  enabledRules: {
    exactReferenceMatch: true,
    fuzzyCustomerMatch: true,
    amountTolerance: true,
    duplicateDetection: true,
    partialPaymentMatching: true,
    dateProximity: true
  },
  thresholds: {
    minConfidenceScore: 50,
    nameMatchSensitivity: 70,
    amountMatchTolerance: 1,
    dateDifferenceThreshold: 7,
    partialPaymentMinPercentage: 25
  },
  weights: {
    referenceMatch: 50,
    amountMatch: 30,
    nameMatch: 20,
    dateMatch: 10
  }
};

const ReconciliationDashboard: React.FC<ReconciliationDashboardProps> = ({ onResultsUpdate }) => {
  const navigate = useNavigate();
  const [results, setResults] = useState<ReconciliationResult[]>([]);
  const [filteredResults, setFilteredResults] = useState<ReconciliationResult[]>([]);
  const [summary, setSummary] = useState<ReconciliationSummary | null>(null);
  const [filter, setFilter] = useState<Filter>({});
  const [showFilters, setShowFilters] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<ReconciliationResult | null>(null);
  const [showImporter, setShowImporter] = useState(false);
  const [showExporter, setShowExporter] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [reconciliationRules, setReconciliationRules] = useState<ReconciliationRules>(DEFAULT_RULES);
  const [showRulesPanel, setShowRulesPanel] = useState(false);
  const [showBatchPanel, setShowBatchPanel] = useState(false);
  const [showAPIPanel, setShowAPIPanel] = useState(false);
  
  // Tour and welcome modal state
  const [tourEnabled, setTourEnabled] = useState(false);
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
  
  // Initial data state
  const [appData, setAppData] = useState({
    invoices: invoices,
    payments: payments,
    ledgerEntries: ledgerEntries
  });

  useEffect(() => {
    const processData = async () => {
      setIsLoading(true);
      
      try {
        // Simulate AI processing delay for more realistic feel
        await new Promise(resolve => setTimeout(resolve, 1200));
        
        // Run the reconciliation engine
        const reconciliationResults = reconcilePayments(
          appData.payments, 
          appData.invoices, 
          appData.ledgerEntries,
          reconciliationRules
        );
        
        setResults(reconciliationResults);
        setFilteredResults(reconciliationResults);
        onResultsUpdate(reconciliationResults);
        
        // Generate summary statistics
        const summaryData = generateReconciliationSummary(reconciliationResults);
        setSummary(summaryData);
      } catch (error) {
        console.error('Error processing data:', error);
      } finally {
        setIsLoading(false);
        
        // Show welcome modal on first load
        const hasSeenWelcome = localStorage.getItem('hasSeenWelcome');
        if (!hasSeenWelcome) {
          setTimeout(() => setShowWelcomeModal(true), 500);
        }
      }
    };
    
    processData();
  }, [appData, reconciliationRules, onResultsUpdate]);

  const handleFilterChange = (newFilter: Filter) => {
    setFilter(newFilter);
    const filtered = filterReconciliationResults(results, newFilter);
    setFilteredResults(filtered);
  };

  const toggleFilters = () => {
    setShowFilters(!showFilters);
    if (!showFilters) {
      setShowRulesPanel(false);
      setShowBatchPanel(false);
      setShowAPIPanel(false);
    }
  };

  const toggleImporter = () => {
    setShowImporter(!showImporter);
    if (showExporter) setShowExporter(false);
  };

  const toggleExporter = () => {
    setShowExporter(!showExporter);
    if (showImporter) setShowImporter(false);
  };
  
  const toggleRulesPanel = () => {
    setShowRulesPanel(!showRulesPanel);
    if (!showRulesPanel) {
      setShowFilters(false);
      setShowBatchPanel(false);
      setShowAPIPanel(false);
    }
  };
  
  const toggleBatchPanel = () => {
    setShowBatchPanel(!showBatchPanel);
    if (!showBatchPanel) {
      setShowFilters(false);
      setShowRulesPanel(false);
      setShowAPIPanel(false);
    }
  };
  
  const toggleAPIPanel = () => {
    setShowAPIPanel(!showAPIPanel);
    if (!showAPIPanel) {
      setShowFilters(false);
      setShowRulesPanel(false);
      setShowBatchPanel(false);
    }
  };

  const handleDataImport = (data: {
    invoices?: any[],
    payments?: any[],
    ledgerEntries?: any[]
  }) => {
    setAppData(prevData => ({
      invoices: data.invoices || prevData.invoices,
      payments: data.payments || prevData.payments,
      ledgerEntries: data.ledgerEntries || prevData.ledgerEntries
    }));
  };
  
  const handleRulesChange = (newRules: ReconciliationRules) => {
    setReconciliationRules(newRules);
    setShowRulesPanel(false); // Close the panel after saving
  };
  
  // Tour handlers
  const startTour = () => {
    setTourEnabled(true);
    setShowWelcomeModal(false);
  };
  
  const endTour = () => {
    setTourEnabled(false);
    localStorage.setItem('hasSeenWelcome', 'true');
  };
  
  const skipTour = () => {
    setTourEnabled(false);
    localStorage.setItem('hasSeenWelcome', 'true');
  };
  
  const dismissWelcome = () => {
    setShowWelcomeModal(false);
    localStorage.setItem('hasSeenWelcome', 'true');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-indigo-700 text-white shadow-md tour-dashboard-header">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <PieChart className="h-8 w-8" />
            <div>
              <h1 className="text-2xl font-bold">Payment Reconciliation Agent</h1>
              <p className="text-indigo-100 text-sm">AI-powered financial transaction matching</p>
            </div>
          </div>
          <div className="flex space-x-2 tour-import-export">
            <button
              onClick={toggleImporter}
              className="flex items-center px-3 py-2 border border-indigo-500 rounded text-indigo-100 hover:bg-indigo-600 transition-colors"
              title="Import Data"
            >
              <Upload className="h-4 w-4 mr-2" />
              Import
            </button>
            <button
              onClick={toggleExporter}
              className="flex items-center px-3 py-2 border border-indigo-500 rounded text-indigo-100 hover:bg-indigo-600 transition-colors"
              title="Export Data"
            >
              <Download className="h-4 w-4 mr-2" />
              Export
            </button>
            <button
              onClick={toggleFilters}
              className={`flex items-center px-3 py-2 border border-indigo-500 rounded text-indigo-100 hover:bg-indigo-600 transition-colors ${
                showFilters ? 'bg-indigo-800' : ''
              }`}
              title="Filter Results"
            >
              <FilterIcon className="h-4 w-4 mr-2" />
              Filters
            </button>
          </div>
        </div>
      </header>
      
      <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8 bg-white rounded-b-lg shadow-sm">
        <div className="flex space-x-4">
          <button
            onClick={toggleRulesPanel}
            className={`rules-config-button flex items-center px-3 py-2 text-sm rounded-md ${
              showRulesPanel 
                ? 'bg-indigo-100 text-indigo-700' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Settings className="h-4 w-4 mr-1.5" />
            Rules Configuration
          </button>
          <button
            onClick={toggleBatchPanel}
            className={`batch-process-button flex items-center px-3 py-2 text-sm rounded-md ${
              showBatchPanel 
                ? 'bg-indigo-100 text-indigo-700' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <FolderUp className="h-4 w-4 mr-1.5" />
            Batch Processing
          </button>
          <button
            onClick={toggleAPIPanel}
            className={`api-integration-button flex items-center px-3 py-2 text-sm rounded-md ${
              showAPIPanel 
                ? 'bg-indigo-100 text-indigo-700' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Link2 className="h-4 w-4 mr-1.5" />
            API Integrations
          </button>
          <button
            onClick={() => navigate('/analytics')}
            className="advanced-analytics-button flex items-center px-3 py-2 text-sm rounded-md bg-gray-100 text-gray-700 hover:bg-gray-200"
          >
            <BarChart2 className="h-4 w-4 mr-1.5" />
            Advanced Analytics
          </button>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8 space-y-6">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-12 bg-white rounded-lg shadow">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <Brain className="h-10 w-10 text-indigo-500 animate-pulse" />
              <div className="h-10 w-1"></div>
              <div className="h-4 w-4 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
              <div className="h-4 w-4 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
              <div className="h-4 w-4 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
            </div>
            <h2 className="text-xl font-medium text-gray-700 mb-2">AI Processing Financial Data</h2>
            <p className="text-gray-500 text-center max-w-md">
              Our AI is analyzing transactions, matching payments to invoices, and identifying potential reconciliation issues...
            </p>
          </div>
        ) : (
          <>
            {/* Configuration Panels */}
            {showRulesPanel && (
              <div className="mb-6">
                <ReconciliationRulesPanel 
                  rules={reconciliationRules}
                  onRulesChange={handleRulesChange}
                  onClose={toggleRulesPanel}
                />
              </div>
            )}
            
            {showBatchPanel && (
              <div className="mb-6">
                <BatchProcessingPanel onClose={toggleBatchPanel} />
              </div>
            )}
            
            {showAPIPanel && (
              <div className="mb-6">
                <APIIntegrationPanel onClose={toggleAPIPanel} />
              </div>
            )}
            
            {/* Import/Export Panels */}
            {showImporter && (
              <div>
                <CSVImporter onDataImport={handleDataImport} />
              </div>
            )}
            
            {showExporter && (
              <div>
                <DataExporter results={results} summary={summary} />
              </div>
            )}
          
            {/* Filter Panel */}
            {showFilters && (
              <FilterPanel 
                filter={filter} 
                onFilterChange={handleFilterChange} 
                onClose={toggleFilters}
              />
            )}

            {/* Summary Cards */}
            {summary && (
              <div className="tour-summary-cards">
                <ReconciliationSummaryCard summary={summary} />
              </div>
            )}

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 tour-charts">
              <CustomerAnalysisChart results={results} />
              <IssuesTrendChart results={results} />
            </div>

            {/* Transactions Table */}
            <div className="bg-white rounded-lg shadow overflow-hidden tour-transactions">
              <div className="px-4 py-5 sm:px-6 bg-gray-50 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">Transactions</h2>
                <p className="mt-1 text-sm text-gray-500">
                  {filteredResults.length} of {results.length} transactions displayed
                </p>
              </div>
              
              <TransactionList 
                results={filteredResults} 
                onSelectTransaction={setSelectedTransaction}
              />
            </div>

            {/* AI Assistant */}
            <div className="tour-ai-assistant">
              <NaturalLanguageAssistant results={results} />
            </div>
          </>
        )}
      </main>
      
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
                &times;
              </button>
            </div>
            <div className="px-6 py-4">
              <AIInsightPanel selectedTransaction={selectedTransaction} />
            </div>
          </div>
        </div>
      )}
      
      {/* Tour button */}
      {!isLoading && !tourEnabled && !showWelcomeModal && (
        <TourButton onClick={startTour} />
      )}
      
      {/* Guided tour */}
      <GuidedTour 
        enabled={tourEnabled}
        onComplete={endTour}
        onSkip={skipTour}
      />
      
      {/* Welcome modal */}
      {showWelcomeModal && (
        <WelcomeModal 
          onStart={startTour}
          onDismiss={dismissWelcome}
        />
      )}
    </div>
  );
};

export default ReconciliationDashboard;