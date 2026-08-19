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
  ArrowDownCircle,
  FileText
} from 'lucide-react';
import { expenseService } from '../services/expenseService';
import { categoryService } from '../services/categoryService';
import { useToast } from '../context/ToastContext';
import { Modal } from '../components/common/Modal';
import { ConfirmModal } from '../components/common/ConfirmModal';
import { EmptyState } from '../components/common/EmptyState';
import { SkeletonTable } from '../components/common/SkeletonLoader';
import { formatCurrency } from '../utils/currency';
import { formatDate, getTodayDateString } from '../utils/date';

export const Expenses = () => {
  const toast = useToast();

  const [expenses, setExpenses] = useState([]);
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
  const [currentExpense, setCurrentExpense] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form data
  const [formData, setFormData] = useState({
    category_id: '',
    amount: '',
    date: getTodayDateString(),
    payment_method: 'UPI',
    description: '',
    notes: '',
  });

  const fetchCategories = async () => {
    try {
      const data = await categoryService.getCategories({ type: 'EXPENSE' });
      setCategories(data);
      if (data.length > 0 && !formData.category_id) {
        setFormData((prev) => ({ ...prev, category_id: data[0].id }));
      }
    } catch {
      // Ignore
    }
  };

  const fetchExpenses = async () => {
    setIsLoading(true);
    try {
      const params = {};
      if (search.trim()) params.search = search.trim();
      if (selectedCategory) params.category = selectedCategory;
      if (selectedPaymentMethod) params.payment_method = selectedPaymentMethod;
      if (startDate) params.start_date = startDate;
      if (endDate) params.end_date = endDate;

      const data = await expenseService.getExpenses(params);
      // Handle array or paginated results
      const list = Array.isArray(data) ? data : data?.results || [];
      setExpenses(list);
    } catch {
      toast.error('Failed to load expense records');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchExpenses();
    }, 250);
    return () => clearTimeout(delayDebounce);
  }, [search, selectedCategory, selectedPaymentMethod, startDate, endDate]);

  const handleOpenAdd = () => {
    setFormData({
      category_id: categories[0]?.id || '',
      amount: '',
      date: getTodayDateString(),
      payment_method: 'UPI',
      description: '',
      notes: '',
    });
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (exp) => {
    setCurrentExpense(exp);
    setFormData({
      category_id: exp.category.id,
      amount: exp.amount,
      date: exp.date,
      payment_method: exp.payment_method,
      description: exp.description || '',
      notes: exp.notes || '',
    });
    setIsEditModalOpen(true);
  };

  const handleOpenDelete = (exp) => {
    setCurrentExpense(exp);
    setIsDeleteModalOpen(true);
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      toast.error('Please enter a valid positive amount.');
      return;
    }
    if (!formData.category_id) {
      toast.error('Please select an expense category.');
      return;
    }

    setIsSubmitting(true);
    try {
      await expenseService.createExpense(formData);
      toast.success('Expense recorded successfully');
      setIsAddModalOpen(false);
      fetchExpenses();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to record expense');
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
      await expenseService.updateExpense(currentExpense.id, formData);
      toast.success('Expense updated successfully');
      setIsEditModalOpen(false);
      fetchExpenses();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update expense');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!currentExpense) return;
    setIsSubmitting(true);
    try {
      await expenseService.deleteExpense(currentExpense.id);
      toast.success('Expense deleted successfully');
      setIsDeleteModalOpen(false);
      fetchExpenses();
    } catch {
      toast.error('Failed to delete expense');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Summary Metrics
  const totalAmount = expenses.reduce((acc, curr) => acc + parseFloat(curr.amount || 0), 0);
  const avgAmount = expenses.length > 0 ? totalAmount / expenses.length : 0;

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Top Header */}
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em', marginBottom: '4px' }}>
            Expenses
          </h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
            Log and manage your daily expenditures, categorize transactions, and filter by dates.
          </p>
        </div>

        <button type="button" className="btn btn-primary" onClick={handleOpenAdd}>
          <Plus size={18} />
          Add Expense
        </button>
      </div>

      {/* Summary KPI Mini Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
        <div className="glass-card" style={{ padding: '16px 20px' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '4px' }}>Total Filtered Spend</div>
          <div style={{ fontSize: '1.375rem', fontWeight: 800, color: 'var(--rose)' }}>{formatCurrency(totalAmount)}</div>
        </div>
        <div className="glass-card" style={{ padding: '16px 20px' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '4px' }}>Transactions Count</div>
          <div style={{ fontSize: '1.375rem', fontWeight: 800, color: 'var(--text-primary)' }}>{expenses.length}</div>
        </div>
        <div className="glass-card" style={{ padding: '16px 20px' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '4px' }}>Average Transaction</div>
          <div style={{ fontSize: '1.375rem', fontWeight: 800, color: '#38BDF8' }}>{formatCurrency(avgAmount)}</div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="glass-card" style={{ padding: '16px 20px', display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center' }}>
        <div style={{ flex: '1 1 200px', position: 'relative' }}>
          <input
            type="text"
            className="form-input"
            placeholder="Search description..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ paddingLeft: '36px' }}
          />
          <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
        </div>

        <select
          className="form-select"
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          style={{ flex: '1 1 150px' }}
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
          style={{ flex: '1 1 150px' }}
        >
          <option value="">All Payment Methods</option>
          <option value="CASH">Cash</option>
          <option value="CARD">Card</option>
          <option value="UPI">UPI</option>
          <option value="NET_BANKING">Net Banking</option>
          <option value="OTHER">Other</option>
        </select>

        <input
          type="date"
          className="form-input"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          style={{ flex: '1 1 130px' }}
          placeholder="Start Date"
        />

        <input
          type="date"
          className="form-input"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          style={{ flex: '1 1 130px' }}
          placeholder="End Date"
        />
      </div>

      {/* Expenses Table */}
      {isLoading ? (
        <SkeletonTable rows={6} />
      ) : expenses.length === 0 ? (
        <div className="glass-card">
          <EmptyState
            icon={ArrowDownCircle}
            title="No expense records found"
            description="You haven't recorded any expenses matching the current filters."
            actionText="Record First Expense"
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
              {expenses.map((exp) => (
                <tr key={exp.id}>
                  <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                    {formatDate(exp.date)}
                  </td>
                  <td>
                    <span
                      className="badge"
                      style={{
                        backgroundColor: `${exp.category?.color || '#EF4444'}20`,
                        color: exp.category?.color || '#EF4444',
                        border: `1px solid ${exp.category?.color || '#EF4444'}40`,
                      }}
                    >
                      <Tag size={12} />
                      {exp.category?.name}
                    </span>
                  </td>
                  <td>{exp.description || '—'}</td>
                  <td>
                    <span className="badge badge-neutral">
                      <CreditCard size={12} />
                      {exp.payment_method}
                    </span>
                  </td>
                  <td style={{ fontWeight: 700, color: 'var(--rose)' }}>
                    {formatCurrency(exp.amount)}
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: '8px' }}>
                      <button
                        className="btn btn-outline"
                        style={{ padding: '6px' }}
                        onClick={() => handleOpenEdit(exp)}
                        title="Edit Expense"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        className="btn btn-danger"
                        style={{ padding: '6px' }}
                        onClick={() => handleOpenDelete(exp)}
                        title="Delete Expense"
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

      {/* Add Expense Modal */}
      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Record New Expense">
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
                placeholder="450.00"
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
              <option value="UPI">UPI</option>
              <option value="CARD">Credit / Debit Card</option>
              <option value="CASH">Cash</option>
              <option value="NET_BANKING">Net Banking</option>
              <option value="OTHER">Other</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Description</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Lunch with client, Metro recharge"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Notes (Optional)</label>
            <textarea
              className="form-textarea"
              rows={2}
              placeholder="Add any extra details or tax remarks"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : 'Save Expense'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit Expense Modal */}
      <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Edit Expense">
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
              <option value="UPI">UPI</option>
              <option value="CARD">Credit / Debit Card</option>
              <option value="CASH">Cash</option>
              <option value="NET_BANKING">Net Banking</option>
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
            <label className="form-label">Notes</label>
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
              {isSubmitting ? 'Updating...' : 'Update Expense'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Expense Confirmation */}
      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Expense Entry"
        message={`Are you sure you want to delete the expense of ${currentExpense ? formatCurrency(currentExpense.amount) : ''}?`}
        isLoading={isSubmitting}
      />
    </div>
  );
};
