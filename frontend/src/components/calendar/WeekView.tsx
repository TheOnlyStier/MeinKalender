import React from 'react';
import { TimeGrid } from './TimeGrid';
import { CalendarEvent } from '../../stores/useEventStore';
import { Todo } from '../../stores/useTodoStore';
import { getWeekDays } from '../../utils/dateUtils';

interface Props {
  selectedDate: Date;
  events: CalendarEvent[];
  scheduledTodos: Todo[];
  onTimeClick?: (date: Date, hour: number) => void;
  onTodoComplete?: (id: string) => void;
}

export const WeekView: React.FC<Props> = ({ selectedDate, events, scheduledTodos, onTimeClick, onTodoComplete }) => {
  const weekDays = getWeekDays(selectedDate);

  return (
    <div className="flex overflow-auto">
      {/* Time labels column */}
      <div className="w-16 flex-shrink-0" />

      {/* Day columns */}
      <div className="grid grid-cols-7 flex-1 divide-x divide-gray-100">
        {weekDays.map((day) => (
          <div key={day.toISOString()} className="relative min-w-[120px]">
            <TimeGrid
              date={day}
              events={events}
              scheduledTodos={scheduledTodos}
              onTimeClick={onTimeClick}
              onTodoComplete={onTodoComplete}
            />
          </div>
        ))}
      </div>
    </div>
  );
};
