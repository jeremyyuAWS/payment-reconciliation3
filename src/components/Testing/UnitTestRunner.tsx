import React, { useState } from 'react';
import { ArrowLeft, Play, CheckCircle, XCircle, Loader, FileText, Code, Bug } from 'lucide-react';

interface UnitTestRunnerProps {
  onBack: () => void;
}

// Mock test suite data
const MOCK_TEST_SUITES = [
  {
    id: 'suite-1',
    name: 'Reconciliation Engine Tests',
    description: 'Tests for the core reconciliation logic',
    tests: [
      { id: 'test-1', name: 'should match invoices by exact reference', status: 'passed', duration: 12 },
      { id: 'test-2', name: 'should match invoices by fuzzy name matching', status: 'passed', duration: 18 },
      { id: 'test-3', name: 'should detect duplicate payments', status: 'passed', duration: 15 },
      { id: 'test-4', name: 'should handle partial payments correctly', status: 'passed', duration: 22 },
      { id: 'test-5', name: 'should assign correct confidence scores', status: 'failed', duration: 25, error: 'Expected confidence score to be 85 but got 75' }
    ]
  },
  {
    id: 'suite-2',
    name: 'Data Processing Tests',
    description: 'Tests for data import and export functionality',
    tests: [
      { id: 'test-6', name: 'should parse CSV files correctly', status: 'passed', duration: 30 },
      { id: 'test-7', name: 'should handle malformed CSV data', status: 'passed', duration: 28 },
      { id: 'test-8', name: 'should export reconciliation results to CSV', status: 'passed', duration: 35 }
    ]
  },
  {
    id: 'suite-3',
    name: 'User Interface Tests',
    description: 'Tests for UI components and interactions',
    tests: [
      { id: 'test-9', name: 'should render transaction list correctly', status: 'passed', duration: 45 },
      { id: 'test-10', name: 'should filter transactions based on search criteria', status: 'passed', duration: 40 },
      { id: 'test-11', name: 'should show transaction details when clicked', status: 'passed', duration: 38 },
      { id: 'test-12', name: 'should display correct charts based on data', status: 'pending', duration: 0 }
    ]
  },
  {
    id: 'suite-4',
    name: 'API Integration Tests',
    description: 'Tests for API integration with external services',
    tests: [
      { id: 'test-13', name: 'should connect to QuickBooks API', status: 'passed', duration: 120 },
      { id: 'test-14', name: 'should handle API authentication errors', status: 'passed', duration: 85 },
      { id: 'test-15', name: 'should retry failed API requests', status: 'failed', duration: 150, error: 'Timeout exceeded while waiting for API response' },
      { id: 'test-16', name: 'should process API response data correctly', status: 'passed', duration: 95 }
    ]
  }
];

