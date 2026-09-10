import React from 'react';
import { Search, Plus, Calendar, Inbox, Volume2, X, Settings2, Sparkles, CalendarDays } from 'lucide-react';
import type { Task, ViewFilter } from '../types';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  tasks: Task[];
  onSelectTask: (task: Task) => void;
  onSelectView: (view: ViewFilter) => void;
  onQuickAdd: () => void;
  onToggleSound: () => void;
  onOpenSettings?: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  tasks,
  onSelectTask,
  onSelectView,
  onQuickAdd,
  onToggleSound,
  onOpenSettings,
}) => {
  const [query, setQuery] = React.useState('');
  const inputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
    }
  }, [isOpen]);

  // Handle global shortcut Cmd+K or Ctrl+K
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
      } else if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const filteredTasks = tasks
    .filter((t) => t.title.toLowerCase().includes(query.toLowerCase()))
    .slice(0, 5);

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 px-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-150">
      <div className="w-full max-w-xl glass-panel rounded-2xl border border-white/15 shadow-2xl overflow-hidden flex flex-col bg-[#16181e]">
        {/* Search header */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-white/10">
          <Search size={18} className="text-slate-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Поиск по задачам или быстрые команды..."
            className="flex-1 bg-transparent text-sm text-white placeholder-slate-500 focus:outline-none"
          />
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition"
          >
            <X size={16} />
          </button>
        </div>

        {/* Results / Commands list */}
        <div className="max-h-80 overflow-y-auto p-2 space-y-1 text-xs">
          <div className="px-2 py-1 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Быстрые действия
          </div>

          {/* Quick Add */}
          <button
            onClick={() => {
              onClose();
              onQuickAdd();
            }}
            className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-slate-200 hover:bg-white/10 hover:text-white transition group"
          >
            <div className="flex items-center gap-2.5">
              <Plus size={16} className="text-emerald-400" />
              <span>Создать новую задачу</span>
            </div>
            <kbd className="font-mono text-[10px] bg-white/10 px-1.5 py-0.5 rounded text-slate-300">
              C
            </kbd>
          </button>

          {/* View Today */}
          {(!query || 'сегодня'.includes(query.toLowerCase())) && (
            <button
              onClick={() => {
                onClose();
                onSelectView('today');
              }}
              className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-slate-200 hover:bg-white/10 hover:text-white transition"
            >
              <div className="flex items-center gap-2.5">
                <Calendar size={16} className="text-amber-400" />
                <span>Перейти в «Сегодня»</span>
              </div>
            </button>
          )}

          {/* View Inbox */}
          {(!query || 'входящие'.includes(query.toLowerCase())) && (
            <button
              onClick={() => {
                onClose();
                onSelectView('inbox');
              }}
              className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-slate-200 hover:bg-white/10 hover:text-white transition"
            >
              <div className="flex items-center gap-2.5">
                <Inbox size={16} className="text-indigo-400" />
                <span>Перейти во «Входящие»</span>
              </div>
            </button>
          )}

          {/* View Habits */}
          {(!query || 'привычки'.includes(query.toLowerCase()) || 'habits'.includes(query.toLowerCase())) && (
            <button
              onClick={() => {
                onClose();
                onSelectView('habits');
              }}
              className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-slate-200 hover:bg-white/10 hover:text-white transition"
            >
              <div className="flex items-center gap-2.5">
                <Sparkles size={16} className="text-violet-400" />
                <span>Перейти в «Привычки»</span>
              </div>
            </button>
          )}

          {/* View Calendar */}
          {(!query || 'календарь'.includes(query.toLowerCase()) || 'calendar'.includes(query.toLowerCase())) && (
            <button
              onClick={() => {
                onClose();
                onSelectView('calendar');
              }}
              className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-slate-200 hover:bg-white/10 hover:text-white transition"
            >
              <div className="flex items-center gap-2.5">
                <CalendarDays size={16} className="text-pink-400" />
                <span>Перейти в «Календарь»</span>
              </div>
            </button>
          )}



          {/* Settings */}
          {(!query || 'настройки'.includes(query.toLowerCase())) && onOpenSettings && (
            <button
              onClick={() => {
                onClose();
                onOpenSettings();
              }}
              className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-slate-200 hover:bg-white/10 hover:text-white transition"
            >
              <div className="flex items-center gap-2.5">
                <Settings2 size={16} className="text-amber-400" />
                <span>Открыть настройки</span>
              </div>
            </button>
          )}

          {/* Toggle Sound */}
          {(!query || 'звук'.includes(query.toLowerCase())) && (
            <button
              onClick={() => {
                onClose();
                onToggleSound();
              }}
              className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-slate-200 hover:bg-white/10 hover:text-white transition"
            >
              <div className="flex items-center gap-2.5">
                <Volume2 size={16} className="text-emerald-400" />
                <span>Включить / выключить звуковые щелчки</span>
              </div>
            </button>
          )}

          {/* Matched tasks */}
          {filteredTasks.length > 0 && (
            <>
              <div className="px-2 pt-3 pb-1 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                Найденные задачи
              </div>
              {filteredTasks.map((t) => (
                <button
                  key={t.id}
                  onClick={() => {
                    onClose();
                    onSelectTask(t);
                  }}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-slate-200 hover:bg-white/10 hover:text-white transition text-left"
                >
                  <span className="truncate flex-1">{t.title}</span>
                  <span className="text-[10px] font-mono text-slate-400 ml-2">
                    {t.status === 'done' ? 'Выполнено' : 'В работе'}
                  </span>
                </button>
              ))}
            </>
          )}
        </div>

        {/* Footer shortcuts helper */}
        <div className="px-4 py-2.5 bg-black/30 border-t border-white/5 flex items-center justify-between text-[11px] text-slate-400">
          <span>Навигация: стрелки или клик</span>
          <div className="flex items-center gap-2 font-mono">
            <span>Esc закрыть</span>
            <span>↵ выбрать</span>
          </div>
        </div>
      </div>
    </div>
  );
};
