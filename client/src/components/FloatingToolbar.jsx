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

  const linkClass = ({ isActive }) =>
    `flex items-center gap-2 px-5 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all duration-200 no-underline relative active:scale-95 ` +
    (isActive
      ? 'bg-primary text-white shadow-xs'
      : 'bg-transparent text-slate-500 hover:text-slate-900');

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 pointer-events-none w-full flex justify-center px-4">
      <div className="bg-white/85 backdrop-blur-md border border-slate-200/60 rounded-full p-1.5 flex items-center gap-1 shadow-lg shadow-indigo-500/5 pointer-events-auto max-w-full overflow-x-auto">
        
        {/* Alerts Link */}
        <NavLink to="/match-results" className={linkClass}>
          <Bell size={15} />
          <span>Alerts</span>
          {matchCount > 0 && (
            <span className="ml-1 bg-red-500 text-white text-[9px] font-extrabold rounded-full px-1.5 py-0.5 inline-flex items-center justify-center leading-none">
              {matchCount}
            </span>
          )}
        </NavLink>

        <div className="w-px h-4 bg-slate-200 mx-1" />

        {/* QR Scanner Link */}
        <NavLink to="/qr-scanner" className={linkClass}>
          <Scan size={15} />
          <span>Scanner</span>
        </NavLink>

        <div className="w-px h-4 bg-slate-200 mx-1" />

        {/* Reports Link */}
        <NavLink to="/reports" className={linkClass}>
          <BarChart3 size={15} />
          <span>Reports</span>
        </NavLink>

        {user.role === 'admin' && (
          <>
            <div className="w-px h-4 bg-slate-200 mx-1" />
            {/* Manage Access Link */}
            <NavLink to="/users" className={linkClass}>
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
