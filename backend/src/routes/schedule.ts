import { Router, Request, Response } from 'express';
import { Todo } from '../models/Todo';
import { Event } from '../models/Event';
import { autoSchedule } from '../services/schedulingEngine';

const router = Router();

// POST /api/schedule/generate - Run auto-scheduler
router.post('/generate', async (req: Request, res: Response) => {
  const {
    startDate,
    endDate,
    workDayStart,
    workDayEnd,
  } = req.body;

  const start = new Date(startDate || new Date());
  const end = new Date(endDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000));

  // Get all schedulable todos and events in range
  const [todos, events] = await Promise.all([
    Todo.find({ status: { $ne: 'done' } }),
    Event.find({
      start: { $lte: end },
      end: { $gte: start },
    }),
  ]);

  const results = autoSchedule(todos, events, start, end, { workDayStart, workDayEnd });

  // Update todos with their scheduled slots
  const bulkOps = results.map((r) => ({
    updateOne: {
      filter: { _id: r.todoId },
      update: {
        $set: {
          status: 'scheduled' as const,
          scheduledStart: r.start,
          scheduledEnd: r.end,
        },
      },
    },
  }));

  if (bulkOps.length > 0) {
    await Todo.bulkWrite(bulkOps);
  }

  // Clear schedule for todos that didn't get assigned
  const scheduledIds = results.map((r) => r.todoId);
  await Todo.updateMany(
    { status: 'scheduled', _id: { $nin: scheduledIds } },
    { $set: { status: 'inbox' }, $unset: { scheduledStart: 1, scheduledEnd: 1 } }
  );

  res.json({
    scheduled: results.length,
    blocks: results,
  });
});

// GET /api/schedule?date=... - Get schedule for a day
router.get('/', async (req: Request, res: Response) => {
  const date = req.query.date ? new Date(req.query.date as string) : new Date();
  const dayStart = new Date(date);
  dayStart.setHours(0, 0, 0, 0);
  const dayEnd = new Date(date);
  dayEnd.setHours(23, 59, 59, 999);

  const [scheduledTodos, events] = await Promise.all([
    Todo.find({
      status: 'scheduled',
      scheduledStart: { $gte: dayStart, $lte: dayEnd },
    }).sort({ scheduledStart: 1 }),
    Event.find({
      start: { $lte: dayEnd },
      end: { $gte: dayStart },
    }).sort({ start: 1 }),
  ]);

  res.json({ todos: scheduledTodos, events });
});

export default router;
