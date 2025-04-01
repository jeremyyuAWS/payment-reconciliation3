import React, { useState } from 'react';
import { APIConnection } from '../../types';
import { Link2, Database, Clock, Settings, Plus, Check, X, RefreshCw, Code } from 'lucide-react';
import APIConnectionForm from './APIConnectionForm';
import APIMockTester from './APIMockTester';

interface APIIntegrationPanelProps {
  onClose: () => void;
}

// Sample initial connections for the demo
const sampleConnections: APIConnection[] = [
  {
    id: 'conn-1',
    name: 'QuickBooks Online',
    provider: 'quickbooks',
    status: 'connected',
    lastSynced: new Date(Date.now() - 3600000), // 1 hour ago
    config: {
      apiKey: 'c8a77e9b-1234-5678-abcd-ef1234567890',
      baseUrl: 'https://api.quickbooks.intuit.com/v3',
      clientId: 'AB12CD34EF56GH78',
      syncSettings: {
        autoSync: true,
        syncInterval: 60,
        dataTypes: ['invoices', 'payments', 'ledger']
      }
    }
  },
  {
    id: 'conn-2',
    name: 'Xero Integration',
    provider: 'xero',
    status: 'error',
    lastSynced: new Date(Date.now() - 86400000 * 2), // 2 days ago
    config: {
      apiKey: 'xero-api-key-123456789',
      baseUrl: 'https://api.xero.com/api.xro/2.0',
      clientId: 'XERO123456789',
      syncSettings: {
        autoSync: false,
        syncInterval: 120,
        dataTypes: ['invoices', 'payments']
      }
    }
  }
];

