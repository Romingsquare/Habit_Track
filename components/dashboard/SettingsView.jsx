'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { 
  Settings,
  Download,
  Upload,
  Trash2,
  RefreshCw,
  Database,
  Palette,
  Bell,
  Shield,
  HelpCircle,
  Plus,
  BookOpen,
  Zap,
  Heart,
  Dumbbell,
  Brain,
  Target,
  Users,
  Coffee,
  Moon,
  Sun,
  Monitor
} from 'lucide-react'
import { useHabitStore } from '@/lib/store/habitStore'
import { useUIStore } from '@/lib/store/uiStore'
import { CATEGORIES, HABIT_TYPES, DIFFICULTY_LEVELS } from '@/lib/types'
import { useTheme } from 'next-themes'
import { toast } from 'sonner'

// Habit Templates
const HABIT_TEMPLATES = [
  // Health Category
  { category: 'HEALTH', name: 'Drink 8 glasses of water', description: 'Stay hydrated throughout the day', type: HABIT_TYPES.COUNTER, goal: 8, difficulty: DIFFICULTY_LEVELS.EASY },
  { category: 'HEALTH', name: 'Take vitamins', description: 'Daily vitamin supplements', type: HABIT_TYPES.BOOLEAN, difficulty: DIFFICULTY_LEVELS.EASY },
  { category: 'HEALTH', name: 'Get 8 hours of sleep', description: 'Proper rest for better health', type: HABIT_TYPES.TIMER, goal: 480, difficulty: DIFFICULTY_LEVELS.MEDIUM },
  { category: 'HEALTH', name: 'Eat 5 servings of fruits/vegetables', description: 'Nutritious diet habit', type: HABIT_TYPES.COUNTER, goal: 5, difficulty: DIFFICULTY_LEVELS.MEDIUM },
  
  // Fitness Category
  { category: 'FITNESS', name: 'Morning workout', description: '30-minute exercise session', type: HABIT_TYPES.TIMER, goal: 30, difficulty: DIFFICULTY_LEVELS.MEDIUM },
  { category: 'FITNESS', name: 'Walk 10,000 steps', description: 'Daily step goal for fitness', type: HABIT_TYPES.COUNTER, goal: 10000, difficulty: DIFFICULTY_LEVELS.MEDIUM },
  { category: 'FITNESS', name: 'Do push-ups', description: 'Strength training exercise', type: HABIT_TYPES.COUNTER, goal: 20, difficulty: DIFFICULTY_LEVELS.HARD },
  { category: 'FITNESS', name: 'Stretch for 10 minutes', description: 'Flexibility and mobility', type: HABIT_TYPES.TIMER, goal: 10, difficulty: DIFFICULTY_LEVELS.EASY },
  
  // Mindfulness Category
  { category: 'MINDFULNESS', name: 'Meditate', description: '10 minutes of mindfulness', type: HABIT_TYPES.TIMER, goal: 10, difficulty: DIFFICULTY_LEVELS.MEDIUM },
  { category: 'MINDFULNESS', name: 'Practice gratitude', description: 'Write 3 things you\'re grateful for', type: HABIT_TYPES.COUNTER, goal: 3, difficulty: DIFFICULTY_LEVELS.EASY },
  { category: 'MINDFULNESS', name: 'Deep breathing exercises', description: '5 minutes of breathing practice', type: HABIT_TYPES.TIMER, goal: 5, difficulty: DIFFICULTY_LEVELS.EASY },
  { category: 'MINDFULNESS', name: 'Journal thoughts', description: 'Daily reflection and journaling', type: HABIT_TYPES.BOOLEAN, difficulty: DIFFICULTY_LEVELS.EASY },
  
  // Productivity Category
  { category: 'PRODUCTIVITY', name: 'Review daily goals', description: 'Plan and prioritize tasks', type: HABIT_TYPES.BOOLEAN, difficulty: DIFFICULTY_LEVELS.EASY },
  { category: 'PRODUCTIVITY', name: 'Clean workspace', description: 'Organize and tidy work area', type: HABIT_TYPES.BOOLEAN, difficulty: DIFFICULTY_LEVELS.EASY },
  { category: 'PRODUCTIVITY', name: 'No social media for 2 hours', description: 'Focus time without distractions', type: HABIT_TYPES.TIMER, goal: 120, difficulty: DIFFICULTY_LEVELS.HARD },
  { category: 'PRODUCTIVITY', name: 'Complete priority task', description: 'Focus on most important work', type: HABIT_TYPES.BOOLEAN, difficulty: DIFFICULTY_LEVELS.MEDIUM },
  
  // Learning Category
  { category: 'LEARNING', name: 'Read for 30 minutes', description: 'Daily reading habit', type: HABIT_TYPES.TIMER, goal: 30, difficulty: DIFFICULTY_LEVELS.MEDIUM },
  { category: 'LEARNING', name: 'Learn new words', description: 'Expand vocabulary', type: HABIT_TYPES.COUNTER, goal: 5, difficulty: DIFFICULTY_LEVELS.EASY },
  { category: 'LEARNING', name: 'Practice a skill', description: 'Deliberate practice session', type: HABIT_TYPES.TIMER, goal: 25, difficulty: DIFFICULTY_LEVELS.MEDIUM },
  { category: 'LEARNING', name: 'Watch educational content', description: 'Learn something new', type: HABIT_TYPES.TIMER, goal: 20, difficulty: DIFFICULTY_LEVELS.EASY },
  
  // Social Category
  { category: 'SOCIAL', name: 'Call family/friends', description: 'Connect with loved ones', type: HABIT_TYPES.BOOLEAN, difficulty: DIFFICULTY_LEVELS.EASY },
  { category: 'SOCIAL', name: 'Compliment someone', description: 'Spread positivity', type: HABIT_TYPES.BOOLEAN, difficulty: DIFFICULTY_LEVELS.EASY },
  { category: 'SOCIAL', name: 'Help someone', description: 'Acts of kindness', type: HABIT_TYPES.BOOLEAN, difficulty: DIFFICULTY_LEVELS.MEDIUM },
  
  // Other Category
  { category: 'OTHER', name: 'Make bed', description: 'Start day with accomplishment', type: HABIT_TYPES.BOOLEAN, difficulty: DIFFICULTY_LEVELS.EASY },
  { category: 'OTHER', name: 'Limit coffee intake', description: 'Healthy caffeine consumption', type: HABIT_TYPES.COUNTER, goal: 2, difficulty: DIFFICULTY_LEVELS.MEDIUM },
  { category: 'OTHER', name: 'Evening routine', description: 'Consistent bedtime preparation', type: HABIT_TYPES.BOOLEAN, difficulty: DIFFICULTY_LEVELS.EASY },
]

