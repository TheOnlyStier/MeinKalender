import { Router, Request, Response } from 'express';
import { askClaude, clearConversation } from '../services/claudeBridge';

const router = Router();

// POST /api/chat – Nachricht an Claude senden
router.post('/', async (req: Request, res: Response) => {
  const { message, sessionId } = req.body;
  if (!message) {
    res.status(400).json({ error: 'message is required' });
    return;
  }

  const session = sessionId || 'web-default';

  try {
    const response = await askClaude(message, session);
    res.json({ response });
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
