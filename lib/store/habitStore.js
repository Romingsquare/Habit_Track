import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { createHabit, createHabitEntry, DIFFICULTY_POINTS } from '../types'

export const useHabitStore = create(
  persist(
    (set, get) => ({
      // State
      habits: [],
      entries: [],
      selectedDate: new Date().toISOString().split('T')[0],

      // Habit management actions
      addHabit: (habitData) => {
        const habit = createHabit(habitData)
        set(state => ({
          habits: [...state.habits, habit]
        }))
        return habit.id
      },

      updateHabit: (habitId, updates) => {
        set(state => ({
          habits: state.habits.map(habit =>
            habit.id === habitId
              ? { ...habit, ...updates }
              : habit
          )
        }))
      },

      deleteHabit: (habitId) => {
        set(state => ({
          habits: state.habits.filter(habit => habit.id !== habitId),
          entries: state.entries.filter(entry => entry.habitId !== habitId)
        }))
      },

      toggleHabitActive: (habitId) => {
        set(state => ({
          habits: state.habits.map(habit =>
            habit.id === habitId
              ? { ...habit, isActive: !habit.isActive }
              : habit
          )
        }))
      },

      // Entry management actions  
      toggleHabitCompletion: (habitId, date = null) => {
        const targetDate = date || get().selectedDate
        const state = get()
        const existingEntry = state.entries.find(
          entry => entry.habitId === habitId && entry.date === targetDate
        )

        if (existingEntry) {
          // Toggle existing entry
          set(state => ({
            entries: state.entries.map(entry =>
              entry.id === existingEntry.id
                ? { ...entry, completed: !entry.completed, completedAt: !entry.completed ? new Date().toISOString() : null }
                : entry
            )
          }))
        } else {
          // Create new entry
          const newEntry = createHabitEntry({
            habitId,
            date: targetDate,
            completed: true
          })
          set(state => ({
            entries: [...state.entries, newEntry]
          }))
        }
      },

      updateHabitEntry: (habitId, date, updates) => {
        const state = get()
        const existingEntry = state.entries.find(
          entry => entry.habitId === habitId && entry.date === date
        )

        if (existingEntry) {
          set(state => ({
            entries: state.entries.map(entry =>
              entry.id === existingEntry.id
                ? { ...entry, ...updates }
                : entry
            )
          }))
        } else {
          const newEntry = createHabitEntry({
            habitId,
            date,
            ...updates
          })
          set(state => ({
            entries: [...state.entries, newEntry]
          }))
        }
      },

      // Date navigation
      setSelectedDate: (date) => {
        set({ selectedDate: date })
      },

      // Computed getters
      getHabitsByCategory: (category) => {
        const state = get()
        return state.habits.filter(habit => 
          habit.isActive && habit.category === category
        )
      },

      getActiveHabits: () => {
        const state = get()
        return state.habits.filter(habit => habit.isActive)
      },

      getTodaysHabits: () => {
        const state = get()
        const today = new Date().toISOString().split('T')[0]
        return state.habits.filter(habit => habit.isActive).map(habit => {
          const entry = state.entries.find(
            entry => entry.habitId === habit.id && entry.date === today
          )
          return {
            ...habit,
            completed: entry?.completed || false,
            entry
          }
        })
      },

      getHabitStreak: (habitId) => {
        const state = get()
        const entries = state.entries
          .filter(entry => entry.habitId === habitId && entry.completed)
          .sort((a, b) => new Date(b.date) - new Date(a.date))

        if (entries.length === 0) return { current: 0, longest: 0 }

        let currentStreak = 0
        let longestStreak = 0
        let tempStreak = 0
        
        const today = new Date()
        let checkDate = new Date(today)
        
        // Calculate current streak
        for (let i = 0; i < 365; i++) { // Check up to a year back
          const dateStr = checkDate.toISOString().split('T')[0]
          const hasEntry = entries.some(entry => entry.date === dateStr)
          
          if (hasEntry) {
            if (i === 0 || (i === 1 && checkDate.getDay() !== today.getDay())) {
              // Today or yesterday counts for current streak
              currentStreak++
            }
            tempStreak++
          } else {
            if (tempStreak > longestStreak) {
              longestStreak = tempStreak
            }
            if (i <= 1) currentStreak = 0 // Break current streak if missing today/yesterday
            tempStreak = 0
          }
          
          checkDate.setDate(checkDate.getDate() - 1)
        }

        return { 
          current: currentStreak, 
          longest: Math.max(longestStreak, tempStreak)
        }
      },

      getTotalPoints: () => {
        const state = get()
        const today = new Date().toISOString().split('T')[0]
        
        return state.habits.reduce((total, habit) => {
          const entry = state.entries.find(
            entry => entry.habitId === habit.id && entry.date === today && entry.completed
          )
          return total + (entry ? DIFFICULTY_POINTS[habit.difficulty] : 0)
        }, 0)
      },

      getWeeklyProgress: (weekOffset = 0) => {
        const state = get()
        const today = new Date()
        const startOfWeek = new Date(today)
        startOfWeek.setDate(today.getDate() - today.getDay() + (weekOffset * 7))
        
        const weekDays = []
        for (let i = 0; i < 7; i++) {
          const date = new Date(startOfWeek)
          date.setDate(startOfWeek.getDate() + i)
          weekDays.push(date.toISOString().split('T')[0])
        }

        return weekDays.map(date => {
          const dayEntries = state.entries.filter(entry => entry.date === date)
          const completed = dayEntries.filter(entry => entry.completed).length
          const total = state.habits.filter(habit => habit.isActive).length
          
          return {
            date,
            completed,
            total,
            percentage: total > 0 ? Math.round((completed / total) * 100) : 0
          }
        })
      },

      // Data management
      clearAllData: () => {
        set({
          habits: [],
          entries: [],
          selectedDate: new Date().toISOString().split('T')[0]
        })
      },

      importData: (data) => {
        if (data.habits && Array.isArray(data.habits)) {
          set(state => ({
            habits: [...state.habits, ...data.habits],
            entries: [...state.entries, ...(data.entries || [])]
          }))
        }
      }
    }),
    {
      name: 'habit-tracker-store',
      version: 1
    }
  )
)