export function SettingsView() {
  const [selectedTemplate, setSelectedTemplate] = useState(null)
  const [templateDialogOpen, setTemplateDialogOpen] = useState(false)
  const [exportDialogOpen, setExportDialogOpen] = useState(false)
  const [importDialogOpen, setImportDialogOpen] = useState(false)
  const [importData, setImportData] = useState('')
  
  const { habits, entries, addHabit, clearAllData } = useHabitStore()
  const { theme, setTheme } = useTheme()
  
  // Get data statistics
  const stats = {
    totalHabits: habits.length,
    activeHabits: habits.filter(h => h.isActive).length,
    totalEntries: entries.length,
    completedEntries: entries.filter(e => e.completed).length,
    dataSize: JSON.stringify({ habits, entries }).length
  }

  // Export data functionality
  const handleExportData = (format) => {
    try {
      const data = { habits, entries, exportDate: new Date().toISOString() }
      
      if (format === 'json') {
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `habit-tracker-backup-${new Date().toISOString().split('T')[0]}.json`
        a.click()
        URL.revokeObjectURL(url)
      } else if (format === 'csv') {
        // Export habit entries as CSV
        const csvHeader = 'Date,Habit Name,Category,Completed,Notes\n'
        const csvRows = entries.map(entry => {
          const habit = habits.find(h => h.id === entry.habitId)
          return `${entry.date},"${habit?.name || 'Unknown'}","${habit?.category || 'Unknown'}",${entry.completed ? 'Yes' : 'No'},"${entry.notes || ''}"`
        })
        const csvContent = csvHeader + csvRows.join('\n')
        
        const blob = new Blob([csvContent], { type: 'text/csv' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `habit-tracker-entries-${new Date().toISOString().split('T')[0]}.csv`
        a.click()
        URL.revokeObjectURL(url)
      }
      
      toast.success(`Data exported successfully as ${format.toUpperCase()}`)
      setExportDialogOpen(false)
    } catch (error) {
      toast.error('Failed to export data')
    }
  }

  // Import data functionality
  const handleImportData = () => {
    try {
      const data = JSON.parse(importData)
      
      if (data.habits && Array.isArray(data.habits)) {
        // Import habits (create new IDs to avoid conflicts)
        data.habits.forEach(habit => {
          addHabit({
            name: habit.name + ' (Imported)',
            description: habit.description,
            category: habit.category,
            type: habit.type,
            difficulty: habit.difficulty,
            goal: habit.goal
          })
        })
        
        toast.success(`Imported ${data.habits.length} habits successfully`)
        setImportDialogOpen(false)
        setImportData('')
      } else {
        toast.error('Invalid data format')
      }
    } catch (error) {
      toast.error('Failed to parse import data')
    }
  }

  // Add habit from template
  const handleAddTemplate = (template) => {
    addHabit(template)
    toast.success(`Added "${template.name}" to your habits`)
    setTemplateDialogOpen(false)
  }

  // Clear all data
  const handleClearData = () => {
    clearAllData()
    toast.success('All data cleared successfully')
  }

  // Group templates by category
  const templatesByCategory = HABIT_TEMPLATES.reduce((acc, template) => {
    if (!acc[template.category]) {
      acc[template.category] = []
    }
    acc[template.category].push(template)
    return acc
  }, {})

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Settings
        </h1>
        <p className="text-muted-foreground mt-1">
          Customize your habit tracking experience
        </p>
      </div>

      {/* Settings Tabs */}
      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="data">Data</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="about">About</TabsTrigger>
        </TabsList>

        {/* General Settings */}
        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5" />
                Appearance
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="theme">Theme</Label>
                  <p className="text-sm text-muted-foreground">
                    Choose your preferred color theme
                  </p>
                </div>
                <Select value={theme} onValueChange={setTheme}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">
                      <div className="flex items-center gap-2">
                        <Sun className="h-4 w-4" />
                        Light
                      </div>
                    </SelectItem>
                    <SelectItem value="dark">
                      <div className="flex items-center gap-2">
                        <Moon className="h-4 w-4" />
                        Dark
                      </div>
                    </SelectItem>
                    <SelectItem value="system">
                      <div className="flex items-center gap-2">
                        <Monitor className="h-4 w-4" />
                        System
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notifications
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="notifications">Daily Reminders</Label>
                  <p className="text-sm text-muted-foreground">
                    Get reminded to complete your habits
                  </p>
                </div>
                <Switch id="notifications" />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="achievements">Achievement Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Celebrate milestones and streaks
                  </p>
                </div>
                <Switch id="achievements" defaultChecked />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Preferences
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Start Week On</Label>
                  <p className="text-sm text-muted-foreground">
                    First day of the week in calendar
                  </p>
                </div>
                <Select defaultValue="sunday">
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sunday">Sunday</SelectItem>
                    <SelectItem value="monday">Monday</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label>Default Difficulty</Label>
                  <p className="text-sm text-muted-foreground">
                    Default difficulty for new habits
                  </p>
                </div>
                <Select defaultValue="easy">
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="easy">Easy</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="hard">Hard</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Data Management */}
        <TabsContent value="data" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Data Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{stats.totalHabits}</div>
                  <div className="text-sm text-muted-foreground">Total Habits</div>
                </div>
                <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{stats.activeHabits}</div>
                  <div className="text-sm text-muted-foreground">Active Habits</div>
                </div>
                <div className="text-center p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">{stats.totalEntries}</div>
                  <div className="text-sm text-muted-foreground">Total Entries</div>
                </div>
                <div className="text-center p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                  <div className="text-2xl font-bold text-orange-600">
                    {Math.round(stats.dataSize / 1024)}KB
                  </div>
                  <div className="text-sm text-muted-foreground">Data Size</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Download className="h-5 w-5" />
                Export Data
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Download your habit data for backup or transfer to another device
              </p>
              
              <Dialog open={exportDialogOpen} onOpenChange={setExportDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="w-full sm:w-auto">
                    <Download className="h-4 w-4 mr-2" />
                    Export Data
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Export Your Data</DialogTitle>
                    <DialogDescription>
                      Choose the format for your data export
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <Button 
                      onClick={() => handleExportData('json')}
                      className="w-full"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Export as JSON (Complete Backup)
                    </Button>
                    <Button 
                      onClick={() => handleExportData('csv')}
                      variant="outline"
                      className="w-full"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Export as CSV (Entries Only)
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Import Data
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Import habits from a JSON backup file
              </p>
              
              <Dialog open={importDialogOpen} onOpenChange={setImportDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="w-full sm:w-auto">
                    <Upload className="h-4 w-4 mr-2" />
                    Import Data
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Import Data</DialogTitle>
                    <DialogDescription>
                      Paste your exported JSON data below
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <Textarea
                      value={importData}
                      onChange={(e) => setImportData(e.target.value)}
                      placeholder="Paste your JSON data here..."
                      rows={10}
                    />
                    <div className="flex gap-2">
                      <Button 
                        onClick={handleImportData}
                        disabled={!importData.trim()}
                        className="flex-1"
                      >
                        Import Habits
                      </Button>
                      <Button 
                        variant="outline"
                        onClick={() => setImportDialogOpen(false)}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-600">
                <Trash2 className="h-5 w-5" />
                Danger Zone
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Permanently delete all your data. This action cannot be undone.
              </p>
              
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" className="w-full sm:w-auto">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Clear All Data
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will permanently delete all your habits, entries, and progress data.
                      This action cannot be undone. Consider exporting your data first.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleClearData}>
                      Yes, delete everything
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Habit Templates */}
        <TabsContent value="templates" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Habit Templates Library
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Quick-start your habit journey with pre-made habit templates
              </p>
              
              <div className="space-y-6">
                {Object.entries(templatesByCategory).map(([categoryKey, templates]) => {
                  const category = CATEGORIES[categoryKey]
                  return (
                    <div key={categoryKey}>
                      <div className="flex items-center gap-2 mb-3">
                        <div 
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: category.color }}
                        />
                        <h3 className="font-semibold">{category.name}</h3>
                        <Badge variant="secondary">{templates.length}</Badge>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {templates.map((template, index) => (
                          <Card key={index} className="cursor-pointer hover:shadow-md transition-shadow">
                            <CardContent className="p-4">
                              <div className="flex justify-between items-start mb-2">
                                <h4 className="font-medium text-sm">{template.name}</h4>
                                <Button
                                  size="sm"
                                  onClick={() => handleAddTemplate(template)}
                                  className="h-6 px-2 text-xs"
                                >
                                  <Plus className="h-3 w-3 mr-1" />
                                  Add
                                </Button>
                              </div>
                              <p className="text-xs text-muted-foreground mb-2">
                                {template.description}
                              </p>
                              <div className="flex items-center gap-2">
                                <Badge variant="outline" className="text-xs">
                                  {template.type}
                                </Badge>
                                <Badge 
                                  variant="outline" 
                                  className={`text-xs ${
                                    template.difficulty === 'easy' ? 'border-green-300 text-green-700' :
                                    template.difficulty === 'medium' ? 'border-yellow-300 text-yellow-700' :
                                    'border-red-300 text-red-700'
                                  }`}
                                >
                                  {template.difficulty}
                                </Badge>
                                {template.goal && (
                                  <Badge variant="secondary" className="text-xs">
                                    Goal: {template.goal}
                                  </Badge>
                                )}
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* About */}
        <TabsContent value="about" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <HelpCircle className="h-5 w-5" />
                About HabitFlow
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <span className="text-white font-bold text-xl">H</span>
                </div>
                <h3 className="text-xl font-bold mb-2">HabitFlow v1.0</h3>
                <p className="text-muted-foreground">
                  Your personal habit tracking companion
                </p>
              </div>

              <div className="space-y-4 text-sm">
                <div>
                  <h4 className="font-medium mb-2">Features</h4>
                  <ul className="space-y-1 text-muted-foreground">
                    <li>• Track multiple habit types (boolean, counter, timer)</li>
                    <li>• Visual progress tracking and analytics</li>
                    <li>• Streak calculations and achievements</li>
                    <li>• Calendar heatmap visualization</li>
                    <li>• Data export and import</li>
                    <li>• Dark/light theme support</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Technology</h4>
                  <ul className="space-y-1 text-muted-foreground">
                    <li>• Built with Next.js 14 and React</li>
                    <li>• Styled with Tailwind CSS and shadcn/ui</li>
                    <li>• State management with Zustand</li>
                    <li>• Local storage for data persistence</li>
                    <li>• Charts powered by Recharts</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Privacy</h4>
                  <p className="text-muted-foreground">
                    All your habit data is stored locally on your device. 
                    No data is sent to external servers, ensuring complete privacy and security.
                  </p>
                </div>
              </div>

              <div className="pt-4 border-t">
                <div className="flex justify-center space-x-4 text-sm text-muted-foreground">
                  <span>Made with ❤️ for habit builders</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}