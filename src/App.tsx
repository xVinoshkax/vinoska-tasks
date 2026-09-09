import React from 'react';
import { 
  Plus, 
  Search, 
  CheckCheck, 
  Trash2,
  CheckSquare,
  X
} from 'lucide-react';
import type { Task, Project, ViewFilter, ActivityDay, CustomPriority, Habit, HabitStatus, TaskFilters } from './types';
import { TaskStorage, HabitStorage, DEFAULT_PRIORITIES } from './api/client';
import { Sidebar } from './components/Sidebar';
import { FocusCard } from './components/FocusCard';
import { TaskRow } from './components/TaskRow';
import { TaskDetailSheet } from './components/TaskDetailSheet';
import { CommandPalette } from './components/CommandPalette';
import { ManagePropertiesModal } from './components/ManagePropertiesModal';
import { SettingsModal } from './components/SettingsModal';
import { ProjectModal } from './components/ProjectModal';
import { HabitsColumn } from './components/HabitsColumn';
import { HabitsFullView } from './components/HabitsFullView';
import { HabitModal } from './components/HabitModal';
import { NewTaskForDateModal } from './components/NewTaskForDateModal';
import { TaskFilterBar } from './components/TaskFilterBar';
import { toggleSound, isSoundEnabled } from './utils/sound';

const DEFAULT_TASK_FILTERS: TaskFilters = {
  priority: null,
  projectId: null,
  dueDate: 'all',
  status: 'all',
  onlyFocus: false,
  onlyWithLink: false,
  onlyWithSubtasks: false,
};

