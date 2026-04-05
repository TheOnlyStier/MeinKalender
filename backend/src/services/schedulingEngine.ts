import { TodoDoc } from '../models/Todo';
import { EventDoc } from '../models/Event';

interface TimeSlot {
  start: Date;
  end: Date;
  durationMinutes: number;
}

interface ScheduleResult {
  todoId: string;
  todoTitle: string;
  priority: string;
  start: Date;
  end: Date;
}

interface ScheduleOptions {
  workDayStart: number; // hour (0-23)
  workDayEnd: number;
  bufferMinutes: number;
  minBlockMinutes: number;
  splitThresholdMinutes: number;
}

const DEFAULT_OPTIONS: ScheduleOptions = {
  workDayStart: 9,
  workDayEnd: 18,
  bufferMinutes: 5,
  minBlockMinutes: 15,
  splitThresholdMinutes: 60,
};

/**
 * Core scheduling algorithm:
 * 1. Build free time slots from work hours minus existing events
 * 2. Score and sort todos by priority + deadline urgency
 * 3. Greedy-assign todos into free slots (first-fit)
 * 4. Split large tasks if needed
 */
export function autoSchedule(
  todos: TodoDoc[],
  events: EventDoc[],
  startDate: Date,
  endDate: Date,
  options: Partial<ScheduleOptions> = {}
): ScheduleResult[] {
  const opts = { ...DEFAULT_OPTIONS, ...options };

  // 1. Build free slots for each day in range
  const freeSlots = buildFreeSlots(startDate, endDate, events, opts);

  // 2. Score and sort todos
  const scoredTodos = todos
    .filter((t) => t.status !== 'done')
    .map((t) => ({ todo: t, score: scoreTodo(t, startDate) }))
    .sort((a, b) => b.score - a.score);

  // 3. Greedy assignment
  const results: ScheduleResult[] = [];

  for (const { todo } of scoredTodos) {
    let remainingMinutes = todo.estimatedMinutes;
    let blocksAssigned = 0;

    for (let i = 0; i < freeSlots.length && remainingMinutes > 0; i++) {
      const slot = freeSlots[i];
      if (slot.durationMinutes < opts.minBlockMinutes) continue;

      // If task fits entirely in this slot
      if (slot.durationMinutes >= remainingMinutes) {
        const blockEnd = new Date(slot.start.getTime() + remainingMinutes * 60000);
        results.push({
          todoId: todo._id.toString(),
          todoTitle: todo.title,
          priority: todo.priority,
          start: new Date(slot.start),
          end: blockEnd,
        });

        // Shrink the slot
        const newStart = new Date(blockEnd.getTime() + opts.bufferMinutes * 60000);
        slot.start = newStart;
        slot.durationMinutes = Math.floor((slot.end.getTime() - newStart.getTime()) / 60000);
        remainingMinutes = 0;
        break;
      }

      // Task is larger than slot -> split if allowed
      if (todo.estimatedMinutes >= opts.splitThresholdMinutes && blocksAssigned < 3) {
        const blockMinutes = slot.durationMinutes;
        results.push({
          todoId: todo._id.toString(),
          todoTitle: todo.title,
          priority: todo.priority,
          start: new Date(slot.start),
          end: new Date(slot.end),
        });
        remainingMinutes -= blockMinutes;
        slot.durationMinutes = 0;
        blocksAssigned++;
      }
    }
  }

  return results;
}

/**
 * Build list of free time slots across the date range.
 */
function buildFreeSlots(
  startDate: Date,
  endDate: Date,
  events: EventDoc[],
  opts: ScheduleOptions
): TimeSlot[] {
  const slots: TimeSlot[] = [];
  const current = new Date(startDate);
  current.setHours(0, 0, 0, 0);

  const end = new Date(endDate);
  end.setHours(23, 59, 59, 999);

  while (current <= end) {
    const dayStart = new Date(current);
    dayStart.setHours(opts.workDayStart, 0, 0, 0);

    const dayEnd = new Date(current);
    dayEnd.setHours(opts.workDayEnd, 0, 0, 0);

    // Get events for this day, sorted by start
    const dayEvents = events
      .filter((e) => {
        const eStart = new Date(e.start);
        const eEnd = new Date(e.end);
        return eStart < dayEnd && eEnd > dayStart;
      })
      .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());

    // Carve out free slots around events
    let cursor = dayStart.getTime();

    for (const event of dayEvents) {
      const eventStart = Math.max(new Date(event.start).getTime(), dayStart.getTime());
      const eventEnd = Math.min(new Date(event.end).getTime(), dayEnd.getTime());

      if (cursor < eventStart - opts.bufferMinutes * 60000) {
        const slotEnd = eventStart - opts.bufferMinutes * 60000;
        const durationMinutes = Math.floor((slotEnd - cursor) / 60000);
        if (durationMinutes >= opts.minBlockMinutes) {
          slots.push({
            start: new Date(cursor),
            end: new Date(slotEnd),
            durationMinutes,
          });
        }
      }
      cursor = eventEnd + opts.bufferMinutes * 60000;
    }

    // Remaining time after last event
    if (cursor < dayEnd.getTime()) {
      const durationMinutes = Math.floor((dayEnd.getTime() - cursor) / 60000);
      if (durationMinutes >= opts.minBlockMinutes) {
        slots.push({
          start: new Date(cursor),
          end: dayEnd,
          durationMinutes,
        });
      }
    }

    current.setDate(current.getDate() + 1);
  }

  return slots;
}

/**
 * Score a todo for scheduling priority.
 * Higher score = scheduled earlier.
 */
function scoreTodo(todo: TodoDoc, referenceDate: Date): number {
  // Priority weight (40%)
  const priorityScores: Record<string, number> = { high: 100, medium: 50, low: 25 };
  const priorityWeight = (priorityScores[todo.priority] || 50) * 0.4;

  // Deadline urgency (40%)
  let deadlineWeight = 0;
  if (todo.deadline) {
    const daysUntil = Math.max(
      0,
      (new Date(todo.deadline).getTime() - referenceDate.getTime()) / (1000 * 60 * 60 * 24)
    );
    deadlineWeight = Math.max(0, 100 - daysUntil * 10) * 0.4;
  }

  // Duration preference (20%) - shorter tasks get slight boost for quick wins
  const durationWeight = Math.max(0, 100 - todo.estimatedMinutes) * 0.2;

  return priorityWeight + deadlineWeight + durationWeight;
}
