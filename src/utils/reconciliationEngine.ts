import { Invoice, Payment, LedgerEntry, ReconciliationResult, ReconciliationSummary, ReconciliationIssue, Filter, ReconciliationRules } from '../types';
import { calculateMatchConfidence, nameMatchScore } from './aiSimulator';

// Default rules if none provided
const DEFAULT_RULES: ReconciliationRules = {
  enabledRules: {
    exactReferenceMatch: true,
    fuzzyCustomerMatch: true,
    amountTolerance: true,
    duplicateDetection: true,
    partialPaymentMatching: true,
    dateProximity: true
  },
  thresholds: {
    minConfidenceScore: 50,
    nameMatchSensitivity: 70,
    amountMatchTolerance: 1,
    dateDifferenceThreshold: 7,
    partialPaymentMinPercentage: 25
  },
  weights: {
    referenceMatch: 50,
    amountMatch: 30,
    nameMatch: 20,
    dateMatch: 10
  }
};

export function reconcilePayments(
  payments: Payment[],
  invoices: Invoice[],
  ledgerEntries: LedgerEntry[],
  rules: ReconciliationRules = DEFAULT_RULES
): ReconciliationResult[] {
  return payments.map(payment => {
    const result: ReconciliationResult = {
      payment,
      status: 'Unreconciled',
      issues: [],
      confidenceScore: 0
    };

    // Step 1: Find matching invoice based on rules
    let matchedInvoice: Invoice | undefined;
    let highestConfidence = 0;
    
    // Apply exactReferenceMatch rule if enabled
    if (rules.enabledRules.exactReferenceMatch && payment.reference_note) {
      const exactMatch = invoices.find(invoice => invoice.invoice_id === payment.reference_note);
      if (exactMatch) {
        matchedInvoice = exactMatch;
        // Calculate confidence score with custom weights
        highestConfidence = calculateInvoiceMatchConfidence(payment, exactMatch, rules);
      }
    }
    
    // If no exact match or fuzzy matching enabled, try to find best match by other criteria
    if (!matchedInvoice || (rules.enabledRules.fuzzyCustomerMatch && highestConfidence < rules.thresholds.minConfidenceScore)) {
      invoices.forEach(invoice => {
        const confidence = calculateInvoiceMatchConfidence(payment, invoice, rules);
        if (confidence > highestConfidence && confidence >= rules.thresholds.minConfidenceScore) {
          highestConfidence = confidence;
          matchedInvoice = invoice;
        }
      });
    }
    
    if (matchedInvoice) {
      result.matchedInvoice = matchedInvoice;
      result.confidenceScore = highestConfidence;
      
      // Check for payer name mismatch with fuzzy matching
      const nameMatchThreshold = rules.thresholds.nameMatchSensitivity / 100;
      if (rules.enabledRules.fuzzyCustomerMatch && 
          nameMatchScore(payment.payer_name, matchedInvoice.customer_name) < nameMatchThreshold) {
        result.issues.push({
          type: 'payer_name_mismatch',
          customerName: matchedInvoice.customer_name,
          payerName: payment.payer_name
        });
      }

      // Check for amount mismatch with tolerance
      const tolerance = matchedInvoice.amount_due * (rules.thresholds.amountMatchTolerance / 100);
      if (Math.abs(payment.amount - matchedInvoice.amount_due) > tolerance) {
        // Only flag as an issue if not a valid partial payment or tolerance rule disabled
        if (!rules.enabledRules.amountTolerance || 
            (payment.amount < matchedInvoice.amount_due && 
             !isValidPartialPayment(payment.amount, matchedInvoice.amount_due, rules))) {
          result.issues.push({
            type: 'amount_mismatch',
            invoiceAmount: matchedInvoice.amount_due,
            paymentAmount: payment.amount
          });
        }
      }
    } else {
      // No matching invoice found
      result.issues.push({
        type: 'missing_invoice',
        message: `No matching invoice found for payment reference "${payment.reference_note}"`
      });
    }

    // Step 2: Check for duplicate payments if rule enabled
    if (rules.enabledRules.duplicateDetection) {
      const duplicatePayments = payments.filter(
        p => p.payment_id !== payment.payment_id && 
            p.reference_note === payment.reference_note &&
            Math.abs(p.amount - payment.amount) < 0.01
      );
      
      if (duplicatePayments.length > 0) {
        duplicatePayments.forEach(dup => {
          result.issues.push({
            type: 'duplicate_payment',
            duplicatePayment: dup
          });
        });
      }
    }

    // Step 3: Check for ledger entry
    const matchedLedgerEntry = ledgerEntries.find(entry => entry.payment_id === payment.payment_id);
    if (matchedLedgerEntry) {
      result.ledgerEntry = matchedLedgerEntry;
    } else {
      result.issues.push({
        type: 'missing_ledger_entry',
        message: 'No corresponding ledger entry found'
      });
    }

    // Step 4: Determine the overall status
    if (result.issues.length === 0) {
      result.status = 'Reconciled';
    } else if (matchedInvoice && (result.issues.some(issue => issue.type === 'amount_mismatch') || 
               result.issues.some(issue => issue.type === 'missing_ledger_entry'))) {
      result.status = 'Partially Reconciled';
    } else {
      result.status = 'Unreconciled';
    }

    return result;
  });
}

