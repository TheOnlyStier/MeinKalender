import React from 'react';
import { Todo } from '../../stores/useTodoStore';
import { formatTime } from '../../utils/dateUtils';

const PRIORITY_STYLES: Record<string, string> = {
  high: 'border-red-400 bg-red-50 text-red-900',
  medium: 'border-amber-400 bg-amber-50 text-amber-900',
  low: 'border-blue-400 bg-blue-50 text-blue-900',
};

interface Props {
  todo: Todo;
  top: number;
  height: number;
  onComplete: () => void;
}

export const ScheduledTaskBlock: React.FC<Props> = ({ todo, top, height, onComplete }) => {
  const style = PRIORITY_STYLES[todo.priority] || PRIORITY_STYLES.medium;

  return (
    <div
      className={`absolute left-1 right-1 rounded-lg px-3 py-1.5 text-sm overflow-hidden border-l-4 border-dashed cursor-pointer hover:shadow-md transition-shadow z-10 ${style}`}
      style={{ top, height: Math.max(height, 24) }}
    >
      <div className="flex items-center gap-2">
        <button
          onClick={(e) => { e.stopPropagation(); onComplete(); }}
          className="w-4 h-4 rounded border-2 border-current flex-shrink-0 hover:bg-current/20 transition-colors"
          title="Als erledigt markieren"
        />
        <span className="font-medium truncate">{todo.title}</span>
      </div>
      {height > 36 && (
        <div className="text-xs opacity-70 ml-6">
          {formatTime(todo.scheduledStart!)} – {formatTime(todo.scheduledEnd!)}
        </div>
      )}
    </div>
  );
};
