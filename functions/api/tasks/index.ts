// Cloudflare Pages Function: /api/tasks

interface Env {
  DB: D1Database;
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
  try {
    const { results: tasks } = await context.env.DB.prepare(
      `SELECT * FROM tasks ORDER BY created_at DESC`
    ).all();

    const { results: subtasks } = await context.env.DB.prepare(
      `SELECT * FROM subtasks ORDER BY sort_order ASC`
    ).all();

    // Map subtasks to their tasks
    const tasksWithSubtasks = tasks.map((task: any) => ({
      ...task,
      is_focus: Boolean(task.is_focus),
      subtasks: subtasks.filter((st: any) => st.task_id === task.id),
    }));

    return new Response(JSON.stringify(tasksWithSubtasks), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    const body: any = await context.request.json();
    const now = Math.floor(Date.now() / 1000);
    const id = body.id || `task_${Date.now()}`;

    await context.env.DB.prepare(
      `INSERT INTO tasks (id, title, description, status, priority, project_id, due_date, is_focus, recurring_rule, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
      .bind(
        id,
        body.title,
        body.description || '',
        body.status || 'inbox',
        body.priority || 'none',
        body.project_id || null,
        body.due_date || null,
        body.is_focus ? 1 : 0,
        body.recurring_rule || null,
        now,
        now
      )
      .run();

    return new Response(JSON.stringify({ success: true, id }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
