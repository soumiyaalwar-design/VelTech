import React from 'react';
import { Menu, Sparkles, User, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { ThemeToggle } from '../common/ThemeToggle';

export const Topbar = ({ pageTitle = 'Dashboard', onToggleSidebar }) => {
  const { user } = useAuth();

  return (
    <header
      style={{
        height: '72px',
        backgroundColor: 'var(--bg-topbar)',
        backdropFilter: 'blur(20px) saturate(180%)',
        WebkitBackdropFilter: 'blur(20px) saturate(180%)',
        borderBottom: '1px solid var(--border-glass)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 28px',
        position: 'sticky',
        top: 0,
        zIndex: 15,
        boxShadow: 'var(--shadow-glass-sm)',
        transition: 'background-color 0.3s ease, border-color 0.3s ease',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <button
          onClick={onToggleSidebar}
          aria-label="Toggle navigation menu"
          style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-glass)',
            color: 'var(--text-secondary)',
            cursor: 'pointer',
            padding: '8px',
            display: 'flex',
            borderRadius: 'var(--radius-sm)',
            transition: 'all 0.2s ease',
          }}
        >
          <Menu size={18} />
        </button>

        <div>
          <h1 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.025em' }}>
            {pageTitle}
          </h1>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        {/* Animated Light/Dark Theme Switcher */}
        <ThemeToggle />

        {/* Live Sync Status Pill */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '6px 14px',
            backgroundColor: 'var(--emerald-bg)',
            border: '1px solid var(--emerald-border)',
            borderRadius: 'var(--radius-full)',
            boxShadow: 'var(--shadow-glow-emerald)',
          }}
        >
          <span
            style={{
              width: '7px',
              height: '7px',
              borderRadius: '50%',
              backgroundColor: 'var(--emerald)',
              boxShadow: '0 0 8px var(--emerald)',
            }}
            className="animate-pulse-glow"
          />
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-emerald)', letterSpacing: '0.02em' }}>
            Live Sync
          </span>
        </div>

        {/* User Badge */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '4px 12px 4px 6px',
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border-glass)',
            borderRadius: 'var(--radius-full)',
          }}
        >
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #6366F1 0%, #4F46E5 100%)',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              fontSize: '0.8125rem',
              boxShadow: '0 2px 8px rgba(99, 102, 241, 0.3)',
            }}
          >
            {user?.first_name ? user.first_name[0].toUpperCase() : 'U'}
          </div>
          <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)' }}>
            {user?.first_name || 'User'}
          </span>
        </div>
      </div>
    </header>
  );
};
