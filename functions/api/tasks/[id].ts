// Cloudflare Pages Function: /api/tasks/[id]

interface Env {
  DB: D1Database;
}

export const onRequestPatch: PagesFunction<Env> = async (context) => {
  try {
    const id = context.params.id as string;
    const body: any = await context.request.json();
    const now = Math.floor(Date.now() / 1000);

    const fields: string[] = [];
    const values: any[] = [];

    if (body.title !== undefined) {
      fields.push('title = ?');
      values.push(body.title);
    }
    if (body.description !== undefined) {
      fields.push('description = ?');
      values.push(body.description);
    }
    if (body.status !== undefined) {
      fields.push('status = ?');
      values.push(body.status);
      if (body.status === 'done') {
        fields.push('completed_at = ?');
        values.push(now);
      }
    }
    if (body.priority !== undefined) {
      fields.push('priority = ?');
      values.push(body.priority);
    }
    if (body.project_id !== undefined) {
      fields.push('project_id = ?');
      values.push(body.project_id);
    }
    if (body.is_focus !== undefined) {
      fields.push('is_focus = ?');
      values.push(body.is_focus ? 1 : 0);
    }
    if (body.recurring_rule !== undefined) {
      fields.push('recurring_rule = ?');
      values.push(body.recurring_rule);
    }

    fields.push('updated_at = ?');
    values.push(now);

    values.push(id);

    await context.env.DB.prepare(
      `UPDATE tasks SET ${fields.join(', ')} WHERE id = ?`
    ).bind(...values).run();

    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

export const onRequestDelete: PagesFunction<Env> = async (context) => {
  try {
    const id = context.params.id as string;
    await context.env.DB.prepare(`DELETE FROM tasks WHERE id = ?`).bind(id).run();

    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
