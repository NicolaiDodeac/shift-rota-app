import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface UIState {
  // Sidebar state
  sidebarOpen: boolean;
  
  // Theme state
  theme: 'light' | 'dark';
  
  // Selected week for navigation
  selectedWeek: string | null;
  
  // Loading states
  isLoading: boolean;
  
  // Actions
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  setTheme: (theme: 'light' | 'dark') => void;
  setSelectedWeek: (week: string | null) => void;
  setLoading: (loading: boolean) => void;
  
  // Reset state
  resetUI: () => void;
}

const initialState = {
  sidebarOpen: false,
  theme: 'light' as const,
  selectedWeek: null,
  isLoading: false,
};

export const useUIStore = create<UIState>()(
  persist(
    (set, get) => ({
      ...initialState,
      
      toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
      
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
      
      setTheme: (theme) => set({ theme }),
      
      setSelectedWeek: (week) => set({ selectedWeek: week }),
      
      setLoading: (loading) => set({ isLoading: loading }),
      
      resetUI: () => set(initialState),
    }),
    {
      name: 'ui-storage',
      partialize: (state) => ({
        theme: state.theme,
        sidebarOpen: state.sidebarOpen,
      }),
    }
  )
);
