import React from 'react';
import { X, Trash2, Check } from 'lucide-react';
import type { Habit } from '../types';
import { HABIT_ICONS, renderHabitIcon } from './HabitIcons';

interface HabitModalProps {
  isOpen: boolean;
  onClose: () => void;
  habit: Habit | null; // null => new habit
  onSave: (habit: Habit) => void;
  onDelete?: (habitId: string) => void;
}

const PRESET_COLORS = [
  '#10b981', // Emerald
  '#0ea5e9', // Sky
  '#6366f1', // Indigo
  '#8b5cf6', // Violet
  '#ec4899', // Pink
  '#f97316', // Orange
  '#f59e0b', // Amber
  '#06b6d4', // Cyan
  '#14b8a6', // Teal
  '#64748b', // Slate
];

export const HabitModal: React.FC<HabitModalProps> = ({
  isOpen,
  onClose,
  habit,
  onSave,
  onDelete,
}) => {
  const [title, setTitle] = React.useState('');
  const [description, setDescription] = React.useState('');
  const [icon, setIcon] = React.useState('Sparkles');
  const [color, setColor] = React.useState('#10b981');
  const [frequency, setFrequency] = React.useState<'daily' | 'weekdays'>('daily');

  React.useEffect(() => {
    if (habit) {
      setTitle(habit.title);
      setDescription(habit.description || '');
      setIcon(habit.icon || 'Sparkles');
      setColor(habit.color || '#10b981');
      setFrequency(habit.frequency || 'daily');
    } else {
      setTitle('');
      setDescription('');
      setIcon('Sparkles');
      setColor(PRESET_COLORS[Math.floor(Math.random() * PRESET_COLORS.length)]);
      setFrequency('daily');
    }
  }, [habit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const saved: Habit = {
      id: habit ? habit.id : `habit_${Date.now()}`,
      title: title.trim(),
      description: description.trim(),
      icon,
      color,
      frequency,
      created_at: habit ? habit.created_at : Math.floor(Date.now() / 1000),
      logs: habit ? habit.logs : {},
    };

    onSave(saved);
    onClose();
  };

  const handleDelete = () => {
    if (!habit || !onDelete) return;
    if (confirm(`Удалить привычку "${habit.title}" и всю историю ее выполнения?`)) {
      onDelete(habit.id);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-lg bg-[#16181e] border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="h-14 px-5 border-b border-white/10 flex items-center justify-between bg-[#13151b]">
          <div className="flex items-center gap-2.5">
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center text-white shadow-sm"
              style={{ backgroundColor: color }}
            >
              {renderHabitIcon(icon, { size: 14 })}
            </div>
            <h2 className="text-sm font-semibold text-white">
              {habit ? 'Редактировать привычку' : 'Новая привычка'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition"
          >
            <X size={16} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-4">
          {/* Title */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-300 block">
              Название привычки *
            </label>
            <input
              type="text"
              required
              autoFocus
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Например: Пить 2л воды, Читать 20 мин, Без сахара..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#1e2028] border border-white/10 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition"
            />
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-300 block">
              Мотивация или подробности (необязательно)
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Зачем это нужно или в какое время дня выполнять"
              className="w-full px-3.5 py-2 rounded-xl bg-[#1e2028] border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition"
            />
          </div>

          {/* Frequency selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-300 block">
              Периодичность
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setFrequency('daily')}
                className={`py-2 px-3 rounded-xl text-xs font-medium border transition ${
                  frequency === 'daily'
                    ? 'border-indigo-500/80 bg-indigo-500/15 text-white shadow-sm'
                    : 'border-white/10 bg-white/[0.02] text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                Каждый день
              </button>
              <button
                type="button"
                onClick={() => setFrequency('weekdays')}
                className={`py-2 px-3 rounded-xl text-xs font-medium border transition ${
                  frequency === 'weekdays'
                    ? 'border-indigo-500/80 bg-indigo-500/15 text-white shadow-sm'
                    : 'border-white/10 bg-white/[0.02] text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                Только по будням (Пн-Пт)
              </button>
            </div>
          </div>

          {/* Icon Picker Grid */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-slate-300 block">
              Иконка привычки
            </label>
            <div className="grid grid-cols-5 sm:grid-cols-10 gap-2 p-2 rounded-2xl bg-[#1a1d26] border border-white/[0.06] max-h-40 overflow-y-auto">
              {HABIT_ICONS.map((item) => {
                const isSelected = icon.toLowerCase() === item.id.toLowerCase();
                const IconComp = item.component;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setIcon(item.id)}
                    title={item.name}
                    className={`p-2 rounded-xl flex items-center justify-center transition ${
                      isSelected
                        ? 'bg-indigo-600 text-white shadow-md ring-1 ring-white/30'
                        : 'text-slate-400 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <IconComp size={18} />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Color swatches */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-slate-300 block">
              Цветовой акцент
            </label>
            <div className="flex flex-wrap items-center gap-2">
              {PRESET_COLORS.map((preset) => {
                const isSelected = color.toLowerCase() === preset.toLowerCase();
                return (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setColor(preset)}
                    className="w-7 h-7 rounded-full transition-transform hover:scale-110 flex items-center justify-center shadow-md relative"
                    style={{ backgroundColor: preset }}
                  >
                    {isSelected && <Check size={13} className="text-white drop-shadow" />}
                  </button>
                );
              })}

              {/* Custom color input */}
              <label
                className="w-7 h-7 rounded-full cursor-pointer border border-dashed border-white/30 hover:border-white transition flex items-center justify-center relative overflow-hidden"
                style={{ backgroundColor: color }}
                title="Свой цвет"
              >
                <input
                  type="color"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="opacity-0 absolute inset-0 w-full h-full cursor-pointer"
                />
              </label>
            </div>
          </div>

          {/* Footer actions */}
          <div className="pt-3 border-t border-white/10 flex items-center justify-between">
            {habit && onDelete ? (
              <button
                type="button"
                onClick={handleDelete}
                className="flex items-center gap-1.5 text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 px-3 py-2 rounded-xl transition"
              >
                <Trash2 size={13} />
                <span>Удалить привычку</span>
              </button>
            ) : (
              <div />
            )}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3.5 py-2 rounded-full text-xs text-slate-400 hover:text-white transition"
              >
                Отмена
              </button>
              <button
                type="submit"
                className="ios-glass-btn px-5 py-2 rounded-full text-xs font-semibold"
              >
                {habit ? 'Сохранить' : 'Создать'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
