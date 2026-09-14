import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { AnimatePresence } from 'motion/react';
import { CheckSquare, FilterX, Award } from 'lucide-react';
import { Category, FilterState, Task } from './types';
import {
  loadCategories,
  saveCategories,
  loadTasks,
  saveTasks,
  PRIORITY_CONFIG,
  exportDataAsJSON,
  STORAGE_SOUND_KEY,
} from './utils/storage';
import { playCompletionSound } from './utils/sound';
import { StatsHeader } from './components/StatsHeader';
import { QuickAddTask } from './components/QuickAddTask';
import { FilterBar } from './components/FilterBar';
import { TaskItem } from './components/TaskItem';
import { TaskModal } from './components/TaskModal';
import { CategoryModal } from './components/CategoryModal';

export default function App() {
  const [tasks, setTasks] = useState<Task[]>(() => loadTasks());
  const [categories, setCategories] = useState<Category[]>(() => loadCategories());
  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => {
    return localStorage.getItem(STORAGE_SOUND_KEY) !== 'false';
  });

  // Modals state
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);

  // Filters state
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    status: 'all',
    categoryId: 'all',
    priority: 'all',
    sortBy: 'priority-desc',
  });

  // Local storage synchronization
  useEffect(() => {
    saveTasks(tasks);
  }, [tasks]);

  useEffect(() => {
    saveCategories(categories);
  }, [categories]);

  useEffect(() => {
    localStorage.setItem(STORAGE_SOUND_KEY, soundEnabled ? 'true' : 'false');
  }, [soundEnabled]);

  // Global keyboard shortcut to focus quick-add or open modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.key === 'n' &&
        !['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement)?.tagName) &&
        !isTaskModalOpen &&
        !isCategoryModalOpen
      ) {
        e.preventDefault();
        const quickInput = document.getElementById('quick-add-task-input') as HTMLInputElement | null;
        if (quickInput) {
          quickInput.focus();
        } else {
          setIsTaskModalOpen(true);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isTaskModalOpen, isCategoryModalOpen]);

  // Categories map for O(1) lookup
  const categoryMap = useMemo(() => {
    const map = new Map<string, Category>();
    categories.forEach((cat) => map.set(cat.id, cat));
    return map;
  }, [categories]);

  // Aggregate task counts
  const taskCounts = useMemo(() => {
    let active = 0;
    let completed = 0;
    const byCategory: Record<string, number> = {};
    const byPriority: Record<string, number> = {};

    tasks.forEach((t) => {
      if (t.completed) {
        completed += 1;
      } else {
        active += 1;
      }

      byCategory[t.categoryId] = (byCategory[t.categoryId] || 0) + 1;
      byPriority[t.priority] = (byPriority[t.priority] || 0) + 1;
    });

    return {
      total: tasks.length,
      active,
      completed,
      byCategory,
      byPriority,
    };
  }, [tasks]);

  // Filtered and sorted tasks
  const filteredTasks = useMemo(() => {
    return tasks
      .filter((task) => {
        // Status filter
        if (filters.status === 'active' && task.completed) return false;
        if (filters.status === 'completed' && !task.completed) return false;

        // Category filter
        if (filters.categoryId !== 'all' && task.categoryId !== filters.categoryId) return false;

        // Priority filter
        if (filters.priority !== 'all' && task.priority !== filters.priority) return false;

        // Search filter
        if (filters.search.trim()) {
          const query = filters.search.toLowerCase().trim();
          const titleMatch = task.title.toLowerCase().includes(query);
          const descMatch = task.description?.toLowerCase().includes(query) ?? false;
          const catName = categoryMap.get(task.categoryId)?.name.toLowerCase() ?? '';
          const catMatch = catName.includes(query);
          if (!titleMatch && !descMatch && !catMatch) return false;
        }

        return true;
      })
      .sort((a, b) => {
        // Completed tasks go to bottom so active stay front and center
        if (a.completed !== b.completed) {
          return a.completed ? 1 : -1;
        }

        switch (filters.sortBy) {
          case 'priority-desc': {
            const levelA = PRIORITY_CONFIG[a.priority]?.level || 0;
            const levelB = PRIORITY_CONFIG[b.priority]?.level || 0;
            return levelB - levelA;
          }
          case 'priority-asc': {
            const levelA = PRIORITY_CONFIG[a.priority]?.level || 0;
            const levelB = PRIORITY_CONFIG[b.priority]?.level || 0;
            return levelA - levelB;
          }
          case 'due-date': {
            if (!a.dueDate && !b.dueDate) return 0;
            if (!a.dueDate) return 1;
            if (!b.dueDate) return -1;
            return a.dueDate.localeCompare(b.dueDate);
          }
          case 'date-newest':
            return b.createdAt - a.createdAt;
          case 'date-oldest':
            return a.createdAt - b.createdAt;
          case 'alphabetical':
            return a.title.localeCompare(b.title);
          default:
            return 0;
        }
      });
  }, [tasks, filters, categoryMap]);

  // Handlers
  const handleToggleComplete = useCallback(
    (id: string) => {
      setTasks((prev) =>
        prev.map((t) => {
          if (t.id === id) {
            const willBeCompleted = !t.completed;
            if (willBeCompleted && soundEnabled) {
              playCompletionSound();
            }
            return {
              ...t,
              completed: willBeCompleted,
              completedAt: willBeCompleted ? Date.now() : undefined,
            };
          }
          return t;
        })
      );
    },
    [soundEnabled]
  );

  const handleDeleteTask = useCallback((id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const handleSaveTask = (
    taskData: Omit<Task, 'id' | 'createdAt' | 'completed'> & { id?: string }
  ) => {
    if (taskData.id) {
      // Edit existing task
      setTasks((prev) =>
        prev.map((t) =>
          t.id === taskData.id
            ? {
                ...t,
                title: taskData.title,
                description: taskData.description,
                categoryId: taskData.categoryId,
                priority: taskData.priority,
                dueDate: taskData.dueDate,
              }
            : t
        )
      );
    } else {
      // Create new task
      const newTask: Task = {
        id: `task-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        title: taskData.title,
        description: taskData.description,
        categoryId: taskData.categoryId,
        priority: taskData.priority,
        dueDate: taskData.dueDate,
        completed: false,
        createdAt: Date.now(),
      };
      setTasks((prev) => [newTask, ...prev]);
    }
  };

  const handleQuickAdd = (taskData: Omit<Task, 'id' | 'createdAt' | 'completed'>) => {
    const newTask: Task = {
      id: `task-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      title: taskData.title,
      description: taskData.description,
      categoryId: taskData.categoryId,
      priority: taskData.priority,
      dueDate: taskData.dueDate,
      completed: false,
      createdAt: Date.now(),
    };
    setTasks((prev) => [newTask, ...prev]);
  };

  const handleOpenEdit = (task: Task) => {
    setEditingTask(task);
    setIsTaskModalOpen(true);
  };

  const handleClearCompleted = () => {
    setTasks((prev) => prev.filter((t) => !t.completed));
  };

  const handleClearAll = () => {
    setTasks([]);
  };

  const handleExportData = () => {
    exportDataAsJSON(tasks, categories);
  };

  const handleImportData = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const parsed = JSON.parse(text);
        if (parsed && Array.isArray(parsed.tasks)) {
          setTasks(parsed.tasks);
          if (Array.isArray(parsed.categories) && parsed.categories.length > 0) {
            setCategories(parsed.categories);
          }
        } else if (Array.isArray(parsed)) {
          setTasks(parsed);
        } else {
          alert('Invalid file format. Please upload a valid JSON backup file.');
        }
      } catch {
        alert('Could not parse JSON file. Please ensure it is a valid backup.');
      }
    };
    reader.readAsText(file);
  };

  const handleAddCategory = (newCat: Omit<Category, 'id'>) => {
    const id = `cat-${Date.now()}`;
    const category: Category = { ...newCat, id };
    setCategories((prev) => [...prev, category]);
  };

  const handleDeleteCategory = (categoryId: string) => {
    const fallbackCategory = categories.find((c) => c.id !== categoryId)?.id || 'work';
    setTasks((prev) =>
      prev.map((t) => (t.categoryId === categoryId ? { ...t, categoryId: fallbackCategory } : t))
    );
    setCategories((prev) => prev.filter((c) => c.id !== categoryId));
    if (filters.categoryId === categoryId) {
      setFilters((prev) => ({ ...prev, categoryId: 'all' }));
    }
  };

  const handleResetFilters = () => {
    setFilters({
      search: '',
      status: 'all',
      categoryId: 'all',
      priority: 'all',
      sortBy: 'priority-desc',
    });
  };

  const allCompleted = tasks.length > 0 && taskCounts.active === 0;

  return (
    <div className="min-h-screen bg-stone-50/50 py-8 px-4 sm:px-6 lg:px-8">
      <main id="main-content" className="max-w-3xl mx-auto">
        {/* Top Card */}
        <div className="bg-white rounded-2xl border border-stone-200/90 p-5 sm:p-7 shadow-xs">
          {/* Header */}
          <StatsHeader
            totalTasks={taskCounts.total}
            completedTasks={taskCounts.completed}
            soundEnabled={soundEnabled}
            onToggleSound={() => setSoundEnabled((prev) => !prev)}
            onOpenNewTaskModal={() => {
              setEditingTask(null);
              setIsTaskModalOpen(true);
            }}
            onClearCompleted={handleClearCompleted}
            onClearAll={handleClearAll}
            onExportData={handleExportData}
            onImportData={handleImportData}
          />

          {/* Inline Quick-Add Task Input */}
          <QuickAddTask
            categories={categories}
            onAddTask={handleQuickAdd}
            onOpenFullModal={() => {
              setEditingTask(null);
              setIsTaskModalOpen(true);
            }}
          />

          {/* Filters Bar: Search, Status, Priority, Categories, Sort */}
          <FilterBar
            filters={filters}
            onFilterChange={(newFilters) => setFilters((prev) => ({ ...prev, ...newFilters }))}
            categories={categories}
            taskCounts={taskCounts}
            onOpenCategoryModal={() => setIsCategoryModalOpen(true)}
            onResetFilters={handleResetFilters}
          />

          {/* Tasks List */}
          <div id="tasks-container" className="pt-1">
            {filteredTasks.length > 0 ? (
              <ul id="task-list" className="space-y-2.5">
                <AnimatePresence mode="popLayout" initial={false}>
                  {filteredTasks.map((task) => (
                    <TaskItem
                      key={task.id}
                      task={task}
                      category={categoryMap.get(task.categoryId)}
                      onToggleComplete={handleToggleComplete}
                      onDelete={handleDeleteTask}
                      onEdit={handleOpenEdit}
                    />
                  ))}
                </AnimatePresence>
              </ul>
            ) : (
              /* Production Empty States */
              <div
                id="empty-tasks-view"
                className="flex flex-col items-center justify-center py-12 px-4 text-center rounded-xl border border-dashed border-stone-200 bg-stone-50/40"
              >
                {tasks.length === 0 ? (
                  <>
                    <div className="w-12 h-12 rounded-2xl bg-stone-100 flex items-center justify-center text-stone-500 mb-3">
                      <CheckSquare className="w-6 h-6" />
                    </div>
                    <h3 className="text-base font-semibold text-stone-900">Your task list is clear</h3>
                    <p className="mt-1 text-xs text-stone-500 max-w-sm">
                      Type your task in the input box above and press Enter to quickly add it.
                    </p>
                  </>
                ) : allCompleted && filters.status !== 'completed' ? (
                  <>
                    <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600 mb-3">
                      <Award className="w-6 h-6" />
                    </div>
                    <h3 className="text-base font-semibold text-stone-900">All tasks completed!</h3>
                    <p className="mt-1 text-xs text-stone-500 max-w-sm">
                      You've finished everything on your list. Add a new task or take a well-deserved break.
                    </p>
                    <button
                      id="view-completed-tasks-btn"
                      type="button"
                      onClick={() => setFilters((prev) => ({ ...prev, status: 'completed' }))}
                      className="mt-3.5 px-3 py-1.5 text-xs font-medium text-stone-700 bg-stone-100 hover:bg-stone-200 rounded-lg transition-colors"
                    >
                      View completed tasks ({taskCounts.completed})
                    </button>
                  </>
                ) : (
                  <>
                    <div className="w-10 h-10 rounded-xl bg-stone-100 flex items-center justify-center text-stone-500 mb-3">
                      <FilterX className="w-5 h-5" />
                    </div>
                    <h3 className="text-base font-semibold text-stone-900">No matching tasks</h3>
                    <p className="mt-1 text-xs text-stone-500 max-w-sm">
                      No tasks matched your current filter criteria.
                    </p>
                    <button
                      id="empty-reset-filter-btn"
                      type="button"
                      onClick={handleResetFilters}
                      className="mt-3.5 px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-medium rounded-lg transition-colors"
                    >
                      Clear filters
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Footer info */}
        <footer className="mt-4 flex items-center justify-between px-2 text-[11px] text-stone-400">
          <span>Saved to your browser storage</span>
          <span>Tip: Press <kbd className="px-1 py-0.5 bg-stone-100 rounded text-stone-600 font-mono text-[10px]">N</kbd> to add task</span>
        </footer>
      </main>

      {/* Task Creation & Edit Modal */}
      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => {
          setIsTaskModalOpen(false);
          setEditingTask(null);
        }}
        onSave={handleSaveTask}
        initialTask={editingTask}
        categories={categories}
        onOpenCategoryModal={() => {
          setIsCategoryModalOpen(true);
        }}
      />

      {/* Categories Management Modal */}
      <CategoryModal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        categories={categories}
        onAddCategory={handleAddCategory}
        onDeleteCategory={handleDeleteCategory}
      />
    </div>
  );
}
