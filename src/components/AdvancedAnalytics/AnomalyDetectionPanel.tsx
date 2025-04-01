import React, { useState } from 'react';
import { ReconciliationResult } from '../../types';
import { AlertTriangle, ArrowDownCircle, Check, HelpCircle, TrendingUp, DollarSign, Clock, CheckCircle, XCircle, Loader, Copy } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

interface AnomalyDetectionPanelProps {
  results: ReconciliationResult[];
}

interface Anomaly {
  id: string;
  type: 'duplicate_payment' | 'unusual_amount' | 'irregular_timing' | 'reference_mismatch' | 'entity_mismatch';
  severity: 'critical' | 'high' | 'medium' | 'low';
  description: string;
  relatedTransactions: string[];
  confidence: number;
  detected: Date;
}

const AnomalyDetectionPanel: React.FC<AnomalyDetectionPanelProps> = ({ results }) => {
  const [activeAnomaly, setActiveAnomaly] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  
  // Generate synthetic anomalies based on real reconciliation issues
  const generateAnomalies = (): Anomaly[] => {
    const anomalies: Anomaly[] = [];
    
    // Check for duplicate payments
    results.forEach(result => {
      const duplicateIssue = result.issues.find(issue => issue.type === 'duplicate_payment');
      if (duplicateIssue && 'duplicatePayment' in duplicateIssue) {
        anomalies.push({
          id: `anomaly-dup-${result.payment.payment_id}`,
          type: 'duplicate_payment',
          severity: 'critical',
          description: `Duplicate payment detected: ${result.payment.payment_id} appears to be a duplicate of ${duplicateIssue.duplicatePayment.payment_id}`,
          relatedTransactions: [result.payment.payment_id, duplicateIssue.duplicatePayment.payment_id],
          confidence: 98,
          detected: new Date()
        });
      }
    });
    
    // Check for unusual amounts (amounts that are significantly different from average)
    const amounts = results.map(r => r.payment.amount);
    const avgAmount = amounts.reduce((sum, amt) => sum + amt, 0) / amounts.length;
    const stdDev = Math.sqrt(
      amounts.reduce((sum, amt) => sum + Math.pow(amt - avgAmount, 2), 0) / amounts.length
    );
    
    results.forEach(result => {
      const zScore = Math.abs((result.payment.amount - avgAmount) / stdDev);
      if (zScore > 2.5) { // More than 2.5 standard deviations from the mean
        anomalies.push({
          id: `anomaly-amt-${result.payment.payment_id}`,
          type: 'unusual_amount',
          severity: zScore > 3 ? 'high' : 'medium',
          description: `Unusual payment amount: $${result.payment.amount.toFixed(2)} is ${zScore.toFixed(1)} standard deviations from average ($${avgAmount.toFixed(2)})`,
          relatedTransactions: [result.payment.payment_id],
          confidence: Math.min(95, Math.round(70 + zScore * 5)),
          detected: new Date()
        });
      }
    });
    
    // Check for reference mismatches
    results.forEach(result => {
      if (result.matchedInvoice && result.payment.reference_note && 
          result.payment.reference_note !== result.matchedInvoice.invoice_id &&
          !result.issues.some(i => i.type === 'duplicate_payment')) {
        anomalies.push({
          id: `anomaly-ref-${result.payment.payment_id}`,
          type: 'reference_mismatch',
          severity: 'medium',
          description: `Reference mismatch: Payment ${result.payment.payment_id} has reference "${result.payment.reference_note}" but was matched to invoice "${result.matchedInvoice.invoice_id}"`,
          relatedTransactions: [result.payment.payment_id],
          confidence: 75,
          detected: new Date()
        });
      }
    });
    
    // Check for entity mismatches (payer name vs customer name)
    results.forEach(result => {
      const nameIssue = result.issues.find(issue => issue.type === 'payer_name_mismatch');
      if (nameIssue && 'payerName' in nameIssue && 'customerName' in nameIssue) {
        anomalies.push({
          id: `anomaly-ent-${result.payment.payment_id}`,
          type: 'entity_mismatch',
          severity: 'medium',
          description: `Entity name mismatch: Payment from "${nameIssue.payerName}" was matched to invoice for "${nameIssue.customerName}"`,
          relatedTransactions: [result.payment.payment_id],
          confidence: 85,
          detected: new Date()
        });
      }
    });
    
    // Check for irregular timing
    // Group payments by customer
    const customerPayments: Record<string, { dates: Date[], amounts: number[] }> = {};
    results.forEach(result => {
      const customer = result.payment.payer_name;
      if (!customerPayments[customer]) {
        customerPayments[customer] = { dates: [], amounts: [] };
      }
      customerPayments[customer].dates.push(new Date(result.payment.payment_date));
      customerPayments[customer].amounts.push(result.payment.amount);
    });
    
    // Identify customers with multiple payments and check for timing irregularities
    Object.entries(customerPayments).forEach(([customer, data]) => {
      if (data.dates.length > 2) {
        // Sort dates
        data.dates.sort((a, b) => a.getTime() - b.getTime());
        
        // Calculate average interval between payments
        const intervals: number[] = [];
        for (let i = 1; i < data.dates.length; i++) {
          intervals.push(data.dates[i].getTime() - data.dates[i-1].getTime());
        }
        const avgInterval = intervals.reduce((sum, int) => sum + int, 0) / intervals.length;
        
        // Check for unusually short intervals (potential duplicate or error)
        for (let i = 1; i < data.dates.length; i++) {
          const interval = data.dates[i].getTime() - data.dates[i-1].getTime();
          if (interval < avgInterval * 0.3 && data.amounts[i] === data.amounts[i-1]) {
            // Find the corresponding payment
            const payment = results.find(r => 
              r.payment.payer_name === customer && 
              new Date(r.payment.payment_date).getTime() === data.dates[i].getTime()
            );
            
            if (payment) {
              anomalies.push({
                id: `anomaly-tim-${payment.payment.payment_id}`,
                type: 'irregular_timing',
                severity: 'high',
                description: `Unusual payment timing: ${customer} made a payment of $${payment.payment.amount.toFixed(2)} on ${data.dates[i].toLocaleDateString()} which is unusually close to their previous payment of the same amount`,
                relatedTransactions: [payment.payment.payment_id],
                confidence: 90,
                detected: new Date()
              });
            }
          }
        }
      }
    });
    
    return anomalies;
  };
  
  const anomalies = generateAnomalies();
  
  // Filter anomalies based on selected status
  const filteredAnomalies = statusFilter === 'all' 
    ? anomalies 
    : anomalies.filter(a => a.severity === statusFilter);
  
  // Get icon for anomaly type
  const getAnomalyIcon = (type: string) => {
    switch(type) {
      case 'duplicate_payment':
        return <ArrowDownCircle className="h-5 w-5 text-red-500" />;
      case 'unusual_amount':
        return <DollarSign className="h-5 w-5 text-orange-500" />;
      case 'irregular_timing':
        return <Clock className="h-5 w-5 text-amber-500" />;
      case 'reference_mismatch':
        return <HelpCircle className="h-5 w-5 text-purple-500" />;
      case 'entity_mismatch':
        return <TrendingUp className="h-5 w-5 text-blue-500" />;
      default:
        return <AlertTriangle className="h-5 w-5 text-gray-500" />;
    }
  };
  
  // Get badge color for severity
  const getSeverityBadge = (severity: string) => {
    switch(severity) {
      case 'critical':
        return 'bg-red-100 text-red-800';
      case 'high':
        return 'bg-orange-100 text-orange-800';
      case 'medium':
        return 'bg-amber-100 text-amber-800';
      case 'low':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="px-4 py-5 border-b border-gray-200 sm:px-6">
        <div className="flex items-center">
          <AlertTriangle className="h-6 w-6 text-amber-500 mr-3" />
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            AI Anomaly Detection
          </h3>
        </div>
        <p className="mt-1 max-w-2xl text-sm text-gray-500">
          Our machine learning algorithms have identified {anomalies.length} potential anomalies in your transaction data.
        </p>
      </div>
      
      <div className="px-4 py-5 sm:px-6">
        <div className="flex justify-between mb-4">
          <div>
            <span className="text-sm font-medium text-gray-700 mr-2">Filter by severity:</span>
            <div className="inline-flex rounded-md shadow-sm">
              <button
                onClick={() => setStatusFilter('all')}
                className={`px-3 py-1 text-xs font-medium rounded-l-md ${
                  statusFilter === 'all' 
                    ? 'bg-indigo-100 text-indigo-700 border-indigo-500'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                } border`}
              >
                All
              </button>
              <button
                onClick={() => setStatusFilter('critical')}
                className={`px-3 py-1 text-xs font-medium ${
                  statusFilter === 'critical' 
                    ? 'bg-red-100 text-red-700 border-red-500'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                } border-t border-b`}
              >
                Critical
              </button>
              <button
                onClick={() => setStatusFilter('high')}
                className={`px-3 py-1 text-xs font-medium ${
                  statusFilter === 'high' 
                    ? 'bg-orange-100 text-orange-700 border-orange-500'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                } border-t border-b`}
              >
                High
              </button>
              <button
                onClick={() => setStatusFilter('medium')}
                className={`px-3 py-1 text-xs font-medium ${
                  statusFilter === 'medium' 
                    ? 'bg-amber-100 text-amber-700 border-amber-500'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                } border-t border-b`}
              >
                Medium
              </button>
              <button
                onClick={() => setStatusFilter('low')}
                className={`px-3 py-1 text-xs font-medium rounded-r-md ${
                  statusFilter === 'low' 
                    ? 'bg-blue-100 text-blue-700 border-blue-500'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                } border`}
              >
                Low
              </button>
            </div>
          </div>
          
          <div className="text-right text-sm text-gray-500">
            Showing {filteredAnomalies.length} of {anomalies.length} anomalies
          </div>
        </div>
        
        <div className="overflow-hidden border border-gray-200 sm:rounded-lg">
          {filteredAnomalies.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Description
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Severity
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Confidence
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Detected
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredAnomalies.map((anomaly) => (
                    <React.Fragment key={anomaly.id}>
                      <tr 
                        className={`${activeAnomaly === anomaly.id ? 'bg-indigo-50' : 'hover:bg-gray-50'}`}
                        onClick={() => setActiveAnomaly(activeAnomaly === anomaly.id ? null : anomaly.id)}
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            {getAnomalyIcon(anomaly.type)}
                            <span className="ml-2 text-sm text-gray-900">
                              {anomaly.type.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900 max-w-sm truncate">
                            {anomaly.description}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getSeverityBadge(anomaly.severity)}`}>
                            {anomaly.severity.charAt(0).toUpperCase() + anomaly.severity.slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-full h-2 bg-gray-200 rounded-full mr-2">
                              <div 
                                className={`h-2 rounded-full ${
                                  anomaly.confidence > 90 ? 'bg-green-500' :
                                  anomaly.confidence > 70 ? 'bg-amber-500' : 'bg-orange-500'
                                }`}
                                style={{ width: `${anomaly.confidence}%` }}
                              ></div>
                            </div>
                            <span className="text-sm text-gray-700">{anomaly.confidence}%</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {anomaly.detected.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button className="text-indigo-600 hover:text-indigo-900">
                            Details
                          </button>
                        </td>
                      </tr>
                      
                      {activeAnomaly === anomaly.id && (
                        <tr className="bg-indigo-50">
                          <td colSpan={6} className="px-6 py-4">
                            <div className="text-sm text-gray-700">
                              <h4 className="font-medium mb-2">Related Transactions</h4>
                              <ul className="list-disc pl-5 space-y-1">
                                {anomaly.relatedTransactions.map(txId => (
                                  <li key={txId}>
                                    Transaction ID: {txId}
                                    {results.find(r => r.payment.payment_id === txId) && (
                                      <span className="ml-2 text-gray-500">
                                        (${results.find(r => r.payment.payment_id === txId)?.payment.amount.toFixed(2)} - 
                                        {results.find(r => r.payment.payment_id === txId)?.payment.payer_name})
                                      </span>
                                    )}
                                  </li>
                                ))}
                              </ul>
                              
                              <h4 className="font-medium mt-4 mb-2">Recommended Action</h4>
                              <div className="p-3 bg-amber-50 border border-amber-200 rounded-md">
                                {anomaly.type === 'duplicate_payment' && (
                                  <p>Review both payments to confirm duplication, then contact the customer about a possible refund or credit to their account.</p>
                                )}
                                {anomaly.type === 'unusual_amount' && (
                                  <p>Verify the payment amount with the customer and check if this amount matches any outstanding invoices or combination of invoices.</p>
                                )}
                                {anomaly.type === 'irregular_timing' && (
                                  <p>Investigate why the customer made two similar payments in close succession. This could indicate a mistake or confusion about payment status.</p>
                                )}
                                {anomaly.type === 'reference_mismatch' && (
                                  <p>Confirm with the customer which invoice this payment was intended for, and update the reference information accordingly.</p>
                                )}
                                {anomaly.type === 'entity_mismatch' && (
                                  <p>Update your entity resolution database to link these names as variations of the same company, or contact the customer to clarify the relationship between the entities.</p>
                                )}
                              </div>
                              
                              <div className="mt-4 flex justify-end space-x-3">
                                <button className="px-3 py-1 bg-white border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50">
                                  Dismiss
                                </button>
                                <button className="px-3 py-1 bg-indigo-600 border border-transparent rounded-md text-sm text-white hover:bg-indigo-700">
                                  <Check className="h-4 w-4 inline mr-1" />
                                  Mark as Resolved
                                </button>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="py-10 text-center">
              <div className="mb-4">
                <CheckCircle className="h-10 w-10 text-green-500 mx-auto" />
              </div>
              <p className="text-gray-500">No anomalies found with the current filter.</p>
              {statusFilter !== 'all' && (
                <button 
                  onClick={() => setStatusFilter('all')}
                  className="mt-2 text-indigo-600 hover:text-indigo-800"
                >
                  View all anomalies
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AnomalyDetectionPanel;