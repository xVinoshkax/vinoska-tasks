import React from 'react';
import { 
  X, 
  ChevronDown, 
  Star, 
  Link2, 
  CheckSquare,
  SlidersHorizontal,
  Check,
  RotateCcw
} from 'lucide-react';
import type { TaskFilters, Project, CustomPriority, ViewFilter } from '../types';

export type FilterKey = 'priority' | 'project' | 'dueDate' | 'focus' | 'link' | 'subtasks';

interface FilterMeta {
  id: FilterKey;
  label: string;
}

const ALL_FILTER_DEFS: FilterMeta[] = [
  { id: 'priority', label: 'Приоритет' },
  { id: 'project', label: 'Проект' },
  { id: 'dueDate', label: 'Срок выполнения' },
  { id: 'focus', label: 'Фокусные' },
  { id: 'link', label: 'Со ссылкой' },
  { id: 'subtasks', label: 'С подзадачами' },
];

const DEFAULT_VISIBLE_FILTERS: FilterKey[] = [
  'priority',
  'project',
  'dueDate',
  'focus',
  'link',
  'subtasks',
];

const STORAGE_KEY_VISIBLE_FILTERS = 'vinoska_visible_filters';

interface TaskFilterBarProps {
  filters: TaskFilters;
  onUpdateFilters: (next: TaskFilters) => void;
  onResetFilters: () => void;
  projects: Project[];
  priorities: CustomPriority[];
  activeView: ViewFilter;
  totalMatching: number;
  totalBase: number;
}

