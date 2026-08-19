import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Sparkles, Eye, EyeOff, Lock, Mail, User, Phone, ArrowRight, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { ThemeToggle } from '../components/common/ThemeToggle';

export const Register = () => {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    mobile_number: '',
    password: '',
    password_confirmation: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const { register } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const calculatePasswordStrength = (pwd) => {
    let score = 0;
    if (pwd.length >= 8) score += 1;
    if (/[A-Z]/.test(pwd)) score += 1;
    if (/[a-z]/.test(pwd)) score += 1;
    if (/[0-9]/.test(pwd)) score += 1;
    return score;
  };

  const strength = calculatePasswordStrength(formData.password);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (formData.password !== formData.password_confirmation) {
      setErrorMessage('Passwords do not match.');
      return;
    }

    if (formData.password.length < 8) {
      setErrorMessage('Password must be at least 8 characters long.');
      return;
    }

    setIsLoading(true);
    try {
      await register({
        first_name: formData.first_name.trim(),
        last_name: formData.last_name.trim(),
        email: formData.email.trim(),
        mobile_number: formData.mobile_number.trim(),
        password: formData.password,
        password_confirmation: formData.password_confirmation,
      });

      toast.success('Account created successfully! Please log in.');
      navigate('/login');
    } catch (err) {
      const errs = err.response?.data?.errors;
      let msg = err.response?.data?.message || 'Registration failed.';
      if (errs) {
        const firstKey = Object.keys(errs)[0];
        if (Array.isArray(errs[firstKey])) {
          msg = errs[firstKey][0];
        } else if (typeof errs[firstKey] === 'string') {
          msg = errs[firstKey];
        }
      }
      setErrorMessage(msg);
      toast.error(msg);
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

      {/* Left Branding Showcase */}
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
            <Sparkles size={14} /> Join ExpenseTracker
          </div>

          <h2 style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.15, marginBottom: '20px', letterSpacing: '-0.03em' }}>
            Start building healthy financial habits today.
          </h2>
          <p style={{ fontSize: '1.0625rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '32px' }}>
            Gain complete visibility into your income, expenses, and savings goals with automated tracking and visual reporting.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-primary)', fontSize: '0.875rem' }}>
              <CheckCircle2 size={18} color="var(--emerald)" />
              <span>Smart category budgets with automatic utilization monitoring</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-primary)', fontSize: '0.875rem' }}>
              <CheckCircle2 size={18} color="var(--emerald)" />
              <span>Interactive cashflow analytics & monthly breakdowns</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-primary)', fontSize: '0.875rem' }}>
              <CheckCircle2 size={18} color="var(--emerald)" />
              <span>Export clean CSV & Excel reports with custom filters</span>
            </div>
          </div>
        </div>

        <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
          © 2026 ExpenseTracker AI. Built for financial confidence.
        </div>
      </div>

      {/* Right Register Form Card */}
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
            maxWidth: '520px',
            padding: '40px 36px',
            border: '1px solid var(--border-glass-highlight)',
          }}
        >
          <div style={{ marginBottom: '28px' }}>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '8px', letterSpacing: '-0.025em' }}>
              Create your account
            </h2>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
              Set up your profile to start tracking your finances in real time.
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
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '16px' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" htmlFor="first_name">First Name *</label>
                <div style={{ position: 'relative' }}>
                  <input
                    id="first_name"
                    name="first_name"
                    type="text"
                    className="form-input"
                    placeholder="Jane"
                    value={formData.first_name}
                    onChange={handleChange}
                    style={{ paddingLeft: '38px' }}
                    required
                  />
                  <User size={17} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" htmlFor="last_name">Last Name</label>
                <input
                  id="last_name"
                  name="last_name"
                  type="text"
                  className="form-input"
                  placeholder="Doe"
                  value={formData.last_name}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="email">Email Address *</label>
              <div style={{ position: 'relative' }}>
                <input
                  id="email"
                  name="email"
                  type="email"
                  className="form-input"
                  placeholder="name@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  style={{ paddingLeft: '38px' }}
                  required
                />
                <Mail size={17} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="mobile_number">Mobile Number (Optional)</label>
              <div style={{ position: 'relative' }}>
                <input
                  id="mobile_number"
                  name="mobile_number"
                  type="tel"
                  className="form-input"
                  placeholder="+91 9876543210"
                  value={formData.mobile_number}
                  onChange={handleChange}
                  style={{ paddingLeft: '38px' }}
                />
                <Phone size={17} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="password">Password *</label>
              <div style={{ position: 'relative' }}>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  className="form-input"
                  placeholder="At least 8 characters (Upper, lower, digit)"
                  value={formData.password}
                  onChange={handleChange}
                  style={{ paddingLeft: '38px', paddingRight: '40px' }}
                  required
                />
                <Lock size={17} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
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
                  {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>

              {/* Password strength meter */}
              {formData.password && (
                <div style={{ marginTop: '8px' }}>
                  <div style={{ display: 'flex', gap: '4px', height: '4px', borderRadius: '2px', overflow: 'hidden' }}>
                    <div style={{ flex: 1, backgroundColor: strength >= 1 ? '#EF4444' : 'var(--border-glass)' }} />
                    <div style={{ flex: 1, backgroundColor: strength >= 2 ? '#F59E0B' : 'var(--border-glass)' }} />
                    <div style={{ flex: 1, backgroundColor: strength >= 3 ? '#38BDF8' : 'var(--border-glass)' }} />
                    <div style={{ flex: 1, backgroundColor: strength >= 4 ? '#10B981' : 'var(--border-glass)' }} />
                  </div>
                  <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                    {strength <= 1 ? 'Weak' : strength <= 3 ? 'Medium' : 'Strong password'}
                  </div>
                </div>
              )}
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="password_confirmation">Confirm Password *</label>
              <div style={{ position: 'relative' }}>
                <input
                  id="password_confirmation"
                  name="password_confirmation"
                  type={showConfirmPassword ? 'text' : 'password'}
                  className="form-input"
                  placeholder="Repeat your password"
                  value={formData.password_confirmation}
                  onChange={handleChange}
                  style={{ paddingLeft: '38px', paddingRight: '40px' }}
                  required
                />
                <Lock size={17} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  aria-label={showConfirmPassword ? "Hide password" : "Show password"}
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
                  {showConfirmPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%', padding: '12px', fontSize: '0.9375rem', marginTop: '12px' }}
              disabled={isLoading}
            >
              {isLoading ? 'Creating account...' : 'Create Account'}
              {!isLoading && <ArrowRight size={18} />}
            </button>
          </form>

          <div style={{ marginTop: '24px', textAlign: 'center', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: 'var(--emerald)', fontWeight: 600, textDecoration: 'none' }}>
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
