import React, { useState, useEffect } from 'react';
import { X, Tag, AlertCircle } from 'lucide-react';
import { Category, Priority, Task } from '../types';
import { PRIORITY_CONFIG } from '../utils/storage';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (taskData: Omit<Task, 'id' | 'createdAt' | 'completed'> & { id?: string }) => void;
  initialTask?: Task | null;
  categories: Category[];
  onOpenCategoryModal: () => void;
}

export const TaskModal: React.FC<TaskModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialTask,
  categories,
  onOpenCategoryModal,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState<string>('');
  const [priority, setPriority] = useState<Priority>('medium');
  const [dueDate, setDueDate] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (initialTask) {
      setTitle(initialTask.title);
      setDescription(initialTask.description || '');
      setCategoryId(initialTask.categoryId || (categories[0]?.id ?? ''));
      setPriority(initialTask.priority || 'medium');
      setDueDate(initialTask.dueDate || '');
    } else {
      setTitle('');
      setDescription('');
      setCategoryId(categories[0]?.id ?? 'work');
      setPriority('medium');
      setDueDate('');
    }
    setError('');
  }, [initialTask, isOpen, categories]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Please provide a title for the task');
      return;
    }

    onSave({
      ...(initialTask ? { id: initialTask.id } : {}),
      title: title.trim(),
      description: description.trim() || undefined,
      categoryId: categoryId || (categories[0]?.id ?? 'work'),
      priority,
      dueDate: dueDate || undefined,
    });
    onClose();
  };

  const priorityLevels: Priority[] = ['urgent', 'high', 'medium', 'low'];

  return (
    <div
      id="task-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-xs transition-opacity"
      onClick={onClose}
    >
      <div
        id="task-modal-card"
        className="relative w-full max-w-lg bg-white rounded-2xl shadow-xl border border-stone-200 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100">
          <h2 id="task-modal-title" className="text-lg font-semibold text-stone-900">
            {initialTask ? 'Edit Task' : 'Create New Task'}
          </h2>
          <button
            id="close-task-modal-btn"
            type="button"
            onClick={onClose}
            className="p-1 text-stone-400 hover:text-stone-700 rounded-lg hover:bg-stone-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form id="task-modal-form" onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div
              id="task-modal-error"
              className="flex items-center gap-2 p-3 text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded-lg"
            >
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Title Input */}
          <div>
            <label
              htmlFor="task-title-input"
              className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5"
            >
              Task Title *
            </label>
            <input
              id="task-title-input"
              type="text"
              required
              autoFocus
              placeholder="e.g. Prepare financial forecast deck"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (error) setError('');
              }}
              className="w-full px-3.5 py-2.5 text-sm bg-white border border-stone-300 rounded-lg text-stone-900 placeholder:text-stone-400 focus:outline-hidden focus:ring-2 focus:ring-stone-800 focus:border-stone-800 transition-all"
            />
          </div>

          {/* Description Input */}
          <div>
            <label
              htmlFor="task-desc-input"
              className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5"
            >
              Notes / Details (Optional)
            </label>
            <textarea
              id="task-desc-input"
              rows={2}
              placeholder="Add relevant notes, checklist pointers, or reference links..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2 text-sm bg-white border border-stone-300 rounded-lg text-stone-900 placeholder:text-stone-400 focus:outline-hidden focus:ring-2 focus:ring-stone-800 focus:border-stone-800 transition-all resize-none"
            />
          </div>

          {/* Priority Selection */}
          <div>
            <label
              id="task-priority-label"
              className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-2"
            >
              Priority Level
            </label>
            <div className="grid grid-cols-4 gap-2">
              {priorityLevels.map((p) => {
                const conf = PRIORITY_CONFIG[p];
                const isSelected = priority === p;
                return (
                  <button
                    key={p}
                    id={`priority-select-${p}`}
                    type="button"
                    onClick={() => setPriority(p)}
                    className={`flex items-center justify-center gap-1.5 py-2 px-2 text-xs font-medium rounded-lg border transition-all ${
                      isSelected
                        ? 'border-stone-900 bg-stone-900 text-white shadow-xs'
                        : 'border-stone-200 bg-stone-50/70 text-stone-700 hover:bg-stone-100'
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        isSelected ? 'bg-white' : conf.dotClass
                      }`}
                    />
                    <span>{conf.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Category & Due Date Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            {/* Category selection */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label
                  htmlFor="task-category-select"
                  className="block text-xs font-semibold text-stone-700 uppercase tracking-wider"
                >
                  Category
                </label>
                <button
                  id="add-category-quick-btn"
                  type="button"
                  onClick={onOpenCategoryModal}
                  className="text-xs text-stone-600 hover:text-stone-900 hover:underline inline-flex items-center gap-0.5"
                >
                  + New
                </button>
              </div>
              <div className="relative">
                <select
                  id="task-category-select"
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-white border border-stone-300 rounded-lg text-stone-900 focus:outline-hidden focus:ring-2 focus:ring-stone-800 focus:border-stone-800 appearance-none pr-8 cursor-pointer"
                >
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
                <Tag className="w-4 h-4 text-stone-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* Due Date selection */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label
                  htmlFor="task-due-date-input"
                  className="block text-xs font-semibold text-stone-700 uppercase tracking-wider"
                >
                  Due Date
                </label>
                {dueDate && (
                  <button
                    type="button"
                    onClick={() => setDueDate('')}
                    className="text-[11px] text-stone-400 hover:text-stone-700"
                  >
                    Clear
                  </button>
                )}
              </div>
              <input
                id="task-due-date-input"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-white border border-stone-300 rounded-lg text-stone-900 focus:outline-hidden focus:ring-2 focus:ring-stone-800 focus:border-stone-800"
              />
              {/* Quick presets */}
              <div className="flex items-center gap-1.5 mt-1.5">
                <button
                  type="button"
                  onClick={() => setDueDate(new Date().toISOString().split('T')[0])}
                  className="px-2 py-0.5 text-[11px] rounded bg-stone-100 hover:bg-stone-200 text-stone-700 transition-colors"
                >
                  Today
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const d = new Date();
                    d.setDate(d.getDate() + 1);
                    setDueDate(d.toISOString().split('T')[0]);
                  }}
                  className="px-2 py-0.5 text-[11px] rounded bg-stone-100 hover:bg-stone-200 text-stone-700 transition-colors"
                >
                  Tomorrow
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const d = new Date();
                    d.setDate(d.getDate() + 7);
                    setDueDate(d.toISOString().split('T')[0]);
                  }}
                  className="px-2 py-0.5 text-[11px] rounded bg-stone-100 hover:bg-stone-200 text-stone-700 transition-colors"
                >
                  +1 Week
                </button>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-stone-100">
            <button
              id="cancel-task-btn"
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              id="save-task-btn"
              type="submit"
              className="px-5 py-2 text-sm font-medium text-white bg-stone-900 hover:bg-stone-800 rounded-lg shadow-xs transition-colors"
            >
              {initialTask ? 'Save Changes' : 'Add Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
