'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { 
  Plus, 
  Calendar,
  Trophy,
  Flame,
  Target,
  CheckCircle2,
  TrendingUp
} from 'lucide-react'
import { useHabitStore } from '@/lib/store/habitStore'
import { useUIStore } from '@/lib/store/uiStore'
import { HabitCard } from '@/components/habits/HabitCard'
import { CATEGORIES } from '@/lib/types'
import { format } from 'date-fns'

export function TodayView() {
  const { 
    getTodaysHabits, 
    getTotalPoints, 
    getWeeklyProgress 
  } = useHabitStore()
  
  const { setCreateHabitModalOpen } = useUIStore()
  
  const todaysHabits = getTodaysHabits()
  const totalPoints = getTotalPoints()
  const weeklyProgress = getWeeklyProgress()
  
  const completedHabits = todaysHabits.filter(h => h.completed).length
  const totalHabits = todaysHabits.length
  const completionPercentage = totalHabits > 0 ? Math.round((completedHabits / totalHabits) * 100) : 0
  
  const todayProgress = weeklyProgress[new Date().getDay()] || { completed: 0, total: 0, percentage: 0 }

  // Group habits by category for better organization
  const habitsByCategory = todaysHabits.reduce((acc, habit) => {
    if (!acc[habit.category]) {
      acc[habit.category] = []
    }
    acc[habit.category].push(habit)
    return acc
  }, {})

  const getMotivationalMessage = () => {
    if (completionPercentage === 100) return "🎉 Perfect day! You're crushing it!"
    if (completionPercentage >= 80) return "🔥 Amazing progress! Keep it up!"
    if (completionPercentage >= 60) return "💪 You're doing great! Almost there!"
    if (completionPercentage >= 40) return "📈 Good start! Keep going!"
    if (completionPercentage > 0) return "⭐ Every habit counts! You've got this!"
    return "🌅 Ready to start your day? Let's build some great habits!"
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Today's Habits
          </h1>
          <p className="text-muted-foreground mt-1">
            {format(new Date(), 'EEEE, MMMM do, yyyy')}
          </p>
        </div>
        
        <Button 
          onClick={() => setCreateHabitModalOpen(true)}
          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Habit
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/10 dark:to-indigo-900/10 border-blue-200 dark:border-blue-800">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-600 rounded-lg">
                <Target className="h-4 w-4 text-white" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Completed</p>
                <p className="text-2xl font-bold text-blue-600">
                  {completedHabits}/{totalHabits}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/10 dark:to-emerald-900/10 border-green-200 dark:border-green-800">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-600 rounded-lg">
                <CheckCircle2 className="h-4 w-4 text-white" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Progress</p>
                <p className="text-2xl font-bold text-green-600">
                  {completionPercentage}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/10 dark:to-red-900/10 border-orange-200 dark:border-orange-800">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-600 rounded-lg">
                <Flame className="h-4 w-4 text-white" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Points Today</p>
                <p className="text-2xl font-bold text-orange-600">
                  {totalPoints}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/10 dark:to-pink-900/10 border-purple-200 dark:border-purple-800">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-600 rounded-lg">
                <Trophy className="h-4 w-4 text-white" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Active Habits</p>
                <p className="text-2xl font-bold text-purple-600">
                  {totalHabits}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Progress Bar and Motivation */}
      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Today's Progress</h3>
              <Badge 
                variant={completionPercentage === 100 ? "default" : "secondary"}
                className="text-sm"
              >
                {completedHabits} of {totalHabits} completed
              </Badge>
            </div>
            
            <Progress 
              value={completionPercentage} 
              className="h-3"
            />
            
            <p className="text-center text-muted-foreground font-medium">
              {getMotivationalMessage()}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Empty State */}
      {totalHabits === 0 ? (
        <Card className="border-dashed border-2">
          <CardContent className="p-12 text-center">
            <div className="mx-auto w-24 h-24 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/20 dark:to-purple-900/20 rounded-full flex items-center justify-center mb-4">
              <Target className="h-12 w-12 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Start Building Great Habits</h3>
            <p className="text-muted-foreground mb-4 max-w-md mx-auto">
              Create your first habit and start your journey to a better you. Small steps lead to big changes!
            </p>
            <Button 
              onClick={() => setCreateHabitModalOpen(true)}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Habit
            </Button>
          </CardContent>
        </Card>
      ) : (
        /* Habits List */
        <div className="space-y-6">
          {Object.entries(habitsByCategory).map(([categoryKey, habits]) => {
            const category = CATEGORIES[categoryKey] || CATEGORIES.OTHER
              
            return (
              <div key={categoryKey} className="space-y-3">
                <div className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: category.color }}
                  />
                  <h3 className="font-medium text-lg">{category.name}</h3>
                  <Badge variant="secondary" className="text-xs">
                    {habits.filter(h => h.completed).length}/{habits.length}
                  </Badge>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {habits.map(habit => (
                    <HabitCard 
                      key={habit.id} 
                      habit={habit} 
                    />
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Weekly Mini Preview */}
      {totalHabits > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              This Week's Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-7 gap-2">
              {weeklyProgress.map((day, index) => {
                const date = new Date(day.date)
                const isToday = day.date === new Date().toISOString().split('T')[0]
                
                return (
                  <div 
                    key={day.date} 
                    className={`p-3 rounded-lg text-center transition-all ${
                      isToday 
                        ? 'bg-primary text-primary-foreground' 
                        : day.percentage === 100 
                          ? 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300'
                          : day.percentage > 0
                            ? 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-300'
                            : 'bg-gray-100 dark:bg-gray-800'
                    }`}
                  >
                    <div className="text-xs font-medium">
                      {format(date, 'EEE')}
                    </div>
                    <div className="text-lg font-bold">
                      {day.percentage}%
                    </div>
                    <div className="text-xs opacity-75">
                      {day.completed}/{day.total}
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}