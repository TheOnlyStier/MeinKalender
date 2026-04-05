interface Message {
  role: 'user' | 'assistant';
  text: string;
  timestamp: number;
}

const MAX_HISTORY = 10; // Letzte 10 Nachrichten-Paare behalten
const EXPIRE_MS = 2 * 60 * 60 * 1000; // Nach 2h Konversation zurücksetzen

class ConversationMemory {
  private history: Map<number, Message[]> = new Map();

  /** Nachricht zum Verlauf hinzufügen */
  add(chatId: number, role: 'user' | 'assistant', text: string): void {
    if (!this.history.has(chatId)) {
      this.history.set(chatId, []);
    }
    const messages = this.history.get(chatId)!;
    messages.push({ role, text, timestamp: Date.now() });

    // Alte Nachrichten entfernen
    if (messages.length > MAX_HISTORY * 2) {
      messages.splice(0, messages.length - MAX_HISTORY * 2);
    }
  }

  /** Verlauf als Kontext-String für Claude formatieren */
  getContext(chatId: number): string {
    const messages = this.history.get(chatId);
    if (!messages || messages.length === 0) return '';

    // Abgelaufene Konversationen löschen
    const lastMsg = messages[messages.length - 1];
    if (Date.now() - lastMsg.timestamp > EXPIRE_MS) {
      this.history.set(chatId, []);
      return '';
    }

    const lines = messages.map((m) =>
      m.role === 'user' ? `Nils: ${m.text}` : `Assistent: ${m.text}`
    );

    return `## Bisheriger Gesprächsverlauf\n${lines.join('\n')}\n\n---\n`;
  }

  /** Konversation zurücksetzen */
  clear(chatId: number): void {
    this.history.set(chatId, []);
  }
}

export const memory = new ConversationMemory();
