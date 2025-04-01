import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import MainLayout from './layouts/MainLayout';
import Dashboard from './pages/Dashboard';
import Analytics from './pages/Analytics';
import Performance from './pages/Performance';
import Testing from './pages/Testing';
import WelcomeModal from './components/WelcomeModal';
import GuidedTour from './components/GuidedTour';

function App() {
  const [showWelcomeModal, setShowWelcomeModal] = useState(() => {
    return !localStorage.getItem('hasSeenWelcome');
  });
  const [tourEnabled, setTourEnabled] = useState(false);

  const startTour = () => {
    setShowWelcomeModal(false);
    setTourEnabled(true);
  };

  const endTour = () => {
    setTourEnabled(false);
    localStorage.setItem('hasSeenWelcome', 'true');
  };

  const dismissWelcome = () => {
    setShowWelcomeModal(false);
    localStorage.setItem('hasSeenWelcome', 'true');
  };

  return (
    <Router>
      <AuthProvider>
        <MainLayout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/performance" element={<Performance />} />
            <Route path="/testing" element={<Testing />} />
          </Routes>

          {showWelcomeModal && (
            <WelcomeModal 
              onStart={startTour}
              onDismiss={dismissWelcome}
            />
          )}

          <GuidedTour 
            enabled={tourEnabled}
            onComplete={endTour}
            onSkip={endTour}
          />
        </MainLayout>
      </AuthProvider>
    </Router>
  );
}

export default App;