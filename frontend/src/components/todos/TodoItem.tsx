import React from 'react';
import { Todo, useTodoStore } from '../../stores/useTodoStore';
import { minutesToDisplay } from '../../utils/dateUtils';

const PRIORITY_BADGE: Record<string, string> = {
  high: 'bg-red-100 text-red-700',
  medium: 'bg-amber-100 text-amber-700',
  low: 'bg-blue-100 text-blue-700',
};

const PRIORITY_LABEL: Record<string, string> = {
  high: 'Hoch',
  medium: 'Mittel',
  low: 'Niedrig',
};

interface Props {
  todo: Todo;
}

export const TodoItem: React.FC<Props> = ({ todo }) => {
  const { completeTodo, deleteTodo } = useTodoStore();
  const isDone = todo.status === 'done';

  return (
    <div className={`group flex items-center gap-3 px-4 py-3 rounded-xl border transition-all hover:shadow-sm ${isDone ? 'bg-gray-50 border-gray-100 opacity-60' : 'bg-white border-gray-200'}`}>
      {/* Checkbox */}
      <button
        onClick={() => !isDone && completeTodo(todo._id)}
        className={`w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-colors ${isDone ? 'bg-green-500 border-green-500 text-white' : 'border-gray-300 hover:border-blue-500'}`}
      >
        {isDone && (
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        )}
      </button>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className={`font-medium ${isDone ? 'line-through text-gray-400' : 'text-gray-900'}`}>
          {todo.title}
        </div>
        <div className="flex items-center gap-2 mt-1">
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${PRIORITY_BADGE[todo.priority]}`}>
            {PRIORITY_LABEL[todo.priority]}
          </span>
          <span className="text-xs text-gray-400">{minutesToDisplay(todo.estimatedMinutes)}</span>
          {todo.deadline && (
            <span className="text-xs text-gray-400">
              Fällig: {new Date(todo.deadline).toLocaleDateString('de-DE', { day: 'numeric', month: 'short' })}
            </span>
          )}
          {todo.status === 'scheduled' && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700 font-medium">Geplant</span>
          )}
        </div>
      </div>

      {/* Delete */}
      <button
        onClick={() => deleteTodo(todo._id)}
        className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-lg transition-all"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      </button>
    </div>
  );
};
