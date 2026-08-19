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
      toast.error('Please select a category.');
      return;
    }

    setIsSubmitting(true);
    try {
      await budgetService.createBudget({
        ...formData,
        month: selectedMonth,
        year: selectedYear,
      });
      toast.success('Budget created successfully');
      setIsAddModalOpen(false);
      fetchBudgets();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create budget');
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
        amount: formData.amount,
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
      toast.success('Budget deleted successfully');
      setIsDeleteModalOpen(false);
      fetchBudgets();
    } catch {
      toast.error('Failed to delete budget');
    } finally {
      setIsSubmitting(false);
    }
  };

  const totalBudget = budgets.reduce((acc, b) => acc + parseFloat(b.amount || 0), 0);
  const totalSpent = budgets.reduce((acc, b) => acc + parseFloat(b.actual_expense || 0), 0);
  const totalRemaining = totalBudget - totalSpent;
  const overallUsage = totalBudget > 0 ? ((totalSpent / totalBudget) * 100).toFixed(1) : 0;

  const years = getYearOptions();

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Top Header */}
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.025em', marginBottom: '4px' }}>
            Budget Planning & Thresholds
          </h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
            Set category limits, monitor utilization in real time, and prevent overspending.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <select
            className="form-select"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(Number(e.target.value))}
            style={{ width: '136px', padding: '9px 12px' }}
          >
            {MONTHS.map((m) => (
              <option key={m.value} value={m.value}>{m.label}</option>
            ))}
          </select>

          <select
            className="form-select"
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            style={{ width: '106px', padding: '9px 12px' }}
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

      {/* Overview KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
        <div className="glass-card" style={{ padding: '18px 22px' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px' }}>Total Monthly Budget</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>{formatCurrency(totalBudget)}</div>
        </div>
        <div className="glass-card" style={{ padding: '18px 22px' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px' }}>Actual Total Spent</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-rose)', letterSpacing: '-0.02em' }}>{formatCurrency(totalSpent)}</div>
        </div>
        <div className="glass-card" style={{ padding: '18px 22px' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px' }}>Remaining Available</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: totalRemaining >= 0 ? 'var(--text-emerald)' : 'var(--text-rose)', letterSpacing: '-0.02em' }}>
            {formatCurrency(totalRemaining)}
          </div>
        </div>
        <div className="glass-card" style={{ padding: '18px 22px' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px' }}>Overall Utilization</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: overallUsage > 100 ? 'var(--text-rose)' : overallUsage >= 80 ? 'var(--text-amber)' : 'var(--text-emerald)', letterSpacing: '-0.02em' }}>
            {overallUsage}%
          </div>
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
            icon={Layers}
            title="No budgets configured for this month"
            description="Create spending limits to track progress and receive automated warning alerts."
            actionText="Set First Budget"
            onAction={handleOpenAdd}
          />
        </div>
      ) : (
        <div className="grid-cols-3">
          {budgets.map((b) => {
            const isOver = b.usage_percentage > 100;
            const isWarning = b.usage_percentage >= parseFloat(b.alert_percentage || 80) && !isOver;
            const remaining = parseFloat(b.remaining_amount || 0);

            const statusColor = isOver ? 'var(--rose)' : isWarning ? 'var(--amber)' : 'var(--emerald)';
            const statusBg = isOver ? 'var(--rose-bg)' : isWarning ? 'var(--amber-bg)' : 'var(--emerald-bg)';
            const statusBorder = isOver ? 'var(--rose-border)' : isWarning ? 'var(--amber-border)' : 'var(--emerald-border)';

            return (
              <div
                key={b.id}
                className="glass-card glass-card-interactive"
                style={{
                  padding: '22px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: '16px',
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span
                        style={{
                          width: '10px',
                          height: '10px',
                          borderRadius: '50%',
                          backgroundColor: b.category.color || '#6366F1',
                        }}
                      />
                      <h3 style={{ fontSize: '1.0625rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                        {b.category.name}
                      </h3>
                    </div>

                    <span
                      className="badge"
                      style={{
                        color: statusColor,
                        backgroundColor: statusBg,
                        border: `1px solid ${statusBorder}`,
                      }}
                    >
                      {isOver ? <XCircle size={12} /> : isWarning ? <AlertTriangle size={12} /> : <CheckCircle2 size={12} />}
                      {b.status}
                    </span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '8px' }}>
                    <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                      {formatCurrency(b.actual_expense)}
                    </div>
                    <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                      Limit: <span style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>{formatCurrency(b.amount)}</span>
                    </div>
                  </div>

                  {/* Progress Meter */}
                  <div
                    style={{
                      width: '100%',
                      height: '8px',
                      backgroundColor: 'rgba(255, 255, 255, 0.06)',
                      borderRadius: 'var(--radius-full)',
                      overflow: 'hidden',
                      marginBottom: '10px',
                      boxShadow: 'inset 0 1px 2px rgba(0, 0, 0, 0.3)',
                    }}
                  >
                    <div
                      style={{
                        height: '100%',
                        width: `${Math.min(b.usage_percentage, 100)}%`,
                        backgroundColor: statusColor,
                        borderRadius: 'var(--radius-full)',
                        boxShadow: `0 0 8px ${statusColor}60`,
                        transition: 'width 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
                      }}
                    />
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    <span>Utilization: <strong style={{ color: statusColor }}>{b.usage_percentage}%</strong></span>
                    <span>
                      {remaining >= 0 ? (
                        <>Remaining: <strong style={{ color: 'var(--text-emerald)' }}>{formatCurrency(remaining)}</strong></>
                      ) : (
                        <>Exceeded by: <strong style={{ color: 'var(--text-rose)' }}>{formatCurrency(Math.abs(remaining))}</strong></>
                      )}
                    </span>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', borderTop: '1px solid var(--border-glass)', paddingTop: '12px' }}>
                  <button
                    className="btn btn-outline"
                    style={{ padding: '4px 10px', fontSize: '0.75rem' }}
                    onClick={() => handleOpenEdit(b)}
                  >
                    <Edit2 size={12} /> Edit Limit
                  </button>
                  <button
                    className="btn btn-danger"
                    style={{ padding: '4px 10px', fontSize: '0.75rem' }}
                    onClick={() => handleOpenDelete(b)}
                  >
                    <Trash2 size={12} /> Remove
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
              placeholder="15000.00"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Alert Warning Threshold (%)</label>
            <select
              className="form-select"
              value={formData.alert_percentage}
              onChange={(e) => setFormData({ ...formData, alert_percentage: e.target.value })}
            >
              <option value="50.00">50% of budget</option>
              <option value="75.00">75% of budget</option>
              <option value="80.00">80% of budget (Recommended)</option>
              <option value="90.00">90% of budget</option>
              <option value="100.00">100% of budget</option>
            </select>
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
      <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Update Budget Limit">
        <form onSubmit={handleEditSubmit}>
          <div className="form-group">
            <label className="form-label">Category</label>
            <input
              type="text"
              className="form-input"
              value={currentBudget?.category?.name || ''}
              disabled
              style={{ opacity: 0.7 }}
            />
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
            <label className="form-label">Alert Warning Threshold (%)</label>
            <select
              className="form-select"
              value={formData.alert_percentage}
              onChange={(e) => setFormData({ ...formData, alert_percentage: e.target.value })}
            >
              <option value="50.00">50% of budget</option>
              <option value="75.00">75% of budget</option>
              <option value="80.00">80% of budget (Recommended)</option>
              <option value="90.00">90% of budget</option>
              <option value="100.00">100% of budget</option>
            </select>
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

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Remove Category Budget"
        message={`Are you sure you want to remove the ${selectedMonth}/${selectedYear} budget for "${currentBudget?.category?.name}"?`}
        confirmText="Remove Budget"
        isLoading={isSubmitting}
      />
    </div>
  );
};
