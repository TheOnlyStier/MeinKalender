import React from 'react';
import { TimeGrid } from './TimeGrid';
import { TimeLabels } from './TimeLabels';
import { CalendarEvent } from '../../stores/useEventStore';
import { Todo } from '../../stores/useTodoStore';

interface Props {
  selectedDate: Date;
  events: CalendarEvent[];
  scheduledTodos: Todo[];
  onTimeClick?: (date: Date, hour: number) => void;
  onTodoComplete?: (id: string) => void;
  onEventEdit?: (event: CalendarEvent) => void;
  onEventResize?: (eventId: string, newEnd: string) => void;
  onTemplateDrop?: (date: Date, hour: number, template: { name: string; color: string; defaultMinutes: number }) => void;
}

export const DayView: React.FC<Props> = ({
  selectedDate, events, scheduledTodos, onTimeClick, onTodoComplete, onEventEdit, onEventResize, onTemplateDrop,
}) => {
  return (
    <div className="flex">
      <TimeLabels />
      <div className="flex-1 relative">
        <TimeGrid
          date={selectedDate}
          events={events}
          scheduledTodos={scheduledTodos}
          onTimeClick={onTimeClick}
          onTodoComplete={onTodoComplete}
          onEventEdit={onEventEdit}
          onEventResize={onEventResize}
          onTemplateDrop={onTemplateDrop}
        />
      </div>
    </div>
  );
};
