import React, { useState, useEffect } from 'react';
import { Activity, Clock, Server, Database, Zap, BarChart4, ArrowLeft } from 'lucide-react';
import { DataCache, globalCache } from './DataCache';
import { backgroundWorker } from './BackgroundWorker';

interface PerformanceMonitorPanelProps {
  onBack: () => void;
}

const PerformanceMonitorPanel: React.FC<PerformanceMonitorPanelProps> = ({ onBack }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'cache' | 'tasks' | 'metrics'>('overview');
  const [refreshCounter, setRefreshCounter] = useState(0);
  const [performanceData, setPerformanceData] = useState({
    memoryUsage: 0,
    cpuLoad: 0,
    renderTime: 0,
    responseTime: 0,
    queryCount: 0,
    pageLoads: 0
  });
  
  // Collect performance metrics
  useEffect(() => {
    // Simulate collecting performance metrics
    const interval = setInterval(() => {
      setPerformanceData({
        memoryUsage: Math.round(Math.random() * 40) + 60, // 60-100 MB
        cpuLoad: Math.round(Math.random() * 20) + 5, // 5-25%
        renderTime: Math.round(Math.random() * 100) + 50, // 50-150ms
        responseTime: Math.round(Math.random() * 200) + 100, // 100-300ms
        queryCount: Math.round(Math.random() * 10) + 5, // 5-15 queries
        pageLoads: Math.round(Math.random() * 5) + 1 // 1-6 page loads
      });
    }, 5000);
    
    return () => clearInterval(interval);
  }, []);
  
  // Refresh data
  const handleRefresh = () => {
    setRefreshCounter(prev => prev + 1);
  };
  
  // Get cache statistics
  const cacheStats = globalCache.getStats();
  
  // Get background worker statistics
  const workerStats = backgroundWorker.getStats();
  
  // Format bytes to human readable
  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };
  
  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      <div className="px-4 py-4 bg-indigo-50 flex justify-between items-center">
        <div className="flex items-center">
          <button onClick={onBack} className="mr-2 text-indigo-600 hover:text-indigo-800">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h2 className="text-lg font-medium text-gray-800">Performance Monitor</h2>
        </div>
        <button
          onClick={handleRefresh}
          className="inline-flex items-center px-3 py-1.5 border border-indigo-500 text-indigo-500 hover:bg-indigo-50 rounded-md text-sm"
        >
          Refresh
        </button>
      </div>
      
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex">
          {[
            { id: 'overview', label: 'Overview', icon: <Activity className="h-4 w-4 mr-1" /> },
            { id: 'cache', label: 'Cache Stats', icon: <Database className="h-4 w-4 mr-1" /> },
            { id: 'tasks', label: 'Background Tasks', icon: <Server className="h-4 w-4 mr-1" /> },
            { id: 'metrics', label: 'Performance Metrics', icon: <BarChart4 className="h-4 w-4 mr-1" /> },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`
                flex items-center whitespace-nowrap py-4 px-4 border-b-2 font-medium text-sm
                ${activeTab === tab.id
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
              `}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </nav>
      </div>
      
      <div className="p-4">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-gray-700">Memory Usage</h3>
                  <Server className="h-5 w-5 text-indigo-500" />
                </div>
                <div className="flex items-end">
                  <p className="text-2xl font-semibold text-gray-900">{performanceData.memoryUsage} MB</p>
                  <p className="text-xs text-gray-500 ml-2 mb-1">of 512 MB</p>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
                  <div 
                    className="bg-indigo-600 h-2.5 rounded-full" 
                    style={{ width: `${(performanceData.memoryUsage / 512) * 100}%` }}
                  ></div>
                </div>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-gray-700">CPU Load</h3>
                  <Zap className="h-5 w-5 text-yellow-500" />
                </div>
                <div className="flex items-end">
                  <p className="text-2xl font-semibold text-gray-900">{performanceData.cpuLoad}%</p>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
                  <div 
                    className={`h-2.5 rounded-full ${
                      performanceData.cpuLoad > 80 ? 'bg-red-500' : 
                      performanceData.cpuLoad > 50 ? 'bg-yellow-500' : 
                      'bg-green-500'
                    }`}
                    style={{ width: `${performanceData.cpuLoad}%` }}
                  ></div>
                </div>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-gray-700">Response Time</h3>
                  <Clock className="h-5 w-5 text-green-500" />
                </div>
                <div className="flex items-end">
                  <p className="text-2xl font-semibold text-gray-900">{performanceData.responseTime} ms</p>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
                  <div 
                    className={`h-2.5 rounded-full ${
                      performanceData.responseTime > 300 ? 'bg-red-500' : 
                      performanceData.responseTime > 200 ? 'bg-yellow-500' : 
                      'bg-green-500'
                    }`}
                    style={{ width: `${(performanceData.responseTime / 500) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-4 rounded-md border border-gray-200">
              <h3 className="text-sm font-medium text-gray-700 mb-4">System Status Summary</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="text-xs font-medium text-gray-500 uppercase mb-2">Cache Performance</h4>
                  <dl className="grid grid-cols-2 gap-4">
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Cache Size</dt>
                      <dd className="mt-1 text-lg font-semibold text-gray-900">{cacheStats.size} / {cacheStats.maxSize}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Hit Rate</dt>
                      <dd className="mt-1 text-lg font-semibold text-gray-900">{cacheStats.hitRate.toFixed(1)}%</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Cache Hits</dt>
                      <dd className="mt-1 text-lg font-semibold text-gray-900">{cacheStats.hits}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Cache Misses</dt>
                      <dd className="mt-1 text-lg font-semibold text-gray-900">{cacheStats.misses}</dd>
                    </div>
                  </dl>
                </div>
                
                <div>
                  <h4 className="text-xs font-medium text-gray-500 uppercase mb-2">Background Tasks</h4>
                  <dl className="grid grid-cols-2 gap-4">
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Queue Length</dt>
                      <dd className="mt-1 text-lg font-semibold text-gray-900">{workerStats.queueLength}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Active Tasks</dt>
                      <dd className="mt-1 text-lg font-semibold text-gray-900">{workerStats.activeTasks}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Registered Handlers</dt>
                      <dd className="mt-1 text-lg font-semibold text-gray-900">{workerStats.registeredHandlers.length}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Processing Status</dt>
                      <dd className="mt-1 text-lg font-semibold text-gray-900">
                        {workerStats.isProcessing ? (
                          <span className="text-green-600">Active</span>
                        ) : (
                          <span className="text-gray-500">Idle</span>
                        )}
                      </dd>
                    </div>
                  </dl>
                </div>
              </div>
            </div>
            
            <div className="bg-indigo-50 p-4 rounded-md border border-indigo-100">
              <h3 className="text-sm font-medium text-indigo-800 mb-2">Performance Optimization Tips</h3>
              <ul className="space-y-1 text-sm text-indigo-800">
                <li className="flex items-start">
                  <span className="inline-block h-4 w-4 rounded-full bg-indigo-200 mr-2 mt-0.5 flex-shrink-0"></span>
                  Use pagination for large data sets to reduce rendering time
                </li>
                <li className="flex items-start">
                  <span className="inline-block h-4 w-4 rounded-full bg-indigo-200 mr-2 mt-0.5 flex-shrink-0"></span>
                  Enable caching for frequently accessed data
                </li>
                <li className="flex items-start">
                  <span className="inline-block h-4 w-4 rounded-full bg-indigo-200 mr-2 mt-0.5 flex-shrink-0"></span>
                  Offload heavy computations to background workers
                </li>
                <li className="flex items-start">
                  <span className="inline-block h-4 w-4 rounded-full bg-indigo-200 mr-2 mt-0.5 flex-shrink-0"></span>
                  Use virtualization for rendering large lists
                </li>
              </ul>
            </div>
          </div>
        )}
        
        {activeTab === 'cache' && (
          <div className="space-y-6">
            <div className="bg-white p-4 rounded-md border border-gray-200">
              <h3 className="text-sm font-medium text-gray-700 mb-4">Cache Statistics</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-gray-50 p-3 rounded-md">
                  <h4 className="text-xs font-medium text-gray-500 uppercase mb-1">Cache Size</h4>
                  <p className="text-2xl font-semibold text-gray-900">{cacheStats.size} / {cacheStats.maxSize}</p>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                    <div 
                      className="bg-indigo-600 h-2 rounded-full" 
                      style={{ width: `${(cacheStats.size / cacheStats.maxSize) * 100}%` }}
                    ></div>
                  </div>
                </div>
                
                <div className="bg-gray-50 p-3 rounded-md">
                  <h4 className="text-xs font-medium text-gray-500 uppercase mb-1">Hit Rate</h4>
                  <p className="text-2xl font-semibold text-gray-900">{cacheStats.hitRate.toFixed(1)}%</p>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                    <div 
                      className={`h-2 rounded-full ${
                        cacheStats.hitRate > 80 ? 'bg-green-500' : 
                        cacheStats.hitRate > 50 ? 'bg-yellow-500' : 
                        'bg-red-500'
                      }`}
                      style={{ width: `${cacheStats.hitRate}%` }}
                    ></div>
                  </div>
                </div>
                
                <div className="bg-gray-50 p-3 rounded-md">
                  <h4 className="text-xs font-medium text-gray-500 uppercase mb-1">TTL (Time to Live)</h4>
                  <p className="text-2xl font-semibold text-gray-900">{(cacheStats.ttl / 1000 / 60).toFixed(0)} min</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="text-xs font-medium text-gray-500 uppercase mb-2">Access Stats</h4>
                  <div className="bg-gray-50 p-3 rounded-md">
                    <div className="flex justify-between mb-2">
                      <span className="text-sm text-gray-500">Cache Hits</span>
                      <span className="text-sm font-medium text-gray-900">{cacheStats.hits}</span>
                    </div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm text-gray-500">Cache Misses</span>
                      <span className="text-sm font-medium text-gray-900">{cacheStats.misses}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Total Requests</span>
                      <span className="text-sm font-medium text-gray-900">{cacheStats.hits + cacheStats.misses}</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="text-xs font-medium text-gray-500 uppercase mb-2">Cache Control</h4>
                  <div className="bg-gray-50 p-3 rounded-md">
                    <div className="flex space-x-2">
                      <button
                        className="px-3 py-1.5 bg-indigo-600 text-white text-sm rounded hover:bg-indigo-700"
                        onClick={() => {
                          globalCache.clear();
                          handleRefresh();
                        }}
                      >
                        Clear Cache
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-4 rounded-md border border-gray-200">
              <h3 className="text-sm font-medium text-gray-700 mb-4">Cached Items</h3>
              
              {cacheStats.items.length > 0 ? (
                <div className="max-h-64 overflow-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Cache Key
                        </th>
                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {cacheStats.items.map((key, index) => (
                        <tr key={index}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {key}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <button
                              className="text-red-600 hover:text-red-900"
                              onClick={() => {
                                globalCache.delete(key);
                                handleRefresh();
                              }}
                            >
                              Remove
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">Cache is empty</p>
              )}
            </div>
          </div>
        )}
        
        {activeTab === 'tasks' && (
          <div className="space-y-6">
            <div className="bg-white p-4 rounded-md border border-gray-200">
              <h3 className="text-sm font-medium text-gray-700 mb-4">Background Worker Status</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-gray-50 p-3 rounded-md">
                  <h4 className="text-xs font-medium text-gray-500 uppercase mb-1">Queue Length</h4>
                  <p className="text-2xl font-semibold text-gray-900">{workerStats.queueLength}</p>
                </div>
                
                <div className="bg-gray-50 p-3 rounded-md">
                  <h4 className="text-xs font-medium text-gray-500 uppercase mb-1">Active Tasks</h4>
                  <p className="text-2xl font-semibold text-gray-900">{workerStats.activeTasks}</p>
                </div>
                
                <div className="bg-gray-50 p-3 rounded-md">
                  <h4 className="text-xs font-medium text-gray-500 uppercase mb-1">Status</h4>
                  <p className="text-2xl font-semibold text-gray-900">
                    {workerStats.isProcessing ? (
                      <span className="text-green-600">Processing</span>
                    ) : (
                      <span className="text-gray-500">Idle</span>
                    )}
                  </p>
                </div>
              </div>
              
              <div>
                <h4 className="text-xs font-medium text-gray-500 uppercase mb-2">Registered Task Handlers</h4>
                <div className="bg-gray-50 p-3 rounded-md">
                  {workerStats.registeredHandlers.length > 0 ? (
                    <ul className="divide-y divide-gray-200">
                      {workerStats.registeredHandlers.map((handler, index) => (
                        <li key={index} className="py-2 flex justify-between">
                          <span className="text-sm text-gray-600">{handler}</span>
                          <span className="text-xs text-gray-500 bg-gray-200 px-2 py-0.5 rounded">Registered</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-gray-500 text-center py-2">No handlers registered</p>
                  )}
                </div>
              </div>
            </div>
            
            <div className="bg-white p-4 rounded-md border border-gray-200">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-sm font-medium text-gray-700">Task Management</h3>
                <button
                  className="px-3 py-1.5 bg-indigo-600 text-white text-sm rounded hover:bg-indigo-700"
                >
                  Add Task
                </button>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-md">
                <h4 className="text-xs font-medium text-gray-500 uppercase mb-3">Example Tasks</h4>
                
                <div className="space-y-4">
                  <div className="bg-white p-3 rounded border border-gray-200">
                    <div className="flex justify-between">
                      <div>
                        <h5 className="text-sm font-medium text-gray-900">Data Processing</h5>
                        <p className="text-xs text-gray-500 mt-1">Process large datasets in the background</p>
                      </div>
                      <button
                        className="px-2 py-1 bg-green-50 text-green-700 text-xs rounded border border-green-200 hover:bg-green-100"
                        onClick={() => {
                          backgroundWorker.addTask('data-processing', {
                            items: Array.from({ length: 200 }, (_, i) => ({ id: i, value: Math.random() }))
                          });
                          handleRefresh();
                        }}
                      >
                        Run Task
                      </button>
                    </div>
                  </div>
                  
                  <div className="bg-white p-3 rounded border border-gray-200">
                    <div className="flex justify-between">
                      <div>
                        <h5 className="text-sm font-medium text-gray-900">Report Generation</h5>
                        <p className="text-xs text-gray-500 mt-1">Generate financial reports asynchronously</p>
                      </div>
                      <button
                        className="px-2 py-1 bg-green-50 text-green-700 text-xs rounded border border-green-200 hover:bg-green-100"
                        onClick={() => {
                          backgroundWorker.addTask('report-generation', {
                            name: 'Monthly Reconciliation Report',
                            period: 'March 2025',
                            format: 'PDF'
                          });
                          handleRefresh();
                        }}
                      >
                        Run Task
                      </button>
                    </div>
                  </div>
                  
                  <div className="bg-white p-3 rounded border border-gray-200">
                    <div className="flex justify-between">
                      <div>
                        <h5 className="text-sm font-medium text-gray-900">Data Import</h5>
                        <p className="text-xs text-gray-500 mt-1">Import and process external data files</p>
                      </div>
                      <button
                        className="px-2 py-1 bg-green-50 text-green-700 text-xs rounded border border-green-200 hover:bg-green-100"
                        onClick={() => {
                          backgroundWorker.addTask('data-import', {
                            files: [
                              { name: 'invoices.csv', size: 1024 * 1024 * 2 },
                              { name: 'payments.csv', size: 1024 * 1024 * 1.5 },
                              { name: 'ledger.csv', size: 1024 * 1024 * 3 }
                            ]
                          });
                          handleRefresh();
                        }}
                      >
                        Run Task
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {activeTab === 'metrics' && (
          <div className="space-y-6">
            <div className="bg-white p-4 rounded-md border border-gray-200">
              <h3 className="text-sm font-medium text-gray-700 mb-4">Application Performance Metrics</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gray-50 p-3 rounded-md">
                  <h4 className="text-xs font-medium text-gray-500 uppercase mb-1">Average Render Time</h4>
                  <p className="text-2xl font-semibold text-gray-900">{performanceData.renderTime} ms</p>
                </div>
                
                <div className="bg-gray-50 p-3 rounded-md">
                  <h4 className="text-xs font-medium text-gray-500 uppercase mb-1">API Response Time</h4>
                  <p className="text-2xl font-semibold text-gray-900">{performanceData.responseTime} ms</p>
                </div>
                
                <div className="bg-gray-50 p-3 rounded-md">
                  <h4 className="text-xs font-medium text-gray-500 uppercase mb-1">Queries Per Page</h4>
                  <p className="text-2xl font-semibold text-gray-900">{performanceData.queryCount}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-4 rounded-md border border-gray-200">
              <h3 className="text-sm font-medium text-gray-700 mb-4">Load Testing Results</h3>
              
              <div className="bg-gray-50 p-4 rounded-md mb-4">
                <h4 className="text-xs font-medium text-gray-500 uppercase mb-3">Response Time Under Load</h4>
                <div className="h-40">
                  {/* Placeholder for a chart - in real app would use Recharts */}
                  <div className="h-full flex items-center justify-center">
                    <p className="text-gray-500 text-sm">Response time visualization would appear here</p>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="text-xs font-medium text-gray-500 uppercase mb-2">Load Test Summary</h4>
                  <div className="bg-gray-50 p-3 rounded-md">
                    <div className="flex justify-between mb-2">
                      <span className="text-sm text-gray-500">Concurrent Users</span>
                      <span className="text-sm font-medium text-gray-900">50</span>
                    </div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm text-gray-500">Test Duration</span>
                      <span className="text-sm font-medium text-gray-900">5 minutes</span>
                    </div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm text-gray-500">Requests Per Second</span>
                      <span className="text-sm font-medium text-gray-900">25</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Error Rate</span>
                      <span className="text-sm font-medium text-green-600">0.5%</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="text-xs font-medium text-gray-500 uppercase mb-2">Resource Utilization</h4>
                  <div className="bg-gray-50 p-3 rounded-md">
                    <div className="flex justify-between mb-2">
                      <span className="text-sm text-gray-500">Max CPU Usage</span>
                      <span className="text-sm font-medium text-gray-900">72%</span>
                    </div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm text-gray-500">Max Memory Usage</span>
                      <span className="text-sm font-medium text-gray-900">350 MB</span>
                    </div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm text-gray-500">Network I/O</span>
                      <span className="text-sm font-medium text-gray-900">15 MB/s</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Disk I/O</span>
                      <span className="text-sm font-medium text-gray-900">5 MB/s</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-4 rounded-md border border-gray-200">
              <h3 className="text-sm font-medium text-gray-700 mb-4">Optimization Recommendations</h3>
              
              <div className="space-y-3">
                <div className="bg-green-50 p-3 rounded-md border border-green-200">
                  <h4 className="text-sm font-medium text-green-800 flex items-center">
                    <span className="inline-block h-2 w-2 rounded-full bg-green-500 mr-2"></span>
                    Code Splitting
                  </h4>
                  <p className="text-sm text-green-700 mt-1 ml-4">
                    Implement code splitting to reduce initial bundle size and improve load times.
                  </p>
                </div>
                
                <div className="bg-yellow-50 p-3 rounded-md border border-yellow-200">
                  <h4 className="text-sm font-medium text-yellow-800 flex items-center">
                    <span className="inline-block h-2 w-2 rounded-full bg-yellow-500 mr-2"></span>
                    Database Query Optimization
                  </h4>
                  <p className="text-sm text-yellow-700 mt-1 ml-4">
                    Consider adding indexes to frequently queried columns to improve database performance.
                  </p>
                </div>
                
                <div className="bg-indigo-50 p-3 rounded-md border border-indigo-200">
                  <h4 className="text-sm font-medium text-indigo-800 flex items-center">
                    <span className="inline-block h-2 w-2 rounded-full bg-indigo-500 mr-2"></span>
                    Implement Virtualization
                  </h4>
                  <p className="text-sm text-indigo-700 mt-1 ml-4">
                    Use virtualized lists for transaction tables to improve rendering performance with large datasets.
                  </p>
                </div>
                
                <div className="bg-blue-50 p-3 rounded-md border border-blue-200">
                  <h4 className="text-sm font-medium text-blue-800 flex items-center">
                    <span className="inline-block h-2 w-2 rounded-full bg-blue-500 mr-2"></span>
                    API Response Compression
                  </h4>
                  <p className="text-sm text-blue-700 mt-1 ml-4">
                    Enable gzip compression for API responses to reduce bandwidth usage and improve load times.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PerformanceMonitorPanel;