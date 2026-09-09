import React from 'react';
import { Sparkles, Plus, ExternalLink, PanelRight, Flame, Check, X } from 'lucide-react';
import type { Habit, HabitStatus } from '../types';
import { HabitStorage } from '../api/client';
import { renderHabitIcon } from './HabitIcons';
import { playCheckClick, playHabitFailSound } from '../utils/sound';

interface HabitsBottomDockProps {
  habits: Habit[];
  onLogDay: (habitId: string, dateStr: string, status: HabitStatus | null) => void;
  onNewHabit: () => void;
  onEditHabit: (habit: Habit) => void;
  onOpenFullView: () => void;
  onChangeLayoutMode: (mode: 'side' | 'bottom') => void;
}

export const HabitsBottomDock: React.FC<HabitsBottomDockProps> = ({
  habits,
  onLogDay,
  onNewHabit,
  onEditHabit,
  onOpenFullView,
  onChangeLayoutMode,
}) => {
  const todayStr = new Date().toISOString().split('T')[0];
  const totalHabits = habits.length;
  const completedToday = habits.filter((h) => h.logs?.[todayStr] === 'completed').length;
  const progressPercent = totalHabits > 0 ? Math.round((completedToday / totalHabits) * 100) : 0;

  if (habits.length === 0) return null;

  return (
    <div className="sticky bottom-4 z-30 max-w-4xl w-full mx-auto animate-in fade-in slide-in-from-bottom-3 duration-200">
      <div className="px-3.5 py-2 rounded-2xl bg-[#161820]/95 border border-white/[0.12] backdrop-blur-xl shadow-2xl flex items-center justify-between gap-3 select-none">
        {/* Left: Progress Badge */}
        <div
          onClick={onOpenFullView}
          className="flex items-center gap-2 shrink-0 cursor-pointer group py-1 px-1.5 rounded-xl hover:bg-white/[0.05] transition"
          title="Открыть полный трекер привычек"
        >
          <div className="w-6 h-6 rounded-lg bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
            <Sparkles size={12} />
          </div>
          <div className="leading-none">
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-semibold text-white">Привычки</span>
              <span className="text-[10px] font-mono font-medium text-emerald-400">
                {completedToday}/{totalHabits}
              </span>
            </div>
            <div className="w-16 h-1 bg-white/[0.08] rounded-full overflow-hidden mt-1">
              <div
                className="h-full bg-gradient-to-r from-indigo-500 to-emerald-400 rounded-full transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>

        <div className="h-5 w-px bg-white/[0.08] shrink-0" />

        {/* Center: Horizontal Scrollable Habit Pills */}
        <div className="flex-1 flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5 min-w-0">
          {habits.map((habit) => {
            const status = habit.logs?.[todayStr] || null;
            const stats = HabitStorage.calculateStats(habit);

            const handleToggle = (target: HabitStatus) => {
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
                className={`shrink-0 flex items-center gap-2 pl-2 pr-1.5 py-1 rounded-xl border text-xs transition-all ${
                  status === 'completed'
                    ? 'bg-emerald-500/15 border-emerald-500/35 text-white'
                    : status === 'failed'
                    ? 'bg-rose-500/15 border-rose-500/35 text-slate-300'
                    : 'bg-white/[0.04] hover:bg-white/[0.07] border-white/[0.08] text-slate-200'
                }`}
              >
                {/* Habit Icon & Title */}
                <div
                  onClick={() => onEditHabit(habit)}
                  className="flex items-center gap-1.5 cursor-pointer max-w-[140px] truncate"
                  title={`${habit.title} (Клик для редактирования)`}
                >
                  <span
                    className="w-5 h-5 rounded-md flex items-center justify-center shrink-0 shadow-sm"
                    style={{ backgroundColor: `${habit.color}25`, color: habit.color }}
                  >
                    {renderHabitIcon(habit.icon, { size: 11 })}
                  </span>
                  <span className="truncate text-[11px] font-medium">{habit.title}</span>
                </div>

                {/* Streak */}
                {stats.currentStreak > 0 && (
                  <span
                    className="flex items-center gap-0.5 text-[9px] font-mono px-1 py-0.2 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/20"
                    title={`Серия: ${stats.currentStreak} дн.`}
                  >
                    <Flame size={9} className="fill-amber-400 text-amber-400" />
                    {stats.currentStreak}
                  </span>
                )}

                {/* 1-Click Action Buttons */}
                <div className="flex items-center gap-1 shrink-0 ml-1">
                  <button
                    type="button"
                    onClick={() => handleToggle('completed')}
                    title={status === 'completed' ? 'Снять отметку' : 'Отметить выполнено'}
                    className={`w-5 h-5 rounded-md flex items-center justify-center transition-all active:scale-90 ${
                      status === 'completed'
                        ? 'bg-emerald-500 text-black font-bold shadow-sm shadow-emerald-500/30'
                        : 'text-slate-400 hover:text-emerald-300 hover:bg-emerald-500/15'
                    }`}
                  >
                    <Check size={11} strokeWidth={status === 'completed' ? 3 : 2} />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleToggle('failed')}
                    title={status === 'failed' ? 'Снять отметку' : 'Отметить срыв / пропуск'}
                    className={`w-5 h-5 rounded-md flex items-center justify-center transition-all active:scale-90 ${
                      status === 'failed'
                        ? 'bg-rose-500 text-white font-bold shadow-sm shadow-rose-500/30'
                        : 'text-slate-500 hover:text-rose-400 hover:bg-rose-500/15'
                    }`}
                  >
                    <X size={11} strokeWidth={status === 'failed' ? 3 : 2} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        <div className="h-5 w-px bg-white/[0.08] shrink-0" />

        {/* Right Controls: Switch to Side view, New Habit, Open Full */}
        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            onClick={() => onChangeLayoutMode('side')}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition"
            title="Расположить сбоку от задач"
          >
            <PanelRight size={14} />
          </button>

          <button
            type="button"
            onClick={onNewHabit}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition"
            title="Добавить привычку"
          >
            <Plus size={14} />
          </button>

          <button
            type="button"
            onClick={onOpenFullView}
            className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-300 hover:bg-white/10 transition"
            title="Открыть календарь привычек"
          >
            <ExternalLink size={13} />
          </button>
        </div>
      </div>
    </div>
  );
};
