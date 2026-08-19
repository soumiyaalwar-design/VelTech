import React, { useState, useEffect } from 'react';
import {
  Plus,
  PieChart,
  Edit2,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  TrendingDown,
  Layers,
  Wallet
} from 'lucide-react';
import { budgetService } from '../services/budgetService';
import { categoryService } from '../services/categoryService';
import { useToast } from '../context/ToastContext';
import { Modal } from '../components/common/Modal';
import { ConfirmModal } from '../components/common/ConfirmModal';
import { EmptyState } from '../components/common/EmptyState';
import { SkeletonCard } from '../components/common/SkeletonLoader';
import { formatCurrency } from '../utils/currency';
import { MONTHS, getYearOptions } from '../utils/date';

export const Budgets = () => {
  const toast = useToast();
  const today = new Date();

  const [selectedMonth, setSelectedMonth] = useState(today.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(today.getFullYear());
  const [budgets, setBudgets] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [currentBudget, setCurrentBudget] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form
  const [formData, setFormData] = useState({
    category_id: '',
    amount: '',
    month: selectedMonth,
    year: selectedYear,
    alert_percentage: '80.00',
  });

  const fetchCategories = async () => {
    try {
      const data = await categoryService.getCategories({ type: 'EXPENSE' });
      setCategories(data);
    } catch {
      // Ignore
    }
  };

  const fetchBudgets = async () => {
    setIsLoading(true);
    try {
      const data = await budgetService.getBudgets({
        month: selectedMonth,
        year: selectedYear,
      });
      setBudgets(data);
    } catch {
      toast.error('Failed to load budgets');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchBudgets();
  }, [selectedMonth, selectedYear]);

  const handleOpenAdd = () => {
    setFormData({
      category_id: categories[0]?.id || '',
      amount: '',
      month: selectedMonth,
      year: selectedYear,
      alert_percentage: '80.00',
    });
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (b) => {
    setCurrentBudget(b);
    setFormData({
      category_id: b.category.id,
      amount: b.amount,
      month: b.month,
      year: b.year,
      alert_percentage: b.alert_percentage || '80.00',
    });
    setIsEditModalOpen(true);
  };

  const handleOpenDelete = (b) => {
    setCurrentBudget(b);
    setIsDeleteModalOpen(true);
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      toast.error('Please enter a valid positive budget amount.');
      return;
    }
    if (!formData.category_id) {
      toast.error('Please select an expense category.');
      return;
    }

    setIsSubmitting(true);
    try {
      await budgetService.createBudget({
        category_id: formData.category_id,
        amount: formData.amount,
        month: Number(formData.month),
        year: Number(formData.year),
        alert_percentage: formData.alert_percentage,
      });
      toast.success('Budget created successfully');
      setIsAddModalOpen(false);
      fetchBudgets();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create budget. Check for duplicates.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      toast.error('Please enter a valid positive budget amount.');
      return;
    }

    setIsSubmitting(true);
    try {
      await budgetService.updateBudget(currentBudget.id, {
        category_id: formData.category_id,
        amount: formData.amount,
        month: Number(formData.month),
        year: Number(formData.year),
        alert_percentage: formData.alert_percentage,
      });
      toast.success('Budget updated successfully');
      setIsEditModalOpen(false);
      fetchBudgets();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update budget');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!currentBudget) return;
    setIsSubmitting(true);
    try {
      await budgetService.deleteBudget(currentBudget.id);
      toast.success('Budget removed successfully');
      setIsDeleteModalOpen(false);
      fetchBudgets();
    } catch {
      toast.error('Failed to delete budget');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Summary KPI Calculations
  const totalAllocated = budgets.reduce((acc, curr) => acc + parseFloat(curr.amount || 0), 0);
  const totalSpent = budgets.reduce((acc, curr) => acc + parseFloat(curr.actual_expense || 0), 0);
  const totalRemaining = totalAllocated - totalSpent;
  const overallUsagePct = totalAllocated > 0 ? ((totalSpent / totalAllocated) * 100).toFixed(1) : 0;

  const years = getYearOptions();

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Top Header */}
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em', marginBottom: '4px' }}>
            Budgets & Utilization
          </h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
            Set category-wise monthly limits and monitor live spending against your targets.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <select
            className="form-select"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(Number(e.target.value))}
            style={{ width: '130px', padding: '8px 12px' }}
          >
            {MONTHS.map((m) => (
              <option key={m.value} value={m.value}>{m.label}</option>
            ))}
          </select>

          <select
            className="form-select"
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            style={{ width: '100px', padding: '8px 12px' }}
          >
            {years.map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>

          <button type="button" className="btn btn-primary" onClick={handleOpenAdd}>
            <Plus size={18} />
            Set Budget
          </button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
        <div className="glass-card" style={{ padding: '18px 20px' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '4px' }}>Total Allocated Limit</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)' }}>{formatCurrency(totalAllocated)}</div>
        </div>

        <div className="glass-card" style={{ padding: '18px 20px' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '4px' }}>Actual Spending</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--rose)' }}>{formatCurrency(totalSpent)}</div>
        </div>

        <div className="glass-card" style={{ padding: '18px 20px' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '4px' }}>Remaining Buffer</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: totalRemaining >= 0 ? 'var(--emerald)' : 'var(--rose)' }}>
            {formatCurrency(totalRemaining)}
          </div>
        </div>

        <div className="glass-card" style={{ padding: '18px 20px' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '4px' }}>Overall Utilization</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#38BDF8' }}>{overallUsagePct}%</div>
        </div>
      </div>

      {/* Budgets Grid */}
      {isLoading ? (
        <div className="grid-cols-3">
          <SkeletonCard height="180px" />
          <SkeletonCard height="180px" />
          <SkeletonCard height="180px" />
        </div>
      ) : budgets.length === 0 ? (
        <div className="glass-card">
          <EmptyState
            icon={PieChart}
            title="No budgets configured for this month"
            description="Create category budgets to gain spending visibility and avoid exceeding limits."
            actionText="Create Budget"
            onAction={handleOpenAdd}
          />
        </div>
      ) : (
        <div className="grid-cols-3">
          {budgets.map((b) => {
            const isOver = b.usage_percentage > 100;
            const isWarning = b.usage_percentage >= (parseFloat(b.alert_percentage) || 80) && !isOver;

            return (
              <div
                key={b.id}
                className="glass-card"
                style={{
                  padding: '22px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: '16px',
                  borderTop: `4px solid ${
                    isOver ? 'var(--rose)' : isWarning ? 'var(--amber)' : 'var(--emerald)'
                  }`,
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span
                        style={{
                          width: '12px',
                          height: '12px',
                          borderRadius: '50%',
                          backgroundColor: b.category?.color || '#6366F1',
                        }}
                      />
                      <h4 style={{ fontSize: '1.0625rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                        {b.category.name}
                      </h4>
                    </div>

                    <span
                      className="badge"
                      style={{
                        backgroundColor: isOver ? 'rgba(239, 68, 68, 0.15)' : isWarning ? 'rgba(245, 158, 11, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                        color: isOver ? '#F87171' : isWarning ? '#FBBF24' : '#34D399',
                      }}
                    >
                      {isOver ? <XCircle size={12} /> : isWarning ? <AlertTriangle size={12} /> : <CheckCircle2 size={12} />}
                      {b.status}
                    </span>
                  </div>

                  {/* Financials comparison */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>Spent</span>
                    <span style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                      {formatCurrency(b.actual_expense)}
                    </span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '14px' }}>
                    <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>Limit</span>
                    <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                      {formatCurrency(b.amount)}
                    </span>
                  </div>

                  {/* Progress bar */}
                  <div style={{ width: '100%', height: '8px', backgroundColor: '#0E1626', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
                    <div
                      style={{
                        height: '100%',
                        width: `${Math.min(b.usage_percentage, 100)}%`,
                        backgroundColor: isOver ? 'var(--rose)' : isWarning ? 'var(--amber)' : 'var(--emerald)',
                        borderRadius: 'var(--radius-full)',
                        transition: 'width 0.4s ease',
                      }}
                    />
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    <span>{b.usage_percentage}% utilized</span>
                    <span>
                      {parseFloat(b.remaining_amount) >= 0 ? `${formatCurrency(b.remaining_amount)} left` : `${formatCurrency(Math.abs(b.remaining_amount))} over`}
                    </span>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px', borderTop: '1px solid var(--border-subtle)', paddingTop: '12px' }}>
                  <button
                    className="btn btn-outline"
                    style={{ padding: '6px' }}
                    onClick={() => handleOpenEdit(b)}
                    title="Edit Budget"
                  >
                    <Edit2 size={14} />
                  </button>
                  <button
                    className="btn btn-danger"
                    style={{ padding: '6px' }}
                    onClick={() => handleOpenDelete(b)}
                    title="Delete Budget"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Budget Modal */}
      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Set Category Budget">
        <form onSubmit={handleAddSubmit}>
          <div className="form-group">
            <label className="form-label">Expense Category *</label>
            <select
              className="form-select"
              value={formData.category_id}
              onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
              required
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Monthly Limit (INR) *</label>
            <input
              type="number"
              step="0.01"
              min="0.01"
              className="form-input"
              placeholder="5000.00"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div className="form-group">
              <label className="form-label">Month *</label>
              <select
                className="form-select"
                value={formData.month}
                onChange={(e) => setFormData({ ...formData, month: Number(e.target.value) })}
              >
                {MONTHS.map((m) => (
                  <option key={m.value} value={m.value}>{m.label}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Year *</label>
              <select
                className="form-select"
                value={formData.year}
                onChange={(e) => setFormData({ ...formData, year: Number(e.target.value) })}
              >
                {years.map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Alert Threshold (%)</label>
            <input
              type="number"
              step="1"
              min="1"
              max="100"
              className="form-input"
              value={formData.alert_percentage}
              onChange={(e) => setFormData({ ...formData, alert_percentage: e.target.value })}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : 'Set Budget'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit Budget Modal */}
      <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Edit Budget Limit">
        <form onSubmit={handleEditSubmit}>
          <div className="form-group">
            <label className="form-label">Category *</label>
            <select
              className="form-select"
              value={formData.category_id}
              onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
              required
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Monthly Limit (INR) *</label>
            <input
              type="number"
              step="0.01"
              min="0.01"
              className="form-input"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Alert Threshold (%)</label>
            <input
              type="number"
              step="1"
              min="1"
              max="100"
              className="form-input"
              value={formData.alert_percentage}
              onChange={(e) => setFormData({ ...formData, alert_percentage: e.target.value })}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsEditModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
              {isSubmitting ? 'Updating...' : 'Update Budget'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Budget Confirmation */}
      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Budget Target"
        message={`Are you sure you want to remove the budget for '${currentBudget?.category?.name}'?`}
        isLoading={isSubmitting}
      />
    </div>
  );
};
