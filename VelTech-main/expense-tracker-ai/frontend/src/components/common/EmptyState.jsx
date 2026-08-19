import React from 'react';
import { Inbox, Plus } from 'lucide-react';

export const EmptyState = ({
  icon: Icon = Inbox,
  title = 'No records found',
  description = 'Get started by creating your first entry.',
  actionText,
  onAction,
}) => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '60px 20px',
        textAlign: 'center',
      }}
    >
      <div
        style={{
          width: '56px',
          height: '56px',
          borderRadius: 'var(--radius-full)',
          background: 'rgba(255, 255, 255, 0.04)',
          border: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--text-muted)',
          marginBottom: '16px',
        }}
      >
        <Icon size={28} />
      </div>

      <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '6px' }}>
        {title}
      </h4>

      <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', maxWidth: '340px', marginBottom: actionText ? '20px' : '0' }}>
        {description}
      </p>

      {actionText && onAction && (
        <button type="button" className="btn btn-primary" onClick={onAction}>
          <Plus size={16} />
          {actionText}
        </button>
      )}
    </div>
  );
};
