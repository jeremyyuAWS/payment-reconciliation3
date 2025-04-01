import React, { useState } from 'react';
import { APIConnection } from '../../types';
import { Code, Send, ChevronLeft, Copy, CheckCircle, ArrowUpDown } from 'lucide-react';

interface APIMockTesterProps {
  connection: APIConnection | null;
  onBack: () => void;
}

interface Endpoint {
  name: string;
  method: 'GET' | 'POST' | 'PUT';
  path: string;
  description: string;
  requestParams?: any;
  responseExample: any;
}

const MOCK_ENDPOINTS: Record<string, Endpoint[]> = {
  quickbooks: [
    {
      name: 'List Invoices',
      method: 'GET',
      path: '/invoices',
      description: 'Retrieves a list of all invoices from QuickBooks',
      responseExample: {
        invoices: [
          {
            id: 'inv-101',
            customer: 'Acme Corp',
            amount: 1200.00,
            date: '2025-02-15',
            status: 'Open'
          },
          {
            id: 'inv-102',
            customer: 'Beta Inc',
            amount: 750.00,
            date: '2025-02-20',
            status: 'Paid'
          }
        ],
        meta: {
          total: 2,
          page: 1,
          pageSize: 10
        }
      }
    },
    {
      name: 'Get Payments',
      method: 'GET',
      path: '/payments',
      description: 'Retrieves a list of payments from QuickBooks',
      responseExample: {
        payments: [
          {
            id: 'pay-501',
            customer: 'Acme Corp',
            amount: 1200.00,
            date: '2025-02-15',
            method: 'ACH',
            reference: 'inv-101'
          },
          {
            id: 'pay-502',
            customer: 'Beta Inc',
            amount: 750.00,
            date: '2025-02-19',
            method: 'Wire',
            reference: 'inv-102'
          }
        ],
        meta: {
          total: 2,
          page: 1,
          pageSize: 10
        }
      }
    },
    {
      name: 'Create Invoice',
      method: 'POST',
      path: '/invoice',
      description: 'Creates a new invoice in QuickBooks',
      requestParams: {
        customer_id: '123456',
        amount: 1500.00,
        due_date: '2025-03-15',
        line_items: [
          {
            description: 'Consulting Services',
            amount: 1500.00,
            quantity: 1
          }
        ]
      },
      responseExample: {
        invoice: {
          id: 'inv-103',
          customer: 'Charlie LLC',
          amount: 1500.00,
          date: '2025-02-25',
          status: 'Open',
          due_date: '2025-03-15',
          created_at: '2025-02-25T12:34:56Z'
        },
        success: true
      }
    }
  ],
  xero: [
    {
      name: 'List Invoices',
      method: 'GET',
      path: '/invoices',
      description: 'Retrieves a list of all invoices from Xero',
      responseExample: {
        invoices: [
          {
            invoiceID: 'xero-inv-1001',
            contact: {
              name: 'Acme Corp'
            },
            total: 1200.00,
            date: '2025-02-15',
            status: 'AUTHORISED'
          },
          {
            invoiceID: 'xero-inv-1002',
            contact: {
              name: 'Beta Inc'
            },
            total: 750.00,
            date: '2025-02-20',
            status: 'PAID'
          }
        ]
      }
    },
    {
      name: 'Get Payments',
      method: 'GET',
      path: '/payments',
      description: 'Retrieves a list of payments from Xero',
      responseExample: {
        payments: [
          {
            paymentID: 'xero-pay-501',
            contact: {
              name: 'Acme Corp'
            },
            amount: 1200.00,
            date: '2025-02-15',
            reference: 'xero-inv-1001'
          },
          {
            paymentID: 'xero-pay-502',
            contact: {
              name: 'Beta Inc'
            },
            amount: 750.00,
            date: '2025-02-19',
            reference: 'xero-inv-1002'
          }
        ]
      }
    }
  ],
  sage: [
    {
      name: 'List Invoices',
      method: 'GET',
      path: '/invoices',
      description: 'Retrieves a list of all invoices from Sage',
      responseExample: {
        data: [
          {
            invoiceNumber: 'SAGE-1001',
            customer: 'Acme Corp',
            totalAmount: 1200.00,
            invoiceDate: '2025-02-15',
            status: 'Open'
          },
          {
            invoiceNumber: 'SAGE-1002',
            customer: 'Beta Inc',
            totalAmount: 750.00,
            invoiceDate: '2025-02-20',
            status: 'Paid'
          }
        ],
        pagination: {
          total: 2,
          page: 1,
          pageSize: 10
        }
      }
    }
  ],
  sap: [
    {
      name: 'List Invoices',
      method: 'GET',
      path: '/invoices',
      description: 'Retrieves a list of all invoices from SAP',
      responseExample: {
        invoices: {
          invoice: [
            {
              number: 'SAP-1001',
              businessPartner: 'Acme Corp',
              amount: 1200.00,
              date: '2025-02-15',
              status: 'OPEN'
            },
            {
              number: 'SAP-1002',
              businessPartner: 'Beta Inc',
              amount: 750.00,
              date: '2025-02-20',
              status: 'PAID'
            }
          ]
        },
        metadata: {
          count: 2,
          page: 1,
          pageSize: 10
        }
      }
    }
  ],
  custom: [
    {
      name: 'List Invoices',
      method: 'GET',
      path: '/invoices',
      description: 'Retrieves a list of all invoices from custom API',
      responseExample: {
        invoices: [
          {
            id: 'custom-1001',
            customer: 'Acme Corp',
            amount: 1200.00,
            date: '2025-02-15',
            status: 'Open'
          },
          {
            id: 'custom-1002',
            customer: 'Beta Inc',
            amount: 750.00,
            date: '2025-02-20',
            status: 'Paid'
          }
        ]
      }
    }
  ]
};

