import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../services/api';

const VerifyEmail = () => {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || '';

  useEffect(() => {
    if (!email) {
      navigate('/login');
    }
  }, [email, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    try {
      await api.post('/auth/verify-email', { email, code });
      setSuccess('Email verified successfully! You can now log in.');
      setTimeout(() => {
        navigate('/login', { replace: true });
      }, 2000);
    } catch (err) {
      const data = err.response?.data;
      const detailMsg = data?.details?.[0]?.message;
      setError(detailMsg || data?.message || 'Failed to verify email. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    setError('');
    setSuccess('');
    setIsResending(true);

    try {
      await api.post('/auth/resend-verification', { email });
      setSuccess('Verification email resent successfully. Please check your inbox.');
    } catch (err) {
      const data = err.response?.data;
      const detailMsg = data?.details?.[0]?.message;
      setError(detailMsg || data?.message || 'Failed to resend verification email.');
    } finally {
      setIsResending(false);
    }
  };

  if (!email) return null;

  return (
    <div className="flex items-center justify-center" style={{ minHeight: 'calc(100vh - 120px)' }}>
      <div className="glass-panel animate-fade-in" style={{ width: '100%', maxWidth: '420px', padding: '2.5rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 600, marginBottom: '0.5rem' }}>Verify your email</h2>
          <p style={{ color: 'var(--color-text-muted)' }}>We sent a 6-digit code to <strong style={{ color: 'var(--color-text-main)' }}>{email}</strong></p>
        </div>

        {error && (
          <div style={{ 
            backgroundColor: 'rgba(244, 63, 94, 0.1)', 
            border: '1px solid var(--color-accent)', 
            color: '#fda4af', 
            padding: '12px', 
            borderRadius: '8px', 
            marginBottom: '1.5rem',
            fontSize: '0.9rem'
          }}>
            {error}
          </div>
        )}

        {success && (
          <div style={{ 
            backgroundColor: 'rgba(16, 185, 129, 0.1)', 
            border: '1px solid #10b981', 
            color: '#6ee7b7', 
            padding: '12px', 
            borderRadius: '8px', 
            marginBottom: '1.5rem',
            fontSize: '0.9rem'
          }}>
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex-col gap-4">
          <div className="flex-col" style={{ gap: '6px' }}>
            <label htmlFor="code" style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>Verification Code</label>
            <input
              id="code"
              type="text"
              className="input-field"
              placeholder="123456"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              required
              maxLength={6}
              style={{ textAlign: 'center', letterSpacing: '4px', fontSize: '1.2rem' }}
            />
          </div>

          <button 
            type="submit" 
            className="btn btn-primary" 
            style={{ width: '100%', padding: '12px', marginTop: '1rem' }}
            disabled={isLoading || code.length !== 6}
          >
            {isLoading ? 'Verifying...' : 'Verify Email'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
          <button
            onClick={handleResend}
            disabled={isResending}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--color-text-muted)',
              cursor: isResending ? 'not-allowed' : 'pointer',
              textDecoration: 'underline',
              fontSize: '0.9rem'
            }}
          >
            {isResending ? 'Resending...' : "Didn't receive the code? Resend"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;
