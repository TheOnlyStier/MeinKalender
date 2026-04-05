import React from 'react';
import { CalendarEvent } from '../../stores/useEventStore';
import { Todo } from '../../stores/useTodoStore';
import { EventBlock } from './EventBlock';
import { ScheduledTaskBlock } from './ScheduledTaskBlock';
import { getTimePosition, getDurationHours, isSameDay } from '../../utils/dateUtils';

const START_HOUR = 0;
const END_HOUR = 24;
const HOURS = Array.from({ length: END_HOUR - START_HOUR }, (_, i) => START_HOUR + i);
const HOUR_HEIGHT = 64;
const TOP_OFFSET = 20;

interface Props {
  date: Date;
  events: CalendarEvent[];
  scheduledTodos: Todo[];
  onTimeClick?: (date: Date, hour: number) => void;
  onTodoComplete?: (id: string) => void;
}

export const TimeGrid: React.FC<Props> = ({ date, events, scheduledTodos, onTimeClick, onTodoComplete }) => {
  const dayEvents = events.filter((e) => isSameDay(e.start, date));
  const dayTodos = scheduledTodos.filter((t) => t.scheduledStart && isSameDay(t.scheduledStart, date));

  return (
    <div className="relative" style={{ height: HOURS.length * HOUR_HEIGHT + TOP_OFFSET }}>
      {/* Hour lines */}
      {HOURS.map((hour) => (
        <div
          key={hour}
          className="absolute w-full border-t border-gray-200 cursor-pointer hover:bg-blue-50/30 transition-colors"
          style={{ top: (hour - START_HOUR) * HOUR_HEIGHT + TOP_OFFSET, height: HOUR_HEIGHT }}
          onClick={() => onTimeClick?.(date, hour)}
        />
      ))}

      {/* Current time indicator */}
      <CurrentTimeIndicator />

      {/* Events */}
      {dayEvents.map((event) => (
        <EventBlock
          key={event._id}
          event={event}
          top={getTimePosition(event.start, START_HOUR) * HOUR_HEIGHT + TOP_OFFSET}
          height={getDurationHours(event.start, event.end) * HOUR_HEIGHT}
        />
      ))}

      {/* Scheduled Todos */}
      {dayTodos.map((todo) => (
        <ScheduledTaskBlock
          key={todo._id}
          todo={todo}
          top={getTimePosition(todo.scheduledStart!, START_HOUR) * HOUR_HEIGHT + TOP_OFFSET}
          height={getDurationHours(todo.scheduledStart!, todo.scheduledEnd!) * HOUR_HEIGHT}
          onComplete={() => onTodoComplete?.(todo._id)}
        />
      ))}
    </div>
  );
};

const CurrentTimeIndicator: React.FC = () => {
  const now = new Date();
  const pos = getTimePosition(now, START_HOUR);
  if (pos < 0 || pos > END_HOUR - START_HOUR) return null;

  return (
    <div
      className="absolute w-full z-20 pointer-events-none"
      style={{ top: pos * HOUR_HEIGHT + TOP_OFFSET }}
    >
      <div className="flex items-center">
        <div className="w-2.5 h-2.5 rounded-full bg-red-500 -ml-1.5" />
        <div className="flex-1 h-0.5 bg-red-500" />
      </div>
    </div>
  );
};
