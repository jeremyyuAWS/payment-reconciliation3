import React from 'react';
import { ReconciliationResult } from '../types';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell, LabelList } from 'recharts';

interface CustomerAnalysisChartProps {
  results: ReconciliationResult[];
}

const CustomerAnalysisChart: React.FC<CustomerAnalysisChartProps> = ({ results }) => {
  // Generate data for customer analysis
  const getCustomerData = () => {
    const customerPayments: Record<string, { 
      reconciledAmount: number; 
      unreconciledAmount: number;
      partialAmount: number;
      totalTransactions: number; 
    }> = {};
    
    results.forEach(result => {
      const customerName = result.payment.payer_name;
      
      if (!customerPayments[customerName]) {
        customerPayments[customerName] = {
          reconciledAmount: 0,
          unreconciledAmount: 0,
          partialAmount: 0,
          totalTransactions: 0
        };
      }
      
      customerPayments[customerName].totalTransactions += 1;
      
      if (result.status === 'Reconciled') {
        customerPayments[customerName].reconciledAmount += result.payment.amount;
      } else if (result.status === 'Partially Reconciled') {
        customerPayments[customerName].partialAmount += result.payment.amount;
      } else {
        customerPayments[customerName].unreconciledAmount += result.payment.amount;
      }
    });
    
    // Convert to array for chart
    return Object.entries(customerPayments)
      .map(([name, data]) => ({
        name: name,
        reconciledAmount: Math.round(data.reconciledAmount * 100) / 100,
        unreconciledAmount: Math.round(data.unreconciledAmount * 100) / 100,
        partialAmount: Math.round(data.partialAmount * 100) / 100,
        totalTransactions: data.totalTransactions
      }))
      .sort((a, b) => 
        (b.reconciledAmount + b.unreconciledAmount + b.partialAmount) - 
        (a.reconciledAmount + a.unreconciledAmount + a.partialAmount)
      )
      .slice(0, 6); // Top 6 customers by payment volume
  };

  const customerData = getCustomerData();
  
  // Don't render if no data
  if (customerData.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="px-4 py-5 sm:px-6 bg-indigo-50 border-b border-indigo-100">
        <h3 className="text-lg font-medium text-gray-900">Customer Payment Analysis</h3>
        <p className="mt-1 text-sm text-gray-500">
          Payment reconciliation status by customer (top 6 by volume)
        </p>
      </div>
      
      <div className="px-4 py-5 sm:p-6">
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={customerData}
              margin={{ top: 20, right: 30, left: 20, bottom: 70 }}
              barGap={0}
              barCategoryGap="20%"
            >
              <XAxis 
                dataKey="name" 
                angle={-45} 
                textAnchor="end" 
                height={80} 
                tick={{ fontSize: 12 }}
              />
              <YAxis 
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => `$${value}`}
              />
              <Tooltip 
                formatter={(value: number) => [`$${value.toFixed(2)}`, 'Amount']}
                cursor={{ fill: 'rgba(0, 0, 0, 0.05)' }}
              />
              <Bar 
                dataKey="reconciledAmount" 
                name="Reconciled" 
                stackId="a" 
                fill="#10B981"
              />
              <Bar 
                dataKey="partialAmount" 
                name="Partially Reconciled" 
                stackId="a" 
                fill="#F59E0B"
              />
              <Bar 
                dataKey="unreconciledAmount" 
                name="Unreconciled" 
                stackId="a" 
                fill="#EF4444"
              >
                <LabelList 
                  dataKey="totalTransactions" 
                  position="top" 
                  formatter={(value: number) => `${value} txn${value !== 1 ? 's' : ''}`}
                  fill="#6B7280"
                  fontSize={11}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default CustomerAnalysisChart;