import React from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Calendar as CalendarIcon, 
  Clock, 
  CheckCircle2, 
  Circle, 
  Filter, 
  X, 
  LayoutGrid, 
  CalendarDays, 
  CalendarRange 
} from 'lucide-react';
import type { Task, Project, CustomPriority, CalendarScale } from '../types';
import { playCheckClick, playChime } from '../utils/sound';

interface CalendarFullViewProps {
  tasks: Task[];
  projects: Project[];
  priorities: CustomPriority[];
  onUpdateTask: (task: Task) => void;
  onToggleComplete: (task: Task) => void;
  onOpenDetail: (task: Task) => void;
  onCreateTaskForDate: (dateStr: string, hour?: number) => void;
}

const WEEKDAY_NAMES_SHORT = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
const MONTH_NAMES = [
  'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
  'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
];
const MONTH_NAMES_GENITIVE = [
  'января', 'февраля', 'марта', 'апреля', 'мая', 'июня',
  'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'
];

const HOUR_HEIGHT = 56; // Height in px for 1 hour row

export const CalendarFullView: React.FC<CalendarFullViewProps> = ({
  tasks,
  projects,
  priorities: _priorities,
  onUpdateTask,
  onToggleComplete,
  onOpenDetail,
  onCreateTaskForDate,
}) => {
  const [scale, setScale] = React.useState<CalendarScale>('month');
  const [currentDate, setCurrentDate] = React.useState<Date>(() => new Date());
  const [selectedProjectId, setSelectedProjectId] = React.useState<string | 'all'>('all');
  const [showCompleted, setShowCompleted] = React.useState<boolean>(true);

  // Day overflow modal state (when "+N ещё" is clicked in month grid)
  const [dayModalDate, setDayModalDate] = React.useState<string | null>(null);

  // Drag-and-drop state
  const [draggedTaskId, setDraggedTaskId] = React.useState<string | null>(null);
  const [dragOverDate, setDragOverDate] = React.useState<string | null>(null);
  const [dragOverHour, setDragOverHour] = React.useState<number | null>(null);

  // Scroll refs for week and day timelines
  const weekTimelineScrollRef = React.useRef<HTMLDivElement>(null);
  const dayTimelineScrollRef = React.useRef<HTMLDivElement>(null);

  // Current system time updater (for live time indicator line)
  const [now, setNow] = React.useState<Date>(() => new Date());
  React.useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  // Auto-scroll timeline to current hour on view switch or load
  React.useEffect(() => {
    const scrollTarget = Math.max(0, (now.getHours() - 1) * HOUR_HEIGHT);
    const scroll = () => {
      if (scale === 'week' && weekTimelineScrollRef.current) {
        weekTimelineScrollRef.current.scrollTop = scrollTarget;
      } else if (scale === 'day' && dayTimelineScrollRef.current) {
        dayTimelineScrollRef.current.scrollTop = scrollTarget;
      }
    };
    const t = setTimeout(scroll, 30);
    return () => clearTimeout(t);
  }, [scale, now]);

  const todayStr = React.useMemo(() => {
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(now.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }, [now]);

  // Filter tasks
  const filteredTasks = React.useMemo(() => {
    return tasks.filter((t) => {
      if (!t.due_date) return false;
      if (!showCompleted && t.status === 'done') return false;
      if (selectedProjectId !== 'all' && t.project_id !== selectedProjectId) return false;
      return true;
    });
  }, [tasks, showCompleted, selectedProjectId]);

  // Map tasks by date string (YYYY-MM-DD)
  const tasksByDate = React.useMemo(() => {
    const map: Record<string, Task[]> = {};
    filteredTasks.forEach((t) => {
      if (!t.due_date) return;
      const d = new Date(t.due_date * 1000);
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      const dStr = `${y}-${m}-${day}`;
      if (!map[dStr]) map[dStr] = [];
      map[dStr].push(t);
    });

    // Sort tasks in each day: incomplete first, then by time or created_at
    Object.keys(map).forEach((k) => {
      map[k].sort((a, b) => {
        if (a.status === 'done' && b.status !== 'done') return 1;
        if (a.status !== 'done' && b.status === 'done') return -1;
        return (a.due_date || 0) - (b.due_date || 0);
      });
    });

    return map;
  }, [filteredTasks]);

  // Navigation handlers
  const handleJumpToday = () => {
    setCurrentDate(new Date());
  };

  const handlePrev = () => {
    if (scale === 'month') {
      setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    } else if (scale === 'week') {
      const d = new Date(currentDate);
      d.setDate(d.getDate() - 7);
      setCurrentDate(d);
    } else {
      const d = new Date(currentDate);
      d.setDate(d.getDate() - 1);
      setCurrentDate(d);
    }
  };

  const handleNext = () => {
    if (scale === 'month') {
      setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    } else if (scale === 'week') {
      const d = new Date(currentDate);
      d.setDate(d.getDate() + 7);
      setCurrentDate(d);
    } else {
      const d = new Date(currentDate);
      d.setDate(d.getDate() + 1);
      setCurrentDate(d);
    }
  };

  // Week calculation (Monday - Sunday)
  const weekDays = React.useMemo(() => {
    const d = new Date(currentDate);
    const dayOfWeek = d.getDay() === 0 ? 6 : d.getDay() - 1; // 0 = Mon, 6 = Sun
    const monday = new Date(d);
    monday.setDate(d.getDate() - dayOfWeek);
    monday.setHours(0, 0, 0, 0);

    const days: { date: Date; dateStr: string; dayNum: number; dayLabel: string; isToday: boolean }[] = [];
    for (let i = 0; i < 7; i++) {
      const curr = new Date(monday);
      curr.setDate(monday.getDate() + i);
      const y = curr.getFullYear();
      const m = String(curr.getMonth() + 1).padStart(2, '0');
      const day = String(curr.getDate()).padStart(2, '0');
      const dateStr = `${y}-${m}-${day}`;
      days.push({
        date: curr,
        dateStr,
        dayNum: curr.getDate(),
        dayLabel: WEEKDAY_NAMES_SHORT[i],
        isToday: dateStr === todayStr,
      });
    }
    return days;
  }, [currentDate, todayStr]);

  // Month grid cells calculation
  const monthCells = React.useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const firstDayIndex = new Date(year, month, 1).getDay();
    const startOffset = firstDayIndex === 0 ? 6 : firstDayIndex - 1; // Mon = 0

    const daysInCurrentMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();

    const cells: {
      dateStr: string;
      dayNum: number;
      isCurrentMonth: boolean;
      isToday: boolean;
      isWeekend: boolean;
    }[] = [];

    // Preceding days from previous month
    for (let i = startOffset - 1; i >= 0; i--) {
      const dayNum = daysInPrevMonth - i;
      const prevDate = new Date(year, month - 1, dayNum);
      const y = prevDate.getFullYear();
      const m = String(prevDate.getMonth() + 1).padStart(2, '0');
      const d = String(dayNum).padStart(2, '0');
      const dateStr = `${y}-${m}-${d}`;
      const dayOfWeek = prevDate.getDay();
      cells.push({
        dateStr,
        dayNum,
        isCurrentMonth: false,
        isToday: dateStr === todayStr,
        isWeekend: dayOfWeek === 0 || dayOfWeek === 6,
      });
    }

    // Days in current month
    for (let d = 1; d <= daysInCurrentMonth; d++) {
      const currDate = new Date(year, month, d);
      const m = String(month + 1).padStart(2, '0');
      const day = String(d).padStart(2, '0');
      const dateStr = `${year}-${m}-${day}`;
      const dayOfWeek = currDate.getDay();
      cells.push({
        dateStr,
        dayNum: d,
        isCurrentMonth: true,
        isToday: dateStr === todayStr,
        isWeekend: dayOfWeek === 0 || dayOfWeek === 6,
      });
    }

    // Trailing days from next month
    const remaining = (7 - (cells.length % 7)) % 7;
    for (let d = 1; d <= remaining; d++) {
      const nextDate = new Date(year, month + 1, d);
      const y = nextDate.getFullYear();
      const m = String(nextDate.getMonth() + 1).padStart(2, '0');
      const day = String(d).padStart(2, '0');
      const dateStr = `${y}-${m}-${day}`;
      const dayOfWeek = nextDate.getDay();
      cells.push({
        dateStr,
        dayNum: d,
        isCurrentMonth: false,
        isToday: dateStr === todayStr,
        isWeekend: dayOfWeek === 0 || dayOfWeek === 6,
      });
    }

    return cells;
  }, [currentDate, todayStr]);

  // Header Title
  const headerTitle = React.useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    if (scale === 'month') {
      return `${MONTH_NAMES[month]} ${year}`;
    }

    if (scale === 'week') {
      const start = weekDays[0].date;
      const end = weekDays[6].date;
      if (start.getMonth() === end.getMonth()) {
        return `${start.getDate()} – ${end.getDate()} ${MONTH_NAMES_GENITIVE[start.getMonth()]} ${start.getFullYear()}`;
      }
      return `${start.getDate()} ${MONTH_NAMES_GENITIVE[start.getMonth()]} – ${end.getDate()} ${MONTH_NAMES_GENITIVE[end.getMonth()]} ${end.getFullYear()}`;
    }

    // Day scale
    const dayOfWeek = WEEKDAY_NAMES_SHORT[currentDate.getDay() === 0 ? 6 : currentDate.getDay() - 1];
    return `${dayOfWeek}, ${currentDate.getDate()} ${MONTH_NAMES_GENITIVE[month]} ${year}`;
  }, [currentDate, scale, weekDays]);

  // Drag & Drop Handlers
  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    e.dataTransfer.setData('text/plain', taskId);
    e.dataTransfer.effectAllowed = 'move';
    setDraggedTaskId(taskId);
  };

  const handleDragEnd = () => {
    setDraggedTaskId(null);
    setDragOverDate(null);
    setDragOverHour(null);
  };

  const handleDropOnDate = (dateStr: string, hour?: number) => {
    if (!draggedTaskId) return;
    const task = tasks.find((t) => t.id === draggedTaskId);
    if (!task) return;

    const [y, m, d] = dateStr.split('-').map(Number);
    const targetDate = new Date(y, m - 1, d);

    if (hour !== undefined) {
      targetDate.setHours(hour, 0, 0, 0);
    } else if (task.due_date) {
      // Preserve existing hour if task had one
      const prevDate = new Date(task.due_date * 1000);
      targetDate.setHours(prevDate.getHours(), prevDate.getMinutes(), 0, 0);
    } else {
      targetDate.setHours(23, 59, 59, 999);
    }

    const nextTimestamp = Math.floor(targetDate.getTime() / 1000);
    playChime();
    onUpdateTask({
      ...task,
      due_date: nextTimestamp,
      updated_at: Math.floor(Date.now() / 1000),
    });

    handleDragEnd();
  };

  // Helper to format task time label (e.g. "14:30" or null if all-day)
  const getTaskTimeLabel = (timestampSec: number | null): string | null => {
    if (!timestampSec) return null;
    const d = new Date(timestampSec * 1000);
    const h = d.getHours();
    const m = d.getMinutes();
    if ((h === 23 && m === 59) || (h === 0 && m === 0)) return null;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
  };

  // Helper to test if task belongs to a specific hour
  const isTaskInHour = (task: Task, hour: number): boolean => {
    if (!task.due_date) return false;
    const d = new Date(task.due_date * 1000);
    const h = d.getHours();
    const m = d.getMinutes();
    if ((h === 23 && m === 59) || (h === 0 && m === 0)) return false; // all day
    return h === hour;
  };

  const isTaskAllDay = (task: Task): boolean => {
    if (!task.due_date) return true;
    const d = new Date(task.due_date * 1000);
    const h = d.getHours();
    const m = d.getMinutes();
    return (h === 23 && m === 59) || (h === 0 && m === 0);
  };

  // Current time position percentage for live indicator (0% to 100%)
  const nowMinutesFromMidnight = now.getHours() * 60 + now.getMinutes();
  const nowIndicatorTopPx = (nowMinutesFromMidnight / 60) * HOUR_HEIGHT;

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-transparent select-none">
      {/* Top Toolbar */}
      <div className="shrink-0 px-4 sm:px-6 py-3 border-b border-white/[0.08] bg-[#121214] flex flex-wrap items-center justify-between gap-3 z-10">
        {/* Left: Navigation Controls & Period Title */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 bg-white/[0.04] border border-white/[0.08] rounded-full p-0.5 shadow-sm">
            <button
              onClick={handlePrev}
              title="Предыдущий период"
              className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={handleJumpToday}
              className="text-xs font-medium px-2.5 py-1 text-indigo-400 hover:text-indigo-300 transition"
            >
              Сегодня
            </button>
            <button
              onClick={handleNext}
              title="Следующий период"
              className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition"
            >
              <ChevronRight size={16} />
            </button>
          </div>

          <h2 className="text-sm sm:text-base font-bold text-white tracking-tight">
            {headerTitle}
          </h2>
        </div>

        {/* Right: Scale Switcher & Filter Tools */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Project Filter */}
          <div className="flex items-center gap-1.5 bg-white/[0.04] border border-white/[0.08] rounded-full px-2.5 py-1 text-xs text-slate-300">
            <Filter size={12} className="text-slate-400" />
            <select
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
              className="bg-transparent text-xs focus:outline-none cursor-pointer"
            >
              <option value="all">Все проекты</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          {/* Show Completed Toggle */}
          <button
            onClick={() => setShowCompleted(!showCompleted)}
            title={showCompleted ? 'Скрыть выполненные' : 'Показать выполненные'}
            className={`flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full border transition ${
              showCompleted
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                : 'text-slate-400 border-white/[0.08] hover:text-white'
            }`}
          >
            <CheckCircle2 size={12} />
            <span className="hidden sm:inline">Готовые</span>
          </button>

          {/* Scale Switcher Tabs */}
          <div className="flex items-center bg-white/[0.06] p-0.5 rounded-xl border border-white/[0.08]">
            <button
              onClick={() => setScale('month')}
              className={`flex items-center gap-1 text-xs font-medium px-3 py-1 rounded-lg transition ${
                scale === 'month'
                  ? 'bg-[#1f2128] text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <LayoutGrid size={13} />
              <span>Месяц</span>
            </button>
            <button
              onClick={() => setScale('week')}
              className={`flex items-center gap-1 text-xs font-medium px-3 py-1 rounded-lg transition ${
                scale === 'week'
                  ? 'bg-[#1f2128] text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <CalendarRange size={13} />
              <span>Неделя</span>
            </button>
            <button
              onClick={() => setScale('day')}
              className={`flex items-center gap-1 text-xs font-medium px-3 py-1 rounded-lg transition ${
                scale === 'day'
                  ? 'bg-[#1f2128] text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <CalendarDays size={13} />
              <span>День (24ч)</span>
            </button>
          </div>

          {/* New Task Button */}
          <button
            onClick={() => onCreateTaskForDate(todayStr)}
            className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white transition shadow-sm"
          >
            <Plus size={14} />
            <span className="hidden sm:inline">Задача</span>
          </button>
        </div>
      </div>

      {/* Main Calendar View Area */}
      <div className="flex-1 overflow-hidden relative flex flex-col bg-transparent">
        {/* ========================================================================= */}
        {/* SCALE 1: MONTH VIEW (7x5 or 7x6 Grid) */}
        {/* ========================================================================= */}
        {scale === 'month' && (
          <div className="flex-1 flex flex-col h-full p-2 sm:p-4 overflow-y-auto">
            {/* Weekday headers */}
            <div className="grid grid-cols-7 gap-1.5 mb-1 text-center font-mono text-xs font-medium text-slate-400">
              {WEEKDAY_NAMES_SHORT.map((name, idx) => (
                <div
                  key={name}
                  className={`py-1.5 rounded-lg ${
                    idx >= 5 ? 'text-rose-400/80 bg-rose-500/[0.04]' : 'bg-white/[0.02]'
                  }`}
                >
                  {name}
                </div>
              ))}
            </div>

            {/* Month Day Cells */}
            <div className="grid grid-cols-7 gap-1.5 flex-1 min-h-[500px]">
              {monthCells.map((cell) => {
                const dayTasks = tasksByDate[cell.dateStr] || [];
                const isOver = dragOverDate === cell.dateStr;
                const visibleTasks = dayTasks.slice(0, 3);
                const overflowCount = dayTasks.length - 3;

                return (
                  <div
                    key={cell.dateStr}
                    onDragOver={(e) => {
                      e.preventDefault();
                      setDragOverDate(cell.dateStr);
                    }}
                    onDragLeave={() => {
                      if (dragOverDate === cell.dateStr) setDragOverDate(null);
                    }}
                    onDrop={(e) => {
                      e.preventDefault();
                      handleDropOnDate(cell.dateStr);
                    }}
                    className={`group relative flex flex-col rounded-xl border p-1.5 sm:p-2 transition-all min-h-[90px] sm:min-h-[110px] ${
                      isOver
                        ? 'bg-indigo-500/20 border-indigo-400 shadow-md ring-2 ring-indigo-500/40'
                        : cell.isToday
                        ? 'bg-amber-500/[0.06] border-amber-500/30 ring-1 ring-amber-500/20'
                        : cell.isCurrentMonth
                        ? 'bg-[#161820] border-white/[0.06] hover:border-white/20'
                        : 'bg-[#111217] border-transparent opacity-45'
                    }`}
                  >
                    {/* Cell Header: Day Number + Add Button */}
                    <div className="flex items-center justify-between mb-1">
                      <span
                        className={`text-xs font-mono font-semibold px-1.5 py-0.5 rounded-md ${
                          cell.isToday
                            ? 'bg-amber-500 text-black font-bold shadow-sm'
                            : cell.isCurrentMonth
                            ? 'text-slate-200'
                            : 'text-slate-500'
                        }`}
                      >
                        {cell.dayNum}
                      </span>

                      {/* Quick Add Button */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onCreateTaskForDate(cell.dateStr);
                        }}
                        className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition"
                        title={`Добавить задачу на ${cell.dateStr}`}
                      >
                        <Plus size={12} />
                      </button>
                    </div>

                    {/* Tasks in Cell */}
                    <div className="flex-1 space-y-1 overflow-hidden">
                      {visibleTasks.map((t) => {
                        const project = projects.find((p) => p.id === t.project_id);
                        const isDone = t.status === 'done';
                        const timeLabel = getTaskTimeLabel(t.due_date);

                        return (
                          <div
                            key={t.id}
                            draggable
                            onDragStart={(e) => handleDragStart(e, t.id)}
                            onDragEnd={handleDragEnd}
                            onClick={() => onOpenDetail(t)}
                            className={`flex items-center gap-1.5 px-1.5 py-0.5 rounded-lg text-[11px] font-medium border cursor-pointer transition-all hover:scale-[1.02] active:scale-95 select-none truncate group/item ${
                              isDone
                                ? 'bg-white/[0.02] border-white/5 text-slate-500 line-through'
                                : 'bg-[#1e2029] border-white/[0.08] hover:border-white/20 text-slate-200 hover:text-white shadow-sm'
                            }`}
                            style={
                              project && !isDone
                                ? {
                                    borderLeftWidth: '3px',
                                    borderLeftColor: project.color,
                                  }
                                : undefined
                            }
                          >
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                playCheckClick();
                                onToggleComplete(t);
                              }}
                              className="text-slate-400 hover:text-emerald-400 transition shrink-0"
                            >
                              {isDone ? (
                                <CheckCircle2 size={11} className="text-emerald-400 fill-emerald-400/20" />
                              ) : (
                                <Circle size={11} />
                              )}
                            </button>

                            {timeLabel && (
                              <span className="text-[9px] font-mono text-indigo-300/90 shrink-0">
                                {timeLabel}
                              </span>
                            )}

                            <span className="truncate flex-1">{t.title}</span>
                          </div>
                        );
                      })}

                      {/* Overflow "+N ещё" button */}
                      {overflowCount > 0 && (
                        <button
                          type="button"
                          onClick={() => setDayModalDate(cell.dateStr)}
                          className="w-full text-left text-[10px] font-medium text-indigo-400 hover:text-indigo-300 px-1 py-0.5 rounded hover:bg-indigo-500/10 transition"
                        >
                          +{overflowCount} ещё...
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* SCALE 2: WEEK VIEW (7-Day 24h Timeline) */}
        {/* ========================================================================= */}
        {scale === 'week' && (
          <div className="flex-1 flex flex-col h-full overflow-hidden">
            {/* Week header: 7 columns */}
            <div className="flex border-b border-white/[0.08] bg-[#14161d] shrink-0">
              {/* Corner gutter (width 54px for time labels) */}
              <div className="w-14 shrink-0 border-r border-white/[0.08] flex items-center justify-center p-2">
                <Clock size={14} className="text-slate-500" />
              </div>

              {/* 7 Day Columns Headers */}
              <div className="flex-1 grid grid-cols-7 divide-x divide-white/[0.08]">
                {weekDays.map((d) => (
                  <div
                    key={d.dateStr}
                    onClick={() => {
                      setCurrentDate(d.date);
                      setScale('day');
                    }}
                    className={`py-2 px-1 text-center cursor-pointer transition ${
                      d.isToday
                        ? 'bg-amber-500/10'
                        : 'hover:bg-white/[0.02]'
                    }`}
                  >
                    <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider block">
                      {d.dayLabel}
                    </span>
                    <span
                      className={`inline-block text-sm font-bold font-mono px-2 py-0.5 rounded-full mt-0.5 ${
                        d.isToday
                          ? 'bg-amber-500 text-black shadow-sm'
                          : 'text-white'
                      }`}
                    >
                      {d.dayNum}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* All-Day Tasks Section */}
            <div className="flex border-b border-white/[0.08] bg-[#111217] shrink-0 max-h-28 overflow-y-auto">
              <div className="w-14 shrink-0 border-r border-white/[0.08] text-[9px] font-medium uppercase tracking-wider text-slate-500 p-2 flex items-center justify-center">
                Весь день
              </div>
              <div className="flex-1 grid grid-cols-7 divide-x divide-white/[0.08]">
                {weekDays.map((d) => {
                  const dayTasks = (tasksByDate[d.dateStr] || []).filter(isTaskAllDay);
                  return (
                    <div key={`allday_${d.dateStr}`} className="p-1 space-y-1 min-h-[36px]">
                      {dayTasks.map((t) => (
                        <div
                          key={t.id}
                          onClick={() => onOpenDetail(t)}
                          className="px-1.5 py-0.5 rounded text-[10px] bg-[#1c1e28] border border-white/10 truncate cursor-pointer hover:border-white/30 text-slate-200"
                        >
                          {t.title}
                        </div>
                      ))}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 24-Hour Vertical Time Grid */}
            <div ref={weekTimelineScrollRef} className="flex-1 overflow-y-auto relative flex">
              {/* Left Column: 24 Time Labels */}
              <div className="w-14 shrink-0 border-r border-white/[0.08] select-none min-h-[1344px]">
                {Array.from({ length: 24 }).map((_, hour) => (
                  <div
                    key={hour}
                    style={{ height: `${HOUR_HEIGHT}px` }}
                    className="flex items-start justify-end"
                  >
                    <span className="text-[10px] font-mono text-slate-500 pr-2 -translate-y-1/2 block select-none">
                      {String(hour).padStart(2, '0')}:00
                    </span>
                  </div>
                ))}
              </div>

              {/* 7 Columns Grid */}
              <div className="flex-1 grid grid-cols-7 divide-x divide-white/[0.08] relative">
                {/* Day Columns */}
                {weekDays.map((d) => {
                  const dayTasks = tasksByDate[d.dateStr] || [];

                  return (
                    <div
                      key={`col_${d.dateStr}`}
                      className={`relative min-h-[1344px] ${
                        d.isToday ? 'bg-amber-500/[0.02]' : ''
                      }`}
                    >
                      {/* Current Time Horizontal Line (ONLY in today's column) */}
                      {d.isToday && (
                        <div
                          style={{ top: `${nowIndicatorTopPx}px` }}
                          className="absolute left-0 right-0 z-20 pointer-events-none flex items-center"
                        >
                          <div className="w-2.5 h-2.5 rounded-full bg-rose-500 shadow-md shadow-rose-500/50 -ml-1.25 animate-pulse" />
                          <div className="h-[2px] flex-1 bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.7)]" />
                        </div>
                      )}
                      {/* Hour rows */}
                      {Array.from({ length: 24 }).map((_, hour) => {
                        const hourTasks = dayTasks.filter((t) => isTaskInHour(t, hour));
                        const isHovered = dragOverDate === d.dateStr && dragOverHour === hour;

                        return (
                          <div
                            key={hour}
                            style={{ height: `${HOUR_HEIGHT}px` }}
                            onDragOver={(e) => {
                              e.preventDefault();
                              setDragOverDate(d.dateStr);
                              setDragOverHour(hour);
                            }}
                            onDragLeave={() => {
                              if (dragOverDate === d.dateStr && dragOverHour === hour) {
                                setDragOverHour(null);
                              }
                            }}
                            onDrop={(e) => {
                              e.preventDefault();
                              handleDropOnDate(d.dateStr, hour);
                            }}
                            onClick={() => onCreateTaskForDate(d.dateStr, hour)}
                            className={`border-b border-white/[0.05] p-1 transition-colors group/slot relative ${
                              isHovered ? 'bg-indigo-500/20 ring-1 ring-indigo-500/40' : 'hover:bg-white/[0.02]'
                            }`}
                          >
                            {/* Render tasks in this hour */}
                            {hourTasks.map((t) => {
                              const project = projects.find((p) => p.id === t.project_id);
                              const isDone = t.status === 'done';

                              return (
                                <div
                                  key={t.id}
                                  draggable
                                  onDragStart={(e) => handleDragStart(e, t.id)}
                                  onDragEnd={handleDragEnd}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onOpenDetail(t);
                                  }}
                                  className={`p-1.5 rounded-lg border text-xs font-medium cursor-pointer transition shadow-sm ${
                                    isDone
                                      ? 'bg-zinc-900 border-zinc-700 text-slate-500 line-through'
                                      : 'bg-[#1c1e28] border-white/10 hover:border-white/30 text-white'
                                  }`}
                                  style={
                                    project && !isDone
                                      ? {
                                          borderLeftWidth: '3.5px',
                                          borderLeftColor: project.color,
                                          background: `linear-gradient(90deg, ${project.color}15 0%, #1c1e28 50%)`,
                                        }
                                      : undefined
                                  }
                                >
                                  <div className="flex items-center gap-1.5">
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        playCheckClick();
                                        onToggleComplete(t);
                                      }}
                                      className="text-slate-400 hover:text-emerald-400 transition shrink-0"
                                    >
                                      {isDone ? (
                                        <CheckCircle2 size={12} className="text-emerald-400" />
                                      ) : (
                                        <Circle size={12} />
                                      )}
                                    </button>
                                    <span className="truncate flex-1 leading-tight">{t.title}</span>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* SCALE 3: DAY VIEW (24-Hour Vertical Single Day Spotlight) */}
        {/* ========================================================================= */}
        {scale === 'day' && (
          <div className="flex-1 flex flex-col h-full overflow-hidden">
            {/* Day Header Summary Card */}
            {(() => {
              const currentDayStr = `${currentDate.getFullYear()}-${String(
                currentDate.getMonth() + 1
              ).padStart(2, '0')}-${String(currentDate.getDate()).padStart(2, '0')}`;
              const dayTasks = tasksByDate[currentDayStr] || [];
              const completedCount = dayTasks.filter((t) => t.status === 'done').length;
              const allDayTasks = dayTasks.filter(isTaskAllDay);

              return (
                <div className="px-5 py-3 border-b border-white/[0.08] bg-[#14161d] flex flex-col gap-2 shrink-0">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-semibold text-white">
                        Задачи на день
                      </h3>
                      <span className="text-xs text-slate-400">
                        Всего: {dayTasks.length} | Выполнено: {completedCount}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => onCreateTaskForDate(currentDayStr)}
                      className="ios-glass-btn px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-1.5"
                    >
                      <Plus size={13} />
                      <span>Добавить задачу</span>
                    </button>
                  </div>

                  {/* All Day tasks banner */}
                  {allDayTasks.length > 0 && (
                    <div className="flex items-center gap-2 overflow-x-auto py-1">
                      <span className="text-[10px] uppercase font-bold text-slate-500 shrink-0">
                        Весь день:
                      </span>
                      {allDayTasks.map((t) => (
                        <div
                          key={t.id}
                          onClick={() => onOpenDetail(t)}
                          className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs bg-[#1c1c1e] border border-white/10 hover:border-white/30 cursor-pointer text-slate-200 shrink-0"
                        >
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              playCheckClick();
                              onToggleComplete(t);
                            }}
                          >
                            {t.status === 'done' ? (
                              <CheckCircle2 size={12} className="text-emerald-400" />
                            ) : (
                              <Circle size={12} className="text-slate-400" />
                            )}
                          </button>
                          <span className={t.status === 'done' ? 'line-through text-slate-500' : ''}>
                            {t.title}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })()}

            {/* Day 24-Hour Time Grid */}
            <div ref={dayTimelineScrollRef} className="flex-1 overflow-y-auto relative flex">
              {/* Left Column: 24 Time Labels */}
              <div className="w-16 shrink-0 border-r border-white/[0.08] select-none min-h-[1344px]">
                {Array.from({ length: 24 }).map((_, hour) => (
                  <div
                    key={hour}
                    style={{ height: `${HOUR_HEIGHT}px` }}
                    className="flex items-start justify-end"
                  >
                    <span className="text-xs font-mono text-slate-400 pr-3 -translate-y-1/2 block select-none">
                      {String(hour).padStart(2, '0')}:00
                    </span>
                  </div>
                ))}
              </div>

              {/* Day Time Column */}
              {(() => {
                const currentDayStr = `${currentDate.getFullYear()}-${String(
                  currentDate.getMonth() + 1
                ).padStart(2, '0')}-${String(currentDate.getDate()).padStart(2, '0')}`;
                const dayTasks = tasksByDate[currentDayStr] || [];
                const isToday = currentDayStr === todayStr;

                return (
                  <div className="flex-1 relative min-h-[1344px]">
                    {/* Live Time Red Line if viewing today */}
                    {isToday && (
                      <div
                        style={{ top: `${nowIndicatorTopPx}px` }}
                        className="absolute left-0 right-0 z-30 pointer-events-none flex items-center"
                      >
                        <div className="w-3 h-3 rounded-full bg-rose-500 shadow-md shadow-rose-500/50 -ml-1.5 animate-pulse" />
                        <div className="h-[2px] flex-1 bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.6)]" />
                        <span className="text-[10px] font-mono font-bold bg-rose-500 text-white px-1.5 py-0.5 rounded-full mr-4 shadow-sm">
                          Сейчас {String(now.getHours()).padStart(2, '0')}:
                          {String(now.getMinutes()).padStart(2, '0')}
                        </span>
                      </div>
                    )}

                    {/* 24 Hour Slots */}
                    {Array.from({ length: 24 }).map((_, hour) => {
                      const hourTasks = dayTasks.filter((t) => isTaskInHour(t, hour));
                      const isHovered = dragOverHour === hour;

                      return (
                        <div
                          key={hour}
                          style={{ height: `${HOUR_HEIGHT}px` }}
                          onDragOver={(e) => {
                            e.preventDefault();
                            setDragOverHour(hour);
                          }}
                          onDragLeave={() => {
                            if (dragOverHour === hour) setDragOverHour(null);
                          }}
                          onDrop={(e) => {
                            e.preventDefault();
                            handleDropOnDate(currentDayStr, hour);
                          }}
                          onClick={() => onCreateTaskForDate(currentDayStr, hour)}
                          className={`border-b border-white/[0.06] px-4 py-1.5 flex items-center gap-3 transition-colors group relative cursor-pointer ${
                            isHovered ? 'bg-indigo-500/15 ring-1 ring-indigo-500/30' : 'hover:bg-white/[0.02]'
                          }`}
                        >
                          {/* Hour Tasks */}
                          {hourTasks.length === 0 ? (
                            <div className="opacity-0 group-hover:opacity-100 transition flex items-center gap-2 text-xs text-slate-500">
                              <Plus size={13} />
                              <span>Назначить задачу на {String(hour).padStart(2, '0')}:00</span>
                            </div>
                          ) : (
                            <div className="flex-1 flex flex-wrap items-center gap-2">
                              {hourTasks.map((t) => {
                                const project = projects.find((p) => p.id === t.project_id);
                                const isDone = t.status === 'done';

                                return (
                                  <div
                                    key={t.id}
                                    draggable
                                    onDragStart={(e) => handleDragStart(e, t.id)}
                                    onDragEnd={handleDragEnd}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      onOpenDetail(t);
                                    }}
                                    className={`px-3 py-1.5 rounded-xl border flex items-center gap-2.5 text-xs font-medium cursor-pointer transition-all hover:scale-[1.01] shadow-sm ${
                                      isDone
                                        ? 'bg-zinc-900/60 border-white/5 text-slate-500 line-through'
                                        : 'bg-[#1c1c1e] border-white/10 hover:border-white/20 text-white'
                                    }`}
                                    style={
                                      project && !isDone
                                        ? {
                                            borderLeftWidth: '4px',
                                            borderLeftColor: project.color,
                                          }
                                        : undefined
                                    }
                                  >
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        playCheckClick();
                                        onToggleComplete(t);
                                      }}
                                    >
                                      {isDone ? (
                                        <CheckCircle2 size={14} className="text-emerald-400" />
                                      ) : (
                                        <Circle size={14} className="text-slate-400 hover:text-emerald-400" />
                                      )}
                                    </button>

                                    <span className="font-mono text-[11px] text-indigo-300">
                                      {String(hour).padStart(2, '0')}:00
                                    </span>

                                    <span className="font-normal">{t.title}</span>

                                    {project && (
                                      <span
                                        className="text-[10px] px-1.5 py-0.2 rounded-full border border-white/5"
                                        style={{ color: project.color }}
                                      >
                                        {project.name}
                                      </span>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                );
              })()}
            </div>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* OVERFLOW MODAL: ALL TASKS FOR SELECTED DAY (from Month View "+N ещё") */}
      {/* ========================================================================= */}
      {dayModalDate && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-150"
          onClick={() => setDayModalDate(null)}
        >
          <div
            className="w-full max-w-md bg-[#161820] border border-white/10 rounded-2xl shadow-2xl p-5 space-y-4 animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
              <div className="flex items-center gap-2">
                <CalendarIcon size={16} className="text-indigo-400" />
                <h3 className="text-sm font-semibold text-white">
                  Задачи на {dayModalDate}
                </h3>
              </div>
              <button
                onClick={() => setDayModalDate(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white transition"
              >
                <X size={16} />
              </button>
            </div>

            <div className="max-h-72 overflow-y-auto space-y-1.5 pr-1">
              {(tasksByDate[dayModalDate] || []).map((t) => {
                const project = projects.find((p) => p.id === t.project_id);
                const isDone = t.status === 'done';

                return (
                  <div
                    key={t.id}
                    onClick={() => {
                      setDayModalDate(null);
                      onOpenDetail(t);
                    }}
                    className={`flex items-center justify-between p-2 rounded-xl border text-xs cursor-pointer transition ${
                      isDone
                        ? 'bg-white/[0.02] border-white/5 text-slate-500 line-through'
                        : 'bg-[#1e2029] border-white/10 hover:border-white/20 text-slate-200'
                    }`}
                    style={
                      project && !isDone
                        ? { borderLeftWidth: '3.5px', borderLeftColor: project.color }
                        : undefined
                    }
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          playCheckClick();
                          onToggleComplete(t);
                        }}
                      >
                        {isDone ? (
                          <CheckCircle2 size={14} className="text-emerald-400" />
                        ) : (
                          <Circle size={14} className="text-slate-400" />
                        )}
                      </button>
                      <span className="truncate">{t.title}</span>
                    </div>

                    {project && (
                      <span className="text-[10px] text-slate-400 font-mono ml-2 shrink-0">
                        {project.name}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="pt-2 border-t border-white/[0.08] flex justify-end">
              <button
                type="button"
                onClick={() => {
                  const d = dayModalDate;
                  setDayModalDate(null);
                  onCreateTaskForDate(d);
                }}
                className="ios-glass-btn px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-1.5"
              >
                <Plus size={13} />
                <span>Новая задача на этот день</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