export const TaskFilterBar: React.FC<TaskFilterBarProps> = ({
  filters,
  onUpdateFilters,
  onResetFilters,
  projects,
  priorities,
  activeView,
  totalMatching,
  totalBase,
}) => {
  const [openDropdown, setOpenDropdown] = React.useState<'priority' | 'project' | 'dueDate' | 'customize' | null>(null);

  const [visibleFilters, setVisibleFilters] = React.useState<FilterKey[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_VISIBLE_FILTERS);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed as FilterKey[];
        }
      }
    } catch {
      // fallback
    }
    return DEFAULT_VISIBLE_FILTERS;
  });

  const toggleFilterVisibility = (key: FilterKey) => {
    setVisibleFilters((prev) => {
      let next: FilterKey[];
      if (prev.includes(key)) {
        if (prev.length <= 1) return prev;
        next = prev.filter((k) => k !== key);
      } else {
        next = [...prev, key];
      }
      try {
        localStorage.setItem(STORAGE_KEY_VISIBLE_FILTERS, JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  const resetVisibleFilters = () => {
    setVisibleFilters(DEFAULT_VISIBLE_FILTERS);
    try {
      localStorage.setItem(STORAGE_KEY_VISIBLE_FILTERS, JSON.stringify(DEFAULT_VISIBLE_FILTERS));
    } catch {}
  };

  // Close dropdown on outside click
  React.useEffect(() => {
    const handleOutside = () => setOpenDropdown(null);
    if (openDropdown) {
      window.addEventListener('click', handleOutside);
      return () => window.removeEventListener('click', handleOutside);
    }
  }, [openDropdown]);

  const activeCount = 
    (filters.priority ? 1 : 0) +
    (filters.projectId ? 1 : 0) +
    (filters.dueDate !== 'all' ? 1 : 0) +
    (filters.onlyFocus ? 1 : 0) +
    (filters.onlyWithLink ? 1 : 0) +
    (filters.onlyWithSubtasks ? 1 : 0);

  const isSpecificProjectView = !['inbox', 'today', 'upcoming', 'all', 'done', 'habits'].includes(activeView);

  const selectedPriority = priorities.find(p => p.id === filters.priority);
  const selectedProject = projects.find(p => p.id === filters.projectId);

  const dueDateLabels: Record<TaskFilters['dueDate'], string> = {
    all: 'Все сроки',
    overdue: 'Просрочено',
    today: 'Сегодня',
    this_week: 'На неделе',
    no_date: 'Без срока',
  };

  return (
    <div className="flex flex-wrap items-center justify-between gap-1.5 py-0.5 select-none text-xs">
      {/* Left side: Filter controls */}
      <div className="flex flex-wrap items-center gap-1.5 min-w-0">
        {/* Customize visible filters button */}
        <div className="relative" onClick={(e) => e.stopPropagation()}>
          <button
            type="button"
            onClick={() => setOpenDropdown(openDropdown === 'customize' ? null : 'customize')}
            title="Выбрать, какие фильтры показывать"
            className={`h-7 px-2.5 rounded-lg border transition flex items-center gap-1.5 text-[11px] ${
              openDropdown === 'customize'
                ? 'bg-white/10 text-white border-white/20'
                : 'bg-white/[0.03] hover:bg-white/[0.06] text-slate-400 hover:text-slate-200 border-white/[0.08]'
            }`}
          >
            <SlidersHorizontal size={11} className={activeCount > 0 ? 'text-indigo-400' : 'text-slate-400'} />
            <span className="hidden sm:inline">Фильтры</span>
            {activeCount > 0 && (
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
            )}
          </button>

          {openDropdown === 'customize' && (
            <div className="absolute top-full mt-1.5 left-0 w-52 rounded-xl bg-[#181a22] border border-white/10 shadow-2xl p-2 z-40 animate-in fade-in zoom-in-95 duration-100 backdrop-blur-xl">
              <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-white/[0.08] px-1">
                <span className="text-[11px] font-semibold text-white">Отображаемые фильтры</span>
                <button
                  type="button"
                  onClick={resetVisibleFilters}
                  className="text-[10px] text-slate-400 hover:text-indigo-300 transition flex items-center gap-0.5"
                  title="Показать все фильтры"
                >
                  <RotateCcw size={9} />
                  <span>Все</span>
                </button>
              </div>
              <div className="space-y-0.5">
                {ALL_FILTER_DEFS.map((f) => {
                  const isVisible = visibleFilters.includes(f.id);
                  return (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => toggleFilterVisibility(f.id)}
                      className={`w-full flex items-center justify-between px-2 py-1.5 rounded-lg text-xs transition ${
                        isVisible
                          ? 'text-white hover:bg-white/10'
                          : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
                      }`}
                    >
                      <span className="text-[11px]">{f.label}</span>
                      <span
                        className={`w-3.5 h-3.5 rounded flex items-center justify-center border transition ${
                          isVisible
                            ? 'bg-indigo-600 border-indigo-500 text-white'
                            : 'border-white/20 bg-white/[0.02]'
                        }`}
                      >
                        {isVisible && <Check size={10} />}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* 1. Priority Dropdown */}
        {visibleFilters.includes('priority') && (
          <div className="relative" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              onClick={() => setOpenDropdown(openDropdown === 'priority' ? null : 'priority')}
              className={`h-7 flex items-center gap-1.5 px-2.5 rounded-lg border text-[11px] transition ${
                filters.priority
                  ? 'bg-indigo-600/15 border-indigo-500/35 text-indigo-200 font-medium'
                  : 'bg-white/[0.03] hover:bg-white/[0.06] border-white/[0.07] text-slate-300'
              }`}
            >
              {selectedPriority ? (
                <span
                  className="w-1.5 h-1.5 rounded-full shrink-0"
                  style={{ backgroundColor: selectedPriority.color }}
                />
              ) : null}
              <span>{selectedPriority ? selectedPriority.label : 'Приоритет'}</span>
              {filters.priority ? (
                <span
                  onClick={(e) => {
                    e.stopPropagation();
                    onUpdateFilters({ ...filters, priority: null });
                  }}
                  className="hover:text-white p-0.5 rounded text-slate-400 hover:text-slate-200 ml-0.5"
                  title="Сбросить приоритет"
                >
                  <X size={10} />
                </span>
              ) : (
                <ChevronDown size={10} className="text-slate-400 opacity-60" />
              )}
            </button>

            {openDropdown === 'priority' && (
              <div className="absolute top-full mt-1.5 left-0 w-44 rounded-xl bg-[#181a22] border border-white/10 shadow-2xl p-1 z-40 space-y-0.5 animate-in fade-in zoom-in-95 duration-100 backdrop-blur-xl">
                <button
                  type="button"
                  onClick={() => {
                    onUpdateFilters({ ...filters, priority: null });
                    setOpenDropdown(null);
                  }}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition ${
                    filters.priority === null ? 'bg-white/10 text-white font-medium' : 'text-slate-300 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <span>Все приоритеты</span>
                </button>

                {priorities.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => {
                      onUpdateFilters({ ...filters, priority: p.id });
                      setOpenDropdown(null);
                    }}
                    className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition ${
                      filters.priority === p.id ? 'bg-white/10 text-white font-medium' : 'text-slate-300 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className="w-2 h-2 rounded-full shrink-0"
                        style={{ backgroundColor: p.color }}
                      />
                      <span>{p.label}</span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 2. Project Dropdown (only when not already inside a specific project) */}
        {visibleFilters.includes('project') && !isSpecificProjectView && (
          <div className="relative" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              onClick={() => setOpenDropdown(openDropdown === 'project' ? null : 'project')}
              className={`h-7 flex items-center gap-1.5 px-2.5 rounded-lg border text-[11px] transition ${
                filters.projectId
                  ? 'bg-indigo-600/15 border-indigo-500/35 text-indigo-200 font-medium'
                  : 'bg-white/[0.03] hover:bg-white/[0.06] border-white/[0.07] text-slate-300'
              }`}
            >
              {selectedProject ? (
                <span
                  className="w-1.5 h-1.5 rounded-full shrink-0"
                  style={{ backgroundColor: selectedProject.color }}
                />
              ) : null}
              <span className="truncate max-w-[90px]">{selectedProject ? selectedProject.name : 'Проект'}</span>
              {filters.projectId ? (
                <span
                  onClick={(e) => {
                    e.stopPropagation();
                    onUpdateFilters({ ...filters, projectId: null });
                  }}
                  className="hover:text-white p-0.5 rounded text-slate-400 hover:text-slate-200 ml-0.5"
                  title="Сбросить проект"
                >
                  <X size={10} />
                </span>
              ) : (
                <ChevronDown size={10} className="text-slate-400 opacity-60" />
              )}
            </button>

            {openDropdown === 'project' && (
              <div className="absolute top-full mt-1.5 left-0 w-44 rounded-xl bg-[#181a22] border border-white/10 shadow-2xl p-1 z-40 space-y-0.5 animate-in fade-in zoom-in-95 duration-100 backdrop-blur-xl">
                <button
                  type="button"
                  onClick={() => {
                    onUpdateFilters({ ...filters, projectId: null });
                    setOpenDropdown(null);
                  }}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition ${
                    filters.projectId === null ? 'bg-white/10 text-white font-medium' : 'text-slate-300 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <span>Все проекты</span>
                </button>

                {projects.map((proj) => (
                  <button
                    key={proj.id}
                    type="button"
                    onClick={() => {
                      onUpdateFilters({ ...filters, projectId: proj.id });
                      setOpenDropdown(null);
                    }}
                    className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition ${
                      filters.projectId === proj.id ? 'bg-white/10 text-white font-medium' : 'text-slate-300 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <span
                        className="w-2 h-2 rounded-full shrink-0"
                        style={{ backgroundColor: proj.color }}
                      />
                      <span className="truncate">{proj.name}</span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 3. Due Date Dropdown */}
        {visibleFilters.includes('dueDate') && (
          <div className="relative" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              onClick={() => setOpenDropdown(openDropdown === 'dueDate' ? null : 'dueDate')}
              className={`h-7 flex items-center gap-1.5 px-2.5 rounded-lg border text-[11px] transition ${
                filters.dueDate !== 'all'
                  ? 'bg-indigo-600/15 border-indigo-500/35 text-indigo-200 font-medium'
                  : 'bg-white/[0.03] hover:bg-white/[0.06] border-white/[0.07] text-slate-300'
              }`}
            >
              <span>{dueDateLabels[filters.dueDate]}</span>
              {filters.dueDate !== 'all' ? (
                <span
                  onClick={(e) => {
                    e.stopPropagation();
                    onUpdateFilters({ ...filters, dueDate: 'all' });
                  }}
                  className="hover:text-white p-0.5 rounded text-slate-400 hover:text-slate-200 ml-0.5"
                  title="Сбросить срок"
                >
                  <X size={10} />
                </span>
              ) : (
                <ChevronDown size={10} className="text-slate-400 opacity-60" />
              )}
            </button>

            {openDropdown === 'dueDate' && (
              <div className="absolute top-full mt-1.5 left-0 w-40 rounded-xl bg-[#181a22] border border-white/10 shadow-2xl p-1 z-40 space-y-0.5 animate-in fade-in zoom-in-95 duration-100 backdrop-blur-xl">
                {(Object.keys(dueDateLabels) as TaskFilters['dueDate'][]).map((key) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => {
                      onUpdateFilters({ ...filters, dueDate: key });
                      setOpenDropdown(null);
                    }}
                    className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition ${
                      filters.dueDate === key ? 'bg-white/10 text-white font-medium' : 'text-slate-300 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <span>{dueDateLabels[key]}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 4. Quick Flag: Focus */}
        {visibleFilters.includes('focus') && (
          <button
            type="button"
            onClick={() => onUpdateFilters({ ...filters, onlyFocus: !filters.onlyFocus })}
            className={`h-7 flex items-center gap-1.5 px-2.5 rounded-lg border text-[11px] transition ${
              filters.onlyFocus
                ? 'bg-amber-500/15 border-amber-500/35 text-amber-300 font-medium shadow-sm'
                : 'bg-white/[0.03] hover:bg-white/[0.06] border-white/[0.07] text-slate-400 hover:text-slate-200'
            }`}
            title="Показать только фокусные задачи"
          >
            <Star size={11} className={filters.onlyFocus ? 'fill-amber-400 text-amber-400' : ''} />
            <span>Фокус</span>
          </button>
        )}

        {/* 6. Quick Flag: Link */}
        {visibleFilters.includes('link') && (
          <button
            type="button"
            onClick={() => onUpdateFilters({ ...filters, onlyWithLink: !filters.onlyWithLink })}
            className={`h-7 flex items-center gap-1.5 px-2.5 rounded-lg border text-[11px] transition ${
              filters.onlyWithLink
                ? 'bg-indigo-500/15 border-indigo-500/35 text-indigo-200 font-medium shadow-sm'
                : 'bg-white/[0.03] hover:bg-white/[0.06] border-white/[0.07] text-slate-400 hover:text-slate-200'
            }`}
            title="Показать задачи со ссылкой"
          >
            <Link2 size={11} />
            <span>Ссылка</span>
          </button>
        )}

        {/* 7. Quick Flag: Subtasks */}
        {visibleFilters.includes('subtasks') && (
          <button
            type="button"
            onClick={() => onUpdateFilters({ ...filters, onlyWithSubtasks: !filters.onlyWithSubtasks })}
            className={`h-7 flex items-center gap-1.5 px-2.5 rounded-lg border text-[11px] transition ${
              filters.onlyWithSubtasks
                ? 'bg-indigo-500/15 border-indigo-500/35 text-indigo-200 font-medium shadow-sm'
                : 'bg-white/[0.03] hover:bg-white/[0.06] border-white/[0.07] text-slate-400 hover:text-slate-200'
            }`}
            title="Показать задачи с чек-листом"
          >
            <CheckSquare size={11} />
            <span>Чек-лист</span>
          </button>
        )}
      </div>

      {/* Right side: Active count / Reset button / Result counter */}
      <div className="flex items-center gap-2 text-slate-400 text-[11px] shrink-0">
        {activeCount > 0 && (
          <button
            type="button"
            onClick={onResetFilters}
            className="flex items-center gap-1 px-2 py-0.5 rounded-lg text-[11px] text-rose-400/90 hover:text-rose-300 hover:bg-rose-500/15 border border-rose-500/25 transition font-medium"
            title="Сбросить все примененные фильтры"
          >
            <X size={11} />
            <span>Сбросить ({activeCount})</span>
          </button>
        )}

        {totalMatching !== totalBase && (
          <span className="font-mono text-[10px] text-slate-400 bg-white/[0.04] px-2 py-0.5 rounded-md border border-white/[0.06]">
            {totalMatching} из {totalBase}
          </span>
        )}
      </div>
    </div>
  );
};