import React, { useState, useEffect } from 'react';
import {
  FileSpreadsheet,
  Download,
  Filter,
  TrendingUp,
  TrendingDown,
  Wallet,
  Calendar,
  FileText,
  CreditCard,
  Tag
} from 'lucide-react';
import { reportService } from '../services/reportService';
import { categoryService } from '../services/categoryService';
import { useToast } from '../context/ToastContext';
import { EmptyState } from '../components/common/EmptyState';
import { SkeletonTable } from '../components/common/SkeletonLoader';
import { formatCurrency } from '../utils/currency';
import { formatDate, MONTHS, getYearOptions } from '../utils/date';

export const Reports = () => {
  const toast = useToast();
  const today = new Date();

  const [selectedMonth, setSelectedMonth] = useState(today.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(today.getFullYear());
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedType, setSelectedType] = useState(''); // '', 'EXPENSE', 'INCOME'

  const [reportData, setReportData] = useState(null);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isExportingCSV, setIsExportingCSV] = useState(false);
  const [isExportingExcel, setIsExportingExcel] = useState(false);

  const fetchCategories = async () => {
    try {
      const data = await categoryService.getCategories();
      setCategories(data);
    } catch {
      // Ignore
    }
  };

  const fetchReport = async () => {
    setIsLoading(true);
    try {
      const params = {};
      if (selectedMonth) params.month = selectedMonth;
      if (selectedYear) params.year = selectedYear;
      if (selectedCategory) params.category = selectedCategory;
      if (selectedType) params.type = selectedType;

      const data = await reportService.getReportSummary(params);
      setReportData(data);
    } catch {
      toast.error('Failed to load report summary');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchReport();
  }, [selectedMonth, selectedYear, selectedCategory, selectedType]);

  const handleExportCSV = async () => {
    setIsExportingCSV(true);
    try {
      const params = {};
      if (selectedMonth) params.month = selectedMonth;
      if (selectedYear) params.year = selectedYear;
      if (selectedCategory) params.category = selectedCategory;
      if (selectedType) params.type = selectedType;

      await reportService.downloadCSV(params);
      toast.success('CSV Report downloaded successfully');
    } catch {
      toast.error('Failed to export CSV report');
    } finally {
      setIsExportingCSV(false);
    }
  };

  const handleExportExcel = async () => {
    setIsExportingExcel(true);
    try {
      const params = {};
      if (selectedMonth) params.month = selectedMonth;
      if (selectedYear) params.year = selectedYear;
      if (selectedCategory) params.category = selectedCategory;
      if (selectedType) params.type = selectedType;

      await reportService.downloadExcel(params);
      toast.success('Excel Report downloaded successfully');
    } catch {
      toast.error('Failed to export Excel report');
    } finally {
      setIsExportingExcel(false);
    }
  };

  const years = getYearOptions();

  // Dynamic calculations from the canonical filtered dataset
  const totalIncome = parseFloat(reportData?.total_income || 0);
  const totalExpense = parseFloat(reportData?.total_expense || 0);
  const netSavings = reportData?.net_savings !== undefined
    ? parseFloat(reportData.net_savings)
    : (reportData?.net_balance !== undefined ? parseFloat(reportData.net_balance) : (totalIncome - totalExpense));
  const transactionCount = reportData?.transaction_count !== undefined
    ? reportData.transaction_count
    : (reportData?.count !== undefined ? reportData.count : (reportData?.transactions?.length || 0));

  const formatTransactionCount = (count) => {
    if (count === 1) return '1 entry';
    return `${count} entries`;
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Top Header */}
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.025em', marginBottom: '4px' }}>
            Financial Reports & Export
          </h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
            Filter consolidated cashflow statements and generate styled CSV or native Excel spreadsheets.
          </p>
        </div>

        {/* Export Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={handleExportCSV}
            disabled={isExportingCSV || isLoading}
          >
            <Download size={16} />
            {isExportingCSV ? 'Generating CSV...' : 'Export CSV'}
          </button>

          <button
            type="button"
            className="btn btn-primary"
            onClick={handleExportExcel}
            disabled={isExportingExcel || isLoading}
          >
            <FileSpreadsheet size={16} />
            {isExportingExcel ? 'Generating Excel...' : 'Export Excel (.xlsx)'}
          </button>
        </div>
      </div>

      {/* Filter Controls */}
      <div className="glass-card" style={{ padding: '18px 22px', display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center' }}>
        <select
          className="form-select"
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value ? Number(e.target.value) : '')}
          style={{ flex: '1 1 140px' }}
        >
          <option value="">All Months</option>
          {MONTHS.map((m) => (
            <option key={m.value} value={m.value}>{m.label}</option>
          ))}
        </select>

        <select
          className="form-select"
          value={selectedYear}
          onChange={(e) => setSelectedYear(e.target.value ? Number(e.target.value) : '')}
          style={{ flex: '1 1 120px' }}
        >
          <option value="">All Years</option>
          {years.map((y) => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>

        <select
          className="form-select"
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value)}
          style={{ flex: '1 1 150px' }}
        >
          <option value="">All Types (Income & Expenses)</option>
          <option value="INCOME">Income Only</option>
          <option value="EXPENSE">Expenses Only</option>
        </select>

        <select
          className="form-select"
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          style={{ flex: '1 1 160px' }}
        >
          <option value="">All Categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>

      {/* Metrics Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
        <div className="glass-card" style={{ padding: '18px 22px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>Filtered Income</span>
            <TrendingUp size={18} color="var(--emerald)" />
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-emerald)', letterSpacing: '-0.02em' }}>
            {formatCurrency(totalIncome)}
          </div>
        </div>

        <div className="glass-card" style={{ padding: '18px 22px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>Filtered Expense</span>
            <TrendingDown size={18} color="var(--rose)" />
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-rose)', letterSpacing: '-0.02em' }}>
            {formatCurrency(totalExpense)}
          </div>
        </div>

        <div className="glass-card" style={{ padding: '18px 22px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>Net Period Savings</span>
            <Wallet size={18} color="var(--cyan)" />
          </div>
          <div
            style={{
              fontSize: '1.5rem',
              fontWeight: 800,
              color: netSavings > 0 ? 'var(--text-emerald)' : netSavings < 0 ? 'var(--text-rose)' : 'var(--text-secondary)',
              letterSpacing: '-0.02em',
            }}
          >
            {formatCurrency(netSavings)}
          </div>
        </div>

        <div className="glass-card" style={{ padding: '18px 22px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>Total Transactions</span>
            <FileText size={18} color="var(--text-secondary)" />
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
            {formatTransactionCount(transactionCount)}
          </div>
        </div>
      </div>

      {/* Transactions Summary Table */}
      {isLoading ? (
        <SkeletonTable rows={8} />
      ) : !reportData?.transactions || reportData.transactions.length === 0 ? (
        <div className="glass-card">
          <EmptyState
            icon={FileSpreadsheet}
            title="No transactions found for the selected filters."
            description="Try adjusting your month, year, transaction type, or category selection."
          />
        </div>
      ) : (
        <div className="glass-card table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Type</th>
                <th>Category</th>
                <th>Description</th>
                <th>Payment Method</th>
                <th>Amount (INR)</th>
              </tr>
            </thead>
            <tbody>
              {reportData.transactions.map((tx) => (
                <tr key={`${tx.type}-${tx.id}`}>
                  <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                    {formatDate(tx.date)}
                  </td>
                  <td>
                    <span className={`badge ${tx.type === 'INCOME' ? 'badge-income' : 'badge-expense'}`}>
                      {tx.type}
                    </span>
                  </td>
                  <td>
                    <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                      {tx.category}
                    </span>
                  </td>
                  <td>{tx.description || '—'}</td>
                  <td>
                    <span className="badge badge-neutral">
                      <CreditCard size={12} />
                      {tx.payment_method}
                    </span>
                  </td>
                  <td
                    style={{
                      fontWeight: 700,
                      color: tx.type === 'INCOME' ? 'var(--text-emerald)' : 'var(--text-rose)',
                      letterSpacing: '-0.01em',
                    }}
                  >
                    {tx.type === 'INCOME' ? '+' : '-'} {formatCurrency(tx.amount)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
