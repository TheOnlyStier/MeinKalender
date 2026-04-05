import React from 'react';
import { CalendarEvent } from '../../stores/useEventStore';
import { formatTime } from '../../utils/dateUtils';

interface Props {
  event: CalendarEvent;
  top: number;
  height: number;
}

export const EventBlock: React.FC<Props> = ({ event, top, height }) => {
  return (
    <div
      className="absolute left-16 right-2 rounded-lg px-3 py-1.5 text-white text-sm overflow-hidden cursor-pointer hover:opacity-90 transition-opacity shadow-sm z-10"
      style={{
        top,
        height: Math.max(height, 24),
        backgroundColor: event.color || '#6366f1',
      }}
    >
      <div className="font-medium truncate">{event.title}</div>
      {height > 32 && (
        <div className="text-xs opacity-80">
          {formatTime(event.start)} – {formatTime(event.end)}
        </div>
      )}
    </div>
  );
};
