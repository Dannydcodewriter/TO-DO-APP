import React from 'react';
import { Search, X, Filter, ArrowUpDown, Tag, Check, SlidersHorizontal } from 'lucide-react';
import { Category, FilterState, Priority, SortOption, StatusFilter } from '../types';
import { CATEGORY_COLOR_MAP, PRIORITY_CONFIG } from '../utils/storage';

interface FilterBarProps {
  filters: FilterState;
  onFilterChange: (filters: Partial<FilterState>) => void;
  categories: Category[];
  taskCounts: {
    total: number;
    active: number;
    completed: number;
    byCategory: Record<string, number>;
    byPriority: Record<string, number>;
  };
  onOpenCategoryModal: () => void;
  onResetFilters: () => void;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  filters,
  onFilterChange,
  categories,
  taskCounts,
  onOpenCategoryModal,
  onResetFilters,
}) => {
  const statusOptions: { label: string; value: StatusFilter; count: number }[] = [
    { label: 'All', value: 'all', count: taskCounts.total },
    { label: 'Active', value: 'active', count: taskCounts.active },
    { label: 'Completed', value: 'completed', count: taskCounts.completed },
  ];

  const priorityOptions: { label: string; value: Priority | 'all' }[] = [
    { label: 'All Priorities', value: 'all' },
    { label: 'Urgent', value: 'urgent' },
    { label: 'High', value: 'high' },
    { label: 'Medium', value: 'medium' },
    { label: 'Low', value: 'low' },
  ];

  const sortOptions: { label: string; value: SortOption }[] = [
    { label: 'Priority: High → Low', value: 'priority-desc' },
    { label: 'Priority: Low → High', value: 'priority-asc' },
    { label: 'Due Date', value: 'due-date' },
    { label: 'Newest First', value: 'date-newest' },
    { label: 'Oldest First', value: 'date-oldest' },
    { label: 'Alphabetical (A-Z)', value: 'alphabetical' },
  ];

  const hasActiveFilters =
    filters.search !== '' ||
    filters.status !== 'all' ||
    filters.categoryId !== 'all' ||
    filters.priority !== 'all';

  return (
    <div id="filter-bar-container" className="space-y-3.5 mb-6">
      {/* Top row: Search input & Sort Dropdown */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
        {/* Search input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            id="search-tasks-input"
            type="text"
            placeholder="Search tasks, notes, or tags..."
            value={filters.search}
            onChange={(e) => onFilterChange({ search: e.target.value })}
            className="w-full pl-9 pr-9 py-2 text-sm bg-white border border-stone-200 rounded-xl text-stone-900 placeholder:text-stone-400 focus:outline-hidden focus:ring-2 focus:ring-stone-800 focus:border-stone-800 transition-all shadow-2xs"
          />
          {filters.search && (
            <button
              id="clear-search-btn"
              type="button"
              onClick={() => onFilterChange({ search: '' })}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-stone-400 hover:text-stone-600 rounded-md"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Priority Filter & Sort Filter Row on mobile, inline on desktop */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Priority filter */}
          <div className="relative flex-1 sm:flex-none">
            <select
              id="priority-filter-select"
              value={filters.priority}
              onChange={(e) => onFilterChange({ priority: e.target.value as Priority | 'all' })}
              className="w-full sm:w-auto pl-3 pr-8 py-2 text-xs font-medium bg-white border border-stone-200 rounded-xl text-stone-800 hover:bg-stone-50/50 focus:outline-hidden focus:ring-2 focus:ring-stone-800 appearance-none cursor-pointer shadow-2xs"
            >
              {priorityOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                  {opt.value !== 'all' ? ` (${taskCounts.byPriority[opt.value] || 0})` : ''}
                </option>
              ))}
            </select>
            <Filter className="w-3.5 h-3.5 text-stone-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Sort order select */}
          <div className="relative flex-1 sm:flex-none">
            <select
              id="sort-tasks-select"
              value={filters.sortBy}
              onChange={(e) => onFilterChange({ sortBy: e.target.value as SortOption })}
              className="w-full sm:w-auto pl-3 pr-8 py-2 text-xs font-medium bg-white border border-stone-200 rounded-xl text-stone-800 hover:bg-stone-50/50 focus:outline-hidden focus:ring-2 focus:ring-stone-800 appearance-none cursor-pointer shadow-2xs"
            >
              {sortOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <ArrowUpDown className="w-3.5 h-3.5 text-stone-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Middle row: Status Segmented Control & Category Pills */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-0.5">
        {/* Status Tabs */}
        <div
          id="status-filter-tabs"
          className="inline-flex p-1 bg-stone-100/90 rounded-xl border border-stone-200/80 self-start sm:self-auto"
        >
          {statusOptions.map((opt) => {
            const isSelected = filters.status === opt.value;
            return (
              <button
                key={opt.value}
                id={`status-tab-${opt.value}`}
                type="button"
                onClick={() => onFilterChange({ status: opt.value })}
                className={`flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-lg transition-all ${
                  isSelected
                    ? 'bg-white text-stone-900 shadow-xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                <span>{opt.label}</span>
                <span
                  className={`text-[11px] px-1.5 py-0.2 rounded-full ${
                    isSelected ? 'bg-stone-100 text-stone-700' : 'text-stone-400'
                  }`}
                >
                  {opt.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Clear Filters indicator if any applied */}
        {hasActiveFilters && (
          <button
            id="reset-filters-btn"
            type="button"
            onClick={onResetFilters}
            className="text-xs text-stone-500 hover:text-stone-800 underline underline-offset-2 flex items-center gap-1 self-start sm:self-auto"
          >
            <span>Reset filters</span>
          </button>
        )}
      </div>

      {/* Category Pills Bar */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 pt-1 no-scrollbar text-xs">
        <span className="text-stone-400 text-xs font-medium mr-1 shrink-0 flex items-center gap-1">
          <Tag className="w-3.5 h-3.5" />
          Categories:
        </span>

        {/* All Categories Chip */}
        <button
          id="category-pill-all"
          type="button"
          onClick={() => onFilterChange({ categoryId: 'all' })}
          className={`shrink-0 px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
            filters.categoryId === 'all'
              ? 'bg-stone-900 text-white shadow-2xs'
              : 'bg-stone-100/90 text-stone-600 hover:bg-stone-200/80'
          }`}
        >
          All ({taskCounts.total})
        </button>

        {/* Individual Category Chips */}
        {categories.map((cat) => {
          const isSelected = filters.categoryId === cat.id;
          const count = taskCounts.byCategory[cat.id] || 0;
          const colorMeta = CATEGORY_COLOR_MAP[cat.color] || CATEGORY_COLOR_MAP.indigo;

          return (
            <button
              key={cat.id}
              id={`category-pill-${cat.id}`}
              type="button"
              onClick={() => onFilterChange({ categoryId: cat.id })}
              className={`shrink-0 flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-all ${
                isSelected
                  ? 'bg-stone-900 text-white shadow-2xs ring-1 ring-stone-900'
                  : 'bg-white border border-stone-200 text-stone-700 hover:border-stone-300'
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  isSelected ? 'bg-white' : colorMeta.text.replace('text-', 'bg-')
                }`}
              />
              <span>{cat.name}</span>
              <span className={`text-[10px] ${isSelected ? 'opacity-80' : 'text-stone-400'}`}>
                ({count})
              </span>
            </button>
          );
        })}

        {/* Manage Categories Trigger */}
        <button
          id="manage-categories-pill-btn"
          type="button"
          onClick={onOpenCategoryModal}
          className="shrink-0 px-2 py-1 text-xs text-stone-500 hover:text-stone-800 hover:bg-stone-100 rounded-full border border-dashed border-stone-300 transition-colors"
          title="Add or manage categories"
        >
          + Manage
        </button>
      </div>
    </div>
  );
};
