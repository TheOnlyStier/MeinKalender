import React from 'react';
import { useUIStore } from '../../stores/useUIStore';

type Page = 'calendar' | 'todos' | 'plan';

const NAV_ITEMS: { page: Page; label: string; icon: React.ReactNode }[] = [
  {
    page: 'calendar',
    label: 'Kalender',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    page: 'todos',
    label: 'Aufgaben',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
      </svg>
    ),
  },
  {
    page: 'plan',
    label: 'Tagesplan',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
  },
];

export const Sidebar: React.FC = () => {
  const { currentPage, setPage } = useUIStore();

  return (
    <aside className="w-60 bg-white border-r border-gray-200 flex flex-col h-screen">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-gray-100">
        <h1 className="text-xl font-bold text-gray-900">MeinKalender</h1>
        <p className="text-xs text-gray-400 mt-0.5">Dein persönlicher Planer</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {NAV_ITEMS.map(({ page, label, icon }) => (
          <button
            key={page}
            onClick={() => setPage(page)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
              currentPage === page
                ? 'bg-blue-50 text-blue-700 font-medium'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            {icon}
            {label}
          </button>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-6 py-4 border-t border-gray-100">
        <p className="text-xs text-gray-400">MeinKalender v1.0</p>
      </div>
    </aside>
  );
};
