import React, { useState, useRef } from 'react';
import {
  Plus,
  Trash,
  MoreVertical,
  Download,
  Upload,
  Volume2,
  VolumeX,
  CheckCircle2,
  ListOrdered,
} from 'lucide-react';

interface StatsHeaderProps {
  totalTasks: number;
  completedTasks: number;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onOpenNewTaskModal: () => void;
  onClearCompleted: () => void;
  onClearAll: () => void;
  onExportData: () => void;
  onImportData: (file: File) => void;
}

export const StatsHeader: React.FC<StatsHeaderProps> = ({
  totalTasks,
  completedTasks,
  soundEnabled,
  onToggleSound,
  onOpenNewTaskModal,
  onClearCompleted,
  onClearAll,
  onExportData,
  onImportData,
}) => {
  const [showMenu, setShowMenu] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const activeTasks = totalTasks - completedTasks;
  const percentage = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onImportData(file);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    setShowMenu(false);
  };

  return (
    <header id="stats-header" className="mb-6 pt-1">
      {/* Hidden file input for import */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        className="hidden"
        onChange={handleFileChange}
      />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Title and stats info */}
        <div>
          <div className="flex items-center gap-2.5">
            <h1 id="app-title" className="text-2xl sm:text-3xl font-bold tracking-tight text-stone-900">
              Tasks
            </h1>
            <span
              id="active-count-badge"
              className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-stone-100 text-stone-700 border border-stone-200"
            >
              {activeTasks} {activeTasks === 1 ? 'task' : 'tasks'} pending
            </span>
          </div>

          <p id="app-progress-summary" className="mt-1 text-xs sm:text-sm text-stone-500">
            {totalTasks === 0
              ? 'All clear. Add a task below to plan your day.'
              : `${completedTasks} of ${totalTasks} completed (${percentage}%)`}
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          {/* Sound feedback toggle */}
          <button
            id="toggle-sound-btn"
            type="button"
            title={soundEnabled ? 'Completion chime enabled' : 'Completion chime muted'}
            onClick={onToggleSound}
            className="p-2 text-stone-500 hover:text-stone-800 hover:bg-stone-100 rounded-xl border border-stone-200 transition-colors"
          >
            {soundEnabled ? (
              <Volume2 className="w-4 h-4 text-stone-700" />
            ) : (
              <VolumeX className="w-4 h-4 text-stone-400" />
            )}
          </button>

          {/* Primary Action Button */}
          <button
            id="add-new-task-btn"
            type="button"
            onClick={onOpenNewTaskModal}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-stone-900 hover:bg-stone-800 active:scale-98 text-white text-sm font-medium rounded-xl shadow-xs transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>New Task</span>
          </button>

          {/* Options Dropdown Menu */}
          <div className="relative">
            <button
              id="header-options-menu-btn"
              type="button"
              title="Data and list options"
              onClick={() => setShowMenu((prev) => !prev)}
              className="p-2 text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-xl border border-stone-200 transition-colors"
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            {showMenu && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowMenu(false)}
                />
                <div
                  id="header-dropdown-menu"
                  className="absolute right-0 mt-1.5 w-52 bg-white rounded-xl shadow-lg border border-stone-200 py-1.5 z-50 text-xs font-medium animate-in fade-in zoom-in-95 duration-100"
                >
                  {/* Export */}
                  <button
                    id="export-data-menu-item"
                    type="button"
                    onClick={() => {
                      onExportData();
                      setShowMenu(false);
                    }}
                    className="w-full px-3.5 py-2 text-left text-stone-700 hover:bg-stone-50 flex items-center gap-2 transition-colors"
                  >
                    <Download className="w-3.5 h-3.5 text-stone-400" />
                    <span>Backup Tasks (Export JSON)</span>
                  </button>

                  {/* Import */}
                  <button
                    id="import-data-menu-item"
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full px-3.5 py-2 text-left text-stone-700 hover:bg-stone-50 flex items-center gap-2 transition-colors"
                  >
                    <Upload className="w-3.5 h-3.5 text-stone-400" />
                    <span>Restore Tasks (Import JSON)</span>
                  </button>

                  <div className="my-1 border-t border-stone-100" />

                  {/* Clear Completed */}
                  {completedTasks > 0 && (
                    <button
                      id="clear-completed-menu-item"
                      type="button"
                      onClick={() => {
                        onClearCompleted();
                        setShowMenu(false);
                      }}
                      className="w-full px-3.5 py-2 text-left text-stone-700 hover:bg-stone-50 flex items-center gap-2 transition-colors"
                    >
                      <Trash className="w-3.5 h-3.5 text-stone-400" />
                      <span>Clear Completed ({completedTasks})</span>
                    </button>
                  )}

                  {/* Clear All */}
                  {totalTasks > 0 && (
                    <button
                      id="clear-all-menu-item"
                      type="button"
                      onClick={() => {
                        if (window.confirm('Are you sure you want to remove all tasks? This action cannot be undone.')) {
                          onClearAll();
                        }
                        setShowMenu(false);
                      }}
                      className="w-full px-3.5 py-2 text-left text-rose-600 hover:bg-rose-50 flex items-center gap-2 transition-colors"
                    >
                      <Trash className="w-3.5 h-3.5 text-rose-400" />
                      <span>Delete All Tasks</span>
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Subtle Linear Progress Bar */}
      {totalTasks > 0 && (
        <div
          id="task-progress-track"
          className="mt-4 w-full h-1.5 bg-stone-200/80 rounded-full overflow-hidden"
        >
          <div
            id="task-progress-fill"
            className="h-full bg-stone-800 transition-all duration-300 rounded-full"
            style={{ width: `${percentage}%` }}
          />
        </div>
      )}
    </header>
  );
};
