// Core data types for the habit tracker

export const HABIT_TYPES = {
  BOOLEAN: 'boolean',
  COUNTER: 'counter', 
  TIMER: 'timer'
}

export const DIFFICULTY_LEVELS = {
  EASY: 'easy',
  MEDIUM: 'medium', 
  HARD: 'hard'
}

export const CATEGORIES = {
  HEALTH: { name: 'Health', color: '#10B981', icon: 'Heart' },
  FITNESS: { name: 'Fitness', color: '#F59E0B', icon: 'Dumbbell' },
  MINDFULNESS: { name: 'Mindfulness', color: '#8B5CF6', icon: 'Brain' },
  PRODUCTIVITY: { name: 'Productivity', color: '#3B82F6', icon: 'Target' },
  LEARNING: { name: 'Learning', color: '#EC4899', icon: 'BookOpen' },
  SOCIAL: { name: 'Social', color: '#06B6D4', icon: 'Users' },
  CREATIVITY: { name: 'Creativity', color: '#F97316', icon: 'Palette' },
  OTHER: { name: 'Other', color: '#6B7280', icon: 'Circle' }
}

export const DIFFICULTY_POINTS = {
  [DIFFICULTY_LEVELS.EASY]: 1,
  [DIFFICULTY_LEVELS.MEDIUM]: 2,
  [DIFFICULTY_LEVELS.HARD]: 3
}

// Habit interface structure
export const createHabit = ({
  name,
  description = '',
  type = HABIT_TYPES.BOOLEAN,
  category = 'OTHER',
  difficulty = DIFFICULTY_LEVELS.EASY,
  goal = null,
  color = null,
  icon = null
}) => ({
  id: crypto.randomUUID(),
  name: name.trim(),
  description: description.trim(),
  type,
  category,
  difficulty,
  goal, // for counter/timer types
  color: color || CATEGORIES[category]?.color || CATEGORIES.OTHER.color,
  icon: icon || CATEGORIES[category]?.icon || CATEGORIES.OTHER.icon,
  createdAt: new Date().toISOString(),
  isActive: true
})

// Habit entry for tracking completions
export const createHabitEntry = ({
  habitId,
  date = new Date().toISOString().split('T')[0],
  completed = false,
  value = null,
  notes = ''
}) => ({
  id: crypto.randomUUID(),
  habitId,
  date, // YYYY-MM-DD format
  completed,
  value, // for counter/timer types  
  notes: notes.trim(),
  completedAt: completed ? new Date().toISOString() : null
})