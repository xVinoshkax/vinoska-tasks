import React from 'react';
import { Check, X, Flame, Pencil, RotateCcw } from 'lucide-react';
import type { Habit, HabitStatus } from '../types';
import { HabitStorage } from '../api/client';
import { renderHabitIcon } from './HabitIcons';
import { playCheckClick, playHabitFailSound } from '../utils/sound';

interface HabitCardProps {
  habit: Habit;
  onLogDay: (habitId: string, dateStr: string, status: HabitStatus | null) => void;
  onEdit: (habit: Habit) => void;
  onReset?: (habit: Habit) => void;
}

export const HabitCard: React.FC<HabitCardProps> = ({ habit, onLogDay, onEdit, onReset }) => {
  const today = React.useMemo(() => new Date(), []);
  const todayStr = React.useMemo(() => today.toISOString().split('T')[0], [today]);

  const stats = React.useMemo(() => HabitStorage.calculateStats(habit), [habit]);
  const todayStatus = habit.logs[todayStr] || null;

  // Past 7 days (from today down to today - 6)
  const last7Days = React.useMemo(() => {
    const days = [];
    const dayNames = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      days.push({
        date: d,
        dateStr,
        dayLabel: dayNames[d.getDay()],
        isToday: i === 0,
        status: habit.logs[dateStr] || null,
      });
    }
    return days;
  }, [habit.logs, today]);

  const handleToggleToday = (targetStatus: HabitStatus) => {
    if (todayStatus === targetStatus) {
      // Toggle off to null
      onLogDay(habit.id, todayStr, null);
    } else {
      if (targetStatus === 'failed') {
        playHabitFailSound();
      } else if (targetStatus === 'completed') {
        playCheckClick();
      }
      onLogDay(habit.id, todayStr, targetStatus);
    }
  };

  const handleTogglePastDay = (dateStr: string, currentStatus: HabitStatus | null) => {
    if (currentStatus === 'completed') {
      playHabitFailSound();
      onLogDay(habit.id, dateStr, 'failed');
    } else if (currentStatus === 'failed') {
      onLogDay(habit.id, dateStr, null);
    } else {
      playCheckClick();
      onLogDay(habit.id, dateStr, 'completed');
    }
  };

  return (
    <div
      className={`ios-card p-3 rounded-2xl relative select-none transition-all flex flex-col justify-between group ${
        todayStatus === 'completed'
          ? 'border-emerald-500/30 bg-emerald-500/[0.04]'
          : todayStatus === 'failed'
          ? 'border-rose-500/30 bg-rose-500/[0.04]'
          : 'border-white/[0.07] bg-[#1c1c1e]'
      }`}
      style={{
        borderLeftWidth: '3.5px',
        borderLeftColor: habit.color,
      }}
    >
      {/* Top row: Icon, title, streak, and edit button */}
      <div className="flex items-start justify-between gap-2.5">
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-sm text-white"
            style={{ backgroundColor: `${habit.color}25`, color: habit.color }}
          >
            {renderHabitIcon(habit.icon, { size: 16 })}
          </div>

          <div className="min-w-0 flex-1">
            <span className="text-xs font-semibold text-white block truncate tracking-tight">
              {habit.title}
            </span>
            {habit.description && (
              <span className="text-[10px] text-slate-400 block truncate mt-0.5">
                {habit.description}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          {/* Streak indicator */}
          <div
            className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-medium border transition ${
              stats.currentStreak > 0
                ? 'bg-amber-500/10 text-amber-300 border-amber-500/25 shadow-sm'
                : 'bg-white/[0.03] text-slate-400 border-white/[0.06]'
            }`}
            title={`Текущая серия: ${stats.currentStreak} дн. Рекорд: ${stats.bestStreak} дн.`}
          >
            <Flame size={11} className={stats.currentStreak > 0 ? 'fill-amber-400 text-amber-400' : 'text-slate-500'} />
            <span>{stats.currentStreak} дн.</span>
          </div>

          {/* Reset habit button */}
          {onReset && (
            <button
              type="button"
              onClick={() => {
                if (window.confirm(`Сбросить трекер привычки "${habit.title}"? Вся история отметок и серия будут обнулены.`)) {
                  onReset(habit);
                }
              }}
              className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition"
              title="Сбросить стрик и историю привычки"
            >
              <RotateCcw size={12} />
            </button>
          )}

          {/* Edit button */}
          <button
            type="button"
            onClick={() => onEdit(habit)}
            className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition"
            title="Редактировать привычку"
          >
            <Pencil size={12} />
          </button>
        </div>
      </div>

      {/* Bottom row: Today's quick toggle buttons and 5-day history strip */}
      <div className="mt-3 pt-2.5 border-t border-white/[0.06] flex items-center justify-between gap-2">
        {/* 7-day mini history strip */}
        <div className="flex items-center gap-1.5">
          {last7Days.map((day) => {
            return (
              <button
                key={day.dateStr}
                type="button"
                onClick={() => handleTogglePastDay(day.dateStr, day.status)}
                title={`${day.dateStr} (${day.dayLabel}): ${
                  day.status === 'completed'
                    ? 'Успешно'
                    : day.status === 'failed'
                    ? 'Срыв / Не выполнено'
                    : 'Не отмечено (клик для отметки)'
                }`}
                className="flex flex-col items-center gap-1 group/dot"
              >
                <span className={`text-[9px] font-mono leading-none ${day.isToday ? 'text-slate-200 font-bold' : 'text-slate-400'}`}>
                  {day.dayLabel}
                </span>
                <div
                  className={`w-3.5 h-3.5 rounded-full flex items-center justify-center transition-transform group-hover/dot:scale-125 ${
                    day.status === 'completed'
                      ? 'bg-emerald-500 text-white shadow-sm'
                      : day.status === 'failed'
                      ? 'bg-rose-500 text-white shadow-sm'
                      : day.isToday
                      ? 'bg-white/10 border border-white/30'
                      : 'bg-white/[0.06] border border-white/10'
                  }`}
                >
                  {day.status === 'completed' && <Check size={8} strokeWidth={3} />}
                  {day.status === 'failed' && <X size={8} strokeWidth={3} />}
                </div>
              </button>
            );
          })}
        </div>

        {/* Today quick action buttons */}
        <div className="flex items-center gap-1.5">
          {/* Mark Success */}
          <button
            type="button"
            onClick={() => handleToggleToday('completed')}
            title={todayStatus === 'completed' ? 'Снять отметку' : 'Отметить день как УСПЕШНЫЙ'}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold transition active:scale-95 ${
              todayStatus === 'completed'
                ? 'bg-emerald-500 text-white shadow-[0_2px_10px_rgba(16,185,129,0.4)]'
                : 'bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/30'
            }`}
          >
            <Check size={12} strokeWidth={3} />
            <span className="text-[11px]">{todayStatus === 'completed' ? 'Сделано' : 'Успех'}</span>
          </button>

          {/* Mark Failed */}
          <button
            type="button"
            onClick={() => handleToggleToday('failed')}
            title={todayStatus === 'failed' ? 'Снять отметку' : 'Зафиксировать СРЫВ / пропуск'}
            className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold transition active:scale-95 ${
              todayStatus === 'failed'
                ? 'bg-rose-500 text-white shadow-[0_2px_10px_rgba(244,63,94,0.4)]'
                : 'bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/25'
            }`}
          >
            <X size={12} strokeWidth={3} />
            <span className="text-[11px]">{todayStatus === 'failed' ? 'Срыв' : ''}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
