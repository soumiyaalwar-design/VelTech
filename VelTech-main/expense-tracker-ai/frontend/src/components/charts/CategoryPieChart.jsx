import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { formatCurrency } from '../../utils/currency';

const DEFAULT_COLORS = ['#EF4444', '#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#06B6D4', '#64748B'];

export const CategoryPieChart = ({ data = [] }) => {
  if (!data || data.length === 0) {
    return (
      <div style={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
        No category expenditure recorded for this period.
      </div>
    );
  }

  const chartData = data.map((item, idx) => ({
    name: item.category,
    value: parseFloat(item.amount),
    percentage: item.percentage,
    color: item.color || DEFAULT_COLORS[idx % DEFAULT_COLORS.length],
  }));

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const d = payload[0].payload;
      return (
        <div
          style={{
            backgroundColor: 'rgba(11, 17, 33, 0.92)',
            backdropFilter: 'blur(16px)',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            borderRadius: '10px',
            padding: '12px 16px',
            boxShadow: '0 12px 30px rgba(0, 0, 0, 0.6)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: d.color, boxShadow: `0 0 8px ${d.color}` }} />
            <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#FFFFFF' }}>{d.name}</span>
          </div>
          <div style={{ fontSize: '1rem', fontWeight: 800, color: '#38BDF8', letterSpacing: '-0.02em', marginBottom: '2px' }}>
            {formatCurrency(d.value)}
          </div>
          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#94A3B8' }}>
            {d.percentage}% of total expenses
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div style={{ width: '100%', height: '230px', position: 'relative' }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={68}
              outerRadius={98}
              paddingAngle={3}
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} stroke="#090D16" strokeWidth={3} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Interactive Category Legend List */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', maxHeight: '100px', overflowY: 'auto', paddingRight: '4px' }}>
        {chartData.map((item, idx) => (
          <div
            key={idx}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '10px',
              padding: '6px 12px',
              backgroundColor: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid rgba(255, 255, 255, 0.06)',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.75rem',
              flex: '1 1 calc(50% - 4px)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden' }}>
              <span style={{ width: '8px', height: '8px', minWidth: '8px', borderRadius: '50%', backgroundColor: item.color }} />
              <span style={{ color: 'var(--text-primary)', fontWeight: 600, whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                {item.name}
              </span>
            </div>
            <span style={{ color: 'var(--text-muted)', fontWeight: 700 }}>
              {item.percentage}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
