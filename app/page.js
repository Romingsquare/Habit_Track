'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { 
  Sun, 
  Moon, 
  Monitor,
  Menu,
  X,
  Settings,
  BarChart3,
  Calendar,
  Home
} from 'lucide-react'
import { useTheme } from 'next-themes'
import { TodayView } from '@/components/dashboard/TodayView'
import { AnalyticsView } from '@/components/dashboard/AnalyticsView'
import { CalendarView } from '@/components/dashboard/CalendarView'
import { SettingsView } from '@/components/dashboard/SettingsView'
import { CreateHabitModal } from '@/components/habits/CreateHabitModal'
import { useUIStore } from '@/lib/store/uiStore'
import { cn } from '@/lib/utils'

export default function HabitTrackerApp() {
  const { theme, setTheme } = useTheme()
  const { 
    sidebarOpen, 
    setSidebarOpen,
    currentView,
    setCurrentView
  } = useUIStore()
  
  const [mounted, setMounted] = useState(false)

  // Handle hydration
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  const navigation = [
    { 
      name: 'Today', 
      icon: Home, 
      id: 'today',
      description: "Today's habits and progress" 
    },
    { 
      name: 'Calendar', 
      icon: Calendar, 
      id: 'calendar',
      description: 'View habit history and trends' 
    },
    { 
      name: 'Analytics', 
      icon: BarChart3, 
      id: 'analytics',
      description: 'Insights and statistics' 
    },
    { 
      name: 'Settings', 
      icon: Settings, 
      id: 'settings',
      description: 'App preferences and data' 
    }
  ]

  const renderCurrentView = () => {
    switch (currentView) {
      case 'today':
        return <TodayView />
      case 'calendar':
        return <CalendarView />
      case 'analytics':
        return <AnalyticsView />
      case 'settings':
        return <SettingsView />
      default:
        return <TodayView />
    }
  }

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <div className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 bg-card border-r border-border transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0",
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex flex-col h-full">
          {/* Logo/Header */}
          <div className="flex items-center justify-between p-4 border-b border-border">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">H</span>
              </div>
              <span className="font-bold text-lg bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                HabitFlow
              </span>
            </div>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4">
            <div className="space-y-2">
              {navigation.map((item) => (
                <Button
                  key={item.id}
                  variant={currentView === item.id ? "default" : "ghost"}
                  className={cn(
                    "w-full justify-start gap-3 h-12",
                    currentView === item.id 
                      ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white" 
                      : "hover:bg-accent"
                  )}
                  onClick={() => {
                    setCurrentView(item.id)
                    setSidebarOpen(false)
                  }}
                >
                  <item.icon className="h-5 w-5" />
                  <div className="text-left">
                    <div className="font-medium">{item.name}</div>
                  </div>
                </Button>
              ))}
            </div>
          </nav>

          {/* Theme Switcher */}
          <div className="p-4 border-t border-border">
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            >
              {theme === 'dark' ? (
                <>
                  <Sun className="h-4 w-4 mr-2" />
                  Light Mode
                </>
              ) : (
                <>
                  <Moon className="h-4 w-4 mr-2" />
                  Dark Mode
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="bg-card border-b border-border p-4 lg:hidden">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </Button>
            
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-gradient-to-r from-blue-600 to-purple-600 rounded-md flex items-center justify-center">
                <span className="text-white font-bold text-xs">H</span>
              </div>
              <span className="font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                HabitFlow
              </span>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="container mx-auto p-6 max-w-7xl">
            {renderCurrentView()}
          </div>
        </main>
      </div>

      {/* Modals */}
      <CreateHabitModal />
    </div>
  )
}

// All views are now implemented - removed ComingSoonView