const UnitTestRunner: React.FC<UnitTestRunnerProps> = ({ onBack }) => {
  const [testSuites, setTestSuites] = useState(MOCK_TEST_SUITES);
  const [activeTestSuite, setActiveTestSuite] = useState<string | null>(null);
  const [isRunningTests, setIsRunningTests] = useState(false);
  const [showErrorDetails, setShowErrorDetails] = useState<string | null>(null);
  
  const handleRunAllTests = () => {
    if (isRunningTests) return;
    
    setIsRunningTests(true);
    
    // Reset pending tests
    let updatedSuites = testSuites.map(suite => ({
      ...suite,
      tests: suite.tests.map(test => 
        test.status === 'pending' ? { ...test, status: 'running' } : test
      )
    }));
    setTestSuites(updatedSuites);
    
    // Simulate running tests with delays
    setTimeout(() => {
      updatedSuites = testSuites.map(suite => ({
        ...suite,
        tests: suite.tests.map(test => {
          if (test.status === 'pending' || test.status === 'running') {
            // Simulate 90% pass rate
            const passed = Math.random() > 0.1;
            return {
              ...test,
              status: passed ? 'passed' : 'failed',
              duration: Math.floor(Math.random() * 100) + 10,
              error: passed ? undefined : 'Assertion failed: expected values do not match'
            };
          }
          return test;
        })
      }));
      setTestSuites(updatedSuites);
      setIsRunningTests(false);
    }, 2000);
  };
  
  const handleRunSuite = (suiteId: string) => {
    if (isRunningTests) return;
    
    setIsRunningTests(true);
    
    // Reset tests in this suite to running
    const updatedSuites = testSuites.map(suite => {
      if (suite.id === suiteId) {
        return {
          ...suite,
          tests: suite.tests.map(test => ({ ...test, status: 'running' }))
        };
      }
      return suite;
    });
    setTestSuites(updatedSuites);
    
    // Simulate running tests with delays
    setTimeout(() => {
      const completedSuites = testSuites.map(suite => {
        if (suite.id === suiteId) {
          return {
            ...suite,
            tests: suite.tests.map(test => {
              // Simulate 90% pass rate
              const passed = Math.random() > 0.1;
              return {
                ...test,
                status: passed ? 'passed' : 'failed',
                duration: Math.floor(Math.random() * 100) + 10,
                error: passed ? undefined : 'Assertion failed: expected values do not match'
              };
            })
          };
        }
        return suite;
      });
      setTestSuites(completedSuites);
      setIsRunningTests(false);
    }, 1500);
  };
  
  // Calculate test statistics
  const getTestStats = () => {
    let total = 0;
    let passed = 0;
    let failed = 0;
    let pending = 0;
    let totalDuration = 0;
    
    testSuites.forEach(suite => {
      suite.tests.forEach(test => {
        total++;
        totalDuration += test.duration;
        
        if (test.status === 'passed') passed++;
        else if (test.status === 'failed') failed++;
        else if (test.status === 'pending') pending++;
      });
    });
    
    return {
      total,
      passed,
      failed,
      pending,
      passRate: total > 0 ? (passed / total) * 100 : 0,
      totalDuration
    };
  };
  
  const getTestStatusIcon = (status: string) => {
    switch (status) {
      case 'passed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'running':
        return <Loader className="h-4 w-4 text-indigo-500 animate-spin" />;
      case 'pending':
      default:
        return <div className="h-4 w-4 rounded-full border border-gray-300"></div>;
    }
  };
  
  const formatDuration = (ms: number) => {
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(1)}s`;
  };
  
  const stats = getTestStats();
  
  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      <div className="px-4 py-4 bg-indigo-50 flex justify-between items-center">
        <div className="flex items-center">
          <button onClick={onBack} className="mr-2 text-indigo-600 hover:text-indigo-800">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h2 className="text-lg font-medium text-gray-800">Test Runner</h2>
        </div>
        <button
          onClick={handleRunAllTests}
          disabled={isRunningTests}
          className={`inline-flex items-center px-3 py-1.5 border border-transparent rounded-md text-sm font-medium ${
            isRunningTests
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-indigo-600 text-white hover:bg-indigo-700'
          }`}
        >
          {isRunningTests ? (
            <>
              <Loader className="h-4 w-4 mr-1.5 animate-spin" />
              Running...
            </>
          ) : (
            <>
              <Play className="h-4 w-4 mr-1.5" />
              Run All Tests
            </>
          )}
        </button>
      </div>
      
      <div className="p-4">
        <div className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <h3 className="text-sm font-medium text-gray-700 mb-1">Total Tests</h3>
            <p className="text-2xl font-semibold text-gray-900">{stats.total}</p>
          </div>
          
          <div className="bg-green-50 rounded-lg p-4 border border-green-200">
            <h3 className="text-sm font-medium text-green-700 mb-1">Passed</h3>
            <p className="text-2xl font-semibold text-green-900">{stats.passed}</p>
          </div>
          
          <div className="bg-red-50 rounded-lg p-4 border border-red-200">
            <h3 className="text-sm font-medium text-red-700 mb-1">Failed</h3>
            <p className="text-2xl font-semibold text-red-900">{stats.failed}</p>
          </div>
          
          <div className="bg-indigo-50 rounded-lg p-4 border border-indigo-200">
            <h3 className="text-sm font-medium text-indigo-700 mb-1">Pass Rate</h3>
            <p className="text-2xl font-semibold text-indigo-900">{stats.passRate.toFixed(1)}%</p>
          </div>
        </div>
        
        <div className="space-y-4">
          {testSuites.map(suite => (
            <div key={suite.id} className="border border-gray-200 rounded-lg overflow-hidden">
              <div 
                className={`px-4 py-3 bg-gray-50 flex justify-between items-center cursor-pointer ${
                  activeTestSuite === suite.id ? 'border-b border-gray-200' : ''
                }`}
                onClick={() => setActiveTestSuite(activeTestSuite === suite.id ? null : suite.id)}
              >
                <div>
                  <h3 className="text-sm font-medium text-gray-800">{suite.name}</h3>
                  <p className="text-xs text-gray-500">{suite.description}</p>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-sm">
                    <span className="text-green-600">{suite.tests.filter(t => t.status === 'passed').length}</span>
                    {' / '}
                    <span className="text-red-600">{suite.tests.filter(t => t.status === 'failed').length}</span>
                    {' / '}
                    <span className="text-gray-600">{suite.tests.length}</span>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRunSuite(suite.id);
                    }}
                    disabled={isRunningTests}
                    className={`inline-flex items-center px-2 py-1 border border-transparent rounded text-xs ${
                      isRunningTests
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200'
                    }`}
                  >
                    {isRunningTests && suite.tests.some(t => t.status === 'running') ? (
                      <>
                        <Loader className="h-3 w-3 mr-1 animate-spin" />
                        Running
                      </>
                    ) : (
                      <>
                        <Play className="h-3 w-3 mr-1" />
                        Run
                      </>
                    )}
                  </button>
                </div>
              </div>
              
              {activeTestSuite === suite.id && (
                <ul className="divide-y divide-gray-200">
                  {suite.tests.map(test => (
                    <li key={test.id} className="px-4 py-3">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center">
                          {getTestStatusIcon(test.status)}
                          <span className="ml-2 text-sm text-gray-700">{test.name}</span>
                        </div>
                        <span className="text-xs text-gray-500">{formatDuration(test.duration)}</span>
                      </div>
                      
                      {test.status === 'failed' && (
                        <div className="mt-2">
                          <div 
                            className="text-xs text-red-600 flex items-center cursor-pointer"
                            onClick={() => setShowErrorDetails(showErrorDetails === test.id ? null : test.id)}
                          >
                            <Bug className="h-3 w-3 mr-1" />
                            {test.error}
                          </div>
                          
                          {showErrorDetails === test.id && (
                            <div className="mt-2 bg-red-50 p-2 rounded text-xs overflow-x-auto">
                              <div className="flex items-center text-red-800 mb-1">
                                <Code className="h-3 w-3 mr-1" />
                                <span className="font-medium">Error Details</span>
                              </div>
                              <pre className="text-red-800 whitespace-pre-wrap">
{`AssertionError: ${test.error}
    at Object.<anonymous> (/src/tests/${suite.name.toLowerCase().replace(/\s+/g, '-')}/${test.name.toLowerCase().replace(/\s+/g, '-')}.test.js:42:10)
    at Object.asyncJestTest (/node_modules/jest-jasmine2/build/jasmineAsyncInstall.js:106:37)
    at /node_modules/jest-jasmine2/build/queueRunner.js:45:12
    at new Promise (<anonymous>)
    at mapper (/node_modules/jest-jasmine2/build/queueRunner.js:28:19)
    at /node_modules/jest-jasmine2/build/queueRunner.js:75:41`}
                              </pre>
                            </div>
                          )}
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
        
        <div className="mt-6 bg-gray-50 rounded-lg p-4 border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-700">Test Coverage</h3>
            <span className="text-xs px-2 py-0.5 bg-yellow-100 text-yellow-800 rounded-full">85%</span>
          </div>
          
          <div className="space-y-2">
            <div>
              <div className="flex justify-between text-xs text-gray-500 mb-1">
                <span>Reconciliation Engine</span>
                <span>92%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-1.5">
                <div className="bg-green-500 h-1.5 rounded-full" style={{ width: '92%' }}></div>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between text-xs text-gray-500 mb-1">
                <span>UI Components</span>
                <span>78%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-1.5">
                <div className="bg-yellow-500 h-1.5 rounded-full" style={{ width: '78%' }}></div>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between text-xs text-gray-500 mb-1">
                <span>API Integration</span>
                <span>65%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-1.5">
                <div className="bg-red-500 h-1.5 rounded-full" style={{ width: '65%' }}></div>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between text-xs text-gray-500 mb-1">
                <span>Data Processing</span>
                <span>88%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-1.5">
                <div className="bg-green-500 h-1.5 rounded-full" style={{ width: '88%' }}></div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-4 flex justify-between text-sm text-gray-500">
          <div className="flex items-center">
            <FileText className="h-4 w-4 mr-1.5" />
            Last run: {new Date().toLocaleString()}
          </div>
          <div>
            Duration: {formatDuration(stats.totalDuration)}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UnitTestRunner;