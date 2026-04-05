import TelegramBot from 'node-telegram-bot-api';
import dotenv from 'dotenv';
import { askClaude } from './claude-bridge';

dotenv.config();

const TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const ALLOWED_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

if (!TOKEN) {
  console.error('❌ TELEGRAM_BOT_TOKEN fehlt in .env');
  process.exit(1);
}

const bot = new TelegramBot(TOKEN, { polling: true });

console.log('🤖 MeinKalender Bot gestartet');

// Security: nur Nachrichten vom erlaubten Chat verarbeiten
function isAllowed(chatId: number): boolean {
  if (!ALLOWED_CHAT_ID) return true; // Kein Filter gesetzt → alle erlauben
  return chatId.toString() === ALLOWED_CHAT_ID;
}

// /start command
bot.onText(/\/start/, (msg) => {
  if (!isAllowed(msg.chat.id)) return;
  bot.sendMessage(msg.chat.id,
    `👋 Hallo! Ich bin dein MeinKalender Assistent.\n\n` +
    `Schreib mir einfach was du brauchst:\n\n` +
    `📅 "Morgen 14 Uhr Zahnarzt, 1 Stunde"\n` +
    `📋 "Neue Aufgabe: Steuererklärung, 2h, hohe Prio"\n` +
    `📊 "Was steht heute an?"\n` +
    `⚡ "Plane meinen Tag"\n\n` +
    `Deine Chat-ID: \`${msg.chat.id}\``,
    { parse_mode: 'Markdown' }
  );
});

// /heute command – quick shortcut
bot.onText(/\/heute/, async (msg) => {
  if (!isAllowed(msg.chat.id)) return;
  await handleMessage(msg.chat.id, 'Was steht heute auf dem Plan? Zeige mir alle Termine und geplante Aufgaben.');
});

// /plan command – auto-schedule
bot.onText(/\/plan/, async (msg) => {
  if (!isAllowed(msg.chat.id)) return;
  await handleMessage(msg.chat.id, 'Plane automatisch alle offenen Aufgaben für die nächsten 7 Tage ein und zeig mir das Ergebnis.');
});

// /tasks command – show open tasks
bot.onText(/\/tasks/, async (msg) => {
  if (!isAllowed(msg.chat.id)) return;
  await handleMessage(msg.chat.id, 'Zeige mir alle offenen Aufgaben sortiert nach Priorität.');
});

// All other messages → Claude
bot.on('message', async (msg) => {
  if (!msg.text) return;
  if (msg.text.startsWith('/')) return; // Commands handled above
  if (!isAllowed(msg.chat.id)) {
    bot.sendMessage(msg.chat.id, '🚫 Nicht autorisiert. Deine Chat-ID: ' + msg.chat.id);
    return;
  }

  await handleMessage(msg.chat.id, msg.text);
});

async function handleMessage(chatId: number, text: string): Promise<void> {
  // Typing indicator
  bot.sendChatAction(chatId, 'typing');

  // Keep typing while Claude works
  const typingInterval = setInterval(() => {
    bot.sendChatAction(chatId, 'typing');
  }, 4000);

  try {
    const response = await askClaude(text);
    clearInterval(typingInterval);

    // Telegram hat ein 4096 Zeichen Limit pro Nachricht
    if (response.length > 4000) {
      const chunks = response.match(/.{1,4000}/gs) || [response];
      for (const chunk of chunks) {
        await bot.sendMessage(chatId, chunk);
      }
    } else {
      await bot.sendMessage(chatId, response || '🤔 Keine Antwort erhalten.');
    }
  } catch (err) {
    clearInterval(typingInterval);
    const errorMsg = err instanceof Error ? err.message : 'Unbekannter Fehler';
    console.error('Error:', errorMsg);
    await bot.sendMessage(chatId, `❌ Fehler: ${errorMsg}`);
  }
}

// Error handling
bot.on('polling_error', (err) => {
  console.error('Polling error:', err.message);
});

process.on('SIGINT', () => {
  console.log('\n👋 Bot wird beendet...');
  bot.stopPolling();
  process.exit(0);
});
