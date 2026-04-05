import React from 'react';
import { AppShell } from './components/layout/AppShell';
import { CalendarPage } from './pages/CalendarPage';
import { TodosPage } from './pages/TodosPage';
import { DailyPlanPage } from './pages/DailyPlanPage';
import { useUIStore } from './stores/useUIStore';

const App: React.FC = () => {
  const { currentPage } = useUIStore();

  return (
    <AppShell>
      {currentPage === 'calendar' && <CalendarPage />}
      {currentPage === 'todos' && <TodosPage />}
      {currentPage === 'plan' && <DailyPlanPage />}
    </AppShell>
  );
};

export default App;
