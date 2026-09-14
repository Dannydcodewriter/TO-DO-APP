import { Category, Priority, Task } from '../types';

export const STORAGE_TASKS_KEY = 'simple_todo_tasks_v2';
export const STORAGE_CATEGORIES_KEY = 'simple_todo_categories_v2';
export const STORAGE_SOUND_KEY = 'simple_todo_sound_v1';

export const DEFAULT_CATEGORIES: Category[] = [
  { id: 'work', name: 'Work', color: 'indigo', isDefault: true },
  { id: 'personal', name: 'Personal', color: 'emerald', isDefault: true },
  { id: 'errands', name: 'Errands', color: 'amber', isDefault: true },
  { id: 'health', name: 'Health', color: 'rose', isDefault: true },
  { id: 'finance', name: 'Finance', color: 'sky', isDefault: true },
];

export const PRIORITY_CONFIG: Record<
  Priority,
  { label: string; level: number; badgeClass: string; dotClass: string; borderClass: string }
> = {
  urgent: {
    label: 'Urgent',
    level: 4,
    badgeClass: 'bg-red-50 text-red-700 ring-1 ring-red-600/20',
    dotClass: 'bg-red-500',
    borderClass: 'border-l-red-500',
  },
  high: {
    label: 'High',
    level: 3,
    badgeClass: 'bg-amber-50 text-amber-800 ring-1 ring-amber-600/20',
    dotClass: 'bg-amber-500',
    borderClass: 'border-l-amber-500',
  },
  medium: {
    label: 'Medium',
    level: 2,
    badgeClass: 'bg-blue-50 text-blue-700 ring-1 ring-blue-600/20',
    dotClass: 'bg-blue-500',
    borderClass: 'border-l-blue-500',
  },
  low: {
    label: 'Low',
    level: 1,
    badgeClass: 'bg-stone-100 text-stone-700 ring-1 ring-stone-500/20',
    dotClass: 'bg-stone-400',
    borderClass: 'border-l-stone-400',
  },
};

export const CATEGORY_COLOR_MAP: Record<string, { bg: string; text: string; ring: string }> = {
  indigo: { bg: 'bg-indigo-50', text: 'text-indigo-700', ring: 'ring-indigo-600/20' },
  emerald: { bg: 'bg-emerald-50', text: 'text-emerald-700', ring: 'ring-emerald-600/20' },
  amber: { bg: 'bg-amber-50', text: 'text-amber-800', ring: 'ring-amber-600/20' },
  rose: { bg: 'bg-rose-50', text: 'text-rose-700', ring: 'ring-rose-600/20' },
  sky: { bg: 'bg-sky-50', text: 'text-sky-700', ring: 'ring-sky-600/20' },
  purple: { bg: 'bg-purple-50', text: 'text-purple-700', ring: 'ring-purple-600/20' },
  teal: { bg: 'bg-teal-50', text: 'text-teal-700', ring: 'ring-teal-600/20' },
  orange: { bg: 'bg-orange-50', text: 'text-orange-700', ring: 'ring-orange-600/20' },
};

export const AVAILABLE_CATEGORY_COLORS = [
  'indigo',
  'emerald',
  'amber',
  'rose',
  'sky',
  'purple',
  'teal',
  'orange',
];

export function getCategoryBadge(colorKey: string) {
  return (
    CATEGORY_COLOR_MAP[colorKey] || {
      bg: 'bg-stone-100',
      text: 'text-stone-700',
      ring: 'ring-stone-500/20',
    }
  );
}

export function loadCategories(): Category[] {
  try {
    const raw = localStorage.getItem(STORAGE_CATEGORIES_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_CATEGORIES_KEY, JSON.stringify(DEFAULT_CATEGORIES));
      return DEFAULT_CATEGORIES;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
  } catch (err) {
    console.error('Failed to load categories from localStorage:', err);
  }
  return DEFAULT_CATEGORIES;
}

export function saveCategories(categories: Category[]): void {
  try {
    localStorage.setItem(STORAGE_CATEGORIES_KEY, JSON.stringify(categories));
  } catch (err) {
    console.error('Failed to save categories to localStorage:', err);
  }
}

export function loadTasks(): Task[] {
  try {
    // Clear any obsolete v1 demo data if user is starting fresh
    if (localStorage.getItem('simple_todo_tasks_v1') && !localStorage.getItem(STORAGE_TASKS_KEY)) {
      localStorage.removeItem('simple_todo_tasks_v1');
    }

    const raw = localStorage.getItem(STORAGE_TASKS_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_TASKS_KEY, JSON.stringify([]));
      return [];
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      // Filter out any leftover demo tasks from previous versions
      const cleaned = parsed.filter(
        (t) =>
          t &&
          typeof t.id === 'string' &&
          !t.id.startsWith('task-1') &&
          !t.id.startsWith('task-2') &&
          !t.id.startsWith('task-3') &&
          !t.id.startsWith('task-4') &&
          !t.id.startsWith('task-5')
      );
      return cleaned;
    }
  } catch (err) {
    console.error('Failed to load tasks from localStorage:', err);
  }
  return [];
}

export function saveTasks(tasks: Task[]): void {
  try {
    localStorage.setItem(STORAGE_TASKS_KEY, JSON.stringify(tasks));
  } catch (err) {
    console.error('Failed to save tasks to localStorage:', err);
  }
}

export function formatDueDate(dateString?: string): {
  text: string;
  isOverdue: boolean;
  isToday: boolean;
  isTomorrow: boolean;
} {
  if (!dateString) return { text: '', isOverdue: false, isToday: false, isTomorrow: false };

  const [year, month, day] = dateString.split('-').map(Number);
  const targetDate = new Date(year, month - 1, day);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const diffTime = targetDate.getTime() - today.getTime();
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return { text: 'Today', isOverdue: false, isToday: true, isTomorrow: false };
  } else if (diffDays === 1) {
    return { text: 'Tomorrow', isOverdue: false, isToday: false, isTomorrow: true };
  } else if (diffDays === -1) {
    return { text: 'Yesterday', isOverdue: true, isToday: false, isTomorrow: false };
  } else if (diffDays < -1) {
    return {
      text: `${Math.abs(diffDays)}d overdue`,
      isOverdue: true,
      isToday: false,
      isTomorrow: false,
    };
  } else {
    const monthNames = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ];
    return {
      text: `${monthNames[targetDate.getMonth()]} ${targetDate.getDate()}`,
      isOverdue: false,
      isToday: false,
      isTomorrow: false,
    };
  }
}

export function exportDataAsJSON(tasks: Task[], categories: Category[]): void {
  const payload = {
    version: '1.0',
    exportDate: new Date().toISOString(),
    tasks,
    categories,
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `todo-backup-${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
