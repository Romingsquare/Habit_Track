'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts'
import { 
  TrendingUp, 
  Trophy, 
  Target,
  Calendar,
  BarChart3,
  Award,
  Flame,
  Clock,
  Users,
  ArrowUp,
  ArrowDown
} from 'lucide-react'
import { useHabitStore } from '@/lib/store/habitStore'
import { CATEGORIES, DIFFICULTY_LEVELS, DIFFICULTY_POINTS } from '@/lib/types'
import { format, subDays, startOfWeek, endOfWeek, eachDayOfInterval } from 'date-fns'

export function AnalyticsView() {
  const [timeRange, setTimeRange] = useState('30') // days
  const [selectedCategory, setSelectedCategory] = useState('all')
  
  const { habits, entries, getHabitStreak } = useHabitStore()

  // Calculate analytics data
  const analyticsData = useMemo(() => {
    const now = new Date()
    const days = parseInt(timeRange)
    const startDate = subDays(now, days)
    
    // Generate date range
    const dateRange = eachDayOfInterval({ start: startDate, end: now })
    
    // Daily completion data
    const dailyData = dateRange.map(date => {
      const dateStr = format(date, 'yyyy-MM-dd')
      const dayEntries = entries.filter(entry => entry.date === dateStr && entry.completed)
      const totalHabits = habits.filter(habit => habit.isActive).length
      
      return {
        date: format(date, 'MMM dd'),
        fullDate: dateStr,
        completed: dayEntries.length,
        total: totalHabits,
        percentage: totalHabits > 0 ? Math.round((dayEntries.length / totalHabits) * 100) : 0,
        points: dayEntries.reduce((sum, entry) => {
          const habit = habits.find(h => h.id === entry.habitId)
          return sum + (habit ? DIFFICULTY_POINTS[habit.difficulty] : 0)
        }, 0)
      }
    })

    // Category performance
    const categoryData = Object.entries(CATEGORIES).map(([key, category]) => {
      const categoryHabits = habits.filter(h => h.category === key && h.isActive)
      const completedEntries = entries.filter(entry => {
        const habit = habits.find(h => h.id === entry.habitId)
        return habit && habit.category === key && entry.completed &&
               entry.date >= format(startDate, 'yyyy-MM-dd')
      })
      
      const totalPossible = categoryHabits.length * days
      const completionRate = totalPossible > 0 ? (completedEntries.length / totalPossible) * 100 : 0
      
      return {
        name: category.name,
        value: Math.round(completionRate),
        count: completedEntries.length,
        color: category.color,
        habits: categoryHabits.length
      }
    }).filter(cat => cat.habits > 0)

    // Streak analysis
    const streakData = habits
      .filter(h => h.isActive)
      .map(habit => {
        const streak = getHabitStreak(habit.id)
        return {
          name: habit.name.length > 20 ? habit.name.substring(0, 20) + '...' : habit.name,
          current: streak.current,
          longest: streak.longest,
          category: CATEGORIES[habit.category]?.name || 'Other'
        }
      })
      .sort((a, b) => b.current - a.current)
      .slice(0, 10)

    // Calculate total stats
    const totalCompletions = entries.filter(entry => 
      entry.completed && entry.date >= format(startDate, 'yyyy-MM-dd')
    ).length
    
    const totalPoints = entries
      .filter(entry => entry.completed && entry.date >= format(startDate, 'yyyy-MM-dd'))
      .reduce((sum, entry) => {
        const habit = habits.find(h => h.id === entry.habitId)
        return sum + (habit ? DIFFICULTY_POINTS[habit.difficulty] : 0)
      }, 0)

    const avgCompletionRate = dailyData.length > 0 ? 
      Math.round(dailyData.reduce((sum, day) => sum + day.percentage, 0) / dailyData.length) : 0

    // Best and worst days
    const bestDay = dailyData.reduce((best, day) => 
      day.percentage > best.percentage ? day : best, dailyData[0] || { percentage: 0 })
    const worstDay = dailyData.reduce((worst, day) => 
      day.percentage < worst.percentage ? day : worst, dailyData[0] || { percentage: 100 })

    return {
      dailyData,
      categoryData,
      streakData,
      totalCompletions,
      totalPoints,
      avgCompletionRate,
      bestDay,
      worstDay
    }
  }, [habits, entries, timeRange])

  // Achievement data
  const achievements = useMemo(() => {
    const activeHabits = habits.filter(h => h.isActive)
    const completedToday = entries.filter(entry => 
      entry.completed && entry.date === format(new Date(), 'yyyy-MM-dd')
    ).length

    const achievements = []

    // Streak achievements
    activeHabits.forEach(habit => {
      const streak = getHabitStreak(habit.id)
      if (streak.current >= 7) achievements.push({ 
        name: `Week Warrior`, 
        description: `7-day streak on ${habit.name}`, 
        icon: '🔥',
        earned: true 
      })
      if (streak.current >= 30) achievements.push({ 
        name: `Month Master`, 
        description: `30-day streak on ${habit.name}`, 
        icon: '🏆',
        earned: true 
      })
    })

    // Completion achievements
    if (completedToday >= 5) achievements.push({ 
      name: `Habit Hero`, 
      description: `Completed 5+ habits today`, 
      icon: '⭐',
      earned: true 
    })
    if (analyticsData.avgCompletionRate >= 80) achievements.push({ 
      name: `Consistency Champion`, 
      description: `80%+ average completion rate`, 
      icon: '🎯',
      earned: true 
    })

    // Add unearned achievements
    if (achievements.length === 0) {
      achievements.push(
        { name: `First Steps`, description: `Complete your first habit`, icon: '🚀', earned: false },
        { name: `Week Warrior`, description: `Maintain a 7-day streak`, icon: '🔥', earned: false },
        { name: `Habit Hero`, description: `Complete 5 habits in one day`, icon: '⭐', earned: false }
      )
    }

    return achievements
  }, [habits, entries, analyticsData])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Analytics Dashboard
          </h1>
          <p className="text-muted-foreground mt-1">
            Insights into your habit-building journey
          </p>
        </div>
        
        <div className="flex gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="90">Last 3 months</SelectItem>
              <SelectItem value="365">Last year</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/10 dark:to-indigo-900/10 border-blue-200 dark:border-blue-800">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-600 rounded-lg">
                <Target className="h-4 w-4 text-white" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Completions</p>
                <p className="text-2xl font-bold text-blue-600">
                  {analyticsData.totalCompletions}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/10 dark:to-emerald-900/10 border-green-200 dark:border-green-800">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-600 rounded-lg">
                <TrendingUp className="h-4 w-4 text-white" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Avg Rate</p>
                <p className="text-2xl font-bold text-green-600">
                  {analyticsData.avgCompletionRate}%
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
                <p className="text-sm text-muted-foreground">Total Points</p>
                <p className="text-2xl font-bold text-orange-600">
                  {analyticsData.totalPoints}
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
                <p className="text-sm text-muted-foreground">Achievements</p>
                <p className="text-2xl font-bold text-purple-600">
                  {achievements.filter(a => a.earned).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Analytics Tabs */}
      <Tabs defaultValue="progress" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="progress">Progress</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="streaks">Streaks</TabsTrigger>
          <TabsTrigger value="achievements">Achievements</TabsTrigger>
        </TabsList>

        {/* Progress Tab */}
        <TabsContent value="progress" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Daily Completion Trend
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={analyticsData.dailyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value, name) => [
                      name === 'percentage' ? `${value}%` : value,
                      name === 'percentage' ? 'Completion Rate' : 'Completed Habits'
                    ]}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="percentage" 
                    stroke="#3B82F6" 
                    fill="url(#colorGradient)" 
                    strokeWidth={2}
                  />
                  <defs>
                    <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">Best Day</span>
                  <ArrowUp className="h-4 w-4 text-green-600" />
                </div>
                <p className="font-semibold">{analyticsData.bestDay?.date}</p>
                <p className="text-2xl font-bold text-green-600">{analyticsData.bestDay?.percentage}%</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">Improvement Day</span>
                  <ArrowDown className="h-4 w-4 text-orange-600" />
                </div>
                <p className="font-semibold">{analyticsData.worstDay?.date}</p>
                <p className="text-2xl font-bold text-orange-600">{analyticsData.worstDay?.percentage}%</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Categories Tab */}
        <TabsContent value="categories" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Category Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={analyticsData.categoryData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      dataKey="value"
                    >
                      {analyticsData.categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => `${value}%`} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Category Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analyticsData.categoryData.map(category => (
                    <div key={category.name} className="flex items-center justify-between p-3 rounded-lg border">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: category.color }}
                        />
                        <div>
                          <p className="font-medium">{category.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {category.habits} habits
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-lg">{category.value}%</p>
                        <p className="text-sm text-muted-foreground">
                          {category.count} completions
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Streaks Tab */}
        <TabsContent value="streaks" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Flame className="h-5 w-5" />
                Current Streaks Leaderboard
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {analyticsData.streakData.length > 0 ? analyticsData.streakData.map((habit, index) => (
                  <div key={habit.name} className="flex items-center justify-between p-3 rounded-lg border">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white ${
                        index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : index === 2 ? 'bg-amber-600' : 'bg-gray-300'
                      }`}>
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium">{habit.name}</p>
                        <p className="text-sm text-muted-foreground">{habit.category}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-2">
                        <Flame className="h-4 w-4 text-orange-500" />
                        <span className="font-bold text-lg">{habit.current}</span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Best: {habit.longest}
                      </p>
                    </div>
                  </div>
                )) : (
                  <div className="text-center py-8 text-muted-foreground">
                    Start completing habits to see your streaks here!
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Achievements Tab */}
        <TabsContent value="achievements" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {achievements.map((achievement, index) => (
              <Card key={index} className={
                achievement.earned 
                  ? "bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/10 dark:to-orange-900/10 border-yellow-200 dark:border-yellow-800" 
                  : "opacity-60 border-dashed"
              }>
                <CardContent className="p-4 text-center">
                  <div className="text-3xl mb-2">{achievement.icon}</div>
                  <h3 className="font-bold mb-1">{achievement.name}</h3>
                  <p className="text-sm text-muted-foreground">{achievement.description}</p>
                  {achievement.earned && (
                    <Badge className="mt-2 bg-yellow-500 text-yellow-50">
                      Earned!
                    </Badge>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}