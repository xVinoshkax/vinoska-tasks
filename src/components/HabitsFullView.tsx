import React from 'react';
import { Sparkles, Plus, Flame, Award, CheckCircle2, XCircle, Pencil, ChevronLeft, ChevronRight, Check, X, RotateCcw } from 'lucide-react';
import type { Habit, HabitStatus } from '../types';
import { HabitStorage } from '../api/client';
import { renderHabitIcon } from './HabitIcons';
import { playCheckClick, playHabitFailSound } from '../utils/sound';

interface HabitsFullViewProps {
  habits: Habit[];
  onLogDay: (habitId: string, dateStr: string, status: HabitStatus | null) => void;
  onNewHabit: () => void;
  onEditHabit: (habit: Habit) => void;
  onResetHabit?: (habitId: string) => void;
}

export const HabitsFullView: React.FC<HabitsFullViewProps> = ({
  habits,
  onLogDay,
  onNewHabit,
  onEditHabit,
  onResetHabit,
}) => {
  const [currentMonthDate, setCurrentMonthDate] = React.useState(new Date());

  const year = currentMonthDate.getFullYear();
  const month = currentMonthDate.getMonth();

  const monthNames = [
    'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
    'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
  ];

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayWeekDay = new Date(year, month, 1).getDay(); // 0 = Sun, 1 = Mon ...
  const startOffset = firstDayWeekDay === 0 ? 6 : firstDayWeekDay - 1; // Mon = 0

  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];

  const handlePrevMonth = () => {
    setCurrentMonthDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonthDate(new Date(year, month + 1, 1));
  };

  const handleToggleDay = (habitId: string, dateStr: string, currentStatus: HabitStatus | null) => {
    if (currentStatus === 'completed') {
      playHabitFailSound();
      onLogDay(habitId, dateStr, 'failed');
    } else if (currentStatus === 'failed') {
      onLogDay(habitId, dateStr, null);
    } else {
      playCheckClick();
      onLogDay(habitId, dateStr, 'completed');
    }
  };

  // Overall stats
  const totalStats = React.useMemo(() => {
    let completed = 0;
    let failed = 0;
    let maxStreak = 0;

    habits.forEach((h) => {
      const s = HabitStorage.calculateStats(h);
      completed += s.totalCompleted;
      failed += s.totalFailed;
      if (s.bestStreak > maxStreak) maxStreak = s.bestStreak;
    });

    const evaluated = completed + failed;
    const rate = evaluated > 0 ? Math.round((completed / evaluated) * 100) : 100;

    return { completed, failed, maxStreak, rate };
  }, [habits]);

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Top Summary Banner */}
        <div className="p-5 rounded-2xl bg-[#16181e] border border-white/[0.08] shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Sparkles size={16} className="text-indigo-400" />
              <h2 className="text-base font-semibold text-white tracking-tight">
                Трекер привычек и дисциплины
              </h2>
            </div>
            <p className="text-xs text-slate-400">
              Отслеживай успешные дни, фиксируй срывы и формируй железные стрики
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onNewHabit}
              className="ios-glass-btn px-4 py-2 rounded-full text-xs font-semibold flex items-center gap-1.5 shadow-sm"
            >
              <Plus size={14} />
              <span>Новая привычка</span>
            </button>
          </div>
        </div>

        {/* Global Stats Counter Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3.5 rounded-2xl bg-[#1c1c1e] border border-white/[0.06] space-y-1">
            <span className="text-[11px] text-slate-400 flex items-center gap-1">
              <CheckCircle2 size={13} className="text-emerald-400" />
              Успешных отметок
            </span>
            <span className="text-xl font-bold font-mono text-white">
              {totalStats.completed}
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#1c1c1e] border border-white/[0.06] space-y-1">
            <span className="text-[11px] text-slate-400 flex items-center gap-1">
              <XCircle size={13} className="text-rose-400" />
              Срывов / Пропусков
            </span>
            <span className="text-xl font-bold font-mono text-slate-200">
              {totalStats.failed}
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#1c1c1e] border border-white/[0.06] space-y-1">
            <span className="text-[11px] text-slate-400 flex items-center gap-1">
              <Award size={13} className="text-amber-400" />
              Лучший стрик
            </span>
            <span className="text-xl font-bold font-mono text-amber-300">
              {totalStats.maxStreak} дн.
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#1c1c1e] border border-white/[0.06] space-y-1">
            <span className="text-[11px] text-slate-400 flex items-center gap-1">
              <Flame size={13} className="text-indigo-400" />
              Общий процент успеха
            </span>
            <span className="text-xl font-bold font-mono text-indigo-300">
              {totalStats.rate}%
            </span>
          </div>
        </div>

        {/* Month Selector Bar */}
        <div className="flex items-center justify-between px-2">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-white">
              {monthNames[month]} {year}
            </h3>
          </div>

          <div className="flex items-center gap-1 bg-[#1c1c1e] border border-white/10 rounded-full p-0.5">
            <button
              onClick={handlePrevMonth}
              className="p-1 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition"
              title="Предыдущий месяц"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={() => setCurrentMonthDate(new Date())}
              className="text-[11px] px-2.5 py-0.5 text-slate-300 hover:text-white transition font-medium"
            >
              Текущий
            </button>
            <button
              onClick={handleNextMonth}
              className="p-1 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition"
              title="Следующий месяц"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

        {/* Habits List with Calendar Heatmaps */}
        <div className="space-y-4">
          {habits.map((habit) => {
            const stats = HabitStorage.calculateStats(habit);
            const todayStatus = habit.logs[todayStr] || null;

            return (
              <div
                key={habit.id}
                className="ios-card p-5 rounded-2xl bg-[#1c1c1e] border border-white/[0.08] shadow-sm space-y-4"
                style={{
                  borderLeftWidth: '4px',
                  borderLeftColor: habit.color,
                }}
              >
                {/* Habit Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-2xl flex items-center justify-center text-white shadow-sm"
                      style={{ backgroundColor: `${habit.color}25`, color: habit.color }}
                    >
                      {renderHabitIcon(habit.icon, { size: 20 })}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-semibold text-white tracking-tight">
                          {habit.title}
                        </h4>
                        <span className="text-[10px] text-slate-400 bg-white/[0.05] px-2 py-0.5 rounded-full font-medium">
                          {habit.frequency === 'weekdays' ? 'Будни' : 'Каждый день'}
                        </span>
                      </div>
                      {habit.description && (
                        <p className="text-xs text-slate-400 mt-0.5">{habit.description}</p>
                      )}
                    </div>
                  </div>

                  {/* Badges & Actions */}
                  <div className="flex items-center gap-2">
                    {/* Streak pill */}
                    <div
                      className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-mono font-semibold border ${
                        stats.currentStreak > 0
                          ? 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                          : 'bg-white/[0.04] text-slate-400 border-white/[0.06]'
                      }`}
                    >
                      <Flame size={13} className={stats.currentStreak > 0 ? 'fill-amber-400 text-amber-400' : 'text-slate-500'} />
                      <span>{stats.currentStreak} дн.</span>
                    </div>

                    {/* Today Quick Toggle */}
                    <button
                      type="button"
                      onClick={() => handleToggleDay(habit.id, todayStr, todayStatus)}
                      className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition ${
                        todayStatus === 'completed'
                          ? 'bg-emerald-500 text-white shadow-md'
                          : todayStatus === 'failed'
                          ? 'bg-rose-500 text-white shadow-md'
                          : 'bg-white/[0.05] hover:bg-white/[0.1] text-slate-300 border border-white/10'
                      }`}
                    >
                      {todayStatus === 'completed' && <Check size={13} strokeWidth={3} />}
                      {todayStatus === 'failed' && <X size={13} strokeWidth={3} />}
                      <span>
                        {todayStatus === 'completed'
                          ? 'Сегодня: Успех'
                          : todayStatus === 'failed'
                          ? 'Сегодня: Срыв'
                          : 'Отметить сегодня'}
                      </span>
                    </button>

                    {/* Edit button */}
                    <button
                      type="button"
                      onClick={() => onEditHabit(habit)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition"
                      title="Редактировать привычку"
                    >
                      <Pencil size={14} />
                    </button>

                    {/* Reset habit button */}
                    {onResetHabit && (
                      <button
                        type="button"
                        onClick={() => {
                          if (window.confirm(`Сбросить трекер привычки "${habit.title}"? Вся история отметок и серия будут обнулены.`)) {
                            onResetHabit(habit.id);
                          }
                        }}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition"
                        title="Сбросить трекер этой привычки"
                      >
                        <RotateCcw size={14} />
                      </button>
                    )}
                  </div>
                </div>

                {/* Habit Stats Row */}
                <div className="flex flex-wrap items-center gap-4 text-xs pt-2 border-t border-white/[0.05] text-slate-400">
                  <span>
                    Всего выполнено: <strong className="text-white">{stats.totalCompleted}</strong>
                  </span>
                  <span>
                    Срывов: <strong className="text-rose-400">{stats.totalFailed}</strong>
                  </span>
                  <span>
                    Рекорд серии: <strong className="text-amber-400">{stats.bestStreak} дн.</strong>
                  </span>
                  <span>
                    Успешность: <strong className="text-indigo-300">{stats.successRate}%</strong>
                  </span>
                </div>

                {/* Month Calendar Grid */}
                <div className="pt-2">
                  <div className="grid grid-cols-7 gap-1.5 text-center text-[10px] text-slate-500 mb-1 font-mono">
                    <span>Пн</span>
                    <span>Вт</span>
                    <span>Ср</span>
                    <span>Чт</span>
                    <span>Пт</span>
                    <span className="text-slate-400">Сб</span>
                    <span className="text-slate-400">Вс</span>
                  </div>

                  <div className="grid grid-cols-7 gap-1.5">
                    {/* Padding cells before 1st of month */}
                    {Array.from({ length: startOffset }).map((_, idx) => (
                      <div key={`pad_${idx}`} className="h-8 rounded-lg bg-transparent" />
                    ))}

                    {/* Days of current month */}
                    {Array.from({ length: daysInMonth }).map((_, idx) => {
                      const dayNum = idx + 1;
                      const dStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
                      const status = habit.logs[dStr] || null;
                      const isToday = dStr === todayStr;

                      return (
                        <button
                          key={dStr}
                          type="button"
                          onClick={() => handleToggleDay(habit.id, dStr, status)}
                          title={`${dStr}: ${
                            status === 'completed'
                              ? 'Успешно'
                              : status === 'failed'
                              ? 'Срыв / Пропуск'
                              : 'Не отмечено (клик для изменения)'
                          }`}
                          className={`h-8 rounded-xl flex items-center justify-center text-xs font-mono transition-transform hover:scale-105 relative ${
                            status === 'completed'
                              ? 'bg-emerald-500 text-white font-bold shadow-sm'
                              : status === 'failed'
                              ? 'bg-rose-500 text-white font-bold shadow-sm'
                              : isToday
                              ? 'bg-white/10 text-white font-semibold ring-1 ring-white/40'
                              : 'bg-white/[0.03] text-slate-400 hover:bg-white/[0.08] hover:text-white'
                          }`}
                        >
                          <span>{dayNum}</span>
                          {status === 'completed' && (
                            <Check size={8} strokeWidth={3} className="absolute bottom-1 right-1" />
                          )}
                          {status === 'failed' && (
                            <X size={8} strokeWidth={3} className="absolute bottom-1 right-1" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
