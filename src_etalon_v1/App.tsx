import React from 'react';
import { 
  Plus, 
  Search, 
  CheckCheck, 
  Trash2,
  CheckSquare,
  X,
  Settings2
} from 'lucide-react';
import type { Task, Project, ViewFilter, ActivityDay, CustomPriority, CustomStatus, ThemeId } from './types';
import { TaskStorage, DEFAULT_PRIORITIES, DEFAULT_STATUSES } from './api/client';
import { Sidebar } from './components/Sidebar';
import { FocusCard } from './components/FocusCard';
import { TaskRow } from './components/TaskRow';
import { TaskDetailSheet } from './components/TaskDetailSheet';
import { CommandPalette } from './components/CommandPalette';
import { ManagePropertiesModal } from './components/ManagePropertiesModal';
import { SettingsModal } from './components/SettingsModal';
import { ProjectModal } from './components/ProjectModal';
import { toggleSound, isSoundEnabled } from './utils/sound';

export function App() {
  const [tasks, setTasks] = React.useState<Task[]>([]);
  const [projects, setProjects] = React.useState<Project[]>([]);
  const [activity, setActivity] = React.useState<ActivityDay[]>([]);
  const [priorities, setPriorities] = React.useState<CustomPriority[]>(DEFAULT_PRIORITIES);
  const [statuses, setStatuses] = React.useState<CustomStatus[]>(DEFAULT_STATUSES);

  const [currentTheme, setCurrentTheme] = React.useState<ThemeId>(() => TaskStorage.getTheme());
  const [colorCardsByProject, setColorCardsByProject] = React.useState<boolean>(() => TaskStorage.getColorCardsByProject());
  const [soundOn, setSoundOn] = React.useState(isSoundEnabled());

  const [activeView, setActiveView] = React.useState<ViewFilter>('today');
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(true);
  const [selectedTask, setSelectedTask] = React.useState<Task | null>(null);
  const [isDetailOpen, setIsDetailOpen] = React.useState(false);
  const [isCommandOpen, setIsCommandOpen] = React.useState(false);
  const [isManagePropsOpen, setIsManagePropsOpen] = React.useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = React.useState(false);
  const [isProjectModalOpen, setIsProjectModalOpen] = React.useState(false);
  const [editingProject, setEditingProject] = React.useState<Project | null>(null);
  const [quickTitle, setQuickTitle] = React.useState('');

  // Batch selection state
  const [selectedTaskIds, setSelectedTaskIds] = React.useState<string[]>([]);
  const [isBatchMode, setIsBatchMode] = React.useState(false);

  const quickInputRef = React.useRef<HTMLInputElement>(null);

  // Initialize data on mount
  React.useEffect(() => {
    const rawTasks = TaskStorage.getTasks();
    let foundFocus = false;
    const cleanedTasks = rawTasks.map((t) => {
      if (t.is_focus) {
        if (!foundFocus && t.status !== 'done') {
          foundFocus = true;
          return t;
        }
        return { ...t, is_focus: false };
      }
      return t;
    });

    setTasks(cleanedTasks);
    setProjects(TaskStorage.getProjects());
    setActivity(TaskStorage.getActivity());
    setPriorities(TaskStorage.getPriorities());
    setStatuses(TaskStorage.getStatuses());

    // Apply saved theme to root document
    const savedTheme = TaskStorage.getTheme();
    TaskStorage.saveTheme(savedTheme);
  }, []);

  // Save tasks to local storage whenever tasks change
  const updateTasksState = (newTasks: Task[]) => {
    setTasks(newTasks);
    TaskStorage.saveTasks(newTasks);
  };

  const handleUpdatePriorities = (newPrios: CustomPriority[]) => {
    setPriorities(newPrios);
    TaskStorage.savePriorities(newPrios);
  };

  const handleUpdateStatuses = (newStatuses: CustomStatus[]) => {
    setStatuses(newStatuses);
    TaskStorage.saveStatuses(newStatuses);
  };

  // Projects CRUD
  const handleNewProject = () => {
    setEditingProject(null);
    setIsProjectModalOpen(true);
  };

  const handleEditProject = (proj: Project) => {
    setEditingProject(proj);
    setIsProjectModalOpen(true);
  };

  const handleSaveProject = (savedProj: Project) => {
    const existingIndex = projects.findIndex((p) => p.id === savedProj.id);
    let nextProjects: Project[];
    if (existingIndex >= 0) {
      nextProjects = projects.map((p) => (p.id === savedProj.id ? savedProj : p));
    } else {
      nextProjects = [...projects, savedProj];
    }
    setProjects(nextProjects);
    TaskStorage.saveProjects(nextProjects);
  };

  const handleDeleteProject = (projectId: string) => {
    const nextProjects = projects.filter((p) => p.id !== projectId);
    setProjects(nextProjects);
    TaskStorage.saveProjects(nextProjects);
    // Unassign tasks from this project
    const nextTasks = tasks.map((t) => (t.project_id === projectId ? { ...t, project_id: null } : t));
    updateTasksState(nextTasks);
    if (activeView === projectId) {
      setActiveView('inbox');
    }
  };

  // Theme & card color handlers
  const handleSelectTheme = (theme: ThemeId) => {
    setCurrentTheme(theme);
    TaskStorage.saveTheme(theme);
  };

  const handleToggleColorCards = (val: boolean) => {
    setColorCardsByProject(val);
    TaskStorage.saveColorCardsByProject(val);
  };

  // Keyboard shortcuts
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)) {
        return;
      }

      if (e.key === '[') {
        e.preventDefault();
        setIsSidebarOpen((prev) => !prev);
      } else if (e.key.toLowerCase() === 'c') {
        e.preventDefault();
        quickInputRef.current?.focus();
      } else if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCommandOpen(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Quick task creation
  const handleQuickAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickTitle.trim()) return;

    const now = Math.floor(Date.now() / 1000);
    const todayMidnight = new Date();
    todayMidnight.setHours(23, 59, 59, 0);
    const due_date = activeView === 'today' ? Math.floor(todayMidnight.getTime() / 1000) : null;

    let project_id: string | null = null;
    if (projects.some((p) => p.id === activeView)) {
      project_id = activeView;
    }

    const newTask: Task = {
      id: `task_${Date.now()}`,
      title: quickTitle.trim(),
      description: '',
      status: activeView === 'inbox' ? 'inbox' : 'todo',
      priority: 'none',
      project_id,
      due_date,
      is_focus: false,
      completed_at: null,
      created_at: now,
      updated_at: now,
      subtasks: [],
      tags: [],
    };

    const nextTasks = [newTask, ...tasks];
    updateTasksState(nextTasks);
    setQuickTitle('');
  };

  // Toggle complete: NO CLONING! Completed tasks move to Done tab
  const handleToggleComplete = (task: Task) => {
    const now = Math.floor(Date.now() / 1000);
    const isNowDone = task.status !== 'done';
    const nextStatus = isNowDone ? 'done' : 'todo';

    if (isNowDone) {
      TaskStorage.recordActivityToday();
      setActivity(TaskStorage.getActivity());
    }

    const nextTasks: Task[] = tasks.map((t) => {
      if (t.id === task.id) {
        return {
          ...t,
          status: nextStatus,
          is_focus: isNowDone ? false : t.is_focus,
          completed_at: isNowDone ? now : null,
          updated_at: now,
        };
      }
      return t;
    });

    updateTasksState(nextTasks);

    if (selectedTask?.id === task.id) {
      setSelectedTask((prev) => prev ? { ...prev, status: nextStatus, is_focus: isNowDone ? false : prev.is_focus } : null);
    }
  };

  // Toggle focus (One Big Thing): only 1 task can be focus!
  const handleToggleFocus = (task: Task) => {
    const nextIsFocus = !task.is_focus;
    const nextTasks = tasks.map((t) => {
      if (t.id === task.id) {
        return { ...t, is_focus: nextIsFocus };
      }
      if (nextIsFocus) {
        return { ...t, is_focus: false };
      }
      return t;
    });
    updateTasksState(nextTasks);
  };

  // Explicitly remove from focus
  const handleRemoveFocus = (task: Task) => {
    const nextTasks = tasks.map((t) => {
      if (t.id === task.id || t.is_focus) {
        return { ...t, is_focus: false };
      }
      return t;
    });
    updateTasksState(nextTasks);
  };

  // Detail Sheet Actions
  const handleOpenDetail = (task: Task) => {
    setSelectedTask(task);
    setIsDetailOpen(true);
  };

  const handleUpdateTask = (updatedTask: Task) => {
    setSelectedTask(updatedTask);
    const nextTasks = tasks.map((t) => (t.id === updatedTask.id ? updatedTask : t));
    updateTasksState(nextTasks);
  };

  const handleDeleteTask = (taskId: string) => {
    const nextTasks = tasks.filter((t) => t.id !== taskId);
    updateTasksState(nextTasks);
    if (selectedTask?.id === taskId) {
      setIsDetailOpen(false);
      setSelectedTask(null);
    }
  };

  // Batch selection handlers
  const handleToggleBatchCheck = (taskId: string) => {
    setSelectedTaskIds((prev) =>
      prev.includes(taskId) ? prev.filter((id) => id !== taskId) : [...prev, taskId]
    );
  };

  const handleDeleteSelectedTasks = () => {
    if (selectedTaskIds.length === 0) return;
    if (confirm(`Удалить выбранные задачи (${selectedTaskIds.length} шт.)?`)) {
      const nextTasks = tasks.filter((t) => !selectedTaskIds.includes(t.id));
      updateTasksState(nextTasks);
      setSelectedTaskIds([]);
      setIsBatchMode(false);
      if (selectedTask && selectedTaskIds.includes(selectedTask.id)) {
        setIsDetailOpen(false);
        setSelectedTask(null);
      }
    }
  };

  const handleClearCurrentView = () => {
    const viewTasks = filteredTasks;
    if (viewTasks.length === 0) return;
    if (confirm(`Удалить все задачи в разделе "${viewTitle}" (${viewTasks.length} шт.)?`)) {
      const idsToDelete = new Set(viewTasks.map((t) => t.id));
      const nextTasks = tasks.filter((t) => !idsToDelete.has(t.id));
      updateTasksState(nextTasks);
      setSelectedTaskIds([]);
      setIsDetailOpen(false);
      setSelectedTask(null);
    }
  };

  // Filter tasks based on active view:
  // Completed tasks ONLY appear in 'done' tab!
  const filteredTasks = React.useMemo(() => {
    const todayMidnight = new Date();
    todayMidnight.setHours(23, 59, 59, 999);
    const todaySec = Math.floor(todayMidnight.getTime() / 1000);

    return tasks.filter((t) => {
      // Done tab: ONLY completed tasks
      if (activeView === 'done') {
        return t.status === 'done';
      }

      // All other views: ONLY ACTIVE tasks (not done, not cancelled)
      if (t.status === 'done' || t.status === 'cancelled') {
        return false;
      }

      if (activeView === 'inbox') {
        return t.status === 'inbox';
      }
      if (activeView === 'today') {
        return t.due_date && t.due_date <= todaySec;
      }
      if (activeView === 'upcoming') {
        return t.due_date && t.due_date > todaySec;
      }
      if (activeView === 'all') {
        return true;
      }
      return t.project_id === activeView;
    });
  }, [tasks, activeView]);

  // Counts for sidebar badges
  const counts = React.useMemo(() => {
    const todayMidnight = new Date();
    todayMidnight.setHours(23, 59, 59, 999);
    const todaySec = Math.floor(todayMidnight.getTime() / 1000);

    const projectCounts: Record<string, number> = {};
    projects.forEach((p) => {
      projectCounts[p.id] = tasks.filter((t) => t.project_id === p.id && t.status !== 'done').length;
    });

    return {
      inbox: tasks.filter((t) => t.status === 'inbox').length,
      today: tasks.filter((t) => t.status !== 'done' && t.due_date && t.due_date <= todaySec).length,
      upcoming: tasks.filter((t) => t.status !== 'done' && t.due_date && t.due_date > todaySec).length,
      all: tasks.filter((t) => t.status !== 'done').length,
      done: tasks.filter((t) => t.status === 'done').length,
      projectCounts,
    };
  }, [tasks, projects]);

  // Today Progress calculation
  const todayProgress = React.useMemo(() => {
    const todayMidnight = new Date();
    todayMidnight.setHours(23, 59, 59, 999);
    const todaySec = Math.floor(todayMidnight.getTime() / 1000);

    const todayTasks = tasks.filter((t) => {
      const isDueToday = t.due_date && t.due_date <= todaySec;
      const isCompletedToday = t.completed_at && t.completed_at >= todaySec - 3600 * 24;
      return isDueToday || isCompletedToday;
    });

    const completed = todayTasks.filter((t) => t.status === 'done').length;
    return { completed, total: todayTasks.length };
  }, [tasks]);

  // One Big Thing task for current view
  const focusTask = React.useMemo(() => {
    return tasks.find((t) => t.is_focus && t.status !== 'done');
  }, [tasks]);

  const viewTitle = React.useMemo(() => {
    if (activeView === 'inbox') return 'Входящие';
    if (activeView === 'today') return 'Сегодня';
    if (activeView === 'upcoming') return 'Предстоящие';
    if (activeView === 'done') return 'Выполненные дела';
    if (activeView === 'all') return 'Все задачи';
    const proj = projects.find((p) => p.id === activeView);
    return proj ? proj.name : 'Задачи';
  }, [activeView, projects]);

  return (
    /* True 3-column split view: Sidebar | Main Content | Detail Panel */
    <div className="flex h-screen w-screen overflow-hidden bg-[#000000] text-slate-100 selection:bg-white/20 selection:text-white">
      {/* Column 1: Sidebar with seamless h-14 header */}
      <Sidebar
        isOpen={isSidebarOpen}
        onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
        activeView={activeView}
        onSelectView={(v) => {
          setActiveView(v);
          setSelectedTaskIds([]);
        }}
        projects={projects}
        counts={counts}
        todayProgress={todayProgress}
        activity={activity}
        onNewProject={handleNewProject}
        onEditProject={handleEditProject}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      {/* Column 2: Main Area */}
      <div className="flex-1 flex flex-col h-full min-w-0 overflow-hidden bg-[#0b0b0d]">
        {/* Seamless Unified Header: exact h-14 shrink-0 and border-b border-white/[0.08] */}
        <header className="h-14 shrink-0 px-6 border-b border-white/[0.08] bg-[#121214] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-sm font-semibold text-white tracking-tight">{viewTitle}</h1>
            <span className="text-xs font-mono text-slate-400 bg-white/[0.06] px-2 py-0.5 rounded-full">
              {filteredTasks.length}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Clear all tasks in current view button */}
            {filteredTasks.length > 0 && (
              <button
                onClick={handleClearCurrentView}
                title="Очистить все задачи в этом разделе"
                className="flex items-center gap-1 text-xs text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 px-2.5 py-1.5 rounded-full transition"
              >
                <Trash2 size={13} />
                <span className="hidden sm:inline">Очистить список</span>
              </button>
            )}

            {/* Batch Select Toggle */}
            <button
              onClick={() => {
                setIsBatchMode(!isBatchMode);
                if (isBatchMode) setSelectedTaskIds([]);
              }}
              title="Выбор нескольких задач для удаления"
              className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border transition ${
                isBatchMode
                  ? 'bg-indigo-600/20 text-indigo-300 border-indigo-500/40'
                  : 'text-slate-400 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] border-white/[0.06]'
              }`}
            >
              <CheckSquare size={13} />
              <span className="hidden sm:inline">
                {isBatchMode ? 'Отменить выбор' : 'Выбрать'}
              </span>
            </button>

            {/* Settings button */}
            <button
              onClick={() => setIsSettingsOpen(true)}
              title="Настройки и темы оформления"
              className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] px-3 py-1.5 rounded-full border border-white/[0.06] transition"
            >
              <Settings2 size={13} />
              <span className="hidden sm:inline">Настройки</span>
            </button>

            {/* Command Palette button */}
            <button
              onClick={() => setIsCommandOpen(true)}
              className="flex items-center gap-2 text-xs text-slate-400 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] px-3 py-1.5 rounded-full border border-white/[0.06] transition"
            >
              <Search size={13} />
              <span className="hidden sm:inline">Поиск...</span>
              <kbd className="text-[10px] font-mono bg-white/[0.08] text-slate-300 px-1 rounded">
                ⌘K
              </kbd>
            </button>
          </div>
        </header>

        {/* Main Scrollable Tasks Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          <div className="max-w-4xl w-full mx-auto space-y-4">
            {/* Quick Add Bar */}
            <form onSubmit={handleQuickAdd} className="relative group">
              <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-slate-500 group-focus-within:text-white transition">
                <Plus size={16} />
              </div>
              <input
                ref={quickInputRef}
                type="text"
                value={quickTitle}
                onChange={(e) => setQuickTitle(e.target.value)}
                placeholder="Что нужно сделать? Напиши и нажми Enter... (Клавиша C)"
                className="w-full pl-10 pr-20 py-2.5 rounded-2xl bg-[#1c1c1e] border border-white/[0.08] text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-white/30 shadow-sm transition"
              />
              <div className="absolute inset-y-0 right-3.5 flex items-center">
                <kbd className="text-[10px] font-mono text-slate-500 bg-white/[0.04] px-1.5 py-0.5 rounded-full">
                  Enter ↵
                </kbd>
              </div>
            </form>

            {/* One Big Thing Focus Card */}
            {focusTask && activeView !== 'done' && (
              <div className="space-y-2">
                <FocusCard
                  task={focusTask}
                  project={projects.find((p) => p.id === focusTask.project_id)}
                  colorCardsByProject={colorCardsByProject}
                  onToggleComplete={handleToggleComplete}
                  onOpenDetail={handleOpenDetail}
                  onRemoveFocus={handleRemoveFocus}
                />
              </div>
            )}

            {/* Tasks List */}
            <div className="space-y-1.5">
              {filteredTasks.length === 0 ? (
                <div className="p-10 text-center rounded-2xl bg-[#1c1c1e] border border-white/[0.05] space-y-2">
                  <div className="w-9 h-9 rounded-full bg-zinc-800 text-zinc-300 mx-auto flex items-center justify-center">
                    <CheckCheck size={18} />
                  </div>
                  <h3 className="text-xs font-medium text-white">Все задачи закрыты</h3>
                  <p className="text-[11px] text-slate-500 max-w-sm mx-auto">
                    В этом разделе нет задач. Нажми <kbd className="bg-white/10 px-1 rounded font-mono">C</kbd> или начни писать в строке выше.
                  </p>
                </div>
              ) : (
                filteredTasks.map((t) => (
                  <TaskRow
                    key={t.id}
                    task={t}
                    project={projects.find((p) => p.id === t.project_id)}
                    priorities={priorities}
                    colorCardsByProject={colorCardsByProject}
                    isSelected={selectedTask?.id === t.id}
                    isBatchChecked={selectedTaskIds.includes(t.id)}
                    onToggleBatchCheck={isBatchMode ? handleToggleBatchCheck : undefined}
                    onToggleComplete={handleToggleComplete}
                    onToggleFocus={handleToggleFocus}
                    onOpenDetail={handleOpenDetail}
                    onUpdateTask={handleUpdateTask}
                  />
                ))
              )}
            </div>
          </div>
        </div>

        {/* Floating Batch Actions Bar (when tasks are selected) */}
        {selectedTaskIds.length > 0 && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-[#1c1c1e] border border-white/10 shadow-2xl rounded-full px-4 py-2 flex items-center gap-4 animate-in fade-in slide-in-from-bottom-2 duration-150">
            <span className="text-xs font-medium text-slate-200">
              Выбрано: <strong className="text-white">{selectedTaskIds.length}</strong>
            </span>

            <div className="h-4 w-px bg-white/10" />

            <button
              onClick={handleDeleteSelectedTasks}
              className="flex items-center gap-1.5 text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 px-3 py-1 rounded-full transition"
            >
              <Trash2 size={13} />
              <span>Удалить выбранные</span>
            </button>

            <button
              onClick={() => setSelectedTaskIds([])}
              className="text-slate-400 hover:text-white p-1 rounded-full transition"
              title="Снять выбор"
            >
              <X size={14} />
            </button>
          </div>
        )}
      </div>

      {/* Column 3: Task Details Inline Flex Sibling with seamless h-14 header */}
      {isDetailOpen && (
        <TaskDetailSheet
          task={selectedTask}
          projects={projects}
          priorities={priorities}
          statuses={statuses}
          isOpen={isDetailOpen}
          onClose={() => setIsDetailOpen(false)}
          onUpdateTask={handleUpdateTask}
          onDeleteTask={handleDeleteTask}
          onPomodoroComplete={() => {
            TaskStorage.recordActivityToday();
            setActivity(TaskStorage.getActivity());
          }}
        />
      )}

      {/* Global Command Palette (Cmd+K) */}
      <CommandPalette
        isOpen={isCommandOpen}
        onClose={() => setIsCommandOpen(false)}
        tasks={tasks}
        onSelectTask={(t) => handleOpenDetail(t)}
        onSelectView={(v) => setActiveView(v)}
        onQuickAdd={() => quickInputRef.current?.focus()}
        onToggleSound={() => {
          toggleSound();
          setSoundOn(!soundOn);
        }}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onSelectTheme={handleSelectTheme}
      />

      {/* Settings & Themes Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        currentTheme={currentTheme}
        onSelectTheme={handleSelectTheme}
        colorCardsByProject={colorCardsByProject}
        onToggleColorCardsByProject={handleToggleColorCards}
        onOpenManageProperties={() => setIsManagePropsOpen(true)}
        soundOn={soundOn}
        onToggleSound={() => {
          toggleSound();
          setSoundOn(!soundOn);
        }}
      />

      {/* Project Create & Edit Modal */}
      <ProjectModal
        isOpen={isProjectModalOpen}
        onClose={() => {
          setIsProjectModalOpen(false);
          setEditingProject(null);
        }}
        project={editingProject}
        onSave={handleSaveProject}
        onDelete={handleDeleteProject}
      />

      {/* Manage Properties Modal */}
      <ManagePropertiesModal
        isOpen={isManagePropsOpen}
        onClose={() => setIsManagePropsOpen(false)}
        priorities={priorities}
        statuses={statuses}
        onUpdatePriorities={handleUpdatePriorities}
        onUpdateStatuses={handleUpdateStatuses}
      />
    </div>
  );
}

export default App;
