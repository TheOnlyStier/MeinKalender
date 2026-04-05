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
  onEventEdit?: (event: CalendarEvent) => void;
}

export const TimeGrid: React.FC<Props> = ({ date, events, scheduledTodos, onTimeClick, onTodoComplete, onEventEdit }) => {
  const dayEvents = events.filter((e) => isSameDay(e.start, date));
  const dayTodos = scheduledTodos.filter((t) => t.scheduledStart && isSameDay(t.scheduledStart, date));

  const totalHeight = HOURS.length * HOUR_HEIGHT + TOP_OFFSET;

  return (
    <div
      style={{
        position: 'relative',
        height: totalHeight,
        backgroundColor: '#ffffff',
        borderRight: '1px solid #c0c4cc',
        backgroundImage: `repeating-linear-gradient(
          to bottom,
          transparent,
          transparent ${HOUR_HEIGHT - 1}px,
          #c0c4cc ${HOUR_HEIGHT - 1}px,
          #c0c4cc ${HOUR_HEIGHT}px
        )`,
        backgroundPositionY: TOP_OFFSET,
      }}
    >
      {/* Clickable hour zones */}
      {HOURS.map((hour) => (
        <div
          key={hour}
          className="absolute w-full cursor-pointer hover:bg-blue-100/40 transition-colors"
          style={{
            top: (hour - START_HOUR) * HOUR_HEIGHT + TOP_OFFSET,
            height: HOUR_HEIGHT,
          }}
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
          onEdit={onEventEdit}
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
