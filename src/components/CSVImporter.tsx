import React, { useState } from 'react';
import Papa from 'papaparse';
import { Upload, FileCheck, AlertCircle } from 'lucide-react';
import { Invoice, Payment, LedgerEntry } from '../types';

interface CSVImporterProps {
  onDataImport: (data: {
    invoices?: Invoice[],
    payments?: Payment[],
    ledgerEntries?: LedgerEntry[]
  }) => void;
}

const CSVImporter: React.FC<CSVImporterProps> = ({ onDataImport }) => {
  const [activeTab, setActiveTab] = useState<'invoices' | 'payments' | 'ledger'>('invoices');
  const [importStatus, setImportStatus] = useState<{
    invoices?: { success: boolean; message: string; count: number };
    payments?: { success: boolean; message: string; count: number };
    ledgerEntries?: { success: boolean; message: string; count: number };
  }>({});
  const [error, setError] = useState<string | null>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>, type: 'invoices' | 'payments' | 'ledger') => {
    setError(null);
    const file = event.target.files?.[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true,
      complete: (results) => {
        try {
          const { data, errors } = results;
          
          if (errors.length > 0) {
            setError(`Error parsing CSV: ${errors[0].message}`);
            return;
          }

          // Validate and transform the data based on type
          let transformedData;
          switch (type) {
            case 'invoices':
              transformedData = transformInvoices(data);
              onDataImport({ invoices: transformedData });
              setImportStatus(prev => ({
                ...prev,
                invoices: { 
                  success: true, 
                  message: 'Invoices imported successfully', 
                  count: transformedData.length 
                }
              }));
              break;
            case 'payments':
              transformedData = transformPayments(data);
              onDataImport({ payments: transformedData });
              setImportStatus(prev => ({
                ...prev,
                payments: { 
                  success: true, 
                  message: 'Payments imported successfully', 
                  count: transformedData.length 
                }
              }));
              break;
            case 'ledger':
              transformedData = transformLedgerEntries(data);
              onDataImport({ ledgerEntries: transformedData });
              setImportStatus(prev => ({
                ...prev,
                ledgerEntries: { 
                  success: true, 
                  message: 'Ledger entries imported successfully', 
                  count: transformedData.length 
                }
              }));
              break;
          }
        } catch (err) {
          setError(`Error processing data: ${err instanceof Error ? err.message : String(err)}`);
        }
      },
      error: (err) => {
        setError(`Error reading file: ${err.message}`);
      }
    });

    // Reset file input
    event.target.value = '';
  };

  const transformInvoices = (data: any[]): Invoice[] => {
    return data.map(item => {
      // Validate required fields
      if (!item.invoice_id || !item.customer_name || item.amount_due === undefined) {
        throw new Error('Missing required invoice fields (invoice_id, customer_name, amount_due)');
      }

      // Handle currency strings like "$1,200.00"
      const amountDue = typeof item.amount_due === 'string'
        ? Number(item.amount_due.replace(/[$,]/g, ''))
        : item.amount_due;

      return {
        invoice_id: String(item.invoice_id),
        customer_name: String(item.customer_name),
        amount_due: amountDue,
        due_date: String(item.due_date || ''),
        status: String(item.status || 'Open') as 'Open' | 'Paid' | 'Overdue'
      };
    });
  };

  const transformPayments = (data: any[]): Payment[] => {
    return data.map(item => {
      // Validate required fields
      if (!item.payment_id || !item.payer_name || item.amount === undefined) {
        throw new Error('Missing required payment fields (payment_id, payer_name, amount)');
      }

      // Handle currency strings like "$1,200.00"
      const amount = typeof item.amount === 'string'
        ? Number(item.amount.replace(/[$,]/g, ''))
        : item.amount;

      return {
        payment_id: String(item.payment_id),
        payer_name: String(item.payer_name),
        amount: amount,
        payment_date: String(item.payment_date || ''),
        method: String(item.method || 'ACH') as 'ACH' | 'Wire' | 'Check' | 'Credit Card',
        reference_note: String(item.reference_note || '')
      };
    });
  };

  const transformLedgerEntries = (data: any[]): LedgerEntry[] => {
    return data.map(item => {
      // Validate required fields
      if (!item.ledger_entry_id || !item.invoice_id || !item.payment_id || item.amount === undefined) {
        throw new Error('Missing required ledger fields (ledger_entry_id, invoice_id, payment_id, amount)');
      }

      // Handle currency strings like "$1,200.00"
      const amount = typeof item.amount === 'string'
        ? Number(item.amount.replace(/[$,]/g, ''))
        : item.amount;

      return {
        ledger_entry_id: String(item.ledger_entry_id),
        invoice_id: String(item.invoice_id),
        payment_id: String(item.payment_id),
        amount: amount,
        entry_date: String(item.entry_date || '')
      };
    });
  };

  const handleExportTemplate = (type: 'invoices' | 'payments' | 'ledger') => {
    let csvContent = '';
    let filename = '';

    switch (type) {
      case 'invoices':
        csvContent = 'invoice_id,customer_name,amount_due,due_date,status\nINV-1001,Example Corp,1000.00,2025-01-01,Open';
        filename = 'invoice_template.csv';
        break;
      case 'payments':
        csvContent = 'payment_id,payer_name,amount,payment_date,method,reference_note\nPAY-001,Example Corp,1000.00,2025-01-01,ACH,INV-1001';
        filename = 'payment_template.csv';
        break;
      case 'ledger':
        csvContent = 'ledger_entry_id,invoice_id,payment_id,amount,entry_date\nLED-001,INV-1001,PAY-001,1000.00,2025-01-01';
        filename = 'ledger_template.csv';
        break;
    }

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const hasImportedSomeData = Object.values(importStatus).some(status => status?.success);

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="px-4 py-5 sm:px-6 bg-indigo-50 border-b border-indigo-100">
        <h3 className="text-lg font-medium text-gray-900">Import Data</h3>
        <p className="mt-1 text-sm text-gray-500">
          Upload CSV files to import your financial data
        </p>
      </div>

      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8 px-6" aria-label="Tabs">
          {(['invoices', 'payments', 'ledger'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`
                whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm
                ${activeTab === tab
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
              `}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
              {importStatus[tab] && (
                <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  {importStatus[tab]?.count}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>

      <div className="px-4 py-5 sm:p-6">
        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-800 rounded-md p-4 flex items-start">
            <AlertCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="text-sm font-medium">Import Error</h3>
              <p className="text-sm mt-1">{error}</p>
            </div>
          </div>
        )}

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Upload {activeTab} CSV
            </label>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
              <div className="space-y-1 text-center">
                <Upload className="mx-auto h-12 w-12 text-gray-400" />
                <div className="flex text-sm text-gray-600">
                  <label
                    htmlFor="file-upload"
                    className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none"
                  >
                    <span>Upload a file</span>
                    <input
                      id="file-upload"
                      name="file-upload"
                      type="file"
                      accept=".csv"
                      className="sr-only"
                      onChange={(e) => handleFileUpload(e, activeTab)}
                    />
                  </label>
                  <p className="pl-1">or drag and drop</p>
                </div>
                <p className="text-xs text-gray-500">CSV up to 10MB</p>
              </div>
            </div>
          </div>

          <div>
            <div className="flex items-center">
              <FileCheck className="h-5 w-5 text-gray-400 mr-2" />
              <h3 className="text-sm font-medium text-gray-900">Need a template?</h3>
            </div>
            <p className="mt-1 text-sm text-gray-500">
              Download a sample CSV file to see the required format.
            </p>
            <button
              type="button"
              className="mt-2 inline-flex items-center px-2.5 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              onClick={() => handleExportTemplate(activeTab)}
            >
              Download template
            </button>
          </div>

          {importStatus[activeTab] && (
            <div className="rounded-md bg-green-50 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <FileCheck className="h-5 w-5 text-green-400" aria-hidden="true" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-green-800">Import successful</h3>
                  <div className="mt-2 text-sm text-green-700">
                    <p>{importStatus[activeTab]?.message}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {hasImportedSomeData && (
        <div className="px-4 py-3 bg-gray-50 text-right sm:px-6">
          <button
            type="button"
            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            onClick={() => window.location.reload()}
          >
            Run Reconciliation
          </button>
        </div>
      )}
    </div>
  );
};

export default CSVImporter;