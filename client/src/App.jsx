import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import AppRoutes from './routes';
import Navbar from './components/Navbar';
import FloatingToolbar from './components/FloatingToolbar';

const AppContent = () => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50 text-slate-900 font-sans">
        <div className="text-center">
          <div className="w-10 h-10 border-3 border-indigo-100 border-t-primary rounded-full animate-spin mx-auto mb-4"></div>
          <p className="tracking-wide text-sm text-slate-600">Initializing SHIELD Terminal...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AppRoutes />;
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* Top Global Header Navigation */}
      <Navbar />
      
      {/* Main content frame (full width, padded for floating toolbar at bottom) */}
      <main className="flex-1 p-6 md:p-10 pb-28 bg-slate-50">
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
