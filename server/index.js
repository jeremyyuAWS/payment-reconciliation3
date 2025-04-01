import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import Database from 'better-sqlite3';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Initialize database
const db = new Database(join(__dirname, 'reconciliation.db'));

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Initialize database tables if they don't exist
function setupDatabase() {
  // Create invoices table
  db.exec(`
    CREATE TABLE IF NOT EXISTS invoices (
      invoice_id TEXT PRIMARY KEY,
      customer_name TEXT NOT NULL,
      amount_due REAL NOT NULL,
      due_date TEXT,
      status TEXT CHECK(status IN ('Open', 'Paid', 'Overdue')) DEFAULT 'Open',
      user_id TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Create payments table
  db.exec(`
    CREATE TABLE IF NOT EXISTS payments (
      payment_id TEXT PRIMARY KEY,
      payer_name TEXT NOT NULL,
      amount REAL NOT NULL,
      payment_date TEXT,
      method TEXT CHECK(method IN ('ACH', 'Wire', 'Check', 'Credit Card')),
      reference_note TEXT,
      user_id TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Create ledger entries table
  db.exec(`
    CREATE TABLE IF NOT EXISTS ledger_entries (
      ledger_entry_id TEXT PRIMARY KEY,
      invoice_id TEXT,
      payment_id TEXT,
      amount REAL NOT NULL,
      entry_date TEXT,
      user_id TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (invoice_id) REFERENCES invoices(invoice_id),
      FOREIGN KEY (payment_id) REFERENCES payments(payment_id)
    )
  `);

  // Check if sample data needs to be inserted (when no records exist)
  const invoiceCount = db.prepare('SELECT COUNT(*) as count FROM invoices').get();
  
  if (invoiceCount.count === 0) {
    insertSampleData();
  }
}

// Insert sample data for demonstration
function insertSampleData() {
  // Sample invoices
  const invoices = [
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
    }
  ];

  // Sample payments
  const payments = [
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
    }
  ];

  // Sample ledger entries
  const ledgerEntries = [
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
    }
  ];

  // Insert invoices
  const insertInvoice = db.prepare(`
    INSERT INTO invoices (invoice_id, customer_name, amount_due, due_date, status)
    VALUES (@invoice_id, @customer_name, @amount_due, @due_date, @status)
  `);

  for (const invoice of invoices) {
    insertInvoice.run(invoice);
  }

  // Insert payments
  const insertPayment = db.prepare(`
    INSERT INTO payments (payment_id, payer_name, amount, payment_date, method, reference_note)
    VALUES (@payment_id, @payer_name, @amount, @payment_date, @method, @reference_note)
  `);

  for (const payment of payments) {
    insertPayment.run(payment);
  }

  // Insert ledger entries
  const insertLedgerEntry = db.prepare(`
    INSERT INTO ledger_entries (ledger_entry_id, invoice_id, payment_id, amount, entry_date)
    VALUES (@ledger_entry_id, @invoice_id, @payment_id, @amount, @entry_date)
  `);

  for (const entry of ledgerEntries) {
    insertLedgerEntry.run(entry);
  }
}

// Set up the database
setupDatabase();

// Routes

