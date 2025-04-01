// AI Simulation Module for Payment Reconciliation
// This simulates sophisticated AI processing using predefined rules and patterns

import { Invoice, Payment, LedgerEntry, ReconciliationResult } from '../types';

/**
 * Simulates AI confidence score for a potential match between payment and invoice
 */
export function calculateMatchConfidence(payment: Payment, invoice: Invoice): number {
  let score = 0;
  
  // Direct reference match is strongest signal
  if (payment.reference_note === invoice.invoice_id) {
    score += 50;
  }
  
  // Amount matching is important
  if (Math.abs(payment.amount - invoice.amount_due) < 0.01) {
    score += 30;
  } else {
    // Partial payment possibility
    if (payment.amount < invoice.amount_due && payment.amount > 0) {
      const ratio = payment.amount / invoice.amount_due;
      if (ratio > 0.25) { // Significant partial payment
        score += 15 * ratio; // Higher ratio = higher score
      }
    }
  }
  
  // Name similarity (simulating fuzzy matching)
  if (nameMatchScore(payment.payer_name, invoice.customer_name) > 0.7) {
    score += 20;
  } else if (nameMatchScore(payment.payer_name, invoice.customer_name) > 0.5) {
    score += 10;
  }
  
  // Date proximity (payment date close to due date)
  if (payment.payment_date && invoice.due_date) {
    const paymentDate = new Date(payment.payment_date);
    const dueDate = new Date(invoice.due_date);
    
    // Calculate days difference
    const daysDiff = Math.abs(Math.floor((paymentDate.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24)));
    
    // Score higher for payments closer to due date
    if (daysDiff <= 7) {
      score += 5; // Within a week
    }
  }
  
  // Method specific considerations (businesses often use consistent payment methods)
  if (payment.method === 'ACH' || payment.method === 'Wire') {
    score += 3; // Slightly more trustworthy than other methods for business payments
  }
  
  // Cap at 100
  return Math.min(100, score);
}

/**
 * Simulates AI reasoning about why a specific reconciliation decision was made
 */
