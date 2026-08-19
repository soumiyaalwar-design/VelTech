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
  // Border accent color based on semantic role
  const getAccentBorderColor = () => {
    if (trendType === 'positive' || iconColor === '#10B981') return 'var(--emerald)';
    if (trendType === 'negative' || iconColor === '#EF4444') return 'var(--rose)';
    if (iconColor === '#F59E0B') return 'var(--amber)';
    return 'var(--cyan)';
  };

  return (
    <div
      className="glass-card glass-card-interactive"
      style={{
        padding: '22px 24px',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        minHeight: '148px',
      }}
    >
      {/* Top accent glow line */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: '20px',
          right: '20px',
          height: '2px',
          background: `linear-gradient(90deg, transparent 0%, ${getAccentBorderColor()} 50%, transparent 100%)`,
          opacity: 0.8,
        }}
      />

      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
          <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)', letterSpacing: '0.02em' }}>
            {title}
          </span>
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '12px',
              background: iconBg,
              border: `1px solid ${iconColor}25`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: `0 4px 12px ${iconColor}15`,
            }}
          >
            {Icon && <Icon size={20} color={iconColor} />}
          </div>
        </div>

        <div
          style={{
            fontSize: '1.75rem',
            fontWeight: 800,
            color: 'var(--text-primary)',
            letterSpacing: '-0.03em',
            lineHeight: 1.2,
          }}
        >
          {isCurrency ? formatCurrency(amount) : amount}
        </div>
      </div>

      {trendText && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '12px' }}>
          <span
            style={{
              fontSize: '0.75rem',
              fontWeight: 600,
              color:
                trendType === 'positive'
                  ? 'var(--text-emerald)'
                  : trendType === 'negative'
                  ? 'var(--text-rose)'
                  : 'var(--text-muted)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            {trendText}
          </span>
        </div>
      )}
    </div>
  );
};