export function App() {
  const [tasks, setTasks] = React.useState<Task[]>([]);
  const [projects, setProjects] = React.useState<Project[]>([]);
  const [activity, setActivity] = React.useState<ActivityDay[]>([]);
  const [priorities, setPriorities] = React.useState<CustomPriority[]>(DEFAULT_PRIORITIES);
  const [habits, setHabits] = React.useState<Habit[]>([]);
  const [isHabitsColumnOpen, setIsHabitsColumnOpen] = React.useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('linear_lite_habits_col_open');
      return saved !== null ? JSON.parse(saved) : true;
    } catch {
      return true;
    }
  });

  const handleToggleHabitsColumn = () => {
    setIsHabitsColumnOpen((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('linear_lite_habits_col_open', JSON.stringify(next));
      } catch {
        // ignore
      }
      return next;
    });
  };

  const [colorCardsByProject, setColorCardsByProject] = React.useState<boolean>(() => TaskStorage.getColorCardsByProject());
  const [soundOn, setSoundOn] = React.useState(isSoundEnabled());

  const [activeView, setActiveView] = React.useState<ViewFilter>('today');
  const [filters, setFilters] = React.useState<TaskFilters>(DEFAULT_TASK_FILTERS);
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(true);
  const [selectedTask, setSelectedTask] = React.useState<Task | null>(null);
  const [isDetailOpen, setIsDetailOpen] = React.useState(false);
  const [isCommandOpen, setIsCommandOpen] = React.useState(false);
  const [isManagePropsOpen, setIsManagePropsOpen] = React.useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = React.useState(false);
  const [isProjectModalOpen, setIsProjectModalOpen] = React.useState(false);
  const [editingProject, setEditingProject] = React.useState<Project | null>(null);
  const [isHabitModalOpen, setIsHabitModalOpen] = React.useState(false);
  const [editingHabit, setEditingHabit] = React.useState<Habit | null>(null);
  const [dateForNewTask, setDateForNewTask] = React.useState<string | null>(null);
  const [quickTitle, setQuickTitle] = React.useState('');

  // Batch selection state
  const [selectedTaskIds, setSelectedTaskIds] = React.useState<string[]>([]);
  const [isBatchMode, setIsBatchMode] = React.useState(false);

  const quickInputRef = React.useRef<HTMLInputElement>(null);

  const handleResetFilters = () => {
    setFilters(DEFAULT_TASK_FILTERS);
  };

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
    setHabits(HabitStorage.getHabits());

    // Enforce dark theme
    TaskStorage.initTheme();
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
      setActiveView('today');
    }
  };

  // Habits CRUD & Logging
  const handleLogHabitDay = (habitId: string, dateStr: string, status: HabitStatus | null) => {
    const nextHabits = HabitStorage.logHabit(habitId, dateStr, status);
    setHabits(nextHabits);
  };

  const handleNewHabit = () => {
    setEditingHabit(null);
    setIsHabitModalOpen(true);
  };

  const handleEditHabit = (habit: Habit) => {
    setEditingHabit(habit);
    setIsHabitModalOpen(true);
  };

  const handleSaveHabit = (savedHabit: Habit) => {
    const nextHabits = HabitStorage.saveHabit(savedHabit);
    setHabits(nextHabits);
    setIsHabitModalOpen(false);
    setEditingHabit(null);
  };

  const handleDeleteHabit = (habitId: string) => {
    const nextHabits = HabitStorage.deleteHabit(habitId);
    setHabits(nextHabits);
    setIsHabitModalOpen(false);
    setEditingHabit(null);
  };

  const handleResetHabit = (habitId: string) => {
    const nextHabits = HabitStorage.resetHabitLogs(habitId);
    setHabits(nextHabits);
  };

  const handleResetTodayHabits = () => {
    const todayStr = new Date().toISOString().split('T')[0];
    const nextHabits = HabitStorage.resetAllHabitsToday(todayStr);
    setHabits(nextHabits);
  };

  const handleResetProductivityStreak = () => {
    TaskStorage.resetProductivityStreak();
    setActivity(TaskStorage.getActivity());
  };

  // Project card colors handler
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

  // Create task for specific date selected on mini month calendar
  const handleCreateTaskForDate = (data: {
    title: string;
    due_date: number;
    priority: string;
    project_id: string | null;
    description?: string;
    link_url?: string;
  }) => {
    const now = Math.floor(Date.now() / 1000);
    const newTask: Task = {
      id: `task_${Date.now()}`,
      title: data.title.trim(),
      description: data.description || '',
      link_url: data.link_url,
      status: 'todo',
      priority: data.priority,
      project_id: data.project_id,
      due_date: data.due_date,
      is_focus: false,
      completed_at: null,
      created_at: now,
      updated_at: now,
      subtasks: [],
      tags: [],
    };
    updateTasksState([newTask, ...tasks]);
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

  // Filter tasks based on active view and user filters:
  // Completed tasks ONLY appear in 'done' tab, while 'all' displays EVERYTHING!
  const { baseViewTasks, filteredTasks } = React.useMemo(() => {
    const todayMidnight = new Date();
    todayMidnight.setHours(23, 59, 59, 999);
    const todaySec = Math.floor(todayMidnight.getTime() / 1000);

    const base = tasks.filter((t) => {
      // Done tab: ONLY completed tasks
      if (activeView === 'done') {
        return t.status === 'done';
      }

      // All tab: literally ALL tasks in the system!
      if (activeView === 'all') {
        return true;
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
      return t.project_id === activeView;
    });

    const now = new Date();
    const todayCalMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const dayOfWeek = now.getDay() === 0 ? 7 : now.getDay();
    const daysUntilEndOfWeek = 7 - dayOfWeek;

    const filtered = base.filter((t) => {
      // 1. Priority filter
      if (filters.priority && t.priority !== filters.priority) {
        return false;
      }

      // 2. Project filter
      if (filters.projectId && t.project_id !== filters.projectId) {
        return false;
      }

      // 3. Status filter (active vs done)
      if (filters.status === 'active' && (t.status === 'done' || t.status === 'cancelled')) {
        return false;
      }
      if (filters.status === 'done' && t.status !== 'done') {
        return false;
      }

      // 4. Due date filter
      if (filters.dueDate !== 'all') {
        if (filters.dueDate === 'no_date') {
          if (t.due_date) return false;
        } else {
          if (!t.due_date) return false;
          const d = new Date(t.due_date * 1000);
          const taskCalMidnight = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
          const diffDays = Math.round((taskCalMidnight - todayCalMidnight) / 86400000);

          if (filters.dueDate === 'overdue') {
            if (!(diffDays < 0 && t.status !== 'done')) return false;
          } else if (filters.dueDate === 'today') {
            if (diffDays !== 0) return false;
          } else if (filters.dueDate === 'this_week') {
            if (!(diffDays >= 0 && diffDays <= daysUntilEndOfWeek)) return false;
          }
        }
      }

      // 5. Quick boolean chips
      if (filters.onlyFocus && !t.is_focus) {
        return false;
      }
      if (filters.onlyWithLink && (!t.link_url || !t.link_url.trim())) {
        return false;
      }
      if (filters.onlyWithSubtasks && (!t.subtasks || t.subtasks.length === 0)) {
        return false;
      }

      return true;
    }).sort((a, b) => {
      if (activeView === 'all') {
        if (a.status === 'done' && b.status !== 'done') return 1;
        if (a.status !== 'done' && b.status === 'done') return -1;
      }
      return (b.created_at || 0) - (a.created_at || 0);
    });

    return { baseViewTasks: base, filteredTasks: filtered };
  }, [tasks, activeView, filters]);

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
      all: tasks.length,
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

  // Habits remaining today calculation for badge
  const habitsRemainingToday = React.useMemo(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    return habits.filter((h) => h.logs?.[todayStr] !== 'completed').length;
  }, [habits]);

  const viewTitle = React.useMemo(() => {
    if (activeView === 'inbox') return 'Входящие';
    if (activeView === 'today') return 'Сегодня';
    if (activeView === 'habits') return 'Трекер привычек';
    if (activeView === 'upcoming') return 'Предстоящие';
    if (activeView === 'done') return 'Выполнено';
    if (activeView === 'all') return 'Все задачи';
    const proj = projects.find((p) => p.id === activeView);
    return proj ? proj.name : 'Задачи';
  }, [activeView, projects]);

  return (
    /* True 3-column split view: Sidebar | Main Content | Detail Panel */
    <div className="flex h-screen w-screen overflow-hidden bg-[var(--bg-main)] text-[var(--text-primary)] selection:bg-indigo-500/20 selection:text-indigo-400">
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
        habits={habits}
        habitsRemainingToday={habitsRemainingToday}
        tasks={tasks}
        onSelectDate={(d) => setDateForNewTask(d)}
        onResetProductivityStreak={handleResetProductivityStreak}
        onNewProject={handleNewProject}
        onEditProject={handleEditProject}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      {/* Column 2: Dedicated Fixed Left Habits Column (Always available across all views) */}
      <HabitsColumn
        isOpen={isHabitsColumnOpen}
        onToggle={handleToggleHabitsColumn}
        habits={habits}
        onLogDay={handleLogHabitDay}
        onNewHabit={handleNewHabit}
        onEditHabit={handleEditHabit}
        onOpenFullView={() => setActiveView('habits')}
        onResetHabit={handleResetHabit}
        onResetTodayHabits={handleResetTodayHabits}
      />

      {/* Column 3: Main Area */}
      <div className="flex-1 flex flex-col h-full min-w-0 overflow-hidden bg-transparent">
        {/* Seamless Unified Header: exact h-14 shrink-0 and border-b */}
        <header className="h-14 shrink-0 px-6 border-b border-black/[0.06] dark:border-white/[0.08] bg-white dark:bg-[#121214] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-sm font-semibold text-white tracking-tight">{viewTitle}</h1>
            <span className="text-xs font-mono text-slate-400 bg-white/[0.06] px-2 py-0.5 rounded-full">
              {activeView === 'habits' ? habits.length : filteredTasks.length}
            </span>
          </div>

          <div className="flex items-center gap-2">

            {activeView === 'habits' ? (
              <button
                onClick={handleNewHabit}
                className="flex items-center gap-1.5 text-xs text-indigo-300 bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/30 px-3 py-1.5 rounded-full transition shadow-sm"
              >
                <Plus size={13} />
                <span>Новая привычка</span>
              </button>
            ) : (
              <>
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
              </>
            )}

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

        {/* Main Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {activeView === 'habits' ? (
            <div className="max-w-4xl w-full mx-auto">
              <HabitsFullView
                habits={habits}
                onLogDay={handleLogHabitDay}
                onNewHabit={handleNewHabit}
                onEditHabit={handleEditHabit}
                onResetHabit={handleResetHabit}
              />
            </div>
          ) : (
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

              {/* Task Filters Bar */}
              <TaskFilterBar
                filters={filters}
                onUpdateFilters={setFilters}
                onResetFilters={handleResetFilters}
                projects={projects}
                priorities={priorities}
                activeView={activeView}
                totalMatching={filteredTasks.length}
                totalBase={baseViewTasks.length}
              />

              {/* One Big Thing Focus Card */}
              {focusTask && activeView !== 'done' && filteredTasks.some((t) => t.id === focusTask.id) && (
                <div className="space-y-2">
                  <FocusCard
                    task={focusTask}
                    project={projects.find((p) => p.id === focusTask.project_id)}
                    colorCardsByProject={colorCardsByProject}
                    onToggleComplete={handleToggleComplete}
                    onOpenDetail={handleOpenDetail}
                    onRemoveFocus={handleRemoveFocus}
                    onUpdateTask={handleUpdateTask}
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
          )}
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
      />

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
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
        onUpdatePriorities={handleUpdatePriorities}
      />

      {/* Habit Create & Edit Modal */}
      <HabitModal
        isOpen={isHabitModalOpen}
        onClose={() => {
          setIsHabitModalOpen(false);
          setEditingHabit(null);
        }}
        habit={editingHabit}
        onSave={handleSaveHabit}
        onDelete={handleDeleteHabit}
      />

      {/* New Task for Date Modal (from Mini Month Calendar) */}
      <NewTaskForDateModal
        isOpen={dateForNewTask !== null}
        dateStr={dateForNewTask}
        projects={projects}
        priorities={priorities}
        existingTasks={tasks.filter((t) => {
          if (!t.due_date || !dateForNewTask) return false;
          const d = new Date(t.due_date * 1000);
          const y = d.getFullYear();
          const m = String(d.getMonth() + 1).padStart(2, '0');
          const day = String(d.getDate()).padStart(2, '0');
          return `${y}-${m}-${day}` === dateForNewTask;
        })}
        onClose={() => setDateForNewTask(null)}
        onCreateTask={handleCreateTaskForDate}
      />
    </div>
  );
}

export default App;
