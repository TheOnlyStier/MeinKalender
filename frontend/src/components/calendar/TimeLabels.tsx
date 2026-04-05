import React from 'react';

const START_HOUR = 0;
const END_HOUR = 24;
const HOURS = Array.from({ length: END_HOUR - START_HOUR }, (_, i) => START_HOUR + i);
const HOUR_HEIGHT = 64;
const TOP_OFFSET = 20;

export const TimeLabels: React.FC = () => {
  return (
    <div className="relative w-16 flex-shrink-0" style={{ height: HOURS.length * HOUR_HEIGHT + TOP_OFFSET }}>
      {HOURS.map((hour) => (
        <div
          key={hour}
          className="absolute right-2 text-xs text-gray-400 -translate-y-1/2"
          style={{ top: (hour - START_HOUR) * HOUR_HEIGHT + TOP_OFFSET }}
        >
          {hour.toString().padStart(2, '0')}:00
        </div>
      ))}
    </div>
  );
};
