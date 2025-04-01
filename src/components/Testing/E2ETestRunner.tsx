import React, { useState } from 'react';
import { ArrowLeft, Play, CheckCircle, XCircle, Loader, FileText, Code, LayoutGrid, Monitor, Clock } from 'lucide-react';

interface E2ETestRunnerProps {
  onBack: () => void;
}

// Mock E2E test data
const MOCK_E2E_TESTS = [
  {
    id: 'e2e-1',
    name: 'User Authentication Flow',
    description: 'Tests the complete authentication process including login, signup, and password reset',
    status: 'passed',
    duration: 5200,
    browsers: ['chrome', 'firefox', 'safari'],
    steps: [
      { name: 'Navigate to login page', status: 'passed' },
      { name: 'Fill login form with invalid credentials', status: 'passed' },
      { name: 'Verify error message is displayed', status: 'passed' },
      { name: 'Fill login form with valid credentials', status: 'passed' },
      { name: 'Verify redirect to dashboard', status: 'passed' },
      { name: 'Verify user information is displayed', status: 'passed' },
      { name: 'Log out and verify redirect to login page', status: 'passed' }
    ],
    screenshots: [
      { name: 'login-page.png', url: 'https://via.placeholder.com/800x600.png?text=Login+Page+Screenshot' },
      { name: 'dashboard.png', url: 'https://via.placeholder.com/800x600.png?text=Dashboard+Screenshot' }
    ]
  },
  {
    id: 'e2e-2',
    name: 'Reconciliation Workflow',
    description: 'Tests the complete workflow for reconciling payments with invoices',
    status: 'failed',
    duration: 8300,
    browsers: ['chrome', 'firefox'],
    steps: [
      { name: 'Navigate to reconciliation dashboard', status: 'passed' },
      { name: 'Upload sample CSV data', status: 'passed' },
      { name: 'Verify data is imported successfully', status: 'passed' },
      { name: 'Apply filters to show only unreconciled payments', status: 'passed' },
      { name: 'Select a payment for manual reconciliation', status: 'passed' },
      { name: 'Match to invoice and verify status update', status: 'failed', error: 'Timeout waiting for status update. Expected "Reconciled" but status remained "Unreconciled".' }
    ],
    screenshots: [
      { name: 'reconciliation-dashboard.png', url: 'https://via.placeholder.com/800x600.png?text=Reconciliation+Dashboard' },
      { name: 'error-state.png', url: 'https://via.placeholder.com/800x600.png?text=Error+State+Screenshot' }
    ]
  },
  {
    id: 'e2e-3',
    name: 'Report Generation',
    description: 'Tests the generation and export of reconciliation reports',
    status: 'passed',
    duration: 4500,
    browsers: ['chrome'],
    steps: [
      { name: 'Navigate to reports section', status: 'passed' },
      { name: 'Select report type and date range', status: 'passed' },
      { name: 'Generate report and verify data accuracy', status: 'passed' },
      { name: 'Export report as CSV', status: 'passed' },
      { name: 'Verify CSV contains correct data', status: 'passed' }
    ],
    screenshots: [
      { name: 'report-configuration.png', url: 'https://via.placeholder.com/800x600.png?text=Report+Configuration' },
      { name: 'generated-report.png', url: 'https://via.placeholder.com/800x600.png?text=Generated+Report' }
    ]
  },
  {
    id: 'e2e-4',
    name: 'API Integration Flow',
    description: 'Tests the integration with external accounting APIs',
    status: 'pending',
    duration: 0,
    browsers: ['chrome'],
    steps: [
      { name: 'Navigate to API settings', status: 'pending' },
      { name: 'Configure connection to QuickBooks', status: 'pending' },
      { name: 'Test connection and verify success', status: 'pending' },
      { name: 'Sync data and verify import', status: 'pending' },
      { name: 'Verify reconciliation with imported data', status: 'pending' }
    ],
    screenshots: []
  }
];

