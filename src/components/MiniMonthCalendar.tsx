import React from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Plus, Maximize2 } from 'lucide-react';
import type { Task } from '../types';

interface MiniMonthCalendarProps {
  tasks: Task[];
  onSelectDate: (dateStr: string) => void;
  onOpenFullCalendar?: () => void;
}

export const MiniMonthCalendar: React.FC<MiniMonthCalendarProps> = ({
  tasks,
  onSelectDate,
  onOpenFullCalendar,
}) => {
  const [viewDate, setViewDate] = React.useState(() => new Date());

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  const realToday = React.useMemo(() => new Date(), []);
  const realTodayStr = React.useMemo(() => {
    const y = realToday.getFullYear();
    const m = String(realToday.getMonth() + 1).padStart(2, '0');
    const d = String(realToday.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }, [realToday]);

  const monthNames = [
    'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
    'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
  ];

  const weekDayHeaders = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

  // Map task due dates to counts for fast lookup
  const tasksByDate = React.useMemo(() => {
    const map: Record<string, { total: number; active: number }> = {};
    tasks.forEach((t) => {
      if (!t.due_date) return;
      const d = new Date(t.due_date * 1000);
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      const dStr = `${y}-${m}-${day}`;
      if (!map[dStr]) map[dStr] = { total: 0, active: 0 };
      map[dStr].total++;
      if (t.status !== 'done') map[dStr].active++;
    });
    return map;
  }, [tasks]);

  // Generate 35 or 42 grid cells
  const calendarCells = React.useMemo(() => {
    const firstDayIndex = new Date(year, month, 1).getDay(); // 0 = Sun, 1 = Mon ...
    const startOffset = firstDayIndex === 0 ? 6 : firstDayIndex - 1; // Mon = 0

    const daysInCurrentMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();

    const cells: {
      dateStr: string;
      dayNum: number;
      isCurrentMonth: boolean;
      isToday: boolean;
      taskCount: number;
      activeTaskCount: number;
    }[] = [];

    // Leading days from previous month
    for (let i = startOffset - 1; i >= 0; i--) {
      const d = daysInPrevMonth - i;
      const prevDate = new Date(year, month - 1, d);
      const y = prevDate.getFullYear();
      const m = String(prevDate.getMonth() + 1).padStart(2, '0');
      const day = String(d).padStart(2, '0');
      const dateStr = `${y}-${m}-${day}`;
      const counts = tasksByDate[dateStr] || { total: 0, active: 0 };

      cells.push({
        dateStr,
        dayNum: d,
        isCurrentMonth: false,
        isToday: dateStr === realTodayStr,
        taskCount: counts.total,
        activeTaskCount: counts.active,
      });
    }

    // Days in current month
    for (let d = 1; d <= daysInCurrentMonth; d++) {
      const m = String(month + 1).padStart(2, '0');
      const day = String(d).padStart(2, '0');
      const dateStr = `${year}-${m}-${day}`;
      const counts = tasksByDate[dateStr] || { total: 0, active: 0 };

      cells.push({
        dateStr,
        dayNum: d,
        isCurrentMonth: true,
        isToday: dateStr === realTodayStr,
        taskCount: counts.total,
        activeTaskCount: counts.active,
      });
    }

    // Trailing days from next month to round out to multiples of 7
    const remaining = (7 - (cells.length % 7)) % 7;
    for (let d = 1; d <= remaining; d++) {
      const nextDate = new Date(year, month + 1, d);
      const y = nextDate.getFullYear();
      const m = String(nextDate.getMonth() + 1).padStart(2, '0');
      const day = String(d).padStart(2, '0');
      const dateStr = `${y}-${m}-${day}`;
      const counts = tasksByDate[dateStr] || { total: 0, active: 0 };

      cells.push({
        dateStr,
        dayNum: d,
        isCurrentMonth: false,
        isToday: dateStr === realTodayStr,
        taskCount: counts.total,
        activeTaskCount: counts.active,
      });
    }

    return cells;
  }, [year, month, realTodayStr, tasksByDate]);

  const isCurrentViewingMonth =
    realToday.getFullYear() === year && realToday.getMonth() === month;

  const handlePrevMonth = () => {
    setViewDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setViewDate(new Date(year, month + 1, 1));
  };

  const handleJumpToday = () => {
    setViewDate(new Date());
  };

  return (
    <div className="p-2.5 rounded-2xl bg-[#161820] border border-white/[0.08] shadow-sm space-y-2 transition-all">
      {/* Header: Month title & controls */}
      <div className="flex items-center justify-between px-0.5">
        <div className="flex items-center gap-1.5 min-w-0">
          <button
            type="button"
            onClick={onOpenFullCalendar}
            disabled={!onOpenFullCalendar}
            className={`flex items-center gap-1.5 text-left group min-w-0 ${
              onOpenFullCalendar ? 'hover:text-indigo-400 cursor-pointer' : ''
            }`}
            title={onOpenFullCalendar ? 'Открыть подробный календарь' : undefined}
          >
            <CalendarIcon size={12} className="text-indigo-400 group-hover:scale-110 transition-transform shrink-0" />
            <span className="text-[11px] font-semibold text-white group-hover:text-indigo-300 transition-colors tracking-tight truncate">
              {monthNames[month]} {year}
            </span>
            {onOpenFullCalendar && (
              <Maximize2 size={10} className="text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
            )}
          </button>
        </div>

        <div className="flex items-center gap-0.5">
          {!isCurrentViewingMonth && (
            <button
              type="button"
              onClick={handleJumpToday}
              className="text-[9px] font-medium px-1.5 py-0.5 rounded text-indigo-400 hover:bg-indigo-500/15 transition mr-0.5"
              title="Сегодня"
            >
              Сегодня
            </button>
          )}
          <button
            type="button"
            onClick={handlePrevMonth}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition"
            title="Предыдущий месяц"
          >
            <ChevronLeft size={12} />
          </button>
          <button
            type="button"
            onClick={handleNextMonth}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition"
            title="Следующий месяц"
          >
            <ChevronRight size={12} />
          </button>
        </div>
      </div>

      {/* Weekdays row */}
      <div className="grid grid-cols-7 gap-0.5 text-center">
        {weekDayHeaders.map((dayName, idx) => (
          <div
            key={dayName}
            className={`text-[8px] font-semibold uppercase tracking-wider ${
              idx >= 5 ? 'text-rose-400/80' : 'text-slate-500'
            }`}
          >
            {dayName}
          </div>
        ))}
      </div>

      {/* Days Grid */}
      <div className="grid grid-cols-7 gap-0.5">
        {calendarCells.map((cell) => {
          const hasTasks = cell.taskCount > 0;
          return (
            <button
              key={cell.dateStr}
              type="button"
              onClick={() => onSelectDate(cell.dateStr)}
              title={`${cell.dayNum} ${monthNames[month]}: ${
                cell.taskCount > 0 ? `${cell.taskCount} задач(и)` : 'Нет задач'
              } • Кликните для создания задачи`}
              className={`h-6 w-6 mx-auto rounded-lg flex flex-col items-center justify-center relative transition-all group active:scale-90 ${
                cell.isToday
                  ? 'bg-indigo-600 text-white font-bold shadow-sm shadow-indigo-500/30'
                  : cell.isCurrentMonth
                  ? 'text-slate-200 hover:bg-white/10'
                  : 'text-slate-600 hover:bg-white/5'
              }`}
            >
              <span className="text-[10px] leading-none">{cell.dayNum}</span>

              {/* Task Indicator Dot */}
              {hasTasks && (
                <span
                  className={`w-1 h-1 rounded-full mt-0.5 ${
                    cell.isToday
                      ? 'bg-white'
                      : cell.activeTaskCount > 0
                      ? 'bg-indigo-400'
                      : 'bg-emerald-400'
                  }`}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Action Hint */}
      <div className="pt-1.5 border-t border-white/[0.04] flex items-center justify-center gap-1 text-[9px] text-slate-500">
        <Plus size={10} />
        <span>Кликните число для создания задачи</span>
      </div>
    </div>
  );
};
