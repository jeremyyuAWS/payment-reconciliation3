import React from 'react';
import { ReconciliationResult } from '../types';
import { Lightbulb, Brain, AlertTriangle, Gauge, Sparkles } from 'lucide-react';
import { generateReconciliationReasoning } from '../utils/aiSimulator';

interface AIInsightPanelProps {
  selectedTransaction: ReconciliationResult | null;
}

const AIInsightPanel: React.FC<AIInsightPanelProps> = ({ selectedTransaction }) => {
  if (!selectedTransaction) return null;
  
  const aiReasoning = generateReconciliationReasoning(selectedTransaction);
  const confidenceScore = selectedTransaction.confidenceScore || 0;
  
  // Determine confidence level color
  const getConfidenceColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-500';
    return 'text-red-500';
  };
  
  // Get risk assessment based on issues
  const getRiskAssessment = (result: ReconciliationResult) => {
    if (result.issues.length === 0) return { level: 'Low', color: 'text-green-600' };
    if (result.issues.some(i => i.type === 'duplicate_payment')) {
      return { level: 'High', color: 'text-red-600' };
    }
    if (result.issues.length > 2) {
      return { level: 'High', color: 'text-red-600' };
    }
    return { level: 'Medium', color: 'text-yellow-500' };
  };
  
  const risk = getRiskAssessment(selectedTransaction);
  
  // Get suggestion based on transaction status and issues
  const getSuggestion = (result: ReconciliationResult) => {
    if (result.status === 'Reconciled') {
      return "This transaction appears correct and can be automatically approved.";
    }
    
    if (result.issues.some(i => i.type === 'duplicate_payment')) {
      return "Possible duplicate payment detected. Recommend reviewing both transactions and potentially refunding the duplicate.";
    }
    
    if (result.issues.some(i => i.type === 'amount_mismatch')) {
      const issue = result.issues.find(i => i.type === 'amount_mismatch');
      if (issue && 'paymentAmount' in issue && 'invoiceAmount' in issue) {
        if (issue.paymentAmount < issue.invoiceAmount) {
          return `Partial payment detected. Consider sending a reminder for the remaining balance of $${(issue.invoiceAmount - issue.paymentAmount).toFixed(2)}.`;
        } else {
          return `Payment exceeds invoice amount. Verify if this covers multiple invoices or requires a refund of $${(issue.paymentAmount - issue.invoiceAmount).toFixed(2)}.`;
        }
      }
    }
    
    if (result.issues.some(i => i.type === 'missing_invoice')) {
      return "Payment received without matching invoice. Check if an invoice was created but not properly referenced.";
    }
    
    return "This transaction requires manual review by the accounting team.";
  };
  
  // Find the last reasoning item which contains the AI recommendation
  const aiRecommendation = aiReasoning[aiReasoning.length - 1].startsWith('AI Recommendation:') 
    ? aiReasoning[aiReasoning.length - 1].substring('AI Recommendation:'.length).trim()
    : getSuggestion(selectedTransaction);
  
  // Financial impact assessment
  const getFinancialImpact = (result: ReconciliationResult) => {
    if (result.status === 'Reconciled') {
      return { 
        impact: 'None', 
        description: 'This transaction is properly reconciled with no financial impact.',
        color: 'text-green-600'
      };
    }
    
    if (result.issues.some(i => i.type === 'duplicate_payment')) {
      return { 
        impact: 'High', 
        description: `Potential duplicate payment of $${result.payment.amount.toFixed(2)} that may require refund.`,
        color: 'text-red-600'
      };
    }
    
    if (result.issues.some(i => i.type === 'amount_mismatch')) {
      const issue = result.issues.find(i => i.type === 'amount_mismatch');
      if (issue && 'paymentAmount' in issue && 'invoiceAmount' in issue) {
        const diff = Math.abs(issue.paymentAmount - issue.invoiceAmount);
        if (issue.paymentAmount < issue.invoiceAmount) {
          return { 
            impact: 'Medium', 
            description: `Underpayment of $${diff.toFixed(2)} that may need to be collected.`,
            color: 'text-yellow-600'
          };
        } else {
          return { 
            impact: 'Medium', 
            description: `Overpayment of $${diff.toFixed(2)} that may need to be refunded or applied to other invoices.`,
            color: 'text-yellow-600'
          };
        }
      }
    }
    
    return { 
      impact: 'Low', 
      description: 'Minor reconciliation issue with minimal financial impact.',
      color: 'text-yellow-500'
    };
  };
  
  const financialImpact = getFinancialImpact(selectedTransaction);
  
  return (
    <div className="mt-4 bg-indigo-50 rounded-lg p-4">
      <div className="flex items-center mb-4">
        <Sparkles className="h-5 w-5 text-indigo-600 mr-2" />
        <h3 className="text-lg font-medium text-indigo-900">AI Reconciliation Insights</h3>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div className="bg-white rounded-md p-3 shadow-sm">
          <div className="flex items-center mb-2">
            <Gauge className="h-4 w-4 text-indigo-500 mr-2" />
            <h4 className="text-sm font-medium text-gray-700">Match Confidence</h4>
          </div>
          <div className="flex items-center">
            <div className="w-full bg-gray-200 rounded-full h-2.5 mr-2">
              <div 
                className={`h-2.5 rounded-full ${
                  confidenceScore >= 80 ? 'bg-green-500' :
                  confidenceScore >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                }`}
                style={{ width: `${confidenceScore}%` }}
              ></div>
            </div>
            <span className={`text-lg font-bold ${getConfidenceColor(confidenceScore)}`}>
              {confidenceScore}%
            </span>
          </div>
        </div>
        
        <div className="bg-white rounded-md p-3 shadow-sm">
          <div className="flex items-center mb-2">
            <AlertTriangle className="h-4 w-4 text-indigo-500 mr-2" />
            <h4 className="text-sm font-medium text-gray-700">Risk Assessment</h4>
          </div>
          <p className={`font-bold text-lg ${risk.color}`}>
            {risk.level} Risk
          </p>
          <p className="text-xs text-gray-500">
            Based on {selectedTransaction.issues.length} detected issues
          </p>
        </div>
        
        <div className="bg-white rounded-md p-3 shadow-sm">
          <div className="flex items-center mb-2">
            <Brain className="h-4 w-4 text-indigo-500 mr-2" />
            <h4 className="text-sm font-medium text-gray-700">Financial Impact</h4>
          </div>
          <p className={`font-bold text-lg ${financialImpact.color}`}>
            {financialImpact.impact}
          </p>
          <p className="text-xs text-gray-500 truncate" title={financialImpact.description}>
            {financialImpact.description}
          </p>
        </div>
      </div>
      
      <div>
        <h4 className="text-sm font-medium text-gray-700 mb-2">AI Analysis</h4>
        <div className="bg-white rounded-md p-4 text-sm space-y-2">
          {aiReasoning.slice(0, -1).map((line, index) => (
            <p key={index} className="text-gray-600">{line}</p>
          ))}
        </div>
      </div>
      
      <div className="mt-4">
        <h4 className="text-sm font-medium text-gray-700 mb-2">AI Recommendation</h4>
        <div className="bg-white rounded-md p-4 border-l-4 border-indigo-500">
          <div className="flex">
            <Lightbulb className="h-5 w-5 text-indigo-500 mr-2 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-gray-800 font-medium">{aiRecommendation}</p>
          </div>
        </div>
      </div>
      
      <div className="mt-4 text-xs text-right text-gray-500">
        <p>Confidence score calculated using machine learning based on reference matching, entity recognition, and payment patterns.</p>
      </div>
    </div>
  );
};

export default AIInsightPanel;