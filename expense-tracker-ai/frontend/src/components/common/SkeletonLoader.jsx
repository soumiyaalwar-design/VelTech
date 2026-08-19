import React from 'react';

export const SkeletonCard = ({ height = '140px' }) => {
  return (
    <div
      className="glass-card animate-pulse-glow"
      style={{
        height,
        background: '#131D31',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-lg)',
      }}
    />
  );
};

export const SkeletonTable = ({ rows = 5 }) => {
  return (
    <div className="glass-card" style={{ padding: '20px' }}>
      <div style={{ height: '24px', width: '200px', background: '#1E293B', borderRadius: '4px', marginBottom: '20px' }} className="animate-pulse-glow" />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {Array.from({ length: rows }).map((_, idx) => (
          <div
            key={idx}
            style={{
              height: '40px',
              width: '100%',
              background: '#0E1626',
              borderRadius: '6px',
            }}
            className="animate-pulse-glow"
          />
        ))}
      </div>
    </div>
  );
};
