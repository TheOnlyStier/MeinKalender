import { create } from 'zustand';

type View = 'week' | 'day';
type Page = 'calendar' | 'todos' | 'plan';

interface UIStore {
  currentView: View;
  currentPage: Page;
  selectedDate: Date;
  sidebarOpen: boolean;
  modalOpen: string | null;
  setView: (view: View) => void;
  setPage: (page: Page) => void;
  setSelectedDate: (date: Date) => void;
  toggleSidebar: () => void;
  openModal: (id: string) => void;
  closeModal: () => void;
  goToday: () => void;
  goNext: () => void;
  goPrev: () => void;
}

export const useUIStore = create<UIStore>((set, get) => ({
  currentView: 'week',
  currentPage: 'calendar',
  selectedDate: new Date(),
  sidebarOpen: true,
  modalOpen: null,

  setView: (view) => set({ currentView: view }),
  setPage: (page) => set({ currentPage: page }),
  setSelectedDate: (date) => set({ selectedDate: date }),
  toggleSidebar: () => set({ sidebarOpen: !get().sidebarOpen }),
  openModal: (id) => set({ modalOpen: id }),
  closeModal: () => set({ modalOpen: null }),

  goToday: () => set({ selectedDate: new Date() }),

  goNext: () => {
    const { selectedDate, currentView } = get();
    const next = new Date(selectedDate);
    next.setDate(next.getDate() + (currentView === 'week' ? 7 : 1));
    set({ selectedDate: next });
  },

  goPrev: () => {
    const { selectedDate, currentView } = get();
    const prev = new Date(selectedDate);
    prev.setDate(prev.getDate() - (currentView === 'week' ? 7 : 1));
    set({ selectedDate: prev });
  },
}));
