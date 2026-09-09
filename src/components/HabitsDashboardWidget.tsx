import React from 'react';
import { Sparkles, Plus, ChevronDown, ChevronUp } from 'lucide-react';
import type { Habit, HabitStatus } from '../types';
import { HabitCard } from './HabitCard';

interface HabitsDashboardWidgetProps {
  habits: Habit[];
  onLogDay: (habitId: string, dateStr: string, status: HabitStatus | null) => void;
  onNewHabit: () => void;
  onEditHabit: (habit: Habit) => void;
  onOpenFullView: () => void;
}

export const HabitsDashboardWidget: React.FC<HabitsDashboardWidgetProps> = ({
  habits,
  onLogDay,
  onNewHabit,
  onEditHabit,
  onOpenFullView,
}) => {
  const [isCollapsed, setIsCollapsed] = React.useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('linear_lite_habits_collapsed');
      return saved ? JSON.parse(saved) : false;
    } catch {
      return false;
    }
  });

  const toggleCollapse = () => {
    setIsCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem('linear_lite_habits_collapsed', JSON.stringify(next));
      return next;
    });
  };

  const todayStr = new Date().toISOString().split('T')[0];
  const totalHabits = habits.length;
  const completedToday = habits.filter((h) => h.logs[todayStr] === 'completed').length;
  const progressPercent = totalHabits > 0 ? Math.round((completedToday / totalHabits) * 100) : 0;

  if (habits.length === 0) return null;

  return (
    <div className="p-4 rounded-2xl bg-[#16181e]/80 border border-white/[0.08] backdrop-blur-md shadow-sm transition-all space-y-3">
      {/* Header bar */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-full bg-indigo-500/15 border border-indigo-500/25 flex items-center justify-center text-indigo-400 shadow-sm">
            <Sparkles size={14} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-white tracking-tight">
                Привычки дня
              </span>
              <span className="text-[10px] font-mono text-slate-400 bg-white/[0.05] px-1.5 py-0.2 rounded-full">
                {completedToday} из {totalHabits}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={onNewHabit}
            className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium text-slate-300 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] transition"
            title="Создать новую привычку"
          >
            <Plus size={12} />
            <span className="hidden sm:inline">Привычка</span>
          </button>

          <button
            type="button"
            onClick={onOpenFullView}
            className="text-xs text-slate-400 hover:text-indigo-300 hover:bg-white/[0.04] px-2 py-1 rounded-full transition hidden sm:inline"
            title="Открыть все привычки и календарь"
          >
            Все привычки →
          </button>

          <button
            type="button"
            onClick={toggleCollapse}
            className="p-1 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition"
            title={isCollapsed ? 'Развернуть привычки' : 'Свернуть привычки'}
          >
            {isCollapsed ? <ChevronDown size={15} /> : <ChevronUp size={15} />}
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-1 rounded-full bg-white/[0.06] overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-indigo-500 to-emerald-400 transition-all duration-300 rounded-full"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Cards Grid (collapsible) */}
      {!isCollapsed && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 pt-1 animate-in fade-in duration-200">
          {habits.map((habit) => (
            <HabitCard
              key={habit.id}
              habit={habit}
              onLogDay={onLogDay}
              onEdit={onEditHabit}
            />
          ))}
        </div>
      )}
    </div>
  );
};
