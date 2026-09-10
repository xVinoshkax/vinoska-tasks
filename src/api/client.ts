import type { Task, Project, Tag, ActivityDay, CustomPriority, CustomStatus, Habit, HabitStatus, HabitStats } from '../types';

const STORAGE_KEY_TASKS = 'linear_lite_tasks';
const STORAGE_KEY_PROJECTS = 'linear_lite_projects';
const STORAGE_KEY_ACTIVITY = 'linear_lite_activity';
const STORAGE_KEY_PRIORITIES = 'linear_lite_priorities';
const STORAGE_KEY_STATUSES = 'linear_lite_statuses';

export const DEFAULT_PRIORITIES: CustomPriority[] = [
  { id: 'urgent', label: 'Срочно', color: '#ef4444' },
  { id: 'high', label: 'Высокий', color: '#f59e0b' },
  { id: 'medium', label: 'Средний', color: '#3b82f6' },
  { id: 'low', label: 'Низкий', color: '#64748b' },
  { id: 'none', label: 'Без приоритета', color: '#475569' },
];

export const DEFAULT_STATUSES: CustomStatus[] = [
  { id: 'inbox', name: 'Входящие', color: '#6366f1' },
  { id: 'todo', name: 'К выполнению', color: '#38bdf8' },
  { id: 'in_progress', name: 'В процессе', color: '#eab308' },
  { id: 'done', name: 'Выполнено', color: '#10b981', isDone: true },
  { id: 'cancelled', name: 'Отменено', color: '#64748b', isDone: true },
];

export const INITIAL_PROJECTS: Project[] = [
  { id: 'proj_work', name: 'Работа', color: '#4f46e5', icon: 'briefcase' },
  { id: 'proj_personal', name: 'Личное', color: '#059669', icon: 'user' },
  { id: 'proj_ideas', name: 'Идеи и проекты', color: '#7c3aed', icon: 'sparkles' },
];

export const INITIAL_TAGS: Tag[] = [
  { id: 'tag_urgent', name: 'Срочно', color: '#ef4444' },
  { id: 'tag_bug', name: 'Баг', color: '#f97316' },
  { id: 'tag_routine', name: 'Быт', color: '#06b6d4' },
  { id: 'tag_voice', name: 'Голосовое', color: '#a855f7' },
];

const nowSec = Math.floor(Date.now() / 1000);
const todayMidnight = new Date();
todayMidnight.setHours(23, 59, 59, 0);
const todaySec = Math.floor(todayMidnight.getTime() / 1000);

export const INITIAL_TASKS: Task[] = [
  {
    id: 'task_1',
    title: 'Подготовить квартальный отчет и метрики эффективности',
    description: 'Собрать данные по выполненным спринтам, свести в презентацию для команды и стейкхолдеров.',
    status: 'in_progress',
    priority: 'urgent',
    project_id: 'proj_work',
    due_date: todaySec,
    is_focus: true,
    created_at: nowSec - 3600 * 24,
    updated_at: nowSec,
    completed_at: null,
    subtasks: [
      { id: 'st_1', task_id: 'task_1', title: 'Выгрузить аналитику за квартал', is_completed: true, sort_order: 0 },
      { id: 'st_2', task_id: 'task_1', title: 'Оформить слайды с графиками', is_completed: false, sort_order: 1 },
      { id: 'st_3', task_id: 'task_1', title: 'Провести репетицию доклада', is_completed: false, sort_order: 2 },
    ],
    tags: [INITIAL_TAGS[0]],
  },
  {
    id: 'task_2',
    title: 'Записаться на ТО автомобиля и поменять масло',
    description: 'Позвонить в сервис у дома, уточнить наличие расходников.',
    status: 'todo',
    priority: 'medium',
    project_id: 'proj_personal',
    due_date: todaySec + 3600 * 48,
    is_focus: false,
    created_at: nowSec - 3600 * 12,
    updated_at: nowSec,
    completed_at: null,
    subtasks: [],
    tags: [INITIAL_TAGS[2]],
  },
  {
    id: 'task_3',
    title: '🎙️ Изучить новую документацию по API Cloudflare D1',
    description: 'Заметка из Telegram: проверить лимиты и локальную эмуляцию.',
    status: 'inbox',
    priority: 'high',
    project_id: 'proj_ideas',
    due_date: null,
    is_focus: false,
    created_at: nowSec - 3600 * 2,
    updated_at: nowSec,
    completed_at: null,
    subtasks: [],
    tags: [INITIAL_TAGS[3]],
  },
  {
    id: 'task_4',
    title: 'Купить хороший зерновой кофе домой',
    description: 'Эфиопия или Колумбия свежей обжарки.',
    status: 'done',
    priority: 'low',
    project_id: 'proj_personal',
    due_date: todaySec,
    is_focus: false,
    created_at: nowSec - 3600 * 30,
    updated_at: nowSec,
    completed_at: nowSec - 3600 * 4,
    subtasks: [],
    tags: [INITIAL_TAGS[2]],
  },
];

