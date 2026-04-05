import React from 'react';
import { TimeGrid } from './TimeGrid';
import { TimeLabels } from './TimeLabels';
import { CalendarEvent } from '../../stores/useEventStore';
import { Todo } from '../../stores/useTodoStore';
import { getWeekDays } from '../../utils/dateUtils';

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

export const WeekView: React.FC<Props> = ({
  selectedDate, events, scheduledTodos, onTimeClick, onTodoComplete, onEventEdit, onEventResize, onTemplateDrop,
}) => {
  const weekDays = getWeekDays(selectedDate);

  return (
    <div className="flex">
      <TimeLabels />
      <div className="grid grid-cols-7 flex-1">
        {weekDays.map((day) => (
          <div key={day.toISOString()} className="relative min-w-[120px]">
            <TimeGrid
              date={day}
              events={events}
              scheduledTodos={scheduledTodos}
              onTimeClick={onTimeClick}
              onTodoComplete={onTodoComplete}
              onEventEdit={onEventEdit}
              onEventResize={onEventResize}
              onTemplateDrop={onTemplateDrop}
            />
          </div>
        ))}
      </div>
    </div>
  );
};
