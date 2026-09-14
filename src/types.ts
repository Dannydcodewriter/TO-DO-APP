export type Priority = 'low' | 'medium' | 'high' | 'urgent';

export interface Category {
  id: string;
  name: string;
  color: string; // Tailwind color name or hex
  isDefault?: boolean;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  priority: Priority;
  categoryId: string;
  dueDate?: string; // YYYY-MM-DD
  createdAt: number;
  completedAt?: number;
}

export type StatusFilter = 'all' | 'active' | 'completed';

export type SortOption =
  | 'priority-desc'
  | 'priority-asc'
  | 'date-newest'
  | 'date-oldest'
  | 'due-date'
  | 'alphabetical';

export interface FilterState {
  search: string;
  status: StatusFilter;
  categoryId: string; // 'all' or category id
  priority: Priority | 'all';
  sortBy: SortOption;
}
