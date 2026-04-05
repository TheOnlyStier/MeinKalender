import React, { useEffect, useState } from 'react';
import { TodoList } from '../components/todos/TodoList';
import { TodoForm } from '../components/todos/TodoForm';
import { Modal } from '../components/shared/Modal';
import { useTodoStore } from '../stores/useTodoStore';

export const TodosPage: React.FC = () => {
  const { fetchTodos } = useTodoStore();
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    fetchTodos();
  }, [fetchTodos]);

  return (
    <div className="flex-1 overflow-auto">
      <div className="max-w-2xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Aufgaben</h1>
            <p className="text-sm text-gray-500 mt-1">Verwalte deine To-Dos</p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Neue Aufgabe
          </button>
        </div>

        <TodoList />

        <Modal isOpen={showForm} onClose={() => setShowForm(false)} title="Neue Aufgabe">
          <TodoForm onClose={() => setShowForm(false)} />
        </Modal>
      </div>
    </div>
  );
};
