import { create } from 'zustand';
import { api } from '../api/client';

export interface Todo {
  _id: string;
  title: string;
  description?: string;
  priority: 'high' | 'medium' | 'low';
  estimatedMinutes: number;
  deadline?: string;
  status: 'inbox' | 'scheduled' | 'done';
  scheduledStart?: string;
  scheduledEnd?: string;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}

interface TodoStore {
  todos: Todo[];
  loading: boolean;
  fetchTodos: (status?: string) => Promise<void>;
  createTodo: (data: { title: string; priority: string; estimatedMinutes: number; deadline?: string; description?: string }) => Promise<void>;
  updateTodo: (id: string, data: Partial<Todo>) => Promise<void>;
  completeTodo: (id: string) => Promise<void>;
  deleteTodo: (id: string) => Promise<void>;
}

export const useTodoStore = create<TodoStore>((set, get) => ({
  todos: [],
  loading: false,

  fetchTodos: async (status?) => {
    set({ loading: true });
    const query = status ? `?status=${status}` : '';
    const todos = await api.get<Todo[]>(`/todos${query}`);
    set({ todos, loading: false });
  },

  createTodo: async (data) => {
    const todo = await api.post<Todo>('/todos', data);
    set({ todos: [...get().todos, todo] });
  },

  updateTodo: async (id, data) => {
    const updated = await api.put<Todo>(`/todos/${id}`, data);
    set({ todos: get().todos.map((t) => (t._id === id ? updated : t)) });
  },

  completeTodo: async (id) => {
    const updated = await api.patch<Todo>(`/todos/${id}/complete`);
    set({ todos: get().todos.map((t) => (t._id === id ? updated : t)) });
  },

  deleteTodo: async (id) => {
    await api.delete(`/todos/${id}`);
    set({ todos: get().todos.filter((t) => t._id !== id) });
  },
}));