const E2ETestRunner: React.FC<E2ETestRunnerProps> = ({ onBack }) => {
  const [tests, setTests] = useState(MOCK_E2E_TESTS);
  const [activeTest, setActiveTest] = useState<string | null>(null);
  const [isRunningTests, setIsRunningTests] = useState(false);
  const [selectedScreenshot, setSelectedScreenshot] = useState<string | null>(null);
  
  const handleRunAllTests = () => {
    if (isRunningTests) return;
    
    setIsRunningTests(true);
    
    // Set pending tests to running
    const updatedTests = tests.map(test => ({
      ...test,
      status: test.status === 'pending' ? 'running' : test.status,
      steps: test.steps.map(step => ({
        ...step,
        status: step.status === 'pending' ? 'running' : step.status
      }))
    }));
    setTests(updatedTests);
    
    // Simulate running tests with a delay
    setTimeout(() => {
      const completedTests = tests.map(test => {
        if (test.status === 'pending' || test.status === 'running') {
          // Simulate 80% pass rate
          const passed = Math.random() > 0.2;
          
          // Generate random duration between 3-10 seconds
          const duration = Math.floor(Math.random() * 7000) + 3000;
          
          // If test fails, randomly pick a step to fail
          let failedStepIndex = -1;
          if (!passed) {
            failedStepIndex = Math.floor(Math.random() * test.steps.length);
          }
          
          return {
            ...test,
            status: passed ? 'passed' : 'failed',
            duration: duration,
            steps: test.steps.map((step, idx) => {
              if (idx <= failedStepIndex || passed) {
                return { ...step, status: 'passed' };
              } else if (idx === failedStepIndex + 1) {
                return { 
                  ...step, 
                  status: 'failed',
                  error: 'Assertion failed: element not found or condition not met'
                };
              } else {
                return { ...step, status: 'pending' };
              }
            }),
            // Add screenshots for newly completed tests
            screenshots: passed 
              ? [
                  ...test.screenshots, 
                  { 
                    name: `${test.name.toLowerCase().replace(/\s+/g, '-')}-complete.png`, 
                    url: 'https://via.placeholder.com/800x600.png?text=Test+Completed' 
                  }
                ]
              : [
                  ...test.screenshots, 
                  { 
                    name: `${test.name.toLowerCase().replace(/\s+/g, '-')}-error.png`, 
                    url: 'https://via.placeholder.com/800x600.png?text=Error+Screenshot' 
                  }
                ]
          };
        }
        return test;
      });
      
      setTests(completedTests);
      setIsRunningTests(false);
    }, 3000);
  };
  
  const handleRunTest = (testId: string) => {
    if (isRunningTests) return;
    
    setIsRunningTests(true);
    
    // Set the specific test to running
    const updatedTests = tests.map(test => {
      if (test.id === testId) {
        return {
          ...test,
          status: 'running',
          steps: test.steps.map(step => ({
            ...step,
            status: 'running'
          }))
        };
      }
      return test;
    });
    setTests(updatedTests);
    
    // Simulate running the test with delays for each step
    let currentTest = tests.find(t => t.id === testId)!;
    let currentStepIndex = 0;
    
    const runNextStep = () => {
      if (currentStepIndex >= currentTest.steps.length) {
        // All steps completed
        const finalTests = tests.map(test => {
          if (test.id === testId) {
            return {
              ...test,
              status: 'passed',
              duration: Math.floor(Math.random() * 7000) + 3000,
              steps: test.steps.map(step => ({
                ...step,
                status: 'passed'
              })),
              screenshots: [
                ...test.screenshots,
                { 
                  name: `${test.name.toLowerCase().replace(/\s+/g, '-')}-complete.png`, 
                  url: 'https://via.placeholder.com/800x600.png?text=Test+Completed' 
                }
              ]
            };
          }
          return test;
        });
        
        setTests(finalTests);
        setIsRunningTests(false);
        return;
      }
      
      // Update current step to passed
      const stepUpdatedTests = tests.map(test => {
        if (test.id === testId) {
          const newSteps = [...test.steps];
          newSteps[currentStepIndex] = {
            ...newSteps[currentStepIndex],
            status: 'passed'
          };
          
          return {
            ...test,
            steps: newSteps
          };
        }
        return test;
      });
      
      setTests(stepUpdatedTests);
      currentStepIndex++;
      
      // Randomly fail a step with 10% probability
      const shouldFail = Math.random() < 0.1 && currentStepIndex < currentTest.steps.length;
      
      if (shouldFail) {
        // Fail the current step
        const failedTests = stepUpdatedTests.map(test => {
          if (test.id === testId) {
            const newSteps = [...test.steps];
            if (currentStepIndex < newSteps.length) {
              newSteps[currentStepIndex] = {
                ...newSteps[currentStepIndex],
                status: 'failed',
                error: 'Assertion failed: element not found or condition not met'
              };
            }
            
            return {
              ...test,
              status: 'failed',
              steps: newSteps,
              screenshots: [
                ...test.screenshots,
                { 
                  name: `${test.name.toLowerCase().replace(/\s+/g, '-')}-error.png`, 
                  url: 'https://via.placeholder.com/800x600.png?text=Error+Screenshot' 
                }
              ]
            };
          }
          return test;
        });
        
        setTests(failedTests);
        setIsRunningTests(false);
        return;
      }
      
      // Continue to next step after a delay
      setTimeout(runNextStep, 500);
    };
    
    // Start the test execution
    setTimeout(runNextStep, 500);
  };
  
  // Calculate test statistics
  const getTestStats = () => {
    const passed = tests.filter(t => t.status === 'passed').length;
    const failed = tests.filter(t => t.status === 'failed').length;
    const pending = tests.filter(t => t.status === 'pending' || t.status === 'running').length;
    const total = tests.length;
    
    return {
      passed,
      failed,
      pending,
      total,
      passRate: total > 0 ? (passed / total) * 100 : 0,
      totalDuration: tests.reduce((sum, test) => sum + test.duration, 0)
    };
  };
  
  const getTestStatusIcon = (status: string) => {
    switch (status) {
      case 'passed':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'failed':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'running':
        return <Loader className="h-5 w-5 text-indigo-500 animate-spin" />;
      case 'pending':
      default:
        return <Clock className="h-5 w-5 text-gray-400" />;
    }
  };
  
  const getTestStatusClass = (status: string) => {
    switch (status) {
      case 'passed':
        return 'bg-green-100 text-green-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'running':
        return 'bg-indigo-100 text-indigo-800';
      case 'pending':
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  const formatDuration = (ms: number) => {
    if (ms === 0) return '-';
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(1)}s`;
  };
  
  const getBrowserIcon = (browser: string) => {
    switch (browser) {
      case 'chrome':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
            Chrome
          </span>
        );
      case 'firefox':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-orange-100 text-orange-800">
            Firefox
          </span>
        );
      case 'safari':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
            Safari
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
            {browser}
          </span>
        );
    }
  };
  
  const stats = getTestStats();
  
  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      <div className="px-4 py-4 bg-indigo-50 flex justify-between items-center">
        <div className="flex items-center">
          <button onClick={onBack} className="mr-2 text-indigo-600 hover:text-indigo-800">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h2 className="text-lg font-medium text-gray-800">E2E Test Runner</h2>
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
          
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <h3 className="text-sm font-medium text-gray-700 mb-1">Duration</h3>
            <p className="text-2xl font-semibold text-gray-900">{formatDuration(stats.totalDuration)}</p>
          </div>
        </div>
        
        <div className="space-y-6">
          {tests.map(test => (
            <div key={test.id} className="border border-gray-200 rounded-lg overflow-hidden">
              <div className="px-4 py-4 bg-gray-50 flex justify-between items-center">
                <div className="flex items-center">
                  {getTestStatusIcon(test.status)}
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-gray-800">{test.name}</h3>
                    <p className="text-xs text-gray-500">{test.description}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <div className="text-xs space-x-1">
                    {test.browsers.map(browser => (
                      <span key={browser}>{getBrowserIcon(browser)}</span>
                    ))}
                  </div>
                  
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTestStatusClass(test.status)}`}>
                    {test.status.charAt(0).toUpperCase() + test.status.slice(1)}
                  </span>
                  
                  <button
                    onClick={() => setActiveTest(activeTest === test.id ? null : test.id)}
                    className="inline-flex items-center px-2 py-1 border border-gray-300 rounded text-xs text-gray-700 bg-white hover:bg-gray-50"
                  >
                    {activeTest === test.id ? 'Hide Details' : 'View Details'}
                  </button>
                  
                  {test.status !== 'running' && (
                    <button
                      onClick={() => handleRunTest(test.id)}
                      disabled={isRunningTests}
                      className={`inline-flex items-center px-2 py-1 rounded text-xs ${
                        isRunningTests
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200'
                      }`}
                    >
                      <Play className="h-3 w-3 mr-1" />
                      Run
                    </button>
                  )}
                </div>
              </div>
              
              {activeTest === test.id && (
                <div className="px-4 py-4 border-t border-gray-200">
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Test Steps</h4>
                    <ul className="space-y-2">
                      {test.steps.map((step, index) => (
                        <li key={index} className="flex items-center">
                          <div className="flex-shrink-0 mr-2">
                            {step.status === 'passed' && <CheckCircle className="h-4 w-4 text-green-500" />}
                            {step.status === 'failed' && <XCircle className="h-4 w-4 text-red-500" />}
                            {step.status === 'running' && <Loader className="h-4 w-4 text-indigo-500 animate-spin" />}
                            {step.status === 'pending' && <div className="h-4 w-4 rounded-full border border-gray-300"></div>}
                          </div>
                          <div className="flex-1">
                            <span className="text-sm text-gray-800">{step.name}</span>
                            {step.error && (
                              <p className="text-xs text-red-600 mt-1">{step.error}</p>
                            )}
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  {test.screenshots.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Screenshots</h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {test.screenshots.map((screenshot, index) => (
                          <div 
                            key={index}
                            className="cursor-pointer border border-gray-200 rounded-md overflow-hidden hover:border-indigo-300"
                            onClick={() => setSelectedScreenshot(screenshot.url)}
                          >
                            <div className="relative pb-[56.25%]">
                              <img 
                                src={screenshot.url} 
                                alt={screenshot.name}
                                className="absolute h-full w-full object-cover"
                              />
                            </div>
                            <div className="p-2 text-xs truncate text-gray-600">
                              {screenshot.name}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <div className="mt-4 pt-4 border-t border-gray-200 flex justify-between items-center text-xs text-gray-500">
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-1.5" />
                      Duration: {formatDuration(test.duration)}
                    </div>
                    <div className="flex items-center">
                      <Monitor className="h-4 w-4 mr-1.5" />
                      Resolution: 1920x1080
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
        
        {/* Screenshot modal */}
        {selectedScreenshot && (
          <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-20 p-4" onClick={() => setSelectedScreenshot(null)}>
            <div className="bg-white rounded-lg overflow-hidden max-w-3xl w-full" onClick={e => e.stopPropagation()}>
              <div className="p-4 flex justify-between items-center bg-gray-50 border-b border-gray-200">
                <h3 className="text-sm font-medium text-gray-800">Test Screenshot</h3>
                <button 
                  onClick={() => setSelectedScreenshot(null)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <XCircle className="h-5 w-5" />
                </button>
              </div>
              <div className="p-4">
                <img 
                  src={selectedScreenshot} 
                  alt="Test Screenshot" 
                  className="w-full h-auto"
                />
              </div>
            </div>
          </div>
        )}
        
        <div className="mt-6 bg-indigo-50 p-4 rounded-lg border border-indigo-100">
          <h3 className="text-sm font-medium text-indigo-800 mb-2">E2E Test Configuration</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-indigo-800">
            <div className="bg-white bg-opacity-50 p-3 rounded">
              <h4 className="font-medium mb-1 flex items-center">
                <Monitor className="h-3 w-3 mr-1" />
                Browsers
              </h4>
              <ul className="space-y-1">
                <li>Chrome (latest)</li>
                <li>Firefox (latest)</li>
                <li>Safari (latest)</li>
              </ul>
            </div>
            <div className="bg-white bg-opacity-50 p-3 rounded">
              <h4 className="font-medium mb-1 flex items-center">
                <LayoutGrid className="h-3 w-3 mr-1" />
                Viewport Sizes
              </h4>
              <ul className="space-y-1">
                <li>Desktop: 1920x1080</li>
                <li>Tablet: 768x1024</li>
                <li>Mobile: 375x812</li>
              </ul>
            </div>
            <div className="bg-white bg-opacity-50 p-3 rounded">
              <h4 className="font-medium mb-1 flex items-center">
                <Clock className="h-3 w-3 mr-1" />
                Settings
              </h4>
              <ul className="space-y-1">
                <li>Timeout: 30 seconds</li>
                <li>Headless mode: Enabled</li>
                <li>Video recording: Enabled</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default E2ETestRunner;