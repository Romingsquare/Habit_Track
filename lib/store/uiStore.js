import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useUIStore = create(
  persist(
    (set, get) => ({
      // Theme and appearance
      theme: 'system',
      sidebarOpen: false,
      
      // Modal states
      createHabitModalOpen: false,
      editingHabit: null,
      
      // View states
      currentView: 'today', // 'today', 'week', 'month', 'analytics'
      
      // Filters and search
      searchQuery: '',
      selectedCategories: [],
      
      // Actions
      setTheme: (theme) => set({ theme }),
      
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
      
      setCreateHabitModalOpen: (open) => set({ createHabitModalOpen: open }),
      
      setEditingHabit: (habit) => set({ 
        editingHabit: habit,
        createHabitModalOpen: !!habit 
      }),
      
      setCurrentView: (view) => set({ currentView: view }),
      
      setSearchQuery: (query) => set({ searchQuery: query }),
      
      setSelectedCategories: (categories) => set({ selectedCategories: categories }),
      
      toggleCategory: (category) => {
        const state = get()
        const categories = state.selectedCategories.includes(category)
          ? state.selectedCategories.filter(c => c !== category)
          : [...state.selectedCategories, category]
        set({ selectedCategories: categories })
      },
      
      clearFilters: () => set({ 
        searchQuery: '', 
        selectedCategories: [] 
      })
    }),
    {
      name: 'habit-ui-store',
      version: 1
    }
  )
)