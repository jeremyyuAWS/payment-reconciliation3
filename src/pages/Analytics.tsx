import React from 'react';
import { AdvancedAnalyticsDashboard } from '../components/AdvancedAnalytics';
import { useReconciliationData } from '../hooks/useReconciliationData';
import { useNavigate } from 'react-router-dom';

const Analytics: React.FC = () => {
  const { results, loading } = useReconciliationData();
  const navigate = useNavigate();

  if (loading) {
    return <div>Loading Analytics Data...</div>;
  }

  return <AdvancedAnalyticsDashboard results={results} onBack={() => navigate('/')} />;
};

export default Analytics;
