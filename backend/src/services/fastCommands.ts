/**
 * Fast command parser – verarbeitet häufige Anfragen direkt ohne Claude.
 * Gibt null zurück wenn die Anfrage zu komplex ist → Fallback auf Claude.
 * Unterstützt Tag-Erkennung für konsistente Namen, Farben und Dauern.
 */

import { Tag, TagDoc } from '../models/Tag';

const API_BASE = 'http://localhost:3001';

interface FastResult {
  response: string;
  action?: string;
}

interface MatchedTag {
  tag: TagDoc;
  matchedOn: string; // Welcher Name/Alias gematcht hat
}

// Tag-Cache (wird alle 60s neu geladen)
let tagCache: TagDoc[] = [];
let tagCacheTime = 0;

async function getTags(): Promise<TagDoc[]> {
  if (Date.now() - tagCacheTime > 60_000) {
    tagCache = await Tag.find();
    tagCacheTime = Date.now();
  }
  return tagCache;
}

/** Sucht den besten Tag-Match im Text */
async function findTag(text: string): Promise<MatchedTag | null> {
  const tags = await getTags();
  const lower = text.toLowerCase();

  // Erst exakten Namen matchen, dann Aliases (längste zuerst für beste Matches)
  const allMatches: { tag: TagDoc; matchedOn: string; length: number }[] = [];

  for (const tag of tags) {
    if (lower.includes(tag.name.toLowerCase())) {
      allMatches.push({ tag, matchedOn: tag.name, length: tag.name.length });
    }
    for (const alias of tag.aliases) {
      if (lower.includes(alias.toLowerCase())) {
        allMatches.push({ tag, matchedOn: alias, length: alias.length });
      }
    }
  }

  if (allMatches.length === 0) return null;

  // Längster Match gewinnt (z.B. "Trade-Bewertung" > "Trade")
  allMatches.sort((a, b) => b.length - a.length);
  return { tag: allMatches[0].tag, matchedOn: allMatches[0].matchedOn };
}

/** Usage Count erhöhen */
async function incrementTagUsage(tagId: string): Promise<void> {
  await Tag.findByIdAndUpdate(tagId, { $inc: { usageCount: 1 } });
  tagCacheTime = 0; // Cache invalidieren
}

export async function tryFastCommand(message: string): Promise<FastResult | null> {
  const msg = message.toLowerCase().trim();

  // --- Heute / Was steht an ---
  if (matches(msg, ['was steht heute an', 'was steht an', 'heute', 'mein tag', 'tagesplan', 'was habe ich heute'])) {
    return await getToday();
  }

  // --- Offene Tasks ---
  if (matches(msg, ['offene aufgaben', 'offene tasks', 'meine aufgaben', 'meine tasks', 'was muss ich', 'todo liste'])) {
    return await getOpenTasks();
  }

  // --- Termin erstellen ---
  const eventMatch = await parseEventCreation(message);
  if (eventMatch) {
    return await createEvent(eventMatch);
  }

  // --- Aufgabe erstellen ---
  const taskMatch = await parseTaskCreation(message);
  if (taskMatch) {
    return await createTask(taskMatch);
  }

  // --- Aufgabe erledigt ---
  if (msg.includes('erledigt') || msg.includes('fertig') || msg.includes('done') || msg.includes('abgehakt')) {
    const titlePart = message.replace(/ist\s*(erledigt|fertig|done|abgehakt)/i, '').replace(/(erledigt|fertig|done|abgehakt)/i, '').trim();
    if (titlePart.length > 2) {
      return await completeTask(titlePart);
    }
  }

  return null;
}

// === Hilfsfunktionen ===

function matches(msg: string, patterns: string[]): boolean {
  return patterns.some((p) => msg.includes(p));
}

async function apiGet(path: string) {
  const res = await fetch(`${API_BASE}${path}`);
  return res.json();
}

async function apiPost(path: string, body: unknown) {
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  return res.json();
}

async function apiPatch(path: string) {
  const res = await fetch(`${API_BASE}${path}`, { method: 'PATCH' });
  return res.json();
}

// === Aktionen ===

