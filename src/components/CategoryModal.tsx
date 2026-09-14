import React, { useState } from 'react';
import { X, Plus, Trash2, Tag, AlertCircle } from 'lucide-react';
import { Category } from '../types';
import { AVAILABLE_CATEGORY_COLORS, CATEGORY_COLOR_MAP } from '../utils/storage';

interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: Category[];
  onAddCategory: (category: Omit<Category, 'id'>) => void;
  onDeleteCategory: (categoryId: string) => void;
}

export const CategoryModal: React.FC<CategoryModalProps> = ({
  isOpen,
  onClose,
  categories,
  onAddCategory,
  onDeleteCategory,
}) => {
  const [newCategoryName, setNewCategoryName] = useState('');
  const [selectedColor, setSelectedColor] = useState('indigo');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newCategoryName.trim();
    if (!trimmed) {
      setError('Please provide a category name');
      return;
    }
    if (categories.some((c) => c.name.toLowerCase() === trimmed.toLowerCase())) {
      setError('A category with this name already exists');
      return;
    }

    onAddCategory({
      name: trimmed,
      color: selectedColor,
      isDefault: false,
    });
    setNewCategoryName('');
    setError('');
  };

  return (
    <div
      id="category-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-xs transition-opacity"
      onClick={onClose}
    >
      <div
        id="category-modal-card"
        className="relative w-full max-w-md bg-white rounded-2xl shadow-xl border border-stone-200 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100">
          <div className="flex items-center gap-2">
            <Tag className="w-5 h-5 text-stone-700" />
            <h2 id="category-modal-title" className="text-lg font-semibold text-stone-900">
              Manage Categories
            </h2>
          </div>
          <button
            id="close-category-modal-btn"
            type="button"
            onClick={onClose}
            className="p-1 text-stone-400 hover:text-stone-700 rounded-lg hover:bg-stone-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Add Category Form */}
          <form id="add-category-form" onSubmit={handleAdd} className="space-y-3">
            <h3 className="text-xs font-semibold text-stone-700 uppercase tracking-wider">
              Add New Category
            </h3>
            
            {error && (
              <div
                id="category-modal-error"
                className="flex items-center gap-2 p-2.5 text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded-lg"
              >
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="flex gap-2">
              <input
                id="new-category-name-input"
                type="text"
                placeholder="Category name (e.g. Fitness)"
                value={newCategoryName}
                onChange={(e) => {
                  setNewCategoryName(e.target.value);
                  if (error) setError('');
                }}
                className="flex-1 px-3 py-2 text-sm bg-white border border-stone-300 rounded-lg text-stone-900 placeholder:text-stone-400 focus:outline-hidden focus:ring-2 focus:ring-stone-800 focus:border-stone-800"
              />
              <button
                id="submit-new-category-btn"
                type="submit"
                className="px-3.5 py-2 text-sm font-medium text-white bg-stone-900 hover:bg-stone-800 rounded-lg inline-flex items-center gap-1 shrink-0 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Add</span>
              </button>
            </div>

            {/* Color Swatches */}
            <div>
              <span className="block text-xs text-stone-500 mb-1.5">Color Tag</span>
              <div className="flex items-center gap-2 flex-wrap">
                {AVAILABLE_CATEGORY_COLORS.map((color) => {
                  const style = CATEGORY_COLOR_MAP[color];
                  const isSelected = selectedColor === color;
                  return (
                    <button
                      key={color}
                      id={`color-swatch-${color}`}
                      type="button"
                      onClick={() => setSelectedColor(color)}
                      className={`w-7 h-7 rounded-full flex items-center justify-center transition-all ${
                        style.bg
                      } ring-2 ${isSelected ? 'ring-stone-800 scale-110' : 'ring-transparent'}`}
                      title={color}
                    >
                      <span className={`w-3.5 h-3.5 rounded-full ${style.text.replace('text-', 'bg-')}`} />
                    </button>
                  );
                })}
              </div>
            </div>
          </form>

          {/* Existing Categories List */}
          <div className="pt-3 border-t border-stone-100">
            <h3 className="text-xs font-semibold text-stone-700 uppercase tracking-wider mb-2.5">
              Existing Categories ({categories.length})
            </h3>
            <div className="max-h-52 overflow-y-auto space-y-1.5 pr-1">
              {categories.map((cat) => {
                const badge = CATEGORY_COLOR_MAP[cat.color] || CATEGORY_COLOR_MAP.indigo;
                return (
                  <div
                    key={cat.id}
                    id={`category-row-${cat.id}`}
                    className="flex items-center justify-between px-3 py-2 bg-stone-50 rounded-lg border border-stone-100 text-sm"
                  >
                    <div className="flex items-center gap-2.5">
                      <span
                        className={`w-2.5 h-2.5 rounded-full ${badge.text.replace('text-', 'bg-')}`}
                      />
                      <span className="font-medium text-stone-800">{cat.name}</span>
                      {cat.isDefault && (
                        <span className="text-[10px] uppercase font-semibold text-stone-400 bg-stone-200/60 px-1.5 py-0.5 rounded">
                          Default
                        </span>
                      )}
                    </div>

                    {!cat.isDefault && (
                      <button
                        id={`delete-category-${cat.id}`}
                        type="button"
                        title="Delete category"
                        onClick={() => onDeleteCategory(cat.id)}
                        className="p-1 text-stone-400 hover:text-rose-600 rounded transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end px-6 py-3 bg-stone-50 border-t border-stone-100">
          <button
            id="done-category-modal-btn"
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 text-sm font-medium text-stone-700 hover:text-stone-900 bg-white border border-stone-200 hover:bg-stone-100 rounded-lg transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
