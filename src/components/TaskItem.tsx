import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  Check,
  Calendar,
  Trash2,
  Edit2,
  Tag,
  AlertCircle,
  Clock,
} from 'lucide-react';
import { Category, Task } from '../types';
import { PRIORITY_CONFIG, getCategoryBadge, formatDueDate } from '../utils/storage';

interface TaskItemProps {
  task: Task;
  category?: Category;
  onToggleComplete: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (task: Task) => void;
}

export const TaskItem: React.FC<TaskItemProps> = ({
  task,
  category,
  onToggleComplete,
  onDelete,
  onEdit,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const priorityInfo = PRIORITY_CONFIG[task.priority] || PRIORITY_CONFIG.low;
  const categoryBadge = getCategoryBadge(category?.color || 'stone');
  const dueDateInfo = formatDueDate(task.dueDate);

  return (
    <motion.li
      id={`task-item-${task.id}`}
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96, transition: { duration: 0.15 } }}
      transition={{ duration: 0.2 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`group relative flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl border transition-all duration-200 ${
        task.completed
          ? 'bg-stone-50/70 border-stone-200/60 opacity-75'
          : 'bg-white border-stone-200/90 hover:border-stone-300 hover:shadow-xs'
      }`}
    >
      <div className="flex items-start gap-3.5 flex-1 min-w-0">
        {/* Completion checkbox button */}
        <button
          id={`toggle-complete-btn-${task.id}`}
          type="button"
          aria-label={task.completed ? 'Mark task as active' : 'Mark task as completed'}
          onClick={() => onToggleComplete(task.id)}
          className={`mt-0.5 relative flex items-center justify-center w-5 h-5 rounded-md border shrink-0 transition-colors focus:outline-hidden focus:ring-2 focus:ring-stone-400/50 ${
            task.completed
              ? 'bg-stone-800 border-stone-800 text-white'
              : 'border-stone-300 hover:border-stone-400 bg-white'
          }`}
        >
          {task.completed && (
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.15 }}
            >
              <Check className="w-3.5 h-3.5 stroke-[3]" />
            </motion.div>
          )}
        </button>

        {/* Task Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3
              className={`text-base font-medium leading-snug break-words transition-all ${
                task.completed
                  ? 'line-through text-stone-400 font-normal'
                  : 'text-stone-900'
              }`}
            >
              {task.title}
            </h3>
          </div>

          {task.description && (
            <p
              className={`mt-1 text-xs leading-relaxed line-clamp-2 ${
                task.completed ? 'text-stone-400' : 'text-stone-500'
              }`}
            >
              {task.description}
            </p>
          )}

          {/* Badges row */}
          <div className="mt-2.5 flex items-center gap-2 flex-wrap text-xs">
            {/* Priority Badge */}
            <span
              id={`priority-badge-${task.id}`}
              className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full font-medium ${priorityInfo.badgeClass}`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${priorityInfo.dotClass}`} />
              <span>{priorityInfo.label}</span>
            </span>

            {/* Category Badge */}
            {category && (
              <span
                id={`category-badge-${task.id}`}
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-medium ${categoryBadge.bg} ${categoryBadge.text} ${categoryBadge.ring}`}
              >
                <Tag className="w-2.5 h-2.5 opacity-70" />
                <span>{category.name}</span>
              </span>
            )}

            {/* Due date badge */}
            {dueDateInfo.text && (
              <span
                id={`due-date-badge-${task.id}`}
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-medium ${
                  dueDateInfo.isOverdue && !task.completed
                    ? 'bg-rose-50 text-rose-700 ring-1 ring-rose-600/20'
                    : dueDateInfo.isToday && !task.completed
                    ? 'bg-amber-50 text-amber-800 ring-1 ring-amber-600/20'
                    : 'bg-stone-100 text-stone-600 ring-1 ring-stone-400/20'
                }`}
              >
                {dueDateInfo.isOverdue && !task.completed ? (
                  <AlertCircle className="w-2.5 h-2.5" />
                ) : (
                  <Clock className="w-2.5 h-2.5 opacity-70" />
                )}
                <span>{dueDateInfo.text}</span>
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex items-center justify-end gap-1 shrink-0 pt-2 sm:pt-0 sm:border-t-0 border-t border-stone-100">
        <button
          id={`edit-task-btn-${task.id}`}
          type="button"
          title="Edit task"
          onClick={() => onEdit(task)}
          className="p-1.5 rounded-lg text-stone-500 hover:text-stone-800 hover:bg-stone-100 focus:outline-hidden focus:ring-2 focus:ring-stone-400/50 transition-colors"
        >
          <Edit2 className="w-4 h-4" />
        </button>

        <button
          id={`delete-task-btn-${task.id}`}
          type="button"
          title="Delete task"
          onClick={() => onDelete(task.id)}
          className="p-1.5 rounded-lg text-stone-400 hover:text-rose-600 hover:bg-rose-50 focus:outline-hidden focus:ring-2 focus:ring-rose-400/50 transition-colors"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </motion.li>
  );
};
