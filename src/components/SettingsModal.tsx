import React from 'react';
import { X, Sliders, Volume2, VolumeX, Play, Check, AlertCircle } from 'lucide-react';
import {
  playCheckClick,
  playHabitFailSound,
  getHabitFailSoundStyle,
  setHabitFailSoundStyle,
  type HabitFailSoundStyle,
} from '../utils/sound';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  colorCardsByProject: boolean;
  onToggleColorCardsByProject: (val: boolean) => void;
  onOpenManageProperties: () => void;
  soundOn: boolean;
  onToggleSound: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  colorCardsByProject,
  onToggleColorCardsByProject,
  onOpenManageProperties,
  soundOn,
  onToggleSound,
}) => {
  const [failSoundStyle, setFailSoundStyleState] = React.useState<HabitFailSoundStyle>(() => getHabitFailSoundStyle());

  const handleSelectFailStyle = (style: HabitFailSoundStyle) => {
    setFailSoundStyleState(style);
    setHabitFailSoundStyle(style);
    playHabitFailSound(style);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-lg bg-[#16181e] border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="h-14 px-5 border-b border-white/10 flex items-center justify-between bg-[#13151b]">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shadow-sm">
              <Sliders size={14} />
            </div>
            <h2 className="text-sm font-semibold text-white">Настройки приложения</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition"
          >
            <X size={16} />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {/* Section 1: Sound Effects & Habit Break Sound */}
          <div className="p-4 rounded-2xl bg-[#1c1f2a] border border-white/[0.06] space-y-4">
            {/* Master Sound Switch */}
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-white/[0.04] text-slate-300">
                  {soundOn ? <Volume2 size={16} className="text-emerald-400" /> : <VolumeX size={16} />}
                </div>
                <div>
                  <span className="text-xs font-semibold text-white block">
                    Звуковые эффекты
                  </span>
                  <span className="text-[11px] text-slate-400 block mt-0.5">
                    Аудиоотклики при завершении задач, чек-инах и таймере
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={onToggleSound}
                className={`w-11 h-6 rounded-full transition-colors relative shrink-0 p-0.5 ${
                  soundOn ? 'bg-emerald-500' : 'bg-zinc-700'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white shadow-md transition-transform ${
                    soundOn ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {soundOn && (
              <div className="pt-3 border-t border-white/[0.06] space-y-3.5">
                {/* Positive Chime Preview */}
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-black/20 border border-white/[0.04]">
                  <div>
                    <span className="text-xs font-medium text-slate-200 block">
                      Звук выполнения (Чек)
                    </span>
                    <span className="text-[10px] text-slate-400 block">
                      Мягкий кристаллический перезвон (Things 3 / Linear)
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => playCheckClick()}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-white/[0.06] hover:bg-white/10 text-slate-200 hover:text-white transition active:scale-95"
                  >
                    <Play size={11} className="fill-current" />
                    <span>Тест</span>
                  </button>
                </div>

                {/* Habit Break Negative Sound Options */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-slate-200 flex items-center gap-1.5">
                      <AlertCircle size={13} className="text-rose-400" />
                      Звук срыва привычки (Негативный)
                    </span>
                    <button
                      type="button"
                      onClick={() => playHabitFailSound(failSoundStyle)}
                      className="flex items-center gap-1 text-[11px] font-medium text-rose-400 hover:text-rose-300 transition"
                    >
                      <Play size={10} className="fill-current" />
                      <span>Прослушать</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'minor' as const, label: 'Мягкий минор', desc: 'Apple chord down' },
                      { id: 'dull' as const, label: 'Глухой дроп', desc: 'Sub bass thud' },
                      { id: 'descend' as const, label: 'Двойной тон', desc: 'Descending chime' },
                    ].map((opt) => {
                      const isSelected = failSoundStyle === opt.id;
                      return (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => handleSelectFailStyle(opt.id)}
                          className={`p-2.5 rounded-xl border text-left transition-all ${
                            isSelected
                              ? 'bg-rose-500/15 border-rose-500/40 text-white shadow-sm'
                              : 'bg-black/20 hover:bg-white/[0.04] border-white/[0.06] text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-semibold block">{opt.label}</span>
                            {isSelected && <Check size={12} className="text-rose-400 shrink-0" />}
                          </div>
                          <span className="text-[10px] text-slate-400 block line-clamp-1">{opt.desc}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Section 2: Project Colors on Task Cards */}
          <div className="p-4 rounded-2xl bg-[#1c1f2a] border border-white/[0.06] flex items-center justify-between gap-4">
            <div>
              <span className="text-xs font-semibold text-white block">
                Окрашивать карточки в цвет проекта
              </span>
              <span className="text-[11px] text-slate-400 block mt-0.5">
                Добавляет левый акцент и мягкий градиент на задачи в цвет их проекта
              </span>
            </div>

            <button
              type="button"
              onClick={() => onToggleColorCardsByProject(!colorCardsByProject)}
              className={`w-11 h-6 rounded-full transition-colors relative shrink-0 p-0.5 ${
                colorCardsByProject ? 'bg-emerald-500' : 'bg-zinc-700'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white shadow-md transition-transform ${
                  colorCardsByProject ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Section 3: Properties management link */}
          <div className="pt-1">
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenManageProperties();
              }}
              className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.06] text-xs text-slate-200 font-medium transition group"
            >
              <div className="flex items-center gap-2.5">
                <Sliders size={15} className="text-indigo-400" />
                <span>Управление приоритетами</span>
              </div>
              <span className="text-slate-400 group-hover:text-white transition">→</span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="h-14 px-5 border-t border-white/10 flex items-center justify-end bg-[#13151b]">
          <button
            type="button"
            onClick={onClose}
            className="ios-glass-btn px-5 py-2 rounded-full text-xs font-semibold"
          >
            Готово
          </button>
        </div>
      </div>
    </div>
  );
};
