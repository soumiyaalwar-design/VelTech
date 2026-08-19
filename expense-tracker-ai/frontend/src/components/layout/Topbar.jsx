import React from 'react';
import { Menu, Sparkles, User, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const Topbar = ({ pageTitle = 'Dashboard', onToggleSidebar }) => {
  const { user } = useAuth();

  return (
    <header
      style={{
        height: '72px',
        backgroundColor: 'rgba(6, 9, 19, 0.75)',
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
        boxShadow: '0 4px 20px 0 rgba(0, 0, 0, 0.25)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <button
          onClick={onToggleSidebar}
          aria-label="Toggle navigation menu"
          style={{
            background: 'rgba(255, 255, 255, 0.04)',
            border: '1px solid var(--border-glass)',
            color: 'var(--text-secondary)',
            cursor: 'pointer',
            padding: '7px',
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

      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        {/* Live Sync Status Pill */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '5px 14px',
            backgroundColor: 'rgba(16, 185, 129, 0.08)',
            border: '1px solid rgba(16, 185, 129, 0.25)',
            borderRadius: 'var(--radius-full)',
            boxShadow: '0 2px 10px rgba(16, 185, 129, 0.15)',
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

        {/* User Pill */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '4px 12px 4px 6px',
            backgroundColor: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid var(--border-glass)',
            borderRadius: 'var(--radius-full)',
          }}
        >
          <div
            style={{
              width: '30px',
              height: '30px',
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
