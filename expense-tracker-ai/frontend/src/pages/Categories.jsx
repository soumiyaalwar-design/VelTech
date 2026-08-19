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
      toast.success('Category removed successfully');
      setIsDeleteModalOpen(false);
      fetchCategories();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Cannot delete category in use');
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
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em', marginBottom: '4px' }}>
            Categories
          </h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
            Organize expenses and income with system presets and custom categories.
          </p>
        </div>

        <button type="button" className="btn btn-primary" onClick={handleOpenAdd}>
          <Plus size={18} />
          New Category
        </button>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '10px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '12px' }}>
        <button
          className="btn"
          style={{
            backgroundColor: activeTab === 'EXPENSE' ? 'rgba(239, 68, 68, 0.15)' : 'transparent',
            color: activeTab === 'EXPENSE' ? '#F87171' : 'var(--text-secondary)',
            border: activeTab === 'EXPENSE' ? '1px solid rgba(239, 68, 68, 0.3)' : '1px solid transparent',
          }}
          onClick={() => setActiveTab('EXPENSE')}
        >
          Expense Categories ({categories.filter((c) => c.type === 'EXPENSE').length})
        </button>

        <button
          className="btn"
          style={{
            backgroundColor: activeTab === 'INCOME' ? 'rgba(16, 185, 129, 0.15)' : 'transparent',
            color: activeTab === 'INCOME' ? '#34D399' : 'var(--text-secondary)',
            border: activeTab === 'INCOME' ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid transparent',
          }}
          onClick={() => setActiveTab('INCOME')}
        >
          Income Categories ({categories.filter((c) => c.type === 'INCOME').length})
        </button>
      </div>

      {/* Categories Grid */}
      {isLoading ? (
        <div className="grid-cols-3">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      ) : filteredCategories.length === 0 ? (
        <div className="glass-card">
          <EmptyState
            icon={Tags}
            title={`No ${activeTab.toLowerCase()} categories found`}
            description="Add your first category to start organizing your transactions."
            actionText="Add Category"
            onAction={handleOpenAdd}
          />
        </div>
      ) : (
        <div className="grid-cols-3">
          {filteredCategories.map((cat) => (
            <div
              key={cat.id}
              className="glass-card"
              style={{
                padding: '20px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: '16px',
                borderLeft: `4px solid ${cat.color || '#6366F1'}`,
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div
                      style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '10px',
                        backgroundColor: `${cat.color || '#6366F1'}20`,
                        color: cat.color || '#6366F1',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Tags size={18} />
                    </div>
                    <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                      {cat.name}
                    </h4>
                  </div>

                  {cat.is_default ? (
                    <span className="badge badge-neutral" title="System default category">
                      <Lock size={10} /> Default
                    </span>
                  ) : (
                    <span className="badge" style={{ backgroundColor: 'rgba(99, 102, 241, 0.15)', color: '#818CF8' }}>
                      <Sparkles size={10} /> Custom
                    </span>
                  )}
                </div>

                <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', minHeight: '36px' }}>
                  {cat.description || 'Standard transaction category.'}
                </p>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--border-subtle)', paddingTop: '12px' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  {cat.is_active ? 'Active' : 'Archived'}
                </span>

                {!cat.is_default ? (
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      className="btn btn-outline"
                      style={{ padding: '6px' }}
                      onClick={() => handleOpenEdit(cat)}
                      title="Edit Category"
                    >
                      <Edit2 size={14} />
                    </button>
                    <button
                      className="btn btn-danger"
                      style={{ padding: '6px' }}
                      onClick={() => handleOpenDelete(cat)}
                      title="Delete Category"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ) : (
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    System Protected
                  </span>
                )}
              </div>
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
              placeholder="e.g. Gym & Fitness, Subscriptions"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Category Type *</label>
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
            <label className="form-label">Accent Color</label>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '6px' }}>
              {COLOR_PRESETS.map((color) => (
                <button
                  type="button"
                  key={color}
                  onClick={() => setFormData({ ...formData, color })}
                  style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '50%',
                    backgroundColor: color,
                    border: formData.color === color ? '2px solid #FFFFFF' : '2px solid transparent',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {formData.color === color && <Check size={14} color="#FFFFFF" />}
                </button>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Description (Optional)</label>
            <textarea
              className="form-textarea"
              rows={2}
              placeholder="What kind of transactions belong here?"
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
            <label className="form-label">Accent Color</label>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '6px' }}>
              {COLOR_PRESETS.map((color) => (
                <button
                  type="button"
                  key={color}
                  onClick={() => setFormData({ ...formData, color })}
                  style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '50%',
                    backgroundColor: color,
                    border: formData.color === color ? '2px solid #FFFFFF' : '2px solid transparent',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {formData.color === color && <Check size={14} color="#FFFFFF" />}
                </button>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Description</label>
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

      {/* Delete Category Confirmation */}
      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Category"
        message={`Are you sure you want to remove '${currentCategory?.name}'?`}
        isLoading={isSubmitting}
      />
    </div>
  );
};
