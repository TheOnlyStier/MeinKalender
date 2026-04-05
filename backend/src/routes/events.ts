import { Router, Request, Response } from 'express';
import { Event } from '../models/Event';

const router = Router();

// GET /api/events?start=...&end=...
router.get('/', async (req: Request, res: Response) => {
  const { start, end } = req.query;
  const filter: Record<string, unknown> = {};
  if (start && end) {
    filter.start = { $gte: new Date(start as string) };
    filter.end = { $lte: new Date(end as string) };
  }
  const events = await Event.find(filter).sort({ start: 1 });
  res.json(events);
});

// POST /api/events
router.post('/', async (req: Request, res: Response) => {
  const event = await Event.create(req.body);
  res.status(201).json(event);
});

// PUT /api/events/:id
router.put('/:id', async (req: Request, res: Response) => {
  const event = await Event.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!event) return res.status(404).json({ error: 'Event not found' });
  res.json(event);
});

// DELETE /api/events/:id
router.delete('/:id', async (req: Request, res: Response) => {
  const event = await Event.findByIdAndDelete(req.params.id);
  if (!event) return res.status(404).json({ error: 'Event not found' });
  res.status(204).send();
});

export default router;
