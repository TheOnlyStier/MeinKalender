import React, { useEffect, useState, useCallback } from 'react';
import { CalendarHeader } from '../components/calendar/CalendarHeader';
import { WeekView } from '../components/calendar/WeekView';
import { DayView } from '../components/calendar/DayView';
import { EventForm } from '../components/calendar/EventForm';
import { Modal } from '../components/shared/Modal';
import { useUIStore } from '../stores/useUIStore';
import { useEventStore, CalendarEvent } from '../stores/useEventStore';
import { useTodoStore } from '../stores/useTodoStore';
import { getWeekRange } from '../utils/dateUtils';

export const CalendarPage: React.FC = () => {
  const { selectedDate, currentView } = useUIStore();
  const { events, fetchEvents, createEvent, updateEvent } = useEventStore();
  const { todos, fetchTodos } = useTodoStore();
  const [showEventForm, setShowEventForm] = useState(false);
  const [eventFormDate, setEventFormDate] = useState<Date>();
  const [eventFormHour, setEventFormHour] = useState<number>();
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | undefined>();

  const scheduledTodos = todos.filter((t) => t.status === 'scheduled');

  useEffect(() => {
    const { start, end } = getWeekRange(selectedDate);
    fetchEvents(start, end);
    fetchTodos();
  }, [selectedDate, fetchEvents, fetchTodos]);

  const handleTimeClick = (date: Date, hour: number) => {
    setEditingEvent(undefined);
    setEventFormDate(date);
    setEventFormHour(hour);
    setShowEventForm(true);
  };

  const handleEventEdit = (event: CalendarEvent) => {
    setEditingEvent(event);
    setShowEventForm(true);
  };

  const handleFormClose = () => {
    setShowEventForm(false);
    setEditingEvent(undefined);
  };

  const handleEventResize = useCallback(async (eventId: string, newEnd: string) => {
    await updateEvent(eventId, { end: newEnd });
  }, [updateEvent]);

  const handleTemplateDrop = useCallback(async (
    date: Date,
    hour: number,
    template: { name: string; color: string; defaultMinutes: number }
  ) => {
    const startDate = new Date(date);
    const fullHour = Math.floor(hour);
    const minutes = Math.round((hour - fullHour) * 60);
    startDate.setHours(fullHour, minutes, 0, 0);

    const durationMinutes = template.defaultMinutes || 60;
    const endDate = new Date(startDate.getTime() + durationMinutes * 60 * 1000);

    await createEvent({
      title: template.name,
      start: startDate.toISOString(),
      end: endDate.toISOString(),
      color: template.color,
      isAllDay: false,
    });
  }, [createEvent]);

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
            onEventEdit={handleEventEdit}
            onEventResize={handleEventResize}
            onTemplateDrop={handleTemplateDrop}
          />
        ) : (
          <DayView
            selectedDate={selectedDate}
            events={events}
            scheduledTodos={scheduledTodos}
            onTimeClick={handleTimeClick}
            onEventEdit={handleEventEdit}
            onEventResize={handleEventResize}
            onTemplateDrop={handleTemplateDrop}
          />
        )}
      </div>

      <Modal
        isOpen={showEventForm}
        onClose={handleFormClose}
        title={editingEvent ? 'Termin bearbeiten' : 'Neuer Termin'}
      >
        <EventForm
          initialDate={eventFormDate}
          initialHour={eventFormHour}
          editEvent={editingEvent}
          onClose={handleFormClose}
        />
      </Modal>
    </div>
  );
};
