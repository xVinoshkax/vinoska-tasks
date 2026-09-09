import React from 'react';
import { X, Palette, Sliders, Volume2, VolumeX, Check, Sparkles } from 'lucide-react';
import type { ThemeId } from '../types';
import { THEME_OPTIONS } from '../api/client';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentTheme: ThemeId;
  onSelectTheme: (theme: ThemeId) => void;
  colorCardsByProject: boolean;
  onToggleColorCardsByProject: (val: boolean) => void;
  onOpenManageProperties: () => void;
  soundOn: boolean;
  onToggleSound: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  currentTheme,
  onSelectTheme,
  colorCardsByProject,
  onToggleColorCardsByProject,
  onOpenManageProperties,
  soundOn,
  onToggleSound,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-lg bg-[#16181e] border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="h-14 px-5 border-b border-white/10 flex items-center justify-between bg-[#13151b]">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-xl bg-white/10 flex items-center justify-center text-white shadow-sm">
              <Palette size={14} />
            </div>
            <h2 className="text-sm font-semibold text-white">Настройки и темы оформления</h2>
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
          {/* Section 1: Themes Selection */}
          <div className="space-y-3">
            <div className="flex items-center gap-1.5">
              <Sparkles size={14} className="text-indigo-400" />
              <h3 className="text-xs font-semibold text-slate-200 uppercase tracking-wider">
                Тема интерфейса
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {THEME_OPTIONS.map((theme) => {
                const isActive = currentTheme === theme.id;
                return (
                  <button
                    key={theme.id}
                    type="button"
                    onClick={() => onSelectTheme(theme.id)}
                    className={`text-left p-3 rounded-2xl border transition-all relative group flex flex-col justify-between ${
                      isActive
                        ? 'border-indigo-500/80 bg-white/[0.06] shadow-lg ring-1 ring-indigo-500/50'
                        : 'border-white/[0.07] bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full mb-2">
                      {/* Theme color swatch preview */}
                      <div className="flex items-center gap-1.5 p-1 rounded-lg border border-white/10 bg-black/40">
                        <div
                          className="w-4 h-4 rounded-md shadow-inner"
                          style={{ backgroundColor: theme.bgMain }}
                        />
                        <div
                          className="w-4 h-4 rounded-md shadow-inner"
                          style={{ backgroundColor: theme.bgSurface }}
                        />
                        <div
                          className="w-4 h-4 rounded-full shadow-sm"
                          style={{ backgroundColor: theme.accent }}
                        />
                      </div>

                      {isActive && (
                        <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                          <Check size={12} strokeWidth={3} />
                        </span>
                      )}
                    </div>

                    <div>
                      <span className="text-xs font-semibold text-white block">
                        {theme.name}
                      </span>
                      <span className="text-[11px] text-slate-400 block mt-0.5 line-clamp-1">
                        {theme.description}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
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

          {/* Section 3: Sound Effects */}
          <div className="p-4 rounded-2xl bg-[#1c1f2a] border border-white/[0.06] flex items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-white/[0.04] text-slate-300">
                {soundOn ? <Volume2 size={16} /> : <VolumeX size={16} />}
              </div>
              <div>
                <span className="text-xs font-semibold text-white block">
                  Звуковые эффекты
                </span>
                <span className="text-[11px] text-slate-400 block mt-0.5">
                  Приятные щелчки при отметке задач и сигналы таймера
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

          {/* Section 4: Properties management link */}
          <div className="pt-2">
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
                <span>Управление статусами и приоритетами</span>
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