const APIMockTester: React.FC<APIMockTesterProps> = ({ connection, onBack }) => {
  const [selectedEndpoint, setSelectedEndpoint] = useState<Endpoint | null>(null);
  const [requestParams, setRequestParams] = useState<string>('');
  const [response, setResponse] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showRequest, setShowRequest] = useState(true);
  
  if (!connection) {
    return (
      <div className="p-4">
        <button onClick={onBack} className="text-indigo-600 hover:text-indigo-800">
          <ChevronLeft className="h-5 w-5 inline mr-1" />
          Back
        </button>
        <div className="text-center py-6">
          <p className="text-gray-500">No connection selected</p>
        </div>
      </div>
    );
  }
  
  const endpoints = MOCK_ENDPOINTS[connection.provider] || [];
  
  const handleEndpointSelect = (endpoint: Endpoint) => {
    setSelectedEndpoint(endpoint);
    setRequestParams(endpoint.requestParams ? JSON.stringify(endpoint.requestParams, null, 2) : '');
    setResponse('');
  };
  
  const handleSendRequest = () => {
    if (!selectedEndpoint) return;
    
    setIsLoading(true);
    
    // Simulate API request
    setTimeout(() => {
      const responseObj = selectedEndpoint.responseExample;
      setResponse(JSON.stringify(responseObj, null, 2));
      setIsLoading(false);
    }, 1000);
  };
  
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  
  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center mb-4">
        <button onClick={onBack} className="text-indigo-600 hover:text-indigo-800">
          <ChevronLeft className="h-5 w-5 inline mr-1" />
          Back
        </button>
        <h3 className="ml-2 text-lg font-medium text-gray-800">
          API Tester: {connection.name}
        </h3>
      </div>
      
      <div className="bg-gray-50 p-3 rounded-md mb-4">
        <p className="text-sm text-gray-600">
          This is a simulated API testing environment. Select an endpoint to test the integration with the {connection.provider} API.
          No real API calls will be made during this demo.
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-1 bg-white shadow rounded-md overflow-hidden border border-gray-200">
          <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
            <h3 className="text-sm font-medium text-gray-700">Available Endpoints</h3>
          </div>
          <div className="divide-y divide-gray-200">
            {endpoints.length > 0 ? (
              endpoints.map((endpoint, index) => (
                <button
                  key={index}
                  onClick={() => handleEndpointSelect(endpoint)}
                  className={`w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center justify-between ${
                    selectedEndpoint === endpoint ? 'bg-indigo-50' : ''
                  }`}
                >
                  <div>
                    <p className="text-sm font-medium text-gray-900">{endpoint.name}</p>
                    <p className="text-xs text-gray-500">{endpoint.path}</p>
                  </div>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    endpoint.method === 'GET' ? 'bg-green-100 text-green-800' :
                    endpoint.method === 'POST' ? 'bg-blue-100 text-blue-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {endpoint.method}
                  </span>
                </button>
              ))
            ) : (
              <div className="px-4 py-3 text-sm text-gray-500">
                No endpoints available for this provider
              </div>
            )}
          </div>
        </div>
        
        <div className="md:col-span-2 bg-white shadow rounded-md overflow-hidden border border-gray-200">
          {selectedEndpoint ? (
            <div>
              <div className="px-4 py-3 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
                <div>
                  <h3 className="text-sm font-medium text-gray-700">{selectedEndpoint.name}</h3>
                  <p className="text-xs text-gray-500">{selectedEndpoint.description}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    selectedEndpoint.method === 'GET' ? 'bg-green-100 text-green-800' :
                    selectedEndpoint.method === 'POST' ? 'bg-blue-100 text-blue-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {selectedEndpoint.method}
                  </span>
                  <span className="text-xs text-gray-500 font-mono">
                    {connection.config.baseUrl}{selectedEndpoint.path}
                  </span>
                </div>
              </div>
              
              <div className="p-4">
                <div className="flex justify-between items-center mb-3">
                  <button 
                    onClick={() => setShowRequest(!showRequest)}
                    className="text-indigo-600 hover:underline flex items-center text-sm"
                  >
                    <ArrowUpDown className="h-3 w-3 mr-1" />
                    {showRequest ? 'Show Response' : 'Show Request'}
                  </button>
                  
                  <button
                    onClick={handleSendRequest}
                    disabled={isLoading}
                    className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                  >
                    {isLoading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4 mr-1" />
                        Send Request
                      </>
                    )}
                  </button>
                </div>
                
                {showRequest ? (
                  <div className="bg-gray-800 rounded-md overflow-hidden">
                    <div className="flex justify-between items-center px-4 py-2 bg-gray-700">
                      <span className="text-xs text-gray-300 font-mono">
                        REQUEST PARAMS
                      </span>
                      {selectedEndpoint.requestParams && (
                        <button
                          onClick={() => copyToClipboard(requestParams)}
                          className="text-xs text-gray-300 hover:text-white"
                        >
                          {copied ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                        </button>
                      )}
                    </div>
                    <div className="p-4 max-h-64 overflow-auto">
                      {selectedEndpoint.method !== 'GET' ? (
                        <pre className="text-green-400 text-xs font-mono whitespace-pre">
                          {requestParams || 'No request parameters required'}
                        </pre>
                      ) : (
                        <pre className="text-green-400 text-xs font-mono">
                          // GET requests don't require a request body
                        </pre>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="bg-gray-800 rounded-md overflow-hidden">
                    <div className="flex justify-between items-center px-4 py-2 bg-gray-700">
                      <span className="text-xs text-gray-300 font-mono">
                        RESPONSE
                      </span>
                      {response && (
                        <button
                          onClick={() => copyToClipboard(response)}
                          className="text-xs text-gray-300 hover:text-white"
                        >
                          {copied ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                        </button>
                      )}
                    </div>
                    <div className="p-4 max-h-64 overflow-auto">
                      {response ? (
                        <pre className="text-green-400 text-xs font-mono whitespace-pre">{response}</pre>
                      ) : (
                        <pre className="text-gray-400 text-xs font-mono">
                          // Response will appear here after sending a request
                        </pre>
                      )}
                    </div>
                  </div>
                )}
                
                {selectedEndpoint.method !== 'GET' && (
                  <div className="mt-4">
                    <h4 className="text-xs font-medium text-gray-500 mb-1">Implementation Example:</h4>
                    <div className="bg-gray-800 rounded-md p-4">
                      <pre className="text-xs text-blue-400 font-mono">
{`// JavaScript example for integrating with ${connection.provider}
async function create${selectedEndpoint.name.replace(/\s/g, '')}() {
  const response = await fetch('${connection.config.baseUrl}${selectedEndpoint.path}', {
    method: '${selectedEndpoint.method}',
    headers: {
      'Authorization': 'Bearer ${connection.config.apiKey}',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(${JSON.stringify(selectedEndpoint.requestParams, null, 2)})
  });
  
  const data = await response.json();
  return data;
}`}
                      </pre>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center p-8 text-center">
              <Code className="h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No endpoint selected</h3>
              <p className="mt-1 text-sm text-gray-500">
                Select an endpoint from the list to test the API integration
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default APIMockTester;