async function getToday(): Promise<FastResult> {
  const today = new Date();
  const start = new Date(today); start.setHours(0, 0, 0, 0);
  const end = new Date(today); end.setHours(23, 59, 59, 999);

  const [events, todos] = await Promise.all([
    apiGet(`/api/events?start=${start.toISOString()}&end=${end.toISOString()}`),
    apiGet('/api/todos'),
  ]);

  const scheduledTodos = (todos as any[]).filter((t: any) => t.status === 'scheduled' && t.scheduledStart);
  const openTodos = (todos as any[]).filter((t: any) => t.status === 'inbox');
  const dayName = today.toLocaleDateString('de-DE', { weekday: 'long', day: 'numeric', month: 'long' });

  let text = `📅 **${dayName}**\n\n`;

  if ((events as any[]).length === 0 && scheduledTodos.length === 0) {
    text += '✨ Keine Termine heute!\n';
  } else {
    if ((events as any[]).length > 0) {
      text += '📌 **Termine:**\n';
      for (const e of events as any[]) {
        const s = new Date(e.start).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
        const en = new Date(e.end).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
        text += `  • ${s}–${en} ${e.title}\n`;
      }
      text += '\n';
    }
    if (scheduledTodos.length > 0) {
      text += '✅ **Geplante Tasks:**\n';
      for (const t of scheduledTodos) {
        const s = new Date(t.scheduledStart).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
        text += `  • ${s} ${t.title} (${t.estimatedMinutes}min)\n`;
      }
      text += '\n';
    }
  }

  if (openTodos.length > 0) {
    text += `📋 **${openTodos.length} offene Aufgaben:**\n`;
    for (const t of openTodos.slice(0, 5)) {
      const prio = t.priority === 'high' ? '🔴' : t.priority === 'medium' ? '🟡' : '🔵';
      text += `  ${prio} ${t.title} (${t.estimatedMinutes}min)\n`;
    }
    if (openTodos.length > 5) text += `  ... und ${openTodos.length - 5} weitere\n`;
  }

  return { response: text.trim(), action: 'getToday' };
}

async function getOpenTasks(): Promise<FastResult> {
  const todos = await apiGet('/api/todos?status=inbox') as any[];

  if (todos.length === 0) {
    return { response: '✨ Keine offenen Aufgaben! Alles erledigt.' };
  }

  let text = `📋 **${todos.length} offene Aufgaben:**\n\n`;
  for (const t of todos) {
    const prio = t.priority === 'high' ? '🔴 Hoch' : t.priority === 'medium' ? '🟡 Mittel' : '🔵 Niedrig';
    const deadline = t.deadline ? ` (fällig: ${new Date(t.deadline).toLocaleDateString('de-DE')})` : '';
    text += `• **${t.title}** – ${t.estimatedMinutes}min, ${prio}${deadline}\n`;
  }

  return { response: text.trim(), action: 'getOpenTasks' };
}

interface ParsedEvent {
  title: string;
  date: Date;
  startHour: number;
  startMinute: number;
  durationMinutes: number;
  color?: string;
  tagId?: string;
}

async function parseEventCreation(message: string): Promise<ParsedEvent | null> {
  const msg = message.trim();

  const date = parseRelativeDate(msg);
  if (!date) return null;

  const timeMatch = msg.match(/(\d{1,2})[:\.]?(\d{2})?\s*(?:uhr)?/i);
  if (!timeMatch) return null;
  const startHour = parseInt(timeMatch[1]);
  const startMinute = parseInt(timeMatch[2] || '0');
  if (startHour > 23 || startMinute > 59) return null;

  // Tag matchen
  const tagMatch = await findTag(msg);

  // Dauer: Tag-Default oder aus Nachricht
  let durationMinutes = tagMatch ? tagMatch.tag.defaultMinutes : 60;
  const durationMatch = msg.match(/(\d+(?:[.,]\d+)?)\s*(stunde|stunden|h|std|minute|minuten|min|m)\b/i);
  if (durationMatch) {
    const val = parseFloat(durationMatch[1].replace(',', '.'));
    const unit = durationMatch[2].toLowerCase();
    durationMinutes = unit.startsWith('m') ? Math.round(val) : Math.round(val * 60);
  }

  // Titel: Tag-Name oder aus Nachricht parsen
  let title: string;
  if (tagMatch) {
    title = tagMatch.tag.name; // Immer den offiziellen Tag-Namen verwenden
  } else {
    title = msg
      .replace(/morgen|übermorgen|heute|montag|dienstag|mittwoch|donnerstag|freitag|samstag|sonntag/gi, '')
      .replace(/(\d{1,2})[:\.]?(\d{2})?\s*(?:uhr)?/i, '')
      .replace(/(\d+(?:[.,]\d+)?)\s*(stunde|stunden|h|std|minute|minuten|min|m)\b/i, '')
      .replace(/[,;]/g, '')
      .replace(/termin\s*/i, '')
      .replace(/um\s*/i, '')
      .trim();

    if (title.length < 2) return null;
    title = title.charAt(0).toUpperCase() + title.slice(1);
  }

  return {
    title,
    date,
    startHour,
    startMinute,
    durationMinutes,
    color: tagMatch?.tag.color,
    tagId: tagMatch?.tag._id.toString(),
  };
}

async function createEvent(parsed: ParsedEvent): Promise<FastResult> {
  const start = new Date(parsed.date);
  start.setHours(parsed.startHour, parsed.startMinute, 0, 0);
  const end = new Date(start.getTime() + parsed.durationMinutes * 60000);

  await apiPost('/api/events', {
    title: parsed.title,
    start: start.toISOString(),
    end: end.toISOString(),
    color: parsed.color,
    isAllDay: false,
  });

  // Tag-Usage erhöhen
  if (parsed.tagId) {
    await incrementTagUsage(parsed.tagId);
  }

  const dayStr = start.toLocaleDateString('de-DE', { weekday: 'short', day: 'numeric', month: 'short' });
  const startStr = start.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
  const endStr = end.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });

  const tagInfo = parsed.tagId ? ' 🏷' : '';

  return {
    response: `✅ Termin erstellt: **${parsed.title}**${tagInfo}\n📅 ${dayStr}, ${startStr}–${endStr}`,
    action: 'createEvent',
  };
}