export function getInitialActivity(): ActivityDay[] {
  const result: ActivityDay[] = [];
  const today = new Date();
  for (let i = 45; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    let count = 0;
    if (i === 0) count = 3;
    else if (i < 7) count = (i % 3) + 1;
    else if (i % 5 !== 0) count = (i % 4);
    result.push({ date: dateStr, count });
  }
  return result;
}

const STORAGE_KEY_PROJECT_CARD_COLORS = 'linear_lite_project_card_colors';
const STORAGE_KEY_SHOW_TASK_TIME = 'linear_lite_show_task_time';

export class TaskStorage {
  static getTasks(): Task[] {
    try {
      const data = localStorage.getItem(STORAGE_KEY_TASKS);
      if (data) return JSON.parse(data);
    } catch {
      // fallback
    }
    this.saveTasks(INITIAL_TASKS);
    return INITIAL_TASKS;
  }

  static saveTasks(tasks: Task[]): void {
    try {
      localStorage.setItem(STORAGE_KEY_TASKS, JSON.stringify(tasks));
    } catch {
      // ignore
    }
  }

  static getPriorities(): CustomPriority[] {
    try {
      const data = localStorage.getItem(STORAGE_KEY_PRIORITIES);
      if (data) {
        const parsed: CustomPriority[] = JSON.parse(data);
        // Clean any legacy P1/P2 from labels
        const cleaned = parsed.map(p => {
          let cleanLabel = p.label
            .replace(/^P1\s*\(?/, '')
            .replace(/^P2\s*\(?/, '')
            .replace(/^P3\s*\(?/, '')
            .replace(/^P4\s*\(?/, '')
            .replace(/\)$/, '')
            .trim();
          if (!cleanLabel) cleanLabel = p.label;
          return { ...p, label: cleanLabel };
        });
        return cleaned;
      }
    } catch {
      // fallback
    }
    this.savePriorities(DEFAULT_PRIORITIES);
    return DEFAULT_PRIORITIES;
  }

  static savePriorities(priorities: CustomPriority[]): void {
    try {
      localStorage.setItem(STORAGE_KEY_PRIORITIES, JSON.stringify(priorities));
    } catch {
      // ignore
    }
  }

  static getStatuses(): CustomStatus[] {
    try {
      const data = localStorage.getItem(STORAGE_KEY_STATUSES);
      if (data) return JSON.parse(data);
    } catch {
      // fallback
    }
    this.saveStatuses(DEFAULT_STATUSES);
    return DEFAULT_STATUSES;
  }

  static saveStatuses(statuses: CustomStatus[]): void {
    try {
      localStorage.setItem(STORAGE_KEY_STATUSES, JSON.stringify(statuses));
    } catch {
      // ignore
    }
  }

  static getProjects(): Project[] {
    try {
      const data = localStorage.getItem(STORAGE_KEY_PROJECTS);
      if (data) return JSON.parse(data);
    } catch {
      // fallback
    }
    this.saveProjects(INITIAL_PROJECTS);
    return INITIAL_PROJECTS;
  }

  static saveProjects(projects: Project[]): void {
    try {
      localStorage.setItem(STORAGE_KEY_PROJECTS, JSON.stringify(projects));
    } catch {
      // ignore
    }
  }

  static initTheme(): void {
    try {
      document.documentElement.setAttribute('data-theme', 'dark');
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    } catch {
      // ignore
    }
  }

  static getColorCardsByProject(): boolean {
    try {
      const val = localStorage.getItem(STORAGE_KEY_PROJECT_CARD_COLORS);
      if (val !== null) return JSON.parse(val);
    } catch {
      // ignore
    }
    return true; // Default ON: sleek colored cards
  }

  static saveColorCardsByProject(enabled: boolean): void {
    try {
      localStorage.setItem(STORAGE_KEY_PROJECT_CARD_COLORS, JSON.stringify(enabled));
    } catch {
      // ignore
    }
  }

  static getShowTaskTime(): boolean {
    try {
      const val = localStorage.getItem(STORAGE_KEY_SHOW_TASK_TIME);
      if (val !== null) return JSON.parse(val);
    } catch {
      // ignore
    }
    return true; // Default to true so user sees time when set, but can toggle in settings
  }

  static saveShowTaskTime(enabled: boolean): void {
    try {
      localStorage.setItem(STORAGE_KEY_SHOW_TASK_TIME, JSON.stringify(enabled));
    } catch {
      // ignore
    }
  }

  static getActivity(): ActivityDay[] {
    try {
      const data = localStorage.getItem(STORAGE_KEY_ACTIVITY);
      if (data) return JSON.parse(data);
    } catch {
      // fallback
    }
    const init = getInitialActivity();
    this.saveActivity(init);
    return init;
  }

  static saveActivity(activity: ActivityDay[]): void {
    try {
      localStorage.setItem(STORAGE_KEY_ACTIVITY, JSON.stringify(activity));
    } catch {
      // ignore
    }
  }

  static recordActivityToday(): void {
    const todayStr = new Date().toISOString().split('T')[0];
    const activities = this.getActivity();
    const existing = activities.find(a => a.date === todayStr);
    if (existing) {
      existing.count += 1;
    } else {
      activities.push({ date: todayStr, count: 1 });
    }
    this.saveActivity(activities);
  }

  static getStreakResetDate(): string | null {
    try {
      return localStorage.getItem('linear_lite_streak_reset_date');
    } catch {
      return null;
    }
  }

  static resetProductivityStreak(): void {
    const todayStr = new Date().toISOString().split('T')[0];
    try {
      localStorage.setItem(STORAGE_KEY_ACTIVITY, JSON.stringify([]));
      localStorage.setItem('linear_lite_streak_reset_date', todayStr);
      localStorage.setItem('linear_lite_streak_reset_at', String(Date.now()));
    } catch {
      // ignore
    }
  }
}

const STORAGE_KEY_HABITS = 'linear_lite_habits';

const todayObj = new Date();

const yesterdayObj = new Date(todayObj);
yesterdayObj.setDate(yesterdayObj.getDate() - 1);
const yesterdayDateStr = yesterdayObj.toISOString().split('T')[0];

const dMinus2Obj = new Date(todayObj);
dMinus2Obj.setDate(dMinus2Obj.getDate() - 2);
const dMinus2Str = dMinus2Obj.toISOString().split('T')[0];

const dMinus3Obj = new Date(todayObj);
dMinus3Obj.setDate(dMinus3Obj.getDate() - 3);
const dMinus3Str = dMinus3Obj.toISOString().split('T')[0];

export const INITIAL_HABITS: Habit[] = [
  {
    id: 'habit_1',
    title: 'Пить 2л чистой воды',
    description: 'Минимум 6-8 стаканов воды в течение дня',
    icon: 'Droplets',
    color: '#0ea5e9',
    frequency: 'daily',
    created_at: Math.floor(Date.now() / 1000) - 86400 * 10,
    logs: {
      [dMinus3Str]: 'completed',
      [dMinus2Str]: 'completed',
      [yesterdayDateStr]: 'completed',
    },
  },
  {
    id: 'habit_2',
    title: 'Утренняя разминка и зарядка',
    description: '10-15 минут суставной гимнастики или йоги',
    icon: 'Flame',
    color: '#f97316',
    frequency: 'daily',
    created_at: Math.floor(Date.now() / 1000) - 86400 * 7,
    logs: {
      [dMinus3Str]: 'failed',
      [dMinus2Str]: 'completed',
      [yesterdayDateStr]: 'completed',
    },
  },
  {
    id: 'habit_3',
    title: 'Чтение книги 20 минут',
    description: 'Перед сном или во время обеденного перерыва',
    icon: 'BookOpen',
    color: '#8b5cf6',
    frequency: 'daily',
    created_at: Math.floor(Date.now() / 1000) - 86400 * 5,
    logs: {
      [dMinus2Str]: 'completed',
      [yesterdayDateStr]: 'completed',
    },
  },
  {
    id: 'habit_4',
    title: 'Медитация / вечерняя прогулка',
    description: 'Сбросить рабочий стресс и перезагрузить голову',
    icon: 'Heart',
    color: '#ec4899',
    frequency: 'daily',
    created_at: Math.floor(Date.now() / 1000) - 86400 * 4,
    logs: {
      [yesterdayDateStr]: 'completed',
    },
  },
];

export class HabitStorage {
  static getHabits(): Habit[] {
    try {
      const data = localStorage.getItem(STORAGE_KEY_HABITS);
      if (data) return JSON.parse(data);
    } catch {
      // fallback
    }
    this.saveHabits(INITIAL_HABITS);
    return INITIAL_HABITS;
  }

  static saveHabits(habits: Habit[]): void {
    try {
      localStorage.setItem(STORAGE_KEY_HABITS, JSON.stringify(habits));
    } catch {
      // ignore
    }
  }

  static logHabit(habitId: string, dateStr: string, status: HabitStatus | null): Habit[] {
    const habits = this.getHabits();
    const updated = habits.map((h) => {
      if (h.id !== habitId) return h;
      const logs = { ...(h.logs || {}) };
      if (status === null) {
        delete logs[dateStr];
      } else {
        logs[dateStr] = status;
      }
      return { ...h, logs };
    });
    this.saveHabits(updated);
    return updated;
  }

  static saveHabit(habit: Habit): Habit[] {
    const habits = this.getHabits();
    const idx = habits.findIndex((h) => h.id === habit.id);
    let next: Habit[];
    if (idx >= 0) {
      next = habits.map((h) => (h.id === habit.id ? habit : h));
    } else {
      next = [...habits, habit];
    }
    this.saveHabits(next);
    return next;
  }

  static deleteHabit(habitId: string): Habit[] {
    const habits = this.getHabits().filter((h) => h.id !== habitId);
    this.saveHabits(habits);
    return habits;
  }

  static calculateStats(habit: Habit): HabitStats {
    const logs = habit.logs || {};
    let totalCompleted = 0;
    let totalFailed = 0;

    Object.values(logs).forEach((st) => {
      if (st === 'completed') totalCompleted++;
      if (st === 'failed') totalFailed++;
    });

    const evaluatedDays = totalCompleted + totalFailed;
    const successRate = evaluatedDays > 0 ? Math.round((totalCompleted / evaluatedDays) * 100) : 100;

    // Calculate current streak
    let currentStreak = 0;
    const now = new Date();
    const tStr = now.toISOString().split('T')[0];

    const yDate = new Date(now);
    yDate.setDate(yDate.getDate() - 1);
    const yStr = yDate.toISOString().split('T')[0];

    let checkDate = new Date(now);
    if (logs[tStr] === 'completed') {
      currentStreak = 1;
      checkDate.setDate(checkDate.getDate() - 1);
    } else if (logs[tStr] === 'failed') {
      currentStreak = 0;
    } else {
      // Not marked today yet: streak holds from yesterday
      if (logs[yStr] === 'completed') {
        currentStreak = 1;
        checkDate = new Date(yDate);
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        currentStreak = 0;
      }
    }

    if (currentStreak > 0) {
      for (let i = 0; i < 365; i++) {
        const dStr = checkDate.toISOString().split('T')[0];
        if (logs[dStr] === 'completed') {
          currentStreak++;
          checkDate.setDate(checkDate.getDate() - 1);
        } else {
          break;
        }
      }
    }

    // Calculate best streak
    const sortedDates = Object.keys(logs).sort();
    let bestStreak = 0;
    let tempStreak = 0;
    let prevTimestamp = 0;

    for (const dateKey of sortedDates) {
      if (logs[dateKey] === 'completed') {
        const currentTimestamp = new Date(dateKey).getTime();
        // 86400000 ms in a day (tolerating leap second / timezone +/- 2 hours)
        const diff = currentTimestamp - prevTimestamp;
        if (prevTimestamp === 0 || (diff >= 82800000 && diff <= 90000000)) {
          tempStreak++;
        } else {
          tempStreak = 1;
        }
        prevTimestamp = currentTimestamp;
        if (tempStreak > bestStreak) {
          bestStreak = tempStreak;
        }
      } else {
        tempStreak = 0;
        prevTimestamp = 0;
      }
    }

    if (currentStreak > bestStreak) {
      bestStreak = currentStreak;
    }

    return {
      currentStreak,
      bestStreak,
      totalCompleted,
      totalFailed,
      successRate,
    };
  }

  static resetHabitLogs(habitId: string): Habit[] {
    const habits = this.getHabits();
    const next = habits.map((h) => (h.id === habitId ? { ...h, logs: {} } : h));
    this.saveHabits(next);
    return next;
  }

  static resetAllHabitsToday(dateStr: string): Habit[] {
    const habits = this.getHabits();
    const next = habits.map((h) => {
      const logs = { ...h.logs };
      delete logs[dateStr];
      return { ...h, logs };
    });
    this.saveHabits(next);
    return next;
  }
}

