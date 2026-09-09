import React from 'react';
import { Sparkles, CheckCircle2, Circle, Clock, CheckSquare, X, Sliders, AlertTriangle } from 'lucide-react';
import type { Task, Project } from '../types';
import { playCheckClick } from '../utils/sound';

interface FocusCardProps {
  task: Task;
  project?: Project;
  colorCardsByProject?: boolean;
  onToggleComplete: (task: Task) => void;
  onOpenDetail: (task: Task) => void;
  onRemoveFocus: (task: Task) => void;
}

export const FocusCard: React.FC<FocusCardProps> = ({
  task,
  project,
  colorCardsByProject,
  onToggleComplete,
  onOpenDetail,
  onRemoveFocus,
}) => {
  const isCompleted = task.status === 'done';

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

  // 3-Day Deadline Alert Logic
  const getDeadlineAlert = (timestampSec: number | null, isDone: boolean) => {
    if (!timestampSec || isDone) return null;
    const now = Math.floor(Date.now() / 1000);
    const diffSec = timestampSec - now;
    const diffDays = Math.ceil(diffSec / 86400);

    if (diffSec < 0) {
      return {
        label: 'Просрочено',
        className: 'bg-rose-500/15 text-rose-300 border-rose-500/30',
        icon: AlertTriangle,
      };
    }
    if (diffDays === 0) {
      return {
        label: 'Дедлайн сегодня!',
        className: 'bg-amber-500/15 text-amber-300 border-amber-500/30 font-medium',
        icon: AlertTriangle,
      };
    }
    if (diffDays === 1) {
      return {
        label: 'Дедлайн завтра',
        className: 'bg-amber-500/10 text-amber-200 border-amber-500/20',
        icon: Clock,
      };
    }
    if (diffDays <= 3) {
      return {
        label: `Осталось ${diffDays} дн.`,
        className: 'bg-orange-500/10 text-orange-200 border-orange-500/20',
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
            className="mt-0.5 text-slate-400 hover:text-emerald-400 transition shrink-0"
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

            <div className="flex items-center gap-2.5 mt-2.5 text-xs text-slate-400">
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
                <div className="flex items-center gap-1 font-mono text-[10px] px-2 py-0.5 rounded-full bg-white/[0.04] text-slate-400 border border-white/[0.06]">
                  <CheckSquare size={11} className="text-zinc-400" />
                  <span>
                    {completedSubtasks}/{totalSubtasks} подзадач
                  </span>
                </div>
              )}

              {!deadlineAlert && dateLabel && (
                <div className="flex items-center gap-1 text-[10px] text-zinc-400 font-mono bg-white/[0.04] px-2 py-0.5 rounded-full border border-white/[0.06]">
                  <Clock size={11} />
                  <span>{dateLabel}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1 shrink-0">
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
