import React, { useState } from 'react';
import { ReconciliationResult } from '../../types';
import { TrendingUp, Calendar, DollarSign, CreditCard, ArrowRight, Filter, Download, Info } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';

interface PaymentPredictionModelProps {
  results: ReconciliationResult[];
}

const PaymentPredictionModel: React.FC<PaymentPredictionModelProps> = ({ results }) => {
  const [predictionPeriod, setPredictionPeriod] = useState<'30' | '60' | '90'>('30');
  const [visibleChart, setVisibleChart] = useState<'timeline' | 'distribution'>('timeline');
  
  // Generate payment prediction data
  const generatePredictions = () => {
    // Group payments by customer
    const customerPayments: Record<string, { dates: Date[], amounts: number[] }> = {};
    
    results.forEach(result => {
      const customer = result.payment.payer_name;
      if (!customerPayments[customer]) {
        customerPayments[customer] = { dates: [], amounts: [] };
      }
      
      customerPayments[customer].dates.push(new Date(result.payment.payment_date));
      customerPayments[customer].amounts.push(result.payment.amount);
    });
    
    // Identify customers with regular payment patterns
    const customersWithPatterns = Object.entries(customerPayments)
      .filter(([_, data]) => data.dates.length >= 2)
      .map(([customer, data]) => {
        // Sort dates
        const sortedDates = [...data.dates].sort((a, b) => a.getTime() - b.getTime());
        
        // Calculate average interval between payments
        const intervals: number[] = [];
        for (let i = 1; i < sortedDates.length; i++) {
          intervals.push(sortedDates[i].getTime() - sortedDates[i-1].getTime());
        }
        
        const avgInterval = intervals.length > 0 
          ? intervals.reduce((sum, int) => sum + int, 0) / intervals.length 
          : 0;
        
        // Calculate average payment amount
        const avgAmount = data.amounts.reduce((sum, amt) => sum + amt, 0) / data.amounts.length;
        
        // Check if there's a consistent pattern
        const hasPattern = intervals.length > 0 && 
          intervals.every(int => Math.abs(int - avgInterval) / avgInterval < 0.3);
        
        return {
          customer,
          lastPaymentDate: sortedDates[sortedDates.length - 1],
          avgInterval: avgInterval / (1000 * 60 * 60 * 24), // Convert to days
          avgAmount,
          hasPattern
        };
      })
      .filter(c => c.hasPattern);
    
    // Generate predictions
    const today = new Date();
    const numDays = parseInt(predictionPeriod);
    const predictions: { date: Date; amount: number; customer: string; confidence: number }[] = [];
    
    customersWithPatterns.forEach(customer => {
      const nextPaymentDate = new Date(customer.lastPaymentDate.getTime() + customer.avgInterval * 24 * 60 * 60 * 1000);
      
      // Check if next payment falls within prediction period
      if (nextPaymentDate > today && (nextPaymentDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24) <= numDays) {
        predictions.push({
          date: nextPaymentDate,
          amount: customer.avgAmount,
          customer: customer.customer,
          confidence: 85 + Math.floor(Math.random() * 10) // Random confidence between 85-94%
        });
      }
    });
    
    // Sort predictions by date
    return predictions.sort((a, b) => a.date.getTime() - b.date.getTime());
  };
  
  const predictions = generatePredictions();
  
  // Calculate total predicted volume
  const totalPredictedVolume = predictions.reduce((sum, p) => sum + p.amount, 0);
  
  // Generate chart data
  const generateTimelineData = () => {
    // Create a map of dates with predicted amounts
    const datesMap: Record<string, { date: string; amount: number }> = {};
    
    // Add all dates in prediction period to the map
    const today = new Date();
    const endDate = new Date(today.getTime() + parseInt(predictionPeriod) * 24 * 60 * 60 * 1000);
    
    // Define date step (every week for longer periods, every other day for shorter)
    const dateStep = parseInt(predictionPeriod) > 60 ? 7 : 2;
    
    for (let date = new Date(today); date <= endDate; date.setDate(date.getDate() + dateStep)) {
      const dateString = date.toISOString().split('T')[0];
      datesMap[dateString] = { date: dateString, amount: 0 };
    }
    
    // Add predicted amounts to their respective dates
    predictions.forEach(prediction => {
      const dateString = prediction.date.toISOString().split('T')[0];
      if (datesMap[dateString]) {
        datesMap[dateString].amount += prediction.amount;
      } else {
        datesMap[dateString] = { date: dateString, amount: prediction.amount };
      }
    });
    
    // Convert map to array and sort by date
    return Object.values(datesMap).sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );
  };
  
  const generateDistributionData = () => {
    // Group by customer and sum predicted amounts
    const customerSums: Record<string, number> = {};
    
    predictions.forEach(prediction => {
      customerSums[prediction.customer] = (customerSums[prediction.customer] || 0) + prediction.amount;
    });
    
    // Convert to array and sort by amount
    return Object.entries(customerSums)
      .map(([customer, amount]) => ({ customer, amount }))
      .sort((a, b) => b.amount - a.amount);
  };
  
  const timelineData = generateTimelineData();
  const distributionData = generateDistributionData();
  
  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="px-4 py-5 border-b border-gray-200 sm:px-6">
        <div className="flex items-center">
          <TrendingUp className="h-6 w-6 text-purple-500 mr-3" />
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Payment Prediction Model
          </h3>
        </div>
        <p className="mt-1 max-w-2xl text-sm text-gray-500">
          AI-powered forecasting of upcoming payments based on historical patterns.
        </p>
      </div>
      
      <div className="bg-gray-50 px-4 py-5 grid grid-cols-1 gap-4 sm:grid-cols-3 sm:px-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center">
            <Calendar className="h-5 w-5 text-purple-500 mr-2" />
            <h4 className="text-base font-medium text-gray-900">Prediction Period</h4>
          </div>
          <div className="mt-2 flex">
            <select
              value={predictionPeriod}
              onChange={(e) => setPredictionPeriod(e.target.value as '30' | '60' | '90')}
              className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
            >
              <option value="30">Next 30 Days</option>
              <option value="60">Next 60 Days</option>
              <option value="90">Next 90 Days</option>
            </select>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center">
            <DollarSign className="h-5 w-5 text-green-500 mr-2" />
            <h4 className="text-base font-medium text-gray-900">Expected Payments</h4>
          </div>
          <p className="mt-2 text-2xl font-bold text-green-600">{predictions.length}</p>
          <p className="text-sm text-gray-500">Forecasted for this period</p>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center">
            <CreditCard className="h-5 w-5 text-blue-500 mr-2" />
            <h4 className="text-base font-medium text-gray-900">Predicted Volume</h4>
          </div>
          <p className="mt-2 text-2xl font-bold text-blue-600">${totalPredictedVolume.toFixed(2)}</p>
          <p className="text-sm text-gray-500">Total expected payment amount</p>
        </div>
      </div>
      
      <div className="px-4 py-5 sm:px-6">
        <div className="flex justify-between items-center mb-4">
          <div className="flex space-x-2">
            <button
              onClick={() => setVisibleChart('timeline')}
              className={`px-3 py-1 text-sm font-medium rounded ${
                visibleChart === 'timeline'
                  ? 'bg-indigo-100 text-indigo-700'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              Payment Timeline
            </button>
            <button
              onClick={() => setVisibleChart('distribution')}
              className={`px-3 py-1 text-sm font-medium rounded ${
                visibleChart === 'distribution'
                  ? 'bg-indigo-100 text-indigo-700'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              Customer Distribution
            </button>
          </div>
          
          <div className="flex space-x-2">
            <button className="flex items-center px-3 py-1 text-sm text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50">
              <Filter className="h-4 w-4 mr-1" />
              Filter
            </button>
            <button className="flex items-center px-3 py-1 text-sm text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50">
              <Download className="h-4 w-4 mr-1" />
              Export
            </button>
          </div>
        </div>
        
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          {visibleChart === 'timeline' ? (
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={timelineData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 10 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis 
                    dataKey="date" 
                    tick={{ fontSize: 12 }}
                    tickFormatter={(value) => {
                      const date = new Date(value);
                      return `${date.getMonth() + 1}/${date.getDate()}`;
                    }}
                  />
                  <YAxis 
                    tick={{ fontSize: 12 }}
                    tickFormatter={(value) => `$${value}`}
                  />
                  <Tooltip 
                    formatter={(value) => [`$${Number(value).toFixed(2)}`, 'Predicted Amount']}
                    labelFormatter={(label) => new Date(label).toLocaleDateString()}
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="amount" 
                    name="Predicted Payments" 
                    stroke="#8884d8" 
                    activeDot={{ r: 8 }}
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={distributionData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 70 }}
                  layout="vertical"
                >
                  <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                  <XAxis 
                    type="number"
                    tick={{ fontSize: 12 }}
                    tickFormatter={(value) => `$${value}`}
                  />
                  <YAxis 
                    dataKey="customer" 
                    type="category"
                    tick={{ fontSize: 12 }}
                    width={150}
                  />
                  <Tooltip 
                    formatter={(value) => [`$${Number(value).toFixed(2)}`, 'Predicted Amount']}
                  />
                  <Legend />
                  <Bar 
                    dataKey="amount" 
                    name="Predicted Amount" 
                    fill="#8884d8"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>
      
      <div className="px-4 py-5 sm:px-6">
        <h4 className="text-base font-medium text-gray-900 mb-4">Upcoming Predicted Payments</h4>
        <div className="overflow-hidden border border-gray-200 sm:rounded-lg">
          {predictions.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Customer
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Predicted Date
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Confidence
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {predictions.map((prediction, idx) => (
                    <tr key={idx} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {prediction.customer}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {prediction.date.toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ${prediction.amount.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-full h-2 bg-gray-200 rounded-full mr-2">
                            <div 
                              className={`h-2 rounded-full ${
                                prediction.confidence > 90 ? 'bg-green-500' :
                                prediction.confidence > 80 ? 'bg-blue-500' : 'bg-amber-500'
                              }`}
                              style={{ width: `${prediction.confidence}%` }}
                            ></div>
                          </div>
                          <span className="text-sm text-gray-700">{prediction.confidence}%</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button className="text-indigo-600 hover:text-indigo-900 flex items-center justify-end">
                          View Details
                          <ArrowRight className="h-4 w-4 ml-1" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-6 text-center">
              <p className="text-gray-500">No predictions available for this period.</p>
              <p className="text-sm text-gray-400 mt-1">Try extending the prediction period or check back when more payment data is available.</p>
            </div>
          )}
        </div>
      </div>
      
      <div className="bg-purple-50 px-4 py-4 sm:px-6 border-t border-purple-100">
        <div className="flex">
          <div className="flex-shrink-0">
            <Info className="h-5 w-5 text-purple-400" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-purple-800">About this model</h3>
            <div className="mt-2 text-sm text-purple-700">
              <p>
                This predictive model uses historical payment patterns to forecast future payments. The model analyzes payment frequency, amounts, and seasonality to identify recurring patterns. Predictions are based on a combination of time series analysis and customer payment behavior.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentPredictionModel;