import React from 'react';
import { Menu, Bell, Search, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const Topbar = ({ pageTitle = 'Dashboard', onToggleSidebar }) => {
  const { user } = useAuth();

  return (
    <header
      style={{
        height: '70px',
        backgroundColor: '#090D16',
        borderBottom: '1px solid var(--border-subtle)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 24px',
        position: 'sticky',
        top: 0,
        zIndex: 5,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <button
          onClick={onToggleSidebar}
          style={{
            background: 'transparent',
            border: 'none',
            color: 'var(--text-secondary)',
            cursor: 'pointer',
            padding: '6px',
            display: 'flex',
            borderRadius: 'var(--radius-sm)',
          }}
        >
          <Menu size={20} />
        </button>

        <h1 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
          {pageTitle}
        </h1>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '6px 14px',
            backgroundColor: 'rgba(16, 185, 129, 0.1)',
            border: '1px solid rgba(16, 185, 129, 0.25)',
            borderRadius: 'var(--radius-full)',
          }}
        >
          <Sparkles size={14} color="var(--emerald)" />
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--emerald)' }}>
            Live Sync
          </span>
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            paddingLeft: '12px',
            borderLeft: '1px solid var(--border-subtle)',
          }}
        >
          <div
            style={{
              width: '34px',
              height: '34px',
              borderRadius: '50%',
              backgroundColor: 'var(--indigo)',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              fontSize: '0.8125rem',
            }}
          >
            {user?.first_name ? user.first_name[0].toUpperCase() : 'U'}
          </div>
          <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>
            {user?.first_name || 'User'}
          </span>
        </div>
      </div>
    </header>
  );
};