// Helper function to calculate invoice match confidence based on custom rules
function calculateInvoiceMatchConfidence(
  payment: Payment, 
  invoice: Invoice,
  rules: ReconciliationRules
): number {
  let score = 0;
  
  // Reference match (highest weight)
  if (payment.reference_note === invoice.invoice_id) {
    score += rules.weights.referenceMatch;
  }
  
  // Amount matching
  const amountDiff = Math.abs(payment.amount - invoice.amount_due);
  const amountTolerance = invoice.amount_due * (rules.thresholds.amountMatchTolerance / 100);
  
  if (amountDiff <= amountTolerance) {
    // Exact or within tolerance
    score += rules.weights.amountMatch;
  } else if (rules.enabledRules.partialPaymentMatching && 
             payment.amount < invoice.amount_due && 
             isValidPartialPayment(payment.amount, invoice.amount_due, rules)) {
    // Valid partial payment
    const ratio = payment.amount / invoice.amount_due;
    score += rules.weights.amountMatch * ratio;
  }
  
  // Name similarity (fuzzy matching)
  const nameMatch = nameMatchScore(payment.payer_name, invoice.customer_name);
  score += rules.weights.nameMatch * nameMatch;
  
  // Date proximity (if enabled)
  if (rules.enabledRules.dateProximity && payment.payment_date && invoice.due_date) {
    const paymentDate = new Date(payment.payment_date);
    const dueDate = new Date(invoice.due_date);
    
    // Calculate days difference
    const daysDiff = Math.abs(Math.floor((paymentDate.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24)));
    
    if (daysDiff <= rules.thresholds.dateDifferenceThreshold) {
      // Score decreases as the difference increases
      const dateScore = 1 - (daysDiff / rules.thresholds.dateDifferenceThreshold);
      score += rules.weights.dateMatch * dateScore;
    }
  }
  
  return score;
}

// Check if a payment qualifies as a valid partial payment
function isValidPartialPayment(
  paymentAmount: number, 
  invoiceAmount: number,
  rules: ReconciliationRules
): boolean {
  const minPercentage = rules.thresholds.partialPaymentMinPercentage / 100;
  return (paymentAmount / invoiceAmount) >= minPercentage;
}

export function generateReconciliationSummary(results: ReconciliationResult[]): ReconciliationSummary {
  const reconciledCount = results.filter(r => r.status === 'Reconciled').length;
  const partiallyReconciledCount = results.filter(r => r.status === 'Partially Reconciled').length;
  const unreconciledCount = results.filter(r => r.status === 'Unreconciled').length;
  
  // Count issues by type
  const issuesByType: Record<string, number> = {};
  results.forEach(result => {
    result.issues.forEach(issue => {
      const issueType = issue.type;
      issuesByType[issueType] = (issuesByType[issueType] || 0) + 1;
    });
  });
  
  return {
    totalPayments: results.length,
    reconciledCount,
    partiallyReconciledCount,
    unreconciledCount,
    issuesByType
  };
}

export function filterReconciliationResults(
  results: ReconciliationResult[],
  filter: Filter
): ReconciliationResult[] {
  return results.filter(result => {
    // Filter by customer/payer name
    if (filter.customerName && !result.payment.payer_name.toLowerCase().includes(filter.customerName.toLowerCase())) {
      return false;
    }
    
    // Filter by date range
    if (filter.startDate && result.payment.payment_date < filter.startDate) {
      return false;
    }
    if (filter.endDate && result.payment.payment_date > filter.endDate) {
      return false;
    }
    
    // Filter by issue type
    if (filter.issueType && !result.issues.some(issue => issue.type === filter.issueType)) {
      return false;
    }
    
    // Filter by reconciliation status
    if (filter.status && result.status !== filter.status) {
      return false;
    }
    
    // Filter by confidence score
    if (filter.minConfidence && (!result.confidenceScore || result.confidenceScore < filter.minConfidence)) {
      return false;
    }
    
    return true;
  });
}

export function getIssueDescription(issue: ReconciliationIssue): string {
  switch (issue.type) {
    case 'duplicate_payment':
      return `Duplicate payment detected (${issue.duplicatePayment.payment_id})`;
    case 'missing_invoice':
      return issue.message;
    case 'amount_mismatch':
      return `Payment amount ($${issue.paymentAmount.toFixed(2)}) differs from invoice amount ($${issue.invoiceAmount.toFixed(2)})`;
    case 'missing_ledger_entry':
      return issue.message;
    case 'reference_mismatch':
      return `Reference note (${issue.referenceNote}) doesn't match invoice ID (${issue.invoiceId})`;
    case 'payer_name_mismatch':
      return `Payer name (${issue.payerName}) doesn't match customer name (${issue.customerName})`;
    default:
      return 'Unknown issue';
  }
}

// Function to answer natural language questions about reconciliation results
// Now using the AI simulator for more sophisticated responses
import { generateAIResponseToQuery } from './aiSimulator';

export function answerQuestion(question: string, results: ReconciliationResult[]): string {
  return generateAIResponseToQuery(question, results);
}