// Add missing types for name variations
export interface NameVariation {
  name: string;
  count: number;
  amount: number;
  variants: string[];
}

export interface Invoice {
  invoice_id: string;
  customer_name: string;
  amount_due: number;
  due_date: string;
  status: 'Open' | 'Paid' | 'Overdue';
}

export interface Payment {
  payment_id: string;
  payer_name: string;
  amount: number;
  payment_date: string;
  method: 'ACH' | 'Wire' | 'Check' | 'Credit Card';
  reference_note: string;
}

export interface LedgerEntry {
  ledger_entry_id: string;
  invoice_id: string;
  payment_id: string;
  amount: number;
  entry_date: string;
}

export interface ReconciliationResult {
  payment: Payment;
  matchedInvoice?: Invoice;
  ledgerEntry?: LedgerEntry;
  status: 'Reconciled' | 'Partially Reconciled' | 'Unreconciled';
  issues: ReconciliationIssue[];
  confidenceScore?: number;
}

export type ReconciliationIssue = 
  | { type: 'duplicate_payment'; duplicatePayment: Payment }
  | { type: 'missing_invoice'; message: string }
  | { type: 'amount_mismatch'; invoiceAmount: number; paymentAmount: number }
  | { type: 'missing_ledger_entry'; message: string }
  | { type: 'reference_mismatch'; invoiceId: string; referenceNote: string }
  | { type: 'payer_name_mismatch'; customerName: string; payerName: string };

export interface ReconciliationSummary {
  totalPayments: number;
  reconciledCount: number;
  partiallyReconciledCount: number;
  unreconciledCount: number;
  issuesByType: Record<string, number>;
}

export interface Filter {
  customerName?: string;
  startDate?: string;
  endDate?: string;
  issueType?: string;
  status?: string;
  minConfidence?: number;
}

export interface ReconciliationRules {
  enabledRules: {
    exactReferenceMatch: boolean;
    fuzzyCustomerMatch: boolean;
    amountTolerance: boolean;
    duplicateDetection: boolean;
    partialPaymentMatching: boolean;
    dateProximity: boolean;
  };
  thresholds: {
    minConfidenceScore: number;
    nameMatchSensitivity: number;
    amountMatchTolerance: number;
    dateDifferenceThreshold: number;
    partialPaymentMinPercentage: number;
  };
  weights: {
    referenceMatch: number;
    amountMatch: number;
    nameMatch: number;
    dateMatch: number;
  };
}