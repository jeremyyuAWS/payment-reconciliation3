import React from 'react';
import { Brain, X, Sparkles, Bot, Zap, ChevronRight } from 'lucide-react';

interface WelcomeModalProps {
  onStart: () => void;
  onDismiss: () => void;
}

const WelcomeModal: React.FC<WelcomeModalProps> = ({ onStart, onDismiss }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full">
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-start">
            <div className="flex items-center">
              <Brain className="h-8 w-8 text-indigo-600 mr-3" />
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Welcome to Payment Reconciliation Agent</h2>
                <p className="text-gray-500 mt-1">Your AI-powered financial assistant</p>
              </div>
            </div>
            <button 
              onClick={onDismiss}
              className="text-gray-400 hover:text-gray-500"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Main Content */}
          <div className="mt-6">
            <div className="prose prose-indigo max-w-none">
              <p className="text-gray-600">
                Experience the power of AI in financial reconciliation. Our advanced system helps you:
              </p>
              
              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* AI Features */}
                <div className="bg-indigo-50 rounded-lg p-4 border border-indigo-100">
                  <h3 className="text-lg font-semibold text-indigo-900 flex items-center mb-3">
                    <Bot className="h-5 w-5 mr-2" />
                    AI-Powered Features
                  </h3>
                  <ul className="space-y-3">
                    <li className="flex items-start">
                      <Sparkles className="h-5 w-5 text-indigo-500 mr-2 mt-0.5" />
                      <span className="text-indigo-800">Intelligent payment matching with 95% accuracy</span>
                    </li>
                    <li className="flex items-start">
                      <Zap className="h-5 w-5 text-indigo-500 mr-2 mt-0.5" />
                      <span className="text-indigo-800">Natural language query processing for easy data access</span>
                    </li>
                    <li className="flex items-start">
                      <Brain className="h-5 w-5 text-indigo-500 mr-2 mt-0.5" />
                      <span className="text-indigo-800">Automated anomaly detection and fraud prevention</span>
                    </li>
                  </ul>
                </div>

                {/* Key Benefits */}
                <div className="bg-green-50 rounded-lg p-4 border border-green-100">
                  <h3 className="text-lg font-semibold text-green-900 flex items-center mb-3">
                    <ChevronRight className="h-5 w-5 mr-2" />
                    Key Benefits
                  </h3>
                  <ul className="space-y-3">
                    <li className="flex items-start">
                      <div className="h-5 w-5 bg-green-100 rounded-full flex items-center justify-center mr-2 mt-0.5">
                        <span className="text-green-800 font-medium">1</span>
                      </div>
                      <span className="text-green-800">Reduce manual reconciliation time by 80%</span>
                    </li>
                    <li className="flex items-start">
                      <div className="h-5 w-5 bg-green-100 rounded-full flex items-center justify-center mr-2 mt-0.5">
                        <span className="text-green-800 font-medium">2</span>
                      </div>
                      <span className="text-green-800">Identify discrepancies and errors automatically</span>
                    </li>
                    <li className="flex items-start">
                      <div className="h-5 w-5 bg-green-100 rounded-full flex items-center justify-center mr-2 mt-0.5">
                        <span className="text-green-800 font-medium">3</span>
                      </div>
                      <span className="text-green-800">Get real-time insights into your financial data</span>
                    </li>
                  </ul>
                </div>
              </div>

              {/* AI Assistant Preview */}
              <div className="mt-6 bg-gray-50 rounded-lg p-4 border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center mb-3">
                  <Bot className="h-5 w-5 mr-2" />
                  Meet Your AI Assistant
                </h3>
                <p className="text-gray-600 mb-3">
                  Ask questions in natural language and get instant answers. Try questions like:
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="bg-white p-3 rounded border border-gray-200">
                    <p className="text-sm text-gray-800">"Show me all unreconciled payments"</p>
                  </div>
                  <div className="bg-white p-3 rounded border border-gray-200">
                    <p className="text-sm text-gray-800">"Why wasn't invoice #1003 reconciled?"</p>
                  </div>
                  <div className="bg-white p-3 rounded border border-gray-200">
                    <p className="text-sm text-gray-800">"Which customers made duplicate payments?"</p>
                  </div>
                  <div className="bg-white p-3 rounded border border-gray-200">
                    <p className="text-sm text-gray-800">"Show me payments with amount mismatches"</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-8 flex justify-end space-x-3">
            <button
              onClick={onDismiss}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Skip Tour
            </button>
            <button
              onClick={onStart}
              className="px-4 py-2 bg-indigo-600 border border-transparent rounded-md text-white hover:bg-indigo-700"
            >
              Start Guided Tour
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WelcomeModal;