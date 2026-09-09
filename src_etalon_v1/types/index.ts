export type TaskStatus = string; // can be custom e.g. 'inbox', 'todo', 'in_progress', 'review', 'done', 'cancelled'
export type TaskPriority = string; // can be custom e.g. 'urgent', 'high', 'medium', 'low', 'none'
export type RecurringType = 'none' | 'daily' | 'weekly_days' | 'weekly' | 'monthly';

export interface CustomPriority {
  id: string;
  label: string;
  shortLabel?: string;
  color: string;
}

export interface CustomStatus {
  id: string;
  name: string;
  color: string;
  isDone?: boolean;
}

export interface Subtask {
  id: string;
  task_id: string;
  title: string;
  is_completed: boolean;
  sort_order: number;
}

export interface Tag {
  id: string;
  name: string;
  color: string;
}

export interface Project {
  id: string;
  name: string;
  color: string;
  icon?: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  project_id: string | null;
  due_date: number | null; // unix timestamp in seconds
  is_focus: boolean; // One Big Thing
  recurring_type?: RecurringType;
  recurring_days?: number[]; // [1, 2, 3, 4, 5] (1 = Mon, 7 = Sun)
  recurring_rule?: string | null;
  completed_at: number | null;
  created_at: number;
  updated_at: number;
  subtasks?: Subtask[];
  tags?: Tag[];
}

export type ViewFilter = 'inbox' | 'today' | 'upcoming' | 'all' | 'done' | string;

export type ThemeId = 'oled' | 'graphite' | 'navy' | 'slate' | 'emerald';

export interface ThemeOption {
  id: ThemeId;
  name: string;
  description: string;
  bgMain: string;
  bgSurface: string;
  accent: string;
}

export interface ActivityDay {
  date: string; // YYYY-MM-DD
  count: number;
}

