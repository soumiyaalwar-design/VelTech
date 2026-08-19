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

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Top Header & Export Buttons */}
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em', marginBottom: '4px' }}>
            Financial Reports
          </h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
            Consolidated statement of income, expenses, net savings, and structured workbook exports.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={handleExportCSV}
            disabled={isExportingCSV}
          >
            <Download size={16} />
            {isExportingCSV ? 'Generating CSV...' : 'Export CSV'}
          </button>

          <button
            type="button"
            className="btn btn-primary"
            onClick={handleExportExcel}
            disabled={isExportingExcel}
          >
            <FileSpreadsheet size={16} />
            {isExportingExcel ? 'Building Excel...' : 'Export Excel'}
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="glass-card" style={{ padding: '16px 20px', display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center' }}>
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
          <option value="">All Transaction Types</option>
          <option value="INCOME">Income Only</option>
          <option value="EXPENSE">Expense Only</option>
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

      {/* Report KPI Metrics */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
        <div className="glass-card" style={{ padding: '18px 20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>Total Income</span>
            <div style={{ padding: '6px', borderRadius: '8px', background: 'var(--emerald-bg)', color: 'var(--emerald)' }}>
              <TrendingUp size={16} />
            </div>
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--emerald)' }}>
            {formatCurrency(reportData?.total_income || '0.00')}
          </div>
        </div>

        <div className="glass-card" style={{ padding: '18px 20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>Total Expense</span>
            <div style={{ padding: '6px', borderRadius: '8px', background: 'var(--rose-bg)', color: 'var(--rose)' }}>
              <TrendingDown size={16} />
            </div>
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--rose)' }}>
            {formatCurrency(reportData?.total_expense || '0.00')}
          </div>
        </div>

        <div className="glass-card" style={{ padding: '18px 20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>Net Balance</span>
            <div style={{ padding: '6px', borderRadius: '8px', background: 'rgba(56, 189, 248, 0.15)', color: '#38BDF8' }}>
              <Wallet size={16} />
            </div>
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: Number(reportData?.net_balance) >= 0 ? '#38BDF8' : 'var(--rose)' }}>
            {formatCurrency(reportData?.net_balance || '0.00')}
          </div>
        </div>

        <div className="glass-card" style={{ padding: '18px 20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>Total Records</span>
            <div style={{ padding: '6px', borderRadius: '8px', background: 'rgba(99, 102, 241, 0.15)', color: 'var(--indigo)' }}>
              <Calendar size={16} />
            </div>
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            {reportData?.count || 0}
          </div>
        </div>
      </div>

      {/* Transactions Table */}
      {isLoading ? (
        <SkeletonTable rows={8} />
      ) : !reportData?.transactions || reportData.transactions.length === 0 ? (
        <div className="glass-card">
          <EmptyState
            icon={FileText}
            title="No records matching report filters"
            description="Adjust your month, year, or category selection to view transactions."
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
                <th style={{ textAlign: 'right' }}>Amount</th>
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
                  <td>{tx.category}</td>
                  <td>{tx.description || '—'}</td>
                  <td>
                    <span className="badge badge-neutral">
                      <CreditCard size={12} />
                      {tx.payment_method}
                    </span>
                  </td>
                  <td
                    style={{
                      textAlign: 'right',
                      fontWeight: 700,
                      color: tx.type === 'INCOME' ? 'var(--emerald)' : 'var(--rose)',
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
