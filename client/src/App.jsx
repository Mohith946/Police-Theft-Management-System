import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import AppRoutes from './routes';
import Navbar from './components/Navbar';
import FloatingToolbar from './components/FloatingToolbar';
import Sidebar from './components/Sidebar';

const AppContent = () => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#faf5ee] text-[#3a302a] font-sans">
        <div className="text-center">
          <div className="w-10 h-10 border-3 border-[#d8d0c8] border-t-primary rounded-full animate-spin mx-auto mb-4"></div>
          <p className="tracking-wide text-sm text-[#605850] font-medium font-body">Initializing SHIELD Terminal...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AppRoutes />;
  }

  return (
    <div className="flex min-h-screen bg-[#faf5ee]">
      {/* Vertical Sidebar (floating, hidden on mobile) */}
      <Sidebar />
      
      {/* Content Frame */}
      <div className="flex-1 flex flex-col min-h-screen md:pl-64 transition-all duration-300">
        {/* Top Global Header Navigation (Mobile Only) */}
        <div className="md:hidden">
          <Navbar />
        </div>
        
        {/* Main content frame */}
        <main className="flex-1 p-6 md:p-10 pb-28">
          <AppRoutes />
        </main>
      </div>

      {/* Glassmorphic Floating Command Toolbar (mobile shortcut) */}
      <div className="md:hidden">
        <FloatingToolbar />
      </div>
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