// Get all invoices
app.get('/api/invoices', (req, res) => {
  const userId = req.query.userId;
  
  let query = 'SELECT * FROM invoices';
  let params = [];
  
  if (userId) {
    query += ' WHERE user_id = ? OR user_id IS NULL';
    params.push(userId);
  }
  
  try {
    const invoices = db.prepare(query).all(params);
    res.json(invoices);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get invoice by ID
app.get('/api/invoices/:id', (req, res) => {
  try {
    const invoice = db.prepare('SELECT * FROM invoices WHERE invoice_id = ?').get(req.params.id);
    
    if (!invoice) {
      return res.status(404).json({ error: 'Invoice not found' });
    }
    
    res.json(invoice);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create new invoice
app.post('/api/invoices', (req, res) => {
  const { invoice_id, customer_name, amount_due, due_date, status, user_id } = req.body;

  if (!invoice_id || !customer_name || !amount_due) {
    return res.status(400).json({ error: 'Required fields missing' });
  }

  try {
    const result = db.prepare(`
      INSERT INTO invoices (invoice_id, customer_name, amount_due, due_date, status, user_id)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(invoice_id, customer_name, amount_due, due_date, status || 'Open', user_id);

    res.status(201).json({ 
      id: invoice_id, 
      message: 'Invoice created successfully' 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all payments
app.get('/api/payments', (req, res) => {
  const userId = req.query.userId;
  
  let query = 'SELECT * FROM payments';
  let params = [];
  
  if (userId) {
    query += ' WHERE user_id = ? OR user_id IS NULL';
    params.push(userId);
  }
  
  try {
    const payments = db.prepare(query).all(params);
    res.json(payments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get payment by ID
app.get('/api/payments/:id', (req, res) => {
  try {
    const payment = db.prepare('SELECT * FROM payments WHERE payment_id = ?').get(req.params.id);
    
    if (!payment) {
      return res.status(404).json({ error: 'Payment not found' });
    }
    
    res.json(payment);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create new payment
app.post('/api/payments', (req, res) => {
  const { payment_id, payer_name, amount, payment_date, method, reference_note, user_id } = req.body;

  if (!payment_id || !payer_name || !amount) {
    return res.status(400).json({ error: 'Required fields missing' });
  }

  try {
    const result = db.prepare(`
      INSERT INTO payments (payment_id, payer_name, amount, payment_date, method, reference_note, user_id)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(payment_id, payer_name, amount, payment_date, method, reference_note, user_id);

    res.status(201).json({ 
      id: payment_id, 
      message: 'Payment created successfully' 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all ledger entries
app.get('/api/ledger-entries', (req, res) => {
  const userId = req.query.userId;
  
  let query = 'SELECT * FROM ledger_entries';
  let params = [];
  
  if (userId) {
    query += ' WHERE user_id = ? OR user_id IS NULL';
    params.push(userId);
  }
  
  try {
    const entries = db.prepare(query).all(params);
    res.json(entries);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create new ledger entry
app.post('/api/ledger-entries', (req, res) => {
  const { ledger_entry_id, invoice_id, payment_id, amount, entry_date, user_id } = req.body;

  if (!ledger_entry_id || !invoice_id || !payment_id || !amount) {
    return res.status(400).json({ error: 'Required fields missing' });
  }

  try {
    const result = db.prepare(`
      INSERT INTO ledger_entries (ledger_entry_id, invoice_id, payment_id, amount, entry_date, user_id)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(ledger_entry_id, invoice_id, payment_id, amount, entry_date, user_id);

    res.status(201).json({ 
      id: ledger_entry_id, 
      message: 'Ledger entry created successfully' 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Bulk import API for invoices
app.post('/api/import/invoices', (req, res) => {
  const { invoices, userId } = req.body;
  
  if (!Array.isArray(invoices) || invoices.length === 0) {
    return res.status(400).json({ error: 'Invalid or empty invoices array' });
  }
  
  const insertInvoice = db.prepare(`
    INSERT INTO invoices (invoice_id, customer_name, amount_due, due_date, status, user_id)
    VALUES (@invoice_id, @customer_name, @amount_due, @due_date, @status, @user_id)
  `);
  
  try {
    db.transaction(() => {
      for (const invoice of invoices) {
        insertInvoice.run({
          ...invoice,
          user_id: userId,
          status: invoice.status || 'Open'
        });
      }
    })();
    
    res.status(201).json({ 
      message: `${invoices.length} invoices imported successfully` 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Bulk import API for payments
app.post('/api/import/payments', (req, res) => {
  const { payments, userId } = req.body;
  
  if (!Array.isArray(payments) || payments.length === 0) {
    return res.status(400).json({ error: 'Invalid or empty payments array' });
  }
  
  const insertPayment = db.prepare(`
    INSERT INTO payments (payment_id, payer_name, amount, payment_date, method, reference_note, user_id)
    VALUES (@payment_id, @payer_name, @amount, @payment_date, @method, @reference_note, @user_id)
  `);
  
  try {
    db.transaction(() => {
      for (const payment of payments) {
        insertPayment.run({
          ...payment,
          user_id: userId
        });
      }
    })();
    
    res.status(201).json({ 
      message: `${payments.length} payments imported successfully` 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Bulk import API for ledger entries
app.post('/api/import/ledger-entries', (req, res) => {
  const { entries, userId } = req.body;
  
  if (!Array.isArray(entries) || entries.length === 0) {
    return res.status(400).json({ error: 'Invalid or empty ledger entries array' });
  }
  
  const insertEntry = db.prepare(`
    INSERT INTO ledger_entries (ledger_entry_id, invoice_id, payment_id, amount, entry_date, user_id)
    VALUES (@ledger_entry_id, @invoice_id, @payment_id, @amount, @entry_date, @user_id)
  `);
  
  try {
    db.transaction(() => {
      for (const entry of entries) {
        insertEntry.run({
          ...entry,
          user_id: userId
        });
      }
    })();
    
    res.status(201).json({ 
      message: `${entries.length} ledger entries imported successfully` 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});