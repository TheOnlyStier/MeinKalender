import React, { useEffect, useState } from 'react';
import { useScheduleStore } from '../../stores/useScheduleStore';
import { useTodoStore } from '../../stores/useTodoStore';
import { formatTime, minutesToDisplay, formatDateISO } from '../../utils/dateUtils';

export const DailyPlanView: React.FC = () => {
  const { scheduledTodos, events, fetchDaySchedule, runAutoSchedule, loading } = useScheduleStore();
  const { todos, fetchTodos, completeTodo } = useTodoStore();
  const [date] = useState(new Date());

  useEffect(() => {
    fetchDaySchedule(formatDateISO(date));
    fetchTodos();
  }, [date, fetchDaySchedule, fetchTodos]);

  const unscheduledTodos = todos.filter((t) => t.status === 'inbox');
  const todayScheduled = scheduledTodos;

  const totalScheduledMinutes = todayScheduled.reduce((sum, t) => sum + t.estimatedMinutes, 0);
  const totalUnscheduledMinutes = unscheduledTodos.reduce((sum, t) => sum + t.estimatedMinutes, 0);

  const handleAutoSchedule = async () => {
    const start = formatDateISO(date);
    const end = new Date(date);
    end.setDate(end.getDate() + 7);
    await runAutoSchedule(start, formatDateISO(end));
    await fetchDaySchedule(formatDateISO(date));
    await fetchTodos();
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dein Tag</h1>
        <p className="text-gray-500 mt-1">
          {date.toLocaleDateString('de-DE', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="text-2xl font-bold text-blue-600">{todayScheduled.length}</div>
          <div className="text-sm text-gray-500">Geplante Tasks</div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="text-2xl font-bold text-gray-900">{minutesToDisplay(totalScheduledMinutes)}</div>
          <div className="text-sm text-gray-500">Arbeitszeit</div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="text-2xl font-bold text-amber-600">{unscheduledTodos.length}</div>
          <div className="text-sm text-gray-500">Offen</div>
        </div>
      </div>

      {/* Auto-Schedule Button */}
      <button
        onClick={handleAutoSchedule}
        disabled={loading}
        className="w-full mb-6 bg-blue-600 text-white py-3 px-6 rounded-xl hover:bg-blue-700 transition-colors font-medium flex items-center justify-center gap-2 disabled:opacity-50"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
        {loading ? 'Plane...' : 'Automatisch planen'}
      </button>

      {/* Timeline */}
      <div className="space-y-3">
        <h2 className="text-lg font-semibold text-gray-900">Zeitplan</h2>

        {/* Events */}
        {events.map((event) => (
          <div key={event._id} className="flex gap-4 p-4 bg-white rounded-xl border border-gray-200">
            <div className="text-sm text-gray-400 w-24 flex-shrink-0">
              {formatTime(event.start)}
              <br />
              {formatTime(event.end)}
            </div>
            <div className="flex-1">
              <div className="w-1 h-full rounded-full float-left mr-3" style={{ backgroundColor: event.color || '#6366f1' }} />
              <div className="font-medium">{event.title}</div>
              <div className="text-sm text-gray-500">Termin</div>
            </div>
          </div>
        ))}

        {/* Scheduled Todos */}
        {todayScheduled.map((todo) => (
          <div key={todo._id} className="flex gap-4 p-4 bg-white rounded-xl border border-gray-200 group">
            <div className="text-sm text-gray-400 w-24 flex-shrink-0">
              {todo.scheduledStart && formatTime(todo.scheduledStart)}
              <br />
              {todo.scheduledEnd && formatTime(todo.scheduledEnd)}
            </div>
            <div className="flex-1 flex items-center gap-3">
              <button
                onClick={() => completeTodo(todo._id)}
                className="w-5 h-5 rounded-full border-2 border-gray-300 flex-shrink-0 hover:border-green-500 transition-colors"
              />
              <div>
                <div className="font-medium">{todo.title}</div>
                <div className="text-sm text-gray-500">
                  {minutesToDisplay(todo.estimatedMinutes)} · {todo.priority === 'high' ? 'Hoch' : todo.priority === 'medium' ? 'Mittel' : 'Niedrig'}
                </div>
              </div>
            </div>
          </div>
        ))}

        {todayScheduled.length === 0 && events.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            <p>Noch nichts geplant</p>
            <p className="text-sm mt-1">Klicke auf "Automatisch planen" um deinen Tag zu strukturieren</p>
          </div>
        )}
      </div>

      {/* Unscheduled Tasks */}
      {unscheduledTodos.length > 0 && (
        <div className="mt-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">
            Ungeplante Aufgaben ({unscheduledTodos.length})
          </h2>
          <div className="space-y-2">
            {unscheduledTodos.map((todo) => (
              <div key={todo._id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <div className={`w-2 h-2 rounded-full ${todo.priority === 'high' ? 'bg-red-500' : todo.priority === 'medium' ? 'bg-amber-500' : 'bg-blue-500'}`} />
                <span className="font-medium text-sm">{todo.title}</span>
                <span className="text-xs text-gray-400 ml-auto">{minutesToDisplay(todo.estimatedMinutes)}</span>
              </div>
            ))}
            <p className="text-xs text-gray-400 mt-2">
              Gesamt: {minutesToDisplay(totalUnscheduledMinutes)} offene Arbeit
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
