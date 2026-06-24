import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import {
  Home,
  Users,
  Calendar,
  Folder,
  BarChart3,
  Settings,
  ShieldAlert,
  LogOut
} from 'lucide-react';

const Sidebar = () => {
  const { user, logout, badgeCounts } = useAuth();
  const { activeCasesCount, matchCount } = badgeCounts;
  const navigate = useNavigate();
  
  // Stats counts
  const [avatarError, setAvatarError] = useState(false);

  if (!user) return null;

  const isOfficerOrAdmin = user.role === 'officer' || user.role === 'admin';

  const handleLogoutClick = (e) => {
    e.preventDefault();
    logout();
    navigate('/login');
  };

  // Nav link active / inactive classes helper for primary navigation
  const linkClass = ({ isActive }) =>
    `flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-all duration-150 no-underline font-body font-semibold ${isActive
      ? 'bg-slate-800 text-white'
      : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'
    }`;

  // Nav link helper for operations (no icons, indented text)
  const operationsLinkClass = ({ isActive }) =>
    `block py-1.5 px-3 pl-[42px] rounded-lg text-sm transition-all duration-150 no-underline font-body font-semibold ${isActive
      ? 'text-white bg-slate-800/30'
      : 'text-slate-400 hover:text-white hover:bg-slate-800/10'
    }`;

  return (
    <aside className="hidden lg:flex fixed inset-y-0 left-0 z-50 w-64 flex-col bg-[#111827] border-r border-slate-800">

      {/* Scrollable interior wrapper */}
      <div className="flex grow flex-col gap-y-5 overflow-y-auto px-6 pb-4 pt-6 text-white">

        {/* Brand/Header */}
        <div className="px-3 py-2 flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg border-2 border-white flex items-center justify-center font-bold font-headline text-lg text-white">
            P
          </div>
          <span className="font-headline font-bold text-xl tracking-wide text-white">POLICE</span>
        </div>

        {/* Navigation Section */}
        <nav className="flex flex-1 flex-col">
          <ul role="list" className="flex flex-1 flex-col gap-y-7 list-none p-0 m-0">

            {/* Primary Navigation Links */}
            <li>
              <ul className="space-y-1 list-none p-0 m-0">
                {/* Dashboard */}
                <li>
                  <NavLink to="/" end className={linkClass}>
                    <div className="flex items-center gap-3">
                      <Home size={18} className="shrink-0" />
                      <span>Dashboard</span>
                    </div>
                  </NavLink>
                </li>

                {/* Suspects - Staff only */}
                {isOfficerOrAdmin && (
                  <li>
                    <NavLink to="/criminals" className={linkClass}>
                      <div className="flex items-center gap-3">
                        <Users size={18} className="shrink-0" />
                        <span>Suspects</span>
                      </div>
                    </NavLink>
                  </li>
                )}

                {/* Cases - Show badge if unresolved cases exist */}
                <li>
                  <NavLink to="/complaints" className={linkClass}>
                    <div className="flex items-center gap-3">
                      <Calendar size={18} className="shrink-0" />
                      <span>Cases</span>
                    </div>
                    {activeCasesCount > 0 && (
                      <span className="bg-slate-800 text-slate-400 text-[10px] font-bold px-2 py-0.5 rounded-full border border-slate-700/50">
                        {activeCasesCount}
                      </span>
                    )}
                  </NavLink>
                </li>

                {/* Evidence Locker - Staff only */}
                {isOfficerOrAdmin && (
                  <li>
                    <NavLink to="/stolen-items" className={linkClass}>
                      <div className="flex items-center gap-3">
                        <Folder size={18} className="shrink-0" />
                        <span>Stolen Items</span>
                      </div>
                    </NavLink>
                  </li>
                )}

                {/* Match Alarms - Staff only */}
                {isOfficerOrAdmin && (
                  <li>
                    <NavLink to="/match-results" className={linkClass}>
                      <div className="flex items-center gap-3">
                        <BarChart3 size={18} className="shrink-0" />
                        <span>Match Alarms</span>
                      </div>
                      {matchCount > 0 && (
                        <span className="bg-red-500/10 text-red-400 text-[10px] font-bold px-2 py-0.5 rounded-full border border-red-500/20">
                          {matchCount}
                        </span>
                      )}
                    </NavLink>
                  </li>
                )}

                {/* User Access - Admin only */}
                {user.role === 'admin' && (
                  <li>
                    <NavLink to="/users" className={linkClass}>
                      <div className="flex items-center gap-3">
                        <ShieldAlert size={18} className="shrink-0" />
                        <span>User Access</span>
                      </div>
                    </NavLink>
                  </li>
                )}
              </ul>
            </li>

            {/* Operations Section */}
            <li>
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 px-3 mb-2">
                Operations
              </div>
              <ul className="space-y-1 list-none p-0 m-0">
                {/* QR Scanner - Staff only */}
                {isOfficerOrAdmin && (
                  <li>
                    <NavLink to="/qr-scanner" className={operationsLinkClass}>
                      QR Scanner
                    </NavLink>
                  </li>
                )}

                {/* Analytical Reports - Staff only */}
                {isOfficerOrAdmin && (
                  <li>
                    <NavLink to="/reports" className={operationsLinkClass}>
                      Analytical Reports
                    </NavLink>
                  </li>
                )}
              </ul>
            </li>

            {/* Bottom Profile Footer Section */}
            <li className="mt-auto pt-4 border-t border-slate-800">
              <div className="flex items-center">
                <div className="flex items-center gap-3.5 min-w-0">
                  {/* Round Avatar Image / Initial Fallback */}
                  {!avatarError ? (
                    <img
                      src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
                      onError={() => setAvatarError(true)}
                      className="w-10 h-10 rounded-full bg-slate-800 object-cover shrink-0"
                      alt={user.username}
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-sm font-bold shrink-0 text-slate-300">
                      {user.username ? user.username.slice(0, 2).toUpperCase() : 'US'}
                    </div>
                  )}
                  <div className="flex flex-col min-w-0">
                    <span className="text-sm font-extrabold truncate text-white leading-tight">
                      {user.username}
                    </span>
                    <a
                      href="#logout"
                      onClick={handleLogoutClick}
                      className="px-2.5 py-1 bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white border border-red-500/20 rounded-md text-[10px] font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer flex items-center gap-1.5 mt-2"
                    >
                      <LogOut size={11} className="shrink-0" />
                      <span>Sign Out</span>
                    </a>
                  </div>
                </div>
              </div>
            </li>

          </ul>
        </nav>

      </div>
    </aside>
  );
};

export default Sidebar;
