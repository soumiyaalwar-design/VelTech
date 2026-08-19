import React from 'react';
import { formatCurrency } from '../../utils/currency';

export const BudgetProgressBar = ({
  category,
  budgetAmount,
  spentAmount,
  usagePercentage = 0,
  status = 'HEALTHY',
}) => {
  const isOver = usagePercentage > 100;
  const isWarning = usagePercentage >= 80 && !isOver;

  const getStatusColor = () => {
    if (isOver) return 'var(--rose)';
    if (isWarning) return 'var(--amber)';
    return 'var(--emerald)';
  };

  const getStatusBg = () => {
    if (isOver) return 'rgba(239, 68, 68, 0.15)';
    if (isWarning) return 'rgba(245, 158, 11, 0.15)';
    return 'rgba(16, 185, 129, 0.15)';
  };

  return (
    <div style={{ marginBottom: '16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>
            {category}
          </span>
          <span
            style={{
              fontSize: '0.6875rem',
              fontWeight: 700,
              padding: '2px 6px',
              borderRadius: 'var(--radius-full)',
              color: getStatusColor(),
              backgroundColor: getStatusBg(),
            }}
          >
            {usagePercentage}%
          </span>
        </div>

        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
          <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{formatCurrency(spentAmount)}</span>
          <span style={{ color: 'var(--text-muted)' }}> / {formatCurrency(budgetAmount)}</span>
        </div>
      </div>

      {/* Progress Bar Container */}
      <div
        style={{
          width: '100%',
          height: '8px',
          backgroundColor: '#0E1626',
          borderRadius: 'var(--radius-full)',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            height: '100%',
            width: `${Math.min(usagePercentage, 100)}%`,
            backgroundColor: getStatusColor(),
            borderRadius: 'var(--radius-full)',
            transition: 'width 0.4s ease',
          }}
        />
      </div>
    </div>
  );
};
