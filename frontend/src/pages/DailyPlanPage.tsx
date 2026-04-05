import React from 'react';
import { DailyPlanView } from '../components/planning/DailyPlanView';

export const DailyPlanPage: React.FC = () => {
  return (
    <div className="flex-1 overflow-auto px-6 py-8">
      <DailyPlanView />
    </div>
  );
};
