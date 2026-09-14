import React, { useState, useRef } from 'react';
import { Plus, Tag, ChevronDown } from 'lucide-react';
import { Category, Priority, Task } from '../types';
import { PRIORITY_CONFIG } from '../utils/storage';

interface QuickAddTaskProps {
  categories: Category[];
  onAddTask: (taskData: Omit<Task, 'id' | 'createdAt' | 'completed'>) => void;
  onOpenFullModal: () => void;
}

export const QuickAddTask: React.FC<QuickAddTaskProps> = ({
  categories,
  onAddTask,
  onOpenFullModal,
}) => {
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState<Priority>('medium');
  const [categoryId, setCategoryId] = useState<string>(categories[0]?.id || 'work');
  const [dueDate, setDueDate] = useState<string>('');
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = title.trim();
    if (!trimmed) return;

    onAddTask({
      title: trimmed,
      priority,
      categoryId: categoryId || categories[0]?.id || 'work',
      dueDate: dueDate || undefined,
    });

    setTitle('');
    setDueDate('');
    // keep category and priority for fast entry of related items
  };

  const setDueDateQuick = (offsetDays: number) => {
    const d = new Date();
    d.setDate(d.getDate() + offsetDays);
    setDueDate(d.toISOString().split('T')[0]);
  };

  const priorityInfo = PRIORITY_CONFIG[priority];

  return (
    <div
      id="quick-add-task-container"
      className={`relative mb-6 rounded-xl border transition-all duration-200 bg-white ${
        isFocused
          ? 'border-stone-400 ring-2 ring-stone-900/10 shadow-sm'
          : 'border-stone-200/90 hover:border-stone-300 shadow-2xs'
      }`}
    >
      <form onSubmit={handleSubmit} className="p-3 sm:p-3.5">
        <div className="flex items-center gap-2.5">
          <div className="w-5 h-5 rounded-md border border-dashed border-stone-300 flex items-center justify-center text-stone-400 shrink-0">
            <Plus className="w-3.5 h-3.5" />
          </div>

          <input
            id="quick-add-task-input"
            ref={inputRef}
            type="text"
            placeholder="Add a new task... (Press Enter)"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            className="flex-1 text-sm bg-transparent border-none text-stone-900 placeholder:text-stone-400 focus:outline-hidden"
          />

          <button
            id="quick-add-submit-btn"
            type="submit"
            disabled={!title.trim()}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all shrink-0 ${
              title.trim()
                ? 'bg-stone-900 text-white hover:bg-stone-800 cursor-pointer shadow-2xs'
                : 'bg-stone-100 text-stone-400 cursor-not-allowed'
            }`}
          >
            Add
          </button>
        </div>

        {/* Quick Attributes Bar: Priority, Category, Due Date shortcuts */}
        <div className="flex items-center justify-between gap-2 mt-2.5 pt-2 border-t border-stone-100 flex-wrap text-xs">
          <div className="flex items-center gap-2 flex-wrap">
            {/* Priority Selector */}
            <div className="relative inline-flex items-center">
              <select
                id="quick-add-priority-select"
                value={priority}
                onChange={(e) => setPriority(e.target.value as Priority)}
                aria-label="Set priority for new task"
                className="pl-5 pr-6 py-1 text-xs font-medium bg-stone-50 hover:bg-stone-100 border border-stone-200 rounded-lg text-stone-700 cursor-pointer focus:outline-hidden appearance-none"
              >
                <option value="urgent">Urgent</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
              <span
                className={`absolute left-2 w-1.5 h-1.5 rounded-full pointer-events-none ${priorityInfo.dotClass}`}
              />
              <ChevronDown className="w-3 h-3 text-stone-400 absolute right-1.5 pointer-events-none" />
            </div>

            {/* Category Selector */}
            <div className="relative inline-flex items-center">
              <select
                id="quick-add-category-select"
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                aria-label="Set category for new task"
                className="pl-5 pr-6 py-1 text-xs font-medium bg-stone-50 hover:bg-stone-100 border border-stone-200 rounded-lg text-stone-700 cursor-pointer focus:outline-hidden appearance-none max-w-[130px] truncate"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
              <Tag className="w-3 h-3 text-stone-400 absolute left-1.5 pointer-events-none" />
              <ChevronDown className="w-3 h-3 text-stone-400 absolute right-1.5 pointer-events-none" />
            </div>

            {/* Due Date Shortcut Buttons */}
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setDueDateQuick(0)}
                className={`px-2 py-1 rounded-md text-[11px] font-medium border transition-colors ${
                  dueDate === new Date().toISOString().split('T')[0]
                    ? 'bg-amber-50 text-amber-800 border-amber-300'
                    : 'bg-stone-50 text-stone-600 border-stone-200 hover:bg-stone-100'
                }`}
              >
                Today
              </button>
              <button
                type="button"
                onClick={() => setDueDateQuick(1)}
                className={`px-2 py-1 rounded-md text-[11px] font-medium border transition-colors ${
                  dueDate ===
                  new Date(Date.now() + 86400000).toISOString().split('T')[0]
                    ? 'bg-blue-50 text-blue-800 border-blue-300'
                    : 'bg-stone-50 text-stone-600 border-stone-200 hover:bg-stone-100'
                }`}
              >
                Tomorrow
              </button>
            </div>
          </div>

          {/* Expand to full modal for notes */}
          <button
            id="expand-to-full-modal-btn"
            type="button"
            onClick={onOpenFullModal}
            className="text-stone-500 hover:text-stone-800 text-xs font-medium underline underline-offset-2 ml-auto"
          >
            More details
          </button>
        </div>
      </form>
    </div>
  );
};
