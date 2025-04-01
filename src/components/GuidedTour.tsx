import React, { useState, useEffect } from 'react';
import Joyride, { CallBackProps, STATUS, Step } from 'react-joyride';
import { Info, X } from 'lucide-react';

interface GuidedTourProps {
  enabled: boolean;
  onComplete: () => void;
  onSkip: () => void;
}

const GuidedTour: React.FC<GuidedTourProps> = ({ enabled, onComplete, onSkip }) => {
  const [steps, setSteps] = useState<Step[]>([]);
  const [run, setRun] = useState(false);

  useEffect(() => {
    // Define tour steps once DOM is loaded
    setSteps([
      {
        target: '.tour-dashboard-header',
        content: 'Welcome to the Payment Reconciliation Agent! This AI-powered demo shows how machine learning can automate financial reconciliation tasks.',
        placement: 'bottom',
        disableBeacon: true,
      },
      {
        target: '.tour-summary-cards',
        content: 'Here you can see an overview of all your transactions, including how many have been successfully reconciled, partially reconciled, or remain unreconciled.',
        placement: 'bottom',
      },
      {
        target: '.tour-charts',
        content: 'These visualizations help you understand your reconciliation data at a glance. View payments by customer and spot trends in reconciliation issues over time.',
        placement: 'top',
      },
      {
        target: '.tour-transactions',
        content: 'All your transactions are listed here. You can sort by any column, filter the list, and click on any transaction to see detailed information.',
        placement: 'top',
      },
      {
        target: '.tour-ai-assistant',
        content: 'The AI Financial Assistant can answer questions about your reconciliation data in natural language. Try asking "Show me unreconciled payments" or "Why is invoice #1003 not fully reconciled?"',
        placement: 'top',
      },
      {
        target: '.tour-import-export',
        content: 'Import your own CSV data or export reconciliation results for further analysis.',
        placement: 'bottom',
      },
      // New feature tour steps with proper selectors
      {
        target: '.rules-config-button',
        content: 'Configure custom reconciliation rules to fine-tune how payments are matched to invoices. Adjust confidence thresholds, matching weights, and more.',
        placement: 'bottom',
      },
      {
        target: '.batch-process-button',
        content: 'Process multiple files at once for efficient data handling. Upload, validate, and process batches of invoices, payments, or ledger entries.',
        placement: 'bottom',
      },
      {
        target: '.api-integration-button',
        content: 'Connect with external accounting systems like QuickBooks, Xero, and more to automatically import and sync your financial data.',
        placement: 'bottom',
      },
      {
        target: '.advanced-analytics-button',
        content: 'Explore in-depth visualizations including transaction flow charts and time-series analysis to gain deeper insights into your reconciliation data.',
        placement: 'bottom',
      },
      {
        target: '.performance-button',
        content: 'Monitor system performance including cache statistics, background task processing, and resource utilization to optimize your experience.',
        placement: 'bottom',
      },
      {
        target: '.testing-button',
        content: 'Access comprehensive testing tools to validate your reconciliation rules and data handling with unit tests and end-to-end tests.',
        placement: 'bottom',
      }
    ]);

    // Start the tour when enabled
    if (enabled) {
      setRun(true);
    } else {
      setRun(false);
    }
  }, [enabled]);

  const handleJoyrideCallback = (data: CallBackProps) => {
    const { status } = data;
    
    if ([STATUS.FINISHED, STATUS.SKIPPED].includes(status)) {
      setRun(false);
      
      if (status === STATUS.FINISHED) {
        onComplete();
      } else {
        onSkip();
      }
    }
  };

  return (
    <>
      <Joyride
        steps={steps}
        run={run}
        continuous={true}
        showProgress={true}
        showSkipButton={true}
        callback={handleJoyrideCallback}
        styles={{
          options: {
            primaryColor: '#4f46e5',
            zIndex: 1000,
          },
          tooltipContainer: {
            textAlign: 'left',
          },
          buttonNext: {
            backgroundColor: '#4f46e5',
          },
          buttonBack: {
            marginRight: 10,
          },
        }}
        locale={{
          last: 'Finish',
          skip: 'Skip tour',
        }}
      />
    </>
  );
};

// Floating button to start the tour
export const TourButton: React.FC<{ onClick: () => void }> = ({ onClick }) => {
  return (
    <div className="fixed right-5 bottom-5 z-10">
      <button
        onClick={onClick}
        className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-full p-3 shadow-lg flex items-center space-x-2"
        title="Start guided tour"
      >
        <Info className="h-5 w-5" />
        <span className="mr-1">Tour</span>
      </button>
    </div>
  );
};

// Welcome modal that appears on first visit
export const WelcomeModal: React.FC<{ onStart: () => void; onDismiss: () => void }> = ({ onStart, onDismiss }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md mx-4 p-6">
        <div className="flex justify-between items-start">
          <h2 className="text-xl font-bold text-gray-900">Welcome to Payment Reconciliation Agent</h2>
          <button onClick={onDismiss} className="text-gray-400 hover:text-gray-500">
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <div className="mt-4">
          <p className="text-gray-600 mb-3">
            This AI-powered demo application automates the reconciliation of payments, invoices, and ledger entries.
          </p>
          <p className="text-gray-600 mb-3">
            It demonstrates how machine learning can be used to identify and explain financial discrepancies such as:
          </p>
          <ul className="list-disc pl-5 mb-4 text-gray-600">
            <li>Duplicate payments</li>
            <li>Mismatched amounts</li>
            <li>Missing ledger entries</li>
            <li>Customer name discrepancies</li>
          </ul>
          <p className="text-gray-600 mb-3">
            New features include:
          </p>
          <ul className="list-disc pl-5 mb-4 text-gray-600">
            <li>Custom reconciliation rules configuration</li>
            <li>Batch processing for multiple files</li>
            <li>External API integrations</li>
            <li>Advanced visualization and analytics</li>
            <li>Performance monitoring tools</li>
            <li>Unit and E2E testing frameworks</li>
          </ul>
          <p className="text-gray-600 mb-4">
            Would you like a guided tour of the application's features?
          </p>
        </div>
        
        <div className="flex justify-end space-x-3 mt-4">
          <button
            onClick={onDismiss}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            No, thanks
          </button>
          <button
            onClick={onStart}
            className="px-4 py-2 bg-indigo-600 border border-transparent rounded-md text-white hover:bg-indigo-700"
          >
            Start tour
          </button>
        </div>
      </div>
    </div>
  );
};

export default GuidedTour;