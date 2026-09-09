import React from 'react';
import { Flame, Calendar, Trophy, RotateCcw } from 'lucide-react';
import type { ActivityDay, Habit } from '../types';
import { TaskStorage } from '../api/client';

interface SidebarActivityWidgetProps {
  activity: ActivityDay[];
  habits?: Habit[];
  todayProgress: {
    completed: number;
    total: number;
  };
  onResetStreak?: () => void;
}

export const SidebarActivityWidget: React.FC<SidebarActivityWidgetProps> = ({
  activity,
  habits = [],
  todayProgress,
  onResetStreak,
}) => {
  const [viewMode, setViewMode] = React.useState<'week' | 'month'>('week');

  const today = React.useMemo(() => new Date(), []);
  const todayStr = React.useMemo(() => today.toISOString().split('T')[0], [today]);

  // Combined activity getter: tasks count + completed habits count for any date
  const getActivityForDate = React.useCallback(
    (dateStr: string) => {
      const streakResetDate = TaskStorage.getStreakResetDate();
      if (streakResetDate && dateStr < streakResetDate) {
        return { taskCount: 0, habitCount: 0, total: 0 };
      }
      const taskCount = activity.find((a) => a.date === dateStr)?.count || 0;
      const habitCount = habits.filter((h) => h.logs?.[dateStr] === 'completed').length;
      return {
        taskCount,
        habitCount,
        total: taskCount + habitCount,
      };
    },
    [activity, habits]
  );

  // Robust streak calculation (holds from yesterday if today not logged yet)
  const { currentStreak, bestStreak } = React.useMemo(() => {
    const streakResetDate = TaskStorage.getStreakResetDate();
    let streak = 0;
    const now = new Date();
    const tStr = now.toISOString().split('T')[0];

    const yDate = new Date(now);
    yDate.setDate(yDate.getDate() - 1);
    const yStr = yDate.toISOString().split('T')[0];

    // If streak was reset today and no new activity has been logged
    const isResetToday = streakResetDate === tStr;
    const todayAct = isResetToday && activity.length === 0 ? 0 : getActivityForDate(tStr).total;
    const yesterdayAct = isResetToday ? 0 : getActivityForDate(yStr).total;

    let checkDate = new Date(now);

    if (todayAct > 0) {
      streak = 1;
      checkDate.setDate(checkDate.getDate() - 1);
      while (true) {
        const dStr = checkDate.toISOString().split('T')[0];
        if (streakResetDate && dStr < streakResetDate) break;
        if (getActivityForDate(dStr).total > 0) {
          streak++;
          checkDate.setDate(checkDate.getDate() - 1);
        } else {
          break;
        }
      }
    } else if (yesterdayAct > 0) {
      // Streak holds from yesterday
      streak = 1;
      checkDate = new Date(yDate);
      checkDate.setDate(checkDate.getDate() - 1);
      while (true) {
        const dStr = checkDate.toISOString().split('T')[0];
        if (streakResetDate && dStr < streakResetDate) break;
        if (getActivityForDate(dStr).total > 0) {
          streak++;
          checkDate.setDate(checkDate.getDate() - 1);
        } else {
          break;
        }
      }
    } else {
      streak = 0;
    }

    // Historical best streak calculation
    let maxStreak = streak;
    let tempStreak = 0;
    for (let i = 45; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dStr = d.toISOString().split('T')[0];
      if (streakResetDate && dStr < streakResetDate) continue;
      if (getActivityForDate(dStr).total > 0) {
        tempStreak++;
        if (tempStreak > maxStreak) maxStreak = tempStreak;
      } else {
        tempStreak = 0;
      }
    }

    return { currentStreak: streak, bestStreak: maxStreak };
  }, [getActivityForDate, activity.length]);

  // Current week 7 days (Monday to Sunday)
  const weekDays = React.useMemo(() => {
    const now = new Date();
    const currentDay = now.getDay(); // 0 = Sun, 1 = Mon ...
    const mondayOffset = currentDay === 0 ? -6 : 1 - currentDay;

    const monday = new Date(now);
    monday.setDate(now.getDate() + mondayOffset);

    const dayLabels = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
    const days = [];

    for (let i = 0; i < 7; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      const dStr = d.toISOString().split('T')[0];
      const isToday = dStr === todayStr;
      const isFuture = d > now && !isToday;
      const act = getActivityForDate(dStr);

      days.push({
        dateStr: dStr,
        dayNum: d.getDate(),
        label: dayLabels[i],
        isToday,
        isFuture,
        ...act,
      });
    }
    return days;
  }, [todayStr, getActivityForDate]);

  // 28-day history for Month mode (4 weeks, Mon-Sun)
  const monthDays = React.useMemo(() => {
    const days = [];
    const now = new Date();
    for (let i = 27; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dStr = d.toISOString().split('T')[0];
      const isToday = dStr === todayStr;
      const act = getActivityForDate(dStr);
      days.push({
        dateStr: dStr,
        dayNum: d.getDate(),
        isToday,
        ...act,
      });
    }
    return days;
  }, [todayStr, getActivityForDate]);

  // Habits today completion count
  const habitsTodayCount = habits.filter((h) => h.logs?.[todayStr] === 'completed').length;
  const totalHabits = habits.length;

  const totalActionsToday = todayProgress.completed + habitsTodayCount;
  const totalPlannedToday = todayProgress.total + totalHabits;
  const progressPercent = totalPlannedToday > 0 ? Math.round((totalActionsToday / totalPlannedToday) * 100) : 0;

  return (
    <div className="p-3.5 rounded-2xl bg-[#171922]/90 border border-white/[0.08] backdrop-blur-md shadow-sm space-y-3 select-none">
      {/* Top Header: Streak badge & View Mode toggle */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div
            className={`w-7 h-7 rounded-xl flex items-center justify-center border transition-all ${
              currentStreak > 0
                ? 'bg-amber-500/15 border-amber-500/30 text-amber-400 shadow-sm shadow-amber-500/10'
                : 'bg-white/[0.04] border-white/[0.08] text-slate-400'
            }`}
          >
            <Flame
              size={15}
              className={currentStreak > 0 ? 'fill-amber-400 text-amber-400 animate-pulse' : 'text-slate-500'}
            />
          </div>

          <div>
            <div className="flex items-center gap-1.5 leading-none">
              <span className="text-xs font-semibold text-white tracking-tight">
                {currentStreak > 0 ? `${currentStreak} дн. ударно` : 'Начни стрик'}
              </span>
            </div>
            <div className="flex items-center gap-1 text-[10px] text-slate-400 mt-0.5">
              <Trophy size={10} className="text-amber-500/80" />
              <span>Рекорд: {bestStreak} дн.</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-0.5">
          {/* Reset Productivity Streak button */}
          <button
            type="button"
            onClick={() => {
              if (window.confirm('Сбросить стрик продуктивности? Счётчик ударных дней будет обнулён.')) {
                TaskStorage.resetProductivityStreak();
                onResetStreak?.();
              }
            }}
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition"
            title="Сбросить стрик продуктивности"
          >
            <RotateCcw size={12} />
          </button>

          {/* Toggle between 7-day week and 28-day history */}
          <button
            type="button"
            onClick={() => setViewMode((m) => (m === 'week' ? 'month' : 'week'))}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition"
            title={viewMode === 'week' ? 'Показать сетку за 4 недели' : 'Показать ритм текущей недели'}
          >
            <Calendar size={13} />
          </button>
        </div>
      </div>

      {/* Main View: 7-Day Weekly Rhythm */}
      {viewMode === 'week' ? (
        <div className="space-y-1.5 pt-0.5">
          <div className="grid grid-cols-7 gap-1 text-center">
            {weekDays.map((day) => {
              // Bar height based on activity
              let barHeight = 'h-1.5';
              let barColor = 'bg-white/[0.08]';
              if (day.total === 1) {
                barHeight = 'h-3.5';
                barColor = 'bg-emerald-600/70';
              } else if (day.total === 2) {
                barHeight = 'h-5';
                barColor = 'bg-emerald-500/80';
              } else if (day.total >= 3) {
                barHeight = 'h-6';
                barColor = 'bg-gradient-to-t from-emerald-500 to-teal-400 shadow-sm shadow-emerald-500/20';
              }

              if (day.isFuture) {
                barHeight = 'h-1.5';
                barColor = 'bg-white/[0.03] border border-white/[0.04]';
              }

              return (
                <div
                  key={day.dateStr}
                  title={`${day.label}, ${day.dayNum}: ${day.taskCount} задач(и), ${day.habitCount} привычек`}
                  className={`flex flex-col items-center justify-between py-1.5 px-0.5 rounded-xl transition-all group ${
                    day.isToday
                      ? 'bg-white/[0.08] ring-1 ring-white/25 shadow-sm'
                      : 'hover:bg-white/[0.04]'
                  }`}
                >
                  {/* Day of week letter */}
                  <span
                    className={`text-[10px] font-medium block leading-none ${
                      day.isToday ? 'text-white font-semibold' : 'text-slate-400'
                    }`}
                  >
                    {day.label}
                  </span>

                  {/* Visual activity bar container (fixed 28px height) */}
                  <div className="w-full h-7 flex items-end justify-center my-1">
                    <div className={`w-3.5 rounded-md transition-all duration-300 ${barHeight} ${barColor}`} />
                  </div>

                  {/* Day number */}
                  <span
                    className={`text-[9px] font-mono block leading-none ${
                      day.isToday ? 'text-indigo-300 font-bold' : 'text-slate-400'
                    }`}
                  >
                    {day.dayNum}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* 28-day mini contribution grid */
        <div className="space-y-1.5 pt-0.5">
          <div className="grid grid-cols-7 gap-1">
            {monthDays.map((day, idx) => {
              let bg = 'bg-white/[0.04]';
              if (day.total === 1) bg = 'bg-emerald-800/50 border border-emerald-600/30';
              if (day.total === 2) bg = 'bg-emerald-600/60';
              if (day.total >= 3) bg = 'bg-emerald-500/90 shadow-sm shadow-emerald-500/20';

              return (
                <div
                  key={idx}
                  title={`${day.dateStr}: ${day.taskCount} задач, ${day.habitCount} привычек`}
                  className={`w-full aspect-square rounded-md ${bg} transition-all hover:scale-110 cursor-pointer ${
                    day.isToday ? 'ring-1.5 ring-white' : ''
                  }`}
                />
              );
            })}
          </div>
        </div>
      )}

      {/* Integrated Today Progress Bar */}
      <div className="pt-2 border-t border-white/[0.06] space-y-1.5">
        <div className="flex items-center justify-between text-[11px] text-slate-300">
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>Сегодня закрыто</span>
          </span>
          <span className="font-mono text-slate-300 font-medium">
            {totalActionsToday} из {totalPlannedToday}
          </span>
        </div>

        <div className="w-full h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-emerald-500 to-indigo-500 transition-all duration-300 rounded-full"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>
    </div>
  );
};
