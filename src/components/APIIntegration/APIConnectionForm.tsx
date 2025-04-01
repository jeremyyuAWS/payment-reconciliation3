import React, { useState, useEffect } from 'react';
import { APIConnection } from '../../types';
import { Save, Trash2 } from 'lucide-react';

interface APIConnectionFormProps {
  existingConnection?: APIConnection | null;
  onSave: (connection: APIConnection) => void;
  onCancel: () => void;
  onDelete?: () => void;
}

const APIConnectionForm: React.FC<APIConnectionFormProps> = ({
  existingConnection,
  onSave,
  onCancel,
  onDelete
}) => {
  const [formData, setFormData] = useState<APIConnection>({
    id: '',
    name: '',
    provider: 'quickbooks',
    status: 'disconnected',
    config: {
      apiKey: '',
      baseUrl: '',
      clientId: '',
      syncSettings: {
        autoSync: false,
        syncInterval: 60,
        dataTypes: ['invoices']
      }
    }
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    if (existingConnection) {
      setFormData(existingConnection);
    } else {
      // Set default URLs based on provider
      setFormData(prev => ({
        ...prev,
        id: `conn-${Date.now()}`,
        baseUrl: getDefaultBaseUrl('quickbooks')
      }));
    }
  }, [existingConnection]);

  const getDefaultBaseUrl = (provider: APIConnection['provider']) => {
    switch (provider) {
      case 'quickbooks':
        return 'https://api.quickbooks.intuit.com/v3';
      case 'xero':
        return 'https://api.xero.com/api.xro/2.0';
      case 'sage':
        return 'https://api.sage.com/v1';
      case 'sap':
        return 'https://api.sap.com/v1';
      default:
        return '';
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (name.includes('.')) {
      // Handle nested properties
      const [parent, child] = name.split('.');
      setFormData({
        ...formData,
        [parent]: {
          ...formData[parent as keyof APIConnection],
          [child]: value
        }
      });
    } else if (name === 'provider') {
      // Update base URL when provider changes
      setFormData({
        ...formData,
        provider: value as APIConnection['provider'],
        config: {
          ...formData.config,
          baseUrl: getDefaultBaseUrl(value as APIConnection['provider'])
        }
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
    
    // Clear error for this field
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    
    if (name === 'config.syncSettings.autoSync') {
      setFormData({
        ...formData,
        config: {
          ...formData.config,
          syncSettings: {
            ...formData.config.syncSettings,
            autoSync: checked
          }
        }
      });
    }
  };

  const handleDataTypeChange = (dataType: 'invoices' | 'payments' | 'ledger', checked: boolean) => {
    const currentTypes = formData.config.syncSettings.dataTypes;
    
    let newTypes;
    if (checked) {
      newTypes = [...currentTypes, dataType];
    } else {
      newTypes = currentTypes.filter(type => type !== dataType);
    }
    
    setFormData({
      ...formData,
      config: {
        ...formData.config,
        syncSettings: {
          ...formData.config.syncSettings,
          dataTypes: newTypes
        }
      }
    });
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Connection name is required';
    }
    
    if (!formData.config.apiKey.trim()) {
      newErrors['config.apiKey'] = 'API key is required';
    }
    
    if (!formData.config.baseUrl.trim()) {
      newErrors['config.baseUrl'] = 'Base URL is required';
    }
    
    if (formData.config.syncSettings.dataTypes.length === 0) {
      newErrors['dataTypes'] = 'At least one data type must be selected';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      // For the demo, we'll set the status to connected
      onSave({
        ...formData,
        status: 'connected',
        lastSynced: new Date()
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          {existingConnection ? 'Edit Connection' : 'New API Connection'}
        </h3>
        
        <div className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
              Connection Name
            </label>
            <input
              type="text"
              name="name"
              id="name"
              value={formData.name}
              onChange={handleChange}
              className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm ${
                errors.name ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500'
              }`}
              placeholder="My QuickBooks Connection"
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600">{errors.name}</p>
            )}
          </div>
          
          <div>
            <label htmlFor="provider" className="block text-sm font-medium text-gray-700">
              Provider
            </label>
            <select
              id="provider"
              name="provider"
              value={formData.provider}
              onChange={handleChange}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
            >
              <option value="quickbooks">QuickBooks</option>
              <option value="xero">Xero</option>
              <option value="sage">Sage</option>
              <option value="sap">SAP</option>
              <option value="custom">Custom API</option>
            </select>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="config.apiKey" className="block text-sm font-medium text-gray-700">
                API Key / Token
              </label>
              <input
                type="text"
                name="config.apiKey"
                id="config.apiKey"
                value={formData.config.apiKey}
                onChange={handleChange}
                className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm ${
                  errors['config.apiKey'] ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500'
                }`}
                placeholder="Your API key or access token"
              />
              {errors['config.apiKey'] && (
                <p className="mt-1 text-sm text-red-600">{errors['config.apiKey']}</p>
              )}
            </div>
            
            <div>
              <label htmlFor="config.clientId" className="block text-sm font-medium text-gray-700">
                Client ID
              </label>
              <input
                type="text"
                name="config.clientId"
                id="config.clientId"
                value={formData.config.clientId}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                placeholder="Optional client identifier"
              />
            </div>
          </div>
          
          <div>
            <label htmlFor="config.baseUrl" className="block text-sm font-medium text-gray-700">
              API Base URL
            </label>
            <input
              type="text"
              name="config.baseUrl"
              id="config.baseUrl"
              value={formData.config.baseUrl}
              onChange={handleChange}
              className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm ${
                errors['config.baseUrl'] ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500'
              }`}
              placeholder="https://api.example.com/v1"
            />
            {errors['config.baseUrl'] && (
              <p className="mt-1 text-sm text-red-600">{errors['config.baseUrl']}</p>
            )}
          </div>
          
          <div className="bg-gray-50 p-4 rounded-md">
            <h4 className="text-sm font-medium text-gray-700 mb-3">Sync Settings</h4>
            
            <div className="space-y-4">
              <div className="flex items-center">
                <input
                  id="config.syncSettings.autoSync"
                  name="config.syncSettings.autoSync"
                  type="checkbox"
                  checked={formData.config.syncSettings.autoSync}
                  onChange={handleCheckboxChange}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <label htmlFor="config.syncSettings.autoSync" className="ml-2 block text-sm text-gray-700">
                  Enable automatic synchronization
                </label>
              </div>
              
              <div>
                <label htmlFor="config.syncSettings.syncInterval" className="block text-sm font-medium text-gray-700">
                  Sync Interval (minutes)
                </label>
                <select
                  id="config.syncSettings.syncInterval"
                  name="config.syncSettings.syncInterval"
                  value={formData.config.syncSettings.syncInterval}
                  onChange={handleChange}
                  disabled={!formData.config.syncSettings.autoSync}
                  className={`mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md ${
                    !formData.config.syncSettings.autoSync ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : ''
                  }`}
                >
                  <option value="15">Every 15 minutes</option>
                  <option value="30">Every 30 minutes</option>
                  <option value="60">Every hour</option>
                  <option value="120">Every 2 hours</option>
                  <option value="360">Every 6 hours</option>
                  <option value="720">Every 12 hours</option>
                  <option value="1440">Daily</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Data Types to Sync
                </label>
                <div className="space-y-2">
                  <div className="flex items-center">
                    <input
                      id="data-type-invoices"
                      type="checkbox"
                      checked={formData.config.syncSettings.dataTypes.includes('invoices')}
                      onChange={(e) => handleDataTypeChange('invoices', e.target.checked)}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                    <label htmlFor="data-type-invoices" className="ml-2 block text-sm text-gray-700">
                      Invoices
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      id="data-type-payments"
                      type="checkbox"
                      checked={formData.config.syncSettings.dataTypes.includes('payments')}
                      onChange={(e) => handleDataTypeChange('payments', e.target.checked)}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                    <label htmlFor="data-type-payments" className="ml-2 block text-sm text-gray-700">
                      Payments
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      id="data-type-ledger"
                      type="checkbox"
                      checked={formData.config.syncSettings.dataTypes.includes('ledger')}
                      onChange={(e) => handleDataTypeChange('ledger', e.target.checked)}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                    <label htmlFor="data-type-ledger" className="ml-2 block text-sm text-gray-700">
                      Ledger Entries
                    </label>
                  </div>
                </div>
                {errors['dataTypes'] && (
                  <p className="mt-1 text-sm text-red-600">{errors['dataTypes']}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="flex justify-between">
        {onDelete ? (
          <div>
            {confirmDelete ? (
              <div className="flex items-center">
                <span className="text-sm text-red-600 mr-2">Are you sure?</span>
                <button
                  type="button"
                  onClick={onDelete}
                  className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  Yes, Delete
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmDelete(false)}
                  className="ml-2 inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setConfirmDelete(true)}
                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                <Trash2 className="h-4 w-4 mr-1.5" />
                Delete Connection
              </button>
            )}
          </div>
        ) : (
          <div></div>
        )}
        
        <div className="flex space-x-3">
          <button
            type="button"
            onClick={onCancel}
            className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <Save className="h-4 w-4 mr-1.5" />
            {existingConnection ? 'Update Connection' : 'Save Connection'}
          </button>
        </div>
      </div>
    </form>
  );
};

export default APIConnectionForm;