import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { formatCurrency, formatCompactCurrency } from '../../utils/currency';

export const MonthlyBarChart = ({ data = [] }) => {
  if (!data || data.length === 0) {
    return (
      <div style={{ height: '310px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
        No historical financial trend data recorded.
      </div>
    );
  }

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const incomeVal = payload.find((p) => p.dataKey === 'income')?.value || 0;
      const expenseVal = payload.find((p) => p.dataKey === 'expense')?.value || 0;
      const netSavings = incomeVal - expenseVal;

      return (
        <div
          style={{
            backgroundColor: 'rgba(11, 17, 33, 0.92)',
            backdropFilter: 'blur(16px)',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            borderRadius: '10px',
            padding: '14px 18px',
            boxShadow: '0 12px 30px rgba(0, 0, 0, 0.6)',
            minWidth: '180px',
          }}
        >
          <div style={{ fontSize: '0.875rem', fontWeight: 800, color: '#FFFFFF', marginBottom: '10px', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: '6px' }}>
            {label}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', fontSize: '0.8125rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10B981', boxShadow: '0 0 6px #10B981' }} />
                <span style={{ color: 'var(--text-secondary)' }}>Income:</span>
              </div>
              <span style={{ fontWeight: 700, color: 'var(--text-emerald)' }}>{formatCurrency(incomeVal)}</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', fontSize: '0.8125rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#EF4444', boxShadow: '0 0 6px #EF4444' }} />
                <span style={{ color: 'var(--text-secondary)' }}>Expense:</span>
              </div>
              <span style={{ fontWeight: 700, color: 'var(--text-rose)' }}>{formatCurrency(expenseVal)}</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', fontSize: '0.8125rem', borderTop: '1px solid rgba(255, 255, 255, 0.08)', paddingTop: '6px', marginTop: '2px' }}>
              <span style={{ color: 'var(--text-muted)' }}>Net Savings:</span>
              <span style={{ fontWeight: 700, color: netSavings >= 0 ? '#38BDF8' : 'var(--text-rose)' }}>
                {formatCurrency(netSavings)}
              </span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div style={{ width: '100%', height: '310px' }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.04)" vertical={false} />
          <XAxis
            dataKey="month"
            stroke="#64748B"
            fontSize={12}
            tickLine={false}
            axisLine={{ stroke: 'rgba(255, 255, 255, 0.08)' }}
          />
          <YAxis
            stroke="#64748B"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            tickFormatter={(val) => formatCompactCurrency(val)}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            verticalAlign="top"
            align="right"
            iconType="circle"
            wrapperStyle={{ paddingBottom: '16px', fontSize: '0.75rem' }}
          />
          <Bar dataKey="income" name="Income" fill="#10B981" radius={[6, 6, 0, 0]} maxBarSize={28} />
          <Bar dataKey="expense" name="Expense" fill="#EF4444" radius={[6, 6, 0, 0]} maxBarSize={28} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
