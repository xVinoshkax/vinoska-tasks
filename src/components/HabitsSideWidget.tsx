import React from 'react';
import { Sparkles, Plus, PanelBottom, ExternalLink, Flame, Check, X, Pencil } from 'lucide-react';
import type { Habit, HabitStatus } from '../types';
import { HabitStorage } from '../api/client';
import { renderHabitIcon } from './HabitIcons';
import { playCheckClick, playHabitFailSound } from '../utils/sound';

interface HabitsSideWidgetProps {
  habits: Habit[];
  onLogDay: (habitId: string, dateStr: string, status: HabitStatus | null) => void;
  onNewHabit: () => void;
  onEditHabit: (habit: Habit) => void;
  onOpenFullView: () => void;
  onChangeLayoutMode: (mode: 'side' | 'bottom') => void;
}

export const HabitsSideWidget: React.FC<HabitsSideWidgetProps> = ({
  habits,
  onLogDay,
  onNewHabit,
  onEditHabit,
  onOpenFullView,
  onChangeLayoutMode,
}) => {
  const today = React.useMemo(() => new Date(), []);
  const todayStr = React.useMemo(() => today.toISOString().split('T')[0], [today]);

  const totalHabits = habits.length;
  const completedToday = habits.filter((h) => h.logs?.[todayStr] === 'completed').length;
  const progressPercent = totalHabits > 0 ? Math.round((completedToday / totalHabits) * 100) : 0;

  // Mini 5-day strip helper
  const getRecentDays = React.useCallback(() => {
    const dayNames = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];
    const days: { dateStr: string; label: string; isToday: boolean }[] = [];
    for (let i = 4; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      days.push({
        dateStr,
        label: dayNames[d.getDay()],
        isToday: i === 0,
      });
    }
    return days;
  }, [today]);

  const recentDays = React.useMemo(() => getRecentDays(), [getRecentDays]);

  if (habits.length === 0) return null;

  return (
    <div className="p-4 rounded-2xl bg-[#161820]/90 border border-white/[0.08] backdrop-blur-md shadow-sm space-y-3 select-none">
      {/* Header bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-indigo-500/15 border border-indigo-500/25 flex items-center justify-center text-indigo-400">
            <Sparkles size={13} />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-semibold text-white tracking-tight">
                Привычки дня
              </span>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.2 rounded-full">
                {completedToday}/{totalHabits}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1">
          {/* Switch to bottom dock */}
          <button
            type="button"
            onClick={() => onChangeLayoutMode('bottom')}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition"
            title="Расположить в одну строку снизу"
          >
            <PanelBottom size={13} />
          </button>

          {/* New habit button */}
          <button
            type="button"
            onClick={onNewHabit}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition"
            title="Создать привычку"
          >
            <Plus size={14} />
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-indigo-500 to-emerald-400 transition-all duration-300 rounded-full"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Vertical List of Compact Cards */}
      <div className="space-y-2 pt-0.5">
        {habits.map((habit) => {
          const status = habit.logs?.[todayStr] || null;
          const stats = HabitStorage.calculateStats(habit);

          const handleToggleToday = (target: HabitStatus) => {
            if (status === target) {
              onLogDay(habit.id, todayStr, null);
            } else {
              if (target === 'failed') {
                playHabitFailSound();
              } else if (target === 'completed') {
                playCheckClick();
              }
              onLogDay(habit.id, todayStr, target);
            }
          };

          return (
            <div
              key={habit.id}
              className={`p-2.5 rounded-xl border transition-all flex flex-col gap-2 group ${
                status === 'completed'
                  ? 'bg-emerald-500/[0.05] border-emerald-500/30'
                  : status === 'failed'
                  ? 'bg-rose-500/[0.05] border-rose-500/30'
                  : 'bg-[#1c1c1e] hover:bg-[#222226] border-white/[0.06]'
              }`}
              style={{
                borderLeftWidth: '3px',
                borderLeftColor: habit.color,
              }}
            >
              {/* Item Top: Icon, Title, Streak, and Edit */}
              <div className="flex items-center justify-between gap-2">
                <div
                  onClick={() => onEditHabit(habit)}
                  className="flex items-center gap-2 flex-1 min-w-0 cursor-pointer"
                >
                  <span
                    className="w-6 h-6 rounded-md flex items-center justify-center shrink-0 shadow-sm"
                    style={{ backgroundColor: `${habit.color}25`, color: habit.color }}
                  >
                    {renderHabitIcon(habit.icon, { size: 13 })}
                  </span>
                  <div className="min-w-0 flex-1">
                    <span className="text-xs font-medium text-white block truncate leading-tight">
                      {habit.title}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  {stats.currentStreak > 0 && (
                    <span
                      className="flex items-center gap-0.5 text-[9px] font-mono px-1.5 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/20"
                      title={`Серия: ${stats.currentStreak} дн. (Рекорд: ${stats.bestStreak} дн.)`}
                    >
                      <Flame size={10} className="fill-amber-400 text-amber-400" />
                      {stats.currentStreak}
                    </span>
                  )}

                  <button
                    type="button"
                    onClick={() => onEditHabit(habit)}
                    className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-white hover:bg-white/10 rounded transition"
                    title="Редактировать"
                  >
                    <Pencil size={11} />
                  </button>
                </div>
              </div>

              {/* Item Bottom: 5-Day Mini History & Quick Action Buttons */}
              <div className="flex items-center justify-between pt-1 border-t border-white/[0.04]">
                {/* 5-day mini history */}
                <div className="flex items-center gap-1">
                  {recentDays.map((d) => {
                    const st = habit.logs?.[d.dateStr] || null;
                    return (
                      <div
                        key={d.dateStr}
                        title={`${d.label} (${d.dateStr}): ${
                          st === 'completed' ? 'Выполнено' : st === 'failed' ? 'Срыв' : 'Не отмечено'
                        }`}
                        className={`w-4 h-4 rounded flex items-center justify-center text-[8px] font-mono transition-all ${
                          st === 'completed'
                            ? 'bg-emerald-500/80 text-black font-bold'
                            : st === 'failed'
                            ? 'bg-rose-500/80 text-white font-bold'
                            : d.isToday
                            ? 'border border-white/30 text-slate-400'
                            : 'bg-white/[0.05] text-slate-500'
                        }`}
                      >
                        {st === 'completed' ? '✓' : st === 'failed' ? '✕' : d.label[0]}
                      </div>
                    );
                  })}
                </div>

                {/* 1-Click Action Buttons */}
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleToggleToday('completed')}
                    title={status === 'completed' ? 'Снять отметку' : 'Отметить выполнено'}
                    className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-medium transition-all active:scale-95 ${
                      status === 'completed'
                        ? 'bg-emerald-500 text-black font-bold shadow-sm shadow-emerald-500/30'
                        : 'bg-white/[0.04] text-slate-300 hover:text-emerald-300 hover:bg-emerald-500/15 border border-white/[0.06]'
                    }`}
                  >
                    <Check size={11} strokeWidth={status === 'completed' ? 3 : 2} />
                    <span>{status === 'completed' ? 'Готово' : 'Чек'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleToggleToday('failed')}
                    title={status === 'failed' ? 'Снять отметку' : 'Отметить срыв / пропуск'}
                    className={`p-1 rounded-lg text-[11px] transition-all active:scale-95 ${
                      status === 'failed'
                        ? 'bg-rose-500 text-white font-bold shadow-sm shadow-rose-500/30'
                        : 'bg-white/[0.04] text-slate-500 hover:text-rose-400 hover:bg-rose-500/15 border border-white/[0.06]'
                    }`}
                  >
                    <X size={11} strokeWidth={status === 'failed' ? 3 : 2} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer Link to Full Calendar */}
      <button
        type="button"
        onClick={onOpenFullView}
        className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded-xl text-xs text-slate-400 hover:text-white bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.05] transition"
      >
        <span>Все привычки и календарь</span>
        <ExternalLink size={12} />
      </button>
    </div>
  );
};
