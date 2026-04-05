import { Router, Request, Response } from 'express';
import { Todo } from '../models/Todo';

const router = Router();

// GET /api/todos?status=...
router.get('/', async (req: Request, res: Response) => {
  const filter: Record<string, unknown> = {};
  if (req.query.status) filter.status = req.query.status;
  const todos = await Todo.find(filter).sort({ priority: 1, createdAt: -1 });
  res.json(todos);
});

// POST /api/todos
router.post('/', async (req: Request, res: Response) => {
  const todo = await Todo.create(req.body);
  res.status(201).json(todo);
});

// PUT /api/todos/:id
router.put('/:id', async (req: Request, res: Response) => {
  const todo = await Todo.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!todo) return res.status(404).json({ error: 'Todo not found' });
  res.json(todo);
});

// PATCH /api/todos/:id/complete
router.patch('/:id/complete', async (req: Request, res: Response) => {
  const todo = await Todo.findByIdAndUpdate(
    req.params.id,
    { status: 'done', completedAt: new Date() },
    { new: true }
  );
  if (!todo) return res.status(404).json({ error: 'Todo not found' });
  res.json(todo);
});

// DELETE /api/todos/:id
router.delete('/:id', async (req: Request, res: Response) => {
  const todo = await Todo.findByIdAndDelete(req.params.id);
  if (!todo) return res.status(404).json({ error: 'Todo not found' });
  res.status(204).send();
});

export default router;
