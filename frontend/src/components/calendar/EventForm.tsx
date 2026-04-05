import React, { useState } from 'react';
import { useEventStore } from '../../stores/useEventStore';

interface Props {
  initialDate?: Date;
  initialHour?: number;
  onClose?: () => void;
}

export const EventForm: React.FC<Props> = ({ initialDate, initialHour, onClose }) => {
  const { createEvent } = useEventStore();
  const defaultDate = initialDate || new Date();
  const defaultHour = initialHour ?? 9;

  const [title, setTitle] = useState('');
  const [date, setDate] = useState(defaultDate.toISOString().split('T')[0]);
  const [startTime, setStartTime] = useState(`${String(defaultHour).padStart(2, '0')}:00`);
  const [endTime, setEndTime] = useState(`${String(defaultHour + 1).padStart(2, '0')}:00`);
  const [color, setColor] = useState('#6366f1');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    await createEvent({
      title: title.trim(),
      start: `${date}T${startTime}:00`,
      end: `${date}T${endTime}:00`,
      color,
      isAllDay: false,
    });
    onClose?.();
  };

  const colors = ['#6366f1', '#ec4899', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Titel</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          placeholder="Meeting, Termin, ..."
          autoFocus
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Datum</label>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Start</label>
          <input
            type="time"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Ende</label>
          <input
            type="time"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Farbe</label>
        <div className="flex gap-2">
          {colors.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setColor(c)}
              className={`w-8 h-8 rounded-full transition-transform ${color === c ? 'ring-2 ring-offset-2 ring-blue-500 scale-110' : 'hover:scale-105'}`}
              style={{ backgroundColor: c }}
            />
          ))}
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          Termin erstellen
        </button>
        {onClose && (
          <button type="button" onClick={onClose} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
            Abbrechen
          </button>
        )}
      </div>
    </form>
  );
};
