import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Shield, Mail, Lock, Info, Key } from 'lucide-react';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [accessCode, setAccessCode] = useState('');

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setSuccessMsg('');
    setLoading(true);

    const res = await login(email, password, accessCode);
    if (res.success) {
      navigate('/');
    } else {
      setMessage(res.message);
    }
    setLoading(false);
  };

  const handleFillDemo = (demoType) => {
    if (demoType === 'officer') {
      setEmail('officer1@police.gov');
      setPassword('password123');
      setAccessCode('SHIELD-SECURE-2026');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-8 bg-slate-50 relative overflow-hidden">
      {/* Decorative background grid */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.015)_1px,transparent_1px)] bg-[size:40px_40px] z-0 pointer-events-none"></div>

      <div className="relative z-10 w-full max-w-md">
        {/* Logo and Header */}
        <div className="text-center mb-8">
          <div className="bg-gradient-to-br from-primary to-indigo-600 w-14 h-14 rounded-2xl inline-flex items-center justify-center shadow-lg shadow-indigo-500/15 mb-4">
            <Shield size={28} className="text-white" />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight font-heading m-0">
            SHIELD PROTOCOL
          </h1>
          <p className="text-slate-500 text-xs mt-1">
            National Police Theft Management & Recovery Console
          </p>
        </div>

        {/* Login/Register Card */}
        <div className="glass-panel p-8 rounded-3xl">
          <h2 className="text-lg font-bold text-slate-900 text-center font-heading mb-6">
            Officer & Admin Protocol Login
          </h2>

          {message && (
            <div className="bg-red-50/50 border border-red-200/50 rounded-lg p-3 text-red-500 text-xs mb-4 text-center">
              {message}
            </div>
          )}

          {successMsg && (
            <div className="bg-emerald-50/50 border border-emerald-200/50 rounded-lg p-3 text-emerald-500 text-xs mb-4 text-center">
              {successMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div>
              <label className="form-label">Email Address</label>
              <div className="relative">
                <input
                  type="email"
                  className="form-input pl-10"
                  placeholder="name@police.gov"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              </div>
            </div>

            <div>
              <label className="form-label">Secret Password</label>
              <div className="relative">
                <input
                  type="password"
                  className="form-input pl-10"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              </div>
            </div>

            <div>
              <label className="form-label">Precinct Access Code</label>
              <div className="relative">
                <input
                  type="password"
                  className="form-input pl-10"
                  placeholder="SHIELD-SECURE-••••"
                  value={accessCode}
                  onChange={(e) => setAccessCode(e.target.value)}
                  required
                />
                <Key size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary w-full mt-2"
              disabled={loading}
            >
              <span>{loading ? 'Processing Session...' : 'Establish Connection'}</span>
            </button>
          </form>
        </div>

        {/* Demo Accounts Drawer */}
        <div className="glass-panel mt-6 p-5 rounded-2xl border-dashed border-slate-300">
          <div className="flex items-center gap-2 mb-3">
            <Info size={16} className="text-primary" />
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Demo Credentials Drawer
            </h3>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => handleFillDemo('officer')}
              className="btn btn-secondary px-3.5 py-1.5 text-xs rounded-full"
            >
              <span>Officer Log In</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
