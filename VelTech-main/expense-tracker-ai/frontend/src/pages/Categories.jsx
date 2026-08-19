import React, { useState, useEffect } from 'react';
import { Plus, Tags, Lock, Edit2, Trash2, Check, Sparkles, Layers } from 'lucide-react';
import { categoryService } from '../services/categoryService';
import { useToast } from '../context/ToastContext';
import { Modal } from '../components/common/Modal';
import { ConfirmModal } from '../components/common/ConfirmModal';
import { EmptyState } from '../components/common/EmptyState';
import { SkeletonCard } from '../components/common/SkeletonLoader';

const COLOR_PRESETS = [
  '#EF4444', '#F97316', '#F59E0B', '#10B981', '#06B6D4',
  '#3B82F6', '#6366F1', '#8B5CF6', '#EC4899', '#64748B'
];

export const Categories = () => {
  const toast = useToast();

  const [categories, setCategories] = useState([]);
  const [activeTab, setActiveTab] = useState('EXPENSE'); // EXPENSE or INCOME
  const [isLoading, setIsLoading] = useState(true);

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [currentCategory, setCurrentCategory] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form
  const [formData, setFormData] = useState({
    name: '',
    type: 'EXPENSE',
    color: '#6366F1',
    icon: 'Tag',
    description: '',
  });

  const fetchCategories = async () => {
    setIsLoading(true);
    try {
      const data = await categoryService.getCategories();
      setCategories(data);
    } catch {
      toast.error('Failed to load categories');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleOpenAdd = () => {
    setFormData({
      name: '',
      type: activeTab,
      color: activeTab === 'EXPENSE' ? '#EF4444' : '#10B981',
      icon: 'Tag',
      description: '',
    });
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (cat) => {
    setCurrentCategory(cat);
    setFormData({
      name: cat.name,
      type: cat.type,
      color: cat.color || '#6366F1',
      icon: cat.icon || 'Tag',
      description: cat.description || '',
    });
    setIsEditModalOpen(true);
  };

  const handleOpenDelete = (cat) => {
    setCurrentCategory(cat);
    setIsDeleteModalOpen(true);
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error('Category name is required.');
      return;
    }

    setIsSubmitting(true);
    try {
      await categoryService.createCategory({
        name: formData.name.trim(),
        type: formData.type,
        color: formData.color,
        icon: formData.icon,
        description: formData.description.trim(),
      });
      toast.success('Category created successfully');
      setIsAddModalOpen(false);
      fetchCategories();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create category');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error('Category name is required.');
      return;
    }

    setIsSubmitting(true);
    try {
      await categoryService.updateCategory(currentCategory.id, {
        name: formData.name.trim(),
        type: formData.type,
        color: formData.color,
        icon: formData.icon,
        description: formData.description.trim(),
      });
      toast.success('Category updated successfully');
      setIsEditModalOpen(false);
      fetchCategories();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update category');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!currentCategory) return;
    setIsSubmitting(true);
    try {
      await categoryService.deleteCategory(currentCategory.id);
      toast.success('Category deleted successfully');
      setIsDeleteModalOpen(false);
      fetchCategories();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete category');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredCategories = categories.filter((c) => c.type === activeTab);

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Top Header */}
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.025em', marginBottom: '4px' }}>
            Category Configuration
          </h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
            Organize transactions with system defaults and custom personalized category tags.
          </p>
        </div>

        <button type="button" className="btn btn-primary" onClick={handleOpenAdd}>
          <Plus size={18} />
          Create Category
        </button>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '12px', borderBottom: '1px solid var(--border-glass)', paddingBottom: '12px' }}>
        <button
          type="button"
          onClick={() => setActiveTab('EXPENSE')}
          style={{
            padding: '8px 20px',
            borderRadius: 'var(--radius-full)',
            border: 'none',
            cursor: 'pointer',
            fontSize: '0.875rem',
            fontWeight: 700,
            transition: 'all 0.2s ease',
            backgroundColor: activeTab === 'EXPENSE' ? 'var(--rose)' : 'var(--bg-surface)',
            color: activeTab === 'EXPENSE' ? '#FFFFFF' : 'var(--text-secondary)',
            boxShadow: activeTab === 'EXPENSE' ? 'var(--shadow-glass-sm)' : 'none',
          }}
        >
          Expense Categories ({categories.filter((c) => c.type === 'EXPENSE').length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('INCOME')}
          style={{
            padding: '8px 20px',
            borderRadius: 'var(--radius-full)',
            border: 'none',
            cursor: 'pointer',
            fontSize: '0.875rem',
            fontWeight: 700,
            transition: 'all 0.2s ease',
            backgroundColor: activeTab === 'INCOME' ? 'var(--emerald)' : 'var(--bg-surface)',
            color: activeTab === 'INCOME' ? '#FFFFFF' : 'var(--text-secondary)',
            boxShadow: activeTab === 'INCOME' ? 'var(--shadow-glass-sm)' : 'none',
          }}
        >
          Income Categories ({categories.filter((c) => c.type === 'INCOME').length})
        </button>
      </div>

      {/* Category Grid */}
      {isLoading ? (
        <div className="grid-cols-3">
          <SkeletonCard height="130px" />
          <SkeletonCard height="130px" />
          <SkeletonCard height="130px" />
        </div>
      ) : filteredCategories.length === 0 ? (
        <div className="glass-card">
          <EmptyState
            icon={Tags}
            title={`No ${activeTab.toLowerCase()} categories`}
            description="Create your first custom category to tag transactions."
            actionText="Create Category"
            onAction={handleOpenAdd}
          />
        </div>
      ) : (
        <div className="grid-cols-3">
          {filteredCategories.map((cat) => (
            <div
              key={cat.id}
              className="glass-card glass-card-interactive"
              style={{
                padding: '20px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                minHeight: '130px',
                borderLeft: `4px solid ${cat.color || '#6366F1'}`,
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div
                      style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '8px',
                        backgroundColor: `${cat.color || '#6366F1'}18`,
                        border: `1px solid ${cat.color || '#6366F1'}35`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: cat.color || '#6366F1',
                      }}
                    >
                      <Tags size={16} />
                    </div>
                    <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                      {cat.name}
                    </h3>
                  </div>

                  {cat.is_default ? (
                    <span className="badge badge-neutral" title="System Protected Category">
                      <Lock size={10} /> System Default
                    </span>
                  ) : (
                    <span className="badge badge-income">
                      Custom
                    </span>
                  )}
                </div>

                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                  {cat.description || 'No description provided.'}
                </p>
              </div>

              {/* Action Buttons (Only enabled for user-created custom categories) */}
              {!cat.is_default && (
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '14px', borderTop: '1px solid var(--border-glass)', paddingTop: '10px' }}>
                  <button
                    className="btn btn-outline"
                    style={{ padding: '4px 10px', fontSize: '0.75rem' }}
                    onClick={() => handleOpenEdit(cat)}
                  >
                    <Edit2 size={12} /> Edit
                  </button>
                  <button
                    className="btn btn-danger"
                    style={{ padding: '4px 10px', fontSize: '0.75rem' }}
                    onClick={() => handleOpenDelete(cat)}
                  >
                    <Trash2 size={12} /> Delete
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Add Category Modal */}
      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Create New Category">
        <form onSubmit={handleAddSubmit}>
          <div className="form-group">
            <label className="form-label">Category Name *</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Groceries, Gym, Software"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Transaction Type</label>
            <select
              className="form-select"
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
            >
              <option value="EXPENSE">Expense Category</option>
              <option value="INCOME">Income Category</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Theme Color</label>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '4px' }}>
              {COLOR_PRESETS.map((col) => (
                <button
                  type="button"
                  key={col}
                  onClick={() => setFormData({ ...formData, color: col })}
                  aria-label={`Select color ${col}`}
                  style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '50%',
                    backgroundColor: col,
                    border: formData.color === col ? '2px solid #FFFFFF' : '2px solid transparent',
                    cursor: 'pointer',
                    boxShadow: formData.color === col ? '0 0 10px ' + col : 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {formData.color === col && <Check size={14} color="#FFFFFF" />}
                </button>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Description (Optional)</label>
            <textarea
              className="form-textarea"
              rows={2}
              placeholder="Brief explanation of category purpose"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
              {isSubmitting ? 'Creating...' : 'Create Category'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit Category Modal */}
      <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Edit Category">
        <form onSubmit={handleEditSubmit}>
          <div className="form-group">
            <label className="form-label">Category Name *</label>
            <input
              type="text"
              className="form-input"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Theme Color</label>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '4px' }}>
              {COLOR_PRESETS.map((col) => (
                <button
                  type="button"
                  key={col}
                  onClick={() => setFormData({ ...formData, color: col })}
                  aria-label={`Select color ${col}`}
                  style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '50%',
                    backgroundColor: col,
                    border: formData.color === col ? '2px solid #FFFFFF' : '2px solid transparent',
                    cursor: 'pointer',
                    boxShadow: formData.color === col ? '0 0 10px ' + col : 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {formData.color === col && <Check size={14} color="#FFFFFF" />}
                </button>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Description (Optional)</label>
            <textarea
              className="form-textarea"
              rows={2}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsEditModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
              {isSubmitting ? 'Updating...' : 'Update Category'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Custom Category"
        message={`Are you sure you want to permanently delete category "${currentCategory?.name}"? Any past transactions tagged with this category will retain their history.`}
        confirmText="Delete Category"
        isLoading={isSubmitting}
      />
    </div>
  );
};
