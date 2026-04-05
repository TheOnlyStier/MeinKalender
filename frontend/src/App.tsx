import React, { useState } from 'react';
import { AppShell } from './components/layout/AppShell';
import { CalendarPage } from './pages/CalendarPage';
import { TodosPage } from './pages/TodosPage';
import { DailyPlanPage } from './pages/DailyPlanPage';
import { ChatSidebar } from './components/chat/ChatSidebar';
import { useUIStore } from './stores/useUIStore';

const App: React.FC = () => {
  const { currentPage } = useUIStore();
  const [chatOpen, setChatOpen] = useState(false);

  return (
    <AppShell>
      {currentPage === 'calendar' && <CalendarPage />}
      {currentPage === 'todos' && <TodosPage />}
      {currentPage === 'plan' && <DailyPlanPage />}

      {/* Chat Toggle Button */}
      <button
        onClick={() => setChatOpen(!chatOpen)}
        style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          backgroundColor: '#2563eb',
          color: '#ffffff',
          border: 'none',
          cursor: 'pointer',
          fontSize: '24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 12px rgba(37, 99, 235, 0.4)',
          zIndex: 40,
          transition: 'transform 0.2s',
          transform: chatOpen ? 'scale(0)' : 'scale(1)',
        }}
        title="KI Assistent öffnen"
      >
        💬
      </button>

      {/* Chat Sidebar */}
      <ChatSidebar isOpen={chatOpen} onClose={() => setChatOpen(false)} />
    </AppShell>
  );
};

export default App;
