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
        const isStaff = user.role === 'officer' || user.role === 'admin';
        
        try {
          // Fetch Complaints count
          const complaintsRes = await axios.get('/api/complaints');
          if (complaintsRes.data.success) {
            const unresolved = complaintsRes.data.data.filter(
              c => c.status === 'pending' || c.status === 'investigating'
            ).length;
            setActiveCasesCount(unresolved);
          }
        } catch (err) {
          console.error('Failed to load navbar complaints count:', err.message);
        }

        if (isStaff) {
          try {
            // Fetch Match Alerts count
            const matchesRes = await axios.get('/api/matches?status=pending');
            if (matchesRes.data.success) {
              setMatchCount(matchesRes.data.data.length);
            }
          } catch (err) {
            console.error('Failed to load navbar match alerts count:', err.message);
          }
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

  const navLinkClass = ({ isActive }) =>
    `px-5 py-2 rounded-full font-semibold text-xs transition-all duration-200 flex items-center gap-1.5 no-underline ` +
    (isActive
      ? 'bg-gradient-to-r from-primary to-primary-light text-white shadow-md shadow-indigo-500/15'
      : 'bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white');

  const userInitials = user.username ? user.username.slice(0, 2).toUpperCase() : 'US';

  return (
    <header className="h-20 bg-slate-950/30 backdrop-blur-lg sticky top-0 z-50 px-10 flex items-center justify-between border-b border-white/5 shadow-lg">
      
      {/* Brand Logo & Title (Left) */}
      <div className="flex items-center">
        <Link to="/" className="flex items-center gap-2.5 no-underline">
          <div className="bg-gradient-to-br from-primary to-primary-light w-9 h-9 rounded-lg flex items-center justify-center">
            <Shield size={18} className="text-white" />
          </div>
          <h1 className="text-xl font-extrabold text-white tracking-tight font-heading m-0">
            SHIELD
          </h1>
        </Link>
      </div>

      {/* Navigation Pills (Center) - Hidden on desktop since sidebar is active */}
      <nav className="md:hidden flex items-center gap-2.5">
        <NavLink to="/" className={navLinkClass}>
          <span>Dashboard</span>
        </NavLink>

        <NavLink to="/complaints" className={navLinkClass}>
          <span>Cases</span>
          {activeCasesCount > 0 && (
            <span className="bg-red-500 text-white text-[10px] font-bold rounded-full px-1.5 py-0.5 ml-0.5">
              {activeCasesCount}
            </span>
          )}
        </NavLink>

        <NavLink to="/criminals" className={navLinkClass}>
          <span>Personnel</span>
        </NavLink>

        <NavLink to="/stolen-items" className={navLinkClass}>
          <span>Locker</span>
        </NavLink>
      </nav>

      {/* Action Buttons & Profile (Right) */}
      <div className="flex items-center gap-3">
        {/* Quick Action (Solid Indigo Circle) */}
        <Link 
          to="/complaints/add" 
          className="bg-gradient-to-r from-primary to-primary-light hover:brightness-110 hover:shadow-indigo-500/20 w-9.5 h-9.5 rounded-full flex items-center justify-center transition-all duration-200 no-underline shadow-sm active:scale-95"
          title="File New Theft Report"
        >
          <Plus size={18} className="text-white" />
        </Link>

        {/* Search Circular Button */}
        <button 
          className="bg-white/5 hover:bg-white/10 border border-white/5 w-9.5 h-9.5 rounded-full flex items-center justify-center cursor-pointer text-slate-300 transition-all duration-200 active:scale-95"
          onClick={() => navigate('/')}
          title="Search Console"
        >
          <Search size={16} />
        </button>

        {/* Alerts Notification Button */}
        <Link 
          to="/match-results" 
          className="bg-white/5 hover:bg-white/10 border border-white/5 w-9.5 h-9.5 rounded-full flex items-center justify-center cursor-pointer text-slate-300 relative no-underline transition-all duration-200 active:scale-95"
          title="Match Alerts"
        >
          <Bell size={16} />
          {matchCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center border-2 border-[#070a13]">
              {matchCount}
            </span>
          )}
        </Link>

        {/* Divider */}
        <div className="w-px h-6 bg-white/10 mx-1" />

        {/* Profile Dropdown */}
        <div ref={dropdownRef} className="relative">
          <div 
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2 cursor-pointer p-1 rounded-lg select-none hover:bg-white/5 transition-all duration-200"
          >
            {/* Avatar image / initials */}
            <div className="w-9.5 h-9.5 rounded-full bg-primary/10 text-primary-light border border-primary/20 flex items-center justify-center text-xs font-bold">
              {userInitials}
            </div>

            {/* Name and Role */}
            <div className="text-left flex flex-col">
              <span className="text-xs font-bold text-white leading-tight">
                {user.username}
              </span>
              <span className="text-[10px] text-slate-400 capitalize leading-tight">
                {user.role}
              </span>
            </div>

            {/* Down Chevron */}
            <ChevronDown 
              size={14} 
              className="text-slate-400 transition-transform duration-200"
              style={{
                transform: dropdownOpen ? 'rotate(180deg)' : 'none'
              }}
            />
          </div>

          {/* Dropdown Menu */}
          {dropdownOpen && (
            <div className="absolute top-full right-0 mt-2 bg-slate-900/90 border border-white/5 rounded-xl shadow-xl w-36 p-1 flex flex-col z-[1010] backdrop-blur-md">
              <button
                onClick={handleLogoutClick}
                className="flex items-center gap-2 p-2.5 bg-transparent border-none rounded-lg text-red-400 text-xs font-semibold cursor-pointer text-left w-full hover:bg-red-500/10 transition-all duration-200"
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
