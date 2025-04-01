# 💳 Payment Reconciliation Agent (Demo App)

An AI-powered demo application that automatically reconciles payments with invoices and ledger records. It uses synthetic US-based financial data to identify and explain discrepancies such as duplicate payments, over/underpayments, and missing ledger entries.

---

## 🧠 What It Does

This demo showcases a **Payment Reconciliation Agent** that:
- Matches **incoming payments** to **outstanding invoices**
- Cross-verifies matched transactions against the **general ledger**
- Detects and explains common reconciliation issues:
  - Duplicate payments
  - Missing payments
  - Mismatched amounts
  - Unknown payers
- Responds to **natural language queries** (e.g., “Why wasn’t INV-1003 reconciled?”)

---

## 🎯 Demo Use Case

Finance teams often spend hours manually reconciling payment records with internal accounting systems. This demo illustrates how AI can automate and simplify that process.

**Target Users:**
- Finance & Accounting Teams
- Controllers and Auditors
- AI/ML Product Buyers
- SaaS Decision Makers

---

## 📁 Demo Data

All data is **synthetic** and designed for the **US market**. The app uses three main tables:

### `invoices.csv`
| invoice_id | customer_name | amount_due | due_date   | status |
|------------|----------------|------------|------------|--------|
| INV-1001   | Acme Corp       | 1200.00    | 2025-02-15 | Open   |

### `payments.csv`
| payment_id | payer_name | amount | payment_date | method | reference_note |
|------------|------------|--------|--------------|--------|----------------|
| PAY-501    | Acme Corp  | 1200.00 | 2025-02-15   | ACH    | INV-1001       |

### `ledger.csv`
| ledger_entry_id | invoice_id | payment_id | amount  | entry_date |
|------------------|------------|------------|---------|------------|
| LED-001          | INV-1001   | PAY-501    | 1200.00 | 2025-02-15 |

> Additional anomalies (duplicate payments, partial payments, etc.) are built in to simulate real-world edge cases.

---

## 🖥️ Tech Stack

| Layer          | Tech                     |
|----------------|--------------------------|
| Frontend       | React + Tailwind         |
| Backend        | FastAPI or Flask (Python)|
| AI Agent       | [Lyzr](https://lyzr.ai) agent (hosted or local) |
| Database       | Supabase / SQLite / CSV  |
| Hosting        | Netlify / Render / Local |

---

## 🚀 How It Works

1. **Data Load**: Invoices, payments, and ledger entries are loaded from static CSVs or Supabase.
2. **Matching Engine**:
   - Matches payments to invoices using amount, payer name, and reference note.
   - Verifies matched records against the ledger.
3. **Discrepancy Engine**:
   - Flags and classifies unmatched or inconsistent entries.
   - Uses fuzzy logic and embeddings to handle naming mismatches.
4. **Explainability Agent**:
   - Accepts natural language questions.
   - Generates reasoning steps and decisions for reconciliation status.

---

## 💬 Example Prompts

> These work in the built-in Q&A assistant:

- “Show me unreconciled payments”
- “Why wasn’t INV-1003 matched?”
- “Which customers made duplicate payments?”

---

## 📸 UI Preview

**Reconciliation Dashboard**
- Matched vs Unmatched chart
- Filters by date, customer, status

**Transaction Detail**
- Matching logic per transaction
- Flags and error type

**Q&A Panel**
- Conversational interface powered by the agent

---

## 📦 Getting Started

### 1. Clone Repo

```bash
git clone https://github.com/your-org/payment-reconciliation-agent.git
cd payment-reconciliation-agent

2. Install Dependencies

# Backend
pip install -r backend/requirements.txt

# Frontend (if using React)
cd frontend
npm install

3. Run Locally

# Backend
uvicorn backend.main:app --reload

# Frontend
npm run dev

4. View App

Visit: http://localhost:3000

⸻

⚙️ Configuration
	•	data/ folder holds all synthetic CSVs
	•	.env for API keys and Supabase config (if using)
	•	agent_config.json for prompt tuning and agent behavior

⸻

📈 Success Criteria for Demo
	•	✅ 80%+ reconciliation accuracy
	•	✅ Real-time Q&A explanations
	•	✅ Detection of at least 3 error types (e.g., duplicates, missing, partial payments)
	•	✅ Visual clarity in dashboard

⸻

🤖 Powered by
	•	Lyzr Agents – modular agent infrastructure
	•	Supabase – database & auth (optional)
	•	OpenAI / Claude / Bedrock – for NLU if desired