interface ParsedTask {
  title: string;
  priority: 'high' | 'medium' | 'low';
  estimatedMinutes: number;
  deadline?: string;
}

async function parseTaskCreation(message: string): Promise<ParsedTask | null> {
  const msg = message.trim();

  if (!/aufgabe|task|todo/i.test(msg)) return null;

  let title = msg.replace(/.*(?:aufgabe|task|todo)\s*[:.]?\s*/i, '').trim();

  let priority: 'high' | 'medium' | 'low' = 'medium';
  if (/hoch|high|wichtig|dringend/i.test(msg)) {
    priority = 'high';
    title = title.replace(/\s*(hoch|high|wichtig|dringend|hohe?\s*prio(?:rität)?)\s*/gi, ' ').trim();
  } else if (/niedrig|low|unwichtig/i.test(msg)) {
    priority = 'low';
    title = title.replace(/\s*(niedrig|low|unwichtig|niedrige?\s*prio(?:rität)?)\s*/gi, ' ').trim();
  }

  // Tag matchen für Standard-Dauer
  const tagMatch = await findTag(title);
  let estimatedMinutes = tagMatch ? tagMatch.tag.defaultMinutes : 30;

  const durMatch = msg.match(/(\d+(?:[.,]\d+)?)\s*(stunde|stunden|h|std|minute|minuten|min|m)\b/i);
  if (durMatch) {
    const val = parseFloat(durMatch[1].replace(',', '.'));
    const unit = durMatch[2].toLowerCase();
    estimatedMinutes = unit.startsWith('m') ? Math.round(val) : Math.round(val * 60);
    title = title.replace(durMatch[0], '').trim();
  }

  // Tag-Name als Titel verwenden wenn gematcht
  if (tagMatch) {
    title = tagMatch.tag.name;
    await incrementTagUsage(tagMatch.tag._id.toString());
  }

  title = title.replace(/[,;]+/g, '').replace(/\s{2,}/g, ' ').trim();
  if (title.length < 2) return null;
  title = title.charAt(0).toUpperCase() + title.slice(1);

  return { title, priority, estimatedMinutes };
}

async function createTask(parsed: ParsedTask): Promise<FastResult> {
  await apiPost('/api/todos', {
    title: parsed.title,
    priority: parsed.priority,
    estimatedMinutes: parsed.estimatedMinutes,
    deadline: parsed.deadline,
  });

  const prioLabel = parsed.priority === 'high' ? '🔴 Hoch' : parsed.priority === 'medium' ? '🟡 Mittel' : '🔵 Niedrig';
  const durLabel = parsed.estimatedMinutes >= 60
    ? `${Math.floor(parsed.estimatedMinutes / 60)}h${parsed.estimatedMinutes % 60 > 0 ? ` ${parsed.estimatedMinutes % 60}min` : ''}`
    : `${parsed.estimatedMinutes}min`;

  return {
    response: `📋 Aufgabe erstellt: **${parsed.title}**\n⏱ ${durLabel} · ${prioLabel}`,
    action: 'createTask',
  };
}

async function completeTask(titleSearch: string): Promise<FastResult> {
  const todos = await apiGet('/api/todos') as any[];
  const search = titleSearch.toLowerCase();

  // Auch Tags matchen beim Suchen
  const tagMatch = await findTag(titleSearch);
  const searchTerms = tagMatch
    ? [search, tagMatch.tag.name.toLowerCase(), ...tagMatch.tag.aliases.map(a => a.toLowerCase())]
    : [search];

  const match = todos.find((t: any) =>
    t.status !== 'done' && searchTerms.some(s => t.title.toLowerCase().includes(s))
  );

  if (!match) {
    return { response: `❓ Keine offene Aufgabe gefunden die "${titleSearch}" enthält.` };
  }

  await apiPatch(`/api/todos/${match._id}/complete`);
  return {
    response: `✅ Erledigt: **${match.title}**`,
    action: 'completeTask',
  };
}

function parseRelativeDate(msg: string): Date | null {
  const lower = msg.toLowerCase();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (lower.includes('heute')) return today;
  if (lower.includes('morgen')) {
    const d = new Date(today);
    d.setDate(d.getDate() + 1);
    return d;
  }
  if (lower.includes('übermorgen')) {
    const d = new Date(today);
    d.setDate(d.getDate() + 2);
    return d;
  }

  const days: Record<string, number> = {
    montag: 1, dienstag: 2, mittwoch: 3, donnerstag: 4,
    freitag: 5, samstag: 6, sonntag: 0,
  };
  for (const [name, targetDay] of Object.entries(days)) {
    if (lower.includes(name)) {
      const d = new Date(today);
      const currentDay = d.getDay();
      let diff = targetDay - currentDay;
      if (diff <= 0) diff += 7;
      d.setDate(d.getDate() + diff);
      return d;
    }
  }

  return null;
}
