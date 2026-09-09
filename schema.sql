-- Schema for Task Tracker (Cloudflare D1 SQLite)

CREATE TABLE IF NOT EXISTS projects (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    color TEXT NOT NULL DEFAULT '#6366f1',
    icon TEXT DEFAULT 'folder',
    created_at INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE TABLE IF NOT EXISTS tasks (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT DEFAULT '',
    status TEXT NOT NULL CHECK (status IN ('inbox', 'todo', 'in_progress', 'done', 'cancelled')) DEFAULT 'inbox',
    priority TEXT NOT NULL CHECK (priority IN ('urgent', 'high', 'medium', 'low', 'none')) DEFAULT 'none',
    project_id TEXT,
    due_date INTEGER, -- Unix timestamp in seconds
    is_focus INTEGER NOT NULL DEFAULT 0, -- One Big Thing (0 or 1)
    recurring_rule TEXT, -- 'daily', 'weekly', 'monthly', or NULL
    link_url TEXT, -- External link URL
    completed_at INTEGER,
    created_at INTEGER NOT NULL DEFAULT (unixepoch()),
    updated_at INTEGER NOT NULL DEFAULT (unixepoch()),
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS subtasks (
    id TEXT PRIMARY KEY,
    task_id TEXT NOT NULL,
    title TEXT NOT NULL,
    is_completed INTEGER NOT NULL DEFAULT 0,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at INTEGER NOT NULL DEFAULT (unixepoch()),
    FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS tags (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    color TEXT NOT NULL DEFAULT '#a1a1aa'
);

CREATE TABLE IF NOT EXISTS task_tags (
    task_id TEXT NOT NULL,
    tag_id TEXT NOT NULL,
    PRIMARY KEY (task_id, tag_id),
    FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE,
    FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS activity_log (
    id TEXT PRIMARY KEY,
    task_id TEXT,
    action TEXT NOT NULL, -- 'created', 'completed', 'pomodoro'
    timestamp INTEGER NOT NULL DEFAULT (unixepoch()),
    FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS habits (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT DEFAULT '',
    icon TEXT NOT NULL DEFAULT 'Sparkles',
    color TEXT NOT NULL DEFAULT '#10b981',
    frequency TEXT NOT NULL DEFAULT 'daily',
    archived INTEGER NOT NULL DEFAULT 0,
    created_at INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE TABLE IF NOT EXISTS habit_logs (
    id TEXT PRIMARY KEY,
    habit_id TEXT NOT NULL,
    date TEXT NOT NULL, -- 'YYYY-MM-DD'
    status TEXT NOT NULL, -- 'completed', 'failed', 'skipped'
    created_at INTEGER NOT NULL DEFAULT (unixepoch()),
    FOREIGN KEY (habit_id) REFERENCES habits(id) ON DELETE CASCADE,
    UNIQUE(habit_id, date)
);

-- Seed initial projects
INSERT OR IGNORE INTO projects (id, name, color, icon) VALUES
    ('proj_work', 'Работа', '#3b82f6', 'briefcase'),
    ('proj_personal', 'Личное', '#10b981', 'user'),
    ('proj_ideas', 'Идеи и проекты', '#8b5cf6', 'sparkles');

-- Seed tags
INSERT OR IGNORE INTO tags (id, name, color) VALUES
    ('tag_urgent', 'Срочно', '#ef4444'),
    ('tag_bug', 'Баг', '#f97316'),
    ('tag_routine', 'Быт', '#06b6d4'),
    ('tag_voice', 'Голосовое', '#a855f7');
