import React from 'react';
import { Sparkles, Plus, PanelLeftClose, PanelLeft, ExternalLink, Flame, Check, X, Pencil, RotateCcw } from 'lucide-react';
import type { Habit, HabitStatus } from '../types';
import { HabitStorage } from '../api/client';
import { renderHabitIcon } from './HabitIcons';
import { playCheckClick, playHabitFailSound } from '../utils/sound';

interface HabitsColumnProps {
  isOpen: boolean;
  onToggle: () => void;
  habits: Habit[];
  onLogDay: (habitId: string, dateStr: string, status: HabitStatus | null) => void;
  onNewHabit: () => void;
  onEditHabit: (habit: Habit) => void;
  onOpenFullView: () => void;
  onResetHabit?: (habitId: string) => void;
  onResetTodayHabits?: () => void;
}

export const HabitsColumn: React.FC<HabitsColumnProps> = ({
  isOpen,
  onToggle,
  habits,
  onLogDay,
  onNewHabit,
  onEditHabit,
  onOpenFullView,
  onResetHabit,
  onResetTodayHabits,
}) => {
  const today = React.useMemo(() => new Date(), []);
  const todayStr = React.useMemo(() => today.toISOString().split('T')[0], [today]);

  const totalHabits = habits.length;
  const completedToday = habits.filter((h) => h.logs?.[todayStr] === 'completed').length;
  const progressPercent = totalHabits > 0 ? Math.round((completedToday / totalHabits) * 100) : 0;

  // 5-day mini history dates
  const recentDays = React.useMemo(() => {
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

  if (!isOpen) {
    return (
      <aside className="hidden md:flex w-14 shrink-0 h-screen sticky top-0 flex-col items-center bg-transparent z-10 select-none">
        {/* Collapsed header: exact matching h-14 (56px) and border-b */}
        <div className="h-14 w-full flex items-center justify-center border-b border-white/[0.08] bg-[#121214]">
          <button
            type="button"
            onClick={onToggle}
            title="Развернуть привычки"
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition"
          >
            <PanelLeft size={17} />
          </button>
        </div>

        {/* Mini progress badge floating */}
        <div
          onClick={onToggle}
          title={`Привычки дня: ${completedToday} из ${totalHabits} (${progressPercent}%) • Нажмите, чтобы развернуть`}
          className="mt-2.5 px-2 py-1.5 rounded-xl bg-[#1c1c1e] border border-white/[0.08] shadow-sm flex flex-col items-center cursor-pointer hover:bg-[#242426] transition"
        >
          <span className="text-[10px] font-mono font-bold text-emerald-400">
            {completedToday}/{totalHabits}
          </span>
          <div className="w-7 h-1 rounded-full bg-white/[0.08] overflow-hidden mt-1">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 to-emerald-400 rounded-full"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Vertical habits rail */}
        <div className="flex-1 overflow-y-auto py-2.5 flex flex-col items-center gap-2 w-full px-1.5">
          {habits.length === 0 ? (
            <button
              type="button"
              onClick={onNewHabit}
              title="Создать первую привычку"
              className="w-9 h-9 rounded-xl border border-dashed border-white/20 text-slate-500 hover:text-white hover:border-white/40 flex items-center justify-center transition"
            >
              <Plus size={14} />
            </button>
          ) : (
            habits.map((habit) => {
              const status = habit.logs?.[todayStr] || null;
              const isCompleted = status === 'completed';
              const isFailed = status === 'failed';

              const handleQuickToggle = () => {
                if (status === 'completed') {
                  playHabitFailSound();
                  onLogDay(habit.id, todayStr, 'failed');
                } else if (status === 'failed') {
                  onLogDay(habit.id, todayStr, null);
                } else {
                  playCheckClick();
                  onLogDay(habit.id, todayStr, 'completed');
                }
              };

              return (
                <button
                  key={habit.id}
                  type="button"
                  onClick={handleQuickToggle}
                  onContextMenu={(e) => {
                    e.preventDefault();
                    if (status !== 'failed') playHabitFailSound();
                    onLogDay(habit.id, todayStr, status === 'failed' ? null : 'failed');
                  }}
                  title={`${habit.title} • ${
                    isCompleted
                      ? 'Выполнено ✓ (клик: пропуск)'
                      : isFailed
                      ? 'Пропуск ✕ (клик: сброс)'
                      : 'Клик: выполнить (ПКМ: пропуск)'
                  }`}
                  className={`w-9 h-9 rounded-xl flex items-center justify-center relative transition-all active:scale-95 group shadow-sm ${
                    isCompleted
                      ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/40 shadow-sm shadow-emerald-500/10'
                      : isFailed
                      ? 'bg-rose-500/15 text-rose-400 border border-rose-500/40 shadow-sm shadow-rose-500/10'
                      : 'bg-[#1c1c1e] hover:bg-[#242426] text-slate-300 border border-white/[0.08]'
                  }`}
                  style={{
                    borderLeftWidth: '2.5px',
                    borderLeftColor: habit.color,
                  }}
                >
                  <span className="shrink-0 flex items-center justify-center">
                    {renderHabitIcon(habit.icon, { size: 14 })}
                  </span>

                  {/* Status dot in top-right */}
                  {isCompleted && (
                    <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-500 border border-[#1c1c1e]" />
                  )}
                  {isFailed && (
                    <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-rose-500 border border-[#1c1c1e]" />
                  )}
                </button>
              );
            })
          )}
        </div>

        {/* Collapsed footer */}
        <div className="p-2 flex flex-col items-center gap-1.5 shrink-0 bg-transparent w-full">
          <button
            type="button"
            onClick={onNewHabit}
            title="Создать привычку"
            className="p-2 rounded-xl text-slate-400 hover:text-white bg-[#1c1c1e] border border-white/[0.08] shadow-sm hover:bg-[#242426] transition"
          >
            <Plus size={15} />
          </button>
          <button
            type="button"
            onClick={onOpenFullView}
            title="Календарь привычек"
            className="p-2 rounded-xl text-slate-400 hover:text-white bg-[#1c1c1e] border border-white/[0.08] shadow-sm hover:bg-[#242426] transition"
          >
            <ExternalLink size={14} />
          </button>
        </div>
      </aside>
    );
  }

  return (
    <aside className="hidden md:flex w-72 shrink-0 h-screen sticky top-0 flex-col bg-transparent z-10 select-none">
      {/* Header bar: exactly matching h-14 (56px) and seamless across top */}
      <div className="h-14 px-3.5 flex items-center justify-between border-b border-white/[0.08] bg-[#121214] shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-indigo-500/15 border border-indigo-500/25 flex items-center justify-center text-indigo-400 shadow-sm">
            <Sparkles size={13} />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-semibold text-white tracking-tight">
                Привычки дня
              </span>
              <span className="text-[10px] font-mono font-medium text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.2 rounded-full">
                {completedToday}/{totalHabits}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={onNewHabit}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition"
            title="Создать новую привычку"
          >
            <Plus size={14} />
          </button>
          <button
            type="button"
            onClick={onToggle}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition"
            title="Свернуть колонку привычек"
          >
            <PanelLeftClose size={14} />
          </button>
        </div>
      </div>

      {/* Scrollable Habits List (floating on canvas background) */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
        {/* Today Progress Floating Card Widget */}
        <div className="p-3 rounded-2xl bg-[#1c1c1e] border border-white/[0.08] shadow-sm space-y-2">
          <div className="flex items-center justify-between text-[11px] text-slate-300">
            <span className="font-medium">Прогресс на сегодня</span>
            <div className="flex items-center gap-1.5">
              <span className="font-mono text-emerald-400 font-semibold">{progressPercent}%</span>
              {completedToday > 0 && onResetTodayHabits && (
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm('Сбросить отметки всех привычек за сегодня?')) {
                      onResetTodayHabits();
                    }
                  }}
                  className="p-1 rounded text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition"
                  title="Сбросить отметки привычек на сегодня"
                >
                  <RotateCcw size={11} />
                </button>
              )}
            </div>
          </div>
          <div className="w-full h-1.5 rounded-full bg-white/[0.08] overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 to-emerald-400 transition-all duration-300 rounded-full"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {habits.length === 0 ? (
          <div className="p-6 text-center text-xs text-slate-400 space-y-2 rounded-2xl bg-[#1c1c1e] border border-white/[0.08] shadow-sm mt-2">
            <p>Нет активных привычек</p>
            <button
              onClick={onNewHabit}
              className="px-3 py-1.5 rounded-xl bg-indigo-600 text-white text-xs hover:bg-indigo-700 transition shadow-sm"
            >
              + Создать привычку
            </button>
          </div>
        ) : (
          habits.map((habit) => {
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
                className={`p-3 rounded-2xl border transition-all flex flex-col gap-2.5 group shadow-sm ${
                  status === 'completed'
                    ? 'bg-emerald-500/[0.06] border-emerald-500/30'
                    : status === 'failed'
                    ? 'bg-rose-500/[0.06] border-rose-500/30'
                    : 'bg-[#1c1c1e] hover:bg-[#242426] border-white/[0.08]'
                }`}
                style={{
                  borderLeftWidth: '3.5px',
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
                      className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0 shadow-sm"
                      style={{ backgroundColor: `${habit.color}25`, color: habit.color }}
                    >
                      {renderHabitIcon(habit.icon, { size: 13 })}
                    </span>
                    <div className="min-w-0 flex-1">
                      <span className="text-xs font-semibold text-white block truncate leading-tight">
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
                        <Flame size={10} className="fill-amber-500 text-amber-500" />
                        {stats.currentStreak}
                      </span>
                    )}

                    {onResetHabit && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (window.confirm(`Сбросить трекер привычки "${habit.title}"? Вся история отметок и серия будут обнулены.`)) {
                            onResetHabit(habit.id);
                          }
                        }}
                        className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded transition"
                        title="Сбросить трекер этой привычки"
                      >
                        <RotateCcw size={11} />
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => onEditHabit(habit)}
                      className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-white hover:bg-white/10 rounded transition"
                      title="Редактировать привычку"
                    >
                      <Pencil size={11} />
                    </button>
                  </div>
                </div>

                {/* Item Bottom: 5-Day Mini History & Quick Action Buttons */}
                <div className="flex items-center justify-between pt-1.5 border-t border-white/[0.04]">
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
                          className={`w-3.5 h-3.5 rounded flex items-center justify-center text-[7px] font-mono transition-all ${
                            st === 'completed'
                              ? 'bg-emerald-500 text-slate-950 font-bold'
                              : st === 'failed'
                              ? 'bg-rose-500 text-white font-bold'
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
                      className={`flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-medium transition-all active:scale-95 ${
                        status === 'completed'
                          ? 'bg-emerald-500 text-slate-950 font-bold shadow-sm shadow-emerald-500/30'
                          : 'bg-white/[0.04] text-slate-300 hover:text-emerald-300 hover:bg-emerald-500/15 border border-white/[0.06]'
                      }`}
                    >
                      <Check size={10} strokeWidth={status === 'completed' ? 3 : 2} />
                      <span>{status === 'completed' ? 'Готово' : 'Чек'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleToggleToday('failed')}
                      title={status === 'failed' ? 'Снять отметку' : 'Отметить срыв / пропуск'}
                      className={`p-1 rounded-lg text-[10px] transition-all active:scale-95 ${
                        status === 'failed'
                          ? 'bg-rose-500 text-white font-bold shadow-sm shadow-rose-500/30'
                          : 'bg-white/[0.04] text-slate-500 hover:text-rose-400 hover:bg-rose-500/15 border border-white/[0.06]'
                      }`}
                    >
                      <X size={10} strokeWidth={status === 'failed' ? 3 : 2} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Floating Footer Link to Full Calendar */}
      <div className="p-3 bg-transparent shrink-0">
        <button
          type="button"
          onClick={onOpenFullView}
          className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white bg-[#1c1c1e] hover:bg-[#242426] border border-white/[0.08] shadow-sm transition"
        >
          <span>Календарь привычек</span>
          <ExternalLink size={12} />
        </button>
      </div>
    </aside>
  );
};
