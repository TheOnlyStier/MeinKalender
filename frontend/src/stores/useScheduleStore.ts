import { create } from 'zustand';
import { api } from '../api/client';
import { Todo } from './useTodoStore';
import { CalendarEvent } from './useEventStore';

interface ScheduleBlock {
  todoId: string;
  todoTitle: string;
  priority: string;
  start: string;
  end: string;
}

interface ScheduleStore {
  scheduledTodos: Todo[];
  events: CalendarEvent[];
  loading: boolean;
  fetchDaySchedule: (date: string) => Promise<void>;
  runAutoSchedule: (startDate: string, endDate: string) => Promise<{ scheduled: number; blocks: ScheduleBlock[] }>;
}

export const useScheduleStore = create<ScheduleStore>((set) => ({
  scheduledTodos: [],
  events: [],
  loading: false,

  fetchDaySchedule: async (date) => {
    set({ loading: true });
    const data = await api.get<{ todos: Todo[]; events: CalendarEvent[] }>(`/schedule?date=${date}`);
    set({ scheduledTodos: data.todos, events: data.events, loading: false });
  },

  runAutoSchedule: async (startDate, endDate) => {
    set({ loading: true });
    const result = await api.post<{ scheduled: number; blocks: ScheduleBlock[] }>('/schedule/generate', {
      startDate,
      endDate,
    });
    set({ loading: false });
    return result;
  },
}));
