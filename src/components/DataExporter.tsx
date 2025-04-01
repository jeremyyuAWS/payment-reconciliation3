import React, { useState } from 'react';
import { Download, FileText, Printer } from 'lucide-react';
import { ReconciliationResult, ReconciliationSummary } from '../types';
import PrintableReport from './PrintableReport';

interface DataExporterProps {
  results: ReconciliationResult[];
  summary?: ReconciliationSummary;
}

const DataExporter: React.FC<DataExporterProps> = ({ results, summary }) => {
  const [showPrintReport, setShowPrintReport] = useState(false);

  const exportCSV = (dataType: 'reconciliation' | 'unreconciled' | 'issues') => {
    let csvContent = '';
    let filename = '';

    switch (dataType) {
      case 'reconciliation':
        csvContent = generateReconciliationCSV(results);
        filename = 'reconciliation_results.csv';
        break;
      case 'unreconciled':
        csvContent = generateUnreconciledCSV(results);
        filename = 'unreconciled_payments.csv';
        break;
      case 'issues':
        csvContent = generateIssuesCSV(results);
        filename = 'reconciliation_issues.csv';
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

  const generateReconciliationCSV = (results: ReconciliationResult[]): string => {
    const headers = [
      'payment_id',
      'payer_name',
      'amount',
      'payment_date',
      'method',
      'reference_note',
      'invoice_id',
      'customer_name',
      'amount_due',
      'due_date',
      'invoice_status',
      'reconciliation_status',
      'issue_count'
    ].join(',');

    const rows = results.map(result => {
      return [
        result.payment.payment_id,
        `"${result.payment.payer_name}"`,
        result.payment.amount,
        result.payment.payment_date,
        result.payment.method,
        result.payment.reference_note,
        result.matchedInvoice ? result.matchedInvoice.invoice_id : '',
        result.matchedInvoice ? `"${result.matchedInvoice.customer_name}"` : '',
        result.matchedInvoice ? result.matchedInvoice.amount_due : '',
        result.matchedInvoice ? result.matchedInvoice.due_date : '',
        result.matchedInvoice ? result.matchedInvoice.status : '',
        result.status,
        result.issues.length
      ].join(',');
    });

    return [headers, ...rows].join('\n');
  };

  const generateUnreconciledCSV = (results: ReconciliationResult[]): string => {
    const unreconciled = results.filter(r => r.status !== 'Reconciled');
    
    const headers = [
      'payment_id',
      'payer_name',
      'amount',
      'payment_date',
      'reference_note',
      'reconciliation_status',
      'issues'
    ].join(',');

    const rows = unreconciled.map(result => {
      const issuesText = result.issues
        .map(issue => {
          switch (issue.type) {
            case 'duplicate_payment':
              return 'Duplicate payment';
            case 'missing_invoice':
              return 'Missing invoice';
            case 'amount_mismatch':
              return `Amount mismatch (Invoice: ${issue.invoiceAmount}, Payment: ${issue.paymentAmount})`;
            case 'missing_ledger_entry':
              return 'Missing ledger entry';
            case 'payer_name_mismatch':
              return `Payer name mismatch (Invoice: ${issue.customerName}, Payment: ${issue.payerName})`;
            default:
              return issue.type;
          }
        })
        .join('; ');

      return [
        result.payment.payment_id,
        `"${result.payment.payer_name}"`,
        result.payment.amount,
        result.payment.payment_date,
        result.payment.reference_note,
        result.status,
        `"${issuesText}"`
      ].join(',');
    });

    return [headers, ...rows].join('\n');
  };

  const generateIssuesCSV = (results: ReconciliationResult[]): string => {
    // Flatten all issues
    const allIssues = results.flatMap(result => 
      result.issues.map(issue => ({
        payment_id: result.payment.payment_id,
        payer_name: result.payment.payer_name,
        amount: result.payment.amount,
        invoice_id: result.matchedInvoice?.invoice_id || '',
        issue_type: issue.type,
        issue_details: getIssueDetails(issue)
      }))
    );
    
    const headers = [
      'payment_id',
      'payer_name',
      'amount',
      'invoice_id',
      'issue_type',
      'issue_details'
    ].join(',');

    const rows = allIssues.map(issue => {
      return [
        issue.payment_id,
        `"${issue.payer_name}"`,
        issue.amount,
        issue.invoice_id,
        issue.issue_type,
        `"${issue.issue_details}"`
      ].join(',');
    });

    return [headers, ...rows].join('\n');
  };

  const getIssueDetails = (issue: any): string => {
    switch (issue.type) {
      case 'duplicate_payment':
        return `Duplicate of payment ${issue.duplicatePayment.payment_id} from ${issue.duplicatePayment.payment_date}`;
      case 'missing_invoice':
        return issue.message;
      case 'amount_mismatch':
        return `Invoice amount ${issue.invoiceAmount} does not match payment amount ${issue.paymentAmount}`;
      case 'missing_ledger_entry':
        return issue.message;
      case 'payer_name_mismatch':
        return `Payer name ${issue.payerName} does not match customer name ${issue.customerName}`;
      default:
        return '';
    }
  };

  return (
    <>
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-4 py-5 sm:px-6 bg-indigo-50 border-b border-indigo-100">
          <div className="flex items-center">
            <Download className="h-5 w-5 text-indigo-600 mr-2" />
            <h3 className="text-lg font-medium text-gray-900">Export Data</h3>
          </div>
          <p className="mt-1 text-sm text-gray-500">
            Download reconciliation results in CSV format or generate a printable report
          </p>
        </div>
        
        <div className="px-4 py-5 sm:p-6 grid grid-cols-1 gap-4 sm:grid-cols-4">
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center mb-4">
              <FileText className="h-5 w-5 text-gray-400 mr-2" />
              <h3 className="text-sm font-medium text-gray-900">All Results</h3>
            </div>
            <p className="text-sm text-gray-500 mb-4">
              Export complete reconciliation results including all payments and matched invoices.
            </p>
            <button
              type="button"
              onClick={() => exportCSV('reconciliation')}
              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
            >
              <Download className="h-4 w-4 mr-2" />
              Export All Results
            </button>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center mb-4">
              <FileText className="h-5 w-5 text-gray-400 mr-2" />
              <h3 className="text-sm font-medium text-gray-900">Unreconciled Payments</h3>
            </div>
            <p className="text-sm text-gray-500 mb-4">
              Export only payments that require attention or have reconciliation issues.
            </p>
            <button
              type="button"
              onClick={() => exportCSV('unreconciled')}
              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
            >
              <Download className="h-4 w-4 mr-2" />
              Export Unreconciled
            </button>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center mb-4">
              <FileText className="h-5 w-5 text-gray-400 mr-2" />
              <h3 className="text-sm font-medium text-gray-900">Issues Report</h3>
            </div>
            <p className="text-sm text-gray-500 mb-4">
              Export detailed breakdown of all reconciliation issues with explanations.
            </p>
            <button
              type="button"
              onClick={() => exportCSV('issues')}
              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
            >
              <Download className="h-4 w-4 mr-2" />
              Export Issues
            </button>
          </div>
          
          {summary && (
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center mb-4">
                <Printer className="h-5 w-5 text-gray-400 mr-2" />
                <h3 className="text-sm font-medium text-gray-900">Printable Report</h3>
              </div>
              <p className="text-sm text-gray-500 mb-4">
                Generate a printer-friendly reconciliation report with charts and issue summaries.
              </p>
              <button
                type="button"
                onClick={() => setShowPrintReport(true)}
                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
              >
                <Printer className="h-4 w-4 mr-2" />
                Generate Report
              </button>
            </div>
          )}
        </div>
      </div>
      
      {/* Printable Report Modal */}
      {showPrintReport && summary && (
        <PrintableReport 
          results={results} 
          summary={summary} 
          onClose={() => setShowPrintReport(false)} 
        />
      )}
    </>
  );
};

export default DataExporter;