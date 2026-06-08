import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Shield, Mail, Lock, UserPlus, Info, Key } from 'lucide-react';

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
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
      background: 'radial-gradient(circle at 10% 20%, rgba(79, 70, 229, 0.04) 0%, transparent 40%), var(--bg-primary)',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Decorative background grid */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundImage: 'linear-gradient(rgba(0, 0, 0, 0.015) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 0, 0, 0.015) 1px, transparent 1px)',
        backgroundSize: '40px 40px',
        zIndex: 1
      }}></div>

      <div style={{ position: 'relative', zIndex: 10, width: '100%', maxWidth: '440px' }}>
        {/* Logo and Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            background: 'var(--primary-gradient)',
            width: '56px',
            height: '56px',
            borderRadius: '16px',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 8px 24px rgba(79, 70, 229, 0.15)',
            marginBottom: '1rem'
          }}>
            <Shield size={28} color="#ffffff" />
          </div>
          <h1 style={{
            fontSize: '1.75rem',
            fontFamily: 'Outfit',
            fontWeight: 800,
            color: 'var(--text-primary)',
            letterSpacing: '-0.02em'
          }}>SHIELD PROTOCOL</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '0.25rem' }}>
            National Police Theft Management & Recovery Console
          </p>
        </div>

        {/* Login/Register Card */}
        <div className="glass-panel" style={{ padding: '2.25rem', borderRadius: '24px' }}>
          <h2 style={{
            fontSize: '1.15rem',
            marginBottom: '1.5rem',
            color: 'var(--text-primary)',
            textAlign: 'center',
            fontFamily: 'Outfit',
            fontWeight: 700
          }}>
            Officer & Admin Protocol Login
          </h2>

          {message && (
            <div style={{
              background: 'rgba(239, 68, 68, 0.08)',
              border: '1px solid rgba(239, 68, 68, 0.15)',
              borderRadius: '8px',
              padding: '0.75rem',
              color: '#ef4444',
              fontSize: '0.8rem',
              marginBottom: '1.25rem',
              textAlign: 'center'
            }}>
              {message}
            </div>
          )}

          {successMsg && (
            <div style={{
              background: 'rgba(16, 185, 129, 0.08)',
              border: '1px solid rgba(16, 185, 129, 0.15)',
              borderRadius: '8px',
              padding: '0.75rem',
              color: '#10b981',
              fontSize: '0.8rem',
              marginBottom: '1.25rem',
              textAlign: 'center'
            }}>
              {successMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div>
              <label className="form-label">Email Address</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="email"
                  className="form-input"
                  placeholder="name@police.gov"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  style={{ paddingLeft: '2.5rem' }}
                />
                <Mail size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
              </div>
            </div>

            <div>
              <label className="form-label">Secret Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="password"
                  className="form-input"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  style={{ paddingLeft: '2.5rem' }}
                />
                <Lock size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
              </div>
            </div>

            <div>
              <label className="form-label">Precinct Access Code</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="password"
                  className="form-input"
                  placeholder="SHIELD-SECURE-••••"
                  value={accessCode}
                  onChange={(e) => setAccessCode(e.target.value)}
                  required
                  style={{ paddingLeft: '2.5rem' }}
                />
                <Key size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
              style={{ width: '100%', marginTop: '0.5rem' }}
            >
              <span>{loading ? 'Processing Session...' : 'Establish Connection'}</span>
            </button>
          </form>
        </div>

        {/* Demo Accounts Drawer */}
        <div className="glass-panel" style={{
          marginTop: '1.5rem',
          padding: '1.25rem',
          borderRadius: '16px',
          borderStyle: 'dashed'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
            <Info size={16} color="var(--primary)" />
            <h3 style={{ fontSize: '0.8rem', color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700 }}>
              Demo Credentials Drawer
            </h3>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            <button
              onClick={() => handleFillDemo('officer')}
              className="btn btn-secondary"
              style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem', borderRadius: '15px' }}
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
