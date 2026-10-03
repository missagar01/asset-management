import React, { useState } from 'react';
import { 
  Lock, 
  User, 
  Layers, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  AlertCircle
} from 'lucide-react';
import { authenticateUser } from '../constants/auth';

export function LoginPage({ onLoginSuccess, mastersList = [] }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    setTimeout(() => {
      const result = authenticateUser(username, password, mastersList);
      setIsLoading(false);

      if (result.success) {
        onLoginSuccess(result.user);
      } else {
        setError(result.error || 'Authentication failed. Please verify credentials.');
      }
    }, 200);
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1.5rem',
      position: 'relative'
    }}>
      {/* Decorative gradient glow behind card */}
      <div style={{
        position: 'absolute',
        width: '450px',
        height: '450px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(2, 132, 199, 0.08) 0%, rgba(99, 102, 241, 0.05) 50%, transparent 70%)',
        filter: 'blur(40px)',
        pointerEvents: 'none'
      }} />

      <div 
        className="glass-panel" 
        style={{
          width: '100%',
          maxWidth: '440px',
          padding: '2.25rem',
          position: 'relative',
          zIndex: 1,
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          boxShadow: '0 20px 40px -15px rgba(15, 23, 42, 0.1), 0 0 25px rgba(2, 132, 199, 0.08)'
        }}
      >
        {/* Brand Header */}
        <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
          <div style={{
            width: '54px',
            height: '54px',
            margin: '0 auto 1rem auto',
            background: 'linear-gradient(135deg, #0284c7, #6366f1)',
            borderRadius: '14px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffffff',
            boxShadow: '0 4px 16px rgba(2, 132, 199, 0.3)'
          }}>
            <Layers size={28} />
          </div>
          <h1 style={{
            fontSize: '1.5rem',
            fontWeight: 800,
            letterSpacing: '-0.02em',
            color: '#0f172a',
            marginBottom: '0.25rem'
          }}>
            AssetPulse
          </h1>
          <p style={{ fontSize: '0.8125rem', color: '#64748b' }}>
            Enterprise Asset Management • Secure Portal
          </p>
        </div>

        {error && (
          <div style={{
            background: 'rgba(244, 63, 94, 0.15)',
            border: '1px solid rgba(244, 63, 94, 0.4)',
            color: '#fca5a5',
            padding: '0.625rem 0.875rem',
            borderRadius: '8px',
            fontSize: '0.8125rem',
            marginBottom: '1.25rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.125rem' }}>
          <div className="form-group">
            <label className="form-label" htmlFor="login-username">
              <span>Username</span>
            </label>
            <div style={{ position: 'relative' }}>
              <input
                id="login-username"
                type="text"
                className="form-input"
                style={{ paddingLeft: '2.5rem' }}
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder="Enter username"
                required
                autoFocus
              />
              <User 
                size={16} 
                style={{
                  position: 'absolute',
                  left: '0.875rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#64748b'
                }} 
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="login-password">
              <span>Password</span>
            </label>
            <div style={{ position: 'relative' }}>
              <input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                className="form-input"
                style={{ paddingLeft: '2.5rem', paddingRight: '2.5rem' }}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Enter password"
                required
              />
              <Lock 
                size={16} 
                style={{
                  position: 'absolute',
                  left: '0.875rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#64748b'
                }} 
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '0.75rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'transparent',
                  border: 'none',
                  color: '#64748b',
                  cursor: 'pointer',
                  padding: '0.25rem',
                  display: 'flex'
                }}
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button
            id="btn-login-submit"
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', marginTop: '0.5rem', padding: '0.75rem' }}
            disabled={isLoading}
          >
            <span>Sign In</span>
            <ArrowRight size={16} />
          </button>
        </form>
      </div>
    </div>
  );
}
