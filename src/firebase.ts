import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

// Firebase configuration
// For a real app, these values would be in environment variables
const firebaseConfig = {
  apiKey: "AIzaSyDummyKeyForDemoPurposesOnly",
  authDomain: "payment-reconciliation-demo.firebaseapp.com",
  projectId: "payment-reconciliation-demo",
  storageBucket: "payment-reconciliation-demo.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef1234567890abcdef"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export auth for use in components
export const auth = getAuth(app);
export default app;