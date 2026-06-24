import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Shield, Mail, Lock, Info, ShieldAlert, User, Award } from 'lucide-react';

const Login = () => {
  const { login, googleLogin, requestAccess } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [badgeNumber, setBadgeNumber] = useState('');
  const [isRequestAccess, setIsRequestAccess] = useState(false);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Access Denial Modal States
  const [showDenialModal, setShowDenialModal] = useState(false);
  const [denialMessage, setDenialMessage] = useState('');
  const [denialStatus, setDenialStatus] = useState('');

  useEffect(() => {
    const handleGoogleCredentialResponse = async (response) => {
      setLoading(true);
      setMessage('');
      const res = await googleLogin(response.credential);
      if (res.success) {
        navigate('/');
      } else {
        if (res.status === 'pending' || res.status === 'denied') {
          setDenialStatus(res.status);
          setDenialMessage(res.message);
          setShowDenialModal(true);
        } else {
          setMessage(res.message);
        }
      }
      setLoading(false);
    };

    const initializeGoogleButton = () => {
      if (window.google) {
        window.google.accounts.id.initialize({
          client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID || "1023024125198-fv94ng719e75v08ot46rig8hkgd4tqnj.apps.googleusercontent.com",
          callback: handleGoogleCredentialResponse
        });
        window.google.accounts.id.renderButton(
          document.getElementById("googleBtnDiv"),
          { theme: "outline", size: "large", width: "100%" }
        );
      }
    };

    if (window.google) {
      initializeGoogleButton();
    } else {
      const interval = setInterval(() => {
        if (window.google) {
          initializeGoogleButton();
          clearInterval(interval);
        }
      }, 100);
      return () => clearInterval(interval);
    }
  }, [googleLogin, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setSuccessMsg('');
    setLoading(true);

    if (isRequestAccess) {
      if (!email.endsWith('@police.gov')) {
        setMessage('Registration is restricted to official @police.gov email addresses.');
        setLoading(false);
        return;
      }
      const res = await requestAccess(username, email, password, badgeNumber);
      if (res.success) {
        setSuccessMsg('Access request submitted successfully. Awaiting administrator approval.');
        setIsRequestAccess(false);
        setPassword('');
        setUsername('');
        setBadgeNumber('');
      } else {
        setMessage(res.message);
      }
      setLoading(false);
      return;
    }

    const res = await login(email, password);
    if (res.success) {
      navigate('/');
    } else {
      if (res.status === 'pending' || res.status === 'denied') {
        setDenialStatus(res.status);
        setDenialMessage(res.message);
        setShowDenialModal(true);
      } else {
        setMessage(res.message);
      }
    }
    setLoading(false);
  };

  const handleFillDemo = (demoType) => {
    if (demoType === 'officer') {
      setEmail('officer1@police.gov');
      setPassword('password123');
    } else if (demoType === 'admin') {
      setEmail('admin@police.gov');
      setPassword('password123');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-8 bg-[#070a13] relative overflow-hidden">
      {/* Decorative background grid and gradients */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:40px_40px] z-0 pointer-events-none"></div>
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-96 h-96 bg-primary-light/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="relative z-10 w-full max-w-md">
        {/* Logo and Header */}
        <div className="text-center mb-8">
          <div className="bg-gradient-to-br from-primary to-primary-light w-14 h-14 rounded-2xl inline-flex items-center justify-center shadow-lg shadow-indigo-500/15 mb-4">
            <Shield size={28} className="text-white" />
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight font-heading m-0">
            SHIELD PROTOCOL
          </h1>
          <p className="text-slate-400 text-xs mt-1 font-medium tracking-wide">
            National Police Theft Management & Recovery Console
          </p>
        </div>

        {/* Login/Register Card */}
        <div className="glass-panel p-8 rounded-3xl">
          <h2 className="text-lg font-bold text-white text-center font-heading mb-6">
            {isRequestAccess ? 'Request Console Access' : 'Officer & Admin Protocol Login'}
          </h2>

          {message && (
            <div className="bg-red-950/30 border border-red-500/20 rounded-lg p-3 text-red-400 text-xs mb-4 text-center">
              {message}
            </div>
          )}

          {successMsg && (
            <div className="bg-emerald-950/30 border border-emerald-500/20 rounded-lg p-3 text-emerald-400 text-xs mb-4 text-center">
              {successMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            {isRequestAccess && (
              <div>
                <label className="form-label">Username</label>
                <div className="relative">
                  <input
                    type="text"
                    className="form-input pl-10"
                    placeholder="officer_name"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                  />
                  <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                </div>
              </div>
            )}

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
              <label className="form-label">{isRequestAccess ? 'Choose Password' : 'Secret Password'}</label>
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

            {isRequestAccess && (
              <div>
                <label className="form-label">Badge Number (Optional)</label>
                <div className="relative">
                  <input
                    type="text"
                    className="form-input pl-10"
                    placeholder="e.g. BADGE-1234"
                    value={badgeNumber}
                    onChange={(e) => setBadgeNumber(e.target.value)}
                  />
                  <Award size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                </div>
              </div>
            )}

            <button
              type="submit"
              className="btn btn-primary w-full mt-2"
              disabled={loading}
            >
              <span>{loading ? 'Processing Session...' : (isRequestAccess ? 'Submit Access Request' : 'Establish Connection')}</span>
            </button>
          </form>

          {!isRequestAccess && (
            <>
              <div className="relative flex py-4 items-center">
                <div className="flex-grow border-t border-white/10"></div>
                <span className="flex-shrink mx-4 text-xs text-slate-400 font-medium tracking-wide">OR</span>
                <div className="flex-grow border-t border-white/10"></div>
              </div>

              <div id="googleBtnDiv" className="w-full flex justify-center"></div>

            </>
          )}

          <div className="mt-6 text-center">
            <button
              onClick={() => {
                setIsRequestAccess(!isRequestAccess);
                setMessage('');
                setSuccessMsg('');
              }}
              className="text-xs text-primary-light hover:underline bg-transparent border-0 cursor-pointer font-medium"
            >
              {isRequestAccess
                ? 'Already have an approved account? Back to Login'
                : 'Need database access? Request Access here'}
            </button>
          </div>
        </div>

        {/* Demo Accounts Drawer */}
        {!isRequestAccess && (
          <div className="glass-panel mt-6 p-5 rounded-2xl border-dashed border-white/10">
            <div className="flex items-center gap-2 mb-3">
              <Info size={16} className="text-primary-light" />
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
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
              <button
                onClick={() => handleFillDemo('admin')}
                className="btn btn-secondary px-3.5 py-1.5 text-xs rounded-full"
              >
                <span>Admin Log In</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Glassmorphic Access Denial Modal Popup */}
      {showDenialModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4">
          <div className="bg-slate-900/90 border border-white/10 rounded-3xl max-w-md w-full p-6 text-center shadow-2xl flex flex-col items-center gap-4 relative animate-in fade-in zoom-in duration-200">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center ${denialStatus === 'denied'
              ? 'bg-red-500/10 text-red-500 border border-red-500/20'
              : 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
              }`}>
              {denialStatus === 'denied' ? (
                <ShieldAlert size={32} />
              ) : (
                <Shield size={32} />
              )}
            </div>

            <h2 className="text-xl font-bold text-white font-heading m-0">
              {denialStatus === 'denied' ? 'Access Revoked' : 'Access Restricted'}
            </h2>

            <p className="text-slate-300 text-sm leading-relaxed m-0">
              {denialMessage}
            </p>

            <p className="text-slate-400 text-xs mt-1 m-0">
              {denialStatus === 'denied'
                ? 'This account has been rejected from entering the system. Please reach out to the precinct administrator.'
                : 'Your registration request is currently in the queue. The precinct administrator must review and approve it.'}
            </p>

            <button
              onClick={() => setShowDenialModal(false)}
              className="btn btn-primary w-full mt-2"
            >
              <span>Understood</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;
