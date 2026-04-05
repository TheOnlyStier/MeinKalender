import React, { useState } from 'react';

export interface EventTemplate {
  name: string;
  color: string;
  defaultMinutes: number;
  category: string;
}

const TEMPLATES: EventTemplate[] = [
  { name: 'Gym', color: '#10b981', defaultMinutes: 60, category: 'Sport' },
  { name: 'Judo', color: '#ef4444', defaultMinutes: 120, category: 'Sport' },
  { name: 'Mobility', color: '#06b6d4', defaultMinutes: 0, category: 'Sport' },
  { name: 'Arbeit', color: '#3b82f6', defaultMinutes: 480, category: 'Arbeit' },
  { name: 'Trading', color: '#f59e0b', defaultMinutes: 90, category: 'Arbeit' },
  { name: 'Trade-Bewertung', color: '#f97316', defaultMinutes: 30, category: 'Arbeit' },
  { name: 'Meeting', color: '#6366f1', defaultMinutes: 0, category: 'Arbeit' },
  { name: 'Meditation', color: '#8b5cf6', defaultMinutes: 0, category: 'Persönlich' },
  { name: 'Freundin', color: '#f43f5e', defaultMinutes: 0, category: 'Persönlich' },
  { name: 'Einkaufen', color: '#84cc16', defaultMinutes: 0, category: 'Persönlich' },
  { name: 'Kochen', color: '#f97316', defaultMinutes: 0, category: 'Persönlich' },
  { name: 'Zahnarzt', color: '#ec4899', defaultMinutes: 0, category: 'Gesundheit' },
];

interface Props {
  isOpen: boolean;
  onToggle: () => void;
}

export const EventTemplates: React.FC<Props> = ({ isOpen, onToggle }) => {
  const categories = [...new Set(TEMPLATES.map((t) => t.category))];

  const handleDragStart = (e: React.DragEvent, template: EventTemplate) => {
    e.dataTransfer.setData('application/json', JSON.stringify(template));
    e.dataTransfer.effectAllowed = 'copy';
  };

  return (
    <div>
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
        </svg>
        Vorlagen
        <svg
          className={`w-4 h-4 ml-auto transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none" stroke="currentColor" viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="mt-2 space-y-3 px-2">
          {categories.map((cat) => (
            <div key={cat}>
              <div className="text-xs font-medium text-gray-400 uppercase tracking-wider px-1 mb-1.5">
                {cat}
              </div>
              <div className="space-y-1">
                {TEMPLATES.filter((t) => t.category === cat).map((template) => (
                  <div
                    key={template.name}
                    draggable
                    onDragStart={(e) => handleDragStart(e, template)}
                    className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg cursor-grab active:cursor-grabbing hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-200"
                  >
                    <div
                      className="w-3 h-3 rounded-full flex-shrink-0"
                      style={{ backgroundColor: template.color }}
                    />
                    <span className="text-sm text-gray-700">{template.name}</span>
                    {template.defaultMinutes > 0 && (
                      <span className="text-xs text-gray-400 ml-auto">
                        {template.defaultMinutes >= 60
                          ? `${Math.floor(template.defaultMinutes / 60)}h`
                          : `${template.defaultMinutes}m`}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
