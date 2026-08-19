import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Sparkles, Eye, EyeOff, Lock, Mail, User, Phone, ArrowRight, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

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
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#070A12' }}>
      {/* Left Branding Showcase */}
      <div
        style={{
          flex: 1,
          background: 'linear-gradient(135deg, #0A1124 0%, #0F172A 50%, #061A23 100%)',
          borderRight: '1px solid var(--border-subtle)',
          padding: '60px',
          display: 'none',
          flexDirection: 'column',
          justifyContent: 'space-between',
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
              boxShadow: '0 4px 15px rgba(16, 185, 129, 0.3)',
            }}
          >
            <Sparkles size={24} color="#FFFFFF" />
          </div>
          <span style={{ fontSize: '1.375rem', fontWeight: 800, color: '#FFFFFF', letterSpacing: '-0.02em' }}>
            Expense<span style={{ color: 'var(--emerald)' }}>Tracker</span>
          </span>
        </div>

        <div style={{ maxWidth: '460px' }}>
          <h2 style={{ fontSize: '2.5rem', fontWeight: 800, color: '#FFFFFF', lineHeight: 1.15, marginBottom: '20px', letterSpacing: '-0.03em' }}>
            Start your journey toward financial freedom.
          </h2>
          <p style={{ fontSize: '1.0625rem', color: '#94A3B8', lineHeight: 1.6, marginBottom: '32px' }}>
            Join thousands of users tracking expenses, keeping monthly budgets in check, and discovering insights across their spending.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#E2E8F0', fontSize: '0.875rem' }}>
              <CheckCircle2 size={18} color="#10B981" />
              <span>Full control over income and expense records</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#E2E8F0', fontSize: '0.875rem' }}>
              <CheckCircle2 size={18} color="#10B981" />
              <span>Category management with default presets</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#E2E8F0', fontSize: '0.875rem' }}>
              <CheckCircle2 size={18} color="#10B981" />
              <span>Complete data privacy and ownership isolation</span>
            </div>
          </div>
        </div>

        <div style={{ fontSize: '0.8125rem', color: '#64748B' }}>
          © 2026 ExpenseTracker AI. Built for financial confidence.
        </div>
      </div>

      {/* Right Registration Card */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '32px 20px',
          overflowY: 'auto',
        }}
      >
        <div style={{ width: '100%', maxWidth: '480px' }}>
          <div style={{ marginBottom: '28px' }}>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#FFFFFF', marginBottom: '8px', letterSpacing: '-0.02em' }}>
              Create your account
            </h2>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
              Fill in the details below to set up your financial workspace.
            </p>
          </div>

          {errorMessage && (
            <div
              className="glass-card animate-fade-in"
              style={{
                padding: '12px 16px',
                backgroundColor: 'rgba(239, 68, 68, 0.12)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                color: '#F87171',
                fontSize: '0.875rem',
                borderRadius: 'var(--radius-md)',
                marginBottom: '20px',
              }}
            >
              {errorMessage}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <div className="form-group">
                <label className="form-label" htmlFor="first_name">First Name *</label>
                <div style={{ position: 'relative' }}>
                  <input
                    id="first_name"
                    name="first_name"
                    type="text"
                    className="form-input"
                    placeholder="John"
                    value={formData.first_name}
                    onChange={handleChange}
                    style={{ paddingLeft: '38px' }}
                    required
                  />
                  <User size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                </div>
              </div>

              <div className="form-group">
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
                <Mail size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="mobile_number">Mobile Number</label>
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
                <Phone size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <div className="form-group">
                <label className="form-label" htmlFor="password">Password *</label>
                <div style={{ position: 'relative' }}>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    className="form-input"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleChange}
                    style={{ paddingLeft: '36px', paddingRight: '36px' }}
                    required
                  />
                  <Lock size={16} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: 'absolute',
                      right: '10px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'transparent',
                      border: 'none',
                      color: 'var(--text-muted)',
                      cursor: 'pointer',
                      display: 'flex',
                    }}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="password_confirmation">Confirm Password *</label>
                <div style={{ position: 'relative' }}>
                  <input
                    id="password_confirmation"
                    name="password_confirmation"
                    type={showConfirmPassword ? 'text' : 'password'}
                    className="form-input"
                    placeholder="••••••••"
                    value={formData.password_confirmation}
                    onChange={handleChange}
                    style={{ paddingLeft: '36px', paddingRight: '36px' }}
                    required
                  />
                  <Lock size={16} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    style={{
                      position: 'absolute',
                      right: '10px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'transparent',
                      border: 'none',
                      color: 'var(--text-muted)',
                      cursor: 'pointer',
                      display: 'flex',
                    }}
                  >
                    {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
            </div>

            {/* Password Strength Meter */}
            {formData.password && (
              <div style={{ marginBottom: '16px' }}>
                <div style={{ display: 'flex', gap: '4px', height: '4px', marginBottom: '6px' }}>
                  {[1, 2, 3, 4].map((step) => (
                    <div
                      key={step}
                      style={{
                        flex: 1,
                        borderRadius: '2px',
                        backgroundColor:
                          strength >= step
                            ? strength <= 2
                              ? '#EF4444'
                              : strength === 3
                              ? '#F59E0B'
                              : '#10B981'
                            : '#1E293B',
                        transition: 'background-color 0.3s ease',
                      }}
                    />
                  ))}
                </div>
                <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>
                  {strength < 2 ? 'Weak password (must have 8+ chars, uppercase, lowercase, digit)' : strength === 3 ? 'Medium strength' : 'Strong password'}
                </span>
              </div>
            )}

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%', padding: '12px', fontSize: '0.9375rem', marginTop: '10px' }}
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
