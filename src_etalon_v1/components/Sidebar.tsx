import React from 'react';
import { 
  Inbox, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  Sparkles, 
  Volume2, 
  VolumeX, 
  PanelLeftClose, 
  PanelLeft,
  Flame,
  Pencil,
  Settings2
} from 'lucide-react';
import type { Project, ViewFilter, ActivityDay } from '../types';
import { toggleSound, isSoundEnabled } from '../utils/sound';

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
  onNewProject: () => void;
  onEditProject: (project: Project) => void;
  onOpenSettings: () => void;
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
  onNewProject,
  onEditProject,
  onOpenSettings,
}) => {
  const [soundOn, setSoundOn] = React.useState(isSoundEnabled());

  const handleToggleSound = () => {
    const next = toggleSound();
    setSoundOn(next);
  };

  const streak = React.useMemo(() => {
    let count = 0;
    const sorted = [...activity].reverse();
    for (const day of sorted) {
      if (day.count > 0) count++;
      else break;
    }
    return count;
  }, [activity]);

  const progressPercent = todayProgress.total > 0 
    ? Math.round((todayProgress.completed / todayProgress.total) * 100) 
    : 0;

  if (!isOpen) {
    return (
      <aside className="w-16 h-screen sticky top-0 flex flex-col items-center bg-[#13151d] z-20 border-r border-white/[0.08] select-none">
        {/* Collapsed header matching h-14 */}
        <div className="h-14 w-full flex items-center justify-center border-b border-white/[0.08]">
          <button
            onClick={onToggle}
            title="Развернуть меню ( [ )"
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition"
          >
            <PanelLeft size={18} />
          </button>
        </div>

        <div className="flex-1 flex flex-col items-center gap-3 mt-4">
          <button
            onClick={() => onSelectView('inbox')}
            title={`Входящие (${counts.inbox})`}
            className={`p-2.5 rounded-xl transition ${activeView === 'inbox' ? 'bg-white/10 text-white' : 'text-slate-400 hover:text-white'}`}
          >
            <Inbox size={18} />
          </button>
          <button
            onClick={() => onSelectView('today')}
            title={`Сегодня (${counts.today})`}
            className={`p-2.5 rounded-xl transition ${activeView === 'today' ? 'bg-white/10 text-white' : 'text-slate-400 hover:text-white'}`}
          >
            <Calendar size={18} />
          </button>
        </div>

        <div className="p-3 border-t border-white/[0.08] flex flex-col items-center gap-2">
          <button
            onClick={onOpenSettings}
            title="Настройки и темы"
            className="p-2 rounded-lg text-slate-400 hover:text-white transition"
          >
            <Settings2 size={16} />
          </button>
          <button
            onClick={handleToggleSound}
            title={soundOn ? 'Выключить звук' : 'Включить звук'}
            className="p-2 rounded-lg text-slate-400 hover:text-white transition"
          >
            {soundOn ? <Volume2 size={16} /> : <VolumeX size={16} />}
          </button>
        </div>
      </aside>
    );
  }

  return (
    <aside className="w-64 h-screen sticky top-0 flex flex-col bg-[#13151d] z-20 border-r border-white/[0.08] select-none">
      {/* Header bar: exactly h-14 (56px) and border-b border-white/[0.08] */}
      <div className="h-14 px-4 flex items-center justify-between border-b border-white/[0.08] bg-[#13151d]">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-zinc-800 border border-white/10 flex items-center justify-center">
            <Sparkles size={14} className="text-zinc-300" />
          </div>
          <div>
            <span className="font-semibold text-xs tracking-tight text-white block">Linear Lite</span>
            <span className="text-[9px] text-zinc-400 font-mono tracking-wider">CLOUDFLARE D1</span>
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
              icon={<Inbox size={15} />}
              label="Входящие"
              count={counts.inbox}
              active={activeView === 'inbox'}
              onClick={() => onSelectView('inbox')}
            />
            <NavItem
              icon={<Calendar size={15} className="text-zinc-300" />}
              label="Сегодня"
              count={counts.today}
              active={activeView === 'today'}
              onClick={() => onSelectView('today')}
            />
            <NavItem
              icon={<Clock size={15} className="text-zinc-400" />}
              label="Предстоящие"
              count={counts.upcoming}
              active={activeView === 'upcoming'}
              onClick={() => onSelectView('upcoming')}
            />
            <NavItem
              icon={<CheckCircle2 size={15} className="text-emerald-400" />}
              label="Выполненные"
              count={counts.done}
              active={activeView === 'done'}
              onClick={() => onSelectView('done')}
            />
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

        {/* Settings & Themes Button */}
        <div>
          <button
            onClick={onOpenSettings}
            className="w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs text-slate-400 hover:text-white hover:bg-white/5 transition"
          >
            <Settings2 size={14} />
            <span>Настройки и темы</span>
          </button>
        </div>

        {/* Activity & Streaks */}
        <div className="p-3 rounded-xl bg-[#171923] border border-white/[0.05] space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs text-slate-300 font-medium">
              <Flame size={13} className="text-zinc-400 fill-zinc-400" />
              <span>Стрик активности</span>
            </div>
            <span className="text-xs font-mono text-zinc-300 font-semibold">{streak} дн.</span>
          </div>

          {/* Mini grid */}
          <div className="grid grid-flow-col grid-rows-4 gap-1 pt-1">
            {activity.slice(-28).map((day, idx) => {
              let bg = 'bg-white/[0.04]';
              if (day.count === 1) bg = 'bg-emerald-800/50 border border-emerald-600/30';
              if (day.count === 2) bg = 'bg-emerald-600/60';
              if (day.count >= 3) bg = 'bg-emerald-500/90';

              return (
                <div
                  key={idx}
                  title={`${day.date}: ${day.count} задач(и)`}
                  className={`w-3 h-3 rounded-sm ${bg} transition-colors hover:scale-110 cursor-pointer`}
                />
              );
            })}
          </div>
        </div>
      </div>

      {/* Footer / Today Progress */}
      <div className="p-3.5 border-t border-white/[0.08] bg-[#11131a]">
        <div className="flex items-center justify-between text-xs text-slate-300 mb-1.5">
          <span>Сегодня закрыто</span>
          <span className="font-mono text-zinc-300 font-medium">
            {todayProgress.completed} из {todayProgress.total}
          </span>
        </div>
        <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
          <div
            className="h-full bg-zinc-300 transition-all duration-300 rounded-full"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>
    </aside>
  );
};

interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  count?: number;
  active: boolean;
  onClick: () => void;
}

const NavItem: React.FC<NavItemProps> = ({ icon, label, count, active, onClick }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-xs transition ${
      active
        ? 'bg-white/10 text-white font-medium'
        : 'text-slate-300 hover:text-white hover:bg-white/5'
    }`}
  >
    <div className="flex items-center gap-2.5">
      <span className="shrink-0">{icon}</span>
      <span>{label}</span>
    </div>
    {count !== undefined && count > 0 && (
      <span className="text-[11px] text-slate-400 font-mono px-1.5 py-0.5 rounded bg-white/[0.04]">
        {count}
      </span>
    )}
  </button>
);
