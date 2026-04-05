// ===== Enums =====

export enum Priority {
  HIGH = 'high',
  MEDIUM = 'medium',
  LOW = 'low',
}

export enum TodoStatus {
  INBOX = 'inbox',
  SCHEDULED = 'scheduled',
  DONE = 'done',
}

export enum EventSource {
  MANUAL = 'manual',
  GOOGLE = 'google',
}

// ===== Interfaces =====

export interface ITimeSlot {
  start: string; // ISO datetime
  end: string;
  durationMinutes: number;
}

export interface ITodo {
  _id: string;
  title: string;
  description?: string;
  priority: Priority;
  estimatedMinutes: number;
  deadline?: string;
  status: TodoStatus;
  scheduledStart?: string;
  scheduledEnd?: string;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface IEvent {
  _id: string;
  title: string;
  description?: string;
  start: string;
  end: string;
  color?: string;
  isAllDay: boolean;
  source: EventSource;
  createdAt: string;
  updatedAt: string;
}

export interface IScheduleBlock {
  todoId: string;
  todoTitle: string;
  start: string;
  end: string;
  priority: Priority;
}

// ===== API Types =====

export interface CreateTodoDTO {
  title: string;
  description?: string;
  priority: Priority;
  estimatedMinutes: number;
  deadline?: string;
}

export interface UpdateTodoDTO {
  title?: string;
  description?: string;
  priority?: Priority;
  estimatedMinutes?: number;
  deadline?: string;
  status?: TodoStatus;
  scheduledStart?: string;
  scheduledEnd?: string;
}

export interface CreateEventDTO {
  title: string;
  description?: string;
  start: string;
  end: string;
  color?: string;
  isAllDay?: boolean;
}

export interface UpdateEventDTO {
  title?: string;
  description?: string;
  start?: string;
  end?: string;
  color?: string;
  isAllDay?: boolean;
}

export interface ScheduleRequestDTO {
  startDate: string; // ISO date
  endDate: string;
  workDayStart?: number; // hour, default 9
  workDayEnd?: number;   // hour, default 18
}

// ===== Constants =====

export const SCHEDULING_DEFAULTS = {
  WORK_DAY_START: 9,
  WORK_DAY_END: 18,
  MIN_BLOCK_MINUTES: 15,
  BUFFER_MINUTES: 5,
  MAX_SPLIT_BLOCKS: 3,
  SPLIT_THRESHOLD_MINUTES: 60,
};

export const PRIORITY_WEIGHTS: Record<Priority, number> = {
  [Priority.HIGH]: 100,
  [Priority.MEDIUM]: 50,
  [Priority.LOW]: 25,
};

export const PRIORITY_COLORS: Record<Priority, string> = {
  [Priority.HIGH]: '#ef4444',
  [Priority.MEDIUM]: '#f59e0b',
  [Priority.LOW]: '#3b82f6',
};