export function generateReconciliationReasoning(result: ReconciliationResult): string[] {
  const reasoning: string[] = [];
  
  // Initial assessment
  reasoning.push(
    `AI Analysis: Payment ${result.payment.payment_id} from ${result.payment.payer_name} for $${result.payment.amount.toFixed(2)}`
  );
  
  // Reference matching
  if (result.matchedInvoice) {
    const referenceMatch = result.payment.reference_note === result.matchedInvoice.invoice_id;
    
    if (referenceMatch) {
      reasoning.push(
        `Reference Analysis: Payment reference "${result.payment.reference_note}" directly matches invoice ${result.matchedInvoice.invoice_id}. This is a strong indicator of correct matching.`
      );
    } else if (result.payment.reference_note) {
      reasoning.push(
        `Reference Analysis: Payment reference "${result.payment.reference_note}" does not directly match invoice ${result.matchedInvoice.invoice_id}. The match was made based on other criteria.`
      );
    } else {
      reasoning.push(
        `Reference Analysis: Payment has no reference information. The match to invoice ${result.matchedInvoice.invoice_id} was made based on other criteria.`
      );
    }
  } else {
    reasoning.push(
      `Reference Analysis: Payment reference "${result.payment.reference_note}" does not match any invoice in the system. This is a primary reason for reconciliation failure.`
    );
  }
  
  // Entity recognition reasoning
  if (result.matchedInvoice) {
    const nameScore = nameMatchScore(result.payment.payer_name, result.matchedInvoice.customer_name);
    if (nameScore > 0.9) {
      reasoning.push(`Entity Recognition: High confidence (${(nameScore * 100).toFixed(1)}%) that "${result.payment.payer_name}" is the same entity as "${result.matchedInvoice.customer_name}"`);
    } else if (nameScore > 0.7) {
      reasoning.push(`Entity Recognition: Medium confidence (${(nameScore * 100).toFixed(1)}%) that "${result.payment.payer_name}" is the same entity as "${result.matchedInvoice.customer_name}". The difference might be due to variations in business name formatting or subsidiaries.`);
    } else {
      reasoning.push(`Entity Recognition: Low confidence (${(nameScore * 100).toFixed(1)}%) that "${result.payment.payer_name}" is the same entity as "${result.matchedInvoice.customer_name}". This discrepancy requires further investigation as it may indicate an incorrect match or a parent-subsidiary relationship.`);
    }
  }
  
  // Amount analysis
  if (result.matchedInvoice) {
    const diff = Math.abs(result.payment.amount - result.matchedInvoice.amount_due);
    if (diff < 0.01) {
      reasoning.push(`Amount Analysis: Payment amount ($${result.payment.amount.toFixed(2)}) exactly matches invoice amount ($${result.matchedInvoice.amount_due.toFixed(2)}). This is a strong indicator of a correct match.`);
    } else if (result.payment.amount < result.matchedInvoice.amount_due) {
      const percentage = (result.payment.amount / result.matchedInvoice.amount_due) * 100;
      reasoning.push(`Amount Analysis: Partial payment detected. Payment ($${result.payment.amount.toFixed(2)}) covers ${percentage.toFixed(1)}% of invoice amount ($${result.matchedInvoice.amount_due.toFixed(2)}). This might indicate an installment payment or a discount arrangement.`);
      
      // Add additional insights for partial payments
      if (percentage > 90) {
        reasoning.push(`Amount Insight: The payment covers more than 90% of the invoice. This could indicate a discount for early payment or a small disputed amount being withheld.`);
      } else if (percentage >= 40 && percentage <= 60) {
        reasoning.push(`Amount Insight: The payment covers approximately half of the invoice amount. This suggests a possible installment payment arrangement or split billing.`);
      }
    } else {
      const overage = result.payment.amount - result.matchedInvoice.amount_due;
      const overagePercentage = (overage / result.matchedInvoice.amount_due) * 100;
      
      reasoning.push(`Amount Analysis: Payment amount ($${result.payment.amount.toFixed(2)}) exceeds invoice amount ($${result.matchedInvoice.amount_due.toFixed(2)}) by $${overage.toFixed(2)} (${overagePercentage.toFixed(1)}% over). This could indicate the payment covers multiple invoices or includes additional fees not in the invoice.`);
    }
  }
  
  // Date analysis
  if (result.matchedInvoice && result.matchedInvoice.due_date && result.payment.payment_date) {
    const dueDate = new Date(result.matchedInvoice.due_date);
    const paymentDate = new Date(result.payment.payment_date);
    
    // Calculate days difference
    const daysDiff = Math.floor((paymentDate.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysDiff < 0) {
      reasoning.push(`Date Analysis: Payment was made ${Math.abs(daysDiff)} days before the due date (early payment).`);
    } else if (daysDiff === 0) {
      reasoning.push(`Date Analysis: Payment was made exactly on the due date.`);
    } else if (daysDiff <= 5) {
      reasoning.push(`Date Analysis: Payment was made ${daysDiff} days after the due date (slight delay).`);
    } else if (daysDiff > 30) {
      reasoning.push(`Date Analysis: Payment was made ${daysDiff} days after the due date (significant delay). This may indicate payment difficulties or disputes.`);
    } else {
      reasoning.push(`Date Analysis: Payment was made ${daysDiff} days after the due date.`);
    }
  }
  
  // Payment method analysis
  reasoning.push(`Method Analysis: Payment was made via ${result.payment.method}, which is a ${getPaymentMethodCharacteristics(result.payment.method)}.`);
  
  // Duplicate detection reasoning
  const hasDuplicate = result.issues.some(issue => issue.type === 'duplicate_payment');
  if (hasDuplicate) {
    const duplicate = result.issues.find(issue => issue.type === 'duplicate_payment');
    if (duplicate && 'duplicatePayment' in duplicate) {
      reasoning.push(`Duplicate Detection: AI identified this as a potential duplicate of payment ${duplicate.duplicatePayment.payment_id} from ${duplicate.duplicatePayment.payment_date}. The matching criteria include identical amount, similar dates, and same invoice reference.`);
      reasoning.push(`Duplicate Recommendation: This transaction should be reviewed to determine if a refund is needed or if it should be applied to a different invoice.`);
    }
  }
  
  // Ledger verification
  if (result.ledgerEntry) {
    const ledgerAmountMatch = Math.abs(result.ledgerEntry.amount - result.payment.amount) < 0.01;
    if (ledgerAmountMatch) {
      reasoning.push(`Ledger Verification: Found corresponding ledger entry ${result.ledgerEntry.ledger_entry_id} with exact matching amount.`);
    } else {
      reasoning.push(`Ledger Verification: Found corresponding ledger entry ${result.ledgerEntry.ledger_entry_id}, but the ledger amount ($${result.ledgerEntry.amount.toFixed(2)}) differs from the payment amount ($${result.payment.amount.toFixed(2)}). This discrepancy should be investigated.`);
    }
  } else {
    reasoning.push(`Ledger Verification: No matching ledger entry found - accounting record may be incomplete. This could indicate a payment recorded in the payment system but not yet entered in the general ledger.`);
  }
  
  // Final decision explanation
  reasoning.push(`Decision: ${result.status} - ${getStatusExplanation(result)}`);
  
  // Advanced recommendation based on all factors
  reasoning.push(`AI Recommendation: ${generateActionRecommendation(result)}`);
  
  return reasoning;
}

/**
 * Generate a specific action recommendation based on the reconciliation result
 */
function generateActionRecommendation(result: ReconciliationResult): string {
  if (result.status === 'Reconciled') {
    return "This transaction is fully reconciled and can be automatically approved. No further action required.";
  }
  
  if (result.issues.some(i => i.type === 'duplicate_payment')) {
    return "PRIORITY ACTION: Review this transaction as a potential duplicate payment. If confirmed as duplicate, initiate refund process or reallocate to another outstanding invoice.";
  }
  
  if (result.issues.some(i => i.type === 'missing_invoice')) {
    return "Contact the customer to obtain a copy of the invoice referenced by this payment or verify if the payment was intended for a different invoice in your system.";
  }
  
  if (result.issues.some(i => i.type === 'amount_mismatch')) {
    const issue = result.issues.find(i => i.type === 'amount_mismatch');
    if (issue && 'paymentAmount' in issue && 'invoiceAmount' in issue) {
      if (issue.paymentAmount < issue.invoiceAmount) {
        const difference = issue.invoiceAmount - issue.paymentAmount;
        return `Partial payment detected. Send a reminder for the remaining balance of $${difference.toFixed(2)}. Flag this account for follow-up if this is not consistent with payment terms.`;
      } else {
        const difference = issue.paymentAmount - issue.invoiceAmount;
        return `Overpayment detected. Review if this payment should cover multiple invoices or if a refund of $${difference.toFixed(2)} is needed. Contact the customer to clarify their intention.`;
      }
    }
  }
  
  if (result.issues.some(i => i.type === 'missing_ledger_entry')) {
    return "Notify accounting department to create the corresponding ledger entry to complete reconciliation. This appears to be an accounting oversight rather than a payment issue.";
  }
  
  if (result.issues.some(i => i.type === 'payer_name_mismatch')) {
    return "Verify if the payer is a subsidiary, parent company, or related entity to the customer. Update customer records if necessary to include alternative payer names.";
  }
  
  return "Review this transaction manually to determine the cause of reconciliation issues and take appropriate action.";
}

/**
 * Describe payment method characteristics for more insightful analysis
 */
function getPaymentMethodCharacteristics(method: string): string {
  switch (method) {
    case 'ACH':
      return "standard electronic transfer typically used for regular business transactions";
    case 'Wire':
      return "high-value, same-day transfer often used for urgent or large payments";
    case 'Check':
      return "paper-based payment method with longer processing times";
    case 'Credit Card':
      return "electronic payment method that may include processing fees";
    default:
      return "standard payment method";
  }
}

/**
 * Simulates AI response to natural language questions about reconciliation
 */
export function generateAIResponseToQuery(query: string, results: ReconciliationResult[]): string {
  const normalizedQuery = query.toLowerCase();
  
  // Simulate AI processing delay
  // In a real app this would be an API call to an LLM

  // Check for question about unreconciled payments
  if (normalizedQuery.includes('unreconciled payments') || normalizedQuery.includes('show unreconciled')) {
    const unreconciled = results.filter(r => r.status !== 'Reconciled');
    
    if (unreconciled.length === 0) {
      return `I've analyzed all ${results.length} transactions and found no unreconciled payments. All payments have been successfully matched to invoices and verified against the ledger. This indicates excellent financial record-keeping and payment processes.`;
    }
    
    // Get total unreconciled amount
    const unreconciledAmount = unreconciled.reduce((sum, r) => sum + r.payment.amount, 0);
    const totalAmount = results.reduce((sum, r) => sum + r.payment.amount, 0);
    const percentUnreconciled = (unreconciledAmount / totalAmount) * 100;
    
    return `Based on my analysis, I've identified ${unreconciled.length} unreconciled payments out of ${results.length} total transactions (${percentUnreconciled.toFixed(1)}% of total payment value):\n\n${
      unreconciled.slice(0, 5).map(r => `- Payment ${r.payment.payment_id} from ${r.payment.payer_name} for $${r.payment.amount.toFixed(2)}: ${getIssuesSummary(r)}`).join('\n')
    }${unreconciled.length > 5 ? `\n\n...and ${unreconciled.length - 5} more unreconciled payments` : ''}\n\nWould you like me to provide more detailed analysis for any specific payment or help identify patterns in the reconciliation issues?`;
  }
  
  // Check for questions about specific invoices
  const invoiceMatch = normalizedQuery.match(/invoice\s+(?:#|number|num|id|)?\s*([a-zA-Z0-9-]+)/i);
  if (invoiceMatch) {
    const invoiceId = invoiceMatch[1].toUpperCase().startsWith('INV-') 
      ? invoiceMatch[1].toUpperCase() 
      : `INV-${invoiceMatch[1]}`;
    
    const matchingPayments = results.filter(r => r.matchedInvoice?.invoice_id === invoiceId);
    
    if (matchingPayments.length === 0) {
      // Check if invoice exists but has no payments
      const relatedPayments = results.filter(r => 
        r.payment.reference_note && r.payment.reference_note.includes(invoiceId.replace('INV-', ''))
      );
      
      if (relatedPayments.length > 0) {
        return `I've searched for invoice ${invoiceId} and found ${relatedPayments.length} related payment(s), but none were successfully matched to this invoice. This could be due to reference formatting issues or data entry errors.`;
      }
      
      return `I've searched for invoice ${invoiceId} in our records, but I couldn't find any payments associated with it. This could mean either:\n\n1. The invoice hasn't been paid yet\n2. The payment was made but with incorrect reference information\n3. The invoice ID may be incorrect\n\nWould you like me to search for similar invoice IDs that might be related?`;
    }
    
    if (normalizedQuery.includes('why') && normalizedQuery.includes('not reconciled')) {
      const unreconciledPayments = matchingPayments.filter(r => r.status !== 'Reconciled');
      
      if (unreconciledPayments.length === 0) {
        return `I've analyzed invoice ${invoiceId} and found that all associated payments are properly reconciled. The reconciliation was successful because:\n\n1. The payment reference correctly matched the invoice ID\n2. The payment amount matched the invoice amount\n3. The payer name matched the customer name\n4. A proper ledger entry exists\n\nNo further action is needed for this invoice.`;
      }
      
      const issues = unreconciledPayments[0].issues;
      const paymentAmount = unreconciledPayments[0].payment.amount;
      const invoiceAmount = unreconciledPayments[0].matchedInvoice?.amount_due;
      
      let explanation = `Invoice ${invoiceId} isn't fully reconciled due to the following issues:\n\n${
        issues.map(issue => `- ${getIssueDescription(issue)}`).join('\n')
      }\n\n`;
      
      // Add specific insights based on issue types
      if (issues.some(i => i.type === 'amount_mismatch') && invoiceAmount) {
        const difference = Math.abs(paymentAmount - invoiceAmount);
        const percentDiff = (difference / invoiceAmount) * 100;
        
        explanation += `The payment amount differs from the invoice amount by $${difference.toFixed(2)} (${percentDiff.toFixed(1)}% ${paymentAmount > invoiceAmount ? 'over' : 'under'}).\n\n`;
      }
      
      explanation += `Based on my analysis, this requires manual review by the accounting team. I recommend ${generateActionRecommendation(unreconciledPayments[0])}`;
      
      return explanation;
    }
    
    // General invoice info
    const payment = matchingPayments[0];
    return `I found invoice ${invoiceId} for ${payment.matchedInvoice?.customer_name} with amount $${payment.matchedInvoice?.amount_due.toFixed(2)}.\n\nThis invoice is linked to payment ${payment.payment.payment_id} made on ${payment.payment.payment_date} via ${payment.payment.method}.\n\nReconciliation status: ${payment.status}${
      payment.status !== 'Reconciled' ? `\n\nIssues detected: ${getIssuesSummary(payment)}` : ''
    }\n\n${generateActionRecommendation(payment)}`;
  }
  
  // Check for questions about customers/payers
  const customerMatch = normalizedQuery.match(/(?:customer|payer|client|company)\s+(?:named|name|)?\s*["']?([a-zA-Z0-9\s]+)["']?/i);
  if (customerMatch || normalizedQuery.includes('company') || normalizedQuery.includes('customer')) {
    let customerName: string | undefined;
    
    if (customerMatch) {
      customerName = customerMatch[1].trim();
    } else {
      // Extract potential company names by looking for capitalized words
      const potentialNames = normalizedQuery.match(/\b[A-Z][a-zA-Z]*(?:\s+[A-Z][a-zA-Z]*)*\b/g);
      if (potentialNames && potentialNames.length > 0) {
        customerName = potentialNames[0];
      }
    }
    
    if (!customerName) {
      return `I need more specific information about which customer or company you're interested in. Could you please provide the name of the customer?`;
    }
    
    // Find payments for this customer with fuzzy matching
    const matchingPayments = results.filter(r => 
      nameMatchScore(r.payment.payer_name.toLowerCase(), customerName!.toLowerCase()) > 0.6
    );
    
    if (matchingPayments.length === 0) {
      return `I couldn't find any payments from a customer matching "${customerName}" in our records. Please check the spelling or try a different customer name.`;
    }
    
    // Check for reconciliation status questions
    if (normalizedQuery.includes('why') && (normalizedQuery.includes('not reconciled') || normalizedQuery.includes('issue'))) {
      const unreconciledPayments = matchingPayments.filter(r => r.status !== 'Reconciled');
      
      if (unreconciledPayments.length === 0) {
        return `I've analyzed all payments from ${matchingPayments[0].payment.payer_name} and found all transactions are properly reconciled. There are no issues to report. The customer has made ${matchingPayments.length} payment(s) totaling $${matchingPayments.reduce((sum, p) => sum + p.payment.amount, 0).toFixed(2)}.`;
      }
      
      // Calculate statistics about the issues
      const issueTypes = unreconciledPayments.flatMap(p => p.issues.map(i => i.type));
      const issueCount: Record<string, number> = {};
      issueTypes.forEach(type => {
        issueCount[type] = (issueCount[type] || 0) + 1;
      });
      
      // Find the most common issue
      const mostCommonIssue = Object.entries(issueCount).sort((a, b) => b[1] - a[1])[0];
      
      return `${matchingPayments[0].payment.payer_name} has ${unreconciledPayments.length} payment(s) with reconciliation issues out of ${matchingPayments.length} total payments.\n\nThe most common issue is "${mostCommonIssue[0].replace('_', ' ')}" (appears ${mostCommonIssue[1]} times).\n\nHere are the affected payments:\n\n${
        unreconciledPayments.map(p => `- Payment ${p.payment.payment_id} for $${p.payment.amount.toFixed(2)} (${p.payment.payment_date}): ${getIssuesSummary(p)}`).join('\n')
      }\n\nRecommended action: ${generateCustomerActionRecommendation(unreconciledPayments)}`;
    }
    
    // General customer info
    const totalPaid = matchingPayments.reduce((sum, p) => sum + p.payment.amount, 0);
    const reconciledAmount = matchingPayments
      .filter(p => p.status === 'Reconciled')
      .reduce((sum, p) => sum + p.payment.amount, 0);
    
    const percentReconciled = (reconciledAmount / totalPaid) * 100;
    
    return `${matchingPayments[0].payment.payer_name} has made ${matchingPayments.length} payment(s) totaling $${totalPaid.toFixed(2)}.\n\nReconciliation status:\n- ${matchingPayments.filter(p => p.status === 'Reconciled').length} fully reconciled ($${reconciledAmount.toFixed(2)} - ${percentReconciled.toFixed(1)}%)\n- ${
      matchingPayments.filter(p => p.status === 'Partially Reconciled').length
    } partially reconciled\n- ${
      matchingPayments.filter(p => p.status === 'Unreconciled').length
    } unreconciled\n\nThe most recent payment was made on ${getLatestPaymentDate(matchingPayments)} via ${getMostCommonPaymentMethod(matchingPayments)}.`;
  }
  
  // Check for specific issue type questions
  if (normalizedQuery.includes('duplicate') || normalizedQuery.includes('duplicates')) {
    const duplicatePayments = results.filter(r => 
      r.issues.some(issue => issue.type === 'duplicate_payment')
    );
    
    if (duplicatePayments.length === 0) {
      return `I've analyzed all transactions and haven't detected any duplicate payments in the system. All payments appear to be unique.`;
    }
    
    // Calculate total amount of potential duplicate payments
    const duplicateAmount = duplicatePayments.reduce((sum, p) => sum + p.payment.amount, 0);
    
    return `My analysis has identified ${duplicatePayments.length} potential duplicate payments totaling $${duplicateAmount.toFixed(2)}:\n\n${
      duplicatePayments.map(p => {
        const duplicate = p.issues.find(i => i.type === 'duplicate_payment');
        if (duplicate && 'duplicatePayment' in duplicate) {
          return `- Payment ${p.payment.payment_id} from ${p.payment.payer_name} for $${p.payment.amount.toFixed(2)} appears to be a duplicate of payment ${duplicate.duplicatePayment.payment_id} from ${duplicate.duplicatePayment.payment_date}`;
        }
        return '';
      }).filter(Boolean).join('\n')
    }\n\nRecommended action: These transactions should be reviewed to prevent double-payments. If they are confirmed as duplicates, initiate refund procedures or apply the payments to other outstanding invoices.`;
  }
  
  if (normalizedQuery.includes('amount mismatch') || normalizedQuery.includes('wrong amount')) {
    const mismatchPayments = results.filter(r => 
      r.issues.some(issue => issue.type === 'amount_mismatch')
    );
    
    if (mismatchPayments.length === 0) {
      return `I've analyzed all transactions and haven't found any payments with amount mismatches. All payments match their corresponding invoice amounts.`;
    }
    
    // Calculate statistics
    const underpayments = mismatchPayments.filter(p => {
      const issue = p.issues.find(i => i.type === 'amount_mismatch');
      return issue && 'invoiceAmount' in issue && 'paymentAmount' in issue && issue.paymentAmount < issue.invoiceAmount;
    });
    
    const overpayments = mismatchPayments.filter(p => {
      const issue = p.issues.find(i => i.type === 'amount_mismatch');
      return issue && 'invoiceAmount' in issue && 'paymentAmount' in issue && issue.paymentAmount > issue.invoiceAmount;
    });
    
    return `I've identified ${mismatchPayments.length} payments with amount discrepancies:\n\n- ${underpayments.length} underpayments (customer paid less than invoice amount)\n- ${overpayments.length} overpayments (customer paid more than invoice amount)\n\nExamples:\n${
      mismatchPayments.slice(0, 3).map(p => {
        const issue = p.issues.find(i => i.type === 'amount_mismatch');
        if (issue && 'invoiceAmount' in issue && 'paymentAmount' in issue) {
          const diff = Math.abs(issue.paymentAmount - issue.invoiceAmount);
          const percentDiff = (diff / issue.invoiceAmount) * 100;
          return `- ${p.payment.payer_name}: Invoice $${issue.invoiceAmount.toFixed(2)} vs Payment $${issue.paymentAmount.toFixed(2)} (${percentDiff.toFixed(1)}% ${issue.paymentAmount > issue.invoiceAmount ? 'over' : 'under'})`;
        }
        return '';
      }).filter(Boolean).join('\n')
    }\n\nRecommended action: Review the underpayments to determine if remaining balances should be collected. For overpayments, verify if they should be applied to other outstanding invoices or refunded.`;
  }
  
  // Request for most common issues
  if (normalizedQuery.includes('common issue') || normalizedQuery.includes('main problem') || normalizedQuery.includes('biggest issue')) {
    // Count all issue types
    const allIssues = results.flatMap(r => r.issues.map(i => i.type));
    const issueCounts: Record<string, number> = {};
    
    allIssues.forEach(type => {
      issueCounts[type] = (issueCounts[type] || 0) + 1;
    });
    
    if (Object.keys(issueCounts).length === 0) {
      return `I've analyzed all transactions and found no reconciliation issues. All payments have been successfully matched to invoices and properly recorded in the ledger.`;
    }
    
    // Sort issues by frequency
    const sortedIssues = Object.entries(issueCounts)
      .sort((a, b) => b[1] - a[1])
      .map(([type, count]) => {
        const percent = (count / results.filter(r => r.issues.length > 0).length) * 100;
        return `${type.replace(/_/g, ' ')} (${count} instances, ${percent.toFixed(1)}% of issues)`;
      });
    
    return `Based on my analysis, the most common reconciliation issues are:\n\n1. ${sortedIssues.join('\n2. ')}\n\nAddressing these issues would significantly improve your reconciliation rate. I recommend focusing on the top issue first, as it represents the largest opportunity for improvement.`;
  }
  
  // Recommendations for improving reconciliation rate
  if (normalizedQuery.includes('improve') || normalizedQuery.includes('recommendation') || normalizedQuery.includes('suggestion')) {
    // Calculate current reconciliation rate
    const reconciled = results.filter(r => r.status === 'Reconciled').length;
    const reconciledRate = (reconciled / results.length) * 100;
    
    // Count all issue types
    const allIssues = results.flatMap(r => r.issues.map(i => i.type));
    const issueCounts: Record<string, number> = {};
    
    allIssues.forEach(type => {
      issueCounts[type] = (issueCounts[type] || 0) + 1;
    });
    
    // Get top issues
    const topIssues = Object.entries(issueCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3);
    
    return `Your current reconciliation rate is ${reconciledRate.toFixed(1)}%. Here are my recommendations to improve it:\n\n1. Address ${topIssues[0][0].replace(/_/g, ' ')} issues (${topIssues[0][1]} instances)\n   - ${getRecommendationForIssueType(topIssues[0][0])}\n\n2. Review payment reference requirements\n   - ${Math.round(results.filter(r => !r.payment.reference_note).length / results.length * 100)}% of payments lack proper reference information\n   - Consider implementing standardized reference formats for all payments\n\n3. Verify customer name consistency\n   - Implement entity resolution to handle variations in customer/payer names\n   - Maintain a database of parent-subsidiary relationships\n\n4. Improve ledger entry process\n   - ${results.filter(r => !r.ledgerEntry).length} payments lack corresponding ledger entries\n   - Consider automating ledger entries based on payment data`;
  }
  
  // Fallback for general queries
  return `Based on my analysis of ${results.length} transactions, I've found:\n\n- ${
    results.filter(r => r.status === 'Reconciled').length
  } fully reconciled payments (${(results.filter(r => r.status === 'Reconciled').length / results.length * 100).toFixed(1)}%)\n- ${
    results.filter(r => r.status === 'Partially Reconciled').length
  } partially reconciled payments (${(results.filter(r => r.status === 'Partially Reconciled').length / results.length * 100).toFixed(1)}%)\n- ${
    results.filter(r => r.status === 'Unreconciled').length
  } unreconciled payments (${(results.filter(r => r.status === 'Unreconciled').length / results.length * 100).toFixed(1)}%)\n\nThe most common reconciliation issues are:\n- ${
    getTopIssues(results)
  }\n\nYou can ask me more specific questions about invoices, payments, or customers.`;
}

/**
 * Generate customer-specific action recommendations
 */
function generateCustomerActionRecommendation(unreconciledPayments: ReconciliationResult[]): string {
  // Count issue types for this customer
  const issueTypes: Record<string, number> = {};
  
  unreconciledPayments.forEach(payment => {
    payment.issues.forEach(issue => {
      issueTypes[issue.type] = (issueTypes[issue.type] || 0) + 1;
    });
  });
  
  // Find most common issue
  const mostCommonIssue = Object.entries(issueTypes).sort((a, b) => b[1] - a[1])[0];
  
  switch (mostCommonIssue[0]) {
    case 'duplicate_payment':
      return `Contact the customer to discuss the duplicate payments and determine if refunds are needed or if payments should be applied to other invoices.`;
    case 'amount_mismatch':
      const underpayments = unreconciledPayments.filter(p => {
        const issue = p.issues.find(i => i.type === 'amount_mismatch');
        return issue && 'invoiceAmount' in issue && 'paymentAmount' in issue && issue.paymentAmount < issue.invoiceAmount;
      });
      
      if (underpayments.length > unreconciledPayments.length / 2) {
        return `The customer shows a pattern of underpayment. Consider reviewing payment terms with them and sending a statement of outstanding balances.`;
      } else {
        return `Review payment amounts with the customer to ensure they understand the correct amounts due. Consider setting up automated payment reminders with exact amounts.`;
      }
    case 'missing_invoice':
      return `Request invoice copies from the customer for all payments without matching invoices. Consider implementing a system where invoices must be registered before payments can be accepted.`;
    case 'payer_name_mismatch':
      return `Update the customer record to include all related entity names that might appear as payers (subsidiaries, parent companies, etc.). Establish a formal entity resolution process for this customer.`;
    case 'missing_ledger_entry':
      return `This is an internal record-keeping issue. Ensure all payments from this customer are promptly recorded in the general ledger.`;
    default:
      return `Review all unreconciled transactions and contact the customer to clarify payment details.`;
  }
}

/**
 * Get recommendation for specific issue type
 */
function getRecommendationForIssueType(issueType: string): string {
  switch (issueType) {
    case 'duplicate_payment':
      return "Implement automated duplicate detection before payment processing and add confirmation steps for payments with similar amounts within short time frames.";
    case 'missing_invoice':
      return "Require invoice registration before payment acceptance and implement a lookup system to match payments with invoices based on amount and payer.";
    case 'amount_mismatch':
      return "Consider allowing for partial payments in your reconciliation system and implement automatic follow-up for underpayments.";
    case 'missing_ledger_entry':
      return "Automate ledger entry creation from payment data to ensure all payments are properly recorded in the general ledger.";
    case 'payer_name_mismatch':
      return "Implement entity resolution to handle variations in customer/payer names and maintain a database of parent-subsidiary relationships.";
    default:
      return "Review processes related to this issue type and implement preventative measures.";
  }
}

/**
 * Helper functions for getting latest payment date
 */
function getLatestPaymentDate(payments: ReconciliationResult[]): string {
  if (payments.length === 0) return 'N/A';
  
  return payments
    .map(p => p.payment.payment_date)
    .sort((a, b) => new Date(b).getTime() - new Date(a).getTime())[0];
}

/**
 * Helper function to get most common payment method
 */
function getMostCommonPaymentMethod(payments: ReconciliationResult[]): string {
  if (payments.length === 0) return 'N/A';
  
  const methodCounts: Record<string, number> = {};
  payments.forEach(p => {
    methodCounts[p.payment.method] = (methodCounts[p.payment.method] || 0) + 1;
  });
  
  return Object.entries(methodCounts)
    .sort((a, b) => b[1] - a[1])[0][0];
}

/**
 * Helper function to simulate fuzzy name matching
 */
export function nameMatchScore(name1: string, name2: string): number {
  // Remove common business suffixes
  const cleanName1 = name1.replace(/\s+(inc\.?|corp\.?|llc|ltd\.?|co\.?)$/i, '').toLowerCase();
  const cleanName2 = name2.replace(/\s+(inc\.?|corp\.?|llc|ltd\.?|co\.?)$/i, '').toLowerCase();
  
  // Direct match
  if (cleanName1 === cleanName2) {
    return 1.0;
  }
  
  // One contains the other
  if (cleanName1.includes(cleanName2) || cleanName2.includes(cleanName1)) {
    return 0.9;
  }
  
  // Check each word
  const words1 = cleanName1.split(/\W+/);
  const words2 = cleanName2.split(/\W+/);
  
  let matchCount = 0;
  for (const word1 of words1) {
    if (word1.length <= 2) continue; // Skip short words
    
    for (const word2 of words2) {
      if (word2.length <= 2) continue;
      
      if (word1 === word2 || 
          (word1.length > 5 && word2.includes(word1)) || 
          (word2.length > 5 && word1.includes(word2))) {
        matchCount++;
        break;
      }
    }
  }
  
  // Calculate similarity score
  const maxPossibleMatches = Math.max(
    words1.filter(w => w.length > 2).length,
    words2.filter(w => w.length > 2).length
  );
  
  if (maxPossibleMatches === 0) return 0.5;
  return matchCount / maxPossibleMatches;
}

/**
 * Helper functions for generating readable descriptions
 */
function getStatusExplanation(result: ReconciliationResult): string {
  if (result.status === 'Reconciled') {
    return 'All validation checks passed. Payment correctly matches invoice and ledger entry.';
  } else if (result.status === 'Partially Reconciled') {
    if (result.issues.some(i => i.type === 'amount_mismatch')) {
      return 'Payment amount does not match invoice amount exactly.';
    } else if (result.issues.some(i => i.type === 'missing_ledger_entry')) {
      return 'Payment matches invoice but no corresponding ledger entry was found.';
    } else {
      return 'Some validation checks failed but payment could be matched to an invoice.';
    }
  } else {
    if (!result.matchedInvoice) {
      return 'No matching invoice could be found for this payment.';
    } else if (result.issues.some(i => i.type === 'duplicate_payment')) {
      return 'This appears to be a duplicate payment.';
    } else {
      return 'Multiple validation checks failed. Manual review required.';
    }
  }
}

function getIssueDescription(issue: any): string {
  switch (issue.type) {
    case 'duplicate_payment':
      return `Duplicate payment detected: This payment appears to be a duplicate of payment ${issue.duplicatePayment.payment_id} from ${issue.duplicatePayment.payment_date}`;
    case 'missing_invoice':
      return `Missing invoice: ${issue.message}`;
    case 'amount_mismatch':
      return `Amount mismatch: Invoice amount $${issue.invoiceAmount.toFixed(2)} does not match payment amount $${issue.paymentAmount.toFixed(2)}`;
    case 'missing_ledger_entry':
      return `Missing ledger entry: ${issue.message}`;
    case 'payer_name_mismatch':
      return `Entity mismatch: Payment from "${issue.payerName}" doesn't match customer name "${issue.customerName}"`;
    default:
      return `Unknown issue: ${issue.type}`;
  }
}

function getIssuesSummary(result: ReconciliationResult): string {
  if (result.issues.length === 0) {
    return 'No issues detected';
  }
  
  if (result.issues.length === 1) {
    return getIssueDescription(result.issues[0]);
  }
  
  return `${result.issues.length} issues detected: ${result.issues.map(i => i.type.replace('_', ' ')).join(', ')}`;
}

function getTopIssues(results: ReconciliationResult[]): string {
  const issueCounts: Record<string, number> = {};
  
  for (const result of results) {
    for (const issue of result.issues) {
      issueCounts[issue.type] = (issueCounts[issue.type] || 0) + 1;
    }
  }
  
  const issueTypes = Object.keys(issueCounts);
  if (issueTypes.length === 0) {
    return 'No issues detected';
  }
  
  issueTypes.sort((a, b) => issueCounts[b] - issueCounts[a]);
  
  const topIssues = issueTypes.slice(0, 3).map(type => {
    const count = issueCounts[type];
    const readableType = type.replace(/_/g, ' ');
    return `${readableType} (${count} instance${count === 1 ? '' : 's'})`;
  });
  
  return topIssues.join('\n- ');
}