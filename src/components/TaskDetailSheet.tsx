import React from 'react';
import { 
  X, 
  Trash2, 
  CheckSquare, 
  Play, 
  Pause, 
  RotateCcw, 
  Timer, 
  CheckCircle2, 
  Circle,
  Calendar,
  Repeat,
  ChevronDown,
  Check,
  Link2,
  ExternalLink
} from 'lucide-react';
import type { Task, Project, CustomPriority, RecurringType } from '../types';
import { playCheckClick, playChime } from '../utils/sound';

interface TaskDetailSheetProps {
  task: Task | null;
  projects: Project[];
  priorities: CustomPriority[];
  isOpen: boolean;
  onClose: () => void;
  onUpdateTask: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
  onPomodoroComplete?: () => void;
}

const DAYS_OF_WEEK = [
  { id: 1, label: 'Пн' },
  { id: 2, label: 'Вт' },
  { id: 3, label: 'Ср' },
  { id: 4, label: 'Чт' },
  { id: 5, label: 'Пт' },
  { id: 6, label: 'Сб' },
  { id: 7, label: 'Вс' },
];

export const TaskDetailSheet: React.FC<TaskDetailSheetProps> = ({
  task,
  projects,
  priorities,
  isOpen,
  onClose,
  onUpdateTask,
  onDeleteTask,
  onPomodoroComplete,
}) => {
  const [newSubtaskTitle, setNewSubtaskTitle] = React.useState('');
  const [isPriorityMenuOpen, setIsPriorityMenuOpen] = React.useState(false);
  
  // Pomodoro timer state (25 min default = 1500 sec)
  const [pomodoroSeconds, setPomodoroSeconds] = React.useState(1500);
  const [isPomodoroRunning, setIsPomodoroRunning] = React.useState(false);

  React.useEffect(() => {
    let interval: number | null = null;
    if (isPomodoroRunning && pomodoroSeconds > 0) {
      interval = window.setInterval(() => {
        setPomodoroSeconds((prev) => prev - 1);
      }, 1000);
    } else if (pomodoroSeconds === 0 && isPomodoroRunning) {
      setIsPomodoroRunning(false);
      playChime();
      if (onPomodoroComplete) onPomodoroComplete();
      alert('⏱️ Время фокуса вышло! Отличная работа.');
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPomodoroRunning, pomodoroSeconds, onPomodoroComplete]);

  React.useEffect(() => {
    if (isPomodoroRunning) {
      const mins = Math.floor(pomodoroSeconds / 60);
      const secs = pomodoroSeconds % 60;
      document.title = `[ ${mins}:${secs < 10 ? '0' : ''}${secs} ] Фокус | ${task?.title || 'VINOSKA TASKS'}`;
    } else {
      document.title = 'VINOSKA TASKS';
    }
  }, [isPomodoroRunning, pomodoroSeconds, task]);

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !task) return null;

  const formatTimer = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const handleTitleChange = (newTitle: string) => {
    onUpdateTask({ ...task, title: newTitle, updated_at: Math.floor(Date.now() / 1000) });
  };

  const handleDescriptionChange = (newDesc: string) => {
    onUpdateTask({ ...task, description: newDesc, updated_at: Math.floor(Date.now() / 1000) });
  };

  const handleLinkChange = (newLink: string) => {
    onUpdateTask({ ...task, link_url: newLink, updated_at: Math.floor(Date.now() / 1000) });
  };

  const handleOpenLink = (url: string) => {
    let target = url.trim();
    if (!target) return;
    if (!/^https?:\/\//i.test(target)) {
      target = `https://${target}`;
    }
    window.open(target, '_blank', 'noopener,noreferrer');
  };

  const handlePriorityChange = (priority: string) => {
    onUpdateTask({ ...task, priority, updated_at: Math.floor(Date.now() / 1000) });
  };

  const handleProjectChange = (projectId: string | null) => {
    onUpdateTask({ ...task, project_id: projectId, updated_at: Math.floor(Date.now() / 1000) });
  };

  const handleRecurringTypeChange = (recurring_type: RecurringType) => {
    onUpdateTask({
      ...task,
      recurring_type,
      recurring_days: recurring_type === 'weekly_days' ? (task.recurring_days || [1, 2, 3, 4, 5]) : task.recurring_days,
      updated_at: Math.floor(Date.now() / 1000),
    });
  };

  const handleToggleDay = (dayId: number) => {
    const current = task.recurring_days || [];
    const next = current.includes(dayId)
      ? current.filter(d => d !== dayId)
      : [...current, dayId].sort();
    onUpdateTask({ ...task, recurring_days: next, updated_at: Math.floor(Date.now() / 1000) });
  };

  const handleDateChange = (dateStr: string) => {
    if (!dateStr) {
      onUpdateTask({ ...task, due_date: null, updated_at: Math.floor(Date.now() / 1000) });
    } else {
      const timestamp = Math.floor(new Date(dateStr).getTime() / 1000);
      onUpdateTask({ ...task, due_date: timestamp, updated_at: Math.floor(Date.now() / 1000) });
    }
  };

  const handleAddSubtask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubtaskTitle.trim()) return;
    const newSubtask = {
      id: `st_${Date.now()}`,
      task_id: task.id,
      title: newSubtaskTitle.trim(),
      is_completed: false,
      sort_order: (task.subtasks?.length || 0) + 1,
    };
    const updatedSubtasks = [...(task.subtasks || []), newSubtask];
    onUpdateTask({ ...task, subtasks: updatedSubtasks, updated_at: Math.floor(Date.now() / 1000) });
    setNewSubtaskTitle('');
  };

  const handleToggleSubtask = (subtaskId: string) => {
    playCheckClick();
    const updatedSubtasks = (task.subtasks || []).map((st) => {
      if (st.id === subtaskId) {
        return { ...st, is_completed: !st.is_completed };
      }
      return st;
    });
    onUpdateTask({ ...task, subtasks: updatedSubtasks, updated_at: Math.floor(Date.now() / 1000) });
  };

  const handleDeleteSubtask = (subtaskId: string) => {
    const updatedSubtasks = (task.subtasks || []).filter((st) => st.id !== subtaskId);
    onUpdateTask({ ...task, subtasks: updatedSubtasks, updated_at: Math.floor(Date.now() / 1000) });
  };

  const dateInputValue = task.due_date
    ? new Date(task.due_date * 1000).toISOString().split('T')[0]
    : '';

  const currentPriority = priorities.find(p => p.id === task.priority) || priorities[0];
  const isCompleted = task.status === 'done';

  const handleToggleComplete = () => {
    playCheckClick();
    const now = Math.floor(Date.now() / 1000);
    const nextStatus = isCompleted ? 'todo' : 'done';
    onUpdateTask({
      ...task,
      status: nextStatus,
      completed_at: !isCompleted ? now : null,
      updated_at: now,
    });
  };

  return (
    <aside className="w-[400px] shrink-0 h-full flex flex-col border-l border-white/[0.08] bg-[#121214] z-20">
      {/* Header bar: exact h-14 shrink-0, matching main header precisely */}
      <div className="h-14 shrink-0 px-4 border-b border-white/[0.08] flex items-center justify-between bg-[#121214]">
        <div className="flex items-center gap-2">
          {/* Complete / Active Toggle Button */}
          <button
            type="button"
            onClick={handleToggleComplete}
            className={`flex items-center gap-1.5 border text-xs rounded-full px-3 py-1.5 font-medium transition ${
              isCompleted
                ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/25'
                : 'bg-[#1c1c1e] hover:bg-[#252528] border-white/10 text-slate-300 hover:text-white'
            }`}
          >
            {isCompleted ? (
              <CheckCircle2 size={13} className="text-emerald-400" />
            ) : (
              <Circle size={13} />
            )}
            <span>{isCompleted ? 'Выполнено' : 'Завершить'}</span>
          </button>

          {/* Custom Priority Dropdown with color circle indicators */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsPriorityMenuOpen(!isPriorityMenuOpen)}
              className="flex items-center gap-1.5 bg-[#1c1c1e] hover:bg-[#252528] border border-white/10 text-xs rounded-full px-3 py-1.5 text-slate-200 transition"
            >
              <span
                className="w-2 h-2 rounded-full shrink-0 shadow-sm"
                style={{ backgroundColor: currentPriority?.color || '#64748b' }}
              />
              <span className="font-medium truncate max-w-[90px]">{currentPriority?.label || 'Приоритет'}</span>
              <ChevronDown size={12} className="text-slate-400 ml-0.5" />
            </button>

            {isPriorityMenuOpen && (
              <>
                <div
                  className="fixed inset-0 z-30"
                  onClick={() => setIsPriorityMenuOpen(false)}
                />
                <div className="absolute top-full mt-1.5 left-0 w-44 rounded-2xl bg-[#1c1c1e] border border-white/10 shadow-2xl p-1.5 z-40 space-y-0.5 animate-in fade-in zoom-in-95 duration-100 backdrop-blur-xl">
                  {priorities.map((p) => {
                    const isSelected = task.priority === p.id;
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => {
                          handlePriorityChange(p.id);
                          setIsPriorityMenuOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs transition ${
                          isSelected
                            ? 'bg-white/10 text-white font-medium'
                            : 'text-slate-300 hover:text-white hover:bg-white/5'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span
                            className="w-2.5 h-2.5 rounded-full shrink-0 shadow-sm"
                            style={{ backgroundColor: p.color }}
                          />
                          <span>{p.label}</span>
                        </div>
                        {isSelected && <Check size={12} className="text-white" />}
                      </button>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => onDeleteTask(task.id)}
            title="Удалить задачу"
            className="p-1.5 rounded-full text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition"
          >
            <Trash2 size={15} />
          </button>
          <button
            onClick={onClose}
            title="Закрыть панель (Esc)"
            className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      {/* Content body */}
      <div className="flex-1 overflow-y-auto p-5 space-y-4">
        {/* Editable Title */}
        <textarea
          value={task.title}
          onChange={(e) => handleTitleChange(e.target.value)}
          placeholder="Название задачи..."
          rows={2}
          className="w-full bg-transparent text-base font-semibold tracking-tight text-white focus:outline-none resize-none border-b border-white/[0.08] focus:border-indigo-500 pb-2 transition"
        />

        {/* Pomodoro Focus Timer Widget */}
        <div className="p-3.5 rounded-2xl bg-[#1c1c1e] border border-white/[0.06] shadow-sm">
          <div className="flex items-center justify-between mb-2.5">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-300">
              <Timer size={14} className="text-indigo-400" />
              <span>Таймер Фокуса (Pomodoro)</span>
            </div>
            <span className="text-base font-mono font-bold text-white tracking-wider">
              {formatTimer(pomodoroSeconds)}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsPomodoroRunning(!isPomodoroRunning)}
              className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-full text-xs font-semibold transition ${
                isPomodoroRunning
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 backdrop-blur-md hover:bg-amber-500/30'
                  : 'ios-glass-btn'
              }`}
            >
              {isPomodoroRunning ? (
                <>
                  <Pause size={13} /> Пауза
                </>
              ) : (
                <>
                  <Play size={13} className="text-white fill-white" /> Старт 25 мин
                </>
              )}
            </button>

            <button
              onClick={() => {
                setIsPomodoroRunning(false);
                setPomodoroSeconds(1500);
              }}
              title="Сбросить таймер"
              className="ios-glass-btn p-2 rounded-full text-slate-300 hover:text-white transition"
            >
              <RotateCcw size={13} />
            </button>
          </div>
        </div>

        {/* Properties grid: Project & Due Date Calendar */}
        <div className="grid grid-cols-2 gap-2.5 text-xs">
          {/* Project */}
          <div className="p-3 rounded-2xl bg-[#1c1c1e] border border-white/[0.06] space-y-1">
            <span className="text-slate-400 block font-medium">Проект</span>
            <select
              value={task.project_id || ''}
              onChange={(e) => handleProjectChange(e.target.value || null)}
              className="w-full bg-[#242428] text-slate-200 focus:outline-none cursor-pointer rounded-lg p-1.5"
            >
              <option value="" className="bg-[#242428] text-slate-200">Без проекта</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id} className="bg-[#242428] text-slate-200">
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          {/* Due Date mini calendar */}
          <div className="p-3 rounded-2xl bg-[#1c1c1e] border border-white/[0.06] space-y-1">
            <span className="text-slate-400 block font-medium flex items-center gap-1">
              <Calendar size={12} className="text-slate-400" />
              Дата выполнения
            </span>
            <input
              type="date"
              value={dateInputValue}
              onChange={(e) => handleDateChange(e.target.value)}
              className="w-full bg-[#242428] text-slate-200 rounded-lg p-1.5 text-xs focus:outline-none border border-transparent focus:border-indigo-500 cursor-pointer"
            />
          </div>
        </div>

        {/* Recurring Settings with Specific Days of the Week */}
        <div className="p-3.5 rounded-2xl bg-[#1c1c1e] border border-white/[0.06] space-y-2.5 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-slate-300 font-medium flex items-center gap-1.5">
              <Repeat size={13} className="text-indigo-400" />
              Повторение задачи
            </span>
            <select
              value={task.recurring_type || 'none'}
              onChange={(e) => handleRecurringTypeChange(e.target.value as RecurringType)}
              className="bg-[#242428] text-slate-200 rounded-lg px-2.5 py-1 focus:outline-none border border-white/10"
            >
              <option value="none">Без повтора</option>
              <option value="daily">Каждый день</option>
              <option value="weekly_days">По дням недели</option>
              <option value="weekly">Раз в неделю</option>
              <option value="monthly">Раз в месяц</option>
            </select>
          </div>

          {/* Days of week selector if 'weekly_days' chosen */}
          {task.recurring_type === 'weekly_days' && (
            <div className="pt-2 border-t border-white/[0.05] space-y-1.5">
              <span className="text-[11px] text-slate-400 block">Дни повторения:</span>
              <div className="flex items-center gap-1 justify-between">
                {DAYS_OF_WEEK.map((day) => {
                  const isSelected = (task.recurring_days || []).includes(day.id);
                  return (
                    <button
                      key={day.id}
                      type="button"
                      onClick={() => handleToggleDay(day.id)}
                      className={`w-7 h-7 rounded-full text-[11px] font-medium transition ${
                        isSelected
                          ? 'ios-glass-btn bg-white/20 border-white/30 text-white font-semibold shadow-sm'
                          : 'bg-white/[0.04] text-slate-400 hover:text-white'
                      }`}
                    >
                      {day.label}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Link / URL Field */}
        <div className="p-3.5 rounded-2xl bg-[#1c1c1e] border border-white/[0.06] space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-slate-300 font-medium flex items-center gap-1.5">
              <Link2 size={13} className="text-indigo-400" />
              Прикрепленная ссылка
            </span>
            {task.link_url && (
              <button
                type="button"
                onClick={() => handleOpenLink(task.link_url || '')}
                className="flex items-center gap-1 text-[11px] text-indigo-400 hover:text-indigo-300 font-medium transition py-0.5 px-2 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20"
                title="Открыть ссылку в новой вкладке"
              >
                <span>Открыть</span>
                <ExternalLink size={11} />
              </button>
            )}
          </div>
          <div className="relative flex items-center">
            <input
              type="url"
              value={task.link_url || ''}
              onChange={(e) => handleLinkChange(e.target.value)}
              placeholder="https://... (ссылка на документ, Figma, GitHub, PR)"
              className="w-full bg-[#242428] text-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none border border-transparent focus:border-indigo-500/50 transition placeholder-slate-500"
            />
          </div>
        </div>

        {/* Subtasks / Checklist */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-slate-400">
            <span className="flex items-center gap-1.5">
              <CheckSquare size={13} className="text-indigo-400" />
              Чек-лист (Подзадачи)
            </span>
            <span>
              {task.subtasks?.filter((s) => s.is_completed).length || 0} /{' '}
              {task.subtasks?.length || 0}
            </span>
          </div>

          {/* Subtasks list */}
          <div className="space-y-1">
            {task.subtasks?.map((st) => (
              <div
                key={st.id}
                className="group flex items-center justify-between gap-2 p-1.5 rounded-lg bg-[#1c1c1e] hover:bg-[#242428] border border-white/[0.04] transition"
              >
                <button
                  onClick={() => handleToggleSubtask(st.id)}
                  className="text-slate-400 hover:text-emerald-400 transition"
                >
                  {st.is_completed ? (
                    <CheckCircle2 size={15} className="text-emerald-400 fill-emerald-400/20" />
                  ) : (
                    <Circle size={15} />
                  )}
                </button>

                <span
                  className={`flex-1 text-xs transition ${
                    st.is_completed ? 'line-through text-slate-500' : 'text-slate-200'
                  }`}
                >
                  {st.title}
                </span>

                <button
                  onClick={() => handleDeleteSubtask(st.id)}
                  className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-rose-400 transition p-0.5"
                >
                  <X size={13} />
                </button>
              </div>
            ))}
          </div>

          {/* Add subtask input */}
          <form onSubmit={handleAddSubtask} className="flex items-center gap-2 mt-1">
            <input
              type="text"
              value={newSubtaskTitle}
              onChange={(e) => setNewSubtaskTitle(e.target.value)}
              placeholder="+ Добавить пункт чеклиста..."
              className="flex-1 bg-[#1c1c1e] border border-white/[0.08] rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 transition"
            />
          </form>
        </div>

        {/* Description & Notes */}
        <div className="space-y-1.5">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block">
            Заметки и описание
          </span>
          <textarea
            value={task.description || ''}
            onChange={(e) => handleDescriptionChange(e.target.value)}
            placeholder="Добавь подробности, ссылки, идеи или цитаты..."
            rows={4}
            className="w-full bg-[#1c1c1e] border border-white/[0.08] rounded-2xl p-3 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 resize-y leading-relaxed"
          />
        </div>
      </div>
    </aside>
  );
};
