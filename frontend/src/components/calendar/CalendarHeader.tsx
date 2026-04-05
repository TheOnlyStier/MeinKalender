import React from 'react';
import { useUIStore } from '../../stores/useUIStore';
import { formatDate, getWeekDays, isToday } from '../../utils/dateUtils';

export const CalendarHeader: React.FC = () => {
  const { selectedDate, currentView, setView, goToday, goNext, goPrev } = useUIStore();
  const weekDays = getWeekDays(selectedDate);

  const monthYear = selectedDate.toLocaleDateString('de-DE', { month: 'long', year: 'numeric' });

  return (
    <div className="border-b border-gray-200 bg-white">
      {/* Navigation */}
      <div className="flex items-center justify-between px-6 py-3">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-semibold capitalize">{monthYear}</h2>
          <div className="flex items-center gap-1">
            <button onClick={goPrev} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
              <ChevronLeft />
            </button>
            <button onClick={goToday} className="px-3 py-1 text-sm font-medium hover:bg-gray-100 rounded-lg transition-colors">
              Heute
            </button>
            <button onClick={goNext} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
              <ChevronRight />
            </button>
          </div>
        </div>

        <div className="flex bg-gray-100 rounded-lg p-0.5">
          <button
            onClick={() => setView('day')}
            className={`px-3 py-1 text-sm rounded-md transition-colors ${currentView === 'day' ? 'bg-white shadow-sm font-medium' : 'hover:bg-gray-200'}`}
          >
            Tag
          </button>
          <button
            onClick={() => setView('week')}
            className={`px-3 py-1 text-sm rounded-md transition-colors ${currentView === 'week' ? 'bg-white shadow-sm font-medium' : 'hover:bg-gray-200'}`}
          >
            Woche
          </button>
        </div>
      </div>

      {/* Day headers for week view */}
      {currentView === 'week' && (
        <div className="grid grid-cols-7 gap-0 pl-16">
          {weekDays.map((day) => (
            <div
              key={day.toISOString()}
              className={`text-center py-2 text-sm ${isToday(day) ? 'text-blue-600 font-semibold' : 'text-gray-500'}`}
            >
              <div>{day.toLocaleDateString('de-DE', { weekday: 'short' })}</div>
              <div className={`text-lg ${isToday(day) ? 'bg-blue-600 text-white w-8 h-8 rounded-full flex items-center justify-center mx-auto' : ''}`}>
                {day.getDate()}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const ChevronLeft = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
  </svg>
);

const ChevronRight = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
  </svg>
);
