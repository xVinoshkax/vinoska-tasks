import type { Task, Project, Tag, ActivityDay, CustomPriority, CustomStatus } from '../types';

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

const STORAGE_KEY_THEME = 'linear_lite_theme';
const STORAGE_KEY_PROJECT_CARD_COLORS = 'linear_lite_project_card_colors';

import type { ThemeId, ThemeOption } from '../types';

export const THEME_OPTIONS: ThemeOption[] = [
  {
    id: 'oled',
    name: 'iOS Dark (OLED)',
    description: 'Глубокий чёрный, эталонный стиль iOS 18',
    bgMain: '#000000',
    bgSurface: '#1c1c1e',
    accent: '#0a84ff',
  },
  {
    id: 'graphite',
    name: 'Тёмный графит (Linear)',
    description: 'Матовый тёмно-серый студийный стиль',
    bgMain: '#101114',
    bgSurface: '#1e2026',
    accent: '#6366f1',
  },
  {
    id: 'navy',
    name: 'Глубокий космос',
    description: 'Ночной индиго и сапфировые акценты',
    bgMain: '#080b12',
    bgSurface: '#161f33',
    accent: '#38bdf8',
  },
  {
    id: 'slate',
    name: 'Тёплый оникс',
    description: 'Мягкий кофейно-графитовый оттенок',
    bgMain: '#141312',
    bgSurface: '#262320',
    accent: '#f59e0b',
  },
  {
    id: 'emerald',
    name: 'Хвойная ночь',
    description: 'Изумрудно-хвойный глубокий тёмный',
    bgMain: '#09120e',
    bgSurface: '#182820',
    accent: '#10b981',
  },
];

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

  static getTheme(): ThemeId {
    try {
      const val = localStorage.getItem(STORAGE_KEY_THEME);
      if (val && ['oled', 'graphite', 'navy', 'slate', 'emerald'].includes(val)) {
        return val as ThemeId;
      }
    } catch {
      // ignore
    }
    return 'oled';
  }

  static saveTheme(theme: ThemeId): void {
    try {
      localStorage.setItem(STORAGE_KEY_THEME, theme);
      document.documentElement.setAttribute('data-theme', theme);
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
}
