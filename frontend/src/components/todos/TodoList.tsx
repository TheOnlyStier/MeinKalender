import React, { useState } from 'react';
import { useTodoStore } from '../../stores/useTodoStore';
import { TodoItem } from './TodoItem';

export const TodoList: React.FC = () => {
  const { todos } = useTodoStore();
  const [filter, setFilter] = useState<'all' | 'inbox' | 'scheduled' | 'done'>('all');

  const filtered = filter === 'all' ? todos : todos.filter((t) => t.status === filter);
  const inboxCount = todos.filter((t) => t.status === 'inbox').length;
  const scheduledCount = todos.filter((t) => t.status === 'scheduled').length;
  const doneCount = todos.filter((t) => t.status === 'done').length;

  return (
    <div>
      {/* Filters */}
      <div className="flex gap-2 mb-4">
        {[
          { key: 'all' as const, label: 'Alle', count: todos.length },
          { key: 'inbox' as const, label: 'Offen', count: inboxCount },
          { key: 'scheduled' as const, label: 'Geplant', count: scheduledCount },
          { key: 'done' as const, label: 'Erledigt', count: doneCount },
        ].map(({ key, label, count }) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${filter === key ? 'bg-blue-100 text-blue-700 font-medium' : 'text-gray-500 hover:bg-gray-100'}`}
          >
            {label} <span className="text-xs ml-1">({count})</span>
          </button>
        ))}
      </div>

      {/* List */}
      <div className="space-y-2">
        {filtered.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <p className="text-lg">Keine Aufgaben</p>
            <p className="text-sm mt-1">Erstelle eine neue Aufgabe um loszulegen</p>
          </div>
        ) : (
          filtered.map((todo) => <TodoItem key={todo._id} todo={todo} />)
        )}
      </div>
    </div>
  );
};
