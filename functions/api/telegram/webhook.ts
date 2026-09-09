// Cloudflare Pages Function: /api/telegram/webhook

interface Env {
  DB: D1Database;
  TELEGRAM_BOT_TOKEN: string;
  TELEGRAM_ALLOWED_CHAT_ID: string;
  GROQ_API_KEY?: string;
}

async function sendTelegramMessage(token: string, chatId: number | string, text: string) {
  await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text }),
  });
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    const update: any = await context.request.json();
    const message = update.message;
    if (!message) return new Response('OK');

    const chatId = message.chat?.id?.toString();
    const token = context.env.TELEGRAM_BOT_TOKEN;
    const allowedChatId = context.env.TELEGRAM_ALLOWED_CHAT_ID;

    // Security check: only allow the owner
    if (allowedChatId && chatId !== allowedChatId) {
      console.warn(`Unauthorized access attempt from chat_id: ${chatId}`);
      if (token) {
        await sendTelegramMessage(token, chatId, '⛔ Доступ запрещен. Это приватный бот.');
      }
      return new Response('Unauthorized', { status: 403 });
    }

    const now = Math.floor(Date.now() / 1000);
    const taskId = `task_${Date.now()}`;
    let taskTitle = '';
    let isVoice = false;

    // Case 1: Plain text message
    if (message.text) {
      taskTitle = message.text.trim();
    }
    // Case 2: Voice message
    else if (message.voice && context.env.GROQ_API_KEY) {
      isVoice = true;
      const fileId = message.voice.file_id;
      // 1. Get file path
      const fileRes = await fetch(`https://api.telegram.org/bot${token}/getFile?file_id=${fileId}`);
      const fileData: any = await fileRes.json();
      const filePath = fileData.result?.file_path;

      if (filePath) {
        // 2. Download audio
        const audioRes = await fetch(`https://api.telegram.org/file/bot${token}/${filePath}`);
        const audioBuffer = await audioRes.arrayBuffer();

        // 3. Transcribe via Groq Whisper
        const formData = new FormData();
        const blob = new Blob([audioBuffer], { type: 'audio/ogg' });
        formData.append('file', blob, 'voice.ogg');
        formData.append('model', 'whisper-large-v3-turbo');
        formData.append('language', 'ru');

        const whisperRes = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', {
          method: 'POST',
          headers: { Authorization: `Bearer ${context.env.GROQ_API_KEY}` },
          body: formData,
        });

        const whisperData: any = await whisperRes.json();
        if (whisperData.text) {
          taskTitle = `🎙️ ${whisperData.text.trim()}`;
        }
      }
    }

    if (!taskTitle) {
      taskTitle = 'Новая заметка из Telegram';
    }

    // Insert task into D1 database
    await context.env.DB.prepare(
      `INSERT INTO tasks (id, title, description, status, priority, is_focus, created_at, updated_at)
       VALUES (?, ?, ?, 'inbox', 'none', 0, ?, ?)`
    )
      .bind(taskId, taskTitle, isVoice ? 'Голосовая заметка' : '', now, now)
      .run();

    // Reply confirmation to Telegram
    if (token && chatId) {
      const reply = isVoice
        ? `🎙️ Расшифровал и записал во Входящие:\n«${taskTitle.replace('🎙️ ', '')}» 👌`
        : `👌 Задача сохранена во Входящие:\n«${taskTitle}»`;
      await sendTelegramMessage(token, chatId, reply);
    }

    return new Response('OK');
  } catch (err: any) {
    console.error('Webhook error:', err);
    return new Response('Error: ' + err.message, { status: 500 });
  }
};
