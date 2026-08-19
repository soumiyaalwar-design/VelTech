import React, { useState, useEffect } from 'react';
import {
  Plus,
  Search,
  Filter,
  Trash2,
  Edit2,
  Calendar,
  CreditCard,
  Tag,
  ArrowUpCircle,
  FileText
} from 'lucide-react';
import { incomeService } from '../services/incomeService';
import { categoryService } from '../services/categoryService';
import { useToast } from '../context/ToastContext';
import { Modal } from '../components/common/Modal';
import { ConfirmModal } from '../components/common/ConfirmModal';
import { EmptyState } from '../components/common/EmptyState';
import { SkeletonTable } from '../components/common/SkeletonLoader';
import { formatCurrency } from '../utils/currency';
import { formatDate, getTodayDateString } from '../utils/date';

export const Income = () => {
  const toast = useToast();

  const [incomes, setIncomes] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [currentIncome, setCurrentIncome] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form data
  const [formData, setFormData] = useState({
    category_id: '',
    amount: '',
    date: getTodayDateString(),
    payment_method: 'BANK_TRANSFER',
    description: '',
    notes: '',
  });

  const fetchCategories = async () => {
    try {
      const data = await categoryService.getCategories({ type: 'INCOME' });
      setCategories(data);
      if (data.length > 0 && !formData.category_id) {
        setFormData((prev) => ({ ...prev, category_id: data[0].id }));
      }
    } catch {
      // Ignore
    }
  };

  const fetchIncomes = async () => {
    setIsLoading(true);
    try {
      const params = {};
      if (search.trim()) params.search = search.trim();
      if (selectedCategory) params.category = selectedCategory;
      if (selectedPaymentMethod) params.payment_method = selectedPaymentMethod;
      if (startDate) params.start_date = startDate;
      if (endDate) params.end_date = endDate;

      const data = await incomeService.getIncome(params);
      const list = Array.isArray(data) ? data : data?.results || [];
      setIncomes(list);
    } catch {
      toast.error('Failed to load income records');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchIncomes();
    }, 250);
    return () => clearTimeout(delayDebounce);
  }, [search, selectedCategory, selectedPaymentMethod, startDate, endDate]);

  const handleOpenAdd = () => {
    setFormData({
      category_id: categories[0]?.id || '',
      amount: '',
      date: getTodayDateString(),
      payment_method: 'BANK_TRANSFER',
      description: '',
      notes: '',
    });
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (inc) => {
    setCurrentIncome(inc);
    setFormData({
      category_id: inc.category.id,
      amount: inc.amount,
      date: inc.date,
      payment_method: inc.payment_method,
      description: inc.description || '',
      notes: inc.notes || '',
    });
    setIsEditModalOpen(true);
  };

  const handleOpenDelete = (inc) => {
    setCurrentIncome(inc);
    setIsDeleteModalOpen(true);
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      toast.error('Please enter a valid positive amount.');
      return;
    }
    if (!formData.category_id) {
      toast.error('Please select an income category.');
      return;
    }

    setIsSubmitting(true);
    try {
      await incomeService.createIncome(formData);
      toast.success('Income recorded successfully');
      setIsAddModalOpen(false);
      fetchIncomes();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to record income');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      toast.error('Please enter a valid positive amount.');
      return;
    }

    setIsSubmitting(true);
    try {
      await incomeService.updateIncome(currentIncome.id, formData);
      toast.success('Income updated successfully');
      setIsEditModalOpen(false);
      fetchIncomes();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update income');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!currentIncome) return;
    setIsSubmitting(true);
    try {
      await incomeService.deleteIncome(currentIncome.id);
      toast.success('Income deleted successfully');
      setIsDeleteModalOpen(false);
      fetchIncomes();
    } catch {
      toast.error('Failed to delete income');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Summary Metrics
  const totalAmount = incomes.reduce((acc, curr) => acc + parseFloat(curr.amount || 0), 0);
  const avgAmount = incomes.length > 0 ? totalAmount / incomes.length : 0;

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Top Header */}
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.025em', marginBottom: '4px' }}>
            Income Tracking
          </h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
            Record salary, freelance deposits, investment returns, and revenue sources.
          </p>
        </div>

        <button type="button" className="btn btn-primary" onClick={handleOpenAdd}>
          <Plus size={18} />
          Add Income
        </button>
      </div>

      {/* Summary KPI Mini Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
        <div className="glass-card" style={{ padding: '18px 22px' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px' }}>Total Filtered Income</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-emerald)', letterSpacing: '-0.02em' }}>{formatCurrency(totalAmount)}</div>
        </div>
        <div className="glass-card" style={{ padding: '18px 22px' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px' }}>Deposits Count</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>{incomes.length}</div>
        </div>
        <div className="glass-card" style={{ padding: '18px 22px' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px' }}>Average Deposit</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-cyan)', letterSpacing: '-0.02em' }}>{formatCurrency(avgAmount)}</div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="glass-card" style={{ padding: '16px 20px', display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center' }}>
        <div style={{ flex: '1 1 220px', position: 'relative' }}>
          <input
            type="text"
            className="form-input"
            placeholder="Search description..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ paddingLeft: '38px' }}
          />
          <Search size={16} style={{ position: 'absolute', left: '13px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
        </div>

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

        <select
          className="form-select"
          value={selectedPaymentMethod}
          onChange={(e) => setSelectedPaymentMethod(e.target.value)}
          style={{ flex: '1 1 160px' }}
        >
          <option value="">All Payment Methods</option>
          <option value="BANK_TRANSFER">Bank Transfer</option>
          <option value="UPI">UPI</option>
          <option value="CARD">Card</option>
          <option value="CASH">Cash</option>
          <option value="OTHER">Other</option>
        </select>

        <input
          type="date"
          className="form-input"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          style={{ flex: '1 1 140px' }}
          placeholder="Start Date"
        />

        <input
          type="date"
          className="form-input"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          style={{ flex: '1 1 140px' }}
          placeholder="End Date"
        />
      </div>

      {/* Income Table */}
      {isLoading ? (
        <SkeletonTable rows={6} />
      ) : incomes.length === 0 ? (
        <div className="glass-card">
          <EmptyState
            icon={ArrowUpCircle}
            title="No income records found"
            description="You haven't recorded any income entries matching the current filters."
            actionText="Record First Income"
            onAction={handleOpenAdd}
          />
        </div>
      ) : (
        <div className="glass-card table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Category</th>
                <th>Description</th>
                <th>Payment Method</th>
                <th>Amount</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {incomes.map((inc) => (
                <tr key={inc.id}>
                  <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                    {formatDate(inc.date)}
                  </td>
                  <td>
                    <span
                      className="badge"
                      style={{
                        backgroundColor: `${inc.category?.color || '#10B981'}18`,
                        color: inc.category?.color || '#10B981',
                        border: `1px solid ${inc.category?.color || '#10B981'}35`,
                      }}
                    >
                      <Tag size={12} />
                      {inc.category?.name}
                    </span>
                  </td>
                  <td>{inc.description || '—'}</td>
                  <td>
                    <span className="badge badge-neutral">
                      <CreditCard size={12} />
                      {inc.payment_method}
                    </span>
                  </td>
                  <td style={{ fontWeight: 700, color: 'var(--text-emerald)', letterSpacing: '-0.01em' }}>
                    +{formatCurrency(inc.amount)}
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: '8px' }}>
                      <button
                        className="btn btn-outline"
                        style={{ padding: '6px 8px' }}
                        onClick={() => handleOpenEdit(inc)}
                        title="Edit Income"
                        aria-label="Edit Income"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        className="btn btn-danger"
                        style={{ padding: '6px 8px' }}
                        onClick={() => handleOpenDelete(inc)}
                        title="Delete Income"
                        aria-label="Delete Income"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add Income Modal */}
      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Record New Income">
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

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div className="form-group">
              <label className="form-label">Amount (INR) *</label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                className="form-input"
                placeholder="50000.00"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Date *</label>
              <input
                type="date"
                className="form-input"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Payment Method</label>
            <select
              className="form-select"
              value={formData.payment_method}
              onChange={(e) => setFormData({ ...formData, payment_method: e.target.value })}
            >
              <option value="BANK_TRANSFER">Bank Transfer</option>
              <option value="UPI">UPI</option>
              <option value="CARD">Credit / Debit Card</option>
              <option value="CASH">Cash</option>
              <option value="OTHER">Other</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Description</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Monthly Salary, Freelance project"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Notes (Optional)</label>
            <textarea
              className="form-textarea"
              rows={2}
              placeholder="Tax deduction or bonus remarks"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : 'Record Income'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit Income Modal */}
      <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Edit Income">
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

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div className="form-group">
              <label className="form-label">Amount (INR) *</label>
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
              <label className="form-label">Date *</label>
              <input
                type="date"
                className="form-input"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Payment Method</label>
            <select
              className="form-select"
              value={formData.payment_method}
              onChange={(e) => setFormData({ ...formData, payment_method: e.target.value })}
            >
              <option value="BANK_TRANSFER">Bank Transfer</option>
              <option value="UPI">UPI</option>
              <option value="CARD">Credit / Debit Card</option>
              <option value="CASH">Cash</option>
              <option value="OTHER">Other</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Description</label>
            <input
              type="text"
              className="form-input"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Notes (Optional)</label>
            <textarea
              className="form-textarea"
              rows={2}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsEditModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
              {isSubmitting ? 'Updating...' : 'Update Income'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Income Record"
        message={`Are you sure you want to permanently delete the income entry of ${formatCurrency(currentIncome?.amount || 0)} for "${currentIncome?.description || currentIncome?.category?.name}"?`}
        confirmText="Delete Record"
        isLoading={isSubmitting}
      />
    </div>
  );
};
