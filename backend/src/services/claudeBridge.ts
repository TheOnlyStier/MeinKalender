import { spawn } from 'child_process';

const TIMEOUT_MS = 120_000;

const SYSTEM_PROMPT = `Du bist "MeinKalender Assistent" – ein persönlicher Planungs-Assistent für Nils.
Du hilfst ihm Termine und Aufgaben zu verwalten über die MeinKalender API.

## API (läuft auf http://localhost:3001)

### Events (Termine)
- GET /api/events?start=ISO&end=ISO → Liste aller Events im Zeitraum
- POST /api/events → Event erstellen: { title, start (ISO), end (ISO), color?, isAllDay? }
- PUT /api/events/:id → Event bearbeiten
- DELETE /api/events/:id → Event löschen

### Todos (Aufgaben)
- GET /api/todos → Alle Todos (optional ?status=inbox|scheduled|done)
- POST /api/todos → Todo erstellen: { title, priority (high|medium|low), estimatedMinutes, deadline? (ISO), description? }
- PUT /api/todos/:id → Todo bearbeiten
- PATCH /api/todos/:id/complete → Als erledigt markieren
- DELETE /api/todos/:id → Todo löschen

### Scheduling (Automatische Planung)
- POST /api/schedule/generate → { startDate (ISO), endDate (ISO) } → Plant alle offenen Todos automatisch ein
- GET /api/schedule?date=ISO → Tagesplan abrufen

## Regeln
- Antworte IMMER auf Deutsch
- Halte Antworten kurz und klar
- Nutze curl um API-Calls zu machen
- Wenn der Nutzer einen Termin nennt, erstelle ihn direkt
- Wenn der Nutzer eine Aufgabe nennt, erstelle sie direkt
- Zeige nach dem Erstellen eine kurze Bestätigung
- Datums-Kontext: Nutze das aktuelle Datum als Referenz
- Lies CLAUDE.md um Nils zu kennen

## Langzeit-Gedächtnis (CLAUDE.md)
Du kannst CLAUDE.md lesen und aktualisieren wenn Nils dauerhafte Infos nennt.
Bestätige mit "🧠 Gemerkt: ..."

## Wichtig
- Führe die API-Calls IMMER aus, antworte nicht nur theoretisch
`;

interface ConversationMessage {
  role: 'user' | 'assistant';
  text: string;
  timestamp: number;
}

const conversations = new Map<string, ConversationMessage[]>();
const MAX_HISTORY = 10;
const EXPIRE_MS = 2 * 60 * 60 * 1000;

function getContext(sessionId: string): string {
  const messages = conversations.get(sessionId);
  if (!messages || messages.length === 0) return '';

  const lastMsg = messages[messages.length - 1];
  if (Date.now() - lastMsg.timestamp > EXPIRE_MS) {
    conversations.set(sessionId, []);
    return '';
  }

  const lines = messages.map((m) =>
    m.role === 'user' ? `Nils: ${m.text}` : `Assistent: ${m.text}`
  );
  return `## Bisheriger Gesprächsverlauf\n${lines.join('\n')}\n\n---\n`;
}

function addMessage(sessionId: string, role: 'user' | 'assistant', text: string): void {
  if (!conversations.has(sessionId)) {
    conversations.set(sessionId, []);
  }
  const msgs = conversations.get(sessionId)!;
  msgs.push({ role, text, timestamp: Date.now() });
  if (msgs.length > MAX_HISTORY * 2) {
    msgs.splice(0, msgs.length - MAX_HISTORY * 2);
  }
}

export function clearConversation(sessionId: string): void {
  conversations.set(sessionId, []);
}

export function askClaude(userMessage: string, sessionId: string): Promise<string> {
  addMessage(sessionId, 'user', userMessage);
  const context = getContext(sessionId);

  return new Promise((resolve, reject) => {
    const fullPrompt = context
      ? `${context}\nNils: ${userMessage}\n\nBitte antworte auf die aktuelle Nachricht von Nils. Beziehe dich auf den bisherigen Gesprächsverlauf wenn relevant.`
      : userMessage;

    const args = [
      '-p', fullPrompt,
      '--system-prompt', SYSTEM_PROMPT,
      '--allowedTools', 'bash',
      '--max-turns', '5',
      '--dangerously-skip-permissions',
    ];

    const claudePath = process.env.CLAUDE_PATH || '/opt/homebrew/bin/claude';
    const projectDir = process.env.PROJECT_DIR || process.cwd();

    const proc = spawn(claudePath, args, {
      cwd: projectDir,
      timeout: TIMEOUT_MS,
      env: { ...process.env, FORCE_COLOR: '0', PATH: process.env.PATH + ':/opt/homebrew/bin:/usr/local/bin' },
    });

    let stdout = '';
    let stderr = '';

    proc.stdout.on('data', (data: Buffer) => { stdout += data.toString(); });
    proc.stderr.on('data', (data: Buffer) => { stderr += data.toString(); });

    proc.on('close', (code) => {
      const cleaned = cleanResponse(stdout.trim());
      if (cleaned) {
        addMessage(sessionId, 'assistant', cleaned);
        resolve(cleaned);
      } else {
        reject(new Error(`Claude exited with code ${code}: ${stderr}`));
      }
    });

    proc.on('error', (err) => {
      reject(new Error(`Claude konnte nicht gestartet werden: ${err.message}`));
    });

    setTimeout(() => {
      proc.kill('SIGTERM');
      const partial = cleanResponse(stdout.trim());
      if (partial) {
        addMessage(sessionId, 'assistant', partial);
        resolve(partial);
      } else {
        reject(new Error('Claude antwortet gerade nicht. Versuch es in 1-2 Minuten nochmal.'));
      }
    }, TIMEOUT_MS);
  });
}

function cleanResponse(text: string): string {
  return text
    .replace(/\x1b\[[0-9;]*m/g, '')
    .replace(/\x1b\[[0-9;]*[A-Za-z]/g, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}
