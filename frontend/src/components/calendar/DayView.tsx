import React from 'react';
import { TimeGrid } from './TimeGrid';
import { CalendarEvent } from '../../stores/useEventStore';
import { Todo } from '../../stores/useTodoStore';

interface Props {
  selectedDate: Date;
  events: CalendarEvent[];
  scheduledTodos: Todo[];
  onTimeClick?: (date: Date, hour: number) => void;
  onTodoComplete?: (id: string) => void;
}

export const DayView: React.FC<Props> = ({ selectedDate, events, scheduledTodos, onTimeClick, onTodoComplete }) => {
  return (
    <div className="flex overflow-auto">
      <div className="flex-1 pl-16 relative">
        <TimeGrid
          date={selectedDate}
          events={events}
          scheduledTodos={scheduledTodos}
          onTimeClick={onTimeClick}
          onTodoComplete={onTodoComplete}
        />
      </div>
    </div>
  );
};
