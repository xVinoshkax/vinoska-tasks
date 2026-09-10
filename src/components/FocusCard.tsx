import React from 'react';
import { Sparkles, CheckCircle2, Circle, Clock, CheckSquare, X, Sliders, AlertTriangle, Link2, CalendarClock } from 'lucide-react';
import type { Task, Project } from '../types';
import { playCheckClick } from '../utils/sound';

interface FocusCardProps {
  task: Task;
  project?: Project;
  colorCardsByProject?: boolean;
  showTaskTime?: boolean;
  onToggleComplete: (task: Task) => void;
  onOpenDetail: (task: Task) => void;
  onRemoveFocus: (task: Task) => void;
  onUpdateTask?: (task: Task) => void;
}

export const FocusCard: React.FC<FocusCardProps> = ({
  task,
  project,
  colorCardsByProject,
  showTaskTime,
  onToggleComplete,
  onOpenDetail,
  onRemoveFocus,
  onUpdateTask,
}) => {
  const [isRescheduleOpen, setIsRescheduleOpen] = React.useState(false);
  const isCompleted = task.status === 'done';

  // Close reschedule popover on outside click
  React.useEffect(() => {
    if (!isRescheduleOpen) return;
    const handleClickOutside = () => setIsRescheduleOpen(false);
    window.addEventListener('click', handleClickOutside);
    return () => window.removeEventListener('click', handleClickOutside);
  }, [isRescheduleOpen]);

  const setTaskDate = (daysFromToday: number | null) => {
    if (!onUpdateTask) return;
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
    if (!dateStr || !onUpdateTask) return;
    const [y, m, d] = dateStr.split('-').map(Number);
    const target = new Date(y, m - 1, d, 23, 59, 59, 999);
    const timestamp = Math.floor(target.getTime() / 1000);
    const nowSec = Math.floor(Date.now() / 1000);
    onUpdateTask({ ...task, due_date: timestamp, updated_at: nowSec });
    setIsRescheduleOpen(false);
  };

  const getDaysUntilNextWeekend = () => {
    const day = new Date().getDay();
    if (day === 6) return 7;
    if (day === 0) return 6;
    return 6 - day;
  };

  const getDaysUntilNextMonday = () => {
    const day = new Date().getDay();
    if (day === 1) return 7;
    if (day === 0) return 1;
    return 8 - day;
  };

  const handleComplete = (e: React.MouseEvent) => {
    e.stopPropagation();
    playCheckClick();
    onToggleComplete(task);
  };

  const handleUnpin = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    onRemoveFocus(task);
  };

  const completedSubtasks = task.subtasks?.filter(s => s.is_completed).length || 0;
  const totalSubtasks = task.subtasks?.length || 0;

  const getTaskTimeSnippet = (timestampSec: number | null) => {
    if (!timestampSec || !showTaskTime) return null;
    const d = new Date(timestampSec * 1000);
    const h = d.getHours();
    const m = d.getMinutes();
    const isAllDay = (h === 23 && m === 59) || (h === 0 && m === 0);
    if (isAllDay) return null;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
  };

  const timeSnippet = getTaskTimeSnippet(task.due_date);

  // 3-Day Deadline Alert Logic (day-normalized)
  const getDeadlineAlert = (timestampSec: number | null, isDone: boolean) => {
    if (!timestampSec || isDone) return null;
    const dueDate = new Date(timestampSec * 1000);
    const now = new Date();
    // Normalize both to start of calendar day (midnight) in local timezone
    const dueDay = new Date(dueDate.getFullYear(), dueDate.getMonth(), dueDate.getDate()).getTime();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const diffDays = Math.round((dueDay - today) / 86400000);

    const timeSuffix = timeSnippet ? ` · ${timeSnippet}` : '';

    if (diffDays < 0) {
      return {
        label: `Просрочено${timeSuffix}`,
        className: 'bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/30 font-medium',
        icon: AlertTriangle,
      };
    }
    if (diffDays === 0) {
      return {
        label: `Дедлайн сегодня${timeSuffix}`,
        className: 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30 font-medium',
        icon: AlertTriangle,
      };
    }
    if (diffDays === 1) {
      return {
        label: `Дедлайн завтра${timeSuffix}`,
        className: 'bg-amber-500/10 text-amber-700 dark:text-amber-200 border-amber-500/20',
        icon: Clock,
      };
    }
    if (diffDays <= 3) {
      return {
        label: `Осталось ${diffDays} дн.${timeSuffix}`,
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
    const baseDate = d.toLocaleDateString('ru-RU', { month: 'short', day: 'numeric' });
    return timeSnippet ? `${baseDate} · ${timeSnippet}` : baseDate;
  };

  const dateLabel = formatDate(task.due_date);

  return (
    <div
      className="ios-card relative p-4 bg-[#1c1c1e] border border-white/[0.08] shadow-md select-none transition-colors"
      style={
        colorCardsByProject && project
          ? {
              borderLeftWidth: '3.5px',
              borderLeftColor: project.color,
              background: `linear-gradient(90deg, ${project.color}16 0%, var(--bg-card, #1c1c1e) 28%)`,
            }
          : undefined
      }
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-2.5 flex-1 min-w-0">
          <button
            onClick={handleComplete}
            className="mt-0.5 text-slate-400 hover:text-emerald-400 transition shrink-0 p-1 -m-1"
            title={isCompleted ? 'Вернуть в работу' : 'Завершить задачу'}
          >
            {isCompleted ? (
              <CheckCircle2 size={18} className="text-emerald-400 fill-emerald-400/20" />
            ) : (
              <Circle size={18} className="hover:border-emerald-400" />
            )}
          </button>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-zinc-800 text-zinc-300 border border-zinc-700">
                <Sparkles size={10} className="text-amber-400 fill-amber-400" />
                Фокус дня
              </span>

              {project && (
                <span
                  className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-white/[0.04] border border-white/[0.06]"
                  style={{ color: project.color }}
                >
                  {project.name}
                </span>
              )}
            </div>

            <h3
              onClick={() => onOpenDetail(task)}
              className={`text-xs sm:text-sm font-semibold tracking-tight cursor-pointer hover:text-indigo-300 transition ${
                isCompleted ? 'line-through text-slate-500' : 'text-white'
              }`}
            >
              {task.title}
            </h3>

            {task.description && (
              <p className="text-xs text-slate-400 line-clamp-1 mt-0.5">
                {task.description}
              </p>
            )}

            <div className="flex items-center gap-2 mt-2.5 text-xs text-slate-400 flex-wrap">
              {/* Deadline alert */}
              {deadlineAlert && (
                <div
                  className={`flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-full border shrink-0 ${deadlineAlert.className}`}
                >
                  <deadlineAlert.icon size={10} className="shrink-0" />
                  <span>{deadlineAlert.label}</span>
                </div>
              )}

              {totalSubtasks > 0 && (
                <div className="flex items-center gap-1 font-mono text-[10px] px-2 py-0.5 rounded-full bg-white/[0.04] text-slate-400 border border-white/[0.06] shrink-0">
                  <CheckSquare size={11} className="text-zinc-400" />
                  <span>
                    {completedSubtasks}/{totalSubtasks} подзадач
                  </span>
                </div>
              )}

              {!deadlineAlert && dateLabel && (
                <div className="flex items-center gap-1 text-[10px] text-zinc-400 font-mono bg-white/[0.04] px-2 py-0.5 rounded-full border border-white/[0.06] shrink-0">
                  <Clock size={11} />
                  <span>{dateLabel}</span>
                </div>
              )}

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
                  className="flex items-center gap-1 text-[10px] font-medium text-indigo-400 hover:text-indigo-300 bg-indigo-500/10 hover:bg-indigo-500/20 px-2 py-0.5 rounded-full border border-indigo-500/20 transition"
                >
                  <Link2 size={10} />
                  <span>Ссылка</span>
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          {/* Quick Reschedule Button & Popover */}
          {onUpdateTask && (
            <div className="relative" onClick={(e) => e.stopPropagation()}>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsRescheduleOpen(!isRescheduleOpen);
                }}
                title="Перенести задачу на другой день"
                className={`p-1 rounded-lg transition ${
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
          )}

          <button
            onClick={() => onOpenDetail(task)}
            title="Настройки задачи"
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition"
          >
            <Sliders size={13} />
          </button>
          <button
            onClick={handleUnpin}
            title="Убрать из фокуса дня"
            className="p-1 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition"
          >
            <X size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};
