import React, { useState } from 'react';
import { ArrowLeft, Play, CheckCircle, XCircle, Code, FlaskConical, Ghost, Database, BarChart3, Server } from 'lucide-react';
import UnitTestRunner from './UnitTestRunner';
import E2ETestRunner from './E2ETestRunner';

interface TestingDashboardProps {
  onBack: () => void;
}

type TestingTab = 'overview' | 'unit-tests' | 'e2e-tests';

const TestingDashboard: React.FC<TestingDashboardProps> = ({ onBack }) => {
  const [activeTab, setActiveTab] = useState<TestingTab>('overview');
  
  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      <div className="px-4 py-4 bg-indigo-50 flex justify-between items-center">
        <div className="flex items-center">
          {activeTab !== 'overview' ? (
            <button 
              onClick={() => setActiveTab('overview')} 
              className="mr-2 text-indigo-600 hover:text-indigo-800"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
          ) : (
            <button onClick={onBack} className="mr-2 text-indigo-600 hover:text-indigo-800">
              <ArrowLeft className="h-5 w-5" />
            </button>
          )}
          <h2 className="text-lg font-medium text-gray-800">Testing Dashboard</h2>
        </div>
      </div>
      
      {activeTab === 'overview' && (
        <div className="p-4">
          <div className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-green-50 rounded-lg p-4 border border-green-200">
              <div className="flex items-center mb-1">
                <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                <h3 className="text-sm font-medium text-green-800">Passing Tests</h3>
              </div>
              <p className="text-2xl font-semibold text-green-900">42</p>
            </div>
            
            <div className="bg-red-50 rounded-lg p-4 border border-red-200">
              <div className="flex items-center mb-1">
                <XCircle className="h-5 w-5 text-red-500 mr-2" />
                <h3 className="text-sm font-medium text-red-800">Failing Tests</h3>
              </div>
              <p className="text-2xl font-semibold text-red-900">3</p>
            </div>
            
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <div className="flex items-center mb-1">
                <BarChart3 className="h-5 w-5 text-blue-500 mr-2" />
                <h3 className="text-sm font-medium text-blue-800">Code Coverage</h3>
              </div>
              <p className="text-2xl font-semibold text-blue-900">84%</p>
            </div>
            
            <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
              <div className="flex items-center mb-1">
                <Server className="h-5 w-5 text-purple-500 mr-2" />
                <h3 className="text-sm font-medium text-purple-800">CI Status</h3>
              </div>
              <p className="text-2xl font-semibold text-purple-900">Passing</p>
            </div>
          </div>
          
          <div className="mb-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div 
              className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => setActiveTab('unit-tests')}
            >
              <div className="flex items-center mb-4">
                <div className="bg-indigo-50 p-3 rounded-lg">
                  <FlaskConical className="h-6 w-6 text-indigo-600" />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">Unit Tests</h3>
                  <p className="text-sm text-gray-500">Test individual functions and components</p>
                </div>
              </div>
              
              <div className="flex items-center justify-between text-sm">
                <div className="flex space-x-2">
                  <span className="px-2 py-0.5 bg-green-100 text-green-800 rounded">30 passing</span>
                  <span className="px-2 py-0.5 bg-red-100 text-red-800 rounded">2 failing</span>
                </div>
                <button className="inline-flex items-center text-indigo-600 hover:text-indigo-800">
                  <Play className="h-4 w-4 mr-1" />
                  Run Tests
                </button>
              </div>
              
              <div className="mt-4 bg-gray-50 p-3 rounded text-xs text-gray-600 font-mono">
                <div className="flex items-center text-green-600 mb-1">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  <span>reconciliationEngine.test.ts • 15 tests passing</span>
                </div>
                <div className="flex items-center text-green-600 mb-1">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  <span>dataProcessing.test.ts • 8 tests passing</span>
                </div>
                <div className="flex items-center text-red-600">
                  <XCircle className="h-3 w-3 mr-1" />
                  <span>aiSimulator.test.ts • 2 tests failing</span>
                </div>
              </div>
            </div>
            
            <div 
              className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => setActiveTab('e2e-tests')}
            >
              <div className="flex items-center mb-4">
                <div className="bg-indigo-50 p-3 rounded-lg">
                  <Ghost className="h-6 w-6 text-indigo-600" />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">E2E Tests</h3>
                  <p className="text-sm text-gray-500">Test complete user workflows</p>
                </div>
              </div>
              
              <div className="flex items-center justify-between text-sm">
                <div className="flex space-x-2">
                  <span className="px-2 py-0.5 bg-green-100 text-green-800 rounded">12 passing</span>
                  <span className="px-2 py-0.5 bg-red-100 text-red-800 rounded">1 failing</span>
                </div>
                <button className="inline-flex items-center text-indigo-600 hover:text-indigo-800">
                  <Play className="h-4 w-4 mr-1" />
                  Run Tests
                </button>
              </div>
              
              <div className="mt-4 bg-gray-50 p-3 rounded text-xs text-gray-600 font-mono">
                <div className="flex items-center text-green-600 mb-1">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  <span>authentication.spec.ts • 5 tests passing</span>
                </div>
                <div className="flex items-center text-green-600 mb-1">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  <span>reconciliation.spec.ts • 4 tests passing</span>
                </div>
                <div className="flex items-center text-red-600">
                  <XCircle className="h-3 w-3 mr-1" />
                  <span>api-integration.spec.ts • 1 test failing</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Performance Testing Results</h3>
            
            <div className="space-y-4">
              <div className="bg-gray-50 p-3 rounded border border-gray-200">
                <div className="flex justify-between mb-2">
                  <h4 className="text-sm font-medium text-gray-700 flex items-center">
                    <Database className="h-4 w-4 mr-1.5 text-indigo-500" />
                    Large Dataset Processing
                  </h4>
                  <span className="text-xs text-green-700 bg-green-100 px-2 py-0.5 rounded-full">
                    Passing
                  </span>
                </div>
                <div className="text-sm text-gray-600">
                  <div className="flex justify-between mb-1">
                    <span>1,000 records</span>
                    <span className="font-medium">387ms</span>
                  </div>
                  <div className="flex justify-between mb-1">
                    <span>10,000 records</span>
                    <span className="font-medium">1.2s</span>
                  </div>
                  <div className="flex justify-between">
                    <span>100,000 records</span>
                    <span className="font-medium">5.8s</span>
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-50 p-3 rounded border border-gray-200">
                <div className="flex justify-between mb-2">
                  <h4 className="text-sm font-medium text-gray-700 flex items-center">
                    <Server className="h-4 w-4 mr-1.5 text-indigo-500" />
                    API Response Time
                  </h4>
                  <span className="text-xs text-green-700 bg-green-100 px-2 py-0.5 rounded-full">
                    Passing
                  </span>
                </div>
                <div className="text-sm text-gray-600">
                  <div className="flex justify-between mb-1">
                    <span>List Invoices (100 items)</span>
                    <span className="font-medium">245ms</span>
                  </div>
                  <div className="flex justify-between mb-1">
                    <span>Get Payment Details</span>
                    <span className="font-medium">120ms</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Reconciliation Process</span>
                    <span className="font-medium">890ms</span>
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-50 p-3 rounded border border-gray-200">
                <div className="flex justify-between mb-2">
                  <h4 className="text-sm font-medium text-gray-700 flex items-center">
                    <Code className="h-4 w-4 mr-1.5 text-indigo-500" />
                    Memory Usage
                  </h4>
                  <span className="text-xs text-yellow-700 bg-yellow-100 px-2 py-0.5 rounded-full">
                    Warning
                  </span>
                </div>
                <div className="text-sm text-gray-600">
                  <div className="flex justify-between mb-1">
                    <span>Initial Load</span>
                    <span className="font-medium">45 MB</span>
                  </div>
                  <div className="flex justify-between mb-1">
                    <span>After 10 Minutes</span>
                    <span className="font-medium">95 MB</span>
                  </div>
                  <div className="flex justify-between text-yellow-700">
                    <span>Large Dataset (100k records)</span>
                    <span className="font-medium">480 MB</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {activeTab === 'unit-tests' && <UnitTestRunner onBack={() => setActiveTab('overview')} />}
      
      {activeTab === 'e2e-tests' && <E2ETestRunner onBack={() => setActiveTab('overview')} />}
    </div>
  );
};

export default TestingDashboard;