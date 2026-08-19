import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  PieChart as PieIcon,
  BarChart3,
  Layers,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { dashboardService } from '../services/dashboardService';
import { useAuth } from '../context/AuthContext';
import { StatCard } from '../components/common/StatCard';
import { CategoryPieChart } from '../components/charts/CategoryPieChart';
import { MonthlyBarChart } from '../components/charts/MonthlyBarChart';
import { BudgetProgressBar } from '../components/charts/BudgetProgressBar';
import { SkeletonCard } from '../components/common/SkeletonLoader';
import { EmptyState } from '../components/common/EmptyState';
import { formatCurrency } from '../utils/currency';
import { formatDate, MONTHS, getYearOptions } from '../utils/date';

export const Dashboard = () => {
  const { user } = useAuth();
  const today = new Date();

  const [selectedMonth, setSelectedMonth] = useState(today.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(today.getFullYear());
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchDashboard = async () => {
    setIsLoading(true);
    try {
      const summary = await dashboardService.getDashboardSummary({
        month: selectedMonth,
        year: selectedYear,
      });
      setData(summary);
    } catch {
      // Handle gracefully
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, [selectedMonth, selectedYear]);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const years = getYearOptions();

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      {/* Header & Filter Controls */}
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '18px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.03em' }}>
              {getGreeting()}, {user?.first_name || 'there'} 👋
            </h2>
          </div>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
            Real-time cashflow intelligence, spending trends, and active budget tracking.
          </p>
        </div>

        {/* Month & Year Selectors */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <select
            className="form-select"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(Number(e.target.value))}
            style={{ width: '136px', padding: '9px 12px' }}
          >
            {MONTHS.map((m) => (
              <option key={m.value} value={m.value}>
                {m.label}
              </option>
            ))}
          </select>

          <select
            className="form-select"
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            style={{ width: '106px', padding: '9px 12px' }}
          >
            {years.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>

          <button
            onClick={fetchDashboard}
            className="btn btn-secondary"
            style={{ padding: '9px 12px' }}
            title="Refresh Data"
          >
            <RefreshCw size={16} className={isLoading ? 'animate-pulse-glow' : ''} />
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      {isLoading && !data ? (
        <div className="grid-cols-4">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      ) : (
        <div className="grid-cols-4">
          <StatCard
            title="Total Income"
            amount={data?.total_income || '0.00'}
            icon={TrendingUp}
            iconColor="#10B981"
            iconBg="rgba(16, 185, 129, 0.14)"
            trendText="All-time accumulated earnings"
            trendType="positive"
          />
          <StatCard
            title="Total Expense"
            amount={data?.total_expense || '0.00'}
            icon={TrendingDown}
            iconColor="#EF4444"
            iconBg="rgba(239, 68, 68, 0.14)"
            trendText="All-time recorded spend"
            trendType="negative"
          />
          <StatCard
            title="Net Balance"
            amount={data?.balance || '0.00'}
            icon={Wallet}
            iconColor="#38BDF8"
            iconBg="rgba(56, 189, 248, 0.14)"
            trendText={Number(data?.balance) >= 0 ? 'Positive Net Reserve' : 'Deficit Reserve'}
            trendType={Number(data?.balance) >= 0 ? 'positive' : 'negative'}
          />
          <StatCard
            title="This Month Expense"
            amount={data?.monthly_expense || '0.00'}
            icon={Calendar}
            iconColor="#F59E0B"
            iconBg="rgba(245, 158, 11, 0.14)"
            trendText={`Savings Rate: ${data?.savings_rate || 0}%`}
            trendType={data?.savings_rate > 20 ? 'positive' : 'neutral'}
          />
        </div>
      )}

      {/* Visual Charts Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '20px' }}>
        {/* Income vs Expense Bar Chart */}
        <div className="glass-card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '9px',
                  background: 'rgba(99, 102, 241, 0.14)',
                  border: '1px solid rgba(99, 102, 241, 0.3)',
                  color: 'var(--indigo)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <BarChart3 size={17} />
              </div>
              <div>
                <h3 style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  6-Month Cashflow Trend
                </h3>
                <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>Income vs Expenses overview</span>
              </div>
            </div>
          </div>
          <MonthlyBarChart data={data?.monthly_summary || []} />
        </div>

        {/* Category Expense Donut Chart */}
        <div className="glass-card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '9px',
                  background: 'rgba(239, 68, 68, 0.14)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  color: 'var(--rose)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <PieIcon size={17} />
              </div>
              <div>
                <h3 style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  Category Expense Breakdown
                </h3>
                <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>Distribution of expenditures</span>
              </div>
            </div>
          </div>
          <CategoryPieChart data={data?.category_expenses || []} />
        </div>
      </div>

      {/* Active Budgets & Recent Transactions Bottom Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '20px' }}>
        {/* Monthly Budget Summary */}
        <div className="glass-card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '9px',
                  background: 'rgba(16, 185, 129, 0.14)',
                  border: '1px solid rgba(16, 185, 129, 0.3)',
                  color: 'var(--emerald)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Layers size={17} />
              </div>
              <div>
                <h3 style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  Active Budget Thresholds
                </h3>
                <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>Target limits for selected month</span>
              </div>
            </div>
            <Link to="/budgets" className="btn btn-outline" style={{ padding: '5px 12px', fontSize: '0.75rem' }}>
              Manage
            </Link>
          </div>

          {!data?.budget_summary || data.budget_summary.length === 0 ? (
            <EmptyState
              title="No active budgets for this month"
              description="Configure category budgets to monitor utilization and avoid overspending."
              actionText="Set Budget"
              onAction={() => window.location.href = '/budgets'}
            />
          ) : (
            <div>
              {data.budget_summary.map((b) => (
                <BudgetProgressBar
                  key={b.id}
                  category={b.category.name}
                  budgetAmount={b.amount}
                  spentAmount={b.actual_expense}
                  usagePercentage={b.usage_percentage}
                  status={b.status}
                />
              ))}
            </div>
          )}
        </div>

        {/* Recent Transactions List */}
        <div className="glass-card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
            <div>
              <h3 style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                Recent Activity
              </h3>
              <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>Latest logged income & expenses</span>
            </div>
            <Link to="/expenses" className="btn btn-outline" style={{ padding: '5px 12px', fontSize: '0.75rem' }}>
              View All
            </Link>
          </div>

          {!data?.recent_transactions || data.recent_transactions.length === 0 ? (
            <EmptyState
              title="No transactions recorded"
              description="Add your first expense or income entry to see your activity feed."
            />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {data.recent_transactions.map((tx) => (
                <div
                  key={tx.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 14px',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'rgba(255, 255, 255, 0.02)',
                    border: '1px solid var(--border-glass)',
                    transition: 'all 0.2s ease',
                  }}
                  className="glass-card-interactive"
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div
                      style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '10px',
                        backgroundColor: tx.type === 'INCOME' ? 'rgba(16, 185, 129, 0.12)' : 'rgba(239, 68, 68, 0.12)',
                        border: `1px solid ${tx.type === 'INCOME' ? 'rgba(16, 185, 129, 0.25)' : 'rgba(239, 68, 68, 0.25)'}`,
                        color: tx.type === 'INCOME' ? 'var(--emerald)' : 'var(--rose)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: `0 2px 8px ${tx.type === 'INCOME' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)'}`,
                      }}
                    >
                      {tx.type === 'INCOME' ? <ArrowDownRight size={18} /> : <ArrowUpRight size={18} />}
                    </div>
                    <div>
                      <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                        {tx.description || tx.category}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        <span style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>{tx.category}</span> • {formatDate(tx.date)}
                      </div>
                    </div>
                  </div>

                  <div
                    style={{
                      fontSize: '0.9375rem',
                      fontWeight: 800,
                      color: tx.type === 'INCOME' ? 'var(--text-emerald)' : 'var(--text-rose)',
                      letterSpacing: '-0.01em',
                    }}
                  >
                    {tx.type === 'INCOME' ? '+' : '-'} {formatCurrency(tx.amount)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
