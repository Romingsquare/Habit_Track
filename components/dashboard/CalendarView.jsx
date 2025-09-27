'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { 
  ChevronLeft, 
  ChevronRight,
  Calendar as CalendarIcon,
  TrendingUp,
  CheckCircle2,
  Circle,
  Flame
} from 'lucide-react'
import { useHabitStore } from '@/lib/store/habitStore'
import { CATEGORIES } from '@/lib/types'
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval, 
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
  getDay,
  startOfWeek,
  endOfWeek
} from 'date-fns'

export function CalendarView() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState(null)
  const [detailsOpen, setDetailsOpen] = useState(false)
  
  const { habits, entries, toggleHabitCompletion, getHabitStreak } = useHabitStore()

  // Calculate calendar data
  const calendarData = useMemo(() => {
    const monthStart = startOfMonth(currentDate)
    const monthEnd = endOfMonth(currentDate)
    
    // Get calendar grid (including days from previous/next month to fill weeks)
    const calendarStart = startOfWeek(monthStart)
    const calendarEnd = endOfWeek(monthEnd)
    
    const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd })
    
    return days.map(day => {
      const dayStr = format(day, 'yyyy-MM-dd')
      const dayEntries = entries.filter(entry => entry.date === dayStr)
      const completedEntries = dayEntries.filter(entry => entry.completed)
      const activeHabitsCount = habits.filter(habit => habit.isActive).length
      
      // Calculate completion intensity (0-4 scale for heatmap)
      const completionRate = activeHabitsCount > 0 ? completedEntries.length / activeHabitsCount : 0
      let intensity = 0
      if (completionRate > 0) intensity = 1
      if (completionRate >= 0.25) intensity = 2
      if (completionRate >= 0.5) intensity = 3
      if (completionRate >= 0.75) intensity = 4
      if (completionRate === 1) intensity = 5
      
      return {
        date: day,
        dateStr: dayStr,
        isCurrentMonth: isSameMonth(day, currentDate),
        isToday: isSameDay(day, new Date()),
        completedCount: completedEntries.length,
        totalCount: activeHabitsCount,
        completionRate: Math.round(completionRate * 100),
        intensity,
        entries: dayEntries,
        habits: habits.filter(habit => habit.isActive)
      }
    })
  }, [currentDate, habits, entries])

  // Get selected day details
  const selectedDayData = useMemo(() => {
    if (!selectedDate) return null
    
    const dayStr = format(selectedDate, 'yyyy-MM-dd')
    const dayEntries = entries.filter(entry => entry.date === dayStr)
    const activeHabits = habits.filter(habit => habit.isActive)
    
    return {
      date: selectedDate,
      dateStr: dayStr,
      habits: activeHabits.map(habit => {
        const entry = dayEntries.find(e => e.habitId === habit.id)
        const streak = getHabitStreak(habit.id)
        return {
          ...habit,
          completed: entry?.completed || false,
          entry,
          streak: streak.current
        }
      })
    }
  }, [selectedDate, habits, entries, getHabitStreak])

  // Monthly stats
  const monthStats = useMemo(() => {
    const monthDays = calendarData.filter(day => day.isCurrentMonth)
    const totalCompletions = monthDays.reduce((sum, day) => sum + day.completedCount, 0)
    const totalPossible = monthDays.reduce((sum, day) => sum + day.totalCount, 0)
    const avgCompletionRate = totalPossible > 0 ? Math.round((totalCompletions / totalPossible) * 100) : 0
    
    const perfectDays = monthDays.filter(day => day.completionRate === 100).length
    const activeDays = monthDays.filter(day => day.completedCount > 0).length
    const bestDay = monthDays.reduce((best, day) => 
      day.completionRate > best.completionRate ? day : best, 
      { completionRate: 0 }
    )
    
    return {
      totalCompletions,
      avgCompletionRate,
      perfectDays,
      activeDays,
      bestDay,
      totalDays: monthDays.length
    }
  }, [calendarData])

  const handleDayClick = (day) => {
    setSelectedDate(day.date)
    setDetailsOpen(true)
  }

  const handleHabitToggle = (habitId) => {
    if (selectedDayData) {
      toggleHabitCompletion(habitId, selectedDayData.dateStr)
    }
  }

  const getIntensityColor = (intensity) => {
    const colors = {
      0: 'bg-gray-100 dark:bg-gray-800',
      1: 'bg-green-100 dark:bg-green-900/20',
      2: 'bg-green-200 dark:bg-green-800/40',
      3: 'bg-green-300 dark:bg-green-700/60',
      4: 'bg-green-400 dark:bg-green-600/80',
      5: 'bg-green-500 dark:bg-green-500'
    }
    return colors[intensity] || colors[0]
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Habit Calendar
          </h1>
          <p className="text-muted-foreground mt-1">
            Visual history of your habit-building journey
          </p>
        </div>
      </div>

      {/* Month Navigation & Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <CalendarIcon className="h-5 w-5" />
                {format(currentDate, 'MMMM yyyy')}
              </CardTitle>
              <div className="flex gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentDate(subMonths(currentDate, 1))}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentDate(new Date())}
                >
                  Today
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentDate(addMonths(currentDate, 1))}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {/* Calendar Grid */}
            <div className="space-y-4">
              {/* Weekday headers */}
              <div className="grid grid-cols-7 gap-1 mb-2">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                  <div key={day} className="text-center text-sm font-medium text-muted-foreground p-2">
                    {day}
                  </div>
                ))}
              </div>
              
              {/* Calendar days */}
              <div className="grid grid-cols-7 gap-1">
                {calendarData.map((day, index) => (
                  <button
                    key={index}
                    onClick={() => handleDayClick(day)}
                    className={`
                      relative p-2 rounded-lg text-sm font-medium transition-all duration-200 hover:scale-105 hover:shadow-md
                      ${day.isCurrentMonth ? 'text-foreground' : 'text-muted-foreground opacity-50'}
                      ${day.isToday ? 'ring-2 ring-blue-500 ring-offset-1' : ''}
                      ${getIntensityColor(day.intensity)}
                    `}
                  >
                    <div className="text-center">
                      {format(day.date, 'd')}
                    </div>
                    
                    {/* Completion indicator */}
                    {day.completedCount > 0 && (
                      <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-600 text-white text-xs rounded-full flex items-center justify-center">
                        {day.completedCount}
                      </div>
                    )}
                    
                    {/* Perfect day indicator */}
                    {day.completionRate === 100 && day.totalCount > 0 && (
                      <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2">
                        ⭐
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Legend */}
            <div className="mt-6 flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                Less
                <div className="flex gap-1">
                  {[0, 1, 2, 3, 4, 5].map(intensity => (
                    <div 
                      key={intensity}
                      className={`w-3 h-3 rounded ${getIntensityColor(intensity)}`}
                    />
                  ))}
                </div>
                More
              </div>
              
              <div className="text-sm text-muted-foreground">
                Click any day to see details
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Monthly Statistics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Monthly Stats
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Avg. Completion</span>
                <span className="font-bold text-lg">{monthStats.avgCompletionRate}%</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Perfect Days</span>
                <span className="font-bold text-lg text-green-600">{monthStats.perfectDays}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Active Days</span>
                <span className="font-bold text-lg text-blue-600">{monthStats.activeDays}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Total Completions</span>
                <span className="font-bold text-lg text-purple-600">{monthStats.totalCompletions}</span>
              </div>
            </div>

            {monthStats.bestDay.completionRate > 0 && (
              <div className="pt-4 border-t">
                <h4 className="font-medium mb-2">Best Day</h4>
                <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">
                      {format(monthStats.bestDay.date, 'MMM d')}
                    </span>
                    <span className="text-green-600 font-bold">
                      {monthStats.bestDay.completionRate}%
                    </span>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {monthStats.bestDay.completedCount} of {monthStats.bestDay.totalCount} habits
                  </div>
                </div>
              </div>
            )}

            <div className="pt-4 border-t">
              <h4 className="font-medium mb-2">Quick Insights</h4>
              <div className="text-sm space-y-1">
                {monthStats.perfectDays > 0 && (
                  <p className="text-green-600">🎯 {monthStats.perfectDays} perfect days this month!</p>
                )}
                {monthStats.activeDays === monthStats.totalDays && (
                  <p className="text-blue-600">🔥 Active every day this month!</p>
                )}
                {monthStats.avgCompletionRate >= 80 && (
                  <p className="text-purple-600">⭐ Excellent consistency this month!</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Day Details Modal */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {selectedDayData && format(selectedDayData.date, 'EEEE, MMMM do, yyyy')}
            </DialogTitle>
          </DialogHeader>
          
          {selectedDayData && (
            <div className="space-y-4">
              {/* Daily Stats */}
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">
                    {selectedDayData.habits.filter(h => h.completed).length}
                  </div>
                  <div className="text-sm text-muted-foreground">Completed</div>
                </div>
                <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="text-2xl font-bold">
                    {selectedDayData.habits.length}
                  </div>
                  <div className="text-sm text-muted-foreground">Total Habits</div>
                </div>
              </div>

              {/* Habits List */}
              <div className="space-y-2">
                <h4 className="font-medium">Habits</h4>
                {selectedDayData.habits.length > 0 ? (
                  selectedDayData.habits.map(habit => {
                    const category = CATEGORIES[habit.category] || CATEGORIES.OTHER
                    return (
                      <div 
                        key={habit.id}
                        className="flex items-center justify-between p-3 border rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleHabitToggle(habit.id)}
                            className="p-0 h-6 w-6"
                          >
                            {habit.completed ? (
                              <CheckCircle2 className="h-5 w-5 text-green-600" />
                            ) : (
                              <Circle className="h-5 w-5 text-gray-400" />
                            )}
                          </Button>
                          
                          <div>
                            <p className={`font-medium text-sm ${
                              habit.completed ? 'text-green-700 dark:text-green-400' : ''
                            }`}>
                              {habit.name}
                            </p>
                            <div className="flex items-center gap-2">
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
                              {habit.streak > 0 && (
                                <div className="flex items-center gap-1 text-orange-600">
                                  <Flame className="h-3 w-3" />
                                  <span className="text-xs">{habit.streak}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })
                ) : (
                  <div className="text-center py-4 text-muted-foreground text-sm">
                    No active habits for this day
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}