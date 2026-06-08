import React, { useEffect, useState, useRef } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Shield, LogOut, Search, Bell, ChevronDown, Plus } from 'lucide-react';
import axios from 'axios';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeCasesCount, setActiveCasesCount] = useState(0);
  const [matchCount, setMatchCount] = useState(0);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const fetchDataCounts = async () => {
      if (user) {
        try {
          // Fetch Complaints count
          const complaintsRes = await axios.get('/api/complaints');
          if (complaintsRes.data.success) {
            const unresolved = complaintsRes.data.data.filter(
              c => c.status === 'pending' || c.status === 'investigating'
            ).length;
            setActiveCasesCount(unresolved);
          }

          // Fetch Match Alerts count
          const matchesRes = await axios.get('/api/matches?status=pending');
          if (matchesRes.data.success) {
            setMatchCount(matchesRes.data.data.length);
          }
        } catch (err) {
          console.error('Failed to load navbar statistics:', err.message);
        }
      }
    };

    fetchDataCounts();
    const interval = setInterval(fetchDataCounts, 30000); // Poll every 30s
    return () => clearInterval(interval);
  }, [user]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!user) return null;

  const handleLogoutClick = () => {
    logout();
    navigate('/login');
  };

  const navLinkStyle = ({ isActive }) => ({
    background: isActive ? '#0fa968' : '#f3f4f6',
    color: isActive ? '#ffffff' : '#374151',
    padding: '0.5rem 1.25rem',
    borderRadius: '9999px',
    fontWeight: 600,
    fontSize: '0.85rem',
    textDecoration: 'none',
    transition: 'all 0.2s ease',
    display: 'flex',
    alignItems: 'center',
    gap: '0.35rem'
  });

  const userInitials = user.username ? user.username.slice(0, 2).toUpperCase() : 'US';

  return (
    <header style={{
      height: '80px',
      background: 'rgba(255, 255, 255, 0.75)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      color: '#1b1c1d',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 2.5rem',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      borderBottom: '1px solid rgba(229, 231, 235, 0.5)',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.01), 0 2px 4px -1px rgba(0, 0, 0, 0.01)'
    }}>
      {/* Brand Logo & Title (Left) */}
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', textDecoration: 'none' }}>
          <div style={{
            background: '#0fa968',
            width: '36px',
            height: '36px',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Shield size={18} color="#ffffff" />
          </div>
          <h1 style={{
            fontSize: '1.25rem',
            fontWeight: 800,
            color: '#1b1c1d',
            letterSpacing: '-0.02em',
            fontFamily: '"Outfit", "Inter", sans-serif',
            margin: 0
          }}>Shield</h1>
        </Link>
      </div>

      {/* Navigation Pills (Center) */}
      <nav style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
        <NavLink to="/" style={navLinkStyle}>
          <span>Dashboard</span>
        </NavLink>

        <NavLink to="/complaints" style={navLinkStyle}>
          <span>Cases</span>
          {activeCasesCount > 0 && (
            <span style={{
              background: '#ef4444',
              color: '#ffffff',
              fontSize: '0.65rem',
              fontWeight: 700,
              borderRadius: '9999px',
              padding: '0.05rem 0.35rem',
              marginLeft: '0.15rem'
            }}>
              {activeCasesCount}
            </span>
          )}
        </NavLink>

        <NavLink to="/criminals" style={navLinkStyle}>
          <span>Personnel</span>
        </NavLink>

        <NavLink to="/stolen-items" style={navLinkStyle}>
          <span>Locker</span>
        </NavLink>
      </nav>

      {/* Action Buttons & Profile (Right) */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        {/* Quick Action (Solid Green Circle) */}
        <Link 
          to="/complaints/add" 
          style={{
            background: '#0fa968',
            width: '38px',
            height: '38px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s',
            textDecoration: 'none'
          }}
          title="File New Theft Report"
          onMouseEnter={(e) => e.currentTarget.style.background = '#0c8f56'}
          onMouseLeave={(e) => e.currentTarget.style.background = '#0fa968'}
        >
          <Plus size={18} color="#ffffff" />
        </Link>

        {/* Search Circular Button */}
        <button style={{
          background: 'rgba(255, 255, 255, 0.4)',
          border: '1px solid rgba(229, 231, 235, 0.6)',
          width: '38px',
          height: '38px',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          color: '#4b5563',
          transition: 'all 0.2s'
        }}
        onMouseEnter={(e) => e.currentTarget.style.background = '#f9fafb'}
        onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.4)'}
        onClick={() => navigate('/')}
        title="Search Console"
        >
          <Search size={16} />
        </button>

        {/* Alerts Notification Button */}
        <Link 
          to="/match-results" 
          style={{
            background: 'rgba(255, 255, 255, 0.4)',
            border: '1px solid rgba(229, 231, 235, 0.6)',
            width: '38px',
            height: '38px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: '#4b5563',
            position: 'relative',
            textDecoration: 'none',
            transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = '#f9fafb'}
          onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.4)'}
          title="Match Alerts"
        >
          <Bell size={16} />
          {matchCount > 0 && (
            <span style={{
              position: 'absolute',
              top: '-3px',
              right: '-3px',
              background: '#ef4444',
              color: '#ffffff',
              fontSize: '0.6rem',
              fontWeight: 700,
              width: '16px',
              height: '16px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '2px solid #ffffff'
            }}>
              {matchCount}
            </span>
          )}
        </Link>

        {/* Divider */}
        <div style={{ width: '1px', height: '24px', background: '#e5e7eb', margin: '0 0.25rem' }} />

        {/* Profile Dropdown */}
        <div 
          ref={dropdownRef} 
          style={{ position: 'relative' }}
        >
          <div 
            onClick={() => setDropdownOpen(!dropdownOpen)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              cursor: 'pointer',
              padding: '0.25rem 0.5rem',
              borderRadius: '8px',
              userSelect: 'none',
              transition: 'background 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = '#f9fafb'}
            onMouseLeave={(e) => !dropdownOpen && (e.currentTarget.style.background = 'transparent')}
          >
            {/* Avatar image / initials (yellow background as in image) */}
            <div style={{
              width: '38px',
              height: '38px',
              borderRadius: '50%',
              background: '#fef3c7',
              color: '#d97706',
              border: '1px solid #fcd34d',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.8rem',
              fontWeight: 700
            }}>
              {userInitials}
            </div>

            {/* Name and Role */}
            <div style={{ textAlign: 'left', display: 'flex', flexDirection: 'column' }}>
              <span style={{
                fontSize: '0.8rem',
                fontWeight: 700,
                color: '#1b1c1d',
                lineHeight: 1.2
              }}>{user.username}</span>
              <span style={{
                fontSize: '0.65rem',
                color: '#6b7280',
                lineHeight: 1.2,
                textTransform: 'capitalize'
              }}>{user.role}</span>
            </div>

            {/* Down Chevron */}
            <ChevronDown size={14} color="#6b7280" style={{
              transform: dropdownOpen ? 'rotate(180deg)' : 'none',
              transition: 'transform 0.2s'
            }} />
          </div>

          {/* Dropdown Menu */}
          {dropdownOpen && (
            <div style={{
              position: 'absolute',
              top: '100%',
              right: 0,
              marginTop: '0.5rem',
              background: '#ffffff',
              border: '1px solid #e5e7eb',
              borderRadius: '12px',
              boxShadow: '0 10px 25px rgba(0,0,0,0.08)',
              width: '150px',
              padding: '0.35rem',
              display: 'flex',
              flexDirection: 'column',
              zIndex: 1010
            }}>
              <button
                onClick={handleLogoutClick}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.6rem 0.75rem',
                  background: 'none',
                  border: 'none',
                  borderRadius: '8px',
                  color: '#ef4444',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  textAlign: 'left',
                  width: '100%',
                  transition: 'background 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = '#fef2f2'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
              >
                <LogOut size={14} />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
