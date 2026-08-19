import React from 'react';
import { formatCurrency } from '../../utils/currency';

export const StatCard = ({
  title,
  amount,
  isCurrency = true,
  icon: Icon,
  iconColor = '#38BDF8',
  iconBg = 'rgba(56, 189, 248, 0.12)',
  trendText,
  trendType = 'neutral', // positive, negative, neutral
}) => {
  return (
    <div className="glass-card" style={{ padding: '20px', position: 'relative', overflow: 'hidden' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
        <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
          {title}
        </span>
        <div
          style={{
            width: '38px',
            height: '38px',
            borderRadius: 'var(--radius-md)',
            background: iconBg,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {Icon && <Icon size={20} color={iconColor} />}
        </div>
      </div>

      <div style={{ fontSize: '1.625rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
        {isCurrency ? formatCurrency(amount) : amount}
      </div>

      {trendText && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '10px' }}>
          <span
            style={{
              fontSize: '0.75rem',
              fontWeight: 600,
              color: trendType === 'positive' ? 'var(--emerald)' : trendType === 'negative' ? 'var(--rose)' : 'var(--text-muted)',
            }}
          >
            {trendText}
          </span>
        </div>
      )}
    </div>
  );
};