const APIIntegrationPanel: React.FC<APIIntegrationPanelProps> = ({ onClose }) => {
  const [connections, setConnections] = useState<APIConnection[]>(sampleConnections);
  const [showConnectionForm, setShowConnectionForm] = useState(false);
  const [editingConnection, setEditingConnection] = useState<APIConnection | null>(null);
  const [showMockTester, setShowMockTester] = useState(false);
  const [selectedConnection, setSelectedConnection] = useState<APIConnection | null>(null);
  
  const addConnection = (connection: APIConnection) => {
    setConnections([...connections, connection]);
    setShowConnectionForm(false);
  };
  
  const updateConnection = (connection: APIConnection) => {
    setConnections(prev => prev.map(conn => 
      conn.id === connection.id ? connection : conn
    ));
    setEditingConnection(null);
  };
  
  const deleteConnection = (id: string) => {
    setConnections(prev => prev.filter(conn => conn.id !== id));
  };
  
  const handleEdit = (connection: APIConnection) => {
    setEditingConnection(connection);
    setShowConnectionForm(true);
  };
  
  const simulateSync = (id: string) => {
    // In a real app, this would trigger an actual sync
    // For demo purposes, we'll just update the lastSynced timestamp
    setConnections(prev => prev.map(conn => 
      conn.id === id ? { 
        ...conn, 
        lastSynced: new Date(),
        status: Math.random() > 0.8 ? 'error' : 'connected' // 20% chance of error for demo
      } : conn
    ));
  };
  
  const openMockTester = (connection: APIConnection) => {
    setSelectedConnection(connection);
    setShowMockTester(true);
  };
  
  const getLogo = (provider: APIConnection['provider']) => {
    switch(provider) {
      case 'quickbooks':
        return (
          <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
            <span className="text-green-800 font-bold">QB</span>
          </div>
        );
      case 'xero':
        return (
          <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
            <span className="text-blue-800 font-bold">X</span>
          </div>
        );
      case 'sage':
        return (
          <div className="h-8 w-8 rounded-full bg-orange-100 flex items-center justify-center">
            <span className="text-orange-800 font-bold">SG</span>
          </div>
        );
      case 'sap':
        return (
          <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center">
            <span className="text-purple-800 font-bold">SAP</span>
          </div>
        );
      default:
        return (
          <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center">
            <span className="text-gray-800 font-bold">API</span>
          </div>
        );
    }
  };
  
  const formatLastSynced = (date?: Date) => {
    if (!date) return 'Never';
    
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.round(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins === 1 ? '' : 's'} ago`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`;
    
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays} day${diffDays === 1 ? '' : 's'} ago`;
  };

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      <div className="px-4 py-4 bg-indigo-50 flex justify-between items-center">
        <div className="flex items-center">
          <Link2 className="text-indigo-600 h-5 w-5 mr-2" />
          <h2 className="text-lg font-medium text-gray-800">External API Integrations</h2>
        </div>
      </div>
      
      {!showConnectionForm && !showMockTester ? (
        <div className="p-4 space-y-4">
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-500">
              Connect your accounting system to automate data import and reconciliation.
            </p>
            <button
              onClick={() => setShowConnectionForm(true)}
              className="inline-flex items-center px-3 py-1.5 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none"
            >
              <Plus className="h-4 w-4 mr-1.5" />
              Add Connection
            </button>
          </div>
          
          {connections.length === 0 ? (
            <div className="bg-gray-50 p-6 text-center rounded-lg border-2 border-dashed border-gray-300">
              <Link2 className="mx-auto h-10 w-10 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No connections</h3>
              <p className="mt-1 text-sm text-gray-500">
                Connect to your accounting software to start automating reconciliation.
              </p>
              <div className="mt-6">
                <button
                  type="button"
                  onClick={() => setShowConnectionForm(true)}
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  New Connection
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-white shadow rounded-md overflow-hidden">
              <ul className="divide-y divide-gray-200">
                {connections.map((connection) => (
                  <li key={connection.id} className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        {getLogo(connection.provider)}
                        <div className="ml-4">
                          <h3 className="text-sm font-medium text-gray-900">{connection.name}</h3>
                          <div className="flex items-center">
                            <span className={`inline-block h-2 w-2 rounded-full mr-1.5 ${
                              connection.status === 'connected' ? 'bg-green-500' : 'bg-red-500'
                            }`}></span>
                            <p className="text-xs text-gray-500 mr-2">
                              {connection.status === 'connected' ? 'Connected' : 'Error'}
                            </p>
                            <Clock className="h-3 w-3 text-gray-400 mr-1" />
                            <p className="text-xs text-gray-500">
                              Last synced: {formatLastSynced(connection.lastSynced)}
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => openMockTester(connection)}
                          className="inline-flex items-center px-2.5 py-1.5 border border-gray-300 text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
                        >
                          <Code className="h-3 w-3 mr-1" />
                          API Test
                        </button>
                        <button
                          onClick={() => simulateSync(connection.id)}
                          className="inline-flex items-center px-2.5 py-1.5 border border-gray-300 text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
                        >
                          <RefreshCw className="h-3 w-3 mr-1" />
                          Sync Now
                        </button>
                        <button
                          onClick={() => handleEdit(connection)}
                          className="inline-flex items-center px-2.5 py-1.5 border border-gray-300 text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
                        >
                          <Settings className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                    
                    <div className="mt-3 text-xs text-gray-500 grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <span className="font-medium">Provider:</span> {connection.provider}
                      </div>
                      <div>
                        <span className="font-medium">Auto-sync:</span> {connection.config.syncSettings.autoSync ? (
                          <span className="text-green-600 font-medium">Enabled</span>
                        ) : (
                          <span className="text-gray-500">Disabled</span>
                        )}
                      </div>
                      <div>
                        <span className="font-medium">Interval:</span> {connection.config.syncSettings.syncInterval} minutes
                      </div>
                      <div>
                        <span className="font-medium">Data types:</span> {connection.config.syncSettings.dataTypes.join(', ')}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mt-6">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Integration Benefits</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-start">
                <Check className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                <span>Automatic import of invoices, payments, and ledger entries</span>
              </li>
              <li className="flex items-start">
                <Check className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                <span>Real-time reconciliation with your accounting system</span>
              </li>
              <li className="flex items-start">
                <Check className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                <span>Bidirectional sync ensures data consistency</span>
              </li>
              <li className="flex items-start">
                <Check className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                <span>Reduce manual data entry and reconciliation time by up to 80%</span>
              </li>
            </ul>
          </div>
        </div>
      ) : showMockTester ? (
        <APIMockTester 
          connection={selectedConnection}
          onBack={() => setShowMockTester(false)}
        />
      ) : (
        <APIConnectionForm
          existingConnection={editingConnection}
          onSave={editingConnection ? updateConnection : addConnection}
          onCancel={() => {
            setShowConnectionForm(false);
            setEditingConnection(null);
          }}
          onDelete={editingConnection ? () => deleteConnection(editingConnection.id) : undefined}
        />
      )}
      
      {!showConnectionForm && !showMockTester && (
        <div className="px-4 py-3 bg-gray-50 text-right sm:px-6 border-t border-gray-200">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Close
          </button>
        </div>
      )}
    </div>
  );
};

export default APIIntegrationPanel;