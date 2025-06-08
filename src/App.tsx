import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import HomePage from './pages/HomePage';
import GamePage from './pages/GamePage';
import ModuleSelectPage from './pages/ModuleSelectPage';
// These pages don't exist yet, so we'll create simple placeholder components
// import ProfilePage from './pages/ProfilePage';
// import LeaderboardPage from './pages/LeaderboardPage';
import ActivityContainer from './components/activities/ActivityContainer';
import apiKeyTest from './utils/apiKeyTest';

// Simple placeholder components for pages that don't exist yet
const PlaceholderPage: React.FC<{title: string}> = ({ title }) => {
  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center',
      minHeight: '100vh',
      padding: '2rem',
      backgroundColor: 'var(--background-color)'
    }}>
      <h1 style={{ color: 'var(--primary-color)' }}>{title}</h1>
      <p>This page is under construction.</p>
      <a href="/" style={{
        marginTop: '2rem',
        padding: '1rem',
        backgroundColor: 'var(--primary-color)',
        color: 'white',
        textDecoration: 'none',
        borderRadius: '8px'
      }}>Back to Home</a>
    </div>
  );
};

// Get basename from homepage in package.json or use '/' as default
const getBasename = () => {
  // For local development
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    // Parse the pathname to extract the base path if it exists
    const pathname = window.location.pathname;
    const basePath = pathname.split('/')[1]; // Get the first part of the path
    return basePath ? `/${basePath}` : '/';
  }
  
  // For production (GitHub Pages)
  return '/gamified_ai_literacy';
};

const App: React.FC = () => {
  // Test API key on app startup
  useEffect(() => {
    console.log('Testing API key on App startup...');
    const apiKeyStatus = apiKeyTest.checkApiKey();
    
    if (!apiKeyStatus.exists) {
      console.error('⚠️ API key is missing. OpenAI API calls will use simulation instead.');
    } else if (!apiKeyStatus.validPrefix) {
      console.error('⚠️ API key format appears invalid. OpenAI API calls may fail.');
    } else {
      console.log('✅ API key appears to be properly configured.');
    }
  }, []);
  
  return (
    <Router basename={getBasename()}>
      <ActivityContainer />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/game" element={<GamePage />} />
        {/* Use the actual ModuleSelectPage component */}
        <Route path="/modules" element={<ModuleSelectPage />} />
        <Route path="/profile" element={<PlaceholderPage title="User Profile" />} />
        <Route path="/leaderboard" element={<PlaceholderPage title="Leaderboard" />} />
        {/* Fallback route for any unknown paths */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
};

export default App; 