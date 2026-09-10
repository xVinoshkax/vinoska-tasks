import React from 'react';
import { X, Calendar, Plus, Link as LinkIcon, Clock } from 'lucide-react';
import type { Project, CustomPriority, Task } from '../types';
import { playCheckClick } from '../utils/sound';

interface NewTaskForDateModalProps {
  isOpen: boolean;
  dateStr: string | null;
  initialHour?: number | null;
  projects: Project[];
  priorities: CustomPriority[];
  existingTasks: Task[];
  onClose: () => void;
  onCreateTask: (data: {
    title: string;
    due_date: number;
    priority: string;
    project_id: string | null;
    description?: string;
    link_url?: string;
  }) => void;
}

export const NewTaskForDateModal: React.FC<NewTaskForDateModalProps> = ({
  isOpen,
  dateStr,
  initialHour,
  projects,
  priorities,
  existingTasks,
  onClose,
  onCreateTask,
}) => {
  const [title, setTitle] = React.useState('');
  const [description, setDescription] = React.useState('');
  const [linkUrl, setLinkUrl] = React.useState('');
  const [timeStr, setTimeStr] = React.useState('');
  const [selectedPriority, setSelectedPriority] = React.useState('none');
  const [selectedProjectId, setSelectedProjectId] = React.useState<string | null>(null);
  const [showDetails, setShowDetails] = React.useState(false);

  const inputRef = React.useRef<HTMLInputElement>(null);

  // Focus input when modal opens
  React.useEffect(() => {
    if (isOpen) {
      setTitle('');
      setDescription('');
      setLinkUrl('');
      setTimeStr(
        initialHour !== undefined && initialHour !== null
          ? `${String(initialHour).padStart(2, '0')}:00`
          : ''
      );
      setSelectedPriority('none');
      setSelectedProjectId(null);
      setShowDetails(false);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen, dateStr, initialHour]);

  // Handle escape key
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !dateStr) return null;

  // Format Russian date
  const [year, month, day] = dateStr.split('-').map(Number);
  const targetDate =
    initialHour !== undefined && initialHour !== null
      ? new Date(year, month - 1, day, initialHour, 0, 0)
      : new Date(year, month - 1, day, 23, 59, 59);

  const formattedDate = targetDate.toLocaleDateString('ru-RU', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
  const capitalizedDate = formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1);
  const timeSnippet =
    initialHour !== undefined && initialHour !== null
      ? ` · ${String(initialHour).padStart(2, '0')}:00`
      : '';

  // Check if today / tomorrow
  const now = new Date();
  const isToday =
    now.getFullYear() === year &&
    now.getMonth() === month - 1 &&
    now.getDate() === day;

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!title.trim()) return;

    let finalDate: Date;
    if (timeStr.trim()) {
      const [h, m] = timeStr.split(':').map(Number);
      finalDate = new Date(year, month - 1, day, h, m, 0);
    } else if (initialHour !== undefined && initialHour !== null) {
      finalDate = new Date(year, month - 1, day, initialHour, 0, 0);
    } else {
      finalDate = new Date(year, month - 1, day, 23, 59, 59);
    }

    const due_date = Math.floor(finalDate.getTime() / 1000);

    onCreateTask({
      title: title.trim(),
      due_date,
      priority: selectedPriority,
      project_id: selectedProjectId,
      description: description.trim(),
      link_url: linkUrl.trim(),
    });

    playCheckClick();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150 select-none">
      <div
        className="w-full max-w-lg rounded-3xl bg-[#1c1c1e] border border-white/[0.1] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150 flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-5 pb-3 flex items-start justify-between border-b border-white/[0.08] bg-white/[0.02]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/15 border border-indigo-500/25 flex items-center justify-center text-indigo-400 shadow-sm">
              <Calendar size={18} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-semibold text-white tracking-tight">
                  Новая задача
                </h3>
                {isToday && (
                  <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    Сегодня
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {capitalizedDate}{timeSnippet}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* Existing tasks scheduled on this day preview */}
        {existingTasks.length > 0 && (
          <div className="px-5 py-2.5 bg-indigo-950/20 border-b border-indigo-900/30">
            <div className="flex items-center gap-1.5 text-[11px] font-medium text-indigo-300 mb-1.5">
              <Clock size={12} />
              <span>Запланировано на этот день ({existingTasks.length}):</span>
            </div>
            <div className="space-y-1 max-h-24 overflow-y-auto pr-1">
              {existingTasks.map((t) => (
                <div
                  key={t.id}
                  className="flex items-center justify-between text-xs py-0.5 px-2 rounded-lg bg-white/5 border border-white/5"
                >
                  <span className={`truncate ${t.status === 'done' ? 'line-through text-slate-400' : 'text-slate-200'}`}>
                    {t.title}
                  </span>
                  <span className="text-[10px] text-slate-400 shrink-0 ml-2">
                    {t.status === 'done' ? '✓ Выполнено' : 'В планах'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto flex-1">
          {/* Main Title Input */}
          <div>
            <input
              ref={inputRef}
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Что нужно сделать?..."
              className="w-full px-4 py-3 rounded-2xl bg-[#252528] border border-white/[0.08] text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 transition shadow-inner"
            />
          </div>

          {/* Time Selector */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-[#252528] border border-white/[0.08]">
            <div className="flex items-center gap-2 text-xs font-medium text-slate-300">
              <Clock size={14} className="text-indigo-500" />
              <span>Время задачи:</span>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="time"
                value={timeStr}
                onChange={(e) => setTimeStr(e.target.value)}
                className="bg-[#1c1c1e] text-xs text-white px-3 py-1.5 rounded-xl border border-white/10 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 cursor-pointer"
              />
              {timeStr ? (
                <button
                  type="button"
                  onClick={() => setTimeStr('')}
                  className="text-[10px] text-slate-400 hover:text-rose-400 transition"
                  title="Убрать точное время (на весь день)"
                >
                  Сбросить
                </button>
              ) : (
                <span className="text-[11px] text-slate-400 font-mono">Весь день</span>
              )}
            </div>
          </div>

          {/* Details / Notes (Optional Expandable) */}
          {showDetails ? (
            <div className="space-y-3 animate-in fade-in duration-150">
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Заметки или описание задачи..."
                rows={2}
                className="w-full px-4 py-2.5 rounded-2xl bg-[#252528] border border-white/[0.08] text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 resize-none transition"
              />

              <div className="relative">
                <div className="absolute inset-y-0 left-3.5 flex items-center pointer-events-none text-slate-400">
                  <LinkIcon size={13} />
                </div>
                <input
                  type="url"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  placeholder="Ссылка к задаче (https://...)"
                  className="w-full pl-9 pr-4 py-2 rounded-xl bg-[#252528] border border-white/[0.08] text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 transition"
                />
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setShowDetails(true)}
              className="text-xs text-indigo-400 hover:underline flex items-center gap-1 font-medium"
            >
              <Plus size={12} />
              <span>Добавить описание или ссылку</span>
            </button>
          )}

          {/* Priority Selector */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">
              Приоритет
            </label>
            <div className="flex flex-wrap gap-1.5">
              {priorities.map((p) => {
                const isSelected = selectedPriority === p.id;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setSelectedPriority(p.id)}
                    className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-medium transition-all active:scale-95 ${
                      isSelected
                        ? 'bg-indigo-600 text-white shadow-sm ring-1 ring-indigo-500/50'
                        : 'bg-white/[0.06] text-slate-300 hover:bg-white/10'
                    }`}
                  >
                    <span
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{ backgroundColor: p.color }}
                    />
                    <span>{p.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Project Selector */}
          {projects.length > 0 && (
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">
                Проект
              </label>
              <div className="flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={() => setSelectedProjectId(null)}
                  className={`px-2.5 py-1.5 rounded-xl text-xs font-medium transition-all active:scale-95 ${
                    selectedProjectId === null
                      ? 'bg-indigo-600 text-white shadow-sm ring-1 ring-indigo-500/50'
                      : 'bg-white/[0.06] text-slate-300 hover:bg-white/10'
                  }`}
                >
                  Входящие
                </button>
                {projects.map((proj) => {
                  const isSelected = selectedProjectId === proj.id;
                  return (
                    <button
                      key={proj.id}
                      type="button"
                      onClick={() => setSelectedProjectId(proj.id)}
                      className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-medium transition-all active:scale-95 ${
                        isSelected
                          ? 'bg-indigo-600 text-white shadow-sm ring-1 ring-indigo-500/50'
                          : 'bg-white/[0.06] text-slate-300 hover:bg-white/10'
                      }`}
                    >
                      <span
                        className="w-2 h-2 rounded-full shrink-0"
                        style={{ backgroundColor: proj.color }}
                      />
                      <span>{proj.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Modal Footer Buttons */}
          <div className="pt-3 border-t border-white/[0.08] flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:bg-white/5 hover:text-white transition"
            >
              Отмена
            </button>
            <button
              type="submit"
              disabled={!title.trim()}
              className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-semibold shadow-md shadow-indigo-500/25 transition-all active:scale-95 flex items-center gap-1.5"
            >
              <Plus size={14} />
              <span>Создать задачу</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
