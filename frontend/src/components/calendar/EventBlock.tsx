import React, { useCallback, useRef } from 'react';
import { CalendarEvent, useEventStore } from '../../stores/useEventStore';
import { formatTime } from '../../utils/dateUtils';

const HOUR_HEIGHT = 64;
const MIN_HEIGHT = 16; // 15min minimum

interface Props {
  event: CalendarEvent;
  top: number;
  height: number;
  onEdit?: (event: CalendarEvent) => void;
  onResize?: (eventId: string, newEndISO: string) => void;
}

export const EventBlock: React.FC<Props> = ({ event, top, height, onEdit, onResize }) => {
  const { deleteEvent } = useEventStore();
  const resizing = useRef(false);
  const startY = useRef(0);
  const startHeight = useRef(0);
  const blockRef = useRef<HTMLDivElement>(null);

  const handleResizeStart = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    resizing.current = true;
    startY.current = e.clientY;
    startHeight.current = height;

    const handleMouseMove = (ev: MouseEvent) => {
      if (!resizing.current || !blockRef.current) return;
      const deltaY = ev.clientY - startY.current;
      const newHeight = Math.max(MIN_HEIGHT, startHeight.current + deltaY);
      blockRef.current.style.height = `${newHeight}px`;
    };

    const handleMouseUp = (ev: MouseEvent) => {
      if (!resizing.current) return;
      resizing.current = false;
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';

      const deltaY = ev.clientY - startY.current;
      const newHeight = Math.max(MIN_HEIGHT, startHeight.current + deltaY);
      const durationHours = newHeight / HOUR_HEIGHT;
      const startDate = new Date(event.start);
      const newEnd = new Date(startDate.getTime() + durationHours * 60 * 60 * 1000);

      // Auf 15min runden
      const minutes = newEnd.getMinutes();
      const rounded = Math.round(minutes / 15) * 15;
      newEnd.setMinutes(rounded, 0, 0);

      if (newEnd.getTime() > startDate.getTime()) {
        onResize?.(event._id, newEnd.toISOString());
      }
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    document.body.style.cursor = 'ns-resize';
    document.body.style.userSelect = 'none';
  }, [event, height, onResize]);

  return (
    <div
      ref={blockRef}
      className="group absolute left-1 right-1 rounded-lg px-3 py-1.5 text-white text-sm overflow-hidden cursor-pointer hover:opacity-90 transition-opacity shadow-sm z-10"
      style={{
        top,
        height: Math.max(height, 24),
        backgroundColor: event.color || '#6366f1',
      }}
      onClick={() => onEdit?.(event)}
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

      {/* Resize Handle */}
      <div
        onMouseDown={handleResizeStart}
        onClick={(e) => e.stopPropagation()}
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '8px',
          cursor: 'ns-resize',
          borderBottomLeftRadius: '8px',
          borderBottomRightRadius: '8px',
          background: 'transparent',
        }}
        className="group-hover:bg-white/30"
      />
    </div>
  );
};
