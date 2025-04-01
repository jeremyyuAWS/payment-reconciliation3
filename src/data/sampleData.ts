// Update the sample data to include more complex relationships
export const invoices: Invoice[] = [
  {
    invoice_id: 'INV-1001',
    customer_name: 'Acme Corp',
    amount_due: 1200.00,
    due_date: '2025-02-15',
    status: 'Open'
  },
  {
    invoice_id: 'INV-1002',
    customer_name: 'Beta Inc',
    amount_due: 750.00,
    due_date: '2025-02-20',
    status: 'Paid'
  },
  {
    invoice_id: 'INV-1003',
    customer_name: 'Gamma LLC',
    amount_due: 1050.00,
    due_date: '2025-02-28',
    status: 'Open'
  },
  {
    invoice_id: 'INV-1004',
    customer_name: 'Delta Co',
    amount_due: 2500.00,
    due_date: '2025-02-22',
    status: 'Open'
  },
  {
    invoice_id: 'INV-1005',
    customer_name: 'Epsilon Partners',
    amount_due: 960.00,
    due_date: '2025-03-05',
    status: 'Open'
  },
  // Additional invoices with parent-subsidiary relationships
  {
    invoice_id: 'INV-1006',
    customer_name: 'Acme Corp - West Division',
    amount_due: 3450.00,
    due_date: '2025-03-10',
    status: 'Open'
  },
  {
    invoice_id: 'INV-1007',
    customer_name: 'Acme Corp Holdings',
    amount_due: 1875.50,
    due_date: '2025-03-15',
    status: 'Open'
  },
  {
    invoice_id: 'INV-1008',
    customer_name: 'Beta Subsidiaries LLC',
    amount_due: 5200.00,
    due_date: '2025-03-20',
    status: 'Open'
  },
  {
    invoice_id: 'INV-1009',
    customer_name: 'Beta International',
    amount_due: 950.00,
    due_date: '2025-03-08',
    status: 'Open'
  },
  {
    invoice_id: 'INV-1010',
    customer_name: 'Gamma Group',
    amount_due: 2300.00,
    due_date: '2025-03-25',
    status: 'Open'
  },
  // Add more related entities
  {
    invoice_id: 'INV-1011',
    customer_name: 'Delta Corporation',
    amount_due: 4200.00,
    due_date: '2025-03-28',
    status: 'Open'
  },
  {
    invoice_id: 'INV-1012',
    customer_name: 'Delta Logistics',
    amount_due: 1800.00,
    due_date: '2025-03-30',
    status: 'Open'
  }
];

export const payments: Payment[] = [
  {
    payment_id: 'PAY-501',
    payer_name: 'Acme Corp',
    amount: 1200.00,
    payment_date: '2025-02-15',
    method: 'ACH',
    reference_note: 'INV-1001'
  },
  {
    payment_id: 'PAY-502',
    payer_name: 'Beta Inc',
    amount: 750.00,
    payment_date: '2025-02-19',
    method: 'Wire',
    reference_note: 'INV-1002'
  },
  {
    payment_id: 'PAY-503',
    payer_name: 'Gamma LLC',
    amount: 500.00,
    payment_date: '2025-02-25',
    method: 'ACH',
    reference_note: 'INV-1003'
  },
  {
    payment_id: 'PAY-504',
    payer_name: 'Acme Corp',
    amount: 1200.00,
    payment_date: '2025-02-15',
    method: 'ACH',
    reference_note: 'INV-1001'
  },
  {
    payment_id: 'PAY-505',
    payer_name: 'Delta Company',
    amount: 2400.00,
    payment_date: '2025-02-20',
    method: 'Wire',
    reference_note: 'INV-1004'
  },
  {
    payment_id: 'PAY-506',
    payer_name: 'Unknown Entity',
    amount: 960.00,
    payment_date: '2025-03-01',
    method: 'ACH',
    reference_note: 'UNKNOWN'
  },
  // Additional payments with parent-subsidiary relationships
  {
    payment_id: 'PAY-507',
    payer_name: 'Acme Corp West',
    amount: 3450.00,
    payment_date: '2025-03-08',
    method: 'Wire',
    reference_note: 'INV-1006'
  },
  {
    payment_id: 'PAY-508',
    payer_name: 'Acme Holdings',
    amount: 1875.50,
    payment_date: '2025-03-14',
    method: 'ACH',
    reference_note: 'INV-1007'
  },
  {
    payment_id: 'PAY-509',
    payer_name: 'Beta Subsidiaries',
    amount: 5200.00,
    payment_date: '2025-03-18',
    method: 'Wire',
    reference_note: 'INV-1008'
  },
  {
    payment_id: 'PAY-510',
    payer_name: 'Beta International Inc',
    amount: 950.00,
    payment_date: '2025-03-07',
    method: 'Wire',
    reference_note: 'INV-1009'
  },
  {
    payment_id: 'PAY-511',
    payer_name: 'Gamma Group Holdings',
    amount: 2300.00,
    payment_date: '2025-03-23',
    method: 'ACH',
    reference_note: 'INV-1010'
  },
  {
    payment_id: 'PAY-512',
    payer_name: 'Delta Corp',
    amount: 4200.00,
    payment_date: '2025-03-26',
    method: 'Wire',
    reference_note: 'INV-1011'
  },
  {
    payment_id: 'PAY-513',
    payer_name: 'Delta Logistics Services',
    amount: 1800.00,
    payment_date: '2025-03-28',
    method: 'ACH',
    reference_note: 'INV-1012'
  }
];

export const ledgerEntries: LedgerEntry[] = [
  {
    ledger_entry_id: 'LED-001',
    invoice_id: 'INV-1001',
    payment_id: 'PAY-501',
    amount: 1200.00,
    entry_date: '2025-02-15'
  },
  {
    ledger_entry_id: 'LED-002',
    invoice_id: 'INV-1002',
    payment_id: 'PAY-502',
    amount: 750.00,
    entry_date: '2025-02-19'
  },
  // Add more ledger entries for parent-subsidiary relationships
  {
    ledger_entry_id: 'LED-003',
    invoice_id: 'INV-1006',
    payment_id: 'PAY-507',
    amount: 3450.00,
    entry_date: '2025-03-08'
  },
  {
    ledger_entry_id: 'LED-004',
    invoice_id: 'INV-1007',
    payment_id: 'PAY-508',
    amount: 1875.50,
    entry_date: '2025-03-14'
  },
  {
    ledger_entry_id: 'LED-005',
    invoice_id: 'INV-1008',
    payment_id: 'PAY-509',
    amount: 5200.00,
    entry_date: '2025-03-18'
  },
  {
    ledger_entry_id: 'LED-006',
    invoice_id: 'INV-1009',
    payment_id: 'PAY-510',
    amount: 950.00,
    entry_date: '2025-03-07'
  }
];