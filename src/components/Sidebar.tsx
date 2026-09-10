import React from 'react';
import { 
  Inbox, 
  Clock, 
  CheckCircle2, 
  Sparkles, 
  Volume2, 
  VolumeX, 
  PanelLeftClose, 
  Flame,
  Pencil,
  Settings2,
  Layers,
  Cloud,
  LogOut,
  X
} from 'lucide-react';
import type { Project, ViewFilter, ActivityDay, Habit, Task, UserProfile, SyncStatus } from '../types';
import { toggleSound, isSoundEnabled } from '../utils/sound';
import { SidebarActivityWidget } from './SidebarActivityWidget';
import { MiniMonthCalendar } from './MiniMonthCalendar';

export const VinoskaLogo: React.FC<{ size?: number; className?: string }> = ({ size = 32, className = '' }) => {
  return (
    <div 
      className={`relative inline-flex items-center justify-center shrink-0 select-none group ${className}`}
      style={{ width: size, height: size }}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-[0_2px_10px_rgba(225,29,72,0.35)] transition-transform duration-200 group-hover:scale-105"
      >
        <defs>
          {/* Subtle dark wine/obsidian backdrop */}
          <linearGradient id="vl-bg-grad" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#2b0c1e" stopOpacity="0.95" />
            <stop offset="50%" stopColor="#170d1a" />
            <stop offset="100%" stopColor="#0b0710" />
          </linearGradient>

          {/* Premium border rim with rose-gold & ruby glow */}
          <linearGradient id="vl-border-grad" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.65" />
            <stop offset="50%" stopColor="rgba(255, 255, 255, 0.18)" />
            <stop offset="100%" stopColor="#a855f7" stopOpacity="0.4" />
          </linearGradient>

          {/* Wine liquid gradient: Rose to Deep Burgundy */}
          <linearGradient id="vl-wine-grad" x1="10" y1="11" x2="22" y2="18" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#fb7185" />
            <stop offset="35%" stopColor="#e11d48" />
            <stop offset="75%" stopColor="#9f1239" />
            <stop offset="100%" stopColor="#4c0519" />
          </linearGradient>

          {/* Crystal glass stroke */}
          <linearGradient id="vl-glass-stroke" x1="10" y1="7" x2="22" y2="26" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="rgba(255, 255, 255, 0.9)" />
            <stop offset="40%" stopColor="rgba(244, 114, 182, 0.6)" />
            <stop offset="80%" stopColor="rgba(255, 255, 255, 0.75)" />
            <stop offset="100%" stopColor="rgba(225, 29, 72, 0.5)" />
          </linearGradient>

          {/* Neon Wine Glow Filter */}
          <filter id="vl-wine-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="0" stdDeviation="1.2" floodColor="#f43f5e" floodOpacity="0.75" />
          </filter>
        </defs>

        {/* Squircle badge */}
        <rect
          x="0.75"
          y="0.75"
          width="30.5"
          height="30.5"
          rx="8.5"
          fill="url(#vl-bg-grad)"
          stroke="url(#vl-border-grad)"
          strokeWidth="1.2"
        />

        {/* Top glossy edge reflection */}
        <path
          d="M 5.5 2.2 C 10 1.8, 22 1.8, 26.5 2.2"
          stroke="white"
          strokeWidth="0.8"
          strokeLinecap="round"
          strokeOpacity="0.25"
        />

        {/* Wine Liquid inside the bowl */}
        <g filter="url(#vl-wine-glow)">
          <path
            d="M 10.3 12.2 C 12.2 13.1, 14.8 13.2, 17 12.6 C 19.2 12, 20.8 11.2, 21.7 11.5 C 22.4 13.8, 20.6 17.6, 16 17.6 C 11.4 17.6, 9.6 13.8, 10.3 12.2 Z"
            fill="url(#vl-wine-grad)"
          />
          {/* Swirling surface reflection */}
          <path
            d="M 11 12.5 C 13.5 13.4, 17 13.2, 20.5 11.8"
            stroke="#fda4af"
            strokeWidth="0.7"
            strokeLinecap="round"
            strokeOpacity="0.8"
          />
        </g>

        {/* Wine Glass Outline (Bowl, Stem, Foot) */}
        <g>
          {/* Glass Bowl */}
          <path
            d="M 10.2 7.5 C 9.2 12.2, 11.6 17.8, 16 17.8 C 20.4 17.8, 22.8 12.2, 21.8 7.5"
            stroke="url(#vl-glass-stroke)"
            strokeWidth="1.5"
            strokeLinecap="round"
          />

          {/* Glass Rim Top */}
          <ellipse
            cx="16"
            cy="7.5"
            rx="5.8"
            ry="1.2"
            stroke="url(#vl-glass-stroke)"
            strokeWidth="1.2"
            fill="none"
            strokeOpacity="0.7"
          />

          {/* Stem */}
          <path
            d="M 16 17.8 V 25.2"
            stroke="url(#vl-glass-stroke)"
            strokeWidth="1.6"
            strokeLinecap="round"
          />

          {/* Foot / Base */}
          <path
            d="M 11.5 25.5 C 13 25.2, 19 25.2, 20.5 25.5"
            stroke="url(#vl-glass-stroke)"
            strokeWidth="1.8"
            strokeLinecap="round"
          />

          {/* Specular Left Light Reflection */}
          <path
            d="M 11.2 9.5 C 10.5 11.8, 11.2 14.5, 12.2 15.6"
            stroke="white"
            strokeWidth="0.9"
            strokeLinecap="round"
            strokeOpacity="0.5"
          />

          {/* Sparkling glint on the rim */}
          <circle cx="21" cy="7.2" r="1" fill="#ffffff" />
          <circle cx="21" cy="7.2" r="2.2" fill="#fb7185" opacity="0.6" />
        </g>
      </svg>
    </div>
  );
};

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  activeView: ViewFilter;
  onSelectView: (view: ViewFilter) => void;
  projects: Project[];
  counts: {
    inbox: number;
    today: number;
    upcoming: number;
    all: number;
    done: number;
    projectCounts: Record<string, number>;
  };
  todayProgress: {
    completed: number;
    total: number;
  };
  activity: ActivityDay[];
  habits?: Habit[];
  habitsRemainingToday?: number;
  tasks?: Task[];
  onSelectDate?: (dateStr: string) => void;
  onResetProductivityStreak?: () => void;
  onNewProject: () => void;
  onEditProject: (project: Project) => void;
  onOpenSettings: () => void;
  user?: UserProfile | null;
  syncStatus?: SyncStatus;
  onOpenAuth?: () => void;
  onLogout?: () => void;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onToggle,
  activeView,
  onSelectView,
  projects,
  counts,
  todayProgress,
  activity,
  habits = [],
  habitsRemainingToday,
  tasks = [],
  onSelectDate,
  onResetProductivityStreak,
  onNewProject,
  onEditProject,
  onOpenSettings,
  user = null,
  syncStatus = 'offline',
  onOpenAuth,
  onLogout,
  isMobileOpen = false,
  onCloseMobile,
}) => {
  const [soundOn, setSoundOn] = React.useState(isSoundEnabled());

  const handleToggleSound = () => {
    const next = toggleSound();
    setSoundOn(next);
  };

  const streak = React.useMemo(() => {
    let count = 0;
    const now = new Date();
    const tStr = now.toISOString().split('T')[0];
    const yDate = new Date(now);
    yDate.setDate(yDate.getDate() - 1);
    const yStr = yDate.toISOString().split('T')[0];

    const todayCount = (activity.find(a => a.date === tStr)?.count || 0) + habits.filter(h => h.logs?.[tStr] === 'completed').length;
    const yesterdayCount = (activity.find(a => a.date === yStr)?.count || 0) + habits.filter(h => h.logs?.[yStr] === 'completed').length;

    let checkDate = new Date(now);
    if (todayCount > 0) {
      count = 1;
      checkDate.setDate(checkDate.getDate() - 1);
    } else if (yesterdayCount > 0) {
      count = 1;
      checkDate = new Date(yDate);
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      return 0;
    }

    while (true) {
      const dStr = checkDate.toISOString().split('T')[0];
      const dayCount = (activity.find(a => a.date === dStr)?.count || 0) + habits.filter(h => h.logs?.[dStr] === 'completed').length;
      if (dayCount > 0) {
        count++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }
    return count;
  }, [activity, habits]);

  const desktopCollapsedAside = (
    <aside className="hidden md:flex w-16 h-screen sticky top-0 flex-col items-center bg-[#13151d] z-20 border-r border-black/[0.06] dark:border-white/[0.08] select-none">
        {/* Collapsed header matching h-14 */}
        <div className="h-14 w-full flex items-center justify-center border-b border-black/[0.06] dark:border-white/[0.08]">
          <button
            onClick={onToggle}
            title="Развернуть меню ( [ )"
            className="p-1 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition flex items-center justify-center"
          >
            <VinoskaLogo size={28} />
          </button>
        </div>

        <div className="flex-1 flex flex-col items-center gap-2 mt-4">
          <button
            onClick={() => onSelectView('inbox')}
            title={`Входящие (${counts.inbox})`}
            className={`p-2 rounded-xl transition ${activeView === 'inbox' ? 'bg-white/10 text-white' : 'text-slate-400 hover:text-white'}`}
          >
            <Inbox size={17} />
          </button>
          <button
            onClick={() => onSelectView('today')}
            title={`Сегодня (${counts.today})`}
            className={`p-2 rounded-xl transition relative ${
              activeView === 'today'
                ? 'bg-white/10 text-amber-300 border border-amber-500/30'
                : 'text-slate-400 hover:text-amber-300 hover:bg-white/5'
            }`}
          >
            <div className="w-4 h-4 rounded-[4px] border border-amber-400/50 flex flex-col items-center justify-center overflow-hidden shrink-0">
              <div className="w-full h-1 bg-amber-400/70" />
              <span className="text-[7.5px] font-bold font-mono leading-none text-amber-300 mt-0.5">
                {new Date().getDate()}
              </span>
            </div>
          </button>
          <button
            onClick={() => onSelectView('upcoming')}
            title={`Предстоящие (${counts.upcoming})`}
            className={`p-2 rounded-xl transition ${activeView === 'upcoming' ? 'bg-white/10 text-white' : 'text-slate-400 hover:text-white'}`}
          >
            <Clock size={17} />
          </button>
          <button
            onClick={() => onSelectView('all')}
            title={`Все задачи (${counts.all})`}
            className={`p-2 rounded-xl transition ${activeView === 'all' ? 'bg-white/10 text-white' : 'text-slate-400 hover:text-white'}`}
          >
            <Layers size={17} />
          </button>
          <button
            onClick={() => onSelectView('done')}
            title={`Выполнено (${counts.done})`}
            className={`p-2 rounded-xl transition ${activeView === 'done' ? 'bg-white/10 text-white' : 'text-slate-400 hover:text-white'}`}
          >
            <CheckCircle2 size={17} />
          </button>

          {/* Separator for habits */}
          <div className="w-6 h-[1px] bg-white/[0.08] my-0.5" />

          <button
            onClick={() => onSelectView('habits')}
            title={`Привычки (${habitsRemainingToday || 0})`}
            className={`p-2 rounded-xl transition ${
              activeView === 'habits'
                ? 'bg-purple-600/25 text-purple-200 border border-purple-500/40 shadow-[0_0_10px_rgba(168,85,247,0.2)]'
                : 'text-purple-300/80 hover:text-white hover:bg-purple-500/10'
            }`}
          >
            <Sparkles size={17} className="text-purple-400" />
          </button>

          {streak > 0 && (
            <div
              title={`Ударный режим: ${streak} дн.`}
              className="flex flex-col items-center justify-center p-1.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400"
            >
              <Flame size={14} className="fill-amber-400" />
              <span className="text-[9px] font-mono font-bold mt-0.5">{streak}</span>
            </div>
          )}
        </div>

        <div className="p-3 border-t border-black/[0.06] dark:border-white/[0.08] flex flex-col items-center gap-2">
          {user ? (
            <button
              onClick={onLogout}
              title={`Выйти: ${user.displayName || user.email}`}
              className="relative p-1 rounded-lg text-slate-400 hover:text-red-400 hover:bg-white/5 transition group"
            >
              {user.photoURL ? (
                <img src={user.photoURL} alt="" className="w-6 h-6 rounded-full object-cover" />
              ) : (
                <div className="w-6 h-6 rounded-full bg-indigo-600 text-[10px] font-bold text-white flex items-center justify-center uppercase">
                  {(user.displayName || user.email || 'U')[0]}
                </div>
              )}
              <span
                className={`absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full border border-[#13151d] ${
                  syncStatus === 'synced'
                    ? 'bg-emerald-400'
                    : syncStatus === 'syncing'
                    ? 'bg-amber-400 animate-pulse'
                    : syncStatus === 'error'
                    ? 'bg-red-400'
                    : 'bg-slate-400'
                }`}
              />
            </button>
          ) : (
            <button
              onClick={onOpenAuth}
              title="Войти в облако для синхронизации"
              className="p-2 rounded-lg text-indigo-400 hover:text-indigo-300 hover:bg-indigo-500/10 transition"
            >
              <Cloud size={16} />
            </button>
          )}

          <button
            onClick={onOpenSettings}
            title="Настройки и темы"
            className="p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10 transition"
          >
            <Settings2 size={16} />
          </button>
          <button
            onClick={handleToggleSound}
            title={soundOn ? 'Выключить звук' : 'Включить звук'}
            className="p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10 transition"
          >
            {soundOn ? <Volume2 size={16} /> : <VolumeX size={16} />}
          </button>
        </div>
      </aside>
  );

  const desktopOpenAside = (
    <aside className="hidden md:flex w-64 h-screen sticky top-0 flex-col bg-[#13151d] z-20 border-r border-black/[0.06] dark:border-white/[0.08] select-none">
      {/* Header bar: exactly h-14 (56px) and border-b */}
      <div className="h-14 px-3.5 flex items-center justify-between border-b border-black/[0.06] dark:border-white/[0.08] bg-white dark:bg-[#13151d]">
        <div className="flex items-center gap-2.5 min-w-0">
          <VinoskaLogo size={32} />
          <div className="min-w-0 flex flex-col justify-center">
            <span className="font-bold text-xs tracking-wider text-white uppercase font-sans truncate">
              VINOSKA TASKS
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={handleToggleSound}
            title={soundOn ? 'Звук включен' : 'Звук выключен'}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition"
          >
            {soundOn ? <Volume2 size={15} /> : <VolumeX size={15} />}
          </button>
          <button
            onClick={onToggle}
            title="Свернуть меню ( [ )"
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition"
          >
            <PanelLeftClose size={15} />
          </button>
        </div>
      </div>

      {/* Navigation views */}
      <div className="flex-1 overflow-y-auto p-3 space-y-5">
        <div>
          <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 px-3 mb-1.5">
            Задачи
          </div>
          <nav className="space-y-0.5">
            <NavItem
              icon={<Inbox size={15} className="text-slate-400 group-hover:text-slate-200" />}
              label="Входящие"
              count={counts.inbox}
              active={activeView === 'inbox'}
              onClick={() => onSelectView('inbox')}
            />
            <NavItem
              icon={
                <div className="w-4 h-4 rounded-[4px] border border-amber-400/50 flex flex-col items-center justify-center overflow-hidden shrink-0 bg-amber-500/10">
                  <div className="w-full h-1 bg-amber-400/70" />
                  <span className="text-[8px] font-bold font-mono leading-none text-amber-300 mt-0.5">
                    {new Date().getDate()}
                  </span>
                </div>
              }
              label="Сегодня"
              count={counts.today}
              active={activeView === 'today'}
              onClick={() => onSelectView('today')}
              variant="today"
            />
            <NavItem
              icon={<Clock size={15} className="text-slate-400 group-hover:text-slate-200" />}
              label="Предстоящие"
              count={counts.upcoming}
              active={activeView === 'upcoming'}
              onClick={() => onSelectView('upcoming')}
            />
            <NavItem
              icon={<Layers size={15} className="text-slate-400 group-hover:text-slate-200" />}
              label="Все задачи"
              count={counts.all}
              active={activeView === 'all'}
              onClick={() => onSelectView('all')}
            />
            <NavItem
              icon={<CheckCircle2 size={15} className="text-slate-400 group-hover:text-emerald-400" />}
              label="Выполнено"
              count={counts.done}
              active={activeView === 'done'}
              onClick={() => onSelectView('done')}
            />
            <div className="mt-2 pt-2 border-t border-white/[0.06]">
              <NavItem
                icon={<Sparkles size={15} className="text-purple-400" />}
                label="Привычки"
                count={habitsRemainingToday}
                active={activeView === 'habits'}
                onClick={() => onSelectView('habits')}
                variant="habit"
              />
            </div>
          </nav>
        </div>

        {/* Projects */}
        <div>
          <div className="flex items-center justify-between px-3 mb-1.5">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
              Проекты
            </span>
            <button
              onClick={onNewProject}
              className="text-xs text-slate-400 hover:text-white transition hover:bg-white/10 px-1 rounded"
              title="Создать проект"
            >
              +
            </button>
          </div>
          <nav className="space-y-0.5">
            {projects.map((proj) => (
              <div
                key={proj.id}
                onClick={() => onSelectView(proj.id)}
                className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-xs transition group cursor-pointer ${
                  activeView === proj.id
                    ? 'bg-white/10 text-white font-medium'
                    : 'text-slate-300 hover:text-white hover:bg-white/5'
                }`}
              >
                <div className="flex items-center gap-2.5 truncate flex-1 min-w-0">
                  <span
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ backgroundColor: proj.color }}
                  />
                  <span className="truncate">{proj.name}</span>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onEditProject(proj);
                    }}
                    className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-white hover:bg-white/10 rounded transition"
                    title="Редактировать проект"
                  >
                    <Pencil size={11} />
                  </button>

                  {counts.projectCounts[proj.id] !== undefined && (
                    <span className="text-[11px] text-slate-400 font-mono">
                      {counts.projectCounts[proj.id]}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </nav>
        </div>

        {/* Modern Unified Weekly Rhythm & Activity Widget */}
        <SidebarActivityWidget
          activity={activity}
          habits={habits}
          todayProgress={todayProgress}
          onResetStreak={onResetProductivityStreak}
        />

        {/* Mini Month Calendar Widget on Leftmost Sidebar */}
        {onSelectDate && (
          <div className="pt-1">
            <MiniMonthCalendar
              tasks={tasks}
              onSelectDate={onSelectDate}
            />
          </div>
        )}
      </div>

      {/* Footer: Account & Quick Settings */}
      <div className="p-3 border-t border-black/[0.06] dark:border-white/[0.08] space-y-2">
        {user ? (
          <div className="flex items-center justify-between p-2 rounded-xl bg-white/[0.03] border border-white/5 hover:border-white/10 transition group">
            <div className="flex items-center gap-2.5 min-w-0">
              {user.photoURL ? (
                <img
                  src={user.photoURL}
                  alt={user.displayName || 'Avatar'}
                  className="w-7 h-7 rounded-full object-cover border border-white/10 shrink-0"
                />
              ) : (
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-xs font-bold text-white uppercase shadow-sm shrink-0">
                  {(user.displayName || user.email || 'U')[0]}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <div className="text-xs font-medium text-slate-200 truncate leading-tight">
                  {user.displayName || user.email?.split('@')[0]}
                </div>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      syncStatus === 'syncing'
                        ? 'bg-amber-400 animate-pulse'
                        : syncStatus === 'synced'
                        ? 'bg-emerald-400'
                        : syncStatus === 'error'
                        ? 'bg-red-400'
                        : 'bg-slate-400'
                    }`}
                  />
                  <span className="text-[10px] text-slate-400 truncate">
                    {syncStatus === 'syncing'
                      ? 'Синхронизация...'
                      : syncStatus === 'synced'
                      ? 'В облаке'
                      : syncStatus === 'error'
                      ? 'Ошибка'
                      : 'Офлайн'}
                  </span>
                </div>
              </div>
            </div>
            {onLogout && (
              <button
                onClick={onLogout}
                title="Выйти из аккаунта"
                className="p-1.5 text-slate-500 hover:text-red-400 rounded-lg hover:bg-white/5 opacity-70 group-hover:opacity-100 transition shrink-0"
              >
                <LogOut size={13} />
              </button>
            )}
          </div>
        ) : (
          <button
            onClick={onOpenAuth}
            className="w-full flex items-center justify-between px-2.5 py-2 rounded-xl bg-indigo-500/10 hover:bg-indigo-500/15 border border-indigo-500/20 text-indigo-300 hover:text-indigo-200 transition group text-xs font-medium"
          >
            <div className="flex items-center gap-2">
              <Cloud size={14} className="text-indigo-400 group-hover:scale-110 transition-transform" />
              <span>Войти в облако</span>
            </div>
            <span className="text-[10px] bg-indigo-500/20 px-1.5 py-0.5 rounded text-indigo-300">
              Синхр.
            </span>
          </button>
        )}

        <button
          onClick={onOpenSettings}
          className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition py-1.5 px-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 w-full"
        >
          <Settings2 size={14} />
          <span>Настройки</span>
        </button>
      </div>
    </aside>
  );

  const desktopAside = !isOpen ? desktopCollapsedAside : desktopOpenAside;

  const mobileDrawer = isMobileOpen ? (
    <div className="md:hidden fixed inset-0 z-50 flex">
      {/* Dark semi-transparent backdrop */}
      <div
        className="fixed inset-0 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={onCloseMobile}
      />

      {/* Slide-over Drawer Panel */}
      <aside className="relative z-50 w-72 max-w-[85vw] h-full flex flex-col bg-[#13151d] border-r border-white/10 shadow-2xl animate-in slide-in-from-left duration-200 select-none">
        {/* Header bar with Close Button */}
        <div className="h-14 px-4 flex items-center justify-between border-b border-white/[0.08] bg-[#13151d] shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <VinoskaLogo size={30} />
            <span className="font-bold text-xs tracking-wider text-white uppercase font-sans">
              VINOSKA TASKS
            </span>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={handleToggleSound}
              title={soundOn ? 'Звук включен' : 'Звук выключен'}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition"
            >
              {soundOn ? <Volume2 size={15} /> : <VolumeX size={15} />}
            </button>
            <button
              onClick={onCloseMobile}
              title="Закрыть меню"
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition"
            >
              <X size={17} />
            </button>
          </div>
        </div>

        {/* Scrollable Drawer Content */}
        <div className="flex-1 overflow-y-auto p-3 space-y-5">
          {/* Views */}
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 px-3 mb-1.5">
              Задачи
            </div>
            <nav className="space-y-0.5">
              <NavItem
                icon={<Inbox size={15} className="text-slate-400 group-hover:text-slate-200" />}
                label="Входящие"
                count={counts.inbox}
                active={activeView === 'inbox'}
                onClick={() => {
                  onSelectView('inbox');
                  onCloseMobile?.();
                }}
              />
              <NavItem
                icon={
                  <div className="w-4 h-4 rounded-[4px] border border-amber-400/50 flex flex-col items-center justify-center overflow-hidden shrink-0 bg-amber-500/10">
                    <div className="w-full h-1 bg-amber-400/70" />
                    <span className="text-[8px] font-bold font-mono leading-none text-amber-300 mt-0.5">
                      {new Date().getDate()}
                    </span>
                  </div>
                }
                label="Сегодня"
                count={counts.today}
                active={activeView === 'today'}
                onClick={() => {
                  onSelectView('today');
                  onCloseMobile?.();
                }}
                variant="today"
              />
              <NavItem
                icon={<Clock size={15} className="text-slate-400 group-hover:text-slate-200" />}
                label="Предстоящие"
                count={counts.upcoming}
                active={activeView === 'upcoming'}
                onClick={() => {
                  onSelectView('upcoming');
                  onCloseMobile?.();
                }}
              />
              <NavItem
                icon={<Layers size={15} className="text-slate-400 group-hover:text-slate-200" />}
                label="Все задачи"
                count={counts.all}
                active={activeView === 'all'}
                onClick={() => {
                  onSelectView('all');
                  onCloseMobile?.();
                }}
              />
              <NavItem
                icon={<CheckCircle2 size={15} className="text-slate-400 group-hover:text-emerald-400" />}
                label="Выполнено"
                count={counts.done}
                active={activeView === 'done'}
                onClick={() => {
                  onSelectView('done');
                  onCloseMobile?.();
                }}
              />
              <div className="mt-2 pt-2 border-t border-white/[0.06]">
                <NavItem
                  icon={<Sparkles size={15} className="text-purple-400" />}
                  label="Привычки"
                  count={habitsRemainingToday}
                  active={activeView === 'habits'}
                  onClick={() => {
                    onSelectView('habits');
                    onCloseMobile?.();
                  }}
                  variant="habit"
                />
              </div>
            </nav>
          </div>

          {/* Projects */}
          <div>
            <div className="flex items-center justify-between px-3 mb-1.5">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                Проекты
              </span>
              <button
                onClick={() => {
                  onNewProject();
                  onCloseMobile?.();
                }}
                className="text-xs text-slate-400 hover:text-white transition hover:bg-white/10 px-1 rounded"
                title="Создать проект"
              >
                +
              </button>
            </div>
            <nav className="space-y-0.5">
              {projects.map((proj) => (
                <div
                  key={proj.id}
                  onClick={() => {
                    onSelectView(proj.id);
                    onCloseMobile?.();
                  }}
                  className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-xs transition group cursor-pointer ${
                    activeView === proj.id
                      ? 'bg-white/10 text-white font-medium'
                      : 'text-slate-300 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate flex-1 min-w-0">
                    <span
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{ backgroundColor: proj.color }}
                    />
                    <span className="truncate">{proj.name}</span>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onEditProject(proj);
                        onCloseMobile?.();
                      }}
                      className="p-1 text-slate-400 hover:text-white hover:bg-white/10 rounded transition"
                      title="Редактировать проект"
                    >
                      <Pencil size={11} />
                    </button>

                    {counts.projectCounts[proj.id] !== undefined && (
                      <span className="text-[11px] text-slate-400 font-mono">
                        {counts.projectCounts[proj.id]}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </nav>
          </div>

          {/* Activity Widget */}
          <SidebarActivityWidget
            activity={activity}
            habits={habits}
            todayProgress={todayProgress}
            onResetStreak={onResetProductivityStreak}
          />

          {/* Mini Month Calendar */}
          {onSelectDate && (
            <div className="pt-1">
              <MiniMonthCalendar
                tasks={tasks}
                onSelectDate={(d) => {
                  onSelectDate(d);
                  onCloseMobile?.();
                }}
              />
            </div>
          )}
        </div>

        {/* Footer: User Account & Settings */}
        <div className="p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] border-t border-black/[0.06] dark:border-white/[0.08] space-y-2">
          {user ? (
            <div className="flex items-center justify-between p-2 rounded-xl bg-white/[0.03] border border-white/5 hover:border-white/10 transition group">
              <div className="flex items-center gap-2.5 min-w-0">
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.displayName || 'Avatar'}
                    className="w-7 h-7 rounded-full object-cover border border-white/10 shrink-0"
                  />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-xs font-bold text-white uppercase shadow-sm shrink-0">
                    {(user.displayName || user.email || 'U')[0]}
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-medium text-slate-200 truncate leading-tight">
                    {user.displayName || user.email?.split('@')[0]}
                  </div>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        syncStatus === 'syncing'
                          ? 'bg-amber-400 animate-pulse'
                          : syncStatus === 'synced'
                          ? 'bg-emerald-400'
                          : syncStatus === 'error'
                          ? 'bg-red-400'
                          : 'bg-slate-400'
                      }`}
                    />
                    <span className="text-[10px] text-slate-400 truncate">
                      {syncStatus === 'syncing'
                        ? 'Синхронизация...'
                        : syncStatus === 'synced'
                        ? 'В облаке'
                        : syncStatus === 'error'
                        ? 'Ошибка'
                        : 'Офлайн'}
                    </span>
                  </div>
                </div>
              </div>
              {onLogout && (
                <button
                  onClick={() => {
                    onLogout();
                    onCloseMobile?.();
                  }}
                  title="Выйти из аккаунта"
                  className="p-1.5 text-slate-500 hover:text-red-400 rounded-lg hover:bg-white/5 transition shrink-0"
                >
                  <LogOut size={13} />
                </button>
              )}
            </div>
          ) : (
            <button
              onClick={() => {
                onOpenAuth?.();
                onCloseMobile?.();
              }}
              className="w-full flex items-center justify-between px-2.5 py-2 rounded-xl bg-indigo-500/10 hover:bg-indigo-500/15 border border-indigo-500/20 text-indigo-300 hover:text-indigo-200 transition group text-xs font-medium"
            >
              <div className="flex items-center gap-2">
                <Cloud size={14} className="text-indigo-400 group-hover:scale-110 transition-transform" />
                <span>Войти в облако</span>
              </div>
              <span className="text-[10px] bg-indigo-500/20 px-1.5 py-0.5 rounded text-indigo-300">
                Синхр.
              </span>
            </button>
          )}

          <button
            onClick={() => {
              onOpenSettings();
              onCloseMobile?.();
            }}
            className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition py-1.5 px-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 w-full"
          >
            <Settings2 size={14} />
            <span>Настройки</span>
          </button>
        </div>
      </aside>
    </div>
  ) : null;

  return (
    <>
      {desktopAside}
      {mobileDrawer}
    </>
  );
};

interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  count?: number;
  active: boolean;
  onClick: () => void;
  variant?: 'default' | 'today' | 'habit';
}

const NavItem: React.FC<NavItemProps> = ({ 
  icon, 
  label, 
  count, 
  active, 
  onClick, 
  variant = 'default' 
}) => {
  let btnClasses = 'w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-xs transition group cursor-pointer ';
  
  if (variant === 'today') {
    btnClasses += active
      ? 'bg-white/10 text-white font-medium border border-amber-500/30'
      : 'text-slate-200 hover:text-white hover:bg-white/5';
  } else if (variant === 'habit') {
    btnClasses += active
      ? 'bg-purple-600/20 text-white font-medium border border-purple-500/30 shadow-[0_0_10px_rgba(168,85,247,0.15)]'
      : 'text-slate-300 hover:text-white hover:bg-purple-500/10';
  } else {
    btnClasses += active
      ? 'bg-white/10 text-white font-medium'
      : 'text-slate-300 hover:text-white hover:bg-white/5';
  }

  return (
    <button onClick={onClick} className={btnClasses}>
      <div className="flex items-center gap-2.5 min-w-0">
        <span className="shrink-0 flex items-center justify-center">{icon}</span>
        <span className="truncate">
          {label}
        </span>
      </div>
      {count !== undefined && count > 0 && (
        <span
          className={`text-[10px] font-mono px-1.5 py-0.5 rounded-full shrink-0 ${
            variant === 'today'
              ? 'bg-amber-500/15 text-amber-300/90 font-mono'
              : variant === 'habit'
              ? 'bg-purple-500/20 text-purple-300 font-medium border border-purple-500/25'
              : 'text-slate-400 bg-white/[0.04]'
          }`}
        >
          {count}
        </span>
      )}
    </button>
  );
};
