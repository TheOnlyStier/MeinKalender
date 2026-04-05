import { Router, Request, Response } from 'express';
import { askClaude, clearConversation } from '../services/claudeBridge';
import { tryFastCommand } from '../services/fastCommands';

const router = Router();

// POST /api/chat – Nachricht verarbeiten (Fast Commands → Claude Fallback)
router.post('/', async (req: Request, res: Response) => {
  const { message, sessionId } = req.body;
  if (!message) {
    res.status(400).json({ error: 'message is required' });
    return;
  }

  const session = sessionId || 'web-default';

  try {
    // 1. Fast Commands versuchen (sofortige Antwort)
    const fastResult = await tryFastCommand(message);
    if (fastResult) {
      res.json({ response: fastResult.response, fast: true });
      return;
    }

    // 2. Fallback: Claude für komplexe Anfragen
    const response = await askClaude(message, session);
    res.json({ response, fast: false });
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : 'Unbekannter Fehler';
    res.status(500).json({ error: errorMsg });
  }
});

// DELETE /api/chat – Konversation zurücksetzen
router.delete('/', (req: Request, res: Response) => {
  const sessionId = (req.query.sessionId as string) || 'web-default';
  clearConversation(sessionId);
  res.json({ ok: true });
});

export default router;
