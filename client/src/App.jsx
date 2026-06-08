import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import AppRoutes from './routes';
import Navbar from './components/Navbar';
import FloatingToolbar from './components/FloatingToolbar';

// Subcomponent that renders layout based on auth state
const AppContent = () => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        backgroundColor: 'var(--bg-primary)',
        color: 'var(--text-primary)',
        fontFamily: 'sans-serif'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '40px',
            height: '40px',
            border: '3px solid rgba(79, 70, 229, 0.15)',
            borderTopColor: 'var(--primary)',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 1rem'
          }}></div>
          <p style={{ letterSpacing: '0.05em', fontSize: '0.9rem' }}>Initializing SHIELD Terminal...</p>
          <style>{`
            @keyframes spin {
              to { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AppRoutes />;
  }

  return (
    <div className="layout-container" style={{ flexDirection: 'column' }}>
      {/* Top Global Header Navigation */}
      <Navbar />
      
      {/* Main content frame (full width, padded for floating toolbar at bottom) */}
      <main className="main-content" style={{ paddingBottom: '7rem' }}>
        <AppRoutes />
      </main>

      {/* Glassmorphic Floating Command Toolbar */}
      <FloatingToolbar />
    </div>
  );
};

const App = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
