import React, { Suspense, lazy, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';

// Dynamic import map for Route prefetching
const routeImports = {
  Login: () => import('./pages/Login'),
  Dashboard: () => import('./pages/Dashboard'),
  Criminals: () => import('./pages/Criminals'),
  AddCriminal: () => import('./pages/AddCriminal'),
  CriminalDetails: () => import('./pages/CriminalDetails'),
  Complaints: () => import('./pages/Complaints'),
  AddComplaint: () => import('./pages/AddComplaint'),
  StolenItems: () => import('./pages/StolenItems'),
  RecoveredItems: () => import('./pages/RecoveredItems'),
  MatchResults: () => import('./pages/MatchResults'),
  QRScanner: () => import('./pages/QRScanner'),
  Reports: () => import('./pages/Reports'),
  Users: () => import('./pages/Users')
};

// Lazy load Pages for performance optimization (bundle code-splitting)
const Login = lazy(routeImports.Login);
const Dashboard = lazy(routeImports.Dashboard);
const Criminals = lazy(routeImports.Criminals);
const AddCriminal = lazy(routeImports.AddCriminal);
const CriminalDetails = lazy(routeImports.CriminalDetails);
const Complaints = lazy(routeImports.Complaints);
const AddComplaint = lazy(routeImports.AddComplaint);
const StolenItems = lazy(routeImports.StolenItems);
const RecoveredItems = lazy(routeImports.RecoveredItems);
const MatchResults = lazy(routeImports.MatchResults);
const QRScanner = lazy(routeImports.QRScanner);
const Reports = lazy(routeImports.Reports);
const Users = lazy(routeImports.Users);

const AppRoutes = () => {
  const officerRoles = ['officer', 'admin'];

  // Prefetch all route bundles in the background on main thread idle
  useEffect(() => {
    const prefetchRoutes = () => {
      Object.values(routeImports).forEach((importFn) => {
        importFn().catch((err) => {
          console.debug('Prefetch route chunk failed:', err);
        });
      });
    };

    if ('requestIdleCallback' in window) {
      window.requestIdleCallback(prefetchRoutes);
    } else {
      setTimeout(prefetchRoutes, 1500);
    }
  }, []);

  // A sleek, subtle glassmorphic loading fallback centered in viewport
  const PageLoader = () => (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '60vh',
      width: '100%',
      color: 'var(--text-secondary)',
      gap: '0.75rem'
    }}>
      <div style={{
        width: '32px',
        height: '32px',
        borderRadius: '50%',
        border: '3px solid #3b82f6',
        borderTopColor: 'transparent',
        animation: 'spin 1s linear infinite'
      }} />
      <span style={{ fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
        Retrieving Registry...
      </span>
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );

  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />

        {/* Protected Routes - General (Citizens, Officers, Admins) */}
        <Route path="/" element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } />
        
        <Route path="/complaints" element={
          <ProtectedRoute>
            <Complaints />
          </ProtectedRoute>
        } />
        
        <Route path="/complaints/add" element={
          <ProtectedRoute>
            <AddComplaint />
          </ProtectedRoute>
        } />

        <Route path="/complaints/:id" element={
          <ProtectedRoute>
            <Complaints />
          </ProtectedRoute>
        } />

        {/* Protected Routes - Officers & Admins Only */}
        <Route path="/criminals" element={
          <ProtectedRoute allowedRoles={officerRoles}>
            <Criminals />
          </ProtectedRoute>
        } />
        
        <Route path="/criminals/add" element={
          <ProtectedRoute allowedRoles={officerRoles}>
            <AddCriminal />
          </ProtectedRoute>
        } />
        
        <Route path="/criminals/:id" element={
          <ProtectedRoute allowedRoles={officerRoles}>
            <CriminalDetails />
          </ProtectedRoute>
        } />

        <Route path="/stolen-items" element={
          <ProtectedRoute allowedRoles={officerRoles}>
            <StolenItems />
          </ProtectedRoute>
        } />

        <Route path="/recovered-items" element={
          <ProtectedRoute allowedRoles={officerRoles}>
            <RecoveredItems />
          </ProtectedRoute>
        } />

        <Route path="/qr-scanner" element={
          <ProtectedRoute allowedRoles={officerRoles}>
            <QRScanner />
          </ProtectedRoute>
        } />

        <Route path="/match-results" element={
          <ProtectedRoute allowedRoles={officerRoles}>
            <MatchResults />
          </ProtectedRoute>
        } />

        <Route path="/reports" element={
          <ProtectedRoute allowedRoles={officerRoles}>
            <Reports />
          </ProtectedRoute>
        } />

        <Route path="/users" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <Users />
          </ProtectedRoute>
        } />

        {/* Fallback to Dashboard */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
};

export default AppRoutes;
