import React from 'react';
import { CalendarEvent, useEventStore } from '../../stores/useEventStore';
import { formatTime } from '../../utils/dateUtils';

interface Props {
  event: CalendarEvent;
  top: number;
  height: number;
}

export const EventBlock: React.FC<Props> = ({ event, top, height }) => {
  const { deleteEvent } = useEventStore();

  return (
    <div
      className="group absolute left-16 right-2 rounded-lg px-3 py-1.5 text-white text-sm overflow-hidden cursor-pointer hover:opacity-90 transition-opacity shadow-sm z-10"
      style={{
        top,
        height: Math.max(height, 24),
        backgroundColor: event.color || '#6366f1',
      }}
    >
      <div className="flex items-center justify-between gap-1">
        <div className="font-medium truncate">{event.title}</div>
        <button
          onClick={(e) => { e.stopPropagation(); deleteEvent(event._id); }}
          className="opacity-0 group-hover:opacity-100 flex-shrink-0 p-0.5 hover:bg-white/20 rounded transition-opacity"
          title="Löschen"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      {height > 32 && (
        <div className="text-xs opacity-80">
          {formatTime(event.start)} – {formatTime(event.end)}
        </div>
      )}
    </div>
  );
};
