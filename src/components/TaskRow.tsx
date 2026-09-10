import React from 'react';
import { 
  Circle, 
  CheckCircle2, 
  Star, 
  Clock, 
  CheckSquare, 
  ChevronDown, 
  ChevronRight, 
  Trash2, 
  Sliders, 
  Check, 
  AlertTriangle, 
  Link2,
  CalendarClock
} from 'lucide-react';
import type { Task, Project, Subtask, CustomPriority } from '../types';
import { playCheckClick } from '../utils/sound';

interface TaskRowProps {
  task: Task;
  project?: Project;
  priorities: CustomPriority[];
  colorCardsByProject?: boolean;
  isSelected?: boolean;
  isBatchChecked?: boolean;
  onToggleBatchCheck?: (taskId: string) => void;
  onToggleComplete: (task: Task) => void;
  onToggleFocus: (task: Task) => void;
  onOpenDetail: (task: Task) => void;
  onUpdateTask: (task: Task) => void;
}

export const TaskRow: React.FC<TaskRowProps> = ({
  task,
  project,
  priorities,
  colorCardsByProject,
  isSelected,
  isBatchChecked,
  onToggleBatchCheck,
  onToggleComplete,
  onToggleFocus,
  onOpenDetail,
  onUpdateTask,
}) => {
  const [isExpanded, setIsExpanded] = React.useState(false);
  const [isRescheduleOpen, setIsRescheduleOpen] = React.useState(false);
  const [newSubtaskTitle, setNewSubtaskTitle] = React.useState('');

  const isCompleted = task.status === 'done';

  // Close reschedule popover on outside click
  React.useEffect(() => {
    if (!isRescheduleOpen) return;
    const handleClickOutside = () => setIsRescheduleOpen(false);
    window.addEventListener('click', handleClickOutside);
    return () => window.removeEventListener('click', handleClickOutside);
  }, [isRescheduleOpen]);

  const setTaskDate = (daysFromToday: number | null) => {
    const nowSec = Math.floor(Date.now() / 1000);
    if (daysFromToday === null) {
      onUpdateTask({ ...task, due_date: null, updated_at: nowSec });
    } else {
      const target = new Date();
      target.setDate(target.getDate() + daysFromToday);
      target.setHours(23, 59, 59, 999);
      const timestamp = Math.floor(target.getTime() / 1000);
      onUpdateTask({ ...task, due_date: timestamp, updated_at: nowSec });
    }
    setIsRescheduleOpen(false);
  };

  const handleCustomDate = (dateStr: string) => {
    if (!dateStr) return;
    const [y, m, d] = dateStr.split('-').map(Number);
    const target = new Date(y, m - 1, d, 23, 59, 59, 999);
    const timestamp = Math.floor(target.getTime() / 1000);
    const nowSec = Math.floor(Date.now() / 1000);
    onUpdateTask({ ...task, due_date: timestamp, updated_at: nowSec });
    setIsRescheduleOpen(false);
  };

  const getDaysUntilNextWeekend = () => {
    const day = new Date().getDay(); // 0 is Sun, 6 is Sat
    if (day === 6) return 7;
    if (day === 0) return 6;
    return 6 - day;
  };

  const getDaysUntilNextMonday = () => {
    const day = new Date().getDay(); // 0 is Sun, 1 is Mon
    if (day === 1) return 7;
    if (day === 0) return 1;
    return 8 - day;
  };

  const handleCheck = (e: React.MouseEvent) => {
    e.stopPropagation();
    playCheckClick();
    onToggleComplete(task);
  };

  const handleFocus = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleFocus(task);
  };

  const handleToggleExpand = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsExpanded(!isExpanded);
  };

  const handleToggleSubtask = (e: React.MouseEvent, subtaskId: string) => {
    e.stopPropagation();
    playCheckClick();
    const updatedSubtasks = (task.subtasks || []).map((st) => {
      if (st.id === subtaskId) {
        return { ...st, is_completed: !st.is_completed };
      }
      return st;
    });
    onUpdateTask({ ...task, subtasks: updatedSubtasks, updated_at: Math.floor(Date.now() / 1000) });
  };

  const handleDeleteSubtask = (e: React.MouseEvent, subtaskId: string) => {
    e.stopPropagation();
    const updatedSubtasks = (task.subtasks || []).filter((st) => st.id !== subtaskId);
    onUpdateTask({ ...task, subtasks: updatedSubtasks, updated_at: Math.floor(Date.now() / 1000) });
  };

  const handleAddSubtask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubtaskTitle.trim()) return;
    const newSt: Subtask = {
      id: `st_${Date.now()}`,
      task_id: task.id,
      title: newSubtaskTitle.trim(),
      is_completed: false,
      sort_order: (task.subtasks?.length || 0) + 1,
    };
    const updatedSubtasks = [...(task.subtasks || []), newSt];
    onUpdateTask({ ...task, subtasks: updatedSubtasks, updated_at: Math.floor(Date.now() / 1000) });
    setNewSubtaskTitle('');
  };

  const completedSubtasks = task.subtasks?.filter((s) => s.is_completed).length || 0;
  const totalSubtasks = task.subtasks?.length || 0;

  // Find priority from dynamic list
  const priorityConfig = priorities.find((p) => p.id === task.priority) || null;

  const paddingClass = 'py-2.5 px-3.5';

  // 3-Day Deadline Alert Logic (day-normalized)
  const getDeadlineAlert = (timestampSec: number | null, isDone: boolean) => {
    if (!timestampSec || isDone) return null;
    const dueDate = new Date(timestampSec * 1000);
    const now = new Date();
    // Normalize both to start of calendar day (midnight) in local timezone
    const dueDay = new Date(dueDate.getFullYear(), dueDate.getMonth(), dueDate.getDate()).getTime();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const diffDays = Math.round((dueDay - today) / 86400000);

    if (diffDays < 0) {
      return {
        label: 'Просрочено',
        className: 'bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/30 font-medium',
        icon: AlertTriangle,
      };
    }
    if (diffDays === 0) {
      return {
        label: 'Дедлайн сегодня',
        className: 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30 font-medium',
        icon: AlertTriangle,
      };
    }
    if (diffDays === 1) {
      return {
        label: 'Дедлайн завтра',
        className: 'bg-amber-500/10 text-amber-700 dark:text-amber-200 border-amber-500/20',
        icon: Clock,
      };
    }
    if (diffDays <= 3) {
      return {
        label: `Осталось ${diffDays} дн.`,
        className: 'bg-orange-500/10 text-orange-700 dark:text-orange-200 border-orange-500/20',
        icon: Clock,
      };
    }
    return null;
  };

  const deadlineAlert = getDeadlineAlert(task.due_date, isCompleted);

  const formatDate = (timestampSec: number | null) => {
    if (!timestampSec) return null;
    const d = new Date(timestampSec * 1000);
    return d.toLocaleDateString('ru-RU', { month: 'short', day: 'numeric' });
  };

  const dateLabel = formatDate(task.due_date);

  return (
    <div
      className={`ios-card select-none transition-all ${
        isSelected
          ? 'bg-[#242428] border-zinc-500/40'
          : isBatchChecked
          ? 'bg-[#222228] border-indigo-500/40'
          : 'bg-[#1c1c1e] border-white/[0.06]'
      }`}
      style={
        colorCardsByProject && project
          ? {
              borderLeftWidth: '3.5px',
              borderLeftColor: project.color,
              background: `linear-gradient(90deg, ${project.color}14 0%, var(--bg-card, #1c1c1e) 28%)`,
            }
          : undefined
      }
    >
      {/* Main Task Header Row */}
      <div
        onClick={handleToggleExpand}
        className={`task-row-header cursor-pointer select-none transition-all ${paddingClass}`}
      >
        {/* Row 1: Core interaction (Checkbox, Star, Chevron, Title) */}
        <div className="task-row-main">
          {/* Batch selection checkbox */}
          {onToggleBatchCheck && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleBatchCheck(task.id);
              }}
              className={`w-4 h-4 rounded-md border flex items-center justify-center transition shrink-0 ${
                isBatchChecked
                  ? 'bg-indigo-600 border-indigo-600 text-white'
                  : 'border-white/20 hover:border-white/40 bg-white/[0.02]'
              }`}
              title="Выбрать задачу"
            >
              {isBatchChecked && <Check size={11} strokeWidth={3} />}
            </button>
          )}

          {/* Expand/Collapse Accordion Chevron */}
          <button
            onClick={handleToggleExpand}
            title={isExpanded ? 'Свернуть описание и подзадачи' : 'Развернуть описание и подзадачи'}
            className="p-1 -ml-1 text-slate-400 hover:text-white transition rounded shrink-0"
          >
            {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          </button>

          {/* Status Checkbox */}
          <button
            onClick={handleCheck}
            title={isCompleted ? 'Вернуть в работу' : 'Завершить задачу'}
            className="text-slate-400 hover:text-emerald-400 transition shrink-0 p-1 -m-1"
          >
            {isCompleted ? (
              <CheckCircle2 size={17} className="text-emerald-400 fill-emerald-400/20" />
            ) : (
              <Circle size={17} className="hover:border-emerald-400" />
            )}
          </button>

          {/* Star for Focus */}
          <button
            onClick={handleFocus}
            title={task.is_focus ? 'Убрать из фокуса дня' : 'Сделать фокусом дня'}
            className={`transition shrink-0 p-1 -m-1 ${
              task.is_focus
                ? 'text-amber-400 fill-amber-400'
                : 'text-slate-500 hover:text-amber-400 opacity-20 hover:opacity-100'
            }`}
          >
            <Star size={14} className={task.is_focus ? 'fill-amber-400' : ''} />
          </button>

          {/* Task Title */}
          <span
            className={`text-xs sm:text-sm tracking-tight truncate transition flex-1 min-w-0 ${
              isCompleted
                ? 'line-through text-slate-500'
                : 'text-slate-200 font-normal'
            }`}
          >
            {task.title}
          </span>
        </div>

        {/* Row 2 (or right-aligned on wide card): Metadata Badges & Actions */}
        <div className="task-row-badges">
          {/* Priority pill with circular color indicator and full word label */}
          {priorityConfig && priorityConfig.id !== 'none' && (
            <span
              title={`Приоритет: ${priorityConfig.label}`}
              className="inline-flex items-center gap-1.5 text-[11px] font-medium px-2 py-0.5 rounded-full border shrink-0"
              style={{
                borderColor: `${priorityConfig.color}35`,
                backgroundColor: `${priorityConfig.color}12`,
                color: priorityConfig.color,
              }}
            >
              <span
                className="w-1.5 h-1.5 rounded-full shrink-0"
                style={{ backgroundColor: priorityConfig.color }}
              />
              {priorityConfig.label}
            </span>
          )}

          {/* 3-Day Deadline Alert badge */}
          {deadlineAlert && (
            <div
              title={`Дедлайн: ${dateLabel}`}
              className={`flex items-center gap-1 text-[11px] font-mono px-2 py-0.5 rounded-full border shrink-0 ${deadlineAlert.className}`}
            >
              <deadlineAlert.icon size={11} className="shrink-0" />
              <span>{deadlineAlert.label}</span>
            </div>
          )}

          {/* Subtasks counter */}
          {totalSubtasks > 0 && (
            <div
              title={`Подзадачи: ${completedSubtasks} из ${totalSubtasks}`}
              className="flex items-center gap-1 font-mono text-[11px] px-2 py-0.5 rounded-full bg-white/[0.04] text-slate-400 border border-white/[0.06] shrink-0"
            >
              <CheckSquare size={11} className="text-zinc-400" />
              <span>
                {completedSubtasks}/{totalSubtasks}
              </span>
            </div>
          )}

          {/* External Link button */}
          {task.link_url && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                let url = task.link_url!.trim();
                if (!/^https?:\/\//i.test(url)) url = `https://${url}`;
                window.open(url, '_blank', 'noopener,noreferrer');
              }}
              title={`Открыть ссылку: ${task.link_url}`}
              className="p-1 rounded-full text-indigo-400 hover:text-indigo-300 hover:bg-indigo-500/15 transition shrink-0"
            >
              <Link2 size={12} />
            </button>
          )}

          {/* Project pill */}
          {project && (
            <span
              className="inline-flex items-center gap-1.5 text-[11px] font-medium px-2 py-0.5 rounded-full bg-white/[0.04] border border-white/[0.06] shrink-0"
              style={{ color: project.color }}
            >
              <span
                className="w-1.5 h-1.5 rounded-full shrink-0"
                style={{ backgroundColor: project.color }}
              />
              {project.name}
            </span>
          )}

          {/* Regular calm date if no alert */}
          {!deadlineAlert && dateLabel && (
            <div className="flex items-center gap-1 text-[11px] font-mono text-slate-400 bg-white/[0.04] px-2 py-0.5 rounded-full border border-white/[0.06] shrink-0">
              <Clock size={11} />
              <span>{dateLabel}</span>
            </div>
          )}

          {/* Quick Reschedule Button & Popover */}
          <div className="relative" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsRescheduleOpen(!isRescheduleOpen);
              }}
              title="Перенести задачу на другой день"
              className={`p-1 rounded transition shrink-0 ${
                isRescheduleOpen
                  ? 'text-indigo-400 bg-indigo-500/20'
                  : 'text-slate-400 hover:text-white hover:bg-white/10'
              }`}
            >
              <CalendarClock size={13} />
            </button>

            {isRescheduleOpen && (
              <div
                onClick={(e) => e.stopPropagation()}
                className="absolute right-0 top-full mt-1.5 w-48 rounded-2xl bg-[#181a24] border border-white/10 shadow-2xl p-2 z-50 text-xs backdrop-blur-2xl animate-in fade-in zoom-in-95 duration-100 space-y-1.5 select-none"
              >
                <div className="px-1.5 py-0.5 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                  Перенести задачу
                </div>

                <div className="space-y-0.5">
                  <button
                    type="button"
                    onClick={() => setTaskDate(0)}
                    className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs text-slate-200 hover:text-white hover:bg-white/10 transition"
                  >
                    <span>Сегодня</span>
                    <span className="text-[10px] text-slate-500">23:59</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setTaskDate(1)}
                    className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs text-slate-200 hover:text-white hover:bg-white/10 transition"
                  >
                    <span>Завтра</span>
                    <span className="text-[10px] text-slate-500">+1 день</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setTaskDate(getDaysUntilNextWeekend())}
                    className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs text-slate-200 hover:text-white hover:bg-white/10 transition"
                  >
                    <span>В эти выходные</span>
                    <span className="text-[10px] text-slate-500">Сб</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setTaskDate(getDaysUntilNextMonday())}
                    className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs text-slate-200 hover:text-white hover:bg-white/10 transition"
                  >
                    <span>След. неделя</span>
                    <span className="text-[10px] text-slate-500">Пн</span>
                  </button>
                </div>

                <div className="pt-1.5 border-t border-white/[0.06] space-y-1">
                  <span className="px-1.5 text-[10px] text-slate-400 block font-medium">Выбрать дату:</span>
                  <input
                    type="date"
                    value={
                      task.due_date
                        ? new Date(task.due_date * 1000).toISOString().split('T')[0]
                        : ''
                    }
                    onChange={(e) => handleCustomDate(e.target.value)}
                    className="w-full bg-[#202330] text-slate-200 rounded-lg px-2 py-1 text-xs border border-white/10 focus:outline-none focus:border-indigo-500 cursor-pointer"
                  />
                </div>

                {task.due_date && (
                  <div className="pt-1 border-t border-white/[0.06]">
                    <button
                      type="button"
                      onClick={() => setTaskDate(null)}
                      className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs text-rose-400 hover:bg-rose-500/15 transition"
                    >
                      Убрать срок
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Button to open side details panel */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onOpenDetail(task);
            }}
            title="Открыть настройки задачи"
            className="p-1 rounded text-slate-400 hover:text-white hover:bg-white/10 transition shrink-0 task-row-slider-btn"
          >
            <Sliders size={13} />
          </button>
        </div>
      </div>

      {/* Accordion Body: Discreet description and subtasks */}
      {isExpanded && (
        <div className="px-4 pb-3 pt-1 border-t border-white/[0.05] space-y-2.5">
          {/* Discreet secondary description */}
          {task.description && (
            <p className="text-xs text-slate-400 pl-6 leading-relaxed font-normal">
              {task.description}
            </p>
          )}

          {/* Subtasks / Checklist */}
          <div className="pl-6 space-y-1.5">
            {task.subtasks && task.subtasks.length > 0 && (
              <div className="space-y-1">
                {task.subtasks.map((st) => (
                  <div
                    key={st.id}
                    className="group/st flex items-center justify-between gap-2 py-0.5"
                  >
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <button
                        onClick={(e) => handleToggleSubtask(e, st.id)}
                        className="text-slate-500 hover:text-emerald-400 transition"
                      >
                        {st.is_completed ? (
                          <CheckCircle2 size={14} className="text-emerald-400 fill-emerald-400/20" />
                        ) : (
                          <Circle size={14} />
                        )}
                      </button>

                      <span
                        className={`text-xs transition truncate ${
                          st.is_completed ? 'line-through text-slate-500' : 'text-slate-300'
                        }`}
                      >
                        {st.title}
                      </span>
                    </div>

                    <button
                      onClick={(e) => handleDeleteSubtask(e, st.id)}
                      className="opacity-70 sm:opacity-0 sm:group-hover/st:opacity-100 text-slate-500 hover:text-rose-400 transition p-1"
                      title="Удалить подзадачу"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Quick add subtask input */}
            <form onSubmit={handleAddSubtask} className="flex items-center gap-2 pt-1">
              <input
                type="text"
                value={newSubtaskTitle}
                onChange={(e) => setNewSubtaskTitle(e.target.value)}
                placeholder="+ Добавить подзадачу..."
                className="flex-1 bg-transparent border-b border-white/[0.08] py-0.5 text-xs text-slate-300 placeholder-slate-500 focus:outline-none focus:border-indigo-500/50 transition"
              />
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
