import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  ShieldAlert, 
  Users, 
  FileText, 
  Package, 
  Scan, 
  Bell, 
  BarChart3, 
  LogOut,
  User
} from 'lucide-react';

const Sidebar = () => {
  const { user, logout } = useAuth();
  
  if (!user) return null;

  const isOfficerOrAdmin = user.role === 'officer' || user.role === 'admin';

  const getNavLinkStyle = ({ isActive }) => ({
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '0.75rem 1rem',
    borderRadius: 'var(--radius-sm)',
    color: isActive ? '#ffffff' : '#8192a7',
    background: isActive ? '#1a2b3c' : 'transparent',
    border: isActive ? '1px solid #74777d' : '1px solid transparent',
    textDecoration: 'none',
    fontSize: '0.9rem',
    fontWeight: isActive ? 600 : 500,
    transition: 'all 0.2s ease'
  });

  return (
    <aside style={{
      width: '260px',
      height: '100vh',
      position: 'fixed',
      top: 0,
      left: 0,
      background: 'var(--primary)', // Civic Sentinel Primary Deep Navy
      borderRight: '1px solid var(--border-color)',
      display: 'flex',
      flexDirection: 'column',
      padding: '2rem 1.5rem',
      zIndex: 100
    }}>
      {/* Brand logo */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        marginBottom: '2.5rem',
        paddingLeft: '0.5rem'
      }}>
        <div style={{
          background: '#3b82f6', // Safety Blue
          width: '38px',
          height: '38px',
          borderRadius: 'var(--radius-sm)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 10px rgba(59, 130, 246, 0.2)'
        }}>
          <ShieldAlert size={20} color="#ffffff" />
        </div>
        <div>
          <h2 style={{
            fontSize: '1.15rem',
            fontWeight: 800,
            fontFamily: 'var(--font-heading)',
            letterSpacing: '-0.02em',
            color: '#ffffff'
          }}>SHIELD</h2>
          <p style={{
            fontSize: '0.65rem',
            color: '#8192a7',
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            fontWeight: 600
          }}>Theft Mgmt System</p>
        </div>
      </div>

      {/* Navigation links */}
      <nav style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '0.35rem',
        flex: 1
      }}>
        <NavLink 
          to="/" 
          style={getNavLinkStyle}
        >
          <BarChart3 size={18} />
          <span>Dashboard</span>
        </NavLink>

        <NavLink 
          to="/complaints" 
          style={getNavLinkStyle}
        >
          <FileText size={18} />
          <span>Complaints</span>
        </NavLink>

        {isOfficerOrAdmin && (
          <>
            <NavLink 
              to="/criminals" 
              style={getNavLinkStyle}
            >
              <Users size={18} />
              <span>Criminal Registry</span>
            </NavLink>

            <NavLink 
              to="/stolen-items" 
              style={getNavLinkStyle}
            >
              <Package size={18} />
              <span>Stolen Items</span>
            </NavLink>

            <NavLink 
              to="/qr-scanner" 
              style={getNavLinkStyle}
            >
              <Scan size={18} />
              <span>QR Recovery Scanner</span>
            </NavLink>

            <NavLink 
              to="/match-results" 
              style={getNavLinkStyle}
            >
              <Bell size={18} />
              <span>Match Alerts</span>
            </NavLink>
            
            <NavLink 
              to="/reports" 
              style={getNavLinkStyle}
            >
              <BarChart3 size={18} />
              <span>Analytical Reports</span>
            </NavLink>
          </>
        )}

        {user.role === 'admin' && (
          <NavLink 
            to="/users" 
            style={getNavLinkStyle}
          >
            <Users size={18} />
            <span>Manage Access</span>
          </NavLink>
        )}
      </nav>

      {/* User profile footer */}
      <div style={{
        borderTop: '1px solid rgba(255, 255, 255, 0.15)',
        paddingTop: '1.5rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem'
        }}>
          <div style={{
            background: 'rgba(255, 255, 255, 0.08)',
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '1px solid rgba(255, 255, 255, 0.15)'
          }}>
            <User size={18} color="#8192a7" />
          </div>
          <div style={{ overflow: 'hidden' }}>
            <h4 style={{
              fontSize: '0.85rem',
              color: '#ffffff',
              whiteSpace: 'nowrap',
              textOverflow: 'ellipsis',
              overflow: 'hidden'
            }}>{user.username}</h4>
            <p style={{
              fontSize: '0.7rem',
              color: '#8192a7',
              textTransform: 'uppercase',
              fontWeight: 600,
              letterSpacing: '0.05em'
            }}>
              {user.role} {user.badgeNumber ? `(${user.badgeNumber})` : ''}
            </p>
          </div>
        </div>

        <button 
          onClick={logout}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            width: '100%',
            padding: '0.75rem 1rem',
            background: 'rgba(186, 26, 26, 0.15)',
            border: '1px solid rgba(186, 26, 26, 0.25)',
            borderRadius: 'var(--radius-sm)',
            color: '#ffdad6',
            cursor: 'pointer',
            fontSize: '0.9rem',
            fontWeight: 600,
            transition: 'all 0.2s ease',
            justifyContent: 'center'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(186, 26, 26, 0.25)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(186, 26, 26, 0.15)';
          }}
        >
          <LogOut size={16} />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
