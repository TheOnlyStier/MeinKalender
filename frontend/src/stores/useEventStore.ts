import { create } from 'zustand';
import { api } from '../api/client';

export interface CalendarEvent {
  _id: string;
  title: string;
  description?: string;
  start: string;
  end: string;
  color?: string;
  isAllDay: boolean;
  source: string;
}

interface EventStore {
  events: CalendarEvent[];
  loading: boolean;
  fetchEvents: (start: string, end: string) => Promise<void>;
  createEvent: (data: Omit<CalendarEvent, '_id' | 'source'>) => Promise<void>;
  updateEvent: (id: string, data: Partial<CalendarEvent>) => Promise<void>;
  deleteEvent: (id: string) => Promise<void>;
}

export const useEventStore = create<EventStore>((set, get) => ({
  events: [],
  loading: false,

  fetchEvents: async (start, end) => {
    set({ loading: true });
    const events = await api.get<CalendarEvent[]>(`/events?start=${start}&end=${end}`);
    set({ events, loading: false });
  },

  createEvent: async (data) => {
    const event = await api.post<CalendarEvent>('/events', data);
    set({ events: [...get().events, event] });
  },

  updateEvent: async (id, data) => {
    const updated = await api.put<CalendarEvent>(`/events/${id}`, data);
    set({ events: get().events.map((e) => (e._id === id ? updated : e)) });
  },

  deleteEvent: async (id) => {
    await api.delete(`/events/${id}`);
    set({ events: get().events.filter((e) => e._id !== id) });
  },
}));
