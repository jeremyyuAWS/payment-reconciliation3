import { Invoice, Payment, LedgerEntry } from '../types';

const API_URL = 'http://localhost:3000/api';

// Helper function to get the current user ID from Firebase (if authenticated)
const getUserId = (): string | null => {
  // In a real app, this would fetch the user ID from Firebase or your auth provider
  // For demo purposes, we'll use a static value or return from localStorage
  return localStorage.getItem('userId') || null;
};

export const fetchInvoices = async (): Promise<Invoice[]> => {
  const userId = getUserId();
  const url = userId ? `${API_URL}/invoices?userId=${userId}` : `${API_URL}/invoices`;
  
  try {
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error('Failed to fetch invoices');
    }
    
    const data = await response.json();
    return data.map((invoice: any) => ({
      ...invoice,
      amount_due: Number(invoice.amount_due)
    }));
  } catch (error) {
    console.error('Error fetching invoices:', error);
    throw error;
  }
};

export const fetchPayments = async (): Promise<Payment[]> => {
  const userId = getUserId();
  const url = userId ? `${API_URL}/payments?userId=${userId}` : `${API_URL}/payments`;
  
  try {
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error('Failed to fetch payments');
    }
    
    const data = await response.json();
    return data.map((payment: any) => ({
      ...payment,
      amount: Number(payment.amount)
    }));
  } catch (error) {
    console.error('Error fetching payments:', error);
    throw error;
  }
};

export const fetchLedgerEntries = async (): Promise<LedgerEntry[]> => {
  const userId = getUserId();
  const url = userId ? `${API_URL}/ledger-entries?userId=${userId}` : `${API_URL}/ledger-entries`;
  
  try {
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error('Failed to fetch ledger entries');
    }
    
    const data = await response.json();
    return data.map((entry: any) => ({
      ...entry,
      amount: Number(entry.amount)
    }));
  } catch (error) {
    console.error('Error fetching ledger entries:', error);
    throw error;
  }
};

export const importInvoices = async (invoices: Invoice[]): Promise<{ message: string }> => {
  const userId = getUserId();
  
  try {
    const response = await fetch(`${API_URL}/import/invoices`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        invoices,
        userId
      }),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to import invoices');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error importing invoices:', error);
    throw error;
  }
};

export const importPayments = async (payments: Payment[]): Promise<{ message: string }> => {
  const userId = getUserId();
  
  try {
    const response = await fetch(`${API_URL}/import/payments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        payments,
        userId
      }),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to import payments');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error importing payments:', error);
    throw error;
  }
};

export const importLedgerEntries = async (entries: LedgerEntry[]): Promise<{ message: string }> => {
  const userId = getUserId();
  
  try {
    const response = await fetch(`${API_URL}/import/ledger-entries`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        entries,
        userId
      }),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to import ledger entries');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error importing ledger entries:', error);
    throw error;
  }
};