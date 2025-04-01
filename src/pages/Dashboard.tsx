import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Filter, ReconciliationResult, ReconciliationSummary } from '../types';
import { reconcilePayments, generateReconciliationSummary } from '../utils/reconciliationEngine';
import { invoices, payments, ledgerEntries } from '../data/sampleData';
import DashboardHeader from '../components/Dashboard/DashboardHeader';
import DashboardContent from '../components/Dashboard/DashboardContent';
import WelcomeDashboardModal from '../components/WelcomeDashboardModal';
import { HelpCircle } from 'lucide-react';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [results, setResults] = useState<ReconciliationResult[]>([]);
  const [summary, setSummary] = useState<ReconciliationSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showWelcome, setShowWelcome] = useState(() => {
    return !localStorage.getItem('hasSeenDashboardWelcome');
  });

  useEffect(() => {
    const processData = async () => {
      setIsLoading(true);
      
      try {
        // Simulate AI processing delay
        await new Promise(resolve => setTimeout(resolve, 1200));
        
        // Run reconciliation
        const reconciliationResults = reconcilePayments(payments, invoices, ledgerEntries);
        setResults(reconciliationResults);
        
        // Generate summary
        const summaryData = generateReconciliationSummary(reconciliationResults);
        setSummary(summaryData);
      } catch (error) {
        console.error('Error processing data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    processData();
  }, []);

  const handleCloseWelcome = () => {
    setShowWelcome(false);
    localStorage.setItem('hasSeenDashboardWelcome', 'true');
  };

  return (
    <div className="space-y-6">
      <DashboardHeader />
      <DashboardContent 
        results={results}
        summary={summary}
        isLoading={isLoading}
      />
      {showWelcome && <WelcomeDashboardModal onClose={handleCloseWelcome} />}
      
      {/* Floating help button */}
      <button
        onClick={() => setShowWelcome(true)}
        className="fixed right-5 bottom-5 bg-indigo-600 text-white rounded-full p-3 shadow-lg hover:bg-indigo-700 flex items-center space-x-2"
        title="Show AI Features Guide"
      >
        <HelpCircle className="h-5 w-5" />
        <span className="mr-1">AI Features</span>
      </button>
    </div>
  );
};

export default Dashboard;