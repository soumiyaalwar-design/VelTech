import React from 'react';

export const SkeletonCard = ({ height = '140px' }) => {
  return (
    <div
      className="glass-card skeleton-shimmer"
      style={{
        height,
        borderRadius: 'var(--radius-lg)',
      }}
    />
  );
};

export const SkeletonTable = ({ rows = 5 }) => {
  return (
    <div className="glass-card" style={{ padding: '24px' }}>
      <div style={{ height: '24px', width: '200px', borderRadius: '6px', marginBottom: '20px' }} className="skeleton-shimmer" />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {Array.from({ length: rows }).map((_, idx) => (
          <div
            key={idx}
            style={{
              height: '44px',
              width: '100%',
              borderRadius: '8px',
            }}
            className="skeleton-shimmer"
          />
        ))}
      </div>
    </div>
  );
};
