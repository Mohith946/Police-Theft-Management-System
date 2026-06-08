import React, { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Bell, Scan, BarChart3, ShieldCheck } from 'lucide-react';
import axios from 'axios';

const FloatingToolbar = () => {
  const { user } = useAuth();
  const [matchCount, setMatchCount] = useState(0);

  useEffect(() => {
    const fetchAlertCount = async () => {
      if (user) {
        try {
          const res = await axios.get('/api/matches?status=pending');
          if (res.data.success) {
            setMatchCount(res.data.data.length);
          }
        } catch (err) {
          console.error('Failed to load pending match alerts:', err.message);
        }
      }
    };

    fetchAlertCount();
    const interval = setInterval(fetchAlertCount, 30000); // Poll every 30 seconds
    return () => clearInterval(interval);
  }, [user]);

  if (!user) return null;

  const linkStyle = ({ isActive }) => ({
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.5rem 1.25rem',
    borderRadius: '9999px',
    color: isActive ? '#ffffff' : 'var(--text-secondary)',
    background: isActive ? 'var(--primary)' : 'transparent',
    border: '1px solid transparent',
    textDecoration: 'none',
    fontSize: '0.8rem',
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    transition: 'all 0.25s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
    position: 'relative'
  });

  return (
    <div style={{
      position: 'fixed',
      bottom: '1.5rem',
      left: '50%',
      transform: 'translateX(-50%)',
      zIndex: 999,
      pointerEvents: 'none',
      width: '100%',
      display: 'flex',
      justifyContent: 'center',
      padding: '0 1rem'
    }}>
      <div style={{
        background: 'rgba(255, 255, 255, 0.85)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        border: '1px solid var(--border-color)',
        borderRadius: '9999px',
        padding: '0.4rem 0.5rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.25rem',
        boxShadow: '0 10px 30px rgba(79, 70, 229, 0.08)',
        pointerEvents: 'auto',
        maxWidth: '100%',
        overflowX: 'auto'
      }}>
        {/* Alerts Link */}
        <NavLink to="/match-results" style={linkStyle}>
          <Bell size={15} />
          <span>Alerts</span>
          {matchCount > 0 && (
            <span style={{
              marginLeft: '0.25rem',
              background: 'var(--danger)',
              color: '#ffffff',
              fontSize: '0.65rem',
              fontWeight: 700,
              borderRadius: '9999px',
              padding: '0.1rem 0.35rem',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              lineHeight: 1
            }}>
              {matchCount}
            </span>
          )}
        </NavLink>

        <div style={{ width: '1px', height: '16px', background: 'var(--border-color)', margin: '0 0.25rem' }} />

        {/* QR Scanner Link */}
        <NavLink to="/qr-scanner" style={linkStyle}>
          <Scan size={15} />
          <span>Scanner</span>
        </NavLink>

        <div style={{ width: '1px', height: '16px', background: 'var(--border-color)', margin: '0 0.25rem' }} />

        {/* Reports Link */}
        <NavLink to="/reports" style={linkStyle}>
          <BarChart3 size={15} />
          <span>Reports</span>
        </NavLink>

        {user.role === 'admin' && (
          <>
            <div style={{ width: '1px', height: '16px', background: 'var(--border-color)', margin: '0 0.25rem' }} />
            {/* Manage Access Link */}
            <NavLink to="/users" style={linkStyle}>
              <ShieldCheck size={15} />
              <span>Access</span>
            </NavLink>
          </>
        )}
      </div>
    </div>
  );
};

export default FloatingToolbar;
