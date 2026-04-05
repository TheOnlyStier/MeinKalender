import { Router, Request, Response } from 'express';
import { Tag } from '../models/Tag';

const router = Router();

// GET /api/tags – Alle Tags
router.get('/', async (_req: Request, res: Response) => {
  const tags = await Tag.find().sort({ usageCount: -1 });
  res.json(tags);
});

// POST /api/tags – Neuen Tag erstellen
router.post('/', async (req: Request, res: Response) => {
  const tag = await Tag.create(req.body);
  res.status(201).json(tag);
});

// PUT /api/tags/:id – Tag bearbeiten
router.put('/:id', async (req: Request, res: Response) => {
  const tag = await Tag.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!tag) return res.status(404).json({ error: 'Tag not found' });
  res.json(tag);
});

// DELETE /api/tags/:id – Tag löschen
router.delete('/:id', async (req: Request, res: Response) => {
  const tag = await Tag.findByIdAndDelete(req.params.id);
  if (!tag) return res.status(404).json({ error: 'Tag not found' });
  res.status(204).send();
});

// POST /api/tags/seed – Vordefinierte Tags anlegen
router.post('/seed', async (_req: Request, res: Response) => {
  const defaultTags = [
    {
      name: 'Gym',
      aliases: ['Fitness', 'Fitnessstudio', 'Training', 'Krafttraining', 'Gewichte'],
      color: '#10b981',
      defaultMinutes: 60,
      category: 'sport',
    },
    {
      name: 'Judo',
      aliases: ['Judotraining', 'Kampfsport'],
      color: '#ef4444',
      defaultMinutes: 120,
      category: 'sport',
    },
    {
      name: 'Arbeit',
      aliases: ['Demodern', 'Office', 'Büro', 'Arbeiten', 'Work'],
      color: '#3b82f6',
      defaultMinutes: 480,
      category: 'arbeit',
    },
    {
      name: 'Trading',
      aliases: ['Nasdaq', 'Trade', 'Traden', 'Börse', 'Markt'],
      color: '#f59e0b',
      defaultMinutes: 90,
      category: 'arbeit',
    },
    {
      name: 'Trade-Bewertung',
      aliases: ['Tradebewertung', 'Journal', 'Trading Journal', 'Bewertung'],
      color: '#f97316',
      defaultMinutes: 30,
      category: 'arbeit',
    },
    {
      name: 'Meditation',
      aliases: ['Meditieren', 'Achtsamkeit', 'Mindfulness'],
      color: '#8b5cf6',
      defaultMinutes: 0,
      category: 'persönlich',
    },
    {
      name: 'Mobility',
      aliases: ['Dehnen', 'Stretching', 'Dehnung', 'Mobilität'],
      color: '#06b6d4',
      defaultMinutes: 0,
      category: 'sport',
    },
    {
      name: 'Zahnarzt',
      aliases: ['Arzt', 'Arzttermin', 'Doktor'],
      color: '#ec4899',
      defaultMinutes: 0,
      category: 'gesundheit',
    },
    {
      name: 'Freundin',
      aliases: ['Bonn', 'Date', 'Abend mit Freundin'],
      color: '#f43f5e',
      defaultMinutes: 0,
      category: 'persönlich',
    },
    {
      name: 'Einkaufen',
      aliases: ['Shopping', 'Supermarkt', 'Einkauf', 'Lebensmittel'],
      color: '#84cc16',
      defaultMinutes: 0,
      category: 'persönlich',
    },
    {
      name: 'Kochen',
      aliases: ['Essen machen', 'Meal Prep'],
      color: '#f97316',
      defaultMinutes: 0,
      category: 'persönlich',
    },
    {
      name: 'Meeting',
      aliases: ['Call', 'Besprechung', 'Standup', 'Daily', 'Sync'],
      color: '#6366f1',
      defaultMinutes: 0,
      category: 'arbeit',
    },
  ];

  let created = 0;
  for (const tag of defaultTags) {
    const exists = await Tag.findOne({ name: tag.name });
    if (!exists) {
      await Tag.create(tag);
      created++;
    }
  }

  res.json({ message: `${created} Tags erstellt, ${defaultTags.length - created} existierten bereits` });
});

export default router;
