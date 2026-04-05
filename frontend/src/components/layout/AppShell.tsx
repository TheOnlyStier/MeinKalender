import React from 'react';
import { Sidebar } from './Sidebar';

interface Props {
  children: React.ReactNode;
}

export const AppShell: React.FC<Props> = ({ children }) => {
  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 overflow-hidden flex flex-col">
        {children}
      </main>
    </div>
  );
};
