import React, { useEffect, useState } from 'react';
import { CalendarHeader } from '../components/calendar/CalendarHeader';
import { WeekView } from '../components/calendar/WeekView';
import { DayView } from '../components/calendar/DayView';
import { EventForm } from '../components/calendar/EventForm';
import { Modal } from '../components/shared/Modal';
import { useUIStore } from '../stores/useUIStore';
import { useEventStore } from '../stores/useEventStore';
import { useTodoStore } from '../stores/useTodoStore';
import { getWeekRange } from '../utils/dateUtils';

export const CalendarPage: React.FC = () => {
  const { selectedDate, currentView } = useUIStore();
  const { events, fetchEvents } = useEventStore();
  const { todos, fetchTodos } = useTodoStore();
  const [showEventForm, setShowEventForm] = useState(false);
  const [eventFormDate, setEventFormDate] = useState<Date>();
  const [eventFormHour, setEventFormHour] = useState<number>();

  const scheduledTodos = todos.filter((t) => t.status === 'scheduled');

  useEffect(() => {
    const { start, end } = getWeekRange(selectedDate);
    fetchEvents(start, end);
    fetchTodos();
  }, [selectedDate, fetchEvents, fetchTodos]);

  const handleTimeClick = (date: Date, hour: number) => {
    setEventFormDate(date);
    setEventFormHour(hour);
    setShowEventForm(true);
  };

  return (
    <div className="flex flex-col h-full">
      <CalendarHeader />

      <div className="flex-1 overflow-auto">
        {currentView === 'week' ? (
          <WeekView
            selectedDate={selectedDate}
            events={events}
            scheduledTodos={scheduledTodos}
            onTimeClick={handleTimeClick}
          />
        ) : (
          <DayView
            selectedDate={selectedDate}
            events={events}
            scheduledTodos={scheduledTodos}
            onTimeClick={handleTimeClick}
          />
        )}
      </div>

      <Modal isOpen={showEventForm} onClose={() => setShowEventForm(false)} title="Neuer Termin">
        <EventForm
          initialDate={eventFormDate}
          initialHour={eventFormHour}
          onClose={() => setShowEventForm(false)}
        />
      </Modal>
    </div>
  );
};
