import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Scan } from 'lucide-react';

const FloatingToolbar = () => {
  const { user } = useAuth();

  if (!user) return null;

  const linkClass = ({ isActive }) =>
    `flex items-center gap-2 px-5 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all duration-200 no-underline relative active:scale-95 ` +
    (isActive
      ? 'bg-gradient-to-r from-primary to-primary-light text-white shadow-md shadow-indigo-500/15'
      : 'bg-transparent text-slate-400 hover:text-white hover:bg-white/5');

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 pointer-events-none w-full flex justify-center px-4">
      <div className="bg-slate-950/85 backdrop-blur-lg border border-white/5 rounded-full p-1.5 flex items-center gap-1 shadow-2xl pointer-events-auto max-w-full overflow-x-auto">
        {/* QR Scanner Link */}
        <NavLink to="/qr-scanner" className={linkClass}>
          <Scan size={15} />
          <span>Scanner</span>
        </NavLink>
      </div>
    </div>
  );
};

export default FloatingToolbar;
