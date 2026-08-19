import React from 'react';
import { formatCurrency } from '../../utils/currency';
import { CheckCircle2, AlertTriangle, AlertCircle } from 'lucide-react';

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

  const getStatusBorder = () => {
    if (isOver) return 'rgba(239, 68, 68, 0.3)';
    if (isWarning) return 'rgba(245, 158, 11, 0.3)';
    return 'rgba(16, 185, 129, 0.3)';
  };

  return (
    <div
      style={{
        padding: '14px 16px',
        backgroundColor: 'rgba(255, 255, 255, 0.02)',
        border: '1px solid var(--border-glass)',
        borderRadius: 'var(--radius-md)',
        marginBottom: '12px',
        transition: 'border-color 0.2s ease',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            {category}
          </span>
          <span
            style={{
              fontSize: '0.6875rem',
              fontWeight: 700,
              padding: '2px 8px',
              borderRadius: 'var(--radius-full)',
              color: getStatusColor(),
              backgroundColor: getStatusBg(),
              border: `1px solid ${getStatusBorder()}`,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            {isOver ? <AlertCircle size={10} /> : isWarning ? <AlertTriangle size={10} /> : <CheckCircle2 size={10} />}
            {usagePercentage}%
          </span>
        </div>

        <div style={{ fontSize: '0.75rem' }}>
          <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{formatCurrency(spentAmount)}</span>
          <span style={{ color: 'var(--text-muted)' }}> / {formatCurrency(budgetAmount)}</span>
        </div>
      </div>

      {/* Progress Track */}
      <div
        style={{
          width: '100%',
          height: '7px',
          backgroundColor: 'rgba(255, 255, 255, 0.06)',
          borderRadius: 'var(--radius-full)',
          overflow: 'hidden',
          boxShadow: 'inset 0 1px 2px rgba(0, 0, 0, 0.4)',
        }}
      >
        <div
          style={{
            height: '100%',
            width: `${Math.min(usagePercentage, 100)}%`,
            backgroundColor: getStatusColor(),
            borderRadius: 'var(--radius-full)',
            boxShadow: `0 0 8px ${getStatusColor()}60`,
            transition: 'width 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
          }}
        />
      </div>
    </div>
  );
};
