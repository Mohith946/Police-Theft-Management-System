import React, { useEffect, useState, useRef } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Shield, LogOut, Search, Bell, ChevronDown, Plus, Menu, X, 
  Home, Users, Calendar, Folder, BarChart3, ShieldAlert 
} from 'lucide-react';
import axios from 'axios';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeCasesCount, setActiveCasesCount] = useState(0);
  const [matchCount, setMatchCount] = useState(0);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
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

  // Prevent body scrolling when mobile drawer is open
  useEffect(() => {
    if (drawerOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [drawerOpen]);

  if (!user) return null;

  const isOfficerOrAdmin = user.role === 'officer' || user.role === 'admin';

  const handleLogoutClick = () => {
    setDrawerOpen(false);
    logout();
    navigate('/login');
  };

  const navLinkClass = ({ isActive }) =>
    `px-5 py-2 rounded-full font-semibold text-xs transition-all duration-200 flex items-center gap-1.5 no-underline ` +
    (isActive
      ? 'bg-gradient-to-r from-primary to-primary-light text-white shadow-md shadow-indigo-500/15'
      : 'bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white');

  const drawerLinkClass = ({ isActive }) =>
    `flex items-center justify-between px-3 py-2.5 rounded-lg text-sm transition-all duration-150 no-underline font-body font-semibold ${
      isActive 
        ? 'bg-slate-800 text-white' 
        : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'
    }`;

  const drawerOperationsLinkClass = ({ isActive }) =>
    `block py-2 px-3 pl-8 rounded-lg text-sm transition-all duration-150 no-underline font-body font-semibold ${
      isActive 
        ? 'text-white bg-slate-800/30' 
        : 'text-slate-400 hover:text-white hover:bg-slate-800/10'
    }`;

  const userInitials = user.username ? user.username.slice(0, 2).toUpperCase() : 'US';

  return (
    <header className="h-20 bg-white border-b border-[#d8d0c8] sticky top-0 z-50 px-6 md:px-10 flex items-center justify-between shadow-xs">
      
      {/* Left Area: Hamburger and Brand Logo */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => setDrawerOpen(true)}
          className="lg:hidden p-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-700 hover:bg-slate-100 cursor-pointer transition-all active:scale-95 flex items-center justify-center"
          title="Open Navigation Menu"
        >
          <Menu size={20} />
        </button>

        <Link to="/" className="flex items-center gap-2.5 no-underline">
          <div className="bg-gradient-to-br from-primary to-primary-light w-9 h-9 rounded-lg flex items-center justify-center">
            <Shield size={18} className="text-white" />
          </div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight font-heading m-0 hidden sm:block">
            SHIELD
          </h1>
        </Link>
      </div>

      {/* Center Area: Tablet Horizontal Navigation Pills */}
      <nav className="hidden md:flex lg:hidden items-center gap-2">
        <NavLink to="/" end className={navLinkClass}>
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

        {isOfficerOrAdmin && (
          <>
            <NavLink to="/criminals" className={navLinkClass}>
              <span>Suspects</span>
            </NavLink>
            <NavLink to="/stolen-items" className={navLinkClass}>
              <span>Locker</span>
            </NavLink>
          </>
        )}
      </nav>

      {/* Right Area: Action Buttons & Profile */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Quick Action Button */}
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
            <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center border-2 border-[#faf5ee]">
              {matchCount}
            </span>
          )}
        </Link>

        {/* Divider */}
        <div className="w-px h-6 bg-slate-200 mx-1 hidden sm:block" />

        {/* Profile Dropdown */}
        <div ref={dropdownRef} className="relative hidden sm:block">
          <div 
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2 cursor-pointer p-1 rounded-lg select-none hover:bg-slate-50 transition-all duration-200"
          >
            {/* Avatar Initials */}
            <div className="w-9.5 h-9.5 rounded-full bg-primary/10 text-primary-light border border-primary/20 flex items-center justify-center text-xs font-bold">
              {userInitials}
            </div>

            {/* Name and Role */}
            <div className="text-left flex flex-col">
              <span className="text-xs font-bold text-slate-800 leading-tight">
                {user.username}
              </span>
              <span className="text-[10px] text-slate-500 capitalize leading-tight">
                {user.role}
              </span>
            </div>

            {/* Chevron */}
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
            <div className="absolute top-full right-0 mt-2 bg-white border border-[#d8d0c8] rounded-xl shadow-lg w-36 p-1 flex flex-col z-[1010]">
              <button
                onClick={handleLogoutClick}
                className="flex items-center gap-2 p-2.5 bg-transparent border-none rounded-lg text-red-500 text-xs font-semibold cursor-pointer text-left w-full hover:bg-red-50/50 transition-all duration-200"
              >
                <LogOut size={14} />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Slide-over Mobile Navigation Drawer Drawer */}
      {drawerOpen && (
        <div className="fixed inset-0 z-[1000] lg:hidden">
          {/* Backdrop Blur Overlay */}
          <div 
            onClick={() => setDrawerOpen(false)}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity duration-300"
          />
          
          {/* Drawer Sidebar Panel */}
          <div className="fixed inset-y-0 left-0 w-64 bg-[#111827] flex flex-col p-6 text-white shadow-2xl transition-transform duration-300 z-50 mobile-drawer-panel">
            {/* Drawer Header */}
            <div className="flex items-center justify-between pb-6 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg border-2 border-white flex items-center justify-center font-bold font-heading text-lg text-white">
                  P
                </div>
                <span className="font-heading font-bold text-lg tracking-wide text-white">POLICE</span>
              </div>
              <button
                onClick={() => setDrawerOpen(false)}
                className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white cursor-pointer transition-all border-none flex items-center justify-center"
              >
                <X size={18} />
              </button>
            </div>

            {/* Drawer Body Nav Links */}
            <nav className="flex flex-1 flex-col py-6 overflow-y-auto drawer-nav">
              <ul className="flex flex-col gap-6 list-none p-0 m-0">
                <li>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2 px-3">Navigation</div>
                  <ul className="space-y-1 list-none p-0 m-0">
                    <li>
                      <NavLink 
                        to="/" 
                        end 
                        onClick={() => setDrawerOpen(false)}
                        className={drawerLinkClass}
                      >
                        <div className="flex items-center gap-3">
                          <Home size={16} />
                          <span>Dashboard</span>
                        </div>
                      </NavLink>
                    </li>
                    {isOfficerOrAdmin && (
                      <li>
                        <NavLink 
                          to="/criminals" 
                          onClick={() => setDrawerOpen(false)}
                          className={drawerLinkClass}
                        >
                          <div className="flex items-center gap-3">
                            <Users size={16} />
                            <span>Suspects</span>
                          </div>
                        </NavLink>
                      </li>
                    )}
                    <li>
                      <NavLink 
                        to="/complaints" 
                        onClick={() => setDrawerOpen(false)}
                        className={drawerLinkClass}
                      >
                        <div className="flex items-center gap-3">
                          <Calendar size={16} />
                          <span>Cases</span>
                        </div>
                        {activeCasesCount > 0 && (
                          <span className="bg-slate-800 text-slate-400 text-[10px] font-bold px-2 py-0.5 rounded-full border border-slate-700/50">
                            {activeCasesCount}
                          </span>
                        )}
                      </NavLink>
                    </li>
                    {isOfficerOrAdmin && (
                      <li>
                        <NavLink 
                          to="/stolen-items" 
                          onClick={() => setDrawerOpen(false)}
                          className={drawerLinkClass}
                        >
                          <div className="flex items-center gap-3">
                            <Folder size={16} />
                            <span>Evidence Locker</span>
                          </div>
                        </NavLink>
                      </li>
                    )}
                    {isOfficerOrAdmin && (
                      <li>
                        <NavLink 
                          to="/match-results" 
                          onClick={() => setDrawerOpen(false)}
                          className={drawerLinkClass}
                        >
                          <div className="flex items-center gap-3">
                            <BarChart3 size={16} />
                            <span>Match Alarms</span>
                          </div>
                          {matchCount > 0 && (
                            <span className="bg-red-500/15 text-red-400 text-[10px] font-bold px-2 py-0.5 rounded-full border border-red-500/20">
                              {matchCount}
                            </span>
                          )}
                        </NavLink>
                      </li>
                    )}
                    {user.role === 'admin' && (
                      <li>
                        <NavLink 
                          to="/users" 
                          onClick={() => setDrawerOpen(false)}
                          className={drawerLinkClass}
                        >
                          <div className="flex items-center gap-3">
                            <ShieldAlert size={16} />
                            <span>User Access</span>
                          </div>
                        </NavLink>
                      </li>
                    )}
                  </ul>
                </li>

                {isOfficerOrAdmin && (
                  <li>
                    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2 px-3">Operations</div>
                    <ul className="space-y-1 list-none p-0 m-0">
                      <li>
                        <NavLink 
                          to="/qr-scanner" 
                          onClick={() => setDrawerOpen(false)}
                          className={drawerOperationsLinkClass}
                        >
                          QR Scanner
                        </NavLink>
                      </li>
                      <li>
                        <NavLink 
                          to="/reports" 
                          onClick={() => setDrawerOpen(false)}
                          className={drawerOperationsLinkClass}
                        >
                          Analytical Reports
                        </NavLink>
                      </li>
                    </ul>
                  </li>
                )}

                {/* Profile section in drawer */}
                <li className="mt-auto pt-6 border-t border-slate-800">
                  <div className="flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-sm font-bold text-slate-300">
                      {userInitials}
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="text-sm font-extrabold truncate text-white leading-tight">
                        {user.username}
                      </span>
                      <span className="text-[10px] text-slate-400 capitalize leading-tight mt-0.5">
                        {user.role}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={handleLogoutClick}
                    className="w-full mt-5 flex items-center justify-center gap-2 p-2.5 bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white border border-red-500/20 rounded-lg text-xs font-bold uppercase tracking-wider cursor-pointer transition-all duration-200"
                  >
                    <LogOut size={13} />
                    <span>Sign Out</span>
                  </button>
                </li>
              </ul>
            </nav>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
