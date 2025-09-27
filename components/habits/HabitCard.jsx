'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  CheckCircle2, 
  Circle, 
  Edit3, 
  Flame,
  Target,
  Clock,
  Hash
} from 'lucide-react'
import { useHabitStore } from '@/lib/store/habitStore'
import { useUIStore } from '@/lib/store/uiStore'
import { CATEGORIES, HABIT_TYPES, DIFFICULTY_LEVELS } from '@/lib/types'
import { cn } from '@/lib/utils'

export function HabitCard({ habit, className }) {
  const [isAnimating, setIsAnimating] = useState(false)
  const { toggleHabitCompletion, getHabitStreak } = useHabitStore()
  const { setEditingHabit } = useUIStore()
  
  const streak = getHabitStreak(habit.id)
  const category = CATEGORIES[habit.category] || CATEGORIES.OTHER

  const handleToggleComplete = () => {
    setIsAnimating(true)
    toggleHabitCompletion(habit.id)
    setTimeout(() => setIsAnimating(false), 300)
  }

  const getHabitTypeIcon = () => {
    switch (habit.type) {
      case HABIT_TYPES.COUNTER:
        return <Hash className="h-3 w-3" />
      case HABIT_TYPES.TIMER:
        return <Clock className="h-3 w-3" />
      default:
        return <Target className="h-3 w-3" />
    }
  }

  const getDifficultyColor = () => {
    switch (habit.difficulty) {
      case DIFFICULTY_LEVELS.EASY:
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300'
      case DIFFICULTY_LEVELS.MEDIUM:
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300'
      case DIFFICULTY_LEVELS.HARD:
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300'
    }
  }

  return (
    <Card 
      className={cn(
        "group transition-all duration-300 hover:shadow-lg border-2",
        habit.completed 
          ? "bg-gradient-to-r from-green-50 to-emerald-50 border-green-200 dark:from-green-900/10 dark:to-emerald-900/10 dark:border-green-800" 
          : "hover:border-primary/20",
        isAnimating && "scale-105 shadow-xl",
        className
      )}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3 flex-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleToggleComplete}
              className={cn(
                "p-0 h-8 w-8 rounded-full transition-all duration-300",
                habit.completed
                  ? "text-green-600 hover:text-green-700"
                  : "text-gray-400 hover:text-primary"
              )}
            >
              {habit.completed ? (
                <CheckCircle2 className="h-6 w-6" />
              ) : (
                <Circle className="h-6 w-6" />
              )}
            </Button>
            
            <div className="flex-1">
              <h3 className={cn(
                "font-semibold text-sm transition-all duration-200",
                habit.completed ? "text-green-700 dark:text-green-400" : "text-foreground"
              )}>
                {habit.name}
              </h3>
              {habit.description && (
                <p className="text-xs text-muted-foreground mt-1">
                  {habit.description}
                </p>
              )}
            </div>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setEditingHabit(habit)}
            className="opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 p-0"
          >
            <Edit3 className="h-3 w-3" />
          </Button>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge 
              variant="secondary" 
              className={cn("text-xs", getDifficultyColor())}
            >
              {getHabitTypeIcon()}
              <span className="ml-1 capitalize">{habit.difficulty}</span>
            </Badge>
            
            <Badge 
              variant="outline" 
              className="text-xs"
              style={{ 
                borderColor: category.color,
                color: category.color 
              }}
            >
              {category.name}
            </Badge>
          </div>

          {streak.current > 0 && (
            <div className="flex items-center gap-1 text-orange-600">
              <Flame className="h-3 w-3" />
              <span className="text-xs font-medium">{streak.current}</span>
            </div>
          )}
        </div>

        {habit.goal && (
          <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-800">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Goal: {habit.goal}{habit.type === HABIT_TYPES.TIMER ? ' min' : ''}</span>
              {habit.entry?.value && (
                <span className="text-green-600 font-medium">
                  {habit.entry.value}/{habit.goal}
                </span>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}