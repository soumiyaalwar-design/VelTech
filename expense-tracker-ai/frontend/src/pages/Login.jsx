import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Sparkles, Eye, EyeOff, Lock, Mail, ArrowRight, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { ThemeToggle } from '../components/common/ThemeToggle';

export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const { login } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!email.trim() || !password) {
      setErrorMessage('Please provide both email and password.');
      return;
    }

    setIsLoading(true);
    try {
      await login({ email: email.trim(), password });
      toast.success('Welcome back!');
      navigate('/');
    } catch (err) {
      const errDetail = err.response?.data?.message || err.response?.data?.errors?.detail || 'Invalid email or password.';
      setErrorMessage(errDetail);
      toast.error(errDetail);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="app-canvas" style={{ display: 'flex', minHeight: '100vh', position: 'relative' }}>
      {/* Top Right Theme Toggle */}
      <div style={{ position: 'absolute', top: '24px', right: '24px', zIndex: 30 }}>
        <ThemeToggle />
      </div>

      {/* Left Branding Showcase (Desktop) */}
      <div
        style={{
          flex: 1,
          background: 'linear-gradient(135deg, rgba(10, 17, 36, 0.95) 0%, rgba(15, 23, 42, 0.9) 50%, rgba(6, 26, 35, 0.95) 100%)',
          backdropFilter: 'blur(20px)',
          borderRight: '1px solid var(--border-glass)',
          padding: '60px',
          display: 'none',
          flexDirection: 'column',
          justifyContent: 'space-between',
          position: 'relative',
          overflow: 'hidden',
        }}
        className="login-left-panel"
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #10B981 0%, #6366F1 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 16px rgba(16, 185, 129, 0.35)',
            }}
          >
            <Sparkles size={24} color="#FFFFFF" />
          </div>
          <span style={{ fontSize: '1.375rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.025em' }}>
            Expense<span style={{ color: 'var(--emerald)' }}>Tracker</span>
          </span>
        </div>

        <div style={{ maxWidth: '480px' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '4px 12px',
              backgroundColor: 'var(--emerald-bg)',
              border: '1px solid var(--emerald-border)',
              borderRadius: 'var(--radius-full)',
              color: 'var(--text-emerald)',
              fontSize: '0.75rem',
              fontWeight: 700,
              marginBottom: '20px',
            }}
          >
            <Sparkles size={14} /> Financial Intelligence Platform
          </div>

          <h2 style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.15, marginBottom: '20px', letterSpacing: '-0.03em' }}>
            Master your money with clarity and precision.
          </h2>
          <p style={{ fontSize: '1.0625rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '32px' }}>
            Enterprise-grade financial intelligence, real-time budget tracking, dynamic analytics, and effortless expense categorization.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-primary)', fontSize: '0.875rem' }}>
              <CheckCircle2 size={18} color="var(--emerald)" />
              <span>Real-time budget limit threshold notifications</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-primary)', fontSize: '0.875rem' }}>
              <CheckCircle2 size={18} color="var(--emerald)" />
              <span>Interactive Recharts visualizations & category analytics</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-primary)', fontSize: '0.875rem' }}>
              <CheckCircle2 size={18} color="var(--emerald)" />
              <span>Instant CSV and Excel workbook financial reporting</span>
            </div>
          </div>
        </div>

        <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
          © 2026 ExpenseTracker AI. Built for financial confidence.
        </div>
      </div>

      {/* Right Login Form Card */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '40px 24px',
          zIndex: 10,
        }}
      >
        <div
          className="glass-card animate-fade-in"
          style={{
            width: '100%',
            maxWidth: '440px',
            padding: '40px 36px',
            border: '1px solid var(--border-glass-highlight)',
          }}
        >
          <div style={{ marginBottom: '32px' }}>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '8px', letterSpacing: '-0.025em' }}>
              Welcome back
            </h2>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
              Enter your credentials to access your financial dashboard.
            </p>
          </div>

          {errorMessage && (
            <div
              className="animate-fade-in"
              style={{
                padding: '12px 16px',
                backgroundColor: 'var(--rose-bg)',
                border: '1px solid var(--rose-border)',
                color: 'var(--text-rose)',
                fontSize: '0.875rem',
                borderRadius: 'var(--radius-md)',
                marginBottom: '20px',
              }}
            >
              {errorMessage}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label" htmlFor="email">Email Address</label>
              <div style={{ position: 'relative' }}>
                <input
                  id="email"
                  type="email"
                  className="form-input"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{ paddingLeft: '40px' }}
                  required
                />
                <Mail size={18} style={{ position: 'absolute', left: '13px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              </div>
            </div>

            <div className="form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label className="form-label" htmlFor="password">Password</label>
              </div>
              <div style={{ position: 'relative' }}>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  className="form-input"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{ paddingLeft: '40px', paddingRight: '42px' }}
                  required
                />
                <Lock size={18} style={{ position: 'absolute', left: '13px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--text-muted)',
                    cursor: 'pointer',
                    display: 'flex',
                  }}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%', padding: '12px', fontSize: '0.9375rem', marginTop: '10px' }}
              disabled={isLoading}
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
              {!isLoading && <ArrowRight size={18} />}
            </button>
          </form>

          <div style={{ marginTop: '24px', textAlign: 'center', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
            Don't have an account?{' '}
            <Link to="/register" style={{ color: 'var(--emerald)', fontWeight: 600, textDecoration: 'none' }}>
              Create an